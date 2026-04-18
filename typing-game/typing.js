const wordDisplay = document.getElementById("word");
const textInput = document.getElementById("textInput");
const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");
const bestScoreDisplay = document.getElementById("bestScore");
const accuracyDisplay = document.getElementById("accuracy");
const feedbackMessage = document.getElementById("feedbackMessage");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const stopBtn = document.getElementById("stopBtn");
const gameOverScreen = document.getElementById("gameOver");
const finalScore = document.getElementById("finalScore");
const finalBestScore = document.getElementById("finalBestScore");
const difficultySelect = document.getElementById("difficultySelect");

const difficultySettings = {
    easy: {
        time: 14,
        bonus: 3,
        words: ["cat", "book", "rain", "tree", "smile", "music", "happy", "light","heart","kiss","game","hungry"]
    },
    medium: {
        time: 12,
        bonus: 2,
        words: ["javascript", "developer", "keyboard", "function", "variable", "browser", "network", "project"]
    },
    hard: {
        time: 9,
        bonus: 1,
        words: ["asynchronous", "architecture", "polymorphism", "configuration", "encyclopedia", "transformation"]
    }
};

let score = 0;
let time = 10;
let timer = null;
let currentWord = "";
let bonusTime = 2;
let activeWords = [];
let totalAttempts = 0;
let correctAttempts = 0;
let isPlaying = false;

const bestScoreKey = "typingBestScore";

function getBestScore() {
    return Number(localStorage.getItem(bestScoreKey) || 0);
}

function setBestScore(scoreValue) {
    localStorage.setItem(bestScoreKey, String(scoreValue));
}

function updateAccuracy() {
    const accuracy = totalAttempts === 0 ? 100 : Math.round((correctAttempts / totalAttempts) * 100);
    accuracyDisplay.textContent = `${accuracy}%`;
}

function showWord() {
    const randomIndex = Math.floor(Math.random() * activeWords.length);
    currentWord = activeWords[randomIndex];
    wordDisplay.textContent = currentWord;
}

function applyDifficulty() {
    const settings = difficultySettings[difficultySelect.value];
    time = settings.time;
    bonusTime = settings.bonus;
    activeWords = settings.words;
    timeDisplay.textContent = time;
    currentWord = activeWords[0];
    wordDisplay.textContent = currentWord;
}

function resetRoundState() {
    score = 0;
    totalAttempts = 0;
    correctAttempts = 0;
    scoreDisplay.textContent = score;
    updateAccuracy();
    applyDifficulty();
}

function finishRound(message) {
    isPlaying = false;
    clearInterval(timer);
    timer = null;
    textInput.disabled = true;
    difficultySelect.disabled = false;

    const bestScore = Math.max(score, getBestScore());
    setBestScore(bestScore);

    finalScore.textContent = score;
    finalBestScore.textContent = bestScore;
    bestScoreDisplay.textContent = bestScore;
    gameOverScreen.classList.remove("hidden");
    feedbackMessage.textContent = message;
}

function endGame() {
    finishRound("Time is up. Start again for another sprint.");
}

function stopGame() {
    if (!isPlaying) {
        feedbackMessage.textContent = "No active round to stop.";
        return;
    }

    finishRound("Round stopped. You can start a new game any time.");
}

function countdown() {
    time -= 1;
    timeDisplay.textContent = time;

    if (time <= 0) {
        endGame();
    }
}

function startGame() {
    clearInterval(timer);
    resetRoundState();
    isPlaying = true;
    textInput.disabled = false;
    textInput.value = "";
    textInput.focus();
    difficultySelect.disabled = true;
    gameOverScreen.classList.add("hidden");
    showWord();
    feedbackMessage.textContent = "Go. Type the word exactly as shown.";
    timer = window.setInterval(countdown, 1000);
}

function handleInput() {
    if (!isPlaying) {
        return;
    }

    if (textInput.value.length === currentWord.length) {
        totalAttempts += 1;

        if (textInput.value.trim() === currentWord) {
            correctAttempts += 1;
            score += 1;
            time += bonusTime;
            scoreDisplay.textContent = score;
            timeDisplay.textContent = time;
            feedbackMessage.textContent = `Nice. "${currentWord}" was correct.`;
            textInput.value = "";
            showWord();
        } else {
            feedbackMessage.textContent = `Close, but that was not "${currentWord}". Try the next one.`;
            textInput.value = "";
            showWord();
        }

        updateAccuracy();
    }
}

function restartGame() {
    startGame();
}

bestScoreDisplay.textContent = getBestScore();
applyDifficulty();
startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", restartGame);
stopBtn.addEventListener("click", stopGame);
textInput.addEventListener("input", handleInput);
difficultySelect.addEventListener("change", () => {
    applyDifficulty();

    if (isPlaying) {
        feedbackMessage.textContent = `Difficulty changed to ${difficultySelect.value}. Round restarted.`;
        startGame();
        return;
    }

    feedbackMessage.textContent = `Difficulty changed to ${difficultySelect.value}. Start when you are ready.`;
});
