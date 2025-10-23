import {
  state,
  params,
  episodes,
  roundConcepts,
  episodeConcepts,
  resetForNewGame,
  advanceRound,
  rivalsCount,
  recordHistory
} from "./state.js";
import {
  effectiveCurveParams,
  demandAtQuantity,
  marginalRevenueAtQuantity,
  marginalCostAtQuantity,
  averageTotalCost,
  economicProfit,
  brandGain,
  generateCurveSeries,
  computeOverlayPoint
} from "../econ/formulas.js";
import { initCurveChart, updateCurveChart } from "../charts/chart.js";
import {
  initDialogUI,
  clearDialogue,
  pushDialogue,
  setGoal,
  setSceneHeading,
  setRoundInfo,
  showToast,
  showRushOverlay,
  hideRushOverlay,
  updateRushProgress,
  appendRushEntry,
  updateRushStatus,
  updateBuffStatus,
  celebrateProfit
} from "../ui/dialogs.js";
import {
  initControls,
  setSliderValues,
  setOverlayChecked,
  setControlsDisabled,
  updateMetricsDisplay
} from "../ui/controls.js";

let titleScreen;
let gameScreen;
let priceTauntTriggered = false;
let rushIntervalId = null;

const profitDialogueVariants = [
  ({ formatted, round }) => {
    pushDialogue("You", `Day ${round} closes with profit ${formatted}. Beans well spent.`);
    pushDialogue("Ms. Park", "Strong pull. Keep those margins tight tomorrow.");
  },
  ({ formatted, brand }) => {
    pushDialogue("You", `Cleared ${formatted} in the till. Brand meter is humming.`);
    pushDialogue("Ms. Park", `Brand sits at ${brand.toFixed(2)}. Momentum is finally brewing.`);
  },
  ({ formatted }) => {
    pushDialogue("You", `Another profit shot: ${formatted}. Feels like a clean pour.`);
    pushDialogue("Ms. Park", "Bank it and reset. Rivals sip for weakness.");
  }
];

const lossDialogueVariants = [
  ({ formattedLoss, mrDiff }) => {
    pushDialogue("You", `Short ${formattedLoss}. MR and MC missed by ${mrDiff.toFixed(2)}.`);
    pushDialogue("Ms. Park", "Tighten that equality. Dial quality or ads until MR = MC.");
  },
  ({ formattedLoss, round }) => {
    pushDialogue("You", `Day ${round} spilled ${formattedLoss} in losses.`);
    pushDialogue("Ms. Park", "Losses sting, but the curves still listen. Adjust and rebound.");
  },
  ({ formattedLoss, consecutiveLosses }) => {
    const streak = consecutiveLosses > 1 ? `${consecutiveLosses} losses` : "a loss";
    pushDialogue("You", `Logged ${formattedLoss} red and ${streak} in a row.`);
    pushDialogue("Ms. Park", "Breathe. Shift output, watch costs, and reclaim margin.");
  }
];

function emitDayOutcomeDialogue(outcome, context) {
  const pool = outcome === "profit" ? profitDialogueVariants : lossDialogueVariants;
  if (!pool.length) return;
  const key = outcome === "profit" ? "profit" : "loss";
  const index = state.dialogueCycle?.[key] ?? 0;
  const handler = pool[index % pool.length];
  handler(context);
  if (state.dialogueCycle) {
    state.dialogueCycle[key] = (index + 1) % pool.length;
  }
}

function presentConceptScript(script, context = {}) {
  if (!Array.isArray(script) || !script.length) return;
  script.forEach(({ speaker, line }) => {
    if (!speaker || !line) return;
    const message = typeof line === "function" ? line(context) : line;
    pushDialogue(speaker, message);
  });
}

function presentRoundConcepts(context = {}) {
  const script = roundConcepts[state.round] ?? roundConcepts.default;
  presentConceptScript(script, context);
}

function presentEpisodeConcepts(episodeKey, context = {}) {
  if (!episodeKey) return;
  const script = episodeConcepts[episodeKey] ?? [];
  presentConceptScript(script, context);
}

