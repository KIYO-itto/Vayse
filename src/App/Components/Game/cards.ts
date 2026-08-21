export interface CardDef {
  id: string;
  type: 'means' | 'clue';
  name: string;
  emoji: string;
  desc: string;
}

export const MEANS_DECK: CardDef[] = [
  { id: 'm01', type: 'means', name: 'Picador de Gelo', emoji: '🧊', desc: 'Perfurante, silencioso e traiçoeiro.' },
  { id: 'm02', type: 'means', name: 'Veneno', emoji: '☠️', desc: 'Letal e difícil de detectar.' },
  { id: 'm03', type: 'means', name: 'Revólver', emoji: '🔫', desc: 'Clássico, barulhento e definitivo.' },
  { id: 'm04', type: 'means', name: 'Faca de Caça', emoji: '🔪', desc: 'Precisa e brutal.' },
  { id: 'm05', type: 'means', name: 'Corda', emoji: '🪢', desc: 'O estrangulamento clássico.' },
  { id: 'm06', type: 'means', name: 'Martelo', emoji: '🔨', desc: 'Força bruta em cada golpe.' },
  { id: 'm07', type: 'means', name: 'Ácido', emoji: '🧪', desc: 'Corrói até as evidências.' },
  { id: 'm08', type: 'means', name: 'Bomba', emoji: '💣', desc: 'Caos garantido.' },
  { id: 'm09', type: 'means', name: 'Motosserra', emoji: '🪚', desc: 'Aterrorizante e impiedosa.' },
  { id: 'm10', type: 'means', name: 'Taco de Beisebol', emoji: '🏏', desc: 'Impacto contundente.' },
  { id: 'm11', type: 'means', name: 'Espada', emoji: '⚔️', desc: 'Um corte limpo e mortal.' },
  { id: 'm12', type: 'means', name: 'Secador de Cabelo', emoji: '💨', desc: 'Um banho quente fatal.' },
  { id: 'm13', type: 'means', name: 'Chave de Fenda', emoji: '🪛', desc: 'Pequena, mas mortal.' },
  { id: 'm14', type: 'means', name: 'Bisturi', emoji: '🩺', desc: 'Precisão cirúrgica.' },
  { id: 'm15', type: 'means', name: 'Besta', emoji: '🏹', desc: 'Silenciosa e letal.' },
  { id: 'm16', type: 'means', name: 'Garrote', emoji: '🧶', desc: 'Um fio e um puxão.' },
  { id: 'm17', type: 'means', name: 'Travesseiro', emoji: '🛏️', desc: 'Sufocamento silencioso.' },
  { id: 'm18', type: 'means', name: 'Tijolo', emoji: '🧱', desc: 'Simples e contundente.' },
  { id: 'm19', type: 'means', name: 'Castiçal', emoji: '🕯️', desc: 'O clássico dos clássicos.' },
  { id: 'm20', type: 'means', name: 'Chave Inglesa', emoji: '🔧', desc: 'Apertar até não poder mais.' },
  { id: 'm21', type: 'means', name: 'Seringa', emoji: '💉', desc: 'Uma dose a mais.' },
  { id: 'm22', type: 'means', name: 'Fio Elétrico', emoji: '🔌', desc: 'Choque fatal.' },
  { id: 'm23', type: 'means', name: 'Pé de Cabra', emoji: '🪓', desc: 'Alavanca e destruição.' },
  { id: 'm24', type: 'means', name: 'Vaso Chinês', emoji: '🏺', desc: 'Um golpe de arte.' },
  { id: 'm25', type: 'means', name: 'Granada', emoji: '💥', desc: 'O fim da discussão.' },
  { id: 'm26', type: 'means', name: 'Dardos', emoji: '🎯', desc: 'Mire com cuidado.' },
  { id: 'm27', type: 'means', name: 'Chá Envenenado', emoji: '🍵', desc: 'Hospitalidade mortal.' },
  { id: 'm28', type: 'means', name: 'Lenço de Seda', emoji: '🧣', desc: 'Elegante e sufocante.' },
  { id: 'm29', type: 'means', name: 'Soco Inglês', emoji: '🥊', desc: 'Golpes na sombra.' },
  { id: 'm30', type: 'means', name: 'Garrafa Quebrada', emoji: '🍾', desc: 'Um golpe no calor da briga.' },
  { id: 'm31', type: 'means', name: 'Lanterna', emoji: '🔦', desc: 'Ilumine... e bata.' },
  { id: 'm32', type: 'means', name: 'Saco Plástico', emoji: '🛍️', desc: 'Sufocamento improvisado.' },
];

