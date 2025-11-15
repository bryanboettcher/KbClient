// Helper to get runtime environment from window.env (injected by Docker)
// Falls back to compile-time values for local development
declare global {
  interface Window {
    env?: {
      apiUrl: string;
    };
  }
}

export const environment = {
  production: false,
  apiUrl: (typeof window !== 'undefined' && window.env?.apiUrl) || 'http://localhost:5000/api'
};
