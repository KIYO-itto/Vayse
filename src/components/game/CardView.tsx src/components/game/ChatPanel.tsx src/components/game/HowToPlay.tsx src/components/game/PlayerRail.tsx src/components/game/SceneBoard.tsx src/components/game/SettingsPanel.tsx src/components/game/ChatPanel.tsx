'use client';

import { useEffect, useRef, useState } from 'react';
import type { ChatMsg } from '@/game/engine';

interface ChatPanelProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  messages: ChatMsg[];
  selfId: string;
  onSend: (text: string) => void;
}

const NAME_COLORS = [
  'text-red-400',
  'text-amber-400',
  'text-emerald-400',
  'text-sky-400',
  'text-fuchsia-400',
  'text-lime-400',
  'text-orange-400',
  'text-cyan-400',
];

function colorFor(name: string): string {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 997;
  return NAME_COLORS[h % NAME_COLORS.length];
}

function timeStr(ts: number): string {
  return new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatPanel({ open, setOpen, messages, selfId, onSend }: ChatPanelProps) {
  const [text, setText] = useState('');
  const [unread, setUnread] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const lastLen = useRef(messages.length);

  useEffect(() => {
    if (!open && messages.length > lastLen.current) {
      setUnread((u) => u + (messages.length - lastLen.current));
    }
    lastLen.current = messages.length;
  }, [messages.length, open]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [open, messages.length]);

  function send() {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText('');
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="fixed right-4 bottom-4 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-amber-700/50 bg-gradient-to-b from-[#3a2410] to-[#170d05] text-2xl shadow-[0_10px_26px_rgba(0,0,0,0.6)] ring-1 ring-black/60 transition-transform hover:scale-105 active:scale-95"
        aria-label="Abrir chat"
      >
        💬
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow-lg anim-pop">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex h-[78vh] flex-col rounded-t-2xl border border-amber-900/50 bg-[#14100a]/97 shadow-2xl backdrop-blur sm:inset-x-auto sm:right-4 sm:bottom-20 sm:h-[30rem] sm:w-96 sm:rounded-2xl anim-fade-up">
          <div className="flex items-center justify-between border-b border-amber-900/40 px-4 py-3">
            <span className="font-display text-sm font-black tracking-widest text-amber-300 uppercase">
              💬 Discussão
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
            >
              ✕
            </button>
          </div>

          <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
            {messages.length === 0 && (
              <p className="pt-8 text-center text-sm text-zinc-500">Nenhuma mensagem ainda. Quebre o gelo! 🧊</p>
            )}
            {messages.map((m) =>
              m.playerId === 'system' ? (
                <div key={m.id} className="flex justify-center">
                  <span className="rounded-full border border-amber-900/40 bg-black/40 px-3 py-1 text-center text-[11px] text-amber-200/70 italic">
                    {m.text}
                  </span>
                </div>
              ) : (
                <div key={m.id} className={`flex flex-col ${m.playerId === selfId ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm shadow-md ${
                      m.playerId === selfId
                        ? 'rounded-br-sm border border-red-900/60 bg-gradient-to-b from-red-900/80 to-red-950/90 text-white'
                        : 'rounded-bl-sm border border-zinc-800 bg-zinc-900/90 text-zinc-100'
                    }`}
                  >
                    <span className={`mr-2 text-[10px] font-bold uppercase ${colorFor(m.name)}`}>{m.name}</span>
                    {m.text}
                  </div>
                  <span className="mt-0.5 px-1 text-[9px] text-zinc-600">{timeStr(m.ts)}</span>
                </div>
              )
            )}
          </div>

          <div className="flex gap-2 border-t border-amber-900/40 p-3">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Escreva sua teoria…"
              maxLength={300}
              className="engraved-input min-w-0 flex-1 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600"
            />
            <button
              type="button"
              onClick={send}
              className="wax-btn rounded-lg px-4 py-2.5 text-sm font-black text-white uppercase"
            >
              Enviar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
