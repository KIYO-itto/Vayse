'use client';

import type { PublicPlayer, VoteResult } from '@/game/engine';

const AVATARS = ['🕵️', '🥷', '👮', '🧑‍⚖️', '🕴️', '💃', '🧛', '🦹', '👩‍💼', '🧑‍🔬', '🤠', '🧙', '🎩', '🕶️'];

export function avatarFor(name: string): string {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 997;
  return AVATARS[h % AVATARS.length];
}

interface PlayerRailProps {
  players: PublicPlayer[];
  selfId: string;
  voting?: boolean;
  voteTarget?: string | null;
  onVote?: (playerId: string) => void;
  onKick?: (playerId: string) => void;
  voteResult?: VoteResult[] | null;
  showRoles?: boolean;
  knownMurdererId?: string | null;
}

export default function PlayerRail({
  players,
  selfId,
  voting,
  voteTarget,
  onVote,
  onKick,
  voteResult,
  showRoles,
  knownMurdererId,
}: PlayerRailProps) {
  const resultMap = voteResult ? new Map(voteResult.map((r) => [r.playerId, r])) : null;

  return (
    <div className="no-scrollbar flex items-stretch gap-2 overflow-x-auto pb-2 md:flex-wrap md:justify-center">
      {players.map((p) => {
        const isSelf = p.id === selfId;
        const dead = !p.alive;
        const isTarget = voting && voteTarget === p.id;
        const res = resultMap?.get(p.id);

        let ring = 'border-zinc-800 bg-gradient-to-b from-[#1c1409]/95 to-[#0e0905]/95';
        if (dead) ring = 'border-zinc-800/80 bg-zinc-900/60';
        else if (isTarget) ring = 'border-red-500 bg-gradient-to-b from-red-950/80 to-[#16080a] shadow-[0_0_24px_rgba(239,68,68,0.5)] -translate-y-1';
        else if (showRoles && !p.murderer && knownMurdererId === p.id)
          ring = 'border-red-600 bg-gradient-to-b from-red-950/60 to-[#150709] shadow-[0_0_16px_rgba(225,29,72,0.4)]';
        else if (showRoles && p.murderer)
          ring = 'border-red-600 bg-gradient-to-b from-red-950/60 to-[#150709] shadow-[0_0_16px_rgba(225,29,72,0.4)]';
        else if (showRoles && p.forensic)
          ring = 'border-amber-600/70 bg-gradient-to-b from-amber-950/50 to-[#140f06]';
        else if (isSelf) ring = 'border-sky-700/70 bg-gradient-to-b from-sky-950/40 to-[#061018]';

        return (
          <button
            key={p.id}
            type="button"
            disabled={!voting || dead || p.voted}
            onClick={() => onVote?.(p.id)}
            className={[
              'relative flex w-[4.7rem] shrink-0 flex-col items-center rounded-xl border px-1 pt-2 pb-1.5 transition-all duration-150 sm:w-20',
              ring,
              voting && !dead && !p.voted ? 'cursor-pointer hover:-translate-y-1 hover:border-amber-500/70 active:scale-95' : '',
              dead ? 'opacity-55' : '',
            ].join(' ')}
          >
            {/* disco de avatar */}
            <div className="relative">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-xl shadow-[inset_0_2px_5px_rgba(0,0,0,0.6)] ring-1 ring-black/60 sm:h-11 sm:w-11 sm:text-2xl ${
                  dead ? 'bg-zinc-900 grayscale' : 'bg-gradient-to-b from-[#3a2c14] to-[#1c1308]'
                }`}
              >
                {avatarFor(p.name)}
              </div>
              {dead && (
                <span className="absolute inset-0 flex items-center justify-center text-lg drop-shadow">💀</span>
              )}
              {showRoles && !dead && p.forensic && (
                <span className="absolute -top-1.5 -right-1.5 rounded-full bg-black/80 px-1 text-[10px] ring-1 ring-amber-600/60">
                  🔬
                </span>
              )}
              {showRoles && !dead && (p.murderer || knownMurdererId === p.id) && (
                <span className="absolute -top-1.5 -right-1.5 rounded-full bg-black/80 px-1 text-[10px] ring-1 ring-red-600/60">
                  🔪
                </span>
              )}
            </div>

            <span className="mt-1 w-full truncate text-center text-[10px] font-bold text-zinc-100 sm:text-[11px]">
              {p.name}
              {isSelf && <span className="text-sky-400"> (vc)</span>}
            </span>

            <span className="text-[8px] text-zinc-500">
              {p.isHost && '👑 '}
              {!p.connected && !dead ? '● ausente' : dead ? 'preso' : ''}
            </span>

            {/* fichas de votos recebidos */}
            {res && (
              <span className="mt-0.5 flex h-3 items-center gap-0.5">
                {Array.from({ length: res.votes }).map((_, i) => (
                  <span key={i} className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.8)]" />
                ))}
                {res.executed && <span className="text-[10px]">🚔</span>}
              </span>
            )}

            {/* marcador de voto dado */}
            {voting && p.voted && (
              <span className="absolute -top-1 -left-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[9px] font-black text-black shadow-md anim-pop">
                ✓
              </span>
            )}

            {/* expulsar no lobby */}
            {onKick && p.id !== selfId && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onKick(p.id);
                }}
                className="absolute top-1 right-1 z-10 cursor-pointer rounded-md bg-black/60 px-1 text-[10px] text-zinc-400 ring-1 ring-zinc-700 hover:bg-red-900 hover:text-red-200"
              >
                ✕
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
