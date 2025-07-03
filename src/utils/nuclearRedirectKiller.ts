// NUCLEAR OPTION - KILL ALL REDIRECTS AND EXTERNAL INTERFERENCE
export const initNuclearRedirectKiller = () => {
  console.log('☢️ NUCLEAR REDIRECT KILLER ACTIVATED');
  
  // Store original location
  const correctPath = window.location.pathname;
  
  // Override EVERYTHING that could cause redirects
  const methods = ['assign', 'replace'];
  methods.forEach(method => {
    const original = window.location[method];
    (window.location as any)[method] = function(url?: any) {
      if (url === '/' || url === '' || (typeof url === 'string' && url.endsWith('/#'))) {
        console.error(`☢️ NUCLEAR BLOCK: Prevented redirect via location.${method} to:`, url);
        return;
      }
      return original.call(window.location, url);
    };
  });
  
  // Kill history API redirects
  ['pushState', 'replaceState'].forEach(method => {
    const original = history[method];
    history[method] = function(...args: any[]) {
      const url = args[2];
      if (url === '/' && correctPath !== '/') {
        console.error(`☢️ NUCLEAR BLOCK: Prevented redirect via history.${method}`);
        return;
      }
      return original.apply(history, args);
    };
  });
  
  // Monitor for ANY navigation attempts
  let checkInterval: any;
  const startMonitoring = () => {
    checkInterval = setInterval(() => {
      if (window.location.pathname === '/' && correctPath !== '/') {
        console.error('☢️ NUCLEAR: Detected unwanted navigation to homepage, forcing back!');
        history.replaceState(null, '', correctPath);
      }
    }, 100);
  };
  
  // Kill ALL external scripts trying to load
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node: any) => {
        if (node.tagName === 'SCRIPT' && node.src) {
          if (!node.src.includes(window.location.origin) && 
              !node.src.includes('fonts.googleapis.com')) {
            console.error('☢️ NUCLEAR: Removing external script:', node.src);
            node.remove();
          }
        }
      });
    });
  });
  
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
  
  // Start monitoring
  startMonitoring();
  
  // Stop monitoring after 30 seconds to prevent memory issues
  setTimeout(() => {
    clearInterval(checkInterval);
    console.log('☢️ NUCLEAR: Monitoring stopped after 30s');
  }, 30000);
  
  // Expose control functions
  (window as any).nuclearKill = {
    stopMonitoring: () => clearInterval(checkInterval),
    startMonitoring,
    blocked: []
  };
};

// Auto-activate on import
if (typeof window !== 'undefined') {
  initNuclearRedirectKiller();
}