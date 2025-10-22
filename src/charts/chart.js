const { Chart } = window;
const registerables = Chart?.registerables ?? [];
Chart.register(...registerables);
if (window.ChartAnnotation) {
  Chart.register(window.ChartAnnotation);
}

let curveChart;

export function initCurveChart(canvas) {
  curveChart = new Chart(canvas, {
    type: "line",
    data: {
      datasets: [
        {
          label: "Demand",
          data: [],
          borderColor: "#2a9d8f",
          borderWidth: 3,
          tension: 0,
          pointRadius: 0
        },
        {
          label: "Marginal Revenue",
          data: [],
          borderColor: "#6c5ce7",
          borderWidth: 2.5,
          tension: 0,
          pointRadius: 0,
          borderDash: [6, 4]
        },
        {
          label: "Marginal Cost",
          data: [],
          borderColor: "#e0a458",
          borderWidth: 2.5,
          tension: 0,
          pointRadius: 0
        },
        {
          label: "Current Output",
          data: [],
          type: "scatter",
          backgroundColor: "#d62828",
          borderColor: "#d62828",
          pointRadius: 5,
          pointHoverRadius: 7
        },
        {
          id: "overlay-line",
          label: "MR = MC Overlay",
          data: [],
          borderColor: "rgba(214, 41, 41, 0.85)",
          borderWidth: 2,
          borderDash: [6, 4],
          pointRadius: 0,
          hidden: true
        },
        {
          id: "overlay-point",
          label: "MR = MC Point",
          data: [],
          type: "scatter",
          backgroundColor: "rgba(214, 41, 41, 0.95)",
          borderColor: "rgba(214, 41, 41, 0.95)",
          pointRadius: 6,
          pointHoverRadius: 8,
          hidden: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      scales: {
        x: {
          type: "linear",
          beginAtZero: true,
          ticks: { color: "#5e3023" },
          grid: {
            color: "rgba(94,48,35,0.1)"
          },
          title: {
            display: true,
            text: "Output (Q)",
            color: "#5e3023",
            font: { weight: "bold" }
          }
        },
        y: {
          beginAtZero: true,
          ticks: { color: "#5e3023" },
          grid: {
            color: "rgba(94,48,35,0.1)"
          },
          title: {
            display: true,
            text: "Price / Cost",
            color: "#5e3023",
            font: { weight: "bold" }
          }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: "bottom",
          labels: {
            color: "#5e3023",
            usePointStyle: true
          }
        },
        annotation: {
          annotations: {}
        }
      }
    }
  });
}

export function updateCurveChart(payload) {
  if (!curveChart) return;
  const { demandPoints, mrPoints, mcPoints, currentPoint, overlay, overlayEnabled } = payload;

  curveChart.data.datasets[0].data = demandPoints ?? [];
  curveChart.data.datasets[1].data = mrPoints ?? [];
  curveChart.data.datasets[2].data = mcPoints ?? [];
  curveChart.data.datasets[3].data = currentPoint ? [currentPoint] : [];

  const yValues = [];
  (demandPoints ?? []).forEach((point) => yValues.push(point.y ?? 0));
  (mrPoints ?? []).forEach((point) => yValues.push(point.y ?? 0));
  (mcPoints ?? []).forEach((point) => yValues.push(point.y ?? 0));
  if (currentPoint?.y !== undefined) yValues.push(currentPoint.y);

  const lastDemandX = demandPoints?.[demandPoints.length - 1]?.x;
  if (Number.isFinite(lastDemandX)) {
    curveChart.options.scales.x.suggestedMax = lastDemandX;
  }

  const overlayLine = curveChart.data.datasets.find((dataset) => dataset.id === "overlay-line");
  const overlayPoint = curveChart.data.datasets.find((dataset) => dataset.id === "overlay-point");
  const showOverlay = overlayEnabled && overlay?.visible && Number.isFinite(overlay.q) && Number.isFinite(overlay.p);

  if (overlayLine && overlayPoint) {
    if (showOverlay) {
      if (overlay?.p !== undefined && overlay.p !== null) yValues.push(overlay.p);
      const maxY = yValues.length ? Math.max(...yValues) : 0;
      const yPeak = maxY > 0 ? maxY * 1.05 : 10;

      overlayLine.data = [
        { x: overlay.q, y: 0 },
        { x: overlay.q, y: yPeak }
      ];
      overlayLine.hidden = false;

      overlayPoint.data = [{ x: overlay.q, y: overlay.p }];
      overlayPoint.hidden = false;

      curveChart.options.scales.y.suggestedMax = yPeak;
    } else {
      overlayLine.data = [];
      overlayLine.hidden = true;
      overlayPoint.data = [];
      overlayPoint.hidden = true;
    }
  }

  const maxY = yValues.length ? Math.max(...yValues) : 0;
  const suggestedMax = maxY > 0 ? maxY * 1.05 : 10;
  curveChart.options.scales.y.suggestedMax = suggestedMax;

  curveChart.update();
}
