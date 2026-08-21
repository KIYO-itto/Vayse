'use client';

import type { RoomSettings } from '@/game/engine';

interface SettingsPanelProps {
  value: RoomSettings;
  onChange?: (s: RoomSettings) => void;
}

function Stepper({
  label,
  sub,
  value,
  min,
  max,
  disabled,
  onChange,
}: {
  label: string;
  sub: string;
  value: number;
  min: number;
  max: number;
  disabled?: boolean;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-amber-900/40 bg-black/40 px-3 py-2">
      <div className="min-w-0">
        <p className="text-[10px] font-black tracking-widest text-amber-200/80 uppercase">{label}</p>
        <p className="text-[9px] text-zinc-500">{sub}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          disabled={disabled || value <= min}
          onClick={() => onChange(value - 1)}
          className="gold-btn h-8 w-8 rounded-lg text-base font-black text-amber-100 disabled:opacity-30"
        >
          −
        </button>
        <span className="font-display w-8 text-center text-xl font-black text-amber-200">{value}</span>
        <button
          type="button"
          disabled={disabled || value >= max}
          onClick={() => onChange(value + 1)}
          className="gold-btn h-8 w-8 rounded-lg text-base font-black text-amber-100 disabled:opacity-30"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function SettingsPanel({ value, onChange }: SettingsPanelProps) {
  const disabled = !onChange;
  const set = (patch: Partial<RoomSettings>) => onChange?.({ ...value, ...patch });

  return (
    <div className="plaque plaque-wood relative p-4">
      <span className="screw top-2 left-2" />
      <span className="screw top-2 right-2" />
      <span className="screw bottom-2 left-2" />
      <span className="screw bottom-2 right-2" />

      <div className="mb-3 flex items-center justify-between">
        <p className="text-[10px] font-black tracking-[0.3em] text-amber-400 uppercase">⚙️ Configurações da mesa</p>
        {disabled && <span className="text-[9px] text-zinc-500 italic">(só o anfitrião altera)</span>}
      </div>

      <div className="space-y-2">
        <Stepper
          label="Cadeiras na mesa"
          sub={`1 a 12 · mínimo de 3 para iniciar`}
          value={value.maxPlayers}
          min={1}
          max={12}
          disabled={disabled}
          onChange={(v) => set({ maxPlayers: v })}
        />
        <Stepper
          label="Rodadas"
          sub="1 a 6 · quantas votações até o fim"
          value={value.maxRounds}
          min={1}
          max={6}
          disabled={disabled}
          onChange={(v) => set({ maxRounds: v })}
        />
        <Stepper
          label="Dicas por rodada"
          sub="1 a 3 cartas do Perito por rodada"
          value={value.hintsPerRound}
          min={1}
          max={3}
          disabled={disabled}
          onChange={(v) => set({ hintsPerRound: v })}
        />
      </div>

      <div className="mt-3 flex items-center justify-between rounded-lg border border-amber-900/40 bg-black/40 px-3 py-2">
        <div>
          <p className="text-[10px] font-black tracking-widest text-amber-200/80 uppercase">Visibilidade</p>
          <p className="text-[9px] text-zinc-500">Salas privadas só aparecem com o código</p>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={() => set({ isPublic: !value.isPublic })}
          className={`relative h-7 w-14 rounded-full border transition-colors disabled:opacity-60 ${
            value.isPublic ? 'border-emerald-700/70 bg-emerald-900/60' : 'border-zinc-700 bg-zinc-800'
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-gradient-to-b shadow transition-all ${
              value.isPublic
                ? 'left-[2.15rem] from-emerald-300 to-emerald-500'
                : 'left-0.5 from-zinc-300 to-zinc-500'
            }`}
          />
        </button>
      </div>

      {value.maxPlayers < 3 && (
        <p className="mt-3 rounded-lg border border-red-900/60 bg-red-950/50 px-3 py-2 text-center text-[11px] text-red-300">
          ⚠️ Com menos de 3 cadeiras a partida não pode começar.
        </p>
      )}
    </div>
  );
}
