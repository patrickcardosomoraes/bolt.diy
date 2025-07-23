import { useEffect, useState } from 'react';
import { quickCompatibilityCheck } from '~/lib/webcontainer/quick-check';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
}

export default function Diagnostic() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);

    const diagnostics: DiagnosticResult[] = [];

    // Use quick compatibility check first
    const compatCheck = quickCompatibilityCheck();

    // Test 0: Browser Detection
    diagnostics.push({
      name: 'Navegador Detectado',
      status: 'success',
      message: `${compatCheck.details.browser} - UserAgent: ${navigator.userAgent}`,
    });

    // Test 1: Basic browser APIs
    try {
      diagnostics.push({
        name: 'SharedArrayBuffer',
        status: typeof SharedArrayBuffer !== 'undefined' ? 'success' : 'error',
        message:
          typeof SharedArrayBuffer !== 'undefined' ? 'Disponível' : 'Não disponível - necessário para WebContainer',
      });
    } catch (error) {
      diagnostics.push({
        name: 'SharedArrayBuffer',
        status: 'error',
        message: `Erro ao verificar: ${error}`,
      });
    }

    // Test 2: ServiceWorker API
    try {
      diagnostics.push({
        name: 'ServiceWorker',
        status: typeof ServiceWorker !== 'undefined' ? 'success' : 'error',
        message: typeof ServiceWorker !== 'undefined' ? 'Disponível' : 'Não disponível - necessário para WebContainer',
      });
    } catch (error) {
      diagnostics.push({
        name: 'ServiceWorker',
        status: 'error',
        message: `Erro ao verificar: ${error}`,
      });
    }

    // Test 3: Worker API
    try {
      diagnostics.push({
        name: 'Worker',
        status: typeof Worker !== 'undefined' ? 'success' : 'error',
        message: typeof Worker !== 'undefined' ? 'Disponível' : 'Não disponível - necessário para WebContainer',
      });
    } catch (error) {
      diagnostics.push({
        name: 'Worker',
        status: 'error',
        message: `Erro ao verificar: ${error}`,
      });
    }

    // Test 4: Cross-Origin Isolation (crucial for Safari)
    try {
      const isCrossOriginIsolated = typeof crossOriginIsolated !== 'undefined' ? crossOriginIsolated : false;
      diagnostics.push({
        name: 'Cross-Origin Isolation',
        status: isCrossOriginIsolated ? 'success' : 'error',
        message: isCrossOriginIsolated
          ? 'Cross-Origin Isolation habilitado'
          : 'Cross-Origin Isolation desabilitado - necessário para SharedArrayBuffer',
      });
    } catch (error) {
      diagnostics.push({
        name: 'Cross-Origin Isolation',
        status: 'error',
        message: `Erro ao verificar: ${error}`,
      });
    }

    // Test 5: Safari-specific checks
    if (compatCheck.details.isSafari) {
      try {
        const safariVersion =
          typeof compatCheck.details.safariVersion === 'number' ? compatCheck.details.safariVersion : 0;
        diagnostics.push({
          name: 'Versão do Safari',
          status: safariVersion >= 15 ? 'success' : 'warning',
          message:
            safariVersion >= 15
              ? `Safari ${safariVersion} - versão suportada`
              : `Safari ${safariVersion} - recomendado versão 15+`,
        });

        // Check Safari-specific features
        const hasPrivateClickMeasurement = 'attribution' in navigator;
        diagnostics.push({
          name: 'Recursos Safari Modernos',
          status: hasPrivateClickMeasurement ? 'success' : 'warning',
          message: hasPrivateClickMeasurement ? 'Safari com recursos modernos' : 'Safari pode estar desatualizado',
        });
      } catch (error) {
        diagnostics.push({
          name: 'Verificação Safari',
          status: 'error',
          message: `Erro ao verificar Safari: ${error}`,
        });
      }
    }

    // Test 6: Environment detection
    try {
      const userAgent = navigator.userAgent;
      const isCloudflareWorker = userAgent.includes('CloudFlareWorker');
      diagnostics.push({
        name: 'Ambiente',
        status: isCloudflareWorker ? 'warning' : 'success',
        message: isCloudflareWorker
          ? `Cloudflare Worker detectado - UserAgent: ${userAgent}`
          : `Ambiente normal - UserAgent: ${userAgent}`,
      });
    } catch (error) {
      diagnostics.push({
        name: 'Ambiente',
        status: 'error',
        message: `Erro ao verificar: ${error}`,
      });
    }

    // Test 7: WebContainer import
    try {
      const { WebContainer } = await import('@webcontainer/api');
      diagnostics.push({
        name: 'WebContainer API',
        status: 'success',
        message: 'Módulo importado com sucesso',
      });

      // Test 8: WebContainer boot
      try {
        console.log('🧪 Tentando inicializar WebContainer...');

        const webcontainer = await WebContainer.boot({
          coep: 'credentialless',
          workdirName: 'bolt-test',
        });

        diagnostics.push({
          name: 'WebContainer Boot',
          status: 'success',
          message: 'WebContainer inicializado com sucesso!',
        });

        // Test 9: Basic file operations
        try {
          await webcontainer.fs.writeFile('/test.txt', 'Hello World');

          const content = await webcontainer.fs.readFile('/test.txt', 'utf-8');

          diagnostics.push({
            name: 'Sistema de Arquivos',
            status: content === 'Hello World' ? 'success' : 'error',
            message: content === 'Hello World' ? 'Operações de arquivo funcionando' : `Conteúdo incorreto: ${content}`,
          });
        } catch (error) {
          diagnostics.push({
            name: 'Sistema de Arquivos',
            status: 'error',
            message: `Erro nas operações de arquivo: ${error}`,
          });
        }

        // Test 10: Terminal spawn
        try {
          const process = await webcontainer.spawn('echo', ['Teste terminal']);
          await process.output;

          diagnostics.push({
            name: 'Terminal',
            status: 'success',
            message: 'Terminal pode ser iniciado',
          });
        } catch (error) {
          diagnostics.push({
            name: 'Terminal',
            status: 'error',
            message: `Erro ao iniciar terminal: ${error}`,
          });
        }
      } catch (error) {
        diagnostics.push({
          name: 'WebContainer Boot',
          status: 'error',
          message: `Erro ao inicializar WebContainer: ${error}`,
        });
      }
    } catch (error) {
      diagnostics.push({
        name: 'WebContainer API',
        status: 'error',
        message: `Erro ao importar módulo: ${error}`,
      });
    }

    setResults(diagnostics);
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Diagnóstico WebContainer</h1>

      <div className="mb-4">
        <button
          onClick={runDiagnostics}
          disabled={isRunning}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isRunning ? 'Executando...' : 'Executar Diagnóstico'}
        </button>
      </div>

      <div className="space-y-3">
        {results.map((result, index) => (
          <div
            key={index}
            className={`p-4 rounded border-l-4 ${
              result.status === 'success'
                ? 'bg-green-50 border-green-500 text-green-800'
                : result.status === 'warning'
                  ? 'bg-yellow-50 border-yellow-500 text-yellow-800'
                  : 'bg-red-50 border-red-500 text-red-800'
            }`}
          >
            <h3 className="font-semibold">{result.name}</h3>
            <p className="text-sm mt-1">{result.message}</p>
          </div>
        ))}
      </div>

      {results.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-gray-50 rounded">
            <h3 className="font-semibold mb-2">Resumo:</h3>
            <p>
              ✅ Sucessos: {results.filter((r) => r.status === 'success').length} | ⚠️ Avisos:{' '}
              {results.filter((r) => r.status === 'warning').length} | ❌ Erros:{' '}
              {results.filter((r) => r.status === 'error').length}
            </p>
          </div>

          {navigator.userAgent.includes('Safari') && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
              <h3 className="font-semibold mb-2 text-yellow-800">⚠️ Usuário Safari Detectado</h3>
              <div className="text-sm text-yellow-700 space-y-2">
                <p>
                  <strong>Problemas conhecidos do Safari:</strong>
                </p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>SharedArrayBuffer pode não funcionar sem headers COOP/COEP corretos</li>
                  <li>Cross-Origin Isolation é mais rigorosa que outros navegadores</li>
                  <li>Alguns recursos WebAssembly podem ter limitações</li>
                </ul>
                <p>
                  <strong>Recomendação:</strong> Para melhor compatibilidade com WebContainer, use Chrome, Firefox ou
                  Edge.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
