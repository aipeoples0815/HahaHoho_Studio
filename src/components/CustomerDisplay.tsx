import React, { useState } from 'react';
import { Maximize2, Minimize2, Sparkles, Award, ArrowLeft, Beer, Heart } from 'lucide-react';
import { PhotoStudioState } from '../types';
import { RETRO_THEMES, getAgeGroupTitle } from '../constants/themes';
import { HahaHohoLogo } from './HahaHohoLogo';

interface CustomerDisplayProps {
  state: PhotoStudioState;
  onBackToKiosk: () => void;
}

export const CustomerDisplay: React.FC<CustomerDisplayProps> = ({
  state,
  onBackToKiosk,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const selectedTheme = RETRO_THEMES.find((t) => t.id === state.selectedTheme);
  const activeImage = state.finalPrintImage || state.generatedImage;
  const sequenceNumber = String(state.todayCount || 1).padStart(3, '0');

  return (
    <div className="relative min-h-screen bg-[#071324] text-white flex flex-col justify-between overflow-hidden select-none">
      {/* Background Ambience: Deep Festival Ocean with Golden Amber Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[160px]" />
      </div>

      {/* Top Bar for Secondary Monitor */}
      <header className="relative z-20 px-6 py-4 flex items-center justify-between border-b border-white/10 bg-[#0A192F]/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <HahaHohoLogo variant="light" size="md" />
          <div className="h-6 w-px bg-white/20 hidden sm:block" />
          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-bold text-amber-400 tracking-wider">
              2026 바이킹 비어밤 & 하하호호 스튜디오 AI 팀
            </span>
            <span className="text-sm font-semibold text-slate-200">
              고객 전용 대화면 디스플레이
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-all cursor-pointer"
            title="전체 화면 토글"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4 text-amber-400" />
                <span>창 모드</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 text-amber-400" />
                <span>대화면 전체화면</span>
              </>
            )}
          </button>

          <button
            onClick={onBackToKiosk}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>키오스크 조작 모드</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        {activeImage ? (
          <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 animate-in fade-in zoom-in-95 duration-500">
            {/* 5:7 Giant Commercial Print Frame */}
            <div className="relative group">
              {/* Outer Golden Glow Border */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-amber-500/30 via-sky-500/30 to-amber-400/40 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />

              {/* Physical Print Style Card */}
              <div className="relative bg-white p-3 sm:p-5 rounded-2xl shadow-2xl shadow-black/80 border-4 border-amber-400/60 max-w-[420px] sm:max-w-[480px]">
                <img
                  src={activeImage}
                  alt="바이킹 비어밤 완성 화보"
                  className="w-full h-auto object-cover rounded-lg shadow-inner aspect-[5/7]"
                />

                {/* Bottom Photo Stamp Simulation if raw image */}
                {!state.finalPrintImage && (
                  <div className="mt-3 pt-2 border-t border-slate-200 text-center">
                    <p className="text-[11px] font-bold text-slate-700 tracking-wider">
                      2026 바이킹 비어밤 & 하하호호스튜디오
                    </p>
                    <p className="text-[10px] text-slate-500">
                      VIKING BEER NIGHT & HAHAHOHO PHOTO STUDIO
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Side Information Panel for Audience */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-md">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-bold mb-3">
                <Award className="w-4 h-4" />
                <span>제 {sequenceNumber}호 축제 공식 인생 화보</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
                {selectedTheme?.name || '바이킹 비어밤 화보'}
              </h2>

              <p className="text-sm text-sky-200/90 font-medium mb-6 leading-relaxed">
                {selectedTheme?.description || '황금빛 수제 맥주와 함께하는 찬란한 인생의 한 페이지'}
              </p>

              <div className="grid grid-cols-2 gap-3 w-full mb-6">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <span className="text-[11px] text-slate-400 block mb-0.5">선택 스타일</span>
                  <span className="text-sm font-bold text-white">
                    {state.gender === 'male' ? '남성 화보 스타일' : '여성 화보 스타일'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <span className="text-[11px] text-slate-400 block mb-0.5">리바이탈라이징</span>
                  <span className="text-sm font-bold text-amber-300">
                    {getAgeGroupTitle(state.ageGroup).title}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/40 to-slate-800/40 border border-blue-500/30 text-xs text-slate-300 leading-relaxed w-full">
                <div className="flex items-center gap-1.5 font-bold text-amber-300 mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>현장 즉석 인화 완료</span>
                </div>
                사진은 부스 운영 데스크에서 즉시 5:7 고화질 인화지로 수령하실 수 있습니다.
              </div>
            </div>
          </div>
        ) : (
          /* Standby Display when no photo is active */
          <div className="text-center max-w-xl px-4 py-12 flex flex-col items-center">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 to-blue-600 p-1 flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-6 animate-pulse">
              <div className="w-full h-full bg-[#071324] rounded-[22px] flex items-center justify-center">
                <Beer className="w-12 h-12 text-amber-400" />
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/30 text-xs font-bold mb-4">
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              <span>하하호호스튜디오 X 바이킹 비어밤</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
              인생 화보 즉석 인화소
            </h1>

            <p className="text-base sm:text-lg text-sky-200/90 font-medium leading-relaxed max-w-md mb-8">
              키오스크에서 촬영 및 테마를 선택해 주시면, 완성된 초고화질 상업 화보가 이곳 대화면으로 송출됩니다.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {RETRO_THEMES.map((theme) => (
                <div
                  key={theme.id}
                  className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>{theme.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Footer Info */}
      <footer className="relative z-10 px-6 py-3 border-t border-white/10 bg-[#0A192F]/60 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
        <div>
          <span>2026 부산 수제맥주 마스터스 챌린지 · </span>
          <span className="text-amber-400 font-semibold">바이킹 비어밤 & 반여시장 레트로 페스타</span>
        </div>
        <div className="flex items-center gap-2 mt-1 sm:mt-0">
          <span>제작 & 운영 : 하하호호스튜디오</span>
          <span>·</span>
          <span>5:7 초고화질 즉석 인화</span>
        </div>
      </footer>
    </div>
  );
};
