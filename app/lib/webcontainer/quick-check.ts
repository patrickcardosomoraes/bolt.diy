// Quick check for WebContainer compatibility without actually booting it
export function quickCompatibilityCheck(): {
  isSupported: boolean;
  missingApis: string[];
  details: Record<string, boolean | string | number>;
} {
  const missingApis: string[] = [];
  const details: Record<string, boolean | string | number> = {};

  // Detect browser type and version
  const userAgent = navigator.userAgent;
  const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
  const isWebKit = /webkit/i.test(userAgent);
  const safariVersion = isSafari ? userAgent.match(/version\/(\d+)/i)?.[1] : null;

  details.browser = isSafari ? `Safari ${safariVersion || 'unknown'}` : 'Other';
  details.isSafari = isSafari;
  details.isWebKit = isWebKit;

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

  // Safari-specific checks
  if (isSafari) {
    // Safari has stricter requirements for SharedArrayBuffer
    if (!isCrossOriginIsolated) {
      missingApis.push('Safari requires strict cross-origin isolation');
    }

    // Check if Safari version supports SharedArrayBuffer properly
    const safariVersionNum = safariVersion ? parseInt(safariVersion) : 0;

    if (safariVersionNum > 0 && safariVersionNum < 15) {
      missingApis.push('Safari version too old (requires Safari 15+)');
    }

    details.safariVersion = safariVersionNum;
  }

  // Check for WebAssembly support (required for WebContainer)
  const hasWebAssembly = typeof WebAssembly !== 'undefined';
  details.WebAssembly = hasWebAssembly;

  if (!hasWebAssembly) {
    missingApis.push('WebAssembly not supported');
  }

  // Check for proper HTTPS context (required for many APIs)
  const secureContext = typeof window !== 'undefined' && window.isSecureContext;
  details.secureContext = secureContext;

  if (!secureContext) {
    missingApis.push('Secure context (HTTPS) required');
  }

  const isSupported = missingApis.length === 0;

  return {
    isSupported,
    missingApis,
    details,
  };
}
