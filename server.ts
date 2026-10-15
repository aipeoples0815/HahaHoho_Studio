import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import AdmZip from 'adm-zip';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

// Ensure active paid key from .dev.env.json is loaded if process.env has placeholder
try {
  const devEnvPath = path.join('/app', '.dev.env.json');
  if (fs.existsSync(devEnvPath)) {
    const devEnv = JSON.parse(fs.readFileSync(devEnvPath, 'utf-8'));
    if (devEnv.GEMINI_API_KEY && (!process.env.GEMINI_API_KEY || !process.env.GEMINI_API_KEY.startsWith('A'))) {
      process.env.GEMINI_API_KEY = devEnv.GEMINI_API_KEY;
    }
  }
} catch (_e) {}

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Support large image payloads for photo uploads & high-res generation
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Active runtime API Key (can be dynamically replaced by operator in modal)
let runtimeApiKey: string | null = process.env.GEMINI_API_KEY || null;
let aiClient: GoogleGenAI | null = null;
let lastUsedKey: string | null = null;

function getAI(): GoogleGenAI {
  const currentKey = (runtimeApiKey || process.env.GEMINI_API_KEY || '').trim();
  if (!currentKey) {
    throw new Error('GEMINI_API_KEY가 설정되지 않았습니다. 상단 [🔑 새 API 키 연결]에서 API 키를 등록해 주세요.');
  }
  if (!aiClient || lastUsedKey !== currentKey) {
    lastUsedKey = currentKey;
    aiClient = new GoogleGenAI({
      apiKey: currentKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// In-memory counter for today's customer count & backup session log
let todaySessionCount = 0;
const savedFilenamesSet = new Set<string>();

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    todayCount: todaySessionCount,
    hasApiKey: Boolean(runtimeApiKey || process.env.GEMINI_API_KEY),
  });
});

// API Key status check
app.get('/api/api-key-status', (_req, res) => {
  const currentKey = runtimeApiKey || process.env.GEMINI_API_KEY || '';
  if (!currentKey) {
    return res.json({ isConfigured: false, maskedKey: '미설정' });
  }
  const prefix = currentKey.slice(0, 8);
  const suffix = currentKey.slice(-4);
  return res.json({
    isConfigured: true,
    maskedKey: `${prefix}...${suffix}`,
    isRuntimeOverridden: Boolean(runtimeApiKey && runtimeApiKey !== process.env.GEMINI_API_KEY),
  });
});

// Update runtime API key from Operator Modal with immediate validation
app.post('/api/update-api-key', async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 15) {
      return res.status(400).json({ error: '올바른 Gemini API 키를 입력해 주세요. (예: AIzaSy... 또는 AQ.Ab8...)' });
    }

    const trimmedKey = apiKey.trim();
    let pingSuccess = false;
    let pingNote = '';

    // Verify key validity with gemini-3.8-flash
    try {
      const testClient = new GoogleGenAI({
        apiKey: trimmedKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      await testClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: 'Ping test',
      });
      pingSuccess = true;
      aiClient = testClient;
    } catch (testErr: any) {
      console.warn('API key ping check warning:', testErr?.message || testErr);
      pingNote = testErr?.message || String(testErr);

      if (trimmedKey.startsWith('AIzaSy') || trimmedKey.startsWith('AQ.') || trimmedKey.length >= 35) {
        aiClient = new GoogleGenAI({
          apiKey: trimmedKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });
      } else {
        return res.status(400).json({
          error: '입력하신 API 키 검증에 실패했습니다. 키를 다시 확인해 주세요.',
          details: pingNote,
        });
      }
    }

    // Update active runtime instance
    runtimeApiKey = trimmedKey;
    process.env.GEMINI_API_KEY = trimmedKey;

    // Persist to local .env file
    try {
      const envPath = path.join(process.cwd(), '.env');
      let envContent = '';
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf-8');
      }
      if (envContent.includes('GEMINI_API_KEY=')) {
        envContent = envContent.replace(/GEMINI_API_KEY=.*/, `GEMINI_API_KEY="${trimmedKey}"`);
      } else {
        envContent += `\nGEMINI_API_KEY="${trimmedKey}"\n`;
      }
      fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf-8');
    } catch (saveErr) {
      console.warn('Could not write .env file, continuing with runtime key:', saveErr);
    }

    return res.json({
      success: true,
      maskedKey: `${trimmedKey.slice(0, 8)}...${trimmedKey.slice(-4)}`,
      message: pingSuccess
        ? '새 Gemini API 키가 정상 검증되었으며 즉시 활성화되었습니다!'
        : '새 Gemini API 키가 활성화되었습니다. (현상 시 바로 사용됩니다)',
    });
  } catch (err: any) {
    console.error('API Key update failed:', err);
    return res.status(400).json({
      error: '입력하신 API 키 검증에 실패했습니다. 키를 다시 확인해 주세요.',
      details: err?.message || String(err),
    });
  }
});

