// Global error interceptor to prevent redirects on API errors
export const initErrorInterceptor = () => {
  // Intercept fetch errors
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    try {
      const response = await originalFetch(...args);
      
      // If it's a 500 error, log it but don't let it propagate
      if (response.status === 500) {
        console.error('🔥 API 500 error intercepted:', args[0]);
        // Return a fake successful response to prevent redirects
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return response;
    } catch (error) {
      console.error('🔥 Fetch error intercepted:', error);
      // Return a fake response to prevent app crashes
      return new Response(JSON.stringify({ error: 'Network Error' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
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