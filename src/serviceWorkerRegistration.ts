/**
 * Service Worker Registration for Offline Standalone Execution
 * Automatically checks for updates and refreshes cache on new deployments.
 */

export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ VYOM DRISHTI Service Worker registered successfully with scope:', registration.scope);
          
          // Check for fresh deployment update
          registration.update().catch(() => null);

          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('🚀 Fresh deployment available. Updating cache...');
                  window.location.reload();
                }
              };
            }
          };
        })
        .catch((error) => {
          console.warn('⚠️ Service Worker registration failed:', error);
        });
    });
  }
}