export const CLUE_DECK: CardDef[] = [
  { id: 'c01', type: 'clue', name: 'Mancha de Sangue', emoji: '🩸', desc: 'Restos que não mentem.' },
  { id: 'c02', type: 'clue', name: 'Impressão Digital', emoji: '🖐️', desc: 'Quem tocou, deixou marca.' },
  { id: 'c03', type: 'clue', name: 'Pegada', emoji: '👣', desc: 'Para onde foi o assassino?' },
  { id: 'c04', type: 'clue', name: 'Fio de Cabelo', emoji: '🦱', desc: 'Um fio diz muita coisa.' },
  { id: 'c05', type: 'clue', name: 'Fibra de Tecido', emoji: '🧵', desc: 'Vestígios do que vestia.' },
  { id: 'c06', type: 'clue', name: 'Bilhete Anônimo', emoji: '📝', desc: 'Uma ameaça por escrito.' },
  { id: 'c07', type: 'clue', name: 'Recibo', emoji: '🧾', desc: 'Uma compra incriminadora.' },
  { id: 'c08', type: 'clue', name: 'Câmera de Vigilância', emoji: '📹', desc: 'Tudo foi gravado.' },
  { id: 'c09', type: 'clue', name: 'Cacos de Vidro', emoji: '🥃', desc: 'Um copo quebrado na briga.' },
  { id: 'c10', type: 'clue', name: 'Lama na Sapatilha', emoji: '🥾', desc: 'Veio de onde não deveria.' },
  { id: 'c11', type: 'clue', name: 'Queimadura de Corda', emoji: '🔥', desc: 'Marcas de atrito.' },
  { id: 'c12', type: 'clue', name: 'Cera de Vela', emoji: '🕯️', desc: 'Pingou na hora errada.' },
  { id: 'c13', type: 'clue', name: 'Pelos de Animal', emoji: '🐈', desc: 'O gato viu tudo.' },
  { id: 'c14', type: 'clue', name: 'Roupa Rasgada', emoji: '👕', desc: 'Sinais de luta corporal.' },
  { id: 'c15', type: 'clue', name: 'Marca de Mordida', emoji: '🦷', desc: 'Defesa desesperada.' },
  { id: 'c16', type: 'clue', name: 'Frasco de Remédio', emoji: '💊', desc: 'Dose errada?' },
  { id: 'c17', type: 'clue', name: 'Resíduo de Pólvora', emoji: '🎆', desc: 'Disparo recente.' },
  { id: 'c18', type: 'clue', name: 'Mancha de Tinta', emoji: '🖋️', desc: 'Uma caneta estourada.' },
  { id: 'c19', type: 'clue', name: 'Batom', emoji: '💄', desc: 'Marca de presença.' },
  { id: 'c20', type: 'clue', name: 'Celular Quebrado', emoji: '📱', desc: 'A última ligação.' },
  { id: 'c21', type: 'clue', name: 'Carteira Esquecida', emoji: '👛', desc: 'Fugiu com pressa.' },
  { id: 'c22', type: 'clue', name: 'Chave Estranha', emoji: '🗝️', desc: 'Abre o quê?' },
  { id: 'c23', type: 'clue', name: 'Máscara Cirúrgica', emoji: '😷', desc: 'Tentou se esconder.' },
  { id: 'c24', type: 'clue', name: 'Luvas Descartadas', emoji: '🧤', desc: 'Sem impressões digitais.' },
  { id: 'c25', type: 'clue', name: 'Bituca de Cigarro', emoji: '🚬', desc: 'Quem fumou ali?' },
  { id: 'c26', type: 'clue', name: 'Xícara de Café', emoji: '☕', desc: 'O último gole.' },
  { id: 'c27', type: 'clue', name: 'Carta Rasgada', emoji: '✉️', desc: 'Um segredo destruído.' },
  { id: 'c28', type: 'clue', name: 'Foto Antiga', emoji: '📷', desc: 'Um rosto do passado.' },
  { id: 'c29', type: 'clue', name: 'Ingresso de Cinema', emoji: '🎫', desc: 'Álibi ou armadilha?' },
  { id: 'c30', type: 'clue', name: 'Relógio Parado', emoji: '⌚', desc: 'A hora exata do crime.' },
  { id: 'c31', type: 'clue', name: 'Guarda-Chuva', emoji: '☂️', desc: 'Esquecido na fuga.' },
  { id: 'c32', type: 'clue', name: 'Chinelo', emoji: '🩴', desc: 'Saiu correndo descalço.' },
];

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
