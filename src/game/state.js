export const params = {
  totalRounds: 9,
  a: 26,
  b: 2.6,
  c: 3.2,
  d: 0.45,
  k_q: 1.1,
  m_q: 0.08,
  k_ad: 6,
  lambda: 0.9,
  phi: 1.1,
  eta: 1.4,
  F: 10,
  v: 3.6,
  c_q: 0.55,
  kappa: 0.9,
  perfectPourBuff: 0.15,
  chartQMax: 24,
  chartStep: 0.5
};

export const episodes = {
  prologue: {
    title: "Prologue – The Spill",
    goal: "Soak in Ms. Park’s wisdom. MR = MC or bust."
  },
  episode1: {
    title: "Episode 1 – The Grand Opening",
    goal: "Earn your first profitable day."
  },
  episode2: {
    title: "Episode 2 – Crowd Control",
    goal: "Keep profits rolling while rivals lurk."
  }
};

export const state = {
  round: 0,
  episode: "prologue",
  brand: 0,
  quality: 5,
  advertising: 20,
  output: 8,
  rivals: ["Juno", "Mika"],
  overlayEnabled: false,
  lastPrice: null,
  cumulativeProfit: 0,
  consecutiveLosses: 0,
  perfectPourBuffActive: false,
  perfectPourStreak: 0,
  history: [],
  demandModifier: 0,
  costModifier: 0,
  rushRunning: false,
  metrics: {
    price: 0,
    mr: 0,
    mc: 0,
    atc: 0,
    profit: 0,
    overlayQ: null,
    overlayP: null,
    overlayVisible: false,
    baseNumerator: null
  }
};

export function resetForNewGame() {
  state.round = 0;
  state.episode = "prologue";
  state.brand = 0;
  state.quality = 5;
  state.advertising = 20;
  state.output = 8;
  state.rivals = ["Juno", "Mika"];
  state.overlayEnabled = false;
  state.lastPrice = null;
  state.cumulativeProfit = 0;
  state.consecutiveLosses = 0;
  state.perfectPourBuffActive = false;
  state.perfectPourStreak = 0;
  state.history = [];
  state.demandModifier = 0;
  state.costModifier = 0;
  state.rushRunning = false;
  state.metrics = {
    price: 0,
    mr: 0,
    mc: 0,
    atc: 0,
    profit: 0,
    overlayQ: null,
    overlayP: null,
    overlayVisible: false,
    baseNumerator: null
  };
}

export function advanceRound() {
  state.round += 1;
  if (state.round <= 0) {
    state.episode = "prologue";
    return;
  }
  if (state.round === 1) {
    state.episode = "episode1";
  } else if (state.round >= 4) {
    state.episode = "episode2";
  }
}

export function rivalsCount() {
  return state.rivals.length;
}

export function recordHistory(entry) {
  state.history.push(entry);
}

export function hasRival(name) {
  return state.rivals.includes(name);
}
