import React, { useState } from 'react';
import { Box, BoxProps } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { navbarColors, navbarStyles, getPremiumContainerStyles } from '../../styles/navbarStyles';
import '../../styles/luxury-screws.css';

// Keyframe animations - optimized for performance
const glassOscillate = keyframes`
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.25; }
`;

const screwGlow = keyframes`
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.5; }
`;

const edgeGlow = keyframes`
  0%, 100% { 
    opacity: 0.6; 
    box-shadow: 0 0 8px rgba(0, 255, 255, 0.15); 
  }
  50% { 
    opacity: 0.8; 
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.2); 
  }
`;

// Styled components
const ContainerBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== '$isHovered',
})<{ $isHovered?: boolean }>(({ $isHovered = false }) => ({
  ...getPremiumContainerStyles($isHovered),
  // Removed 3D transforms for better scroll performance
  // transformStyle: 'preserve-3d',
  // perspective: '1000px',
}));

const Screw = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'screwPosition',
})<{ screwPosition: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' }>(
  ({ screwPosition }) => ({
    ...navbarStyles.screw,
    ...navbarStyles.screwPositions[screwPosition],
    '&::after': {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: '2.1px',  // Reduced by 30% from 3px
      height: '2.1px', // Reduced by 30% from 3px
      transform: 'translate(-50%, -50%)',
      background: `radial-gradient(circle at center, ${navbarColors.gemImpossible}80, ${navbarColors.gemDeep}40, transparent)`,
      borderRadius: '50%',
      opacity: 0.5,
      animation: `${screwGlow} 3s infinite`,
    },
  })
);

const EdgeMount = styled(Box)<{ side: 'left' | 'right' }>(({ side }) => ({
  ...navbarStyles.edgeMount,
  [side]: '-4px',
  borderRadius: side === 'left' ? '2px 0 0 2px' : '0 2px 2px 0',
  '&:hover': {
    animation: `${edgeGlow} 2s infinite`,
  },
}));

const GlassOverlay = styled(Box)({
  ...navbarStyles.glassOverlay,
  animation: `${glassOscillate} 12s ease-in-out infinite`, // Slower animation for performance
  willChange: 'opacity', // Optimize for GPU
});

const GridBackground = styled(Box)({
  position: 'absolute',
  inset: 0,
  backgroundImage: `
    radial-gradient(circle at 20% 50%, rgba(255, 0, 255, 0.02) 0%, transparent 50%),
    radial-gradient(circle at 80% 50%, rgba(0, 255, 255, 0.02) 0%, transparent 50%),
    repeating-linear-gradient(
      0deg,
      transparent 0px,
      transparent 19px,
      rgba(255, 255, 255, 0.01) 20px
    ),
    repeating-linear-gradient(
      90deg,
      transparent 0px,
      transparent 19px,
      rgba(255, 255, 255, 0.01) 20px
    )
  `,
  opacity: 0.3,
  pointerEvents: 'none',
});

interface PremiumContainerProps extends BoxProps {
  children: React.ReactNode;
  showScrews?: boolean;
  showEdgeMounts?: boolean;
  enableHover?: boolean;
  className?: string;
}

const PremiumContainer: React.FC<PremiumContainerProps> = ({
  children,
  showScrews = true,
  showEdgeMounts = true,
  enableHover = true,
  className,
  sx,
  ...otherProps
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <ContainerBox
      $isHovered={enableHover && isHovered}
      onMouseEnter={() => enableHover && setIsHovered(true)}
      onMouseLeave={() => enableHover && setIsHovered(false)}
      className={className}
      sx={{
        ...sx,
        // Removed transform on hover for better scroll performance
        // transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
        // transition: 'transform 0.2s ease',
      }}
      {...otherProps}
    >
      {/* Grid background */}
      <GridBackground />
      
      {/* Edge mount indicators */}
      {showEdgeMounts && (
        <>
          <EdgeMount side="left" />
          <EdgeMount side="right" />
        </>
      )}
      
      {/* Luxury Cartier-Level Screws */}
      {showScrews && (
        <>
          <div className="luxury-screw-wrapper top-left" style={{'--screw-rotation': `${Math.random() * 360}deg`} as React.CSSProperties}>
            <div className="luxury-screw phillips">
              <div className="luxury-screw-jewel"></div>
            </div>
          </div>
          <div className="luxury-screw-wrapper top-right" style={{'--screw-rotation': `${Math.random() * 360}deg`} as React.CSSProperties}>
            <div className="luxury-screw slot">
              <div className="luxury-screw-jewel arctic"></div>
            </div>
          </div>
          <div className="luxury-screw-wrapper bottom-left" style={{'--screw-rotation': `${Math.random() * 360}deg`} as React.CSSProperties}>
            <div className="luxury-screw phillips">
              <div className="luxury-screw-jewel rose"></div>
            </div>
          </div>
          <div className="luxury-screw-wrapper bottom-right" style={{'--screw-rotation': `${Math.random() * 360}deg`} as React.CSSProperties}>
            <div className="luxury-screw slot">
              <div className="luxury-screw-jewel"></div>
            </div>
          </div>
        </>
      )}
      
      {/* Glass overlay effect */}
      <GlassOverlay />
      
      {/* Content */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {children}
      </Box>
    </ContainerBox>
  );
};

export default PremiumContainer;