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
    title: "Prologue - The Spill",
    goal: "Soak in Ms. Park's wisdom. MR = MC or bust.",
    suffix: "Prologue"
  },
  episode1: {
    title: "Episode 1 - Grand Opening",
    goal: "Earn your first profitable day.",
    suffix: "Grand Opening"
  },
  episode2: {
    title: "Episode 2 - Crowd Control",
    goal: "Keep profits rolling while rivals lurk.",
    suffix: "Crowd Control"
  },
  episode3: {
    title: "Episode 3 - Market Mastery",
    goal: "Scale output efficiently while defending brand lead.",
    suffix: "Market Mastery"
  }
};

export const roundConcepts = {
  0: [
    { speaker: "Narrator", line: "Marketville, dawn. Neon, steam, and way too much caffeine gossip." },
    {
      speaker: "Ms. Park",
      line: "Before we open, remember: the demand curve maps quantity to price. You choose quantity; the market sets price."
    },
    {
      speaker: "Ms. Park",
      line: "Goal for every day: push output until marginal revenue meets marginal cost. That junction is profit maximization."
    },
    { speaker: "You", line: "Locked in. Ready to test theory against the morning rush." }
  ],
  1: [
    {
      speaker: "Ms. Park",
      line: "Day 1 concept: trace demand. More cups means sliding down the curve to lower prices - because consumers need incentive."
    },
    {
      speaker: "Ms. Park",
      line: "Marginal revenue drops twice as fast as demand. Stop pouring the second MR = MC or you start eroding profit."
    },
    { speaker: "You", line: "Baseline brews coming up. I'll watch MR and MC like a hawk." }
  ],
  2: [
    {
      speaker: "Ms. Park",
      line: "Quality shifts demand outward. Better flavor lets you serve the same cups at higher prices."
    },
    {
      speaker: "Ms. Park",
      line: "That shift raises both price and marginal revenue at a given output. Use it when MC is climbing too fast."
    },
    { speaker: "You", line: "So a premium roast buys pricing power. Noted." }
  ],
  3: [
    {
      speaker: "Ms. Park",
      line: "Advertising boosts brand, and brand cushions the demand curve for future days."
    },
    {
      speaker: "Ms. Park",
      line: "Think dynamic: ads cost today but cut future elasticity. Treat it like an investment in tomorrow's MR."
    },
    { speaker: "You", line: "Alright - airwaves now, smoother margins later." }
  ],
  4: [
    {
      speaker: "Ms. Park",
      line: "Keep one eye on average total cost. If price dips below ATC you're eating losses despite covering MC."
    },
    {
      speaker: "Ms. Park",
      line: "Use output to balance: too much volume pushes MC above MR; too little wastes fixed cost across cups."
    },
    { speaker: "You", line: "Balancing ATC and MR/MC - tightrope mode engaged." }
  ],
  5: [
    {
      speaker: "Ms. Park",
      line: "Perfect Pour streaks reduce cost pressure. A lower MC curve means the MR = MC intersection moves right."
    },
    {
      speaker: "Ms. Park",
      line: "Guard the buff. Consistent quality lowers marginal cost just like process innovation in a factory."
    },
    { speaker: "You", line: "I'll keep the pours clean and ride the lower MC." }
  ],
  6: [
    {
      speaker: "Ms. Park",
      line: "Check elasticity. When you move output, notice how sharply price responds - that guides whether ads or quality add more."
    },
    {
      speaker: "Ms. Park",
      line: "In elastic regions, small quantity changes swing revenue. Lean on brand to flatten that slope."
    },
    { speaker: "You", line: "Elastic zones marked. I'll use brand to steady price drops." }
  ],
  7: [
    {
      speaker: "Ms. Park",
      line: "Cumulative profit funds expansion. Think in episodes: early days build brand so late days harvest surplus."
    },
    {
      speaker: "Ms. Park",
      line: "Revisit prior data. History shows what outputs kept MR close to MC - repeat what works."
    },
    { speaker: "You", line: "I'll mine the log and double down on the sweet spots." }
  ],
  8: [
    {
      speaker: "Ms. Park",
      line: "Rivals respond to your price. If they crowd you, sharpen differentiation with quality or brand defenses."
    },
    {
      speaker: "Ms. Park",
      line: "Strategic lesson: don't start price wars. Use non-price levers to keep demand high without killing margin."
    },
    { speaker: "You", line: "No race to the bottom - flavor and hype instead." }
  ],
  9: [
    {
      speaker: "Ms. Park",
      line: "Final stretch. Long-run survival means price must beat ATC while MR matches MC."
    },
    {
      speaker: "Ms. Park",
      line: "If MR < MC at your current output, trim production; if MR > MC, add cups until balance returns."
    },
    { speaker: "You", line: "One last optimization pass. Let's lock in efficient output." }
  ],
  default: [
    {
      speaker: "Ms. Park",
      line: "Stay disciplined: ride the MR = MC rule, watch ATC, and spend on brand when demand softens."
    },
    { speaker: "You", line: "Copy that. Keeping the strategy tight." }
  ]
};

export const episodeConcepts = {
  prologue: [
    {
      speaker: "Narrator",
      line: "Welcome to Marketville's caffeine district. Soak up the fundamentals before doors open."
    },
    {
      speaker: "Ms. Park",
      line: "We will frame demand, marginal revenue, and costs so you can identify MR = MC on sight."
    }
  ],
  episode1: [
    {
      speaker: "Ms. Park",
      line: "Episode 1 focus: convert theory into the first three profitable runs."
    },
    {
      speaker: "Ms. Park",
      line: "Adjust quality, advertising, and output carefully to pin MR and MC together."
    }
  ],
  episode2: [
    {
      speaker: "Ms. Park",
      line: "Episode 2 shifts to crowd control. Brand strength shapes your pricing power as rushes swell."
    },
    {
      speaker: "Ms. Park",
      line: "Use advertising and perfect pours to keep marginal revenue from collapsing."
    }
  ],
  episode3: [
    {
      speaker: "Ms. Park",
      line: "Episode 3 is the mastery lap. Rivals react, so efficiency and differentiation must align."
    },
    {
      speaker: "Ms. Park",
      line: "Balance marginal cost against demand pressure and lock price above average total cost."
    }
  ]
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
  dialogueCycle: {
    profit: 0,
    loss: 0
  },
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
  state.dialogueCycle = {
    profit: 0,
    loss: 0
  };
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
  const previousEpisode = state.episode;
  state.round += 1;

  if (state.round <= 0) {
    state.episode = "prologue";
  } else {
    const episodeOrder = ["episode1", "episode2", "episode3"];
    const index = Math.floor((state.round - 1) / 3);
    state.episode = episodeOrder[Math.min(index, episodeOrder.length - 1)] ?? episodeOrder[episodeOrder.length - 1];
  }

  const episodeChanged = previousEpisode !== state.episode;
  return {
    previousEpisode,
    currentEpisode: state.episode,
    episodeChanged
  };
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
