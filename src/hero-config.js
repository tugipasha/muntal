export const CARD_SCALE = 1.15;

/**
 * Scroll tamamlanip asagi inmeye baslamadan once arka plan kartlarinin
 * kac tam tur (360 derece) donecegini belirler.
 * 0-1 arasi ondalikli degerler dahil 0 ve uzeri her sayiyi alabilir:
 * - 0     : Beklemeden hemen asagi kaydirir
 * - 0.25  : Ceyrek tur (90°)
 * - 0.5   : Yarim tur (180°)
 * - 1.0   : 1 tam tur (360°) [varsayilan]
 * - 1.5   : 1.5 tur (540°)
 */
export const HERO_SCROLL_TURNS = 1.0;

/** Her 1.0 tam tur icin ayrilan kaydirma mesafesi (viewport yuksekligi yuzdesi). */
export const HERO_SCROLL_VH_PER_TURN = 110;

export function normalizeHeroScrollTurns(value = HERO_SCROLL_TURNS) {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : 0;
}
