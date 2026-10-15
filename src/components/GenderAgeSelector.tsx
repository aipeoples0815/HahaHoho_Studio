import React from 'react';
import { Sparkles, User, Check, ArrowRight, ArrowLeft, Wand2, ShieldCheck, Heart } from 'lucide-react';
import { Gender, AgeGroup } from '../types';
import { RETRO_THEMES, getAgeGroupTitle } from '../constants/themes';

interface GenderAgeSelectorProps {
  selectedThemeId: string;
  gender: Gender;
  ageGroup: AgeGroup;
  selectedStyleId?: string;
  onSelectGender: (gender: Gender) => void;
  onSelectAgeGroup: (ageGroup: AgeGroup) => void;
  onSelectStyleId: (styleId: string) => void;
  onGenerate: () => void;
  onBack: () => void;
}

export const GenderAgeSelector: React.FC<GenderAgeSelectorProps> = ({
  selectedThemeId,
  gender,
  ageGroup,
  selectedStyleId,
  onSelectGender,
  onSelectAgeGroup,
  onSelectStyleId,
  onGenerate,
  onBack,
}) => {
  const currentTheme = RETRO_THEMES.find((t) => t.id === selectedThemeId) || RETRO_THEMES[0];
  const availableStyles = currentTheme.styles.filter((s) => s.gender === gender);

  const ageOptions: AgeGroup[] = ['20대', '30대', '40대'];

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>STEP 3 · 성별 & 연령 & 세부 스타일 지정</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
          {currentTheme.name}
        </h2>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          선택하신 테마에 맞추어 성별 스타일과 정밀 리바이탈라이징 연령대를 지정합니다.
        </p>
      </div>

      <div className="space-y-8 mb-8">
        {/* Section 1: Gender Selection */}
        <div className="bg-[#0B1E34]/80 backdrop-blur-md rounded-3xl border border-white/10 p-6">
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>1. 연출 성별 선택</span>
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => {
                onSelectGender('female');
                const firstStyle = currentTheme.styles.find((s) => s.gender === 'female');
                if (firstStyle) onSelectStyleId(firstStyle.id);
              }}
              className={`p-4 rounded-2xl border-2 font-bold text-base transition-all flex flex-col items-center gap-2 ${
                gender === 'female'
                  ? 'bg-gradient-to-br from-rose-500/20 to-amber-500/10 border-rose-400 text-white shadow-lg shadow-rose-500/20'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/30'
              }`}
            >
              <span className="text-2xl">👩</span>
              <span>여성 스타일</span>
            </button>

            <button
              onClick={() => {
                onSelectGender('male');
                const firstStyle = currentTheme.styles.find((s) => s.gender === 'male');
                if (firstStyle) onSelectStyleId(firstStyle.id);
              }}
              className={`p-4 rounded-2xl border-2 font-bold text-base transition-all flex flex-col items-center gap-2 ${
                gender === 'male'
                  ? 'bg-gradient-to-br from-blue-500/20 to-amber-500/10 border-blue-400 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/30'
              }`}
            >
              <span className="text-2xl">👨</span>
              <span>남성 스타일</span>
            </button>
          </div>
        </div>

        {/* Section 2: Sub-style options within theme */}
        {availableStyles.length > 0 && (
          <div className="bg-[#0B1E34]/80 backdrop-blur-md rounded-3xl border border-white/10 p-6">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>2. 세부 의상 및 분위기 연출 (단일 선택)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {availableStyles.map((style) => {
                const isSelected = selectedStyleId === style.id;
                return (
                  <div
                    key={style.id}
                    onClick={() => onSelectStyleId(style.id)}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gradient-to-br from-[#1B365D] to-[#0E2038] border-amber-400 shadow-md shadow-amber-500/20 scale-[1.01]'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-bold text-white">{style.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-amber-400 stroke-[3]" />}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {style.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 3: Exact 3 Age Group Rejuvenation Options */}
        <div className="bg-[#0B1E34]/80 backdrop-blur-md rounded-3xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              <span>3. 연령대별 정밀 리바이탈라이징 (유아화 금지)</span>
            </h3>
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              얼굴 정체성 60% 보존
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ageOptions.map((opt) => {
              const isSelected = ageGroup === opt;
              const info = getAgeGroupTitle(opt);
              return (
                <div
                  key={opt}
                  onClick={() => onSelectAgeGroup(opt)}
                  className={`cursor-pointer p-5 rounded-2xl border-2 transition-all relative overflow-hidden ${
                    isSelected
                      ? 'bg-gradient-to-br from-amber-500/20 via-[#162E4E] to-[#0A1A2F] border-amber-400 shadow-xl shadow-amber-500/20 scale-[1.02]'
                      : 'bg-white/5 border-white/10 hover:border-white/25 hover:bg-white/[0.08]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-black text-white">{info.title}</span>
                    {isSelected ? (
                      <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs">
                        ✓
                      </span>
                    ) : (
                      <span className="w-6 h-6 rounded-full border border-white/20 text-transparent">
                        ○
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-amber-300 mb-2">
                    {info.subtitle}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {info.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm font-bold transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>테마 다시 선택</span>
        </button>

        <button
          onClick={onGenerate}
          className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black text-base shadow-xl shadow-amber-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          <span>🎨 AI 인생 화보 현상 시작하기</span>
        </button>
      </div>
    </div>
  );
};
