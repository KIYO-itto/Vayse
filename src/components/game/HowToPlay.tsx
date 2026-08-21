'use client';

interface HowToPlayProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function HowToPlay({ open, setOpen }: HowToPlayProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="plaque plaque-wood relative max-h-[85vh] w-full max-w-lg overflow-y-auto p-6 anim-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="screw top-2 left-2" />
        <span className="screw top-2 right-2" />
        <span className="screw bottom-2 left-2" />
        <span className="screw bottom-2 right-2" />
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-black tracking-wide text-amber-300 uppercase">📖 Como Jogar</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg px-2 py-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-sm leading-relaxed text-zinc-300">
          <section>
            <h3 className="mb-1 font-display font-bold tracking-wide text-amber-400 uppercase">🎯 Objetivo</h3>
            <p>
              Um crime aconteceu em Hong Kong. <b className="text-red-400">Investigadores</b> precisam descobrir o{' '}
              <b className="text-red-400">Assassino</b> — mas só o <b className="text-amber-400">Perito Forense</b>{' '}
              sabe quem é, e ele não pode falar diretamente!
            </p>
          </section>

          <section>
            <h3 className="mb-1 font-display font-bold tracking-wide text-amber-400 uppercase">🃏 Papéis (3–8 jogadores)</h3>
            <ul className="list-inside list-disc space-y-1">
              <li>
                <b className="text-red-400">🔪 Assassino</b> — escolhe secretamente 1 <b>Arma</b> e 1{' '}
                <b>Pista</b> da própria mão. Se sobreviver 4 rodadas, vence.
              </li>
              <li>
                <b className="text-amber-400">🔬 Perito Forense</b> — sabe quem é o assassino, mas não o que ele
                escolheu. Dá dicas jogando cartas numeradas (1 = certeza, 6 = dúvida). O anfitrião pode designar quem
                será (ou deixar no aleatório 🎲) no lobby.
              </li>
              <li>
                <b className="text-emerald-400">🕵️ Investigadores</b> — analisam as dicas, discutem e votam em quem
                prender.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="mb-1 font-display font-bold tracking-wide text-amber-400 uppercase">🔁 Rodada</h3>
            <ol className="list-inside list-decimal space-y-1">
              <li>O Assassino escolhe a arma e a pista do crime.</li>
              <li>O Perito joga até 2 cartas de dica, numeradas de 1 a 6 (quanto menor o número, mais forte a dica).</li>
              <li>O Assassino pode trocar a arma ou a pista escolhida.</li>
              <li>Discussão no chat e votação: quem tiver mais votos é preso.</li>
            </ol>
          </section>

          <section>
            <h3 className="mb-1 font-display font-bold tracking-wide text-amber-400 uppercase">🏁 Fim de jogo</h3>
            <ul className="list-inside list-disc space-y-1">
              <li>Assassino preso → <b>Investigadores vencem</b>.</li>
              <li>Perito acerta o palpite (arma + pista) → <b>Perito vence</b>.</li>
              <li>Assassino escapa por 4 rodadas → <b>Assassino vence</b>.</li>
              <li>Se o Perito for preso, as dicas acabam — mas o jogo continua!</li>
            </ul>
          </section>

          <section className="rounded-xl border border-amber-900/40 bg-black/40 p-3">
            <h3 className="mb-1 font-display font-bold tracking-wide text-amber-400 uppercase">💡 Dicas do Perito</h3>
            <p>
              Aponte o tipo de arma/pista do assassino, não a carta exata. Ex.: número 1 numa carta de{' '}
              <b>Veneno</b> significa “a arma é veneno”; número 5 significa “está longe disso”.
            </p>
          </section>
        </div>

        <button
          type="button"
          onClick={() => setOpen(false)}
          className="wax-btn mt-5 w-full rounded-xl py-3.5 font-display text-sm font-black tracking-widest text-white uppercase"
        >
          Entendi! Vamos jogar 🎲
        </button>
      </div>
    </div>
  );
}
