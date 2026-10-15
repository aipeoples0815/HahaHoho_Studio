import { RetroTheme, AgeGroup } from '../types';

export const RETRO_THEMES: RetroTheme[] = [
  {
    id: 'korean_classic_cinema',
    themeNumber: 1,
    name: '1970s–1980s 한국 고전 영화 스타',
    subtitle: '은막을 수놓은 명배우의 아날로그 감성 화보',
    badge: '은막 스타',
    description: '빈티지 유럽풍 거실, 앤티크 소파, 관엽식물, 다이얼 전화기. 따뜻한 아날로그 필름 색감과 부드러운 그레인의 은막 스타 화보.',
    iconName: 'Film',
    styles: [
      {
        id: 'cinema_male_classic',
        name: '클래식 포마드 & 울 쓰리피스 수트',
        gender: 'male',
        description: '깔끔한 포마드 헤어, 클래식 울 쓰리피스 수트. 앤틱 카메라 또는 양장본 대본 소품.',
      },
      {
        id: 'cinema_female_pure',
        name: '스타일 A : 청순 레트로',
        gender: 'female',
        description: '단발 웨이브, 밀짚모자, 잔무늬 크림색 원피스. 빈티지 암체어에 앉아 작은 노란 꽃을 든 모습.',
      },
      {
        id: 'cinema_female_madam',
        name: '스타일 B : 우아한 마담',
        gender: 'female',
        description: '볼륨 단발, 흰색 블라우스, 녹색 벨벳 치마, 스카프. 꽃무늬 소파 연출.',
      },
      {
        id: 'cinema_female_actress',
        name: '스타일 C : 지적인 여배우',
        gender: 'female',
        description: '볼륨 단발, 단색 레트로 원피스, 진주 목걸이, 영화 대본을 든 고혹적인 여배우.',
      },
    ],
  },
  {
    id: 'viking_beer',
    themeNumber: 2,
    name: '바이킹 비어밤 프리미엄 수제맥주 광고',
    subtitle: '조타카이와 함께하는 황금빛 축제 브루어리 광고',
    badge: '공식 시그니처',
    description: '따뜻한 골드톤 브루어리/펍, 구리 양조탱크, 황금빛 보케. 물방울 맺힌 수제맥주 잔과 "지금, 조타카이로 건배!" 배너.',
    iconName: 'Beer',
    styles: [
      {
        id: 'beer_male_casual',
        name: '스타일 A : 화이트 셔츠 & 데님',
        gender: 'male',
        description: '아이돌 헤어스타일, 화이트 셔츠 롤업 & 데님/슬랙스. 시원하게 건배하는 포즈.',
      },
      {
        id: 'beer_male_vest',
        name: '스타일 B : 브루어리 베스트 룩',
        gender: 'male',
        description: '아이돌 헤어, 화이트 셔츠 & 다크 베스트. 브루어리 마스터 느낌의 세련된 포즈.',
      },
      {
        id: 'beer_male_suit',
        name: '스타일 C : 다크 수트 & 와이드칼라',
        gender: 'male',
        description: '아이돌 헤어, 다크 수트 & 오픈 와이드 칼라. 럭셔리 펍 VIP 광고 모델 포즈.',
      },
      {
        id: 'beer_female_floral',
        name: '스타일 A : 플로럴 페스타 원피스',
        gender: 'female',
        description: '풍성한 긴 웨이브, 화사한 메이크업, 하늘/레드 플로럴 원피스. 바 스툴에 앉아 건배하는 포즈.',
      },
      {
        id: 'beer_female_trendy',
        name: '스타일 B : 미니스커트 & 화이트 셔츠',
        gender: 'female',
        description: '풍성한 긴 웨이브, 화이트 셔츠 & 미니스커트 펍 룩. 맥주잔을 들고 활짝 웃는 생기 있는 포즈.',
      },
    ],
  },
  {
    id: 'royal_hanbok',
    themeNumber: 3,
    name: '한국 전통 궁중 한복',
    subtitle: '기품과 위엄이 깃든 고즈넉한 대청마루 실사 화보',
    badge: '전통 명작',
    description: '고즈넉한 전통 한옥 대청마루, 격자 창호, 은은한 자연광, 화조도/일월오봉도 병풍 배경의 초고화질 실사.',
    iconName: 'Crown',
    styles: [
      {
        id: 'hanbok_male_king',
        name: '스타일 A : 활터 임금',
        gender: 'male',
        description: '금빛 용 자수 곤룡포 전통 의상과 공작 깃털 모자. 궁궐 활터 배경, 전통 활을 든 모습.',
      },
      {
        id: 'hanbok_male_scholar',
        name: '스타일 B : 갓 쓴 선비',
        gender: 'male',
        description: '갓과 남색 비단 도포, 수묵화 부채 소품. 고즈넉한 한옥 마루 배경.',
      },
      {
        id: 'hanbok_female_green',
        name: '스타일 A : 초록색 당의 & 흰치마',
        gender: 'female',
        description: '정갈한 쪽머리/가채, 초록색 자수 당의와 흰 치마. 한옥 창호와 병풍 배경.',
      },
      {
        id: 'hanbok_female_pink',
        name: '스타일 B : 분홍색 당의 & 노란치마',
        gender: 'female',
        description: '화사한 분홍색 당의와 고운 노란 치마, 전통 노리개와 은은한 자연광.',
      },
      {
        id: 'hanbok_female_black',
        name: '스타일 C : 검은색 당의 & 전통 가채',
        gender: 'female',
        description: '고혹적이고 웅장한 검은색 당의와 풍성한 가채, 은빛 자수 포인트.',
      },
      {
        id: 'hanbok_female_red',
        name: '스타일 D : 붉은색 당의 & 가채',
        gender: 'female',
        description: '기품 있는 붉은색 당의와 가채, 궁중 대례복의 압도적인 아우라.',
      },
      {
        id: 'hanbok_female_white',
        name: '스타일 E : 흰색 당의 & 붉은치마',
        gender: 'female',
        description: '청아한 순백 당의와 붉은 치마의 우아한 대비, 단아한 왕후의 자태.',
      },
    ],
  },
  {
    id: 'viking_fantasy_harbor',
    themeNumber: 4,
    name: '바이킹 판타지 비어 하버',
    subtitle: '블록버스터 영화 같은 롱쉽 갑판과 웅장한 노을 항구',
    badge: '판타지 영화',
    description: '블록버스터 실사 영화 질감. 노을 또는 낮의 항구/롱쉽 갑판, 오크통, 돛, 거품 가득한 맥주잔.',
    iconName: 'Shield',
    styles: [
      {
        id: 'viking_male_cloak',
        name: '스타일 A : 가죽 망토 & 가죽 갑옷 전사',
        gender: 'male',
        description: '어두운 가죽 망토와 가죽 갑옷, 거품 가득한 맥주잔을 든 3/4 무릎 샷.',
      },
      {
        id: 'viking_male_helmet',
        name: '스타일 B : 뿔 투구 & 털 망토 전사',
        gender: 'male',
        description: '뿔 투구, 털 망토, 정교한 갑옷. 갑판 위 거품 가득한 맥주잔을 든 전사.',
      },
      {
        id: 'viking_male_cuirass',
        name: '스타일 C : 실버 & 네이비 판타지 흉갑',
        gender: 'male',
        description: '흰색/남색 판타지 흉갑, 노을빛 바다를 배경으로 한 당당한 포즈.',
      },
      {
        id: 'viking_female_silver',
        name: '스타일 A : 금발 & 판타지 은빛 갑옷',
        gender: 'female',
        description: '금발, 흰/남색 판타지 갑옷, 맥주잔을 든 카리스마 3/4 무릎 화보 샷.',
      },
      {
        id: 'viking_female_ranger',
        name: '스타일 B : 갈색 갑옷 & 녹색 원피스',
        gender: 'female',
        description: '어두운 머리, 갈색 가죽 갑옷과 녹색 원피스, 바이킹 롱쉽 배경.',
      },
      {
        id: 'viking_female_corset',
        name: '스타일 C : 코르셋 가죽 갑옷',
        gender: 'female',
        description: '세련된 코르셋 가죽 갑옷, 맥주잔과 돛대 배경의 역동적인 샷.',
      },
    ],
  },
  {
    id: 'vintage_hollywood_50s',
    themeNumber: 5,
    name: '1940s–1950s 서구권 빈티지 스타',
    subtitle: '할리우드 황금기 은막의 레전드 스타 & 클래식카',
    badge: '할리우드 클래식',
    description: '40~50년대 할리우드 영화배우 화보. 극장, 고급 클래식카, 레트로 다이너 배경의 아이레벨 실사.',
    iconName: 'Camera',
    styles: [
      {
        id: 'hollywood_male_rebel',
        name: '스타일 A : 제임스 딘 가죽자켓 & 데님',
        gender: 'male',
        description: '제임스 딘 풍 퀴프 헤어, 가죽자켓, 클래식 데님. 청춘 반항아의 눈빛.',
      },
      {
        id: 'hollywood_male_classic_car',
        name: '스타일 B : 포마드 & 스포츠코트 & 클래식카',
        gender: 'male',
        description: '포마드 헤어, 트위드/울 스포츠코트, 앤틱 컨버터블 클래식카 배경.',
      },
      {
        id: 'hollywood_male_suit',
        name: '스타일 C : 슬릭백 & 테일러드 수트',
        gender: 'male',
        description: '슬릭백 헤어, 완벽한 핏의 테일러드 수트, 레트로 극장 로비 배경.',
      },
      {
        id: 'hollywood_female_pinup',
        name: '스타일 A : 핀업스타 스윙드레스',
        gender: 'female',
        description: '아치형 눈썹, 피치 치크, 로즈 립, 폴카도트 스윙드레스와 빈티지 밀크셰이크.',
      },
      {
        id: 'hollywood_female_car_glam',
        name: '스타일 B : 클래식카 글래머 랩드레스',
        gender: 'female',
        description: '우아한 웨이브, 클래식 랩드레스와 선글라스, 고급 앤틱 오픈카 배경.',
      },
      {
        id: 'hollywood_female_actress',
        name: '스타일 C : 할리우드 칵테일드레스 & 진주',
        gender: 'female',
        description: '블랙 칵테일드레스, 진주 목걸이, 은막의 전설적인 여배우 파티 화보.',
      },
    ],
  },
];

export function getAgeGroupTitle(ageGroup: AgeGroup): { title: string; subtitle: string; desc: string } {
  switch (ageGroup) {
    case '20대':
      return {
        title: '20대 꽃청춘',
        subtitle: '맑고 탄력 있는 꽃청춘 리즈 시절',
        desc: '눈물고랑, 다크서클, 주름, 볼패임, 잡티를 깨끗하게 제거한 생기 넘치는 20대 성인의 빛나는 얼굴 (유아화 배제)',
      };
    case '30대':
      return {
        title: '30대 전성기',
        subtitle: '세련되고 카리스마 넘치는 황금기',
        desc: '잔주름, 팔자주름, 피로선을 제거하고 성숙함과 매력이 공존하는 세련된 30대 전성기 피부와 이목구비',
      };
    case '40대':
      return {
        title: '40대 품격 원숙미',
        subtitle: '10~15년 젊고 생기 있는 동안 스타',
        desc: '깊은 주름과 턱선 처짐을 자연스럽게 완화하여 본인의 품격과 성숙한 인상을 그대로 보존한 명품 동안 비주얼',
      };
    default:
      return {
        title: '20대 꽃청춘',
        subtitle: '맑고 탄력 있는 꽃청춘',
        desc: '맑고 탄력 있는 생기 있는 얼굴',
      };
  }
}
