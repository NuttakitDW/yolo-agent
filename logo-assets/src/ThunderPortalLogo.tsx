import React from 'react';
import { AbsoluteFill } from 'remotion';

interface LogoProps {
  banner?: boolean;
}

export const ThunderPortalLogo: React.FC<LogoProps> = ({ banner = false }) => {
  const size = banner ? 300 : 400;
  
  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0A0A0B',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: banner ? 'row' : 'column',
        gap: banner ? 60 : 40,
      }}
    >
      {/* Lightning Bolt Portal Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Portal Background Circle */}
        <circle
          cx="100"
          cy="100"
          r="90"
          stroke="url(#portalGradient)"
          strokeWidth="4"
          fill="none"
          opacity="0.3"
        />
        
        {/* Inner Portal Ring */}
        <circle
          cx="100"
          cy="100"
          r="70"
          stroke="url(#portalGradient)"
          strokeWidth="2"
          fill="none"
          opacity="0.5"
        />
        
        {/* Lightning Bolt */}
        <path
          d="M120 40 L85 90 L105 90 L80 160 L115 110 L95 110 Z"
          fill="url(#lightningGradient)"
          filter="url(#glow)"
        />
        
        {/* Bitcoin Symbol (Left) */}
        <text
          x="30"
          y="110"
          fontSize="40"
          fill="#F7931A"
          fontFamily="Arial, sans-serif"
          fontWeight="bold"
          opacity="0.8"
        >
          ₿
        </text>
        
        {/* Ethereum Symbol (Right) */}
        <text
          x="145"
          y="110"
          fontSize="35"
          fill="#627EEA"
          fontFamily="Arial, sans-serif"
          fontWeight="bold"
          opacity="0.8"
        >
          Ξ
        </text>
        
        {/* Atomic Swap Arrows */}
        <path
          d="M60 100 Q100 80 140 100"
          stroke="#00D4FF"
          strokeWidth="2"
          fill="none"
          opacity="0.6"
          strokeDasharray="5,5"
        />
        <path
          d="M140 100 Q100 120 60 100"
          stroke="#FF00FF"
          strokeWidth="2"
          fill="none"
          opacity="0.6"
          strokeDasharray="5,5"
        />
        
        {/* Gradients */}
        <defs>
          <linearGradient id="lightningGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE600" />
            <stop offset="50%" stopColor="#FFC700" />
            <stop offset="100%" stopColor="#FF9500" />
          </linearGradient>
          
          <linearGradient id="portalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00D4FF" />
            <stop offset="50%" stopColor="#7B61FF" />
            <stop offset="100%" stopColor="#FF00FF" />
          </linearGradient>
          
          {/* Glow Effect */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>
      
      {/* Text */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: banner ? 'flex-start' : 'center',
        gap: 10 
      }}>
        <h1
          style={{
            color: '#FFFFFF',
            fontSize: banner ? 80 : 60,
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold',
            margin: 0,
            background: 'linear-gradient(135deg, #FFE600 0%, #FF9500 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-2px',
          }}
        >
          Thunder Portal
        </h1>
        <p
          style={{
            color: '#888888',
            fontSize: banner ? 24 : 20,
            fontFamily: 'Arial, sans-serif',
            margin: 0,
            letterSpacing: '1px',
          }}
        >
          Atomic Swaps for 1inch Fusion+
        </p>
      </div>
    </AbsoluteFill>
  );
};