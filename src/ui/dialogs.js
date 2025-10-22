let dialogueLog;
let dialogueTemplate;
let goalText;
let sceneTitle;
let roundLabel;
let toastContainer;
let rushOverlay;
let rushStatus;
let rushFeed;
let rushBar;
let buffChip;
let gameScreen;

export function initDialogUI() {
  dialogueLog = document.getElementById("dialogue-log");
  dialogueTemplate = document.getElementById("dialogue-line-template");
  goalText = document.getElementById("goal-text");
  sceneTitle = document.getElementById("scene-title");
  roundLabel = document.getElementById("round-label");
  toastContainer = document.getElementById("toast-container");
  rushOverlay = document.getElementById("rush-overlay");
  rushStatus = document.getElementById("rush-status");
  rushFeed = document.getElementById("rush-feed");
  rushBar = document.getElementById("rush-progress-bar");
  buffChip = document.getElementById("buff-status");
  gameScreen = document.getElementById("game-screen");
}

export function clearDialogue() {
  if (dialogueLog) {
    dialogueLog.innerHTML = "";
  }
}

export function pushDialogue(speaker, line) {
  if (!dialogueLog || !dialogueTemplate) return;
  const fragment = dialogueTemplate.content.cloneNode(true);
  fragment.querySelector(".speaker").textContent = speaker;
  fragment.querySelector(".line-text").textContent = line;
  dialogueLog.appendChild(fragment);
  dialogueLog.scrollTop = dialogueLog.scrollHeight;
}

export function setGoal(message) {
  if (goalText) goalText.textContent = message;
}

export function setSceneHeading(title) {
  if (sceneTitle) sceneTitle.textContent = title;
}

export function setRoundInfo(round, suffix = "") {
  if (roundLabel) {
    roundLabel.textContent = suffix ? `Day ${round} · ${suffix}` : `Day ${round}`;
  }
}

export function showToast(message, variant = "info") {
  if (!toastContainer) return;
  const toast = document.createElement("div");
  toast.className = `toast ${variant}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("fade");
  }, 2600);
  setTimeout(() => {
    toast.remove();
  }, 3400);
}

export function showRushOverlay(statusText) {
  if (!rushOverlay) return;
  rushOverlay.classList.remove("hidden");
  rushStatus.textContent = statusText ?? "Steam primed...";
  rushFeed.innerHTML = "";
  if (rushBar) {
    rushBar.style.width = "0%";
  }
}

export function hideRushOverlay(finalText) {
  if (!rushOverlay) return;
  if (finalText) {
    rushStatus.textContent = finalText;
  }
  setTimeout(() => {
    rushOverlay.classList.add("hidden");
  }, 600);
}

export function updateRushProgress(progress) {
  if (rushBar) {
    rushBar.style.width = `${Math.min(progress, 100)}%`;
  }
}

export function appendRushEntry(label, delta) {
  if (!rushFeed) return;
  const row = document.createElement("div");
  row.className = `rush-entry ${delta >= 0 ? "positive" : "negative"}`;
  row.innerHTML = `<span>${label}</span><span>${delta >= 0 ? "+" : ""}${delta.toFixed(2)}</span>`;
  rushFeed.appendChild(row);
  rushFeed.scrollTop = rushFeed.scrollHeight;
}

export function updateRushStatus(text) {
  if (rushStatus) rushStatus.textContent = text;
}

export function updateBuffStatus(active, streak = 0) {
  if (!buffChip) return;
  if (active) {
    buffChip.classList.add("active");
    buffChip.textContent = `Perfect Pour buff ×${(1 + streak * 0.1).toFixed(1)}`;
  } else {
    buffChip.classList.remove("active");
    buffChip.textContent = "No buff";
  }
}

export function celebrateProfit() {
  if (!gameScreen) return;
  gameScreen.classList.add("confetti");
  setTimeout(() => {
    gameScreen.classList.remove("confetti");
  }, 1200);
}
