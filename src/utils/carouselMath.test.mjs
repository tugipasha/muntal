import test from 'node:test';
import assert from 'node:assert/strict';
import {
  easeOutCubic,
  easeInOutCubic,
  normalizeAngle,
  shortestStepDelta,
  computeCommitteeCardLayout,
  computeTeamCardLayout,
} from './carouselMath.js';

test('easing bounds and monotonicity', () => {
  assert.equal(easeOutCubic(0), 0);
  assert.equal(easeOutCubic(1), 1);
  assert.ok(easeOutCubic(0.5) > 0.5);
  assert.equal(easeInOutCubic(0), 0);
  assert.equal(easeInOutCubic(1), 1);
  assert.equal(easeInOutCubic(0.5), 0.5);
});

test('normalizeAngle wraps into [-180, 180)', () => {
  assert.equal(normalizeAngle(0), 0);
  assert.equal(normalizeAngle(360), 0);
  assert.equal(normalizeAngle(270), -90);
  assert.equal(normalizeAngle(-270), 90);
});

test('shortestStepDelta picks shortest direction around ring', () => {
  assert.equal(shortestStepDelta(0, 1, 22), 1);
  assert.equal(shortestStepDelta(0, 21, 22), -1);
  assert.equal(shortestStepDelta(20, 1, 22), 3);
});

test('computeCommitteeCardLayout places active center card at front', () => {
  const layout = computeCommitteeCardLayout(2, -144, 72, 1280);
  assert.equal(layout.isCenter, true);
  assert.equal(Math.round(layout.x), 0);
  assert.equal(Math.round(layout.z), 0);
  assert.equal(layout.scale, 1);
});

test('computeTeamCardLayout hides distant back cards', () => {
  const front = computeTeamCardLayout(0, 0, 360 / 22, 1280);
  const back = computeTeamCardLayout(11, 0, 360 / 22, 1280);
  assert.equal(front.isCenter, true);
  assert.equal(front.opacity, 1);
  assert.equal(back.opacity, 0);
  assert.equal(back.isCenter, false);
});
