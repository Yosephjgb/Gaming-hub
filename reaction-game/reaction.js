const reactionBox = document.getElementById("reactionBox");
const reactionText = document.getElementById("reactionText");
const startReactionBtn = document.getElementById("startReactionBtn");
const resetReactionBtn = document.getElementById("resetReactionBtn");
const lastTime = document.getElementById("lastTime");
const bestTime = document.getElementById("bestTime");
const roundCount = document.getElementById("roundCount");
const reactionStatus = document.getElementById("reactionStatus");

const reactionBestKey = "reactionBestTime";

let waitingTimeout = null;
let startTime = 0;
let rounds = 0;
let gameState = "idle";

function updateReactionStats(timeValue) {
    if (typeof timeValue === "number") {
        lastTime.textContent = `${timeValue} ms`;
    }

    bestTime.textContent = localStorage.getItem(reactionBestKey) ? `${localStorage.getItem(reactionBestKey)} ms` : "-";
    roundCount.textContent = rounds;
}

function setReactionBoxState(state, message) {
    gameState = state;
    reactionBox.className = `reaction-box ${state}`;
    reactionText.textContent = message;
}

function startReactionRound() {
    window.clearTimeout(waitingTimeout);
    setReactionBoxState("waiting", "Wait for green...");
    reactionStatus.textContent = "Do not click yet.";

    const delay = Math.floor(Math.random() * 2500) + 1500;
    waitingTimeout = window.setTimeout(() => {
        startTime = performance.now();
        setReactionBoxState("ready", "CLICK NOW");
        reactionStatus.textContent = "Go.";
    }, delay);
}

function handleReactionClick() {
    if (gameState === "waiting") {
        window.clearTimeout(waitingTimeout);
        setReactionBoxState("idle", "Too soon. Press Start Round to try again.");
        reactionStatus.textContent = "False start.";
        return;
    }

    if (gameState !== "ready") {
        return;
    }

    const elapsed = Math.round(performance.now() - startTime);
    rounds += 1;
    const storedBest = Number(localStorage.getItem(reactionBestKey) || 0);

    if (storedBest === 0 || elapsed < storedBest) {
        localStorage.setItem(reactionBestKey, String(elapsed));
        reactionStatus.textContent = `New best reaction: ${elapsed} ms.`;
    } else {
        reactionStatus.textContent = `Nice reaction. ${elapsed} ms.`;
    }

    updateReactionStats(elapsed);
    setReactionBoxState("idle", "Press Start Round for another test.");
}

function resetReactionStats() {
    window.clearTimeout(waitingTimeout);
    rounds = 0;
    localStorage.removeItem(reactionBestKey);
    lastTime.textContent = "-";
    updateReactionStats();
    reactionStatus.textContent = "Stats reset. Start a round when you are ready.";
    setReactionBoxState("idle", "Press Start, then wait for green.");
}

startReactionBtn.addEventListener("click", startReactionRound);
resetReactionBtn.addEventListener("click", resetReactionStats);
reactionBox.addEventListener("click", handleReactionClick);
reactionBox.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleReactionClick();
    }
});

updateReactionStats();
setReactionBoxState("idle", "Press Start, then wait for green.");
