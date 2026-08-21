import { CLUE_DECK, MEANS_DECK, shuffle, type CardDef } from './cards';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------
export type Role = 'murderer' | 'forensic' | 'investigator';
export type Phase =
  | 'murderer-select'
  | 'forensic-hints'
  | 'murderer-swap'
  | 'discussion'
  | 'accusation'
  | 'reveal';
export type Winner = 'investigators' | 'murderer' | 'forensic';
export type Status = 'lobby' | 'playing';

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS_CAP = 12;
export const DEFAULT_MAX_PLAYERS = 8;
export const DEFAULT_MAX_ROUNDS = 4;
export const DEFAULT_HINTS_PER_ROUND = 2;
export const HAND_SIZE = 4;

export interface RoomSettings {
  maxPlayers: number;
  maxRounds: number;
  hintsPerRound: number;
  isPublic: boolean;
}

export interface PlayerState {
  id: string;
  name: string;
  role: Role | null;
  hand: string[];
  alive: boolean;
  isHost: boolean;
  connected: boolean;
  lastSeen: number;
  vote: string | null;
}

export interface SceneEntry {
  id: string;
  round: number;
  slot: number;
  cardId: string;
  byName: string;
  kind: 'hint' | 'guess';
}

export interface ChatMsg {
  id: string;
  playerId: string;
  name: string;
  text: string;
  ts: number;
}

export interface VoteResult {
  playerId: string;
  votes: number;
  executed: boolean;
}

export interface Room {
  code: string;
  hostId: string;
  players: PlayerState[];
  status: Status;
  phase: Phase | null;
  round: number;
  maxPlayers: number;
  maxRounds: number;
  hintsPerRound: number;
  isPublic: boolean;
  forensicPickId: string | null;
  murdererId: string | null;
  forensicId: string | null;
  murderWeaponId: string | null;
  murderClueId: string | null;
  scene: SceneEntry[];
  executedIds: string[];
  winner: Winner | null;
  chat: ChatMsg[];
  voteResult: VoteResult[] | null;
  guessUsed: boolean;
  guessCards: { cardId: string; correct: boolean }[] | null;
  createdAt: number;
  updatedAt: number;
}

// ---------------------------------------------------------------------------
// Visões (o que cada jogador tem o direito de ver)
// ---------------------------------------------------------------------------
export interface PublicPlayer {
  id: string;
  name: string;
  alive: boolean;
  isHost: boolean;
  connected: boolean;
  role: Role | null;
  forensic: boolean;
  murderer: boolean;
  voted: boolean;
}

export interface SceneEntryView {
  id: string;
  round: number;
  slot: number;
  kind: 'hint' | 'guess';
  card: CardDef;
  byName: string;
}

export interface RevealInfo {
  murdererId: string;
  murdererName: string;
  weapon: CardDef;
  clue: CardDef;
}

export interface GuessView {
  cards: { card: CardDef; correct: boolean }[];
}

export interface RevealedHand {
  playerId: string;
  cards: CardDef[];
}

export interface SelfView {
  id: string;
  name: string;
  role: Role | null;
  alive: boolean;
  isHost: boolean;
  hand: CardDef[];
  selection: { weapon: CardDef | null; clue: CardDef | null } | null;
  murdererId: string | null;
  guessUsed: boolean;
  hintsThisRound: number;
  voted: boolean;
  canCallVote: boolean;
}

export interface RoomView {
  code: string;
  status: Status;
  phase: Phase | null;
  round: number;
  maxRounds: number;
  maxPlayers: number;
  minPlayers: number;
  hintsPerRound: number;
  isPublic: boolean;
  forensicPickId: string | null;
  players: PublicPlayer[];
  scene: SceneEntryView[];
  chat: ChatMsg[];
  winner: Winner | null;
  executedIds: string[];
  voteResult: VoteResult[] | null;
  guess: GuessView | null;
  reveal: RevealInfo | null;
  revealedHands: RevealedHand[] | null;
  canStart: boolean;
  isHost: boolean;
  isFull: boolean;
}

