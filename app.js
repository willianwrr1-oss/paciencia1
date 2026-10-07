const CONFIG = {
  version: "1.0.0",
  buildDate: "06/10/2026"
};

const SUITS = ['h', 'd', 'c', 's']; // Copas, Ouros, Paus, Espadas
const SUIT_SYMBOLS = { h: '♥', d: '♦', c: '♣', s: '♠' };
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

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

function renderCard(card) {
  const div = document.createElement("div");
  div.className = `card ${card.faceUp ? card.color : 'back'}`;
  if (card.faceUp) {
    div.innerHTML = `<div>${card.value}${SUIT_SYMBOLS[card.suit]}</div><div>${card.value}</div>`;
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
  if (waste.length > 0) wasteEl.appendChild(renderCard(waste[waste.length - 1]));

  // Render Foundations
  for (let i = 0; i < 4; i++) {
    const fEl = document.getElementById(`foundation-${i}`);
    fEl.innerHTML = "";
    if (foundations[i].length > 0) {
      fEl.appendChild(renderCard(foundations[i][foundations[i].length - 1]));
    }
  }

  // Render Tableau
  for (let i = 0; i < 7; i++) {
    const tEl = document.getElementById(`tableau-${i}`);
    tEl.innerHTML = "";
    tableau[i].forEach((card, idx) => {
      const cardEl = renderCard(card);
      cardEl.style.top = `${idx * 16}px`;
      tEl.appendChild(cardEl);
    });
  }
}