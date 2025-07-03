import React, { useEffect } from 'react';

const RunDebug: React.FC = () => {
  useEffect(() => {
    // Run the debug function if available
    if (typeof window !== 'undefined' && (window as any).debugAuth) {
      console.log('🔍 Running window.debugAuth()...');
      (window as any).debugAuth();
    }
  }, []);

  return null;
};

export default RunDebug;