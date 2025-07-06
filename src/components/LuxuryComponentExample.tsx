import React from 'react';
import { navbarStyles, luxuryPanelStyles } from '../styles/navbarStyles';

// Example React component demonstrating the luxury design system
const LuxuryComponentExample: React.FC = () => {
  return (
    <div style={{ padding: '20px', background: '#0a0a0a', minHeight: '100vh' }}>
      <h2 style={{ color: '#fff', marginBottom: '20px' }}>Luxury UI Components Demo</h2>
      
      {/* Example 1: Panel with Screws using CSS classes */}
      <div className="luxury-panel" style={{ padding: '20px', marginBottom: '20px' }}>
        <div className="screw-wrapper">
          <div className="luxury-screw luxury-screw-tl"><div className="luxury-screw-jewel"></div></div>
          <div className="luxury-screw luxury-screw-tr"><div className="luxury-screw-jewel"></div></div>
          <div className="luxury-screw luxury-screw-bl"><div className="luxury-screw-jewel"></div></div>
          <div className="luxury-screw luxury-screw-br"><div className="luxury-screw-jewel"></div></div>
        </div>
        <div className="luxury-brushed-metal"></div>
        <div className="luxury-light-source"></div>
        <div className="luxury-edge-highlight"></div>
        <h3 style={{ color: '#fff', margin: 0 }}>Luxury Panel</h3>
        <p style={{ color: '#94a3b8', marginTop: '10px' }}>This is a machined component with Swiss precision screws.</p>
      </div>

      {/* Example 2: Card with TypeScript styles */}
      <div style={{ ...luxuryPanelStyles.card, padding: '20px', marginBottom: '20px', position: 'relative' }}>
        <div className="screw-wrapper">
          <div style={navbarStyles.screw}>
            <div style={navbarStyles.screwGroove.horizontal}></div>
            <div style={navbarStyles.screwGroove.vertical}></div>
            <div style={navbarStyles.screwJewel}></div>
          </div>
          <div style={{ ...navbarStyles.screw, ...navbarStyles.screwPositions.topRight }}>
            <div style={navbarStyles.screwGroove.horizontal}></div>
            <div style={navbarStyles.screwGroove.vertical}></div>
            <div style={navbarStyles.screwJewel}></div>
          </div>
          <div style={{ ...navbarStyles.screw, ...navbarStyles.screwPositions.bottomLeft }}>
            <div style={navbarStyles.screwGroove.horizontal}></div>
            <div style={navbarStyles.screwGroove.vertical}></div>
            <div style={navbarStyles.screwJewel}></div>
          </div>
          <div style={{ ...navbarStyles.screw, ...navbarStyles.screwPositions.bottomRight }}>
            <div style={navbarStyles.screwGroove.horizontal}></div>
            <div style={navbarStyles.screwGroove.vertical}></div>
            <div style={navbarStyles.screwJewel}></div>
          </div>
        </div>
        <h3 style={{ color: '#fff', margin: 0 }}>Luxury Card</h3>
        <p style={{ color: '#94a3b8', marginTop: '10px' }}>Using TypeScript style objects for type safety.</p>
      </div>

      {/* Example 3: Gauge Wrapper */}
      <div style={{ display: 'flex', gap: '20px' }}>
        <div className="luxury-gauge-wrapper" style={{ width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="screw-wrapper">
            <div className="luxury-screw" style={{ top: '10px', left: '50%', transform: 'translateX(-50%)' }}>
              <div className="luxury-screw-jewel"></div>
            </div>
            <div className="luxury-screw" style={{ bottom: '10px', left: '50%', transform: 'translateX(-50%)' }}>
              <div className="luxury-screw-jewel"></div>
            </div>
            <div className="luxury-screw" style={{ left: '10px', top: '50%', transform: 'translateY(-50%)' }}>
              <div className="luxury-screw-jewel"></div>
            </div>
            <div className="luxury-screw" style={{ right: '10px', top: '50%', transform: 'translateY(-50%)' }}>
              <div className="luxury-screw-jewel"></div>
            </div>
          </div>
          <div style={{ color: '#fff', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', fontWeight: 'bold' }}>97%</div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>PERFORMANCE</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LuxuryComponentExample;