// Full Project Source Code ZIP Download endpoint
app.get('/api/download-zip', (_req, res) => {
  try {
    const zip = new AdmZip();
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const filename = `HahaHoho_Studio_AI_Team_v2.0_${dateStr}.zip`;

    const rootDir = process.cwd();

    // Include src directory recursively
    const srcDir = path.join(rootDir, 'src');
    if (fs.existsSync(srcDir)) {
      zip.addLocalFolder(srcDir, 'src');
    }

    // Include config directory
    const configDir = path.join(rootDir, 'config');
    if (fs.existsSync(configDir)) {
      zip.addLocalFolder(configDir, 'config');
    }

    // Include assets directory
    const assetsDir = path.join(rootDir, 'assets');
    if (fs.existsSync(assetsDir)) {
      zip.addLocalFolder(assetsDir, 'assets');
    }

    const rootFiles = [
      'package.json',
      'server.ts',
      'index.html',
      'vite.config.ts',
      'tsconfig.json',
      'metadata.json',
      '.env.example',
      '.gitignore',
      'README.md',
    ];

    for (const file of rootFiles) {
      const fullPath = path.join(rootDir, file);
      if (fs.existsSync(fullPath)) {
        zip.addLocalFile(fullPath);
      }
    }

    const buffer = zip.toBuffer();
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(buffer);
  } catch (zipErr: any) {
    console.error('ZIP generation error:', zipErr);
    return res.status(500).json({ error: 'ZIP 백업 파일 생성 중 오류가 발생했습니다.' });
  }
});

// Face detection and validation check endpoint
app.post('/api/check-face', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: '이미지 데이터가 전달되지 않았습니다.' });
    }

    const ai = getAI();
    const cleanBase64 = image.replace(/^data:image\/\w+;base64,/, '');
    const mimeMatch = image.match(/^data:(image\/\w+);base64,/);
    let mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) {
      mimeType = 'image/jpeg';
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType,
            },
          },
          {
            text: `Analyze the provided portrait image for an AI commercial photo studio.
Count how many distinct human faces are clearly visible in the foreground.
Estimate the person's approximate current age.
Return JSON:
- faceCount: integer count
- isValid: boolean (true if exactly 1 face, false otherwise)
- estimatedAge: estimated integer age (e.g. 35)
- message: Korean guidance message`,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            faceCount: { type: Type.INTEGER },
            isValid: { type: Type.BOOLEAN },
            estimatedAge: { type: Type.INTEGER },
            message: { type: Type.STRING },
          },
          required: ['faceCount', 'isValid', 'message'],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return res.json({
      faceCount: typeof parsed.faceCount === 'number' ? parsed.faceCount : 1,
      isValid: parsed.isValid !== undefined ? parsed.isValid : true,
      estimatedAge: parsed.estimatedAge || 35,
      message: parsed.message || '얼굴이 선명하게 확인되었습니다.',
    });
  } catch (err: any) {
    console.error('Face validation error:', err);
    return res.json({
      faceCount: 1,
      isValid: true,
      estimatedAge: 35,
      message: '인물 사진이 접수되었습니다.',
    });
  }
});

