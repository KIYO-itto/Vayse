'use client';

import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { SceneEntryView } from '@/game/engine';
import CardView from './CardView';

interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export default function SceneBoard({ entries, compact = false }: { entries: SceneEntryView[]; compact?: boolean }) {
  const boardRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);

  const sorted = useMemo(
    () => [...entries].sort((a, b) => a.round - b.round || a.slot - b.slot),
    [entries]
  );

  useLayoutEffect(() => {
    const measure = () => {
      const board = boardRef.current;
      if (!board) return;
      const br = board.getBoundingClientRect();
      const pts: { x: number; y: number }[] = [];
      sorted.forEach((_, i) => {
        const el = cardRefs.current[i];
        if (!el) return;
        const r = el.getBoundingClientRect();
        pts.push({ x: r.left + r.width / 2 - br.left, y: r.top - br.top + 2 });
      });
      const seg: Segment[] = [];
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        seg.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
      }
      setSegments(seg);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (boardRef.current) ro.observe(boardRef.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [sorted]);

  const path = segments
    .map(
      (s) =>
        `M ${s.x1} ${s.y1} Q ${(s.x1 + s.x2) / 2} ${Math.max(s.y1, s.y2) + 24} ${s.x2} ${s.y2}`
    )
    .join(' ');

  return (
    <div
      ref={boardRef}
      className={`cork-bg relative overflow-y-auto rounded-2xl border border-[#4a3b22] shadow-[inset_0_0_50px_rgba(0,0,0,0.65),0_16px_36px_rgba(0,0,0,0.55)] ${
        compact ? 'p-2.5' : 'p-4'
      }`}
    >
      {/* fita de cena do crime */}
      <div
        className={`tape absolute -top-2 left-1/2 z-20 -translate-x-1/2 rotate-[-2deg] rounded-sm uppercase ${
          compact ? 'px-3 py-0.5 text-[7px] tracking-[0.2em]' : 'px-5 py-0.5 text-[10px] tracking-[0.28em]'
        } text-red-100`}
      >
        Cena do crime
      </div>

      {/* barbante vermelho */}
      {!compact && (
        <svg className="pointer-events-none absolute inset-0 h-full w-full">
          <path d={path} className="string-line" />
        </svg>
      )}

      {sorted.length === 0 ? (
        <div className="flex min-h-[8rem] flex-col items-center justify-center py-4 text-center">
          <span className={`opacity-50 ${compact ? 'text-xl' : 'text-3xl'}`}>🕯️</span>
          <p className={`mt-1 font-bold tracking-widest text-[#8a7a55] uppercase ${compact ? 'text-[9px]' : 'mt-2 text-xs'}`}>
            Sem dicas ainda
          </p>
          {!compact && (
            <p className="mt-1 text-[10px] text-[#6b5d3f]">As cartas do Perito Forense serão pregadas aqui</p>
          )}
        </div>
      ) : (
        <div
          className={`relative z-10 grid gap-2 ${compact ? 'grid-cols-2' : 'grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'}`}
        >
          {sorted.map((e, i) => (
            <div
              key={e.id}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="relative mx-auto"
            >
              {/* alfinete */}
              <span
                className="anim-pin absolute -top-1.5 left-1/2 z-20 h-3 w-3 rounded-full bg-gradient-to-br from-red-300 via-red-500 to-red-800 shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                style={{ animationDelay: `${i * 90}ms` }}
              />
              <CardView card={e.card} size={compact ? 'sm' : 'md'} badge={`#${e.slot}`} className="anim-deal" />
              {!compact && (
                <p className="mt-1 text-center text-[9px] text-[#8a7a55]">
                  {e.byName} · R{e.round}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {!compact && (
        <p className="mt-3 border-t border-dashed border-[#5a4c2e]/60 pt-2 text-center text-[9px] tracking-wide text-[#6b5d3f]">
          #1 = certeza · #6 = dúvida — o barbante liga as pistas na ordem jogada
        </p>
      )}
    </div>
  );
}
