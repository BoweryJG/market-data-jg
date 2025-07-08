import React from 'react';

const LuxuryScrew = ({ 
  type = 'flathead', 
  rotation = 0, 
  size = 16,
  showHalo = true,
  className = '' 
}) => {
  const screwId = `luxury-screw-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div 
      className={`luxury-screw-svg-wrapper ${className}`}
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        transform: `rotate(${rotation}deg)`
      }}
    >
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          {/* Titanium gradient */}
          <radialGradient id={`${screwId}-titanium`} cx="40%" cy="40%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="15%" stopColor="#f2f2f4" />
            <stop offset="30%" stopColor="#e2e2e6" />
            <stop offset="50%" stopColor="#d8d8dc" />
            <stop offset="70%" stopColor="#c8c8ce" />
            <stop offset="85%" stopColor="#a8a8b2" />
            <stop offset="100%" stopColor="#888896" />
          </radialGradient>
          
          {/* Brushed metal texture */}
          <pattern id={`${screwId}-brushed`} x="0" y="0" width="2" height="2" patternUnits="userSpaceOnUse">
            <rect width="2" height="2" fill="#d8d8dc" />
            <line x1="0" y1="0" x2="2" y2="0" stroke="#c8c8ce" strokeWidth="0.2" opacity="0.5" />
            <line x1="0" y1="0.5" x2="2" y2="0.5" stroke="#e2e2e6" strokeWidth="0.1" opacity="0.3" />
            <line x1="0" y1="1" x2="2" y2="1" stroke="#c8c8ce" strokeWidth="0.2" opacity="0.5" />
            <line x1="0" y1="1.5" x2="2" y2="1.5" stroke="#e2e2e6" strokeWidth="0.1" opacity="0.3" />
          </pattern>
          
          {/* Specular highlight */}
          <radialGradient id={`${screwId}-specular`} cx="35%" cy="35%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="40%" stopColor="#ffffff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          
          {/* Shadow gradient */}
          <radialGradient id={`${screwId}-shadow`} cx="50%" cy="50%">
            <stop offset="60%" stopColor="#000000" stopOpacity="0" />
            <stop offset="90%" stopColor="#000000" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
          </radialGradient>
          
          {/* Chamfer effect */}
          <filter id={`${screwId}-chamfer`}>
            <feGaussianBlur in="SourceAlpha" stdDeviation="0.3" />
            <feOffset dx="0.5" dy="0.5" result="offsetblur" />
            <feFlood floodColor="#000000" floodOpacity="0.3" />
            <feComposite in2="offsetblur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          {/* Halo glow */}
          {showHalo && (
            <filter id={`${screwId}-halo`}>
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          )}
        </defs>
        
        {/* Halo ring */}
        {showHalo && (
          <circle 
            cx="12" 
            cy="12" 
            r="10" 
            fill="none"
            stroke="rgba(180, 190, 210, 0.15)"
            strokeWidth="1"
            filter={`url(#${screwId}-halo)`}
          />
        )}
        
        {/* Screw body with chamfered edge */}
        <circle 
          cx="12" 
          cy="12" 
          r="8" 
          fill={`url(#${screwId}-titanium)`}
          filter={`url(#${screwId}-chamfer)`}
        />
        
        {/* Brushed texture overlay */}
        <circle 
          cx="12" 
          cy="12" 
          r="7.5" 
          fill={`url(#${screwId}-brushed)`}
          opacity="0.3"
        />
        
        {/* Inner shadow for depth */}
        <circle 
          cx="12" 
          cy="12" 
          r="7.8" 
          fill="none"
          stroke={`url(#${screwId}-shadow)`}
          strokeWidth="0.4"
        />
        
        {/* Slot based on type */}
        {type === 'flathead' && (
          <rect 
            x="7" 
            y="11.25" 
            width="10" 
            height="1.5" 
            rx="0.2"
            fill="rgba(5, 5, 10, 0.9)"
            style={{
              filter: 'drop-shadow(0 0.5px 0.5px rgba(255, 255, 255, 0.2))'
            }}
          />
        )}
        
        {type === 'hex' && (
          <path 
            d="M12 8 L15.5 10 L15.5 14 L12 16 L8.5 14 L8.5 10 Z"
            fill="rgba(5, 5, 10, 0.9)"
            style={{
              filter: 'drop-shadow(0 0.5px 0.5px rgba(255, 255, 255, 0.2))'
            }}
          />
        )}
        
        {type === 'phillips' && (
          <>
            <rect 
              x="11.25" 
              y="8" 
              width="1.5" 
              height="8" 
              rx="0.2"
              fill="rgba(5, 5, 10, 0.9)"
            />
            <rect 
              x="8" 
              y="11.25" 
              width="8" 
              height="1.5" 
              rx="0.2"
              fill="rgba(5, 5, 10, 0.9)"
            />
          </>
        )}
        
        {/* Specular highlight */}
        <ellipse 
          cx="10" 
          cy="10" 
          rx="3" 
          ry="3" 
          fill={`url(#${screwId}-specular)`}
          opacity="0.7"
        />
        
        {/* Tiny center jewel for high-end feel */}
        <circle 
          cx="12" 
          cy="12" 
          r="0.5" 
          fill="rgba(210, 215, 225, 0.8)"
          opacity="0.6"
        />
      </svg>
    </div>
  );
};

export default LuxuryScrew;