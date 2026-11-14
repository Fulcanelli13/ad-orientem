/** A light route allowlist; text and stage order remain owned by the novena corpus. */
export const CHURCH_NOVENA_IDS=Object.freeze([
  "holy_ghost","christmas","corpus_christi","sacred_heart",
  "immaculate_conception","annunciation","assumption","seven_sorrows",
  "st_joseph","holy_souls","perpetual_help","st_therese",
  "st_anthony_nine_tuesdays","christ_the_king","immaculate_heart",
  "st_michael","divine_infant_king","icksp_immaculate_conception",
  "holy_face_1887"
]);
const KNOWN=new Set(CHURCH_NOVENA_IDS);
export function resolveChurchNovenaId(route){
  if(typeof route!=="string")return null;
  const match=/^novena:([a-z0-9_]+)$/.exec(route);
  return match&&KNOWN.has(match[1])?match[1]:null;
}
