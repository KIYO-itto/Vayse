import type { CSSProperties } from 'react';
import type { CardDef } from '@/game/cards';

interface CardViewProps {
  card: CardDef;
  selected?: boolean;
  disabled?: boolean;
  dim?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  badge?: string;
  faceDown?: boolean;
  tilt?: number;
  className?: string;
}

export default function CardView({
  card,
  selected,
  disabled,
  dim,
  onClick,
  size = 'md',
  badge,
  faceDown,
  tilt = 0,
  className = '',
}: CardViewProps) {
  const isMeans = card.type === 'means';
  const isButton = !!onClick;

  const sizeCls = size === 'lg' ? 'w-40 sm:w-52' : size === 'md' ? 'w-28 sm:w-32' : 'w-20 sm:w-24';

  return (
    <div
      className="inline-block"
      style={{ transform: `rotate(${tilt}deg)`, ['--tilt' as string]: `${tilt}deg` } as CSSProperties}
    >
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || !isButton}
        className={[
          'card-sheen relative flex aspect-[5/7] w-full flex-col items-center rounded-[10px] border p-1.5 transition-all duration-150',
          isMeans
            ? 'border-red-800/80 bg-gradient-to-b from-[#2b0f15] via-[#1c0b10] to-[#120609]'
            : 'border-yellow-800/70 bg-gradient-to-b from-[#2a2009] via-[#1b1406] to-[#100c04]',
          'ring-1 ring-inset ring-yellow-100/10',
          selected
            ? '-translate-y-2 scale-[1.04] border-amber-400 shadow-[0_0_28px_rgba(251,191,36,0.4)]'
            : '',
          isButton && !disabled ? 'cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-black/60 active:scale-95' : '',
          disabled ? 'opacity-40' : '',
          dim ? 'opacity-50 saturate-50' : '',
          sizeCls,
          className,
        ].join(' ')}
      >
        {badge && (
          <span className="absolute -top-2 -right-1.5 z-10 rounded-md border border-amber-500/60 bg-black/85 px-1.5 py-0.5 text-[9px] font-black text-amber-300 shadow-lg">
            {badge}
          </span>
        )}

        {faceDown ? (
          <span className="card-back absolute inset-0 rounded-[10px]" />
        ) : (
          <>
            {/* pips de canto */}
            <span
              className={`absolute top-0.5 left-1 text-[9px] leading-none ${
                isMeans ? 'text-red-400/90' : 'text-amber-400/90'
              }`}
            >
              {card.emoji}
            </span>
            <span className="absolute top-0.5 right-1 text-[6px] font-black tracking-widest text-zinc-500 uppercase">
              {isMeans ? 'arma' : 'pista'}
            </span>
            <span
              className={`absolute right-1 bottom-0.5 rotate-180 text-[9px] leading-none ${
                isMeans ? 'text-red-400/90' : 'text-amber-400/90'
              }`}
            >
              {card.emoji}
            </span>

            {/* conteúdo central */}
            <div className="flex flex-1 flex-col items-center justify-center gap-1 text-center">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-xl shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] ring-1 ring-white/10 sm:h-11 sm:w-11 sm:text-2xl ${
                  size === 'lg' ? 'h-14 w-14 text-4xl sm:h-16 sm:w-16 sm:text-5xl' : ''
                }`}
              >
                {card.emoji}
              </div>
              <span
                className={`font-display font-bold leading-tight text-zinc-100 ${
                  size === 'lg' ? 'text-lg' : size === 'sm' ? 'text-[9px] sm:text-[10px]' : 'text-[11px] sm:text-xs'
                }`}
              >
                {card.name}
              </span>
              {size !== 'sm' && (
                <span className="text-[8px] leading-tight text-zinc-500 italic sm:text-[9px]">{card.desc}</span>
              )}
            </div>

            {/* filete dourado inferior */}
            <span
              className={`absolute inset-x-1.5 bottom-1 h-px ${
                isMeans ? 'bg-gradient-to-r from-transparent via-red-700/60 to-transparent' : 'bg-gradient-to-r from-transparent via-amber-700/60 to-transparent'
              }`}
            />
          </>
        )}
      </button>
    </div>
  );
}
