
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const renderApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error("Critical Error: Root element not found");
    return;
  }

  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err) {
    console.error("Failed to render React App:", err);
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 40px; font-family: sans-serif; text-align: center;">
          <h1 style="color: #e11d48;">Ops! Erro ao carregar o MarketHub</h1>
          <p style="color: #475569;">Verifique o console do navegador para detalhes técnicos.</p>
          <button onclick="window.location.reload()" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 8px; cursor: pointer;">
            Tentar Novamente
          </button>
        </div>
      `;
    }
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}
