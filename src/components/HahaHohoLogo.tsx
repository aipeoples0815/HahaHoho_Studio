import React from 'react';

interface HahaHohoLogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'badge';
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const HahaHohoLogo: React.FC<HahaHohoLogoProps> = ({
  className = '',
  variant = 'light',
  size = 'md',
  showSubtitle = true,
}) => {
  const isLight = variant === 'light';

  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const subTextSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Icon: Cheerful Studio Camera with Heart Lens & Smile */}
      <div
        className={`${iconSizes[size]} relative flex items-center justify-center rounded-2xl ${
          isLight
            ? 'bg-gradient-to-br from-[#EC4899] via-[#F43F5E] to-[#F59E0B] shadow-md shadow-[#EC4899]/20'
            : 'bg-gradient-to-br from-[#1E3A8A] to-[#0F2C59] text-white shadow-md'
        } p-1.5`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full text-white"
        >
          {/* Camera body */}
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
          {/* Heart inside lens */}
          <path
            d="M12 11.5c-.8-1-2-.9-2.5 0-.5 1 0 2 2.5 3.5 2.5-1.5 3-2.5 2.5-3.5-.5-.9-1.7-1-2.5 0z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col leading-tight">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-black tracking-tight ${textSizes[size]} ${
              isLight ? 'text-white' : 'text-[#0F2C59]'
            }`}
          >
            하하호호스튜디오
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F59E0B] text-[#0A192F] uppercase tracking-wider">
            공식
          </span>
        </div>
        {showSubtitle && (
          <span
            className={`font-semibold tracking-wider uppercase ${subTextSizes[size]} ${
              isLight ? 'text-sky-200/90' : 'text-slate-500'
            }`}
          >
            HAHAHOHO PHOTO STUDIO
          </span>
        )}
      </div>
    </div>
  );
};
