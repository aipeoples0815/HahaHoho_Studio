import React from 'react';
import { Sparkles, Film, Beer, Crown, Shield, Camera, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { RETRO_THEMES } from '../constants/themes';
import { RetroTheme } from '../types';

interface ThemeSelectorProps {
  selectedThemeId: string;
  onSelectTheme: (themeId: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  selectedThemeId,
  onSelectTheme,
  onNext,
  onBack,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Film':
        return <Film className="w-6 h-6" />;
      case 'Beer':
        return <Beer className="w-6 h-6" />;
      case 'Crown':
        return <Crown className="w-6 h-6" />;
      case 'Shield':
        return <Shield className="w-6 h-6" />;
      case 'Camera':
      default:
        return <Camera className="w-6 h-6" />;
    }
  };

  const currentTheme = RETRO_THEMES.find((t) => t.id === selectedThemeId) || RETRO_THEMES[0];

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      {/* Title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>STEP 2 · 5대 마스터 테마 선택</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
          어떤 시절의 주인공이 되어볼까요?
        </h2>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          2026 반여시장 레트로 페스타 & 바이킹 비어밤 공식 테마 5종 중 원하시는 스타일을 선택해 주세요.
        </p>
      </div>

      {/* Themes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {RETRO_THEMES.map((theme) => {
          const isSelected = theme.id === selectedThemeId;
          return (
            <div
              key={theme.id}
              onClick={() => onSelectTheme(theme.id)}
              className={`cursor-pointer rounded-3xl p-5 border-2 transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-br from-[#122B48] to-[#0A1A2F] border-amber-400 shadow-xl shadow-amber-500/20 scale-[1.02]'
                  : 'bg-[#0B1E34]/60 border-white/10 hover:border-white/30 hover:bg-[#0D2540]'
              }`}
            >
              {/* Active Indicator Pin */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center shadow-md">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              )}

              <div>
                {/* Header: Theme Number & Badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-300 font-black text-xs flex items-center justify-center">
                    {theme.themeNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-slate-300">
                    {theme.badge}
                  </span>
                </div>

                {/* Theme Title */}
                <h3 className="text-lg font-black text-white mb-1.5 leading-snug">
                  {theme.name}
                </h3>
                <p className="text-xs font-semibold text-amber-400/90 mb-3">
                  {theme.subtitle}
                </p>

                {/* Theme Description */}
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-4">
                  {theme.description}
                </p>
              </div>

              {/* Bottom Icon Bar */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2 text-amber-400">
                  {getIcon(theme.iconName)}
                  <span className="font-bold text-white text-[11px]">
                    {theme.styles.length}개 세부 연출 옵션
                  </span>
                </div>
                <span className={`text-[11px] font-bold ${isSelected ? 'text-amber-400' : 'text-slate-500'}`}>
                  {isSelected ? '선택됨' : '선택하기'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm font-bold transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>사진 다시 고르기</span>
        </button>

        <button
          onClick={onNext}
          className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
        >
          <span>성별 & 연령 선택으로 이동</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
