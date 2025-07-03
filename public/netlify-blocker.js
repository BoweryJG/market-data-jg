// Block Netlify's subscription context and other injected scripts
(function() {
  console.log('🛡️ Netlify blocker active');
  
  // Block any script that contains SubscriptionContext
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName) {
    const element = originalCreateElement.call(document, tagName);
    
    if (tagName.toLowerCase() === 'script') {
      const originalSrc = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src');
      Object.defineProperty(element, 'src', {
        get: function() {
          return originalSrc.get.call(this);
        },
        set: function(value) {
          if (value && (value.includes('netlify') || value.includes('subscription') || value.includes('usage'))) {
            console.warn('🚫 Blocked Netlify script:', value);
            return;
          }
          return originalSrc.set.call(this, value);
        }
      });
    }
    
    return element;
  };
  
  // Block fetch requests to subscription/usage endpoints
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    if (url && (url.includes('/subscription') || url.includes('/usage'))) {
      console.warn('🚫 Blocked Netlify API call:', url);
      return Promise.resolve(new Response(JSON.stringify({ blocked: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }));
    }
    return originalFetch.apply(window, args);
  };
})();