const CONFIG = {
  version: "1.1.0",
  buildDate: "06/10/2026"
};

const SUITS = ['h', 'd', 'c', 's'];
const SUIT_SYMBOLS = { h: '♥', d: '♦', c: '♣', s: '♠' };
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// Ilustrações Vetoriais Minimalistas para os Reis, Rainhas e Valetes (Estilo Baralho Clássico)
const FIGURE_SVGS = {
  J: `<svg viewBox="0 0 40 50"><path d="M12 12 h16 v6 h-16 z M20 18 v20 M14 38 h12" stroke="currentColor" stroke-width="3" fill="none"/><circle cx="20" cy="8" r="4" fill="currentColor"/></svg>`,
  Q: `<svg viewBox="0 0 40 50"><path d="M10 38 L20 10 L30 38 Z" stroke="currentColor" stroke-width="3" fill="none"/><circle cx="20" cy="24" r="6" fill="currentColor"/><circle cx="20" cy="6" r="3" fill="currentColor"/></svg>`,
  K: `<svg viewBox="0 0 40 50"><path d="M10 40 V10 L20 22 L30 10 V40" stroke="currentColor" stroke-width="3" fill="none"/><path d="M8 10 h24" stroke="currentColor" stroke-width="2"/></svg>`
};

let stock = [];
let waste = [];
let foundations = [[], [], [], []];
let tableau = [[], [], [], [], [], [], []];
let drawThree = false;

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("app-version").innerText = CONFIG.version;
  document.getElementById("app-build-date").innerText = CONFIG.buildDate;

  document.getElementById("btn-new-game").onclick = initGame;
  document.getElementById("btn-settings").onclick = () => toggleModal(true);
  document.getElementById("btn-close-modal").onclick = () => toggleModal(false);
  document.getElementById("stock").onclick = handleStockClick;
  document.getElementById("setting-draw-three").onchange = (e) => {
    drawThree = e.target.checked;
    initGame();
  };

  initGame();
});

function toggleModal(show) {
  document.getElementById("settings-modal").classList.toggle("hidden", !show);
}

function createDeck() {
  let deck = [];
  SUITS.forEach(suit => {
    VALUES.forEach((val, idx) => {
      deck.push({
        id: `${suit}_${val}`,
        suit,
        value: val,
        rank: idx + 1,
        color: (suit === 'h' || suit === 'd') ? 'red' : 'black',
        faceUp: false
      });
    });
  });
  return deck.sort(() => Math.random() - 0.5);
}

function initGame() {
  const deck = createDeck();
  foundations = [[], [], [], []];
  tableau = [[], [], [], [], [], [], []];
  waste = [];

  for (let i = 0; i < 7; i++) {
    for (let j = i; j < 7; j++) {
      let card = deck.pop();
      if (i === j) card.faceUp = true;
      tableau[j].push(card);
    }
  }
  stock = deck;
  render();
}

function handleStockClick() {
  if (stock.length === 0) {
    stock = waste.reverse().map(c => ({ ...c, faceUp: false }));
    waste = [];
  } else {
    let count = drawThree ? 3 : 1;
    for (let i = 0; i < count && stock.length > 0; i++) {
      let card = stock.pop();
      card.faceUp = true;
      waste.push(card);
    }
  }
  render();
}

/* Mecânica de Auto-Move com Duplo Clique */
function handleCardDoubleClick(card, locationInfo) {
  if (!card || !card.faceUp) return;

  // 1. Tentar mover para as Fundações
  for (let fIdx = 0; fIdx < 4; fIdx++) {
    if (canMoveToFoundation(card, fIdx)) {
      executeMove(locationInfo, { type: 'foundation', index: fIdx }, card);
      return;
    }
  }

  // 2. Se não couber na Fundação, tentar mover para alguma Coluna do Tableau
  for (let tIdx = 0; tIdx < 7; tIdx++) {
    if (locationInfo.type === 'tableau' && locationInfo.colIndex === tIdx) continue;
    if (canMoveToTableau(card, tIdx)) {
      executeMove(locationInfo, { type: 'tableau', colIndex: tIdx }, card);
      return;
    }
  }
}

