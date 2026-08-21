'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PublicRoomInfo, RoomSettings } from '@/game/engine';
import SettingsPanel from '@/components/game/SettingsPanel';

const ROLE_PREVIEW = [
  { emoji: '🔪', name: 'Assassino', desc: 'Escolhe a arma e a pista do crime em segredo', cls: 'border-red-800/70 bg-gradient-to-b from-[#2b0f15] to-[#120609]', tilt: '-rotate-6' },
  { emoji: '🔬', name: 'Perito Forense', desc: 'Sabe quem é, mas só dá dicas numeradas', cls: 'border-yellow-800/60 bg-gradient-to-b from-[#2a2009] to-[#100c04]', tilt: '' },
  { emoji: '🕵️', name: 'Investigador', desc: 'Decifra dicas, discute e vota no culpado', cls: 'border-emerald-800/60 bg-gradient-to-b from-[#0a2415] to-[#06120b]', tilt: 'rotate-6' },
];

function RoleMiniCard({ r }: { r: (typeof ROLE_PREVIEW)[number] }) {
  return (
    <div
      className={`card-sheen relative flex w-28 flex-col items-center rounded-[10px] border p-2 text-center shadow-[0_10px_24px_rgba(0,0,0,0.55)] sm:w-32 ${r.cls} ${r.tilt}`}
    >
      <span className="text-[7px] font-black tracking-[0.25em] text-zinc-500 uppercase">Papel</span>
      <span className="mt-1 text-3xl drop-shadow-[0_3px_6px_rgba(0,0,0,0.6)]">{r.emoji}</span>
      <span className="font-display mt-1 text-[11px] font-bold text-zinc-100 sm:text-xs">{r.name}</span>
      <span className="mt-1 text-[8px] leading-tight text-zinc-500 italic">{r.desc}</span>
      <span className="absolute inset-x-1.5 bottom-1 h-px bg-gradient-to-r from-transparent via-amber-700/50 to-transparent" />
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [rooms, setRooms] = useState<PublicRoomInfo[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState<RoomSettings>({
    maxPlayers: 8,
    maxRounds: 4,
    hintsPerRound: 2,
    isPublic: true,
  });

  useEffect(() => {
    setName(localStorage.getItem('dp_name') ?? '');
  }, []);

  const loadRooms = useCallback(async () => {
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      if (data.ok) setRooms(data.rooms ?? []);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    loadRooms();
    const id = setInterval(loadRooms, 5000);
    return () => clearInterval(id);
  }, [loadRooms]);

  function validName(): string {
    return name.trim().replace(/\s+/g, ' ').slice(0, 20) || 'Detetive';
  }

  async function handleCreate() {
    if (busy) return;
    setBusy('create');
    setError('');
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: validName(), ...settings }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? 'Erro ao criar sala.');
        return;
      }
      localStorage.setItem('dp_pid', data.playerId);
      localStorage.setItem('dp_name', validName());
      router.push(`/room/${data.code}`);
    } finally {
      setBusy(null);
    }
  }

  async function handleJoin(codeArg?: string) {
    if (busy) return;
    const code = (codeArg ?? joinCode).trim().toUpperCase();
    if (!code) {
      setError('Digite o código da sala.');
      return;
    }
    setBusy(`join:${code}`);
    setError('');
    try {
      const res = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, playerName: validName(), playerId: localStorage.getItem('dp_pid') ?? undefined }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? 'Não foi possível entrar na sala.');
        return;
      }
      localStorage.setItem('dp_pid', data.playerId);
      localStorage.setItem('dp_name', validName());
      router.push(`/room/${code}`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* fundo: skyline noir */}
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/hero.jpg')" }} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-[#0a0a08]/85 to-[#0a0a08]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center px-4 py-8 sm:py-12">
        {/* ---------- cabeçalho da caixa ---------- */}
        <header className="anim-fade-up text-center">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-700/40 bg-black/50 px-4 py-1 text-[10px] font-bold tracking-[0.3em] text-amber-300/90 uppercase backdrop-blur">
            <span className="h-1 w-1 rounded-full bg-red-500" />
            谋杀 · Jogo social de dedução · 3–8 jogadores
            <span className="h-1 w-1 rounded-full bg-red-500" />
          </p>

          <h1 className="font-display text-5xl font-black tracking-wide text-transparent sm:text-7xl bg-gradient-to-b from-amber-100 via-amber-300 to-amber-600 bg-clip-text drop-shadow-[0_2px_18px_rgba(217,119,6,0.35)]">
            DECEPTION
          </h1>

          <div className="mx-auto mt-3 flex max-w-md items-center gap-3">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-red-700/70" />
            <p className="text-sm font-bold tracking-[0.4em] text-red-400 uppercase sm:text-base">Murder in Hong Kong</p>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-red-700/70" />
          </div>

          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-zinc-400">
            Um crime, um assassino escondido, um perito que sabe demais — e investigadores que só têm as dicas para
            desvendar tudo.
          </p>
        </header>

        {/* ---------- painel de madeira (criar / entrar) ---------- */}
        <section className="anim-fade-up mt-9 w-full max-w-md" style={{ animationDelay: '0.1s' }}>
          <div className="plaque plaque-wood relative p-6">
            <span className="screw top-2 left-2" />
            <span className="screw top-2 right-2" />
            <span className="screw bottom-2 left-2" />
            <span className="screw bottom-2 right-2" />

            <p className="text-center text-[10px] font-black tracking-[0.35em] text-amber-500/90 uppercase">
              Mesa de jogo
            </p>

            <label className="mt-4 mb-1.5 block text-[10px] font-black tracking-[0.2em] text-amber-200/70 uppercase">
              Nome do detetive
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              placeholder="Ex.: Sr. Wong"
              className="engraved-input mb-4 w-full rounded-lg px-4 py-3 text-zinc-100 placeholder-zinc-600"
            />

            <SettingsPanel value={settings} onChange={setSettings} />

            <button
              type="button"
              onClick={handleCreate}
              disabled={busy !== null}
              className="wax-btn anim-glow w-full rounded-xl py-3.5 font-display text-base font-black tracking-wider text-white uppercase"
            >
              {busy === 'create' ? 'Criando…' : '🔪 Criar nova sala'}
            </button>

            <div className="my-4 flex items-center gap-3 text-[10px] font-black tracking-[0.3em] text-amber-600/80 uppercase">
              <span className="h-px flex-1 bg-amber-800/40" /> ou <span className="h-px flex-1 bg-amber-800/40" />
            </div>

            <div className="flex gap-2">
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                maxLength={5}
                placeholder="CÓDIGO"
                className="engraved-input min-w-0 flex-1 rounded-lg px-4 py-3 text-center font-mono text-lg font-black tracking-[0.3em] text-amber-300 uppercase placeholder-zinc-600"
              />
              <button
                type="button"
                onClick={() => handleJoin()}
                disabled={busy !== null || joinCode.trim().length < 3}
                className="gold-btn rounded-lg px-5 font-display text-sm font-black tracking-widest text-amber-200 uppercase"
              >
                Entrar
              </button>
            </div>

            {error && (
              <p className="mt-3 rounded-lg border border-red-800/60 bg-red-950/60 px-3 py-2 text-center text-sm text-red-300 anim-pop">
                {error}
              </p>
            )}
          </div>

          {/* ---------- salas públicas ---------- */}
          {rooms.length > 0 && (
            <div className="plaque plaque-wood relative mt-5 p-4">
              <span className="screw top-2 left-2" />
              <span className="screw top-2 right-2" />
              <span className="screw bottom-2 left-2" />
              <span className="screw bottom-2 right-2" />
              <h2 className="mb-3 text-center text-[10px] font-black tracking-[0.3em] text-amber-400 uppercase">
                🏮 Salas públicas abertas
              </h2>
              <div className="space-y-2">
                {rooms.map((r) => (
                  <div
                    key={r.code}
                    className="flex items-center justify-between rounded-lg border border-amber-900/40 bg-black/40 px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="font-mono text-sm font-black tracking-[0.2em] text-amber-300">{r.code}</p>
                      <p className="truncate text-[11px] text-zinc-500">
                        👑 {r.hostName} · {r.count}/{r.maxPlayers} jogadores
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleJoin(r.code)}
                      disabled={busy !== null}
                      className="wax-btn rounded-lg px-3 py-2 text-xs font-black text-white uppercase"
                    >
                      Entrar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ---------- modo offline (arquivo HTML) ---------- */}
        <section className="anim-fade-up mt-5 w-full max-w-md" style={{ animationDelay: '0.15s' }}>
          <div className="plaque plaque-wood relative p-5 text-center">
            <span className="screw top-2 left-2" />
            <span className="screw top-2 right-2" />
            <span className="screw bottom-2 left-2" />
            <span className="screw bottom-2 right-2" />
            <p className="text-[10px] font-black tracking-[0.3em] text-amber-400 uppercase">📦 Modo offline — 1 aparelho</p>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
              Todo o jogo em <b className="text-amber-300">1 único arquivo HTML</b>: jogue 3–8 pessoas passando o
              celular/PC de mão em mão, sem servidor e sem internet.
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <a
                href="/jogo-offline.html"
                target="_blank"
                rel="noreferrer"
                className="gold-btn w-full rounded-xl py-3 font-display text-sm font-black tracking-widest text-amber-100 uppercase"
              >
                🎲 Jogar agora
              </a>
              <a
                href="/jogo-offline.html"
                download="deception-murder-in-hong-kong.html"
                className="wax-btn w-full rounded-xl py-3 font-display text-sm font-black tracking-widest text-white uppercase"
              >
                ⬇️ Baixar o HTML
              </a>
            </div>
          </div>
        </section>

        {/* ---------- cartas de papel ---------- */}
        <section
          className="anim-fade-up mt-10 flex items-end justify-center gap-1 sm:gap-3"
          style={{ animationDelay: '0.2s' }}
        >
          {ROLE_PREVIEW.map((r, i) => (
            <div key={r.name} className={i === 1 ? 'z-10 -translate-y-2' : ''}>
              <RoleMiniCard r={r} />
            </div>
          ))}
        </section>

        <footer className="mt-8 pb-4 text-center text-[10px] tracking-widest text-zinc-600 uppercase">
          Fan game multiplayer · celular e PC 📱💻
        </footer>
      </div>
    </main>
  );
}