export interface GameView {
  room: RoomView;
  self: SelfView;
  time: number;
}

export interface PublicRoomInfo {
  code: string;
  hostName: string;
  count: number;
  maxPlayers: number;
  createdAt: number;
}

export interface JoinResult {
  ok: boolean;
  error?: string;
  code?: string;
  playerId?: string;
  view?: GameView;
}

export interface ActionResult {
  ok: boolean;
  error?: string;
  view?: GameView;
}

// ---------------------------------------------------------------------------
// Armazenamento em memória
// ---------------------------------------------------------------------------
const rooms = new Map<string, Room>();
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function uid(): string {
  return crypto.randomUUID();
}

function now(): number {
  return Date.now();
}

function cardById(id: string): CardDef | undefined {
  return MEANS_DECK.find((c) => c.id === id) ?? CLUE_DECK.find((c) => c.id === id);
}

function clampInt(v: unknown, min: number, max: number, fallback: number): number {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function genCode(): string {
  let code = '';
  do {
    code = Array.from({ length: 5 }, () => CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]).join('');
  } while (rooms.has(code));
  return code;
}

function pushChat(room: Room, playerId: string, name: string, text: string) {
  room.chat.push({ id: uid(), playerId, name, text, ts: now() });
  if (room.chat.length > 200) room.chat.splice(0, room.chat.length - 200);
}

function sweepRooms() {
  const cutoff = now() - 24 * 3600 * 1000;
  for (const [key, r] of rooms) {
    if (r.updatedAt < cutoff) rooms.delete(key);
  }
}

export function getRoomByCode(code: string): Room | undefined {
  return rooms.get(code.trim().toUpperCase());
}

// ---------------------------------------------------------------------------
// Criação / entrada em salas
// ---------------------------------------------------------------------------
export function createRoom(name: string, settings?: Partial<RoomSettings>): { code: string; playerId: string } {
  sweepRooms();
  const code = genCode();
  const playerId = uid();
  const player: PlayerState = {
    id: playerId,
    name,
    role: null,
    hand: [],
    alive: true,
    isHost: true,
    connected: true,
    lastSeen: now(),
    vote: null,
  };
  const room: Room = {
    code,
    hostId: playerId,
    players: [player],
    status: 'lobby',
    phase: null,
    round: 1,
    maxPlayers: clampInt(settings?.maxPlayers, 1, MAX_PLAYERS_CAP, DEFAULT_MAX_PLAYERS),
    maxRounds: clampInt(settings?.maxRounds, 1, 6, DEFAULT_MAX_ROUNDS),
    hintsPerRound: clampInt(settings?.hintsPerRound, 1, 3, DEFAULT_HINTS_PER_ROUND),
    isPublic: settings?.isPublic !== false,
    forensicPickId: null,
    murdererId: null,
    forensicId: null,
    murderWeaponId: null,
    murderClueId: null,
    scene: [],
    executedIds: [],
    winner: null,
    chat: [],
    voteResult: null,
    guessUsed: false,
    guessCards: null,
    createdAt: now(),
    updatedAt: now(),
  };
  rooms.set(code, room);
  return { code, playerId };
}

