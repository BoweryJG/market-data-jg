import React, { useState } from 'react';
import { Box, BoxProps } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { navbarColors, navbarStyles, getPremiumContainerStyles } from '../../styles/navbarStyles';

// Keyframe animations
const glassOscillate = keyframes`
  0%, 100% { opacity: 0.2; transform: scale(1); }
  50% { opacity: 0.3; transform: scale(1.02); }
`;

const screwGlow = keyframes`
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
`;

const edgeGlow = keyframes`
  0%, 100% { 
    opacity: 0.6; 
    box-shadow: 0 0 8px rgba(0, 255, 255, 0.15); 
    transform: scaleY(1);
  }
  50% { 
    opacity: 1; 
    box-shadow: 0 0 12px rgba(0, 255, 255, 0.3); 
    transform: scaleY(1.05);
  }
`;

// Styled components
const ContainerBox = styled(Box)<{ isHovered?: boolean }>(({ isHovered = false }) => ({
  ...getPremiumContainerStyles(isHovered),
  transformStyle: 'preserve-3d',
  perspective: '1000px',
}));

const Screw = styled(Box)<{ position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' }>(
  ({ position }) => ({
    ...navbarStyles.screw,
    ...navbarStyles.screwPositions[position],
    '&::after': {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: '3px',
      height: '3px',
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
  animation: `${glassOscillate} 8s ease-in-out infinite`,
});

const GridBackground = styled(Box)<{ scrollOffset?: number }>(({ scrollOffset = 0 }) => ({
  position: 'absolute',
  inset: 0,
  backgroundImage: `
    radial-gradient(circle at 20% 50%, rgba(255, 0, 255, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 80% 50%, rgba(0, 255, 255, 0.03) 0%, transparent 50%),
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
  opacity: 0.5,
  transform: `translateY(${scrollOffset}px)`,
  pointerEvents: 'none',
  transition: 'transform 0.1s linear',
}));

interface PremiumContainerProps extends BoxProps {
  children: React.ReactNode;
  showScrews?: boolean;
  showEdgeMounts?: boolean;
  enableHover?: boolean;
  scrollOffset?: number;
  className?: string;
}

const PremiumContainer: React.FC<PremiumContainerProps> = ({
  children,
  showScrews = true,
  showEdgeMounts = true,
  enableHover = true,
  scrollOffset = 0,
  className,
  sx,
  ...otherProps
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <ContainerBox
      isHovered={enableHover && isHovered}
      onMouseEnter={() => enableHover && setIsHovered(true)}
      onMouseLeave={() => enableHover && setIsHovered(false)}
      className={className}
      sx={{
        ...sx,
        transform: isHovered ? 'translateY(-2px) scale(1.01)' : 'translateY(0) scale(1)',
      }}
      {...otherProps}
    >
      {/* Grid background with parallax */}
      <GridBackground scrollOffset={scrollOffset} />
      
      {/* Edge mount indicators */}
      {showEdgeMounts && (
        <>
          <EdgeMount side="left" />
          <EdgeMount side="right" />
        </>
      )}
      
      {/* Metallic screws */}
      {showScrews && (
        <>
          <Screw position="topLeft" />
          <Screw position="topRight" />
          <Screw position="bottomLeft" />
          <Screw position="bottomRight" />
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