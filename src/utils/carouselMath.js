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

const TEAM_ARC_STEP_DEG = 360 / 22;

export function computeCommitteeCardLayout(idx, angleDeg, anglePerItem, width) {
  const isMobile = width < 768;
  const isSmall = width < 420;
  const cardW = isSmall ? 255 : isMobile ? 290 : Math.min(340, Math.max(270, width * 0.24));
  const spacing = cardW * (isMobile ? 0.8 : 0.92);
  const visualStepRad = (TEAM_ARC_STEP_DEG * Math.PI) / 180;
  const radius = spacing / Math.sin(visualStepRad);
  const depthRatio = 0.6;

  const baseAngle = idx * anglePerItem;
  const norm = normalizeAngle(baseAngle + angleDeg);
  const signedDist = norm / anglePerItem;
  const dist = Math.abs(signedDist);

  const visualNorm = signedDist * TEAM_ARC_STEP_DEG;
  const visualRad = (visualNorm * Math.PI) / 180;

  const x = Math.sin(visualRad) * radius;
  const z = (Math.cos(visualRad) - 1) * radius * depthRatio;
  const rotateY = -visualNorm * 0.9;

  const scale = Math.max(0.55, 1 - dist * 0.07);
  const baseOpacity = Math.max(0.15, 1 - dist * 0.22);
  const edgeFade = dist <= 2 ? 1 : Math.max(0, 1 - (dist - 2) / 0.42);
  const opacity = baseOpacity * edgeFade;
  const zIndex = Math.round(100 - dist * 4);

  const isCenter = dist < 0.5;
  const isAdjacent = dist >= 0.5 && dist <= 2.2;

  return { x, z, rotateY, scale, opacity, zIndex, isCenter, isAdjacent, dist };
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