function canMoveToFoundation(card, fIdx) {
  const fStack = foundations[fIdx];
  if (fStack.length === 0) {
    return card.rank === 1; // Deve ser Ás
  }
  const topCard = fStack[fStack.length - 1];
  return topCard.suit === card.suit && card.rank === topCard.rank + 1;
}

function canMoveToTableau(card, tIdx) {
  const col = tableau[tIdx];
  if (col.length === 0) {
    return card.rank === 13; // Rei em espaço vazio
  }
  const topCard = col[col.length - 1];
  return topCard.faceUp && topCard.color !== card.color && card.rank === topCard.rank - 1;
}

function executeMove(from, to, card) {
  let cardsToMove = [];

  // Remover origem
  if (from.type === 'waste') {
    cardsToMove.push(waste.pop());
  } else if (from.type === 'tableau') {
    const col = tableau[from.colIndex];
    const cardIdx = col.findIndex(c => c.id === card.id);
    cardsToMove = col.splice(cardIdx);
    
    // Revela a carta anterior se ficou virada para baixo
    if (col.length > 0) {
      col[col.length - 1].faceUp = true;
    }
  } else if (from.type === 'foundation') {
    cardsToMove.push(foundations[from.index].pop());
  }

  // Inserir destino
  if (to.type === 'foundation') {
    foundations[to.index].push(...cardsToMove);
  } else if (to.type === 'tableau') {
    tableau[to.colIndex].push(...cardsToMove);
  }

  render();
}

/* Construtor Visual das Cartas */
function renderCard(card, locationInfo) {
  const div = document.createElement("div");
  div.className = `card ${card.faceUp ? card.color : 'back'}`;

  if (card.faceUp) {
    const symbol = SUIT_SYMBOLS[card.suit];

    // Canto Superior Esquerdo
    const topLeft = document.createElement("div");
    topLeft.className = "card-corner top-left";
    topLeft.innerHTML = `<span>${card.value}</span><span>${symbol}</span>`;

    // Canto Inferior Direito
    const bottomRight = document.createElement("div");
    bottomRight.className = "card-corner bottom-right";
    bottomRight.innerHTML = `<span>${card.value}</span><span>${symbol}</span>`;

    // Centro da Carta
    const center = document.createElement("div");
    center.className = "card-center";

    if (['J', 'Q', 'K'].includes(card.value)) {
      center.innerHTML = `<div class="figure-art">${FIGURE_SVGS[card.value]}</div>`;
    } else if (card.value === 'A') {
      center.innerHTML = `<span style="font-size: 32px;">${symbol}</span>`;
    } else {
      center.innerHTML = `<div class="pip-grid">${symbol}</div>`;
    }

    div.appendChild(topLeft);
    div.appendChild(center);
    div.appendChild(bottomRight);

    // Evento de Duplo Clique / Toque duplo no Celular
    let lastTap = 0;
    div.addEventListener("touchend", (e) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      if (tapLength < 300 && tapLength > 0) {
        e.preventDefault();
        handleCardDoubleClick(card, locationInfo);
      }
      lastTap = currentTime;
    });

    div.ondblclick = () => handleCardDoubleClick(card, locationInfo);
  }

  return div;
}

function render() {
  // Render Stock
  const stockEl = document.getElementById("stock");
  stockEl.innerHTML = "";
  if (stock.length > 0) stockEl.appendChild(renderCard({ faceUp: false }));

  // Render Waste
  const wasteEl = document.getElementById("waste");
  wasteEl.innerHTML = "";
  if (waste.length > 0) {
    const card = waste[waste.length - 1];
    wasteEl.appendChild(renderCard(card, { type: 'waste' }));
  }

  // Render Foundations
  for (let i = 0; i < 4; i++) {
    const fEl = document.getElementById(`foundation-${i}`);
    fEl.innerHTML = "";
    if (foundations[i].length > 0) {
      const card = foundations[i][foundations[i].length - 1];
      fEl.appendChild(renderCard(card, { type: 'foundation', index: i }));
    }
  }

  // Render Tableau
  for (let i = 0; i < 7; i++) {
    const tEl = document.getElementById(`tableau-${i}`);
    tEl.innerHTML = "";
    tableau[i].forEach((card, idx) => {
      const cardEl = renderCard(card, { type: 'tableau', colIndex: i });
      cardEl.style.top = `${idx * 16}px`;
      tEl.appendChild(cardEl);
    });
  }
}