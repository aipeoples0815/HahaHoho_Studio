import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PhotoUploader } from './components/PhotoUploader';
import { ThemeSelector } from './components/ThemeSelector';
import { GenderAgeSelector } from './components/GenderAgeSelector';
import { ResultViewer } from './components/ResultViewer';
import { OperatorModal } from './components/OperatorModal';
import { CustomerDisplay } from './components/CustomerDisplay';
import { PhotoStudioState, Gender, AgeGroup } from './types';
import { RETRO_THEMES } from './constants/themes';
import { Sparkles, AlertCircle, RefreshCw, Key } from 'lucide-react';

export const App: React.FC = () => {
  const [displayMode, setDisplayMode] = useState<'kiosk' | 'customer'>('kiosk');
  const [isOperatorModalOpen, setIsOperatorModalOpen] = useState(false);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(true);

  const [state, setState] = useState<PhotoStudioState>({
    currentStep: 'upload',
    sourceImage: null,
    selectedTheme: RETRO_THEMES[0].id,
    selectedStyleId: RETRO_THEMES[0].styles[0].id,
    gender: 'female',
    ageGroup: '20대',
    generatedImage: null,
    finalPrintImage: null,
    todayCount: 0,
    customerName: '',
    error: null,
  });

  // Check health and API key status on mount
  useEffect(() => {
    fetchHealthStatus();
  }, []);

  const fetchHealthStatus = async () => {
    try {
      const res = await fetch('/api/api-key-status');
      const data = await res.json();
      setApiKeyConfigured(data.isConfigured);
    } catch (err) {
      console.warn('API key status check error:', err);
    }

    try {
      const healthRes = await fetch('/api/health');
      const healthData = await healthRes.json();
      if (typeof healthData.todayCount === 'number') {
        setState((prev) => ({ ...prev, todayCount: healthData.todayCount }));
      }
    } catch (err) {
      console.warn('Health check error:', err);
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Shift + O : Operator Modal
      if (e.ctrlKey && e.shiftKey && (e.key === 'O' || e.key === 'o')) {
        e.preventDefault();
        setIsOperatorModalOpen((prev) => !prev);
      }
      // P: Print on Result page
      if (state.currentStep === 'result' && (e.key === 'p' || e.key === 'P') && !e.ctrlKey && !e.metaKey) {
        window.print();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.currentStep]);

  const handlePhotoSelected = (imageDataUrl: string, customerName?: string) => {
    setState((prev) => ({
      ...prev,
      sourceImage: imageDataUrl,
      customerName: customerName || prev.customerName,
      currentStep: 'theme',
      error: null,
    }));
  };

  const handleSelectTheme = (themeId: string) => {
    const matched = RETRO_THEMES.find((t) => t.id === themeId);
    const defaultStyle = matched?.styles.find((s) => s.gender === state.gender)?.id || matched?.styles[0]?.id;
    setState((prev) => ({
      ...prev,
      selectedTheme: themeId,
      selectedStyleId: defaultStyle,
    }));
  };

  const handleSelectGender = (gender: Gender) => {
    const matched = RETRO_THEMES.find((t) => t.id === state.selectedTheme);
    const firstMatchingStyle = matched?.styles.find((s) => s.gender === gender)?.id;
    setState((prev) => ({
      ...prev,
      gender,
      selectedStyleId: firstMatchingStyle || prev.selectedStyleId,
    }));
  };

  const handleGeneratePortrait = async () => {
    if (!state.sourceImage) {
      setState((prev) => ({ ...prev, error: '인물 사진을 먼저 등록해 주세요.' }));
      return;
    }

    setState((prev) => ({
      ...prev,
      currentStep: 'processing',
      error: null,
    }));

    try {
      const response = await fetch('/api/generate-retro-portrait', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: state.sourceImage,
          themeId: state.selectedTheme,
          styleId: state.selectedStyleId,
          gender: state.gender,
          ageGroup: state.ageGroup,
          customerName: state.customerName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '사진 생성 중 문제가 발생했습니다.');
      }

      setState((prev) => ({
        ...prev,
        generatedImage: data.imageUrl,
        finalPrintImage: data.imageUrl,
        currentStep: 'result',
        todayCount: prev.todayCount + 1,
        error: null,
      }));
    } catch (err: any) {
      console.error('Portrait creation error:', err);
      setState((prev) => ({
        ...prev,
        currentStep: 'gender_age',
        error: err?.message || '사진 현상 중 오류가 발생했습니다. 다시 시도해 주세요.',
      }));
    }
  };

  const handleResetToStart = () => {
    setState((prev) => ({
      ...prev,
      currentStep: 'upload',
      sourceImage: null,
      generatedImage: null,
      finalPrintImage: null,
      customerName: '',
      error: null,
    }));
  };

  return (
    <div className="min-h-screen bg-[#071324] text-white flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        currentStep={state.currentStep}
        todayCount={state.todayCount}
        displayMode={displayMode}
        onSelectDisplayMode={setDisplayMode}
        onOpenOperatorModal={() => setIsOperatorModalOpen(true)}
        onResetToStart={handleResetToStart}
        apiKeyConfigured={apiKeyConfigured}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center">
        {/* If Customer Display Mode is activated, render fullscreen customer view */}
        {displayMode === 'customer' ? (
          <CustomerDisplay
            state={state}
            onBackToKiosk={() => setDisplayMode('kiosk')}
          />
        ) : (
          <div className="py-4">
            {/* Error Notification Banner if any */}
            {state.error && (
              <div className="max-w-3xl mx-auto mb-6 px-4">
                <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-sm flex items-start gap-3 shadow-lg">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold mb-1">안내 메시지</p>
                    <p className="text-xs leading-relaxed">{state.error}</p>
                    {state.error.includes('API') && (
                      <button
                        onClick={() => setIsOperatorModalOpen(true)}
                        className="mt-2 px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>🔑 API 키 연결 창 열기</span>
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => setState((prev) => ({ ...prev, error: null }))}
                    className="text-xs text-rose-400 hover:text-white"
                  >
                    닫기
                  </button>
                </div>
              </div>
            )}

            {/* Step 1: Photo Uploader */}
            {state.currentStep === 'upload' && (
              <PhotoUploader
                onPhotoSelected={handlePhotoSelected}
                defaultCustomerName={state.customerName}
              />
            )}

            {/* Step 2: Theme Selector */}
            {state.currentStep === 'theme' && (
              <ThemeSelector
                selectedThemeId={state.selectedTheme}
                onSelectTheme={handleSelectTheme}
                onNext={() => setState((prev) => ({ ...prev, currentStep: 'gender_age' }))}
                onBack={() => setState((prev) => ({ ...prev, currentStep: 'upload' }))}
              />
            )}

            {/* Step 3: Gender & Age Selector */}
            {state.currentStep === 'gender_age' && (
              <GenderAgeSelector
                selectedThemeId={state.selectedTheme}
                gender={state.gender}
                ageGroup={state.ageGroup}
                selectedStyleId={state.selectedStyleId}
                onSelectGender={handleSelectGender}
                onSelectAgeGroup={(ageGroup) => setState((prev) => ({ ...prev, ageGroup }))}
                onSelectStyleId={(styleId) => setState((prev) => ({ ...prev, selectedStyleId: styleId }))}
                onGenerate={handleGeneratePortrait}
                onBack={() => setState((prev) => ({ ...prev, currentStep: 'theme' }))}
              />
            )}

            {/* Step 4: Processing / Loading Screen */}
            {state.currentStep === 'processing' && (
              <div className="max-w-xl mx-auto text-center py-16 px-4">
                <div className="relative w-28 h-28 mx-auto mb-8">
                  <div className="absolute inset-0 rounded-full border-4 border-amber-400/20 border-t-amber-400 animate-spin" />
                  <div className="absolute inset-2 rounded-full border-4 border-blue-400/20 border-b-blue-400 animate-spin [animation-duration:2s]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
                  </div>
                </div>

                <h3 className="text-2xl font-black text-white tracking-tight mb-2">
                  찬란했던 그 시절의 인생 화보 현상 중...
                </h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed mb-6">
                  얼굴 고유 정체성(60%)을 보존하고, 화사한 스튜디오 3점 조명과 {state.ageGroup} 리바이탈라이징을 정밀하게 조합하고 있습니다.
                </p>

                <div className="p-4 rounded-2xl bg-[#0B1E34] border border-white/10 text-xs text-amber-300 font-semibold inline-block">
                  잠시만 기다려 주시면 5:7 고화질 상업 화보가 곧 완성됩니다.
                </div>
              </div>
            )}

            {/* Step 5: Result Viewer */}
            {state.currentStep === 'result' && state.generatedImage && (
              <ResultViewer
                imageUrl={state.generatedImage}
                themeId={state.selectedTheme}
                styleId={state.selectedStyleId}
                gender={state.gender}
                ageGroup={state.ageGroup}
                todayCount={state.todayCount}
                customerName={state.customerName}
                onRemake={() => setState((prev) => ({ ...prev, currentStep: 'theme' }))}
                onResetToStart={handleResetToStart}
              />
            )}
          </div>
        )}
      </main>

      {/* Operator Modal */}
      <OperatorModal
        isOpen={isOperatorModalOpen}
        onClose={() => {
          setIsOperatorModalOpen(false);
          fetchHealthStatus();
        }}
        todayCount={state.todayCount}
      />
    </div>
  );
};
export default App;
