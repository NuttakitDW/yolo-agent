import React from 'react';
import { AbsoluteFill } from 'remotion';

interface LogoUltimateProps {
  showText?: boolean;
  variant?: 'color' | 'mono';
}

export const ThunderPortalLogoUltimate: React.FC<LogoUltimateProps> = ({ 
  showText = true,
  variant = 'color'
}) => {
  const isColor = variant === 'color';
  
  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#000',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: showText ? 40 : 0,
        padding: 40,
      }}
    >
      {/* Main Logo */}
      <div style={{ position: 'relative', width: 320, height: 320 }}>
        <svg
          width="320"
          height="320"
          viewBox="0 0 240 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          {/* Background subtle grid */}
          <g opacity="0.03">
            {[...Array(9)].map((_, i) => (
              <React.Fragment key={i}>
                <line 
                  x1={0} 
                  y1={30 + i * 20} 
                  x2={240} 
                  y2={30 + i * 20} 
                  stroke="#FFFFFF" 
                  strokeWidth="0.5" 
                />
                <line 
                  x1={30 + i * 20} 
                  y1={0} 
                  x2={30 + i * 20} 
                  y2={240} 
                  stroke="#FFFFFF" 
                  strokeWidth="0.5" 
                />
              </React.Fragment>
            ))}
          </g>
          
          {/* Main composition */}
          <g transform="translate(120, 120)">
            {/* Portal effect - using golden ratio */}
            <g opacity="0.15">
              <circle r="89" stroke="#FFFFFF" strokeWidth="0.5" fill="none" />
              <circle r="55" stroke="#FFFFFF" strokeWidth="0.5" fill="none" />
              <circle r="34" stroke="#FFFFFF" strokeWidth="0.5" fill="none" />
            </g>
            
            {/* Abstract portal shape - two interlocking crescents */}
            <g>
              {/* Left crescent (Bitcoin representation) */}
              <path
                d="M -40 -40 Q -60 0 -40 40 Q -20 20 0 0 Q -20 -20 -40 -40 Z"
                fill={isColor ? "url(#bitcoinGradient)" : "#FFFFFF"}
                opacity={isColor ? 1 : 0.9}
              />
              
              {/* Right crescent (Ethereum representation) */}
              <path
                d="M 40 40 Q 60 0 40 -40 Q 20 -20 0 0 Q 20 20 40 40 Z"
                fill={isColor ? "url(#ethereumGradient)" : "#FFFFFF"}
                opacity={isColor ? 1 : 0.7}
              />
              
              {/* Central lightning bolt - highly stylized */}
              <g filter="url(#lightningFilter)">
                <path
                  d="M 0 -50 L -15 -10 L -5 -10 L -20 30 L -10 30 L -25 70 L 15 10 L 5 10 L 20 -30 L 10 -30 Z"
                  fill={isColor ? "url(#lightningGradient2)" : "#FFFFFF"}
                  transform="scale(0.8)"
                />
                
                {/* Lightning core */}
                <path
                  d="M 0 -40 L -10 -8 L -3 -8 L -15 24 L -8 24 L -20 56 L 10 8 L 3 8 L 15 -24 L 8 -24 Z"
                  fill="#FFFFFF"
                  opacity="0.8"
                  transform="scale(0.8)"
                />
              </g>
              
              {/* Intersection glow */}
              <circle
                cx="0"
                cy="0"
                r="12"
                fill={isColor ? "url(#centerGradient)" : "#FFFFFF"}
                filter="url(#glowFilter)"
                opacity="0.9"
              />
            </g>
            
            {/* Orbital elements */}
            <g opacity="0.3">
              {/* Top orbit */}
              <circle cx="0" cy="-55" r="3" fill="#00D4FF" />
              <path
                d="M -55 0 Q -55 -55 0 -55 Q 55 -55 55 0"
                stroke="#00D4FF"
                strokeWidth="1"
                fill="none"
                strokeDasharray="2 4"
              />
              
              {/* Bottom orbit */}
              <circle cx="0" cy="55" r="3" fill="#FF00FF" />
              <path
                d="M 55 0 Q 55 55 0 55 Q -55 55 -55 0"
                stroke="#FF00FF"
                strokeWidth="1"
                fill="none"
                strokeDasharray="2 4"
              />
            </g>
          </g>
          
          {/* Advanced gradients */}
          <defs>
            {/* Bitcoin gradient */}
            <radialGradient id="bitcoinGradient">
              <stop offset="0%" stopColor="#FFB84D" />
              <stop offset="100%" stopColor="#F7931A" />
            </radialGradient>
            
            {/* Ethereum gradient */}
            <radialGradient id="ethereumGradient">
              <stop offset="0%" stopColor="#8FA7FF" />
              <stop offset="100%" stopColor="#627EEA" />
            </radialGradient>
            
            {/* Lightning gradient - more vibrant */}
            <linearGradient id="lightningGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFF700" />
              <stop offset="40%" stopColor="#FFD700" />
              <stop offset="70%" stopColor="#FFA500" />
              <stop offset="100%" stopColor="#FF6B00" />
            </linearGradient>
            
            {/* Center gradient */}
            <radialGradient id="centerGradient">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#FFE57F" />
              <stop offset="100%" stopColor="#FF9500" />
            </radialGradient>
            
            {/* Filters */}
            <filter id="lightningFilter">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
              <feComponentTransfer>
                <feFuncA type="discrete" tableValues="0 .5 .5 .5 .5 .5 1 1" />
              </feComponentTransfer>
              <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#FFD700" floodOpacity="0.5"/>
            </filter>
            
            <filter id="glowFilter">
              <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
        </svg>
      </div>
      
      {/* Modern Typography */}
      {showText && (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          gap: 12,
        }}>
          <h1
            style={{
              color: '#FFFFFF',
              fontSize: 56,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              fontWeight: 800,
              margin: 0,
              letterSpacing: '-2px',
              background: isColor ? 'linear-gradient(135deg, #FFD700 0%, #FF6B00 100%)' : '#FFFFFF',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: isColor ? 'transparent' : '#FFFFFF',
            }}
          >
            THUNDER PORTAL
          </h1>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            opacity: 0.7,
          }}>
            <span style={{
              color: '#666',
              fontSize: 18,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontWeight: 500,
              letterSpacing: '3px',
            }}>
              ATOMIC
            </span>
            <span style={{
              color: '#FFD700',
              fontSize: 20,
            }}>
              ⚡
            </span>
            <span style={{
              color: '#666',
              fontSize: 18,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontWeight: 500,
              letterSpacing: '3px',
            }}>
              SWAPS
            </span>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};