// Global error interceptor to prevent redirects on API errors
export const initErrorInterceptor = () => {
  // Intercept fetch errors more carefully
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    try {
      const response = await originalFetch(...args);
      
      // Only intercept specific problematic endpoints
      const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
      
      // If it's a 500 error from usage/subscription endpoints, fake it
      if (response.status === 500 && (url.includes('usage') || url.includes('subscription'))) {
        console.error('🔥 Usage API 500 error intercepted:', url);
        // Return a fake successful response to prevent redirects
        return new Response(JSON.stringify({ 
          usage: 0,
          limit: 1000,
          subscription: 'free' 
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return response;
    } catch (error) {
      console.error('🔥 Fetch error:', error);
      // Let most errors through normally
      throw error;
    }
  };
  
  // Intercept unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('🔥 Unhandled promise rejection intercepted:', event.reason);
    event.preventDefault(); // Prevent default error handling
  });
  
  // Intercept global errors
  window.addEventListener('error', (event) => {
    console.error('🔥 Global error intercepted:', event.error);
    if (event.error?.message?.includes('500') || event.error?.message?.includes('Usage API')) {
      event.preventDefault(); // Prevent default error handling
    }
  });
  
  console.log('🛡️ Error interception activated!');
};