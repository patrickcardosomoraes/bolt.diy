import { memo } from 'react';
import { quickCompatibilityCheck } from '~/lib/webcontainer/quick-check';

interface TerminalFallbackProps {
  reason?: string;
  onDiagnostic?: () => void;
}

export const TerminalFallback = memo(({ reason, onDiagnostic }: TerminalFallbackProps) => {
  const compatCheck = quickCompatibilityCheck();
  const isSafari = compatCheck.details.isSafari;

  return (
    <div className="h-full flex items-center justify-center bg-bolt-elements-terminals-background">
      <div className="text-center p-8 max-w-md">
        <div className="i-ph:warning-circle text-4xl text-yellow-500 mb-4 mx-auto" />

        <h3 className="text-lg font-semibold text-bolt-elements-textPrimary mb-2">
          {isSafari ? 'Safari: Terminal Limitado' : 'Terminal Não Disponível'}
        </h3>

        <p className="text-bolt-elements-textSecondary mb-4 text-sm leading-relaxed">
          {isSafari
            ? 'O Safari tem limitações com WebContainer devido a políticas de segurança mais rigorosas. Para melhor experiência, recomendamos usar Chrome, Firefox ou Edge.'
            : reason ||
              'O terminal não pode ser carregado neste ambiente. Isso pode ocorrer quando o WebContainer não é suportado pelo navegador ou ambiente de hospedagem.'}
        </p>

        <div className="space-y-2">
          <div className="text-xs text-bolt-elements-textTertiary">
            <strong>{isSafari ? 'Limitações do Safari:' : 'Possíveis causas:'}</strong>
            <ul className="mt-1 text-left list-disc list-inside space-y-1">
              {isSafari ? (
                <>
                  <li>SharedArrayBuffer requer headers COOP/COEP rigorosos</li>
                  <li>Cross-Origin Isolation mais restritiva</li>
                  <li>Políticas de segurança WebKit mais rígidas</li>
                  <li>Versão do Safari pode não suportar todos os recursos</li>
                </>
              ) : (
                <>
                  <li>SharedArrayBuffer não disponível</li>
                  <li>Service Workers bloqueados</li>
                  <li>Ambiente Cloudflare Workers</li>
                  <li>Políticas de segurança restritivas</li>
                </>
              )}
            </ul>
          </div>

          {onDiagnostic && (
            <button
              onClick={onDiagnostic}
              className="mt-4 px-4 py-2 text-xs bg-bolt-elements-button-primary-background 
                       text-bolt-elements-button-primary-text rounded hover:bg-bolt-elements-button-primary-backgroundHover
                       transition-colors"
            >
              Executar Diagnóstico
            </button>
          )}

          <div className="mt-4 p-3 bg-bolt-elements-background-depth-2 rounded text-xs">
            <strong className="text-bolt-elements-textSecondary">
              {isSafari ? 'Navegadores recomendados:' : 'Alternativas:'}
            </strong>
            <p className="text-bolt-elements-textTertiary mt-1">
              {isSafari ? (
                <>
                  • Google Chrome (melhor suporte)
                  <br />
                  • Mozilla Firefox (boa compatibilidade)
                  <br />
                  • Microsoft Edge (também suportado)
                  <br />• Versão mais recente do Safari (experimental)
                </>
              ) : (
                <>
                  • Use um ambiente de desenvolvimento local
                  <br />
                  • Teste em navegadores que suportam SharedArrayBuffer
                  <br />• Verifique se há extensões bloqueando recursos
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});
