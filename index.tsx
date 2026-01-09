import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const startApplication = () => {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error("Critical Error: Root element #root not found in DOM.");
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
    console.error("React Rendering Exception:", err);
    rootElement.innerHTML = `
      <div style="padding: 40px; color: #ef4444; font-family: system-ui, sans-serif; text-align: center; max-width: 500px; margin: 100px auto; border: 1px solid #fee2e2; border-radius: 12px; background: #fef2f2;">
        <h1 style="font-size: 20px; font-weight: bold; margin-bottom: 12px;">System Initialization Failed</h1>
        <p style="margin-bottom: 24px; color: #7f1d1d; line-height: 1.5;">The aviation simulator encountered an error during startup. This is often caused by a failed script load or browser incompatibility.</p>
        <button onclick="window.location.reload()" style="padding: 12px 24px; background: #2563eb; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
          Retry System Launch
        </button>
      </div>
    `;
  }
};

// Global handlers to capture early-stage failures for debugging
window.addEventListener('error', (event) => {
  console.error('Runtime script error detected:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApplication);
} else {
  startApplication();
}