export function initGame() {
  resetForNewGame();
  initDialogUI();
  titleScreen = document.getElementById("title-screen");
  gameScreen = document.getElementById("game-screen");

  initControls({
    onQualityChange: (value) => handleSliderChange("quality", value),
    onAdChange: (value) => handleSliderChange("advertising", value),
    onOutputChange: (value) => handleSliderChange("output", value),
    onOverlayToggle: handleOverlayToggle,
    onEndDay: handleEndDay
  });

  const canvas = document.getElementById("curveCanvas");
  if (canvas) {
    initCurveChart(canvas);
  }

  setSliderValues({
    quality: state.quality,
    advertising: state.advertising,
    output: state.output
  });
  setOverlayChecked(state.overlayEnabled);
  updateBuffStatus(state.perfectPourBuffActive, state.perfectPourStreak);

  const startButton = document.getElementById("start-brewing");
  if (startButton) {
    startButton.addEventListener("click", beginCampaign);
  }

  computeAndRender();
  clearDialogue();
  presentEpisodeConcepts(state.episode, { phase: "prologueIntro", round: state.round });
  presentRoundConcepts({ phase: "prologue", round: state.round });
}

function beginCampaign() {
  if (titleScreen) {
    titleScreen.classList.remove("active");
    setTimeout(() => titleScreen.classList.add("hidden"), 480);
  }
  if (gameScreen) {
    gameScreen.classList.remove("hidden");
  }
  const roundChange = advanceRound();
  updateEpisodeUI();
  clearDialogue();
  if (roundChange?.episodeChanged) {
    presentEpisodeConcepts(roundChange.currentEpisode, {
      phase: "episodeIntro",
      round: state.round,
      episode: state.episode
    });
  }
  presentRoundConcepts({
    phase: "dayStart",
    round: state.round,
    episode: state.episode,
    episodeChanged: roundChange?.episodeChanged ?? false
  });
  priceTauntTriggered = false;
  computeAndRender();
  updateBuffStatus(state.perfectPourBuffActive, state.perfectPourStreak);
}

function handleSliderChange(key, value) {
  if (state.rushRunning) return;
  const prevPrice = state.metrics.price ?? null;
  state[key] = value;
  computeAndRender();
  if (prevPrice !== null) {
    const delta = Math.abs(state.metrics.price - prevPrice);
    if (delta >= 1 && !priceTauntTriggered) {
      triggerRivalTaunt("Juno", "Another price pivot? Bold. Hope your crema keeps up.");
      priceTauntTriggered = true;
    }
  }
}

function handleOverlayToggle(enabled) {
  state.overlayEnabled = enabled;
  computeAndRender();
}

function handleEndDay() {
  if (state.rushRunning) return;
  const metricsSnapshot = { ...state.metrics };
  clearDialogue();
  state.rushRunning = true;
  priceTauntTriggered = false;
  setControlsDisabled(true);
  showRushOverlay("Doors open! Rush incoming...");
  startRushHour(metricsSnapshot);
}

function startRushHour(metrics) {
  const duration = 8000;
  const stepMs = 400;
  const steps = Math.round(duration / stepMs);
  let tick = 0;
  let displayedProfit = 0;

  rushIntervalId = setInterval(() => {
    tick += 1;
    const progress = Math.min((tick / steps) * 100, 100);
    updateRushProgress(progress);

    const ratio = tick / steps;
    const target = metrics.profit * ratio;
    const chunk = target - displayedProfit;
    displayedProfit = target;

    const customers = Math.max(1, Math.round(Math.random() * 2) + 1);
    updateRushStatus(`Serving ${customers} ${customers === 1 ? "customer" : "customers"}...`);

    for (let i = 0; i < customers; i += 1) {
      const portion = chunk / customers + randomVariance(chunk, customers);
      appendRushEntry("Customer", portion);
    }

    if (tick >= steps) {
      clearInterval(rushIntervalId);
      rushIntervalId = null;
      finishRushHour(metrics);
    }
  }, stepMs);
}

function randomVariance(chunk, customers) {
  if (customers <= 1) return 0;
  const magnitude = Math.abs(chunk) / Math.max(customers * 4, 1);
  return (Math.random() - 0.5) * magnitude;
}

function finishRushHour(metrics) {
  updateRushStatus("Rush tamed. Counting beans...");
  updateRushProgress(100);
  hideRushOverlay();
  setTimeout(() => {
    resolveDay(metrics);
  }, 600);
}