export function joinRoom(rawCode: string, name: string, playerId?: string): JoinResult {
  const code = rawCode.trim().toUpperCase();
  const room = rooms.get(code);
  if (!room) return { ok: false, error: 'Sala não encontrada. Confira o código.' };

  if (playerId) {
    const existing = room.players.find((p) => p.id === playerId);
    if (existing) {
      existing.name = name;
      existing.connected = true;
      existing.lastSeen = now();
      existing.isHost = existing.id === room.hostId;
      room.updatedAt = now();
      return { ok: true, code, playerId, view: getView(room, playerId)! };
    }
  }

  if (room.status !== 'lobby')
    return { ok: false, error: 'A partida já começou nesta sala.' };
  if (room.players.length >= room.maxPlayers)
    return { ok: false, error: `Sala cheia (máximo de ${room.maxPlayers} jogadores).` };

  const pid = uid();
  room.players.push({
    id: pid,
    name,
    role: null,
    hand: [],
    alive: true,
    isHost: false,
    connected: true,
    lastSeen: now(),
    vote: null,
  });
  room.updatedAt = now();
  pushChat(room, 'system', 'Sistema', `${name} entrou na sala.`);
  return { ok: true, code, playerId: pid, view: getView(room, pid)! };
}

export function listPublicRooms(): PublicRoomInfo[] {
  sweepRooms();
  return [...rooms.values()]
    .filter((r) => r.status === 'lobby' && r.isPublic && r.players.length > 0)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 30)
    .map((r) => ({
      code: r.code,
      hostName: r.players.find((p) => p.id === r.hostId)?.name ?? '?',
      count: r.players.length,
      maxPlayers: r.maxPlayers,
      createdAt: r.createdAt,
    }));
}

export function touchPlayer(room: Room, playerId: string) {
  const p = room.players.find((x) => x.id === playerId);
  if (p) {
    p.lastSeen = now();
    p.connected = true;
  }
  const cutoff = now() - 15000;
  for (const pl of room.players) {
    if (now() - pl.lastSeen > 15000) pl.connected = false;
  }
  room.updatedAt = now();
}

// ---------------------------------------------------------------------------
// Construção da visão por jogador
// ---------------------------------------------------------------------------
export function getView(room: Room, playerId: string): GameView | null {
  const me = room.players.find((p) => p.id === playerId);
  if (!me) return null;

  const reveal =
    room.phase === 'reveal' && room.murdererId && room.murderWeaponId && room.murderClueId
      ? {
          murdererId: room.murdererId,
          murdererName: room.players.find((p) => p.id === room.murdererId)?.name ?? '???',
          weapon: cardById(room.murderWeaponId)!,
          clue: cardById(room.murderClueId)!,
        }
      : null;

  const guess = room.guessCards
    ? { cards: room.guessCards.map((g) => ({ card: cardById(g.cardId)!, correct: g.correct })) }
    : null;

  const revealedHands: RevealedHand[] | null =
    room.phase === 'reveal'
      ? room.players.map((p) => ({
          playerId: p.id,
          cards: p.hand.map((id) => cardById(id)!).filter(Boolean),
        }))
      : null;

  const isMurderer = me.role === 'murderer';
  const isForensic = me.role === 'forensic';

  const players: PublicPlayer[] = room.players.map((p) => ({
    id: p.id,
    name: p.name,
    alive: p.alive,
    isHost: p.isHost,
    connected: p.connected,
    role: reveal || p.id === playerId ? p.role : null,
    forensic: p.id === room.forensicId,
    murderer: reveal ? p.id === room.murdererId : false,
    voted: p.vote !== null,
  }));

  const scene: SceneEntryView[] = room.scene.map((e) => ({
    ...e,
    card: cardById(e.cardId)!,
  }));

  const self: SelfView = {
    id: me.id,
    name: me.name,
    role: me.role,
    alive: me.alive,
    isHost: me.isHost,
    hand: me.hand.map((id) => cardById(id)!).filter(Boolean),
    selection: isMurderer
      ? {
          weapon: room.murderWeaponId ? cardById(room.murderWeaponId)! : null,
          clue: room.murderClueId ? cardById(room.murderClueId)! : null,
        }
      : null,
    murdererId: isForensic ? room.murdererId : null,
    guessUsed: room.guessUsed,
    hintsThisRound: isForensic
      ? room.scene.filter((e) => e.round === room.round && e.kind === 'hint').length
      : 0,
    voted: me.vote !== null,
    canCallVote: room.phase === 'discussion' && me.alive && room.status === 'playing',
  };

  return {
    room: {
      code: room.code,
      status: room.status,
      phase: room.phase,
      round: room.round,
      maxRounds: room.maxRounds,
      maxPlayers: room.maxPlayers,
      minPlayers: MIN_PLAYERS,
      hintsPerRound: room.hintsPerRound,
      isPublic: room.isPublic,
      forensicPickId: room.forensicPickId,
      players,
      scene,
      chat: room.chat,
      winner: room.winner,
      executedIds: room.executedIds,
      voteResult: room.voteResult,
      guess,
      reveal,
      revealedHands,
      canStart:
        room.status === 'lobby' && me.isHost && room.players.length >= MIN_PLAYERS && room.maxPlayers >= MIN_PLAYERS,
      isHost: me.isHost,
      isFull: room.players.length >= room.maxPlayers,
    },
    self,
    time: now(),
  };
}

// ---------------------------------------------------------------------------
// Lógica de partida
// ---------------------------------------------------------------------------
function autoAdvance(room: Room) {
  if (room.status !== 'playing') return;
  if (room.phase === 'forensic-hints') {
    const fs = room.players.find((p) => p.id === room.forensicId);
    if (!fs || !fs.alive) room.phase = 'murderer-swap';
  }
}

function startGame(room: Room) {
  room.players.forEach((p) => {
    p.role = null;
    p.hand = [];
    p.alive = true;
    p.vote = null;
  });

  // Perito Forense: o anfitrião pode designar; senão, é sorteado
  const picked = room.forensicPickId
    ? room.players.find((p) => p.id === room.forensicPickId)
    : undefined;
  const forensic = picked ?? shuffle(room.players)[0];
  const murderer = shuffle(room.players.filter((p) => p.id !== forensic.id))[0];
  forensic.role = 'forensic';
  murderer.role = 'murderer';
  for (const p of room.players) {
    if (!p.role) p.role = 'investigator';
  }

  room.murdererId = murderer.id;
  room.forensicId = forensic.id;

  const order = shuffle(room.players); // ordem de distribuição das cartas
  const means = shuffle(MEANS_DECK.map((c) => c.id));
  const clues = shuffle(CLUE_DECK.map((c) => c.id));
  let mi = 0;
  let ci = 0;
  for (const p of order) {
    p.hand = [...means.slice(mi, mi + HAND_SIZE), ...clues.slice(ci, ci + HAND_SIZE)];
    mi += HAND_SIZE;
    ci += HAND_SIZE;
  }

  room.murderWeaponId = null;
  room.murderClueId = null;
  room.scene = [];
  room.executedIds = [];
  room.winner = null;
  room.voteResult = null;
  room.guessUsed = false;
  room.guessCards = null;
  room.round = 1;
  room.phase = 'murderer-select';
  room.status = 'playing';
  pushChat(room, 'system', 'Sistema', '🎬 A partida começou! Cada jogador recebeu 4 armas e 4 pistas.');
}

