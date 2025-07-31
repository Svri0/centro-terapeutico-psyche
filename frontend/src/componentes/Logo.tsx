import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showSubtitle = true, 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-32 h-10',
    md: 'w-40 h-12',
    lg: 'w-48 h-14'
  };

  return (
    <div className={`flex items-center ${className}`}>
      {/* Logo SVG */}
      <svg 
        className={sizeClasses[size]} 
        viewBox="0 0 200 60" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Fondo del logo */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor: '#fdecda', stopOpacity: 1}} />
            <stop offset="100%" style={{stopColor: '#fad8b8', stopOpacity: 1}} />
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.1"/>
          </filter>
        </defs>
        
        {/* Símbolo de cerebro/mente */}
        <g transform="translate(10, 10)">
          {/* Cerebro estilizado */}
          <path 
            d="M15 25 Q20 15, 25 20 Q30 25, 25 30 Q20 35, 15 30 Q10 25, 15 25" 
            fill="url(#logoGradient)" 
            stroke="#8B4513" 
            strokeWidth="1.5"
            filter="url(#shadow)"
          />
          
          {/* Neuronas/red */}
          <circle cx="20" cy="20" r="2" fill="#8B4513" opacity="0.8"/>
          <circle cx="25" cy="25" r="2" fill="#8B4513" opacity="0.8"/>
          <circle cx="15" cy="30" r="2" fill="#8B4513" opacity="0.8"/>
          
          {/* Conexiones */}
          <line x1="20" y1="20" x2="25" y2="25" stroke="#8B4513" strokeWidth="1" opacity="0.6"/>
          <line x1="25" y1="25" x2="15" y2="30" stroke="#8B4513" strokeWidth="1" opacity="0.6"/>
          <line x1="15" y1="30" x2="20" y2="20" stroke="#8B4513" strokeWidth="1" opacity="0.6"/>
        </g>
        
        {/* Texto "de psyche" */}
        <g transform="translate(50, 15)">
          <text 
            x="0" y="15" 
            fontFamily="Inter, Arial, sans-serif" 
            fontSize="18" 
            fontWeight="600" 
            fill="#2D3748" 
            letterSpacing="0.5"
          >
            de psyche
          </text>
          
          {/* Subtítulo */}
          {showSubtitle && (
            <text 
              x="0" y="32" 
              fontFamily="Inter, Arial, sans-serif" 
              fontSize="10" 
              fontWeight="400" 
              fill="#718096" 
              letterSpacing="1"
            >
              CENTRO TERAPÉUTICO
            </text>
          )}
        </g>
        
        {/* Elemento decorativo */}
        <g transform="translate(180, 20)">
          <circle cx="0" cy="0" r="3" fill="#fdecda" stroke="#8B4513" strokeWidth="1"/>
          <circle cx="0" cy="0" r="1" fill="#8B4513"/>
        </g>
      </svg>
    </div>
  );
};

export default Logo; 