let qualitySlider;
let adSlider;
let outputSlider;
let overlayToggle;
let endDayButton;
let sliderValues = {};
let metricNodes = {};
let scoreNode;
let scoreBoardNode;

export function initControls(handlers) {
  qualitySlider = document.getElementById("qualitySlider");
  adSlider = document.getElementById("adSlider");
  outputSlider = document.getElementById("outputSlider");
  overlayToggle = document.getElementById("overlay-toggle");
  endDayButton = document.getElementById("end-day");
  scoreBoardNode = document.getElementById("profit-scoreboard");
  scoreNode = document.getElementById("profit-score");

  sliderValues.quality = document.querySelector('[data-value="quality"]');
  sliderValues.advertising = document.querySelector('[data-value="advertising"]');
  sliderValues.output = document.querySelector('[data-value="output"]');

  metricNodes.price = document.querySelector('[data-metric="price"]');
  metricNodes.mr = document.querySelector('[data-metric="mr"]');
  metricNodes.mc = document.querySelector('[data-metric="mc"]');
  metricNodes.atc = document.querySelector('[data-metric="atc"]');
  metricNodes.profit = document.querySelector('[data-metric="profit"]');
  metricNodes.brand = document.querySelector('[data-metric="brand"]');
  metricNodes.cumulative = document.querySelector('[data-metric="cumulative"]');
  metricNodes.rivals = document.querySelector('[data-metric="rivals"]');

  if (qualitySlider) {
    qualitySlider.addEventListener("input", (event) => {
      sliderValues.quality.textContent = event.target.value;
      handlers.onQualityChange?.(Number(event.target.value));
    });
  }

  if (adSlider) {
    adSlider.addEventListener("input", (event) => {
      sliderValues.advertising.textContent = event.target.value;
      handlers.onAdChange?.(Number(event.target.value));
    });
  }

  if (outputSlider) {
    outputSlider.addEventListener("input", (event) => {
      sliderValues.output.textContent = event.target.value;
      handlers.onOutputChange?.(Number(event.target.value));
    });
  }

  if (overlayToggle) {
    overlayToggle.addEventListener("change", (event) => {
      handlers.onOverlayToggle?.(event.target.checked);
    });
  }

  if (endDayButton) {
    endDayButton.addEventListener("click", () => {
      handlers.onEndDay?.();
    });
  }
}

export function setSliderValues({ quality, advertising, output }) {
  if (qualitySlider) qualitySlider.value = quality;
  if (adSlider) adSlider.value = advertising;
  if (outputSlider) outputSlider.value = output;
  if (sliderValues.quality) sliderValues.quality.textContent = quality;
  if (sliderValues.advertising) sliderValues.advertising.textContent = advertising;
  if (sliderValues.output) sliderValues.output.textContent = output;
}

export function setOverlayChecked(enabled) {
  if (overlayToggle) {
    overlayToggle.checked = enabled;
  }
}

export function setControlsDisabled(disabled) {
  [qualitySlider, adSlider, outputSlider, overlayToggle, endDayButton].forEach((node) => {
    if (node) node.disabled = disabled;
  });
}

export function updateMetricsDisplay(metrics) {
  const format = (value) => (Number.isFinite(value) ? value.toFixed(2) : "—");
  if (metricNodes.price) metricNodes.price.textContent = format(metrics.price);
  if (metricNodes.mr) metricNodes.mr.textContent = format(metrics.mr);
  if (metricNodes.mc) metricNodes.mc.textContent = format(metrics.mc);
  if (metricNodes.atc) metricNodes.atc.textContent = format(metrics.atc);
  if (metricNodes.profit) metricNodes.profit.textContent = format(metrics.profit);
  if (metricNodes.brand) metricNodes.brand.textContent = metrics.brand.toFixed(1);
  if (metricNodes.cumulative) metricNodes.cumulative.textContent = metrics.cumulative.toFixed(1);
  if (metricNodes.rivals) metricNodes.rivals.textContent = String(metrics.rivals);

  const score = metrics.points ?? metrics.cumulative;
  if (scoreNode) {
    if (Number.isFinite(score)) {
      scoreNode.textContent = score.toFixed(2);
    } else {
      scoreNode.textContent = "—";
    }
  }

  if (scoreBoardNode) {
    const numericScore = Number.isFinite(score) ? score : 0;
    scoreBoardNode.classList.toggle("positive", numericScore > 0);
    scoreBoardNode.classList.toggle("negative", numericScore < 0);
  }
}
