import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Import auth debug utility for development
if (process.env.NODE_ENV === 'development') {
  import('./utils/authDebug').then(module => {
    // Auth debug utility loaded
  });
}

// Ensure the browser tab displays the correct title
document.title = 'Market Data';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  throw new Error('Failed to find the root element');
}
