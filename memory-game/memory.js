const memoryBoard = document.getElementById("memoryBoard");
const movesCount = document.getElementById("movesCount");
const matchesCount = document.getElementById("matchesCount");
const bestMoves = document.getElementById("bestMoves");
const memoryStatus = document.getElementById("memoryStatus");
const restartMemoryBtn = document.getElementById("restartMemoryBtn");

const memoryIcons = ["🎮", "🚀", "🧩", "⚡", "🎯", "🏆", "🎲", "👾"];
const memoryBestKey = "memoryBestMoves";

let cards = [];
let flippedCards = [];
let moves = 0;
let matches = 0;
let lockBoard = false;

function shuffle(array) {
    const copy = [...array];

    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    return copy;
}

function updateMemoryStats() {
    movesCount.textContent = moves;
    matchesCount.textContent = matches;
    bestMoves.textContent = localStorage.getItem(memoryBestKey) || "-";
}

function createMemoryCard(icon, index) {
    const button = document.createElement("button");
    button.className = "memory-card";
    button.type = "button";
    button.dataset.icon = icon;
    button.dataset.index = index;
    button.innerHTML = `
        <span class="memory-face memory-front">?</span>
        <span class="memory-face memory-back">${icon}</span>
    `;
    button.addEventListener("click", () => flipCard(button));
    return button;
}

function buildBoard() {
    const deck = shuffle([...memoryIcons, ...memoryIcons]);
    cards = [];
    memoryBoard.innerHTML = "";

    deck.forEach((icon, index) => {
        const card = createMemoryCard(icon, index);
        cards.push(card);
        memoryBoard.appendChild(card);
    });
}

function finishGame() {
    memoryStatus.textContent = `You cleared the board in ${moves} moves.`;
    const best = Number(localStorage.getItem(memoryBestKey) || 0);

    if (best === 0 || moves < best) {
        localStorage.setItem(memoryBestKey, String(moves));
        memoryStatus.textContent = `New best score: ${moves} moves.`;
    }

    updateMemoryStats();
}

function unflipCards() {
    lockBoard = true;
    window.setTimeout(() => {
        flippedCards.forEach((card) => card.classList.remove("flipped"));
        flippedCards = [];
        lockBoard = false;
        memoryStatus.textContent = "Not a match. Try again.";
    }, 700);
}

function flipCard(card) {
    if (lockBoard || card.classList.contains("flipped") || card.classList.contains("matched")) {
        return;
    }

    card.classList.add("flipped");
    flippedCards.push(card);

    if (flippedCards.length < 2) {
        memoryStatus.textContent = "Choose one more card.";
        return;
    }

    moves += 1;
    updateMemoryStats();

    const [first, second] = flippedCards;

    if (first.dataset.icon === second.dataset.icon) {
        first.classList.add("matched");
        second.classList.add("matched");
        flippedCards = [];
        matches += 1;
        updateMemoryStats();
        memoryStatus.textContent = "Match found.";

        if (matches === memoryIcons.length) {
            finishGame();
        }

        return;
    }

    unflipCards();
}

function startMemoryGame() {
    flippedCards = [];
    moves = 0;
    matches = 0;
    lockBoard = false;
    memoryStatus.textContent = "Match all 8 pairs to win.";
    buildBoard();
    updateMemoryStats();
}

restartMemoryBtn.addEventListener("click", startMemoryGame);
updateMemoryStats();
startMemoryGame();
