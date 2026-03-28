import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Logo Auto Discount - Style AUTO-DISCOUNT.fr
 * - Silhouette voiture orange
 * - AUTO-DISCOUNT avec O orange
 * - .fr en exposant blanc
 * - LOCATION en orange
 */
const CarIcon = ({ className = 'w-8 h-8' }) => (
  <svg viewBox="0 0 48 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 14h40M6 14v4a2 2 0 002 2h32a2 2 0 002-2v-4" />
    <path d="M8 14l2-6h28l2 6" />
    <circle cx="14" cy="18" r="2" fill="currentColor" />
    <circle cx="34" cy="18" r="2" fill="currentColor" />
    <path d="M16 12h16" />
  </svg>
);

const Logo = ({ variant = 'dark', size = 'md', link = true, className = '' }) => {
  const isLight = variant === 'light';
  const textColor = isLight ? 'text-white' : 'text-[#332859]';
  const orangeColor = 'text-[#F9A826]';

  const sizes = {
    sm: { main: 'text-base', sub: 'text-[10px]', icon: 'w-6 h-6' },
    md: { main: 'text-lg', sub: 'text-xs', icon: 'w-8 h-8' },
    lg: { main: 'text-xl', sub: 'text-sm', icon: 'w-10 h-10' },
  };

  const s = sizes[size] || sizes.md;

  const content = (
    <div className={`flex flex-col items-center gap-0 ${className}`}>
      <span className={orangeColor}>
        <CarIcon className={`${s.icon} flex-shrink-0`} />
      </span>
      <div className={`font-bold uppercase tracking-tight ${s.main} ${textColor} leading-tight`}>
        <span>AUT</span>
        <span className={orangeColor}>O</span>
        <span>-DISC</span>
        <span className={orangeColor}>O</span>
        <span>UNT</span>
        <span className={`${textColor} align-super ${s.sub} font-normal`}>.fr</span>
      </div>
      <div className={`${s.sub} font-semibold uppercase tracking-wider ${orangeColor}`}>
        LOCATION
      </div>
    </div>
  );

  if (link) {
    return (
      <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
};

/**
 * Logo horizontal compact pour navbar (icône + texte sur une ligne)
 */
export const LogoCompact = ({ variant = 'dark', className = '' }) => {
  const isLight = variant === 'light';
  const textColor = isLight ? 'text-white' : 'text-[#332859]';
  const orangeColor = 'text-[#F9A826]';

  const content = (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className={orangeColor}>
        <CarIcon className="w-9 h-9 flex-shrink-0" />
      </span>
      <div className="flex flex-col leading-tight">
        <span className={`font-bold text-base uppercase tracking-tight ${textColor}`}>
          AUT<span className={orangeColor}>O</span>-DISC<span className={orangeColor}>O</span>UNT
          <span className={`${textColor} align-super text-[10px] font-normal`}>.fr</span>
        </span>
        <span className={`text-[10px] font-semibold uppercase tracking-wider ${orangeColor}`}>
          LOCATION
        </span>
      </div>
    </div>
  );

  return (
    <Link to="/" className={`flex items-center hover:opacity-90 transition-opacity ${className}`}>
      {content}
    </Link>
  );
};

export default Logo;
