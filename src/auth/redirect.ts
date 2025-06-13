/**
 * Handle cross-domain authentication redirects
 */

export const handleAuthRedirect = () => {
  // Store current URL for return after login
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('authReturnUrl', window.location.href);
    
    // Build redirect URL with current location
    const currentUrl = window.location.href;
    const loginUrl = `https://repspheres.com/login?redirect=${encodeURIComponent(currentUrl)}`;
    
    // Redirect to main domain login
    window.location.href = loginUrl;
  }
};

export const getAuthRedirectUrl = () => {
  const currentUrl = window.location.href;
  return `https://repspheres.com/login?redirect=${encodeURIComponent(currentUrl)}`;
};