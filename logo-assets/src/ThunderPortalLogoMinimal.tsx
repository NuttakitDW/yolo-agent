import React from 'react';
import { AbsoluteFill } from 'remotion';

interface LogoMinimalProps {
  variant?: 'dark' | 'light' | 'gradient';
  size?: number;
}

export const ThunderPortalLogoMinimal: React.FC<LogoMinimalProps> = ({ 
  variant = 'dark',
  size = 300
}) => {
  const bgColor = variant === 'dark' ? '#000000' : variant === 'light' ? '#FFFFFF' : 'transparent';
  const primaryColor = variant === 'light' ? '#000000' : '#FFFFFF';
  
  return (
    <AbsoluteFill
      style={{
        backgroundColor: bgColor,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Gradient background for gradient variant */}
        {variant === 'gradient' && (
          <rect width="120" height="120" fill="url(#bgGradient)" />
        )}
        
        {/* Main Logo Mark - Geometric Lightning Portal */}
        <g transform="translate(60, 60)">
          {/* Portal Frame - Hexagonal */}
          <g>
            {/* Outer hexagon */}
            <path
              d="M 30 0 L 15 26 L -15 26 L -30 0 L -15 -26 L 15 -26 Z"
              stroke={primaryColor}
              strokeWidth="2"
              fill="none"
              opacity="0.3"
            />
            
            {/* Inner hexagon */}
            <path
              d="M 20 0 L 10 17.3 L -10 17.3 L -20 0 L -10 -17.3 L 10 -17.3 Z"
              stroke={primaryColor}
              strokeWidth="2"
              fill="none"
              opacity="0.6"
            />
          </g>
          
          {/* Lightning Symbol - Abstract and Geometric */}
          <g>
            {/* Main lightning path */}
            <path
              d="M 0 -35 L -12 -8 L -4 -8 L -16 18 L -8 18 L -20 45 L 12 5 L 4 5 L 16 -22 L 8 -22 Z"
              fill="url(#thunderGradient)"
            />
            
            {/* Lightning core highlight */}
            <path
              d="M 0 -35 L -8 -12 L -2 -12 L -12 12 L -6 12 L -16 38 L 8 2 L 2 2 L 12 -25 L 6 -25 Z"
              fill={primaryColor}
              opacity="0.9"
            />
          </g>
          
          {/* Atomic Swap Indicators - Minimal */}
          <g>
            {/* Left dot (Bitcoin) */}
            <circle cx="-25" cy="0" r="3" fill="#F7931A" opacity="0.8" />
            
            {/* Right dot (Ethereum) */}
            <circle cx="25" cy="0" r="3" fill="#627EEA" opacity="0.8" />
            
            {/* Connection lines */}
            <path
              d="M -22 0 Q 0 -8 22 0"
              stroke={primaryColor}
              strokeWidth="1"
              fill="none"
              opacity="0.2"
            />
            <path
              d="M 22 0 Q 0 8 -22 0"
              stroke={primaryColor}
              strokeWidth="1"
              fill="none"
              opacity="0.2"
            />
          </g>
          
          {/* Energy particles */}
          <g opacity="0.4">
            <circle cx="-15" cy="-20" r="1" fill={primaryColor} />
            <circle cx="18" cy="-15" r="1" fill={primaryColor} />
            <circle cx="20" cy="18" r="1" fill={primaryColor} />
            <circle cx="-18" cy="20" r="1" fill={primaryColor} />
          </g>
        </g>
        
        {/* Gradients */}
        <defs>
          {/* Background gradient for gradient variant */}
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a1a2e" />
            <stop offset="100%" stopColor="#0f0f23" />
          </linearGradient>
          
          {/* Thunder gradient - more sophisticated */}
          <linearGradient id="thunderGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="50%" stopColor="#FFA500" />
            <stop offset="100%" stopColor="#FF6B35" />
          </linearGradient>
        </defs>
      </svg>
    </AbsoluteFill>
  );
};