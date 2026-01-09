import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const renderApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error("Critical Error: Could not find root element to mount to");
    return;
  }

  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err) {
    console.error("Failed to render React application:", err);
    rootElement.innerHTML = `
      <div style="padding: 40px; color: #ef4444; font-family: sans-serif; text-align: center; max-width: 500px; margin: 0 auto;">
        <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">Application Error</h1>
        <p style="margin-bottom: 24px; color: #64748b;">There was a problem loading the aviation exam simulator. This can happen due to network issues or browser incompatibility.</p>
        <button onclick="window.location.reload()" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
          Reload Application
        </button>
      </div>
    `;
  }
};

// Handle early errors
window.onerror = (message, source, lineno, colno, error) => {
  console.error("Global script error:", message, error);
};

window.addEventListener('unhandledrejection', (event) => {
  console.error("Unhandled promise rejection:", event.reason);
});

// Start rendering
renderApp();