// Master Portrait Generation Endpoint - Exact User Specifications
app.post('/api/generate-retro-portrait', async (req, res) => {
  try {
    const { image, themeId, styleId, gender, ageGroup, customerName } = req.body;

    if (!image) {
      return res.status(400).json({ error: '인물 사진이 업로드되지 않았습니다.' });
    }

    const ai = getAI();

    // Increment today's customer count
    todaySessionCount++;

    const cleanBase64 = image.replace(/^data:image\/\w+;base64,/, '');
    const mimeMatch = image.match(/^data:(image\/\w+);base64,/);
    let mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) {
      mimeType = 'image/jpeg';
    }

    // Step 1: Facial Identity Extraction (Keep 60% Genetic Identity)
    let facialFeaturesSummary = '';
    try {
      const visionAnalysis = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType,
              },
            },
            {
              text: `You are the master portrait biometric analyzer for HahaHoho AI Studio.
Analyze the provided face strictly for invariant facial identity landmarks:
- Eye shape, eye slant angle, eyelid crease (monolid/double eyelid)
- Nose bridge width and shape, nose tip structure
- Lip contour, philtrum shape, mouth width
- Cheekbone height and facial bone width
- Jawline angle and chin structure
- Ethnicity, natural gender traits
CRITICAL: Do NOT copy skin fatigue, wrinkles, blemishes, or age sagging. Isolate ONLY the bone structure and genetic features that define their unique identity.
Output a concise 3-4 sentence English description of their invariant facial geometry.`,
            },
          ],
        },
      });
      facialFeaturesSummary = visionAnalysis.text?.trim() || '';
    } catch (visionErr) {
      console.warn('Facial extraction notice:', visionErr);
    }

    // Step 2: Build Theme and Style Directives based on User Specification
    let themeNumber = 1;
    let selectedThemePrompt = '';

    if (themeId === 'korean_classic_cinema' || themeId === 'cinema') {
      themeNumber = 1;
      if (gender === 'male') {
        selectedThemePrompt = `━━ 테마 1. 1970s–1980s 한국 고전 영화 스타 ━━
분위기: 7080 한국 은막 스타 화보. 빈티지 유럽풍 거실, 앤티크 소파, 관엽식물, 다이얼 전화기 배치. 따뜻한 아날로그 필름 색감과 부드러운 필름 그레인.
남성 스타일: 깔끔한 포마드 헤어, 클래식 울 쓰리피스 수트. 앤틱 카메라 또는 양장본 대본 소품.`;
      } else {
        if (styleId === 'cinema_female_pure') {
          selectedThemePrompt = `━━ 테마 1. 1970s–1980s 한국 고전 영화 스타 ━━
분위기: 7080 한국 은막 스타 화보. 빈티지 유럽풍 거실, 앤티크 소파, 관엽식물, 다이얼 전화기 배치. 따뜻한 아날로그 필름 색감과 부드러운 필름 그레인.
여성 스타일 A (청순 레트로): 단발 웨이브, 밀짚모자, 잔무늬 크림색 원피스. 빈티지 암체어에 앉아 작은 노란 꽃을 든 모습.`;
        } else if (styleId === 'cinema_female_madam') {
          selectedThemePrompt = `━━ 테마 1. 1970s–1980s 한국 고전 영화 스타 ━━
분위기: 7080 한국 은막 스타 화보. 빈티지 유럽풍 거실, 앤티크 소파, 관엽식물, 다이얼 전화기 배치. 따뜻한 아날로그 필름 색감과 부드러운 필름 그레인.
여성 스타일 B (우아한 마담): 볼륨 단발, 흰색 블라우스, 녹색 벨벳 치마, 스카프. 꽃무늬 소파.`;
        } else {
          selectedThemePrompt = `━━ 테마 1. 1970s–1980s 한국 고전 영화 스타 ━━
분위기: 7080 한국 은막 스타 화보. 빈티지 유럽풍 거실, 앤티크 소파, 관엽식물, 다이얼 전화기 배치. 따뜻한 아날로그 필름 색감과 부드러운 필름 그레인.
여성 스타일 C (지적인 여배우): 볼륨 단발, 단색 레트로 원피스(남색/초록/레드 중 1), 진주 목걸이. '영화대본'을 들고 있는 모습.`;
        }
      }
    } else if (themeId === 'viking_beer') {
      themeNumber = 2;
      if (gender === 'male') {
        const subStyle = styleId === 'beer_male_vest'
          ? 'B: 화이트셔츠+다크베스트'
          : styleId === 'beer_male_suit'
          ? 'C: 다크수트+와이드칼라'
          : 'A: 화이트셔츠+데님/슬랙스';
        selectedThemePrompt = `━━ 테마 2. 바이킹 비어밤 프리미엄 수제맥주 광고 ━━
분위기: 따뜻한 골드톤 현대 브루어리/펍. 구리 양조탱크, 황금빛 보케. 물방울이 맺힌 수제맥주 유리잔 필수.
텍스트 배너 (필수): "지금, 조타카이로 건배!" 또는 "VIKING CRAFT BEER", "JOTAKAI" 문구를 크고 굵은 입체 글자로 삽입 (가짜 로고 생성 금지).
남성 스타일 (${subStyle}): 아이돌 헤어스타일, 서 있는 자세. 시원하게 건배하는 당당한 포즈.`;
      } else {
        const subStyle = styleId === 'beer_female_trendy'
          ? 'B: 미니스커트+화이트셔츠'
          : 'A: 하늘/레드 플로럴 원피스';
        selectedThemePrompt = `━━ 테마 2. 바이킹 비어밤 프리미엄 수제맥주 광고 ━━
분위기: 따뜻한 골드톤 현대 브루어리/펍. 구리 양조탱크, 황금빛 보케. 물방울이 맺힌 수제맥주 유리잔 필수.
텍스트 배너 (필수): "지금, 조타카이로 건배!" 또는 "VIKING CRAFT BEER", "JOTAKAI" 문구를 크고 굵은 입체 글자로 삽입 (가짜 로고 생성 금지).
여성 스타일 (${subStyle}): 풍성한 긴 웨이브(반묶음 금지), 화사한 메이크업. 바 스툴에 앉아 건배하는 포즈.`;
      }
    } else if (themeId === 'royal_hanbok') {
      themeNumber = 3;
      if (gender === 'male') {
        if (styleId === 'hanbok_male_scholar') {
          selectedThemePrompt = `━━ 테마 3. 한국 전통 궁중 한복 ━━
분위기: 고즈넉한 전통 한옥 대청마루, 격자 창호, 은은한 자연광, 화조도/일월오봉도 병풍. 고화질 실사.
남성 스타일 B (갓 쓴 선비): 갓과 남색 도포. 수묵화 부채 소품. 한옥 마루 배경.`;
        } else {
          selectedThemePrompt = `━━ 테마 3. 한국 전통 궁중 한복 ━━
분위기: 고즈넉한 전통 한옥 대청마루, 격자 창호, 은은한 자연광, 화조도/일월오봉도 병풍. 고화질 실사.
남성 스타일 A (활터 임금): 금빛 용 자수 전통 의상(남/황/백/적 중 1)과 공작 깃털 모자. 궁궐 활터 배경, 전통 활을 든 모습.`;
        }
      } else {
        let hanbokSub = 'A: 초록색 당의+흰치마';
        if (styleId === 'hanbok_female_pink') hanbokSub = 'B: 분홍색 당의+노란치마';
        else if (styleId === 'hanbok_female_black') hanbokSub = 'C: 검은색 당의+전통 가채';
        else if (styleId === 'hanbok_female_red') hanbokSub = 'D: 붉은색 당의+가채';
        else if (styleId === 'hanbok_female_white') hanbokSub = 'E: 흰색 당의+붉은 치마';

        selectedThemePrompt = `━━ 테마 3. 한국 전통 궁중 한복 ━━
분위기: 고즈넉한 전통 한옥 대청마루, 격자 창호, 은은한 자연광, 화조도/일월오봉도 병풍. 고화질 실사.
여성 스타일 (${hanbokSub}): 쪽머리/가채 & 당의, 병풍과 한옥 배경. 고운 전통 실사 화보.`;
      }
    } else if (themeId === 'viking_fantasy_harbor') {
      themeNumber = 4;
      if (gender === 'male') {
        let subStyle = 'A: 어두운 가죽 망토+가죽 갑옷';
        if (styleId === 'viking_male_helmet') subStyle = 'B: 뿔 투구+털 망토+복잡한 갑옷';
        else if (styleId === 'viking_male_cuirass') subStyle = 'C: 흰/남색 판타지 흉갑';

        selectedThemePrompt = `━━ 테마 4. 바이킹 판타지 비어 하버 ━━
분위기: 블록버스터 실사 영화 질감. 노을 또는 낮의 항구/롱쉽 갑판, 오크통, 돛. 밝은 자연광 또는 노을빛.
남성 스타일 (3/4 무릎 샷, ${subStyle}): 거품 가득한 맥주잔 필수. 당당하고 웅장한 전사의 위용.`;
      } else {
        let subStyle = 'A: 금발+흰/남색 판타지 갑옷 무릎샷';
        if (styleId === 'viking_female_ranger') subStyle = 'B: 어두운 머리+갈색 갑옷+녹색 원피스 무릎샷';
        else if (styleId === 'viking_female_corset') subStyle = 'C: 코르셋 가죽 갑옷 전신샷';

        selectedThemePrompt = `━━ 테마 4. 바이킹 판타지 비어 하버 ━━
분위기: 블록버스터 실사 영화 질감. 노을 또는 낮의 항구/롱쉽 갑판, 오크통, 돛. 밝은 자연광 또는 노을빛.
여성 스타일 (${subStyle}): 맥주잔 필수. 강인함과 화사함이 공존하는 블록버스터 실사 샷.`;
      }
    } else {
      themeNumber = 5;
      if (gender === 'male') {
        let subStyle = 'A: 제임스 딘 풍 퀴프+가죽자켓+데님';
        if (styleId === 'hollywood_male_classic_car') subStyle = 'B: 포마드+스포츠코트+클래식카';
        else if (styleId === 'hollywood_male_suit') subStyle = 'C: 슬릭백+테일러드 수트';

        selectedThemePrompt = `━━ 테마 5. 1940s–1950s 서구권 빈티지 스타 ━━
분위기: 40~50년대 할리우드 영화배우 화보. 극장, 고급 클래식카, 레트로 다이너. 아이레벨 화각.
남성 스타일 (${subStyle}): 당당한 은막의 스타 매력.`;
      } else {
        let subStyle = 'A: 핀업스타+스윙드레스+밀크셰이크';
        if (styleId === 'hollywood_female_car_glam') subStyle = 'B: 클래식카 글래머+랩드레스';
        else if (styleId === 'hollywood_female_actress') subStyle = 'C: 할리우드 영화배우+칵테일드레스+진주';

        selectedThemePrompt = `━━ 테마 5. 1940s–1950s 서구권 빈티지 스타 ━━
분위기: 40~50년대 할리우드 영화배우 화보. 극장, 고급 클래식카, 레트로 다이너. 아이레벨 화각.
여성 스타일 (${subStyle}): 아치형 눈썹, 피치 치크, 로즈 립. 황금기 은막의 우아한 여배우 화보.`;
      }
    }

    // Step 3: Age Rejuvenation Prompt based on exact user specification
    let ageRejuvenationText = '';
    if (ageGroup === '20대') {
      ageRejuvenationText = `[20대 꽃청춘]
맑고 탄력 있고 생기 있는 20대 성인의 얼굴. 눈 밑 눈물고랑, 다크서클, 주름, 볼패임, 잡티를 깨끗하게 제거한다. 자연스러운 볼륨감을 주되, 10대나 어린아이의 젖살처럼 유아화하지 마라.`;
    } else if (ageGroup === '30대') {
      ageRejuvenationText = `[30대 전성기]
세련되고 생기 있는 30대의 전성기 얼굴. 잔주름, 팔자주름, 다크서클, 탄력 저하를 제거한다. 맑고 탄력 있는 피부를 만들되 20대처럼 보이지 않게 하며, 성숙함과 카리스마를 유지한다.`;
    } else {
      ageRejuvenationText = `[40대 품격 원숙미]
원본보다 10~15년 젊고 생기 있는 관리가 잘 된 40대의 모습. 깊은 주름과 턱선 처짐만 자연스럽게 완화한다. 고유한 인상과 성숙한 피부 질감, 품격을 보존하며 20대처럼 플라스틱처럼 매끈하게 만들지 않는다.`;
    }

    const randomSeed = Math.floor(Math.random() * 1000000);

    // Exact Prompt structure requested by User
    const finalPrompt = `[Google AI Studio 시스템 지침 — 2026 반여시장 레트로 페스타 AI 사진관]

너는 2026 반여시장 레트로 페스타와 바이킹 비어밤의 공식 'AI 레트로 마스터 사진작가'다. 사용자가 업로드한 인물 사진을 바탕으로, 선택된 단 하나의 테마와 스타일에 맞는 세로형 초고화질 인생 화보 이미지를 생성한다.

[최우선 절대 규칙] 이 지침은 오직 '이미지 생성'에만 적용한다. 웹사이트 UI, 저장 폴더 경로, API 키, 진행률, 화면 전환, 파일명, 서버 구현에 관한 설명 등 어떠한 텍스트 답변도 출력하지 않으며 오직 완성된 이미지만 즉시 렌더링한다.

━━━━━━━━━━━━━━━━━━━━
지시 우선순위
━━━━━━━━━━━━━━━━━━━━
다음 순서로 지시를 엄격히 적용한다.
1. 이미지 생성 모델의 안전 정책과 기술적 제약 준수
2. 사용자가 선택한 테마 1개와 스타일 1개 적용
3. 업로드 인물의 얼굴 정체성 보존 (60%)
4. 연령대별 정밀 리바이탈라이징
5. 구도·포즈·의상·소품·배경 연출
6. 밝고 선명한 전문 사진관 조명과 색감 (저조도 금지)
7. 네거티브 조건 배제
선택되지 않은 테마, 성별 스타일, 연령대, 배경을 절대 섞지 마라.

━━━━━━━━━━━━━━━━━━━━
2. 입력 인물 정체성 보존 (60% 기준)
━━━━━━━━━━━━━━━━━━━━
업로드된 인물 사진은 '얼굴 정체성'을 확인하기 위한 기준 이미지로만 사용한다. 원본의 배경, 의상, 구도, 표정, 조명은 무시하고 선택된 테마로 완벽히 새롭게 연출한다.

[얼굴 정체성 보존]: 인물의 눈매와 눈의 고유한 각도, 쌍꺼풀 라인, 코의 형태와 콧날, 입술선, 얼굴 골격과 턱선, 성별·인종적 특징을 유지하여 본인임을 한눈에 알아볼 수 있게 한다.
- 눈·코·입을 과도하게 확대하거나 다른 사람처럼 재구성하지 마라.
- 업로드된 사진의 성별에 맞는 스타일(남성/여성)만 적용하며, 임의로 성별을 바꾸지 않는다.
${facialFeaturesSummary ? `[업로드 인물의 고유 이목구비 분석 요약]:\n${facialFeaturesSummary}` : ''}

━━━━━━━━━━━━━━━━━━━━
3. 연령대별 리바이탈라이징 (유아화 금지)
━━━━━━━━━━━━━━━━━━━━
${ageRejuvenationText}

━━━━━━━━━━━━━━━━━━━━
4. 공통 촬영·렌더링 규칙 (화각 및 조명)
━━━━━━━━━━━━━━━━━━━━
규격: 세로형 5:7 비율의 초고화질 실사 사진 화보.
구도(증명사진 엄격 금지): 얼굴만 꽉 찬 클로즈업, 여권사진 구도는 절대 금지. 머리부터 종아리 중간/무릎선까지 보이는 '미디엄 와이드·3/4 화보 샷'을 기본으로 하여 의상과 배경이 풍성하게 보이도록 프레이밍한다.
시점: 아이레벨 또는 가슴 높이. 극단적인 광각/로우 앵글, 비현실적인 8등신 과장을 금지한다.
조명(저조도 엄격 금지): 전문 사진관의 대형 소프트박스 3점 조명(Key, Fill, Rim)과 전면 반사판을 사용하여 인물과 의상, 배경 소품이 모두 밝고 환하게 보이도록 노출을 맞춘다. 눈동자에는 생기 있는 캐치라이트(Catchlight)를 넣는다.
어둡고 침침한 저조도, 얼굴이 묻히는 언더노출, 칙칙한 그림자, 무거운 비네팅은 엄격히 금지한다.

━━━━━━━━━━━━━━━━━━━━
5. 선택 테마 라이브러리
━━━━━━━━━━━━━━━━━━━━
${selectedThemePrompt}

━━━━━━━━━━━━━━━━━━━━
6. 공통 네거티브 프롬프트 (금지 사항)
━━━━━━━━━━━━━━━━━━━━
증명사진 구도, 여권사진, 얼굴만 꽉 찬 클로즈업, 원본 셀카 구도 복제, 8등신 과장, 롱다리, 장난감 차량, 현대 SUV/스포츠카, 60~70년대 히피/디스코, 현대 K-pop 무대풍(투블럭/다운펌/C컬), 피곤한 얼굴, 생기 없는 눈, 칙칙한 피부, 깊은 팔자주름, 20대가 중년처럼 보임, 타인의 얼굴, 성별 변경, 플라스틱/인형 피부, 과도한 노출, 깨진 글자, 저해상도, 손가락 왜곡, 어두운 저조도, 언더노출, 짙은 그림자, 검은 비네팅.

━━━━━━━━━━━━━━━━━━━━
7. 실행 입력값과 응답 규칙
━━━━━━━━━━━━━━━━━━━━
[입력 변수]
원본 인물 이미지: {source_image}
성별: ${gender === 'male' ? '남성' : '여성'}
선택 연령대: ${ageGroup}
선택 테마: ${themeNumber}
선택 스타일: ${styleId || '기본 스타일'}
생성 시드: ${randomSeed}
출력 비율: 5:7 세로

[최종 명령]
위의 입력값을 바탕으로 선택된 테마와 스타일이 일관되게 결합된 '초고화질 인생 화보 사진' 1장을 즉시 생성하라. 어떠한 설명 텍스트, 코드, 진행 상황도 응답에 포함하지 말고 오직 [이미지만 출력]하라.`;

    let generatedImageDataUrl: string | null = null;

    // Call Primary Model: gemini-3.1-flash-lite-image
    try {
      console.log('Generating commercial portrait with gemini-3.1-flash-lite-image...');
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType,
              },
            },
            {
              text: finalPrompt,
            },
          ],
        },
      });

      if (response.candidates && response.candidates.length > 0) {
        for (const part of response.candidates[0].content?.parts || []) {
          if (part.inlineData && part.inlineData.data) {
            const outMime = part.inlineData.mimeType || 'image/jpeg';
            generatedImageDataUrl = `data:${outMime};base64,${part.inlineData.data}`;
            break;
          }
        }
      }
    } catch (primaryModelErr: any) {
      console.warn('Primary gemini-3.1-flash-lite-image error, trying nano-banana-2.1 fallback...', primaryModelErr?.message || primaryModelErr);

      // Fallback 1: gemini-nano-banana-2.1
      try {
        const fallbackResponse = await ai.models.generateContent({
          model: 'gemini-nano-banana-2.1',
          contents: {
            parts: [
              {
                inlineData: {
                  data: cleanBase64,
                  mimeType,
                },
              },
              {
                text: finalPrompt,
              },
            ],
          },
          config: {
            imageConfig: {
              aspectRatio: '3:4',
              imageSize: '1K',
            },
          },
        });

        if (fallbackResponse.candidates && fallbackResponse.candidates.length > 0) {
          for (const part of fallbackResponse.candidates[0].content?.parts || []) {
            if (part.inlineData && part.inlineData.data) {
              const outMime = part.inlineData.mimeType || 'image/jpeg';
              generatedImageDataUrl = `data:${outMime};base64,${part.inlineData.data}`;
              break;
            }
          }
        }
      } catch (fallbackErr: any) {
        console.warn('Fallback 1 failed, trying gemini-3-pro-image...', fallbackErr?.message || fallbackErr);

        // Fallback 2: gemini-3-pro-image
        try {
          const proResponse = await ai.models.generateContent({
            model: 'gemini-3-pro-image',
            contents: {
              parts: [
                {
                  inlineData: {
                    data: cleanBase64,
                    mimeType,
                  },
                },
                {
                  text: finalPrompt,
                },
              ],
            },
          });

          if (proResponse.candidates && proResponse.candidates.length > 0) {
            for (const part of proResponse.candidates[0].content?.parts || []) {
              if (part.inlineData && part.inlineData.data) {
                const outMime = part.inlineData.mimeType || 'image/jpeg';
                generatedImageDataUrl = `data:${outMime};base64,${part.inlineData.data}`;
                break;
              }
            }
          }
        } catch (proErr: any) {
          console.error('All image generation models failed:', proErr?.message || proErr);
          throw proErr;
        }
      }
    }

    if (!generatedImageDataUrl) {
      throw new Error('AI 모델에서 이미지 데이터를 반환하지 못했습니다. (텍스트만 응답됨)');
    }

    return res.json({ imageUrl: generatedImageDataUrl });
  } catch (error: any) {
    console.error('Portrait generation failed:', error);
    const errorMessage = error?.message || '사진 생성 중 오류가 발생했습니다.';
    const fullErrorStr = `${errorMessage} ${typeof error === 'object' ? JSON.stringify(error) : String(error)}`;

    let userFriendlyError = '앗, 사진 현상이 잠시 잘 안됐어요. 한 번 더 만들어볼게요.';
    let isAuthError = false;

    if (
      fullErrorStr.includes('401') ||
      fullErrorStr.includes('UNAUTHENTICATED') ||
      fullErrorStr.includes('API_KEY_SERVICE_BLOCKED') ||
      fullErrorStr.includes('ACCESS_TOKEN_TYPE_UNSUPPORTED') ||
      fullErrorStr.includes('invalid authentication') ||
      fullErrorStr.includes('API key not valid') ||
      fullErrorStr.includes('API_KEY_INVALID')
    ) {
      isAuthError = true;
      userFriendlyError = 'Gemini API 키 인증 필요: 등록된 키가 차단되었거나 유효하지 않습니다. [🔑 새 API 키 연결] 버튼을 눌러 유료 API 키를 등록해 주세요.';
    } else if (
      fullErrorStr.includes('403') ||
      fullErrorStr.includes('PERMISSION_DENIED') ||
      fullErrorStr.includes('API_KEY') ||
      !(runtimeApiKey || process.env.GEMINI_API_KEY)
    ) {
      isAuthError = true;
      userFriendlyError = 'Gemini API 키 권한 필요: 유효한 API 키가 설정되지 않았습니다. [🔑 새 API 키 연결] 버튼에서 새 키를 등록해 주세요.';
    } else if (
      fullErrorStr.includes('RESOURCE_EXHAUSTED') ||
      fullErrorStr.includes('429') ||
      fullErrorStr.includes('Quota') ||
      fullErrorStr.includes('quota')
    ) {
      userFriendlyError = 'API 호출 한도(Quota) 초과: 유료 API 키가 정상 적용되었는지 확인해 주세요. [🔑 새 API 키 연결]에서 다시 등록하실 수 있습니다.';
    } else if (fullErrorStr.includes('SAFETY') || fullErrorStr.includes('blocked')) {
      userFriendlyError = '인물 사진 또는 의상 프롬프트가 안전 정책에 의해 차단되었습니다. 다른 표정의 사진이나 다른 테마를 선택해 주세요.';
    }

    return res.status(500).json({
      error: userFriendlyError,
      details: errorMessage,
      isAuthError,
    });
  }
});

