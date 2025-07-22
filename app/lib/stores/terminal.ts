import type { WebContainer, WebContainerProcess } from '@webcontainer/api';
import { atom, type WritableAtom } from 'nanostores';
import type { ITerminal } from '~/types/terminal';
import { newBoltShellProcess, newShellProcess } from '~/utils/shell';
import { coloredText } from '~/utils/terminal';

export class TerminalStore {
  #webcontainer: Promise<WebContainer>;
  #terminals: Array<{ terminal: ITerminal; process: WebContainerProcess }> = [];
  #boltTerminal = newBoltShellProcess();

  showTerminal: WritableAtom<boolean> = import.meta.hot?.data.showTerminal ?? atom(true);

  constructor(webcontainerPromise: Promise<WebContainer>) {
    this.#webcontainer = webcontainerPromise;

    if (import.meta.hot) {
      import.meta.hot.data.showTerminal = this.showTerminal;
    }
  }
  get boltTerminal() {
    return this.#boltTerminal;
  }

  toggleTerminal(value?: boolean) {
    this.showTerminal.set(value !== undefined ? value : !this.showTerminal.get());
  }
  async attachBoltTerminal(terminal: ITerminal) {
    try {
      console.log('🔗 Conectando Bolt terminal...');

      const wc = await this.#webcontainer;
      console.log('✅ WebContainer obtido, inicializando terminal...');
      await this.#boltTerminal.init(wc, terminal);
      console.log('✅ Bolt terminal conectado com sucesso');
    } catch (error: any) {
      console.error('❌ Erro ao conectar Bolt terminal:', error);
      terminal.write(coloredText.red('Failed to spawn bolt shell\n\n') + error.message);

      return;
    }
  }

  async attachTerminal(terminal: ITerminal) {
    try {
      console.log('🔗 Conectando terminal adicional...');

      const shellProcess = await newShellProcess(await this.#webcontainer, terminal);
      this.#terminals.push({ terminal, process: shellProcess });
      console.log('✅ Terminal adicional conectado com sucesso');
    } catch (error: any) {
      console.error('❌ Erro ao conectar terminal adicional:', error);
      terminal.write(coloredText.red('Failed to spawn shell\n\n') + error.message);

      return;
    }
  }

  onTerminalResize(cols: number, rows: number) {
    for (const { process } of this.#terminals) {
      process.resize({ cols, rows });
    }
  }

  async detachTerminal(terminal: ITerminal) {
    const terminalIndex = this.#terminals.findIndex((t) => t.terminal === terminal);

    if (terminalIndex !== -1) {
      const { process } = this.#terminals[terminalIndex];

      try {
        process.kill();
      } catch (error) {
        console.warn('Failed to kill terminal process:', error);
      }
      this.#terminals.splice(terminalIndex, 1);
    }
  }
}
