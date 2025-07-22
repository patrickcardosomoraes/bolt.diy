import { WebContainer } from '@webcontainer/api';
import { WORK_DIR_NAME } from '~/utils/constants';
import { cleanStackTrace } from '~/utils/stacktrace';

interface WebContainerContext {
  loaded: boolean;
}

export const webcontainerContext: WebContainerContext = import.meta.hot?.data.webcontainerContext ?? {
  loaded: false,
};

if (import.meta.hot) {
  import.meta.hot.data.webcontainerContext = webcontainerContext;
}

export let webcontainer: Promise<WebContainer> = new Promise(() => {
  // noop for ssr
});

if (!import.meta.env.SSR) {
  // Check if WebContainer is supported in this environment
  const isWebContainerSupported = () => {
    try {
      // Check for required APIs
      return (
        typeof SharedArrayBuffer !== 'undefined' &&
        typeof ServiceWorker !== 'undefined' &&
        typeof Worker !== 'undefined' &&
        !navigator.userAgent.includes('CloudFlareWorker')
      );
    } catch {
      return false;
    }
  };

  if (!isWebContainerSupported()) {
    console.warn('⚠️ WebContainer não é suportado neste ambiente');
    webcontainerContext.loaded = false;
    webcontainer = Promise.reject(
      new Error('WebContainer não é suportado neste ambiente. Funcionalidades de terminal podem estar limitadas.'),
    );
  } else {
    webcontainer =
      import.meta.hot?.data.webcontainer ??
      Promise.resolve()
        .then(() => {
          console.log('🚀 Iniciando WebContainer...');
          return WebContainer.boot({
            coep: 'credentialless',
            workdirName: WORK_DIR_NAME,
            forwardPreviewErrors: true, // Enable error forwarding from iframes
          });
        })
        .then(async (webcontainer) => {
          console.log('✅ WebContainer inicializado com sucesso');
          webcontainerContext.loaded = true;

          const { workbenchStore } = await import('~/lib/stores/workbench');

          try {
            const response = await fetch('/inspector-script.js');
            const inspectorScript = await response.text();
            await webcontainer.setPreviewScript(inspectorScript);
            console.log('✅ Inspector script carregado');
          } catch (error) {
            console.warn('⚠️ Falha ao carregar inspector script:', error);
          }

          // Listen for preview errors
          webcontainer.on('preview-message', (message) => {
            console.log('WebContainer preview message:', message);

            // Handle both uncaught exceptions and unhandled promise rejections
            if (message.type === 'PREVIEW_UNCAUGHT_EXCEPTION' || message.type === 'PREVIEW_UNHANDLED_REJECTION') {
              const isPromise = message.type === 'PREVIEW_UNHANDLED_REJECTION';
              const title = isPromise ? 'Unhandled Promise Rejection' : 'Uncaught Exception';
              workbenchStore.actionAlert.set({
                type: 'preview',
                title,
                description: 'message' in message ? message.message : 'Unknown error',
                content: `Error occurred at ${message.pathname}${message.search}${message.hash}\nPort: ${message.port}\n\nStack trace:\n${cleanStackTrace(message.stack || '')}`,
                source: 'preview',
              });
            }
          });

          return webcontainer;
        })
        .catch((error) => {
          console.error('❌ Erro ao inicializar WebContainer:', error);
          webcontainerContext.loaded = false;
          throw error;
        });

    if (import.meta.hot) {
      import.meta.hot.data.webcontainer = webcontainer;
    }
  }
}
