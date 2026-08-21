# 🏮 Deception: Murder in Hong Kong — Multiplayer

Site web do jogo social de dedução inspirado em **Deception: Murder in Hong Kong**.
Funciona em **celular e PC** (HTML/CSS/JS no navegador).

## 🎮 O que tem

- **Multiplayer online** — criar sala (com código) / entrar por código / lista de salas públicas
- **Mesa de tabuleiro** — jogadores em cadeiras ao redor da mesa, cartas, distintivos, tabuleiro de investigação
- **3 papéis** — Assassino, Perito Forense (designado pelo anfitrião ou aleatório) e Investigadores
- **Configurações** — 1 a 12 cadeiras, 1 a 6 rodadas, 1 a 3 dicas por rodada, sala pública ou privada
- **Modo offline** — `public/jogo-offline.html`: o jogo inteiro em 1 arquivo, 3–8 pessoas no mesmo aparelho, sem servidor

## 🖥️ Rodar localmente

```bash
npm install
npm run dev        # abre em http://localhost:3000
```

> O jogo usa salas em memória no servidor — ao reiniciar o servidor, as salas são apagadas (comportamento esperado).

## 🌍 Publicar com link PERMANENTE

Os links de sandbox/preview (`...e2b.app`) **expiram** quando o ambiente dorme.
Para um link que nunca cai, publique este projeto num host:

### Opção 1 — Render / Railway (recomendado para o multiplayer)
O multiplayer usa memória em servidor, então o ideal é um **servidor sempre ligado**:
1. Suba o projeto para um repositório no GitHub.
2. No [render.com](https://render.com) ou [railway.app](https://railway.app): *New Web Service* → aponte para o repo.
3. Build command: `npm run build` · Start command: `npm start`.
4. Pronto: você ganha uma URL fixa (ex.: `https://deception.onrender.com`).

### Opção 2 — VPS (qualquer provedor)
```bash
git clone SEU_REPO && cd DECEPTION
npm install && npm run build
npm start          # exponha a porta 3000 (ex.: com pm2 + Nginx/Caddy)
```

### Opção 3 — Vercel / Netlify (serverless)
O site sobe normalmente, **mas** salas em memória não sobrevivem entre requisições em
plataformas serverless. Para usar Vercel/Netlify no modo online, as salas precisam ser
migradas para um banco (Postgres — o projeto já vem configurado com Drizzle ORM) ou um
serviço tipo Redis. O **modo offline** (`/jogo-offline.html`) funciona em qualquer host
estático, inclusive Vercel/Netlify/GitHub Pages.

## ⚠️ Por que o link "sumiu"?

Os previews gerados nesta ferramenta rodam numa **sandbox temporária**: ela desliga após
períodos sem uso e o endereço antigo é desativado (erro *"Sandbox não encontrado"*).
É só reabrir o projeto (ou rodar o build de novo) para gerar um novo link — ou publicar
num dos hosts acima para o link nunca expirar.
