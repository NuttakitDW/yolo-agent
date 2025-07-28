import React from 'react';
import { AbsoluteFill } from 'remotion';

export const ThunderPortalLogoSimple: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: 'transparent',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Lightning Bolt Icon - Simplified */}
      <svg
        width={512}
        height={512}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background Circle */}
        <circle
          cx="256"
          cy="256"
          r="240"
          fill="#0A0A0B"
        />
        
        {/* Portal Rings */}
        <circle
          cx="256"
          cy="256"
          r="220"
          stroke="url(#portalGradient)"
          strokeWidth="8"
          fill="none"
        />
        
        <circle
          cx="256"
          cy="256"
          r="180"
          stroke="url(#portalGradient)"
          strokeWidth="4"
          fill="none"
          opacity="0.6"
        />
        
        {/* Lightning Bolt - Centered */}
        <path
          d="M300 100 L220 220 L260 220 L212 412 L292 292 L252 292 Z"
          fill="url(#lightningGradient)"
        />
        
        {/* Bitcoin Symbol */}
        <text
          x="80"
          y="270"
          fontSize="80"
          fill="#F7931A"
          fontFamily="Arial, sans-serif"
          fontWeight="bold"
        >
          ₿
        </text>
        
        {/* Ethereum Symbol */}
        <text
          x="352"
          y="270"
          fontSize="70"
          fill="#627EEA"
          fontFamily="Arial, sans-serif"
          fontWeight="bold"
        >
          Ξ
        </text>
        
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
        </defs>
      </svg>
    </AbsoluteFill>
  );
};