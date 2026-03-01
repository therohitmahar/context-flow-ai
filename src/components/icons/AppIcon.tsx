import React from 'react';

interface AppIconProps {
  size?: number | string;
  className?: string;
}

export const AppIcon: React.FC<AppIconProps> = ({ size = 18, className = '' }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={className}>
      <rect x="1" y="4" width="5" height="6" rx="1" fill="currentColor" fillOpacity="0.9"/>
      <rect x="8" y="2" width="5" height="4" rx="1" fill="currentColor" fillOpacity="0.6"/>
      <rect x="8" y="8" width="5" height="4" rx="1" fill="currentColor" fillOpacity="0.6"/>
      <line x1="6" y1="7" x2="8" y2="4.5" stroke="currentColor" strokeOpacity="0.7" strokeWidth="1"/>
      <line x1="6" y1="7" x2="8" y2="9.5" stroke="currentColor" strokeOpacity="0.7" strokeWidth="1"/>
    </svg>
  );
};
