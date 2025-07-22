import React from 'react';

const EXAMPLE_PROMPTS = [
  { text: 'Crie um app móvel sobre tecnologia' },
  { text: 'Construa um app de tarefas em React com Tailwind' },
  { text: 'Crie um blog simples usando Astro' },
  { text: 'Crie um formulário de consentimento de cookies com Material UI' },
  { text: 'Faça um jogo space invaders' },
  { text: 'Faça um jogo da velha em html, css e js apenas' },
];

export function ExamplePrompts(sendMessage?: { (event: React.UIEvent, messageInput?: string): void | undefined }) {
  return (
    <div id="examples" className="relative flex flex-col gap-9 w-full max-w-3xl mx-auto flex justify-center mt-6">
      <div
        className="flex flex-wrap justify-center gap-2"
        style={{
          animation: '.25s ease-out 0s 1 _fade-and-move-in_g2ptj_1 forwards',
        }}
      >
        {EXAMPLE_PROMPTS.map((examplePrompt, index: number) => {
          return (
            <button
              key={index}
              onClick={(event) => {
                sendMessage?.(event, examplePrompt.text);
              }}
              className="group relative px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:border-white/30 text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary text-sm font-medium transition-all duration-300 hover:scale-105 hover:rotate-1"
            >
              <span className="relative z-10">{examplePrompt.text}</span>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
