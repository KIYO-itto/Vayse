'use client';

import { useMemo } from 'react';
import type { CardDef } from '@/game/cards';
import type { PublicPlayer, RevealedHand, SceneEntryView, VoteResult } from '@/game/engine';
import SceneBoard from './SceneBoard';
import { avatarFor } from './PlayerRail';

interface TableViewProps {
  players: PublicPlayer[];
  maxPlayers: number;
  selfId: string;
  selfHand?: CardDef[];
  revealedHands?: RevealedHand[] | null;
  showRoles?: boolean;
  knownMurdererId?: string | null;
  forensicPickId?: string | null;
  voting?: boolean;
  voteTarget?: string | null;
  onVote?: (id: string) => void;
  onKick?: (id: string) => void;
  voteResult?: VoteResult[] | null;
  scene: SceneEntryView[];
}

function MiniCard({ card, back }: { card?: CardDef; back?: boolean }) {
  if (back || !card) {
    return (
      <div className="card-back-mini relative aspect-[5/7] w-6 rounded-[3px] sm:w-7">
        <span className="absolute inset-0 flex items-center justify-center text-[7px] opacity-80">🔮</span>
      </div>
    );
  }
  const isMeans = card.type === 'means';
  return (
    <div
      className={`flex aspect-[5/7] w-6 items-center justify-center rounded-[3px] border text-[10px] sm:w-7 ${
        isMeans
          ? 'border-red-800/80 bg-gradient-to-b from-[#2b0f15] to-[#120609]'
          : 'border-yellow-800/70 bg-gradient-to-b from-[#2a2009] to-[#100c04]'
      }`}
      title={card.name}
    >
      {card.emoji}
    </div>
  );
}

