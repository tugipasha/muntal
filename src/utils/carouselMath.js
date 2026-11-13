export function easeOutCubic(t) {
  const clamped = Math.max(0, Math.min(1, t));
  return 1 - Math.pow(1 - clamped, 3);
}

export function easeInOutCubic(t) {
  const clamped = Math.max(0, Math.min(1, t));
  return clamped < 0.5
    ? 4 * clamped * clamped * clamped
    : 1 - Math.pow(-2 * clamped + 2, 3) / 2;
}

export function normalizeAngle(deg) {
  return (((deg % 360) + 540) % 360) - 180;
}

export function shortestStepDelta(currentStep, targetIndex, total) {
  const diff = targetIndex - (currentStep % total);
  let normDiff = ((diff % total) + total) % total;
  if (normDiff > total / 2) normDiff -= total;
  return normDiff;
}

export function computeCommitteeCardLayout(idx, angleDeg, anglePerItem, width) {
  const isMobile = width < 768;
  const isSmall = width < 420;
  const radius = isSmall ? 280 : isMobile ? 320 : 460;
  const depthRatio = isMobile ? 0.95 : 0.88;

  const baseAngle = idx * anglePerItem;
  const norm = normalizeAngle(baseAngle + angleDeg);
  const rad = (norm * Math.PI) / 180;

  const x = Math.sin(rad) * radius;
  const z = (Math.cos(rad) - 1) * radius * depthRatio;
  const rotateY = -norm * 0.72;
  const depthFactor = (Math.cos(rad) + 1) / 2;

  const scale = isMobile ? 0.72 + 0.28 * depthFactor : 0.76 + 0.24 * depthFactor;
  const opacity = 0.2 + 0.8 * Math.pow(depthFactor, 1.4);
  const zIndex = Math.round(10 + depthFactor * 80);

  const isCenter = Math.abs(norm) < 28;
  const isAdjacent = Math.abs(norm) >= 28 && Math.abs(norm) <= 85;

  return { x, z, rotateY, scale, opacity, zIndex, isCenter, isAdjacent };
}

export function computeTeamCardLayout(idx, angleDeg, anglePerItem, width) {
  const isMobile = width < 768;
  const isSmall = width < 420;
  const cardW = isSmall ? 255 : isMobile ? 290 : Math.min(340, Math.max(270, width * 0.24));
  const spacing = cardW * (isMobile ? 0.8 : 0.92);
  const radius = spacing / Math.sin((anglePerItem * Math.PI) / 180);
  const depthRatio = 0.6;

  const baseAngle = idx * anglePerItem;
  const norm = normalizeAngle(baseAngle + angleDeg);
  const rad = (norm * Math.PI) / 180;

  const x = Math.sin(rad) * radius;
  const z = (Math.cos(rad) - 1) * radius * depthRatio;
  const rotateY = -norm * 0.9;
  const dist = Math.abs(norm) / anglePerItem;

  const scale = Math.max(0.55, 1 - dist * 0.07);
  const opacity = dist > 4.5 ? 0 : Math.max(0.15, 1 - dist * 0.22);
  const zIndex = Math.round(100 - dist * 4);

  const isCenter = dist < 0.5;
  const isAdjacent = dist >= 0.5 && dist <= 3;

  return { x, z, rotateY, scale, opacity, zIndex, isCenter, isAdjacent, dist };
}
