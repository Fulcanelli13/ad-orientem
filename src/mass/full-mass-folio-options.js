/*
 * Guided Mass Folio experience choices. These do not change canonical Proper,
 * Mass precedence, optional rite legality, or the SessionEngine.
 */
export const PREPARATION_CHOICES=Object.freeze(["none","prepare"]);
export const THANKSGIVING_CHOICES=Object.freeze(["none","thanksgiving"]);
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
export function mayOpenFolioPrayer(moment,experience){
  const normalized=normalizeFolioExperience(experience);
  return (moment==="before"&&normalized.before==="prepare")
    ||(moment==="after"&&normalized.after==="thanksgiving");
}
