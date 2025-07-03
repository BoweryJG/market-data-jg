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
  
  // Override location.href setter
  const locationDescriptor = Object.getOwnPropertyDescriptor(window, 'location');
  if (locationDescriptor) {
    Object.defineProperty(window, 'location', {
      get: locationDescriptor.get,
      set: function(value) {
        if (typeof value === 'string' && (value === '/' || value.endsWith('/'))) {
          console.warn('🚫 BLOCKED redirect to homepage via location.href');
          return;
        }
        if (typeof value === 'object' && value.href && (value.href === '/' || value.href.endsWith('/'))) {
          console.warn('🚫 BLOCKED redirect to homepage via location object');
          return;
        }
        return locationDescriptor.set?.call(window, value);
      }
    });
  }
  
  console.log('🛡️ Homepage redirect protection activated!');
};