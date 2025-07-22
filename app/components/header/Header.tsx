import { useStore } from '@nanostores/react';
import { ClientOnly } from 'remix-utils/client-only';
import { chatStore } from '~/lib/stores/chat';
import { classNames } from '~/utils/classNames';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { ChatDescription } from '~/lib/persistence/ChatDescription.client';

export function Header() {
  const chat = useStore(chatStore);

  return (
    <header
      className={classNames('flex items-center px-6 border-b h-[var(--header-height)] backdrop-blur-sm', {
        'border-transparent shadow-sm bg-gradient-to-r from-gray-50/95 via-gray-100/90 to-gray-200/85 dark:bg-gradient-to-r dark:from-gray-900/95 dark:via-gray-800/90 dark:to-gray-900/85':
          !chat.started,
        'border-bolt-elements-borderColor shadow-lg bg-gradient-to-r from-white/95 via-gray-50/90 to-gray-100/85 dark:bg-gradient-to-r dark:from-gray-900/95 dark:via-gray-800/90 dark:to-gray-900/85':
          chat.started,
      })}
    >
      <div className="flex items-center gap-3 z-logo">
        <div className="i-ph:sidebar-simple-duotone text-xl text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary transition-colors" />
        <a
          href="/"
          className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent hover:scale-105 transition-transform flex items-center"
        >
          <img
            src="/hubia360-logo.png"
            alt="Hubia360"
            className="w-[120px] h-auto inline-block dark:hidden drop-shadow-sm"
          />
          <img
            src="/hubia360-darkmode.png"
            alt="Hubia360"
            className="w-[120px] h-auto inline-block hidden dark:block drop-shadow-sm"
          />
        </a>
      </div>
      {chat.started && ( // Display ChatDescription and HeaderActionButtons only when the chat has started.
        <>
          <span className="flex-1 px-4 truncate text-center text-bolt-elements-textPrimary">
            <ClientOnly>{() => <ChatDescription />}</ClientOnly>
          </span>
          <ClientOnly>
            {() => (
              <div className="">
                <HeaderActionButtons chatStarted={chat.started} />
              </div>
            )}
          </ClientOnly>
        </>
      )}
    </header>
  );
}