// Auto Local Save endpoint: C:\하하호호스튜디오\YYYYMMDD\순번_고객명_테마_시간.jpg
app.post('/api/save-photo', async (req, res) => {
  try {
    const { imageDataUrl, themeName, customerName, count } = req.body;
    if (!imageDataUrl) {
      return res.status(400).json({ error: '저장할 이미지 데이터가 없습니다.' });
    }

    const base64Data = imageDataUrl.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const dateFolder = `${yyyy}${mm}${dd}`;
    const timeStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

    const seq = String(count || todaySessionCount || 1).padStart(3, '0');
    const safeCustomer = (customerName || '고객').replace(/[\\/:*?"<>|]/g, '_');
    const safeTheme = (themeName || '인생화보').replace(/[\\/:*?"<>|]/g, '_');
    const filename = `${seq}_${safeCustomer}_${safeTheme}_${timeStr}.jpg`;

    // 1. Try Windows official path C:\하하호호스튜디오\YYYYMMDD
    let primarySavedPath = '';
    const isWindows = process.platform === 'win32';

    if (isWindows) {
      const winDir = path.join('C:\\', '하하호호스튜디오', dateFolder);
      try {
        if (!fs.existsSync(winDir)) {
          fs.mkdirSync(winDir, { recursive: true });
        }
        const winFilePath = path.join(winDir, filename);
        fs.writeFileSync(winFilePath, buffer);
        primarySavedPath = winFilePath;
      } catch (winErr) {
        console.warn('Windows directory write fallback:', winErr);
      }
    }

    // 2. Fallback / Standard App storage directory: storage/하하호호스튜디오/YYYYMMDD
    const appStorageDir = path.join(process.cwd(), 'storage', '하하호호스튜디오', dateFolder);
    if (!fs.existsSync(appStorageDir)) {
      fs.mkdirSync(appStorageDir, { recursive: true });
    }
    const appFilePath = path.join(appStorageDir, filename);
    fs.writeFileSync(appFilePath, buffer);

    if (!primarySavedPath) {
      primarySavedPath = appFilePath;
    }

    savedFilenamesSet.add(filename);

    return res.json({
      success: true,
      filename,
      savedPath: primarySavedPath,
      appStoragePath: appFilePath,
      count: count || todaySessionCount,
    });
  } catch (saveErr: any) {
    console.error('Auto save error:', saveErr);
    return res.status(500).json({ error: '로컬 폴더 자동 저장 중 오류가 발생했습니다.' });
  }
});

// Production static file serving & Development Vite middleware
async function startServer() {
  const isProd =
    process.env.NODE_ENV === 'production' ||
    process.env.npm_lifecycle_event === 'start' ||
    (!process.env.npm_lifecycle_event && fs.existsSync(path.join(process.cwd(), 'dist', 'index.html')));

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[하하호호 스튜디오 AI 사진관] 서버가 포트 ${PORT}에서 실행 중입니다.`);
    console.log(`- API 키 상태: ${process.env.GEMINI_API_KEY ? '주입됨' : '미주입'}`);
  });
}

startServer();
