import React from 'react';

interface SlentizyLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const SlentizyLogo: React.FC<SlentizyLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* 3D Purple Ribbon S Emblem with Center Play Triangle */}
      <div
        className={`relative ${iconSizes[size]} shrink-0 rounded-2xl bg-[#09090b] p-1 border border-purple-500/20 shadow-lg shadow-purple-950/40 flex items-center justify-center overflow-hidden group-hover:scale-105 group-hover:border-purple-500/40 transition-all duration-300`}
      >
        {/* Subtle internal atmospheric purple radial glow */}
        <div className="absolute inset-0 bg-radial from-purple-600/30 via-transparent to-transparent pointer-events-none" />

        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_2px_8px_rgba(168,85,247,0.35)]"
        >
          <defs>
            <linearGradient id="logoTopFold" x1="20%" y1="10%" x2="85%" y2="80%">
              <stop offset="0%" stopColor="#d8b4fe" />
              <stop offset="40%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#6b21a8" />
            </linearGradient>
            <linearGradient id="logoBottomFold" x1="15%" y1="20%" x2="85%" y2="90%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="50%" stopColor="#7e22ce" />
              <stop offset="100%" stopColor="#3b0764" />
            </linearGradient>
            <linearGradient id="logoPlayTriangle" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f3e8ff" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
          </defs>

          {/* Upper loop of S */}
          <path
            d="M62 20 C76 20 84 30 78 40 C73 48 57 52 44 54 C34 55 30 50 32 43 C35 34 50 27 62 20 Z"
            fill="url(#logoTopFold)"
          />
          <path
            d="M38 28 C48 19 69 18 78 28 C83 33 81 40 73 45 C62 51 46 51 38 46 C32 41 33 33 38 28 Z"
            fill="url(#logoTopFold)"
            opacity="0.9"
          />

          {/* Lower loop of S */}
          <path
            d="M38 80 C24 80 16 70 22 60 C27 52 43 48 56 46 C66 45 70 50 68 57 C65 66 50 73 38 80 Z"
            fill="url(#logoBottomFold)"
          />
          <path
            d="M62 72 C52 81 31 82 22 72 C17 67 19 60 27 55 C38 49 54 49 62 54 C68 59 67 67 62 72 Z"
            fill="url(#logoBottomFold)"
            opacity="0.95"
          />

          {/* Center Play Button Triangle (▶) */}
          <polygon
            points="46,39 46,61 64,50"
            fill="url(#logoPlayTriangle)"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Brand Wordmark: "slentiz" in white, "y" in purple */}
      {showText && (
        <div className="flex items-center tracking-tight font-sans">
          <span className={`font-bold text-white lowercase ${textSizes[size]}`}>
            slentiz
          </span>
          <span className={`font-extrabold text-[#a855f7] lowercase ${textSizes[size]}`}>
            y
          </span>
        </div>
      )}
    </div>
  );
};
