const MIN_NUMBER = 1;
const MAX_NUMBER = 20;

const modeButtons = document.querySelectorAll(".mode-btn");
const playerOneInput = document.getElementById("playerOneInput");
const playerTwoInput = document.getElementById("playerTwoInput");
const playerTwoField = document.getElementById("playerTwoField");
const startGameBtn = document.getElementById("startGameBtn");
const resetGameBtn = document.getElementById("resetGameBtn");
const guessForm = document.getElementById("guessForm");
const guessInput = document.getElementById("guessInput");
const submitGuessBtn = document.getElementById("submitGuessBtn");
const turnLabel = document.getElementById("turnLabel");
const statusMessage = document.getElementById("statusMessage");
const winnerBanner = document.getElementById("winnerBanner");
const playerOneHistoryTitle = document.getElementById("playerOneHistoryTitle");
const playerTwoHistoryTitle = document.getElementById("playerTwoHistoryTitle");
const playerOneHistory = document.getElementById("playerOneHistory");
const playerTwoHistory = document.getElementById("playerTwoHistory");

const gameState = {
    mode: "single",
    secretNumber: null,
    players: [],
    currentTurn: 0,
    active: false,
    usedBotGuesses: []
};

function getDefaultPlayerName() {
    return localStorage.getItem("username") || "Player 1";
}

function createPlayer(name, type) {
    return {
        name,
        type,
        guesses: []
    };
}

function getConfiguredPlayers() {
    const playerOneName = playerOneInput.value.trim() || getDefaultPlayerName();

    if (gameState.mode === "single") {
        return [
            createPlayer(playerOneName, "human"),
            createPlayer("Bot", "bot")
        ];
    }

    const playerTwoName = playerTwoInput.value.trim() || "Player 2";

    return [
        createPlayer(playerOneName, "human"),
        createPlayer(playerTwoName, "human")
    ];
}

function setMode(mode) {
    gameState.mode = mode;

    modeButtons.forEach((button) => {
        button.classList.toggle("active", button.dataset.mode === mode);
    });

    playerTwoField.style.display = mode === "single" ? "none" : "flex";
    playerTwoInput.disabled = mode === "single";
    playerTwoHistoryTitle.textContent = mode === "single" ? "Bot Guesses" : "Player 2 Guesses";
}

function randomNumber() {
    return Math.floor(Math.random() * (MAX_NUMBER - MIN_NUMBER + 1)) + MIN_NUMBER;
}

function updateTurnDisplay() {
    if (!gameState.active) {
        turnLabel.textContent = "Start a game";
        return;
    }

    turnLabel.textContent = `${gameState.players[gameState.currentTurn].name}'s turn`;
}

function renderPlayerHistory(listElement, player) {
    listElement.innerHTML = "";

    if (!player || player.guesses.length === 0) {
        const emptyItem = document.createElement("li");
        emptyItem.textContent = "No guesses yet.";
        listElement.appendChild(emptyItem);
        return;
    }

    player.guesses.forEach((entry, index) => {
        const item = document.createElement("li");
        item.textContent = `Turn ${index + 1}: guessed ${entry.guess} - ${entry.feedback}`;
        listElement.appendChild(item);
    });
}

function renderHistory() {
    renderPlayerHistory(playerOneHistory, gameState.players[0]);
    renderPlayerHistory(playerTwoHistory, gameState.players[1]);
    playerOneHistoryTitle.textContent = `${gameState.players[0].name} Guesses`;
    playerTwoHistoryTitle.textContent = `${gameState.players[1].name} Guesses`;
}

function setStatus(message) {
    statusMessage.textContent = message;
}

function setWinner(message) {
    winnerBanner.textContent = message;
    winnerBanner.classList.toggle("show", Boolean(message));
}

function enableGuessing(enabled) {
    guessInput.disabled = !enabled;
    submitGuessBtn.disabled = !enabled;
}

