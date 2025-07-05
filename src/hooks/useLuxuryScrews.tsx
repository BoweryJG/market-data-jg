import { useEffect, useRef } from 'react';
import '../styles/luxury-screws.css';

/**
 * Hook to automatically add luxury Cartier-level screws to a container
 * @param enable - Whether to add screws (default: true)
 * @returns ref to attach to the container element
 */
export const useLuxuryScrews = (enable: boolean = true) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enable || !containerRef.current) return;

    const container = containerRef.current;
    
    // Check if screws already exist
    if (container.querySelector('.luxury-screw-wrapper')) return;

    // Screw configurations
    const screwConfigs = [
      { position: 'top-left', type: 'phillips', jewel: '' },
      { position: 'top-right', type: 'slot', jewel: 'arctic' },
      { position: 'bottom-left', type: 'phillips', jewel: 'rose' },
      { position: 'bottom-right', type: 'slot', jewel: '' }
    ];

    // Add screws
    screwConfigs.forEach(config => {
      const wrapper = document.createElement('div');
      wrapper.className = `luxury-screw-wrapper ${config.position}`;
      wrapper.style.setProperty('--screw-rotation', `${Math.random() * 360}deg`);

      const screw = document.createElement('div');
      screw.className = `luxury-screw ${config.type}`;

      const jewel = document.createElement('div');
      jewel.className = `luxury-screw-jewel ${config.jewel}`.trim();

      screw.appendChild(jewel);
      wrapper.appendChild(screw);
      container.appendChild(wrapper);
    });

    // Ensure container has position relative
    if (getComputedStyle(container).position === 'static') {
      container.style.position = 'relative';
    }

    // Cleanup function
    return () => {
      // Optionally remove screws on unmount
      const screws = container.querySelectorAll('.luxury-screw-wrapper');
      screws.forEach(screw => screw.remove());
    };
  }, [enable]);

  return containerRef;
};

/**
 * Component wrapper that automatically adds luxury screws
 */
export const LuxuryScrewContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
  showScrews?: boolean;
  screwDistance?: number;
  style?: React.CSSProperties;
}> = ({ children, className = '', showScrews = true, screwDistance, style }) => {
  const screwRef = useLuxuryScrews(showScrews);

  return (
    <div 
      ref={screwRef} 
      className={`luxury-screw-container ${className}`}
      style={{
        position: 'relative',
        '--screw-distance': screwDistance ? `${screwDistance}px` : undefined,
        ...style
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
};

/**
 * Higher-order component to add luxury screws to any component
 */
export const withLuxuryScrews = <P extends object>(
  Component: React.ComponentType<P>,
  screwOptions?: { distance?: number; enabled?: boolean }
) => {
  return (props: P) => {
    const screwRef = useLuxuryScrews(screwOptions?.enabled ?? true);

    return (
      <div 
        ref={screwRef} 
        style={{
          position: 'relative',
          '--screw-distance': screwOptions?.distance ? `${screwOptions.distance}px` : undefined
        } as React.CSSProperties}
      >
        <Component {...props} />
      </div>
    );
  };
};