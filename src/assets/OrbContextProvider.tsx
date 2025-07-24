import React, { createContext, useContext, useState, useMemo } from 'react';

// Define the type for the orb context
interface OrbContextType {
  gradientColors: {
    start: string;
    end: string;
  };
}

// Define the type for the color mode context
interface ColorModeContextType {
  colorMode: 'light' | 'dark';
  toggleColorMode: () => void;
}

// Create the Orb context
const OrbContext = createContext<OrbContextType>({
  gradientColors: { start: '#00ffc6', end: '#7B42F6' }
});

// Create the color mode context
const ColorModeContext = createContext<ColorModeContextType>({
  colorMode: 'dark',
  toggleColorMode: () => {}
});

export const OrbContextProvider = ({ children }: { children: React.ReactNode }) => {
  // State for color mode
  const [mode, setMode] = useState<'light' | 'dark'>('dark');
  
  // Color mode toggle function
  const colorMode = useMemo(
    () => ({
      colorMode: mode,
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [mode],
  );

  // Orb context values
  const orbValues = {
    gradientColors: { start: '#00ffc6', end: '#7B42F6' }
  };

  return (
    <ColorModeContext.Provider value={colorMode}>
      <OrbContext.Provider value={orbValues}>
        {children}
      </OrbContext.Provider>
    </ColorModeContext.Provider>
  );
};

OrbContextProvider.displayName = 'OrbContextProvider';

export const useOrbContext = () => useContext(OrbContext);
export const useColorMode = () => useContext(ColorModeContext);
