import React from 'react';
import { AbsoluteFill } from 'remotion';

interface LogoProFinalProps {
  variant?: 'dark' | 'light' | 'transparent';
  showText?: boolean;
  format?: 'square' | 'banner' | 'icon';
  textPosition?: 'bottom' | 'right' | 'none';
}

export const ThunderPortalLogoProFinal: React.FC<LogoProFinalProps> = ({ 
  variant = 'transparent', 
  showText = true,
  format = 'square',
  textPosition = 'bottom'
}) => {
  const bgColor = variant === 'dark' ? '#0A0A0B' : variant === 'light' ? '#FFFFFF' : 'transparent';
  const textColor = variant === 'light' ? '#0A0A0B' : '#FFFFFF';
  
  // Adjust logo size based on format
  const logoSize = format === 'icon' ? 400 : format === 'banner' ? 320 : 360;
  const showTextActual = format === 'icon' ? false : showText;
  
  return (
    <AbsoluteFill
      style={{
        backgroundColor: bgColor,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: format === 'banner' && textPosition === 'right' ? 'row' : 'column',
        gap: format === 'banner' ? 60 : 48,
        padding: format === 'icon' ? 0 : 40,
      }}
    >
      {/* Enhanced Logo Design - Larger and more prominent */}
      <svg
        width={logoSize}
        height={logoSize}
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Subtle background circle for transparent versions */}
        {variant === 'transparent' && (
          <circle
            cx="120"
            cy="120"
            r="110"
            fill="#000000"
            opacity="0.05"
          />
        )}
        
        {/* Background Glow */}
        <circle
          cx="120"
          cy="120"
          r="115"
          fill="url(#backgroundGlow)"
          opacity="0.15"
        />
        
        {/* Portal Energy Field */}
        <g transform="translate(120, 120)">
          {/* Outer energy ring */}
          <circle
            r="95"
            stroke="url(#portalEnergy)"
            strokeWidth="1.5"
            fill="none"
            opacity="0.4"
            strokeDasharray="3 6"
          />
          
          {/* Mid energy ring */}
          <circle
            r="78"
            stroke="url(#portalEnergy)"
            strokeWidth="2.5"
            fill="none"
            opacity="0.6"
          />
          
          {/* Inner portal ring */}
          <circle
            r="60"
            stroke="url(#portalEnergy)"
            strokeWidth="4"
            fill="none"
          />
        </g>
        
        {/* Lightning Portal Fusion - Main Symbol */}
        <g transform="translate(120, 120)">
          {/* Left Portal Arc (Bitcoin side) */}
          <path
            d="M -60 0 Q -60 -72 0 -72 Q 30 -72 42 -42"
            stroke="#F7931A"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Right Portal Arc (Ethereum side) */}
          <path
            d="M 60 0 Q 60 72 0 72 Q -30 72 -42 42"
            stroke="#627EEA"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Lightning Bolt - Larger and more prominent */}
          <g filter="url(#lightningGlow)" transform="scale(1.2)">
            {/* Main lightning path */}
            <path
              d="M 6 -65 L -18 -20 L -6 -20 L -30 25 L -18 25 L -42 70 L 18 -10 L 6 -10 L 30 -65 Z"
              fill="url(#lightningGradient)"
            />
            
            {/* Lightning core (brighter) */}
            <path
              d="M 6 -65 L -12 -25 L -3 -25 L -24 20 L -15 20 L -36 65 L 12 -15 L 3 -15 L 24 -65 Z"
              fill="#FFFFFF"
              opacity="0.8"
            />
          </g>
          
          {/* Energy burst at center */}
          <circle
            cx="0"
            cy="0"
            r="10"
            fill="#FFFFFF"
            filter="url(#centerGlow)"
          />
          
          {/* Atomic connection points */}
          <g>
            {/* Top connection */}
            <circle cx="0" cy="-72" r="5" fill="#00D4FF" />
            <circle cx="0" cy="-72" r="8" stroke="#00D4FF" strokeWidth="1.5" fill="none" opacity="0.6" />
            
            {/* Bottom connection */}
            <circle cx="0" cy="72" r="5" fill="#FF00FF" />
            <circle cx="0" cy="72" r="8" stroke="#FF00FF" strokeWidth="1.5" fill="none" opacity="0.6" />
          </g>
          
          {/* Energy particles for depth */}
          <g opacity="0.6">
            <circle cx="-40" cy="-40" r="2" fill="#00D4FF" />
            <circle cx="40" cy="-40" r="2" fill="#7B61FF" />
            <circle cx="40" cy="40" r="2" fill="#FF00FF" />
            <circle cx="-40" cy="40" r="2" fill="#00D4FF" />
          </g>
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
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#FFE600" floodOpacity="0.7"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <filter id="centerGlow">
            <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
            <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#FFFFFF" floodOpacity="0.9"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>
      
      {/* Professional Typography */}
      {showTextActual && (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: format === 'banner' && textPosition === 'right' ? 'flex-start' : 'center',
          gap: 12
        }}>
          <h1
            style={{
              color: textColor,
              fontSize: format === 'banner' ? 64 : 56,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              fontWeight: 800,
              margin: 0,
              letterSpacing: '-1.5px',
              textTransform: 'uppercase',
            }}
          >
            Thunder Portal
          </h1>
          <p
            style={{
              color: variant === 'transparent' ? '#888888' : variant === 'dark' ? '#666666' : '#999999',
              fontSize: format === 'banner' ? 20 : 18,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              fontWeight: 500,
              margin: 0,
              letterSpacing: '3px',
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