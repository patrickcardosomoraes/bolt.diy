// Quick check for WebContainer compatibility without actually booting it
export function quickCompatibilityCheck(): { 
  isSupported: boolean; 
  missingApis: string[]; 
  details: Record<string, boolean> 
} {
  const missingApis: string[] = [];
  const details: Record<string, boolean> = {};

  // Check SharedArrayBuffer
  const hasSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';
  details.SharedArrayBuffer = hasSharedArrayBuffer;
  if (!hasSharedArrayBuffer) {
    missingApis.push('SharedArrayBuffer');
  }

  // Check ServiceWorker
  const hasServiceWorker = 'serviceWorker' in navigator;
  details.ServiceWorker = hasServiceWorker;
  if (!hasServiceWorker) {
    missingApis.push('ServiceWorker');
  }

  // Check Worker
  const hasWorker = typeof Worker !== 'undefined';
  details.Worker = hasWorker;
  if (!hasWorker) {
    missingApis.push('Worker');
  }

  // Check if running in Cloudflare Worker
  const isCloudflareWorker = navigator.userAgent.includes('CloudFlareWorker');
  details.isCloudflareWorker = isCloudflareWorker;
  if (isCloudflareWorker) {
    missingApis.push('CloudflareWorker detected');
  }

  // Check cross-origin isolation (needed for SharedArrayBuffer)
  const isCrossOriginIsolated = typeof crossOriginIsolated !== 'undefined' ? crossOriginIsolated : false;
  details.crossOriginIsolated = isCrossOriginIsolated;
  if (!isCrossOriginIsolated && hasSharedArrayBuffer) {
    missingApis.push('Cross-origin isolation required for SharedArrayBuffer');
  }

  const isSupported = missingApis.length === 0;

  return {
    isSupported,
    missingApis,
    details
  };
}