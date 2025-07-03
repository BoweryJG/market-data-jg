// NUCLEAR OPTION: Prevent any fucking redirects to homepage
export const initPreventRedirects = () => {
  // Store the original pushState and replaceState
  const originalPushState = window.history.pushState;
  const originalReplaceState = window.history.replaceState;
  
  // Override pushState
  window.history.pushState = function(...args) {
    const url = args[2];
    if (typeof url === 'string' && (url === '/' || url.endsWith('/'))) {
      console.warn('🚫 BLOCKED redirect to homepage via pushState');
      return;
    }
    return originalPushState.apply(window.history, args);
  };
  
  // Override replaceState
  window.history.replaceState = function(...args) {
    const url = args[2];
    if (typeof url === 'string' && (url === '/' || url.endsWith('/'))) {
      console.warn('🚫 BLOCKED redirect to homepage via replaceState');
      return;
    }
    return originalReplaceState.apply(window.history, args);
  };
  
  // Override navigation methods instead of trying to redefine location
  const originalAssign = window.location.assign;
  const originalReplace = window.location.replace;
  
  window.location.assign = function(url) {
    if (url === '/' || url.endsWith('/')) {
      console.warn('🚫 BLOCKED redirect to homepage via location.assign');
      return;
    }
    return originalAssign.call(window.location, url);
  };
  
  window.location.replace = function(url) {
    if (url === '/' || url.endsWith('/')) {
      console.warn('🚫 BLOCKED redirect to homepage via location.replace');
      return;
    }
    return originalReplace.call(window.location, url);
  };
  
  console.log('🛡️ Homepage redirect protection activated!');
};