function startGame() {
    gameState.players = getConfiguredPlayers();
    gameState.secretNumber = randomNumber();
    gameState.currentTurn = 0;
    gameState.active = true;
    gameState.usedBotGuesses = [];

    renderHistory();
    updateTurnDisplay();
    setWinner("");
    setStatus(`${gameState.players[0].name} starts. Guess a number between ${MIN_NUMBER} and ${MAX_NUMBER}.`);
    enableGuessing(true);
    guessInput.value = "";
    guessInput.focus();
}

function getFeedback(guess) {
    if (guess < gameState.secretNumber) {
        return "Too low";
    }

    if (guess > gameState.secretNumber) {
        return "Too high";
    }

    return "Correct";
}

function endGame(winnerName) {
    gameState.active = false;
    enableGuessing(false);
    updateTurnDisplay();
    setStatus(`${winnerName} guessed the correct number: ${gameState.secretNumber}.`);
    setWinner(`${winnerName} wins this round.`);
}

function recordGuess(playerIndex, guess) {
    const player = gameState.players[playerIndex];
    const feedback = getFeedback(guess);

    player.guesses.push({
        guess,
        feedback
    });

    renderHistory();

    if (feedback === "Correct") {
        endGame(player.name);
        return true;
    }

    return false;
}

function nextTurn() {
    gameState.currentTurn = gameState.currentTurn === 0 ? 1 : 0;
    updateTurnDisplay();
}

function handleHumanGuess(event) {
    event.preventDefault();

    if (!gameState.active) {
        return;
    }

    const guess = Number(guessInput.value);

    if (!Number.isInteger(guess) || guess < MIN_NUMBER || guess > MAX_NUMBER) {
        setStatus(`Enter a whole number between ${MIN_NUMBER} and ${MAX_NUMBER}.`);
        return;
    }

    const player = gameState.players[gameState.currentTurn];

    if (player.type !== "human") {
        return;
    }

    const feedback = getFeedback(guess);
    const won = recordGuess(gameState.currentTurn, guess);
    guessInput.value = "";

    if (won) {
        return;
    }

    setStatus(`${player.name} guessed ${guess}. ${feedback}.`);
    nextTurn();

    if (gameState.mode === "single" && gameState.players[gameState.currentTurn].type === "bot") {
        enableGuessing(false);
        window.setTimeout(playBotTurn, 700);
        return;
    }

    enableGuessing(true);
    guessInput.focus();
}

function getBotGuess() {
    let guess = randomNumber();

    while (gameState.usedBotGuesses.includes(guess)) {
        guess = randomNumber();
    }

    gameState.usedBotGuesses.push(guess);
    return guess;
}

function playBotTurn() {
    if (!gameState.active) {
        return;
    }

    const botGuess = getBotGuess();
    const feedback = getFeedback(botGuess);
    const won = recordGuess(gameState.currentTurn, botGuess);

    if (won) {
        return;
    }

    setStatus(`Bot guessed ${botGuess}. ${feedback}. Your turn now.`);
    nextTurn();
    enableGuessing(true);
    guessInput.focus();
}

function resetGame() {
    gameState.players = [
        createPlayer(getDefaultPlayerName(), "human"),
        createPlayer(gameState.mode === "single" ? "Bot" : "Player 2", gameState.mode === "single" ? "bot" : "human")
    ];
    gameState.secretNumber = null;
    gameState.currentTurn = 0;
    gameState.active = false;
    gameState.usedBotGuesses = [];

    renderHistory();
    updateTurnDisplay();
    setStatus("Choose a mode and begin.");
    setWinner("");
    enableGuessing(false);
    guessInput.value = "";
}

modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
        setMode(button.dataset.mode);
        resetGame();
    });
});

startGameBtn.addEventListener("click", startGame);
resetGameBtn.addEventListener("click", resetGame);
guessForm.addEventListener("submit", handleHumanGuess);

playerOneInput.value = getDefaultPlayerName();
setMode("single");
resetGame();