function resolveDay(metrics) {
  const currentRound = state.round;
  const profit = metrics.profit;
  const mrDiff = Math.abs(metrics.mr - metrics.mc);
  const buffMultiplier = state.perfectPourBuffActive ? 1 + params.perfectPourBuff : 1;
  const gain = brandGain(params, state.advertising, buffMultiplier);
  state.brand = Number((state.brand + gain).toFixed(2));

  if (mrDiff <= 1) {
    state.perfectPourStreak += 1;
    state.perfectPourBuffActive = true;
    showToast("Perfect Pour! Buff locked for tomorrow.", "success");
  } else {
    state.perfectPourStreak = 0;
    state.perfectPourBuffActive = false;
  }

  state.cumulativeProfit += profit;
  if (profit < 0) {
    state.consecutiveLosses += 1;
  } else {
    state.consecutiveLosses = 0;
  }

  recordHistory({
    round: currentRound,
    quality: state.quality,
    advertising: state.advertising,
    output: state.output,
    price: metrics.price,
    mr: metrics.mr,
    mc: metrics.mc,
    atc: metrics.atc,
    profit,
    brandAfter: state.brand
  });

  if (profit >= 0) {
    const formatted = profit.toFixed(2);
    emitDayOutcomeDialogue("profit", {
      formatted,
      round: currentRound,
      brand: state.brand,
      mrDiff
    });
    celebrateProfit();
    showToast("Profit achieved. Rent thanks you.", "success");
  } else {
    const formattedLoss = Math.abs(profit).toFixed(2);
    emitDayOutcomeDialogue("loss", {
      formattedLoss,
      round: currentRound,
      mrDiff,
      consecutiveLosses: state.consecutiveLosses
    });
    showToast("Loss detected. Adjust those curves.", "warn");
  }

  if (state.consecutiveLosses >= 2) {
    triggerRivalTaunt("Mika", "Two down days? Need my discount punch card?");
    state.consecutiveLosses = 0;
  }

  updateBuffStatus(state.perfectPourBuffActive, state.perfectPourStreak);

  state.rushRunning = false;
  const roundChange = advanceRound();
  updateEpisodeUI();
  computeAndRender();
  if (roundChange?.episodeChanged) {
    presentEpisodeConcepts(roundChange.currentEpisode, {
      phase: "episodeIntro",
      round: state.round,
      episode: state.episode,
      profitLastDay: profit,
      cumulativeProfit: state.cumulativeProfit
    });
  }
  presentRoundConcepts({
    profitLastDay: profit,
    cumulativeProfit: state.cumulativeProfit,
    brand: state.brand,
    perfectPourStreak: state.perfectPourStreak,
    mrDiff,
    phase: "dayStart",
    round: state.round,
    episode: state.episode,
    episodeChanged: roundChange?.episodeChanged ?? false
  });
  setControlsDisabled(false);
}

function computeAndRender() {
  const snapshot = {
    brand: state.brand,
    quality: state.quality,
    advertising: state.advertising,
    output: state.output,
    rivals: rivalsCount(),
    demandModifier: state.demandModifier,
    costModifier: state.costModifier
  };

  const effective = effectiveCurveParams(params, snapshot);
  const qMax = params.chartQMax ?? 24;
  const step = params.chartStep ?? 0.5;
  const series = generateCurveSeries(params, effective, qMax, step);
  const overlayInfo = computeOverlayPoint(params, effective, qMax);
  const quantity = state.output;
  const priceVal = demandAtQuantity(params, effective, quantity);
  const mrVal = marginalRevenueAtQuantity(params, effective, quantity);
  const mcVal = marginalCostAtQuantity(effective, quantity);
  const atcVal = averageTotalCost(params, effective, quantity);
  const profitVal = economicProfit(params, effective, quantity, priceVal);

  state.metrics = {
    price: priceVal,
    mr: mrVal,
    mc: mcVal,
    atc: atcVal,
    profit: profitVal,
    overlayQ: overlayInfo.visible ? overlayInfo.q : null,
    overlayP: overlayInfo.visible ? overlayInfo.p : null,
    overlayVisible: overlayInfo.visible,
    baseNumerator: effective.aEff
  };
  state.lastPrice = priceVal;

  updateMetricsDisplay({
    price: priceVal,
    mr: mrVal,
    mc: mcVal,
    atc: atcVal,
    profit: profitVal,
    brand: state.brand,
    cumulative: state.cumulativeProfit,
    rivals: rivalsCount(),
    points: state.cumulativeProfit
  });

  updateCurveChart({
    demandPoints: series.demandPoints,
    mrPoints: series.mrPoints,
    mcPoints: series.mcPoints,
    currentPoint: { x: quantity, y: priceVal },
    overlay: overlayInfo,
    overlayEnabled: state.overlayEnabled
  });

  return state.metrics;
}

function updateEpisodeUI() {
  const info = episodes[state.episode] ?? episodes.episode1;
  setSceneHeading(info.title);
  setGoal(info.goal);
  const suffix = info.suffix ?? info.title;
  setRoundInfo(state.round, suffix);
}

function triggerRivalTaunt(rival, line) {
  pushDialogue(rival, line);
}

window.addEventListener("beforeunload", () => {
  if (rushIntervalId) {
    clearInterval(rushIntervalId);
  }
});
