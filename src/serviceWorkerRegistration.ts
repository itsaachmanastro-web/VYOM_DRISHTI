/**
 * Service Worker Registration for Offline Standalone Execution
 */

export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ VYOM DRISHTI Service Worker registered successfully with scope:', registration.scope);
        })
        .catch((error) => {
          console.warn('⚠️ Service Worker registration failed:', error);
        });
    });
  }
}

