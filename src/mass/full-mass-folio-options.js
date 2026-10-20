/*
 * Guided Mass Folio experience choices. They are session-specific and cannot
 * alter the canonical Proper, precedence, rite legality or SessionEngine.
 * "prepare"/"thanksgiving" retain the v1 D+ brief-choice wire identity.
 */
export const PREPARATION_CHOICES=Object.freeze(["none","prepare","full"]);
export const THANKSGIVING_CHOICES=Object.freeze(["none","thanksgiving","full"]);
export const FOLIO_LANGUAGES=Object.freeze(["en","fr"]);

export function normalizeFolioExperience(source={},fallbackLanguage="en"){
  const before=PREPARATION_CHOICES.includes(source.before)?source.before:"none";
  const after=THANKSGIVING_CHOICES.includes(source.after)?source.after:"none";
  const preferred=String(fallbackLanguage??"en").toLowerCase().startsWith("fr")?"fr":"en";
  const language=FOLIO_LANGUAGES.includes(source.language)?source.language:preferred;
  return Object.freeze({before,after,language});
}
export function experiencePrayerRoute(moment){
  return moment==="before"?"mass.prepare":moment==="after"?"mass.thanksgiving":null;
}
export function experiencePrayerDepth(moment,experience={}){
  const selected=normalizeFolioExperience(experience);
  const choice=moment==="before"?selected.before:moment==="after"?selected.after:"none";
  return choice==="full"?"full":choice==="none"?null:"brief";
}
export function mayOpenFolioPrayer(moment,experience){
  return experiencePrayerDepth(moment,experience)!==null;
}
