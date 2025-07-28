import React from 'react';
import { AbsoluteFill } from 'remotion';

interface LogoProProps {
  variant?: 'dark' | 'light';
  showText?: boolean;
}

export const ThunderPortalLogoPro: React.FC<LogoProProps> = ({ 
  variant = 'dark', 
  showText = true 
}) => {
  const bgColor = variant === 'dark' ? '#0A0A0B' : '#FFFFFF';
  const textColor = variant === 'dark' ? '#FFFFFF' : '#0A0A0B';
  
  return (
    <AbsoluteFill
      style={{
        backgroundColor: bgColor,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: showText ? 48 : 0,
      }}
    >
      {/* Enhanced Logo Design */}
      <svg
        width={showText ? 280 : 400}
        height={showText ? 280 : 400}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background Glow */}
        <circle
          cx="100"
          cy="100"
          r="95"
          fill="url(#backgroundGlow)"
          opacity="0.1"
        />
        
        {/* Portal Energy Field */}
        <g transform="translate(100, 100)">
          {/* Outer energy ring */}
          <circle
            r="80"
            stroke="url(#portalEnergy)"
            strokeWidth="1"
            fill="none"
            opacity="0.3"
            strokeDasharray="2 4"
          />
          
          {/* Mid energy ring */}
          <circle
            r="65"
            stroke="url(#portalEnergy)"
            strokeWidth="2"
            fill="none"
            opacity="0.5"
          />
          
          {/* Inner portal ring */}
          <circle
            r="50"
            stroke="url(#portalEnergy)"
            strokeWidth="3"
            fill="none"
          />
        </g>
        
        {/* Lightning Portal Fusion - Main Symbol */}
        <g transform="translate(100, 100)">
          {/* Left Portal Arc (Bitcoin side) */}
          <path
            d="M -50 0 Q -50 -60 0 -60 Q 25 -60 35 -35"
            stroke="#F7931A"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Right Portal Arc (Ethereum side) */}
          <path
            d="M 50 0 Q 50 60 0 60 Q -25 60 -35 35"
            stroke="#627EEA"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Lightning Bolt - Redesigned */}
          <g filter="url(#lightningGlow)">
            {/* Main lightning path */}
            <path
              d="M 5 -65 L -15 -20 L -5 -20 L -25 25 L -15 25 L -35 70 L 15 -10 L 5 -10 L 25 -65 Z"
              fill="url(#lightningGradient)"
            />
            
            {/* Lightning core (brighter) */}
            <path
              d="M 5 -65 L -10 -25 L -2 -25 L -20 20 L -12 20 L -30 65 L 10 -15 L 2 -15 L 20 -65 Z"
              fill="#FFFFFF"
              opacity="0.7"
            />
          </g>
          
          {/* Energy burst at center */}
          <circle
            cx="0"
            cy="0"
            r="8"
            fill="#FFFFFF"
            filter="url(#centerGlow)"
          />
          
          {/* Atomic connection points */}
          <g>
            {/* Top connection */}
            <circle cx="0" cy="-60" r="4" fill="#00D4FF" />
            <circle cx="0" cy="-60" r="6" stroke="#00D4FF" strokeWidth="1" fill="none" opacity="0.5" />
            
            {/* Bottom connection */}
            <circle cx="0" cy="60" r="4" fill="#FF00FF" />
            <circle cx="0" cy="60" r="6" stroke="#FF00FF" strokeWidth="1" fill="none" opacity="0.5" />
          </g>
        </g>
        
        {/* Subtle grid lines for tech feel */}
        <g opacity="0.05">
          <line x1="0" y1="100" x2="200" y2="100" stroke={textColor} strokeWidth="0.5" />
          <line x1="100" y1="0" x2="100" y2="200" stroke={textColor} strokeWidth="0.5" />
          <circle cx="100" cy="100" r="40" stroke={textColor} strokeWidth="0.5" fill="none" />
        </g>
        
        {/* Gradients and Filters */}
        <defs>
          {/* Background radial glow */}
          <radialGradient id="backgroundGlow">
            <stop offset="0%" stopColor="#7B61FF" />
            <stop offset="100%" stopColor="#00D4FF" stopOpacity="0" />
          </radialGradient>
          
          {/* Portal energy gradient */}
          <linearGradient id="portalEnergy" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00D4FF" />
            <stop offset="33%" stopColor="#7B61FF" />
            <stop offset="66%" stopColor="#FF00FF" />
            <stop offset="100%" stopColor="#00D4FF" />
          </linearGradient>
          
          {/* Enhanced lightning gradient */}
          <linearGradient id="lightningGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFE600" />
            <stop offset="50%" stopColor="#FFC700" />
            <stop offset="100%" stopColor="#FF9500" />
          </linearGradient>
          
          {/* Glow effects */}
          <filter id="lightningGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#FFE600" floodOpacity="0.6"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <filter id="centerGlow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#FFFFFF" floodOpacity="0.8"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>
      
      {/* Professional Typography */}
      {showText && (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          gap: 8
        }}>
          <h1
            style={{
              color: textColor,
              fontSize: 48,
              fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
              fontWeight: 700,
              margin: 0,
              letterSpacing: '-1px',
              textTransform: 'uppercase',
            }}
          >
            Thunder Portal
          </h1>
          <p
            style={{
              color: variant === 'dark' ? '#666666' : '#888888',
              fontSize: 16,
              fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
              fontWeight: 400,
              margin: 0,
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            Atomic Swaps Protocol
          </p>
        </div>
      )}
    </AbsoluteFill>
  );
};