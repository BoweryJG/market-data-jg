import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { initErrorInterceptor } from './utils/errorInterceptor';

// ACTIVATE ERROR INTERCEPTOR ONLY - nuclear killer might be breaking things
initErrorInterceptor();

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
