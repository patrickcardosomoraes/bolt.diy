import { WebContainer } from '@webcontainer/api';
import { WORK_DIR_NAME } from '~/utils/constants';
import { cleanStackTrace } from '~/utils/stacktrace';
import { quickCompatibilityCheck } from './quick-check';

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
  // Quick compatibility check
  console.log('🔍 Verificando compatibilidade do WebContainer...');
  const compatibilityResult = quickCompatibilityCheck();
  
  console.log('📊 Resultado da verificação:', compatibilityResult);

  if (!compatibilityResult.isSupported) {
    console.warn('⚠️ WebContainer não é suportado neste ambiente');
    console.warn('🚫 APIs ausentes:', compatibilityResult.missingApis);
    webcontainerContext.loaded = false;
    webcontainer = Promise.reject(
      new Error(`WebContainer não é suportado: ${compatibilityResult.missingApis.join(', ')}`),
    );
  } else {
    webcontainer =
      import.meta.hot?.data.webcontainer ??
      Promise.race([
        Promise.resolve()
          .then(async () => {
            console.log('🚀 Iniciando WebContainer...');
            console.log('⚙️ Configurações do boot:', {
              coep: 'credentialless',
              workdirName: WORK_DIR_NAME,
              forwardPreviewErrors: true
            });
            
            try {
              const webcontainerInstance = await WebContainer.boot({
                coep: 'credentialless',
                workdirName: WORK_DIR_NAME,
                forwardPreviewErrors: true, // Enable error forwarding from iframes
              });
              console.log('✅ WebContainer.boot() concluído');
              return webcontainerInstance;
            } catch (error) {
              console.error('❌ Erro no WebContainer.boot():', error);
              throw error;
            }
          }),
        // Timeout de 30 segundos
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: WebContainer demorou mais de 30 segundos para inicializar')), 30000)
        )
      ])
        .then(async (webcontainer) => {
          console.log('✅ WebContainer inicializado com sucesso');
          webcontainerContext.loaded = true;

          const { workbenchStore } = await import('~/lib/stores/workbench');

          try {
            const response = await fetch('/inspector-script.js');
            const inspectorScript = await response.text();
            await (webcontainer as WebContainer).setPreviewScript(inspectorScript);
            console.log('✅ Inspector script carregado');
          } catch (error) {
            console.warn('⚠️ Falha ao carregar inspector script:', error);
          }

          // Listen for preview errors
          (webcontainer as WebContainer).on('preview-message', (message: any) => {
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

          return webcontainer as WebContainer;
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