function resolveVote(room: Room) {
  const alive = room.players.filter((p) => p.alive);
  const counts = new Map<string, number>();
  for (const p of alive) {
    if (p.vote && p.vote !== 'abstain') counts.set(p.vote, (counts.get(p.vote) ?? 0) + 1);
  }

  let top: string[] = [];
  let max = 0;
  for (const [id, n] of counts) {
    if (n > max) {
      max = n;
      top = [id];
    } else if (n === max) {
      top.push(id);
    }
  }

  let executedId: string | null = null;

  if (top.length === 1 && max > 0) {
    executedId = top[0];
    const target = room.players.find((p) => p.id === executedId);
    if (target) {
      target.alive = false;
      room.executedIds.push(executedId);
      pushChat(room, 'system', 'Sistema', `🚔 ${target.name} foi preso(a)!`);
    }
  } else {
    pushChat(room, 'system', 'Sistema', '🤝 Empate na votação — ninguém foi preso.');
  }

  // resultado para todos os vivos (votos recebidos; 0 = absteve-se)
  const result: VoteResult[] = alive.map((p) => ({
    playerId: p.id,
    votes: p.vote && p.vote !== 'abstain' ? counts.get(p.id) ?? 0 : 0,
    executed: p.id === executedId,
  }));
  room.voteResult = result;

  if (executedId === room.murdererId) {
    room.winner = 'investigators';
    room.phase = 'reveal';
    pushChat(room, 'system', 'Sistema', '🎉 O assassino foi capturado!');
    return;
  }
  if (executedId === room.forensicId) {
    pushChat(room, 'system', 'Sistema', '🔬 O Perito Forense foi preso! As dicas acabaram.');
  }
  if (room.round >= room.maxRounds) {
    room.winner = 'murderer';
    room.phase = 'reveal';
    pushChat(room, 'system', 'Sistema', '😈 O assassino escapou impune!');
    return;
  }

  room.round += 1;
  room.phase = 'forensic-hints';
  autoAdvance(room);
}

