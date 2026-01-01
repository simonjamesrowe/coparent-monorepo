import { Auth0Provider } from '@auth0/auth0-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import './styles.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
    },
  },
});

const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN;
const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const auth0RedirectUri = import.meta.env.VITE_AUTH0_REDIRECT_URI || window.location.origin;
const auth0Audience = import.meta.env.VITE_AUTH0_AUDIENCE;

const authorizationParams: { redirect_uri: string; audience?: string } = {
  redirect_uri: auth0RedirectUri,
};

if (auth0Audience) {
  authorizationParams.audience = auth0Audience;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Auth0Provider
      domain={auth0Domain}
      clientId={auth0ClientId}
      authorizationParams={authorizationParams}
    >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </Auth0Provider>
  </React.StrictMode>,
);
