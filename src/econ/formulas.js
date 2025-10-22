const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export function effectiveCurveParams(params, stateSnapshot) {
  const rivalsCount = typeof stateSnapshot.rivals === "number" ? stateSnapshot.rivals : stateSnapshot.rivals?.length ?? 0;
  const aEff =
    params.a +
    params.k_q * (stateSnapshot.quality ?? 0) +
    params.k_ad * ((stateSnapshot.advertising ?? 0) / 100) +
    params.lambda * (stateSnapshot.brand ?? 0) -
    params.eta * rivalsCount +
    (stateSnapshot.demandModifier ?? 0);

  const cEff = params.c + (stateSnapshot.costModifier ?? 0);
  const dEff = params.d + params.m_q * (stateSnapshot.quality ?? 0);

  return { aEff, cEff, dEff };
}

export function demandAtQuantity(params, effectiveParams, quantity) {
  return Math.max(0, effectiveParams.aEff - params.b * quantity);
}

export function marginalRevenueAtQuantity(params, effectiveParams, quantity) {
  return Math.max(0, effectiveParams.aEff - 2 * params.b * quantity);
}

export function marginalCostAtQuantity(effectiveParams, quantity) {
  return effectiveParams.cEff + effectiveParams.dEff * quantity;
}

export function generateCurveSeries(params, effectiveParams, qMax, step) {
  const demandPoints = [];
  const mrPoints = [];
  const mcPoints = [];

  const steps = Math.floor(qMax / step);
  for (let i = 0; i <= steps; i += 1) {
    const quantity = Number((i * step).toFixed(4));
    demandPoints.push({ x: quantity, y: demandAtQuantity(params, effectiveParams, quantity) });
    mrPoints.push({ x: quantity, y: marginalRevenueAtQuantity(params, effectiveParams, quantity) });
    mcPoints.push({ x: quantity, y: marginalCostAtQuantity(effectiveParams, quantity) });
  }

  if (demandPoints[demandPoints.length - 1]?.x !== qMax) {
    demandPoints.push({ x: qMax, y: demandAtQuantity(params, effectiveParams, qMax) });
    mrPoints.push({ x: qMax, y: marginalRevenueAtQuantity(params, effectiveParams, qMax) });
    mcPoints.push({ x: qMax, y: marginalCostAtQuantity(effectiveParams, qMax) });
  }

  return { demandPoints, mrPoints, mcPoints };
}

export function computeOverlayPoint(params, effectiveParams, qMax) {
  const den = 2 * params.b + effectiveParams.dEff;
  if (den <= 0) {
    return { visible: false, q: null, p: null, den };
  }

  const qStar = (effectiveParams.aEff - effectiveParams.cEff) / den;
  const qClamped = clamp(qStar, 0, qMax);
  const pStar = demandAtQuantity(params, effectiveParams, qClamped);
  const visible = qStar >= 0 && qStar <= qMax;

  return {
    visible,
    q: visible ? qClamped : null,
    p: visible ? pStar : null,
    rawQ: qStar,
    den
  };
}

export function price(params, stateSnapshot, effectiveOverride = null) {
  const effective = effectiveOverride ?? effectiveCurveParams(params, stateSnapshot);
  const quantity = stateSnapshot.output ?? 0;
  return demandAtQuantity(params, effective, quantity);
}

export function marginalRevenue(params, stateSnapshot, effectiveOverride = null) {
  const effective = effectiveOverride ?? effectiveCurveParams(params, stateSnapshot);
  const quantity = stateSnapshot.output ?? 0;
  return marginalRevenueAtQuantity(params, effective, quantity);
}

export function marginalCost(params, stateSnapshot, effectiveOverride = null) {
  const effective = effectiveOverride ?? effectiveCurveParams(params, stateSnapshot);
  const quantity = stateSnapshot.output ?? 0;
  return marginalCostAtQuantity(effective, quantity);
}

export function averageTotalCost(params, effectiveParams, quantity) {
  if (quantity <= 0) return Infinity;
  const mcValue = marginalCostAtQuantity(effectiveParams, quantity);
  return mcValue + params.F / quantity;
}

export function economicProfit(params, effectiveParams, quantity, priceAtQuantity = null) {
  if (quantity <= 0) return 0;
  const priceValue = priceAtQuantity ?? demandAtQuantity(params, effectiveParams, quantity);
  const atcValue = averageTotalCost(params, effectiveParams, quantity);
  return (priceValue - atcValue) * quantity;
}

export function brandGain(params, advertising, multiplier = 1) {
  return params.kappa * Math.sqrt(Math.max(advertising, 0)) * multiplier;
}
