import React from 'react';
import ReactDOM from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { getAuthConfig } from './services/authConfig';
import './styles/index.css';

async function initApp() {
  const authConfig = await getAuthConfig();

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <Auth0Provider
        domain={authConfig.domain}
        clientId={authConfig.clientId}
        authorizationParams={{
          redirect_uri: window.location.origin,
          audience: authConfig.audience,
          scope: 'openid profile email',
        }}
        cacheLocation="localstorage"
      >
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Auth0Provider>
    </React.StrictMode>
  );
}

initApp();