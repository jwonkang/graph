import {
  state,
  params,
  episodes,
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
  preloadPrologueDialogue();
}

function beginCampaign() {
  if (titleScreen) {
    titleScreen.classList.remove("active");
    setTimeout(() => titleScreen.classList.add("hidden"), 480);
  }
  if (gameScreen) {
    gameScreen.classList.remove("hidden");
  }
  advanceRound();
  updateEpisodeUI();
  clearDialogue();
  pushDialogue("Ms. Park", "Apron on. Remember: MR = MC. Anything else is latte for ‘losing money.’");
  pushDialogue("You", "Let’s brew a curve-friendly empire.");
  pushDialogue("Ms. Park", "Quality shifts demand up, ads boost brand, output sets your price on the demand curve.");
  priceTauntTriggered = false;
  computeAndRender();
  updateBuffStatus(state.perfectPourBuffActive, state.perfectPourStreak);
}

function preloadPrologueDialogue() {
  clearDialogue();
  pushDialogue("Narrator", "Marketville, dawn. Neon, steam, and way too much caffeine gossip.");
  pushDialogue("Ms. Park", "Listen up. Demand curve gives you price. MR tells you when to stop pouring. Aim MR = MC.");
  pushDialogue("You", "Got it. Start button itching already.");
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
    pushDialogue("You", `Black numbers! Profit clocked at ${formatted}.`);
    pushDialogue("Ms. Park", "Nice pour. Remember: profit today, brand tomorrow.");
    celebrateProfit();
    showToast("Profit achieved. Rent thanks you.", "success");
  } else {
    const formattedLoss = Math.abs(profit).toFixed(2);
    pushDialogue("You", `Ouch. Lost ${formattedLoss}.`);
    pushDialogue("Ms. Park", "Below ATC. Center on MR = MC and rethink ads vs quality.");
    showToast("Loss detected. Adjust those curves.", "warn");
  }

  if (state.consecutiveLosses >= 2) {
    triggerRivalTaunt("Mika", "Two down days? Need my discount punch card?");
    state.consecutiveLosses = 0;
  }

  updateBuffStatus(state.perfectPourBuffActive, state.perfectPourStreak);

  state.rushRunning = false;
  setControlsDisabled(false);
  advanceRound();
  updateEpisodeUI();
  computeAndRender();
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
  if (state.round > 0) {
    const suffix = state.episode === "episode1" ? "Grand Opening" : "Crowd Control";
    setRoundInfo(state.round, suffix);
  } else {
    setRoundInfo(0, "Prologue");
  }
}

function triggerRivalTaunt(rival, line) {
  pushDialogue(rival, line);
}

window.addEventListener("beforeunload", () => {
  if (rushIntervalId) {
    clearInterval(rushIntervalId);
  }
});