export default function TableView({
  players,
  maxPlayers,
  selfId,
  selfHand = [],
  revealedHands = null,
  showRoles = false,
  knownMurdererId = null,
  forensicPickId = null,
  voting = false,
  voteTarget = null,
  onVote,
  onKick,
  voteResult = null,
  scene,
}: TableViewProps) {
  const n = Math.max(1, Math.min(maxPlayers, 12));

  // posições das cadeiras em elipse (percentuais do contêiner)
  const seats = useMemo(
    () =>
      Array.from({ length: n }, (_, i) => {
        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
        return {
          left: 50 + 45.5 * Math.cos(angle),
          top: 50 + 41 * Math.sin(angle),
        };
      }),
    [n]
  );

  // jogador sempre fica na cadeira de baixo (como no jogo de PC)
  const selfIdx = players.findIndex((p) => p.id === selfId);
  const selfSeat = Math.floor(n / 2);
  const offset = selfIdx >= 0 ? (selfSeat - selfIdx + n) % n : 0;
  const occupied = new Set(players.map((_, k) => (k + offset) % n));
  const seatOf = (k: number) => (k + offset) % n;
  const playerAt = (seat: number) => players.find((_, k) => seatOf(k) === seat);

  const resultMap = useMemo(() => {
    const m = new Map<string, VoteResult>();
    voteResult?.forEach((r) => m.set(r.playerId, r));
    return m;
  }, [voteResult]);

  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-3xl sm:aspect-[16/9] sm:max-w-5xl">
      {/* tampo da mesa */}
      <div className="absolute left-1/2 top-1/2 h-[86%] w-[94%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-amber-900/50 bg-[radial-gradient(ellipse_at_center,#17220f_0%,#0c1206_72%)] shadow-[inset_0_0_70px_rgba(0,0,0,0.75),0_18px_40px_rgba(0,0,0,0.55)]">
        <div className="absolute inset-[3%] rounded-[50%] border border-amber-800/30" />
      </div>

      {/* tabuleiro de investigação no centro */}
      <div className="absolute inset-x-[12%] inset-y-[16%] sm:inset-x-[13%] sm:inset-y-[13%]">
        <SceneBoard entries={scene} compact />
      </div>

      {/* cadeiras */}
      {seats.map((pos, seat) => {
        const p = playerAt(seat);
        const empty = !p;
        const isSelf = p?.id === selfId;
        const dead = p ? !p.alive : false;
        const isTarget = voting && voteTarget === p?.id;
        const res = p ? resultMap.get(p.id) : undefined;
        const revealed = revealedHands?.find((r) => r.playerId === p?.id)?.cards;
        const faceUp = revealed ? true : isSelf;
        const handCards = p ? revealed ?? (isSelf ? selfHand : []) : [];
        const showCount = p && !faceUp ? 8 : 0;

        return (
          <div
            key={seat}
            className="absolute z-10 flex flex-col items-center"
            style={{ left: `${pos.left}%`, top: `${pos.top}%`, transform: 'translate(-50%, -50%)' }}
          >
            {empty ? (
              <div className="flex flex-col items-center gap-0.5 opacity-55">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-amber-900/40 bg-black/45 text-lg shadow-[inset_0_2px_6px_rgba(0,0,0,0.7)] sm:h-12 sm:w-12">
                  🪑
                </div>
                <span className="w-12 truncate text-center text-[8px] text-zinc-600">cadeira {seat + 1}</span>
              </div>
            ) : (
              <>
                {/* cartas na frente do jogador */}
                <div className="mb-1 flex min-h-[1.7rem] items-end">
                  {faceUp ? (
                    <>
                      <div className="flex">
                        {handCards.slice(0, 4).map((c, j) => (
                          <div key={c.id} className={j > 0 ? '-ml-1.5' : ''}>
                            <MiniCard card={c} />
                          </div>
                        ))}
                      </div>
                      {handCards.length > 4 && (
                        <span className="ml-1 text-[8px] font-black text-amber-300">+{handCards.length - 4}</span>
                      )}
                      {handCards.length === 0 && <span className="text-[8px] text-zinc-600">—</span>}
                    </>
                  ) : (
                    <>
                      <div className="flex -space-x-2">
                        {[0, 1, 2, 3].map((j) => (
                          <MiniCard key={j} back />
                        ))}
                      </div>
                      {showCount > 0 && (
                        <span className="ml-1 text-[8px] font-bold text-zinc-500">{showCount}</span>
                      )}
                    </>
                  )}
                </div>

                {/* ficha do jogador */}
                <button
                  type="button"
                  disabled={!voting || dead || p.voted}
                  onClick={() => onVote?.(p.id)}
                  className={[
                    'relative flex h-11 w-11 items-center justify-center rounded-full border text-xl shadow-[0_4px_10px_rgba(0,0,0,0.6)] transition-all sm:h-12 sm:w-12 sm:text-2xl',
                    dead
                      ? 'border-zinc-800 bg-zinc-900 grayscale'
                      : isTarget
                        ? 'anim-glow border-red-500 bg-gradient-to-b from-red-800 to-red-950 scale-110'
                        : showRoles && !p.murderer && knownMurdererId === p.id
                          ? 'border-red-600 bg-gradient-to-b from-red-800 to-red-950'
                          : showRoles && p.murderer
                            ? 'border-red-600 bg-gradient-to-b from-red-800 to-red-950'
                            : showRoles && p.forensic
                              ? 'border-amber-600/80 bg-gradient-to-b from-amber-800 to-amber-950'
                              : isSelf
                                ? 'border-sky-600/80 bg-gradient-to-b from-sky-800 to-sky-950'
                                : 'border-amber-900/60 bg-gradient-to-b from-[#3a2c14] to-[#1c1308]',
                    voting && !dead && !p.voted ? 'cursor-pointer hover:scale-110 active:scale-95' : '',
                  ].join(' ')}
                >
                  <span className="drop-shadow-[0_2px_3px_rgba(0,0,0,0.6)]">{avatarFor(p.name)}</span>

                  {/* distintivos */}
                  {p.isHost && (
                    <span className="absolute -top-1.5 -left-1.5 rounded-full bg-black/85 px-0.5 text-[10px] ring-1 ring-amber-600/70">
                      👑
                    </span>
                  )}
                  {showRoles && !dead && p.forensic && (
                    <span className="absolute -top-1.5 -right-1.5 rounded-full bg-black/85 px-0.5 text-[10px] ring-1 ring-amber-600/70">
                      🔬
                    </span>
                  )}
                  {forensicPickId === p.id && !showRoles && !dead && (
                    <span
                      className="absolute -top-1.5 -right-1.5 rounded-full bg-black/85 px-0.5 text-[10px] ring-1 ring-amber-500/80"
                      title="Designado como Perito Forense pelo anfitrião"
                    >
                      🔬
                    </span>
                  )}
                  {showRoles && !dead && (p.murderer || knownMurdererId === p.id) && (
                    <span className="absolute -top-1.5 -right-1.5 rounded-full bg-black/85 px-0.5 text-[10px] ring-1 ring-red-600/70">
                      🔪
                    </span>
                  )}
                  {voting && p.voted && !dead && (
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[9px] font-black text-black shadow anim-pop">
                      ✓
                    </span>
                  )}
                  {res?.executed && (
                    <span className="absolute -bottom-1 -right-1 text-[12px]">🚔</span>
                  )}
                  {dead && (
                    <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 text-base">💀</span>
                  )}
                </button>

                <span className="mt-0.5 w-14 truncate text-center text-[8px] font-bold text-zinc-200 sm:w-16 sm:text-[9px]">
                  {p.name}
                </span>

                {/* votos recebidos */}
                {res && (
                  <span className="mt-0.5 flex h-2.5 items-center gap-0.5">
                    {Array.from({ length: res.votes }).map((_, j) => (
                      <span key={j} className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.8)]" />
                    ))}
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
                    className="absolute -top-1 right-0 z-20 cursor-pointer rounded-md bg-black/70 px-1 text-[10px] text-zinc-300 ring-1 ring-zinc-700 hover:bg-red-900 hover:text-red-200"
                  >
                    ✕
                  </span>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
