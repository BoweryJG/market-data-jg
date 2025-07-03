import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { initPreventRedirects } from './utils/preventRedirects';
import { initErrorInterceptor } from './utils/errorInterceptor';

// ACTIVATE NUCLEAR PROTECTION
// Temporarily disabled to debug
// initPreventRedirects();
// initErrorInterceptor();

// Ensure the browser tab displays the correct title
document.title = 'Market Insights';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Failed to find the root element');
}
