// Helper to get runtime environment from window.env (injected by Docker)
declare global {
  interface Window {
    env?: {
      apiUrl: string;
    };
  }
}

export const environment = {
  production: true,
  apiUrl: (typeof window !== 'undefined' && window.env?.apiUrl) || 'https://api.kbstore.com/api'
};