// ---------------------------------------------------------------------------
// Ações
// ---------------------------------------------------------------------------
export function applyAction(code: string, playerId: string, action: string, payload: unknown): ActionResult {
  const room = rooms.get(code.trim().toUpperCase());
  if (!room) return { ok: false, error: 'Sala não encontrada.' };
  const me = room.players.find((p) => p.id === playerId);
  if (!me) return { ok: false, error: 'Você não está nesta sala.' };

  me.lastSeen = now();
  me.connected = true;

  const fail = (error: string): ActionResult => ({ ok: false, error });
  const ok = (): ActionResult => {
    room.updatedAt = now();
    return { ok: true, view: getView(room, playerId)! };
  };
  const requirePhase = (...phases: Phase[]) => {
    if (room.status !== 'playing' || !room.phase || !phases.includes(room.phase))
      return fail('Ação não permitida nesta fase.');
    return null;
  };

  switch (action) {
    case 'update-settings': {
      if (!me.isHost) return fail('Apenas o anfitrião pode alterar as configurações.');
      if (room.status !== 'lobby') return fail('As configurações só podem ser alteradas no lobby.');
      const s = (payload ?? {}) as Record<string, unknown>;
      room.maxPlayers = clampInt(s.maxPlayers, 1, MAX_PLAYERS_CAP, room.maxPlayers);
      room.maxRounds = clampInt(s.maxRounds, 1, 6, room.maxRounds);
      room.hintsPerRound = clampInt(s.hintsPerRound, 1, 3, room.hintsPerRound);
      room.isPublic = s.isPublic !== false;
      pushChat(
        room,
        'system',
        'Sistema',
        `⚙️ Configurações: ${room.maxPlayers} cadeiras · ${room.maxRounds} rodadas · ${room.hintsPerRound} dicas/rodada · ${room.isPublic ? 'pública' : 'privada'}.`
      );
      return ok();
    }

    case 'pick-forensic': {
      if (!me.isHost) return fail('Apenas o anfitrião pode designar o Perito Forense.');
      const allowed =
        room.status === 'lobby' || (room.status === 'playing' && room.phase === 'reveal');
      if (!allowed) return fail('O Perito só pode ser designado no lobby ou no desfecho.');
      const { forensicId } = (payload ?? {}) as { forensicId?: string | null };
      if (forensicId == null || forensicId === '') {
        room.forensicPickId = null;
        pushChat(room, 'system', 'Sistema', '🎲 Perito Forense: será sorteado aleatoriamente.');
        return ok();
      }
      const target = room.players.find((p) => p.id === forensicId);
      if (!target) return fail('Jogador inválido.');
      room.forensicPickId = forensicId;
      pushChat(
        room,
        'system',
        'Sistema',
        `🔬 O anfitrião designou ${target.name} como Perito Forense.`
      );
      return ok();
    }

    case 'start': {
      if (!me.isHost) return fail('Apenas o anfitrião pode iniciar a partida.');
      if (room.status !== 'lobby') return fail('A partida já começou.');
      if (room.maxPlayers < MIN_PLAYERS) return fail(`A sala precisa de pelo menos ${MIN_PLAYERS} cadeiras.`);
      if (room.players.length < MIN_PLAYERS)
        return fail(`Mínimo de ${MIN_PLAYERS} jogadores para começar.`);
      startGame(room);
      return ok();
    }

    case 'kick': {
      if (!me.isHost || room.status !== 'lobby')
        return fail('Apenas o anfitrião pode remover jogadores no lobby.');
      const targetId = (payload as { targetId?: string } | undefined)?.targetId;
      const target = room.players.find((p) => p.id === targetId && p.id !== room.hostId);
      if (!target) return fail('Jogador inválido.');
      room.players = room.players.filter((p) => p.id !== targetId);
      return ok();
    }

    case 'leave': {
      room.players = room.players.filter((p) => p.id !== playerId);
      if (room.players.length === 0) {
        rooms.delete(room.code);
        return { ok: true };
      }
      if (room.hostId === playerId) {
        room.hostId = room.players[0].id;
        room.players.forEach((p) => (p.isHost = p.id === room.hostId));
      }
      return ok();
    }

    case 'chat': {
      const text = String((payload as { text?: string } | undefined)?.text ?? '')
        .trim()
        .slice(0, 300);
      if (!text) return fail('Mensagem vazia.');
      pushChat(room, me.id, me.name, text);
      return ok();
    }

    case 'confirm-selection': {
      const err = requirePhase('murderer-select', 'murderer-swap');
      if (err) return err;
      if (me.id !== room.murdererId || !me.alive) return fail('Apenas o assassino pode fazer isso.');
      const { weaponId, clueId } = (payload ?? {}) as { weaponId?: string; clueId?: string };
      const weapon = cardById(weaponId ?? '');
      const clue = cardById(clueId ?? '');
      if (!weapon || weapon.type !== 'means') return fail('Escolha uma ARMA válida da sua mão.');
      if (!clue || clue.type !== 'clue') return fail('Escolha uma PISTA válida da sua mão.');
      const weaponAvailable = weaponId === room.murderWeaponId || me.hand.includes(weaponId ?? '');
      const clueAvailable = clueId === room.murderClueId || me.hand.includes(clueId ?? '');
      if (!weaponAvailable || !clueAvailable) return fail('A carta escolhida não está na sua mão.');

      if (room.murderWeaponId) me.hand.push(room.murderWeaponId);
      if (room.murderClueId) me.hand.push(room.murderClueId);
      me.hand = me.hand.filter((id) => id !== weaponId && id !== clueId);
      room.murderWeaponId = weaponId!;
      room.murderClueId = clueId!;

      if (room.phase === 'murderer-select') room.phase = 'forensic-hints';
      else room.phase = 'discussion';
      autoAdvance(room);
      return ok();
    }

    case 'play-hints': {
      const err = requirePhase('forensic-hints');
      if (err) return err;
      if (me.id !== room.forensicId || !me.alive) return fail('Apenas o perito forense pode jogar pistas.');

      const raw = (payload as { cards?: { cardId: string; slot: number }[] } | undefined)?.cards;
      const cards = Array.isArray(raw) ? raw.slice(0, room.hintsPerRound) : [];
      if (cards.length === 0) return fail('Jogue pelo menos 1 pista.');

      const roundHints = room.scene.filter((e) => e.round === room.round && e.kind === 'hint');
      if (roundHints.length + cards.length > room.hintsPerRound)
        return fail(`Máximo de ${room.hintsPerRound} pistas por rodada.`);

      const slots = new Set<number>();
      for (const c of cards) {
        const slot = Number(c.slot);
        if (!Number.isInteger(slot) || slot < 1 || slot > 6)
          return fail('Número de cena deve ser de 1 a 6.');
        if (slots.has(slot) || roundHints.some((e) => e.slot === slot))
          return fail(`O número ${slot} já foi usado nesta rodada.`);
        slots.add(slot);
      }
      for (const c of cards) {
        if (!me.hand.includes(c.cardId)) return fail('Carta inválida na sua mão.');
        me.hand = me.hand.filter((id) => id !== c.cardId);
        room.scene.push({
          id: uid(),
          round: room.round,
          slot: Number(c.slot),
          cardId: c.cardId,
          byName: me.name,
          kind: 'hint',
        });
      }
      return ok();
    }

    case 'end-hints': {
      const err = requirePhase('forensic-hints');
      if (err) return err;
      if (me.id !== room.forensicId || !me.alive) return fail('Apenas o perito forense pode encerrar as dicas.');
      room.phase = 'murderer-swap';
      autoAdvance(room);
      return ok();
    }

    case 'guess': {
      const err = requirePhase('forensic-hints');
      if (err) return err;
      if (me.id !== room.forensicId || !me.alive) return fail('Apenas o perito forense pode palpitar.');
      if (room.guessUsed) return fail('Você já usou seu palpite nesta partida.');
      const { meansId, clueId } = (payload ?? {}) as { meansId?: string; clueId?: string };
      const means = me.hand.includes(meansId ?? '') ? cardById(meansId ?? '') : undefined;
      const clue = me.hand.includes(clueId ?? '') ? cardById(clueId ?? '') : undefined;
      if (!means || means.type !== 'means') return fail('Escolha uma ARMA válida da sua mão.');
      if (!clue || clue.type !== 'clue') return fail('Escolha uma PISTA válida da sua mão.');

      const correct = meansId === room.murderWeaponId && clueId === room.murderClueId;
      room.guessUsed = true;
      room.guessCards = [
        { cardId: meansId!, correct },
        { cardId: clueId!, correct },
      ];
      if (correct) {
        room.winner = 'forensic';
        room.phase = 'reveal';
        pushChat(room, 'system', 'Sistema', '🔮 O palpite do Perito Forense estava CORRETO!');
      } else {
        pushChat(room, 'system', 'Sistema', '❌ O palpite do Perito Forense estava incorreto.');
      }
      return ok();
    }

    case 'call-vote': {
      const err = requirePhase('discussion');
      if (err) return err;
      if (!me.alive) return fail('Jogadores presos não podem chamar votação.');
      for (const p of room.players) p.vote = null;
      room.voteResult = null;
      room.phase = 'accusation';
      return ok();
    }

    case 'vote': {
      const err = requirePhase('accusation');
      if (err) return err;
      if (!me.alive) return fail('Jogadores presos não votam.');
      if (me.vote !== null) return fail('Voto já registrado.');

      const targetId = (payload as { targetId?: string } | undefined)?.targetId ?? 'abstain';
      if (targetId !== 'abstain') {
        const target = room.players.find((p) => p.id === targetId && p.alive);
        if (!target) return fail('Alvo inválido.');
      }
      me.vote = targetId;

      const alive = room.players.filter((p) => p.alive);
      if (alive.every((p) => p.vote !== null)) resolveVote(room);
      return ok();
    }

    case 'rematch': {
      if (!me.isHost) return fail('Apenas o anfitrião pode reiniciar.');
      if (room.status !== 'playing' || room.phase !== 'reveal') return fail('A partida ainda não acabou.');
      startGame(room);
      pushChat(room, 'system', 'Sistema', '🔄 Nova partida! Novas cartas, novos papéis.');
      return ok();
    }

    default:
      return fail('Ação desconhecida.');
  }
}
