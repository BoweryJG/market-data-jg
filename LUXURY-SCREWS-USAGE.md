# Luxury Cartier-Level Screw System Usage Guide

## Overview
The luxury screw system transforms basic UI screws into haute horology-grade mechanical elements with aerospace precision aesthetics. Each screw features:

- **Radial metallic gradient** (titanium/steel finish)
- **Inset slot or Phillips grooves**
- **Glowing jewel core** with subtle pulse animation
- **Bezel shadow ring** for embedded appearance
- **Randomized rotation angles**
- **Idle wiggle animation** (±1° vibration drift)
- **Mobile responsive scaling**

## Quick Start

### Method 1: Direct HTML/JSX Implementation
```jsx
<div className="luxury-screw-wrapper top-left" style={{"--screw-rotation": `${Math.random() * 360}deg`}}>
  <div className="luxury-screw phillips">
    <div className="luxury-screw-jewel"></div>
  </div>
</div>
```

### Method 2: Using React Hook
```jsx
import { useLuxuryScrews } from '@/hooks/useLuxuryScrews';

function MyComponent() {
  const screwRef = useLuxuryScrews();
  
  return (
    <div ref={screwRef} className="my-container">
      {/* Your content */}
    </div>
  );
}
```

### Method 3: Using Wrapper Component
```jsx
import { LuxuryScrewContainer } from '@/hooks/useLuxuryScrews';

function MyComponent() {
  return (
    <LuxuryScrewContainer className="my-panel" screwDistance={10}>
      {/* Your content */}
    </LuxuryScrewContainer>
  );
}
```

### Method 4: Higher-Order Component
```jsx
import { withLuxuryScrews } from '@/hooks/useLuxuryScrews';

const MyPanel = ({ title, content }) => (
  <div className="panel">
    <h2>{title}</h2>
    <p>{content}</p>
  </div>
);

export default withLuxuryScrews(MyPanel, { distance: 12 });
```

## Screw Variations

### Groove Types
- `.luxury-screw.phillips` - Cross/Phillips head style
- `.luxury-screw.slot` - Single slot style

### Jewel Colors
- `.luxury-screw-jewel` - Default magenta/mint gradient
- `.luxury-screw-jewel.arctic` - Arctic blue/mint gradient
- `.luxury-screw-jewel.rose` - Rose/magenta gradient

### Position Classes
- `.luxury-screw-wrapper.top-left`
- `.luxury-screw-wrapper.top-right`
- `.luxury-screw-wrapper.bottom-left`
- `.luxury-screw-wrapper.bottom-right`

## CSS Variables

```css
/* Customize screw appearance */
.my-container {
  --screw-rotation: 45deg;      /* Initial rotation angle */
  --screw-distance: 16px;       /* Distance from container edges */
  --jewel-magenta: #ff00aa;     /* Custom jewel color */
  --jewel-mint: #00ffcc;        /* Custom jewel accent */
}
```

## Complete Example

```jsx
import React from 'react';
import { LuxuryScrewContainer } from '@/hooks/useLuxuryScrews';
import '../styles/luxury-screws.css';

const PremiumDashboard = () => {
  return (
    <div className="dashboard">
      <LuxuryScrewContainer className="nav-container" screwDistance={10}>
        <nav>Premium Navigation</nav>
      </LuxuryScrewContainer>
      
      <div className="panel-grid">
        <LuxuryScrewContainer className="data-panel">
          <h3>Market Data</h3>
          <div className="content">...</div>
        </LuxuryScrewContainer>
        
        <LuxuryScrewContainer className="insights-panel">
          <h3>AI Insights</h3>
          <div className="content">...</div>
        </LuxuryScrewContainer>
      </div>
    </div>
  );
};
```

## Performance Notes

1. Screws use CSS animations with `will-change` for GPU optimization
2. Mobile scaling reduces screw size by ~25% for better proportions
3. `prefers-reduced-motion` disables animations for accessibility
4. Each screw's random rotation is calculated once on mount

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (requires -webkit-backdrop-filter)
- Mobile: Fully responsive with touch-friendly sizing

## Troubleshooting

**Screws not appearing?**
- Ensure container has `position: relative`
- Check z-index conflicts (screws use z-index: 10)
- Verify luxury-screws.css is imported

**Animation performance issues?**
- Reduce number of screws per viewport
- Use `prefers-reduced-motion` media query
- Consider static screws on low-end devices