/** Explicit editor QA gate. This is not authorization to publish research. */
export const VISIBLE_MASS_REVIEW_ROUTE="learn.visible_mass";
export const VISIBLE_MASS_REVIEW_QUERY="aoVisibleMassReview";
export function visibleMassReviewEnabled(win=globalThis){
  const query=String(win?.location?.search||"");
  return /(?:^\?|&)aoVisibleMassReview=1(?:&|$)/.test(query);
}
