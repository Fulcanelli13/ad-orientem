// One resolved-Mass Requiem predicate for Low and Sung ceremonial projections.
// Do not infer the rite from a date or reader scroll. Unknown selections remain
// ordinary only where an ordinary form has actually been selected.
export function isExplicitRequiemMass(prepared,conditions=null){
  const resolved=prepared?.session?.resolvedMass??{};
  const plan=prepared?.session?.plan??{};
  if(resolved?.provenance?.isRequiem===true || resolved?.isRequiem===true)return true;
  const token=x=>String(typeof x==="string"?x:x?.id??x?.type??"").trim().toUpperCase();
  const arr=x=>Array.isArray(x)?x:[];
  if(["REQUIEM","MASS_FOR_THE_DEAD"].includes(token(resolved?.actualCelebration?.type)))return true;
  if(["REQUIEM","MASS_FOR_THE_DEAD"].includes(token(resolved?.actualCelebration?.kind)))return true;
  return [
    ...arr(resolved.overlays),
    ...arr(resolved.conditions),
    ...arr(resolved?.provenance?.conditions),
    ...arr(plan.overlayGraphs),
    ...arr(conditions instanceof Set?[...conditions]:conditions)
  ].some(x=>["REQUIEM","MASS_FOR_THE_DEAD"].includes(token(x)));
}

// Ritus servandus X.4 / XIII.1: at a Mass for the dead the celebrant does
// not strike his breast at the three Agnus Dei invocations. Do not project
// optional faithful strike prompts from the ordinary rite either.
// This filters actions only: prayer, priest voice and posture stay independent.
export function isRequiemAgnusBreastStrikeOmitted(cueId,prepared,conditions=null){
  return /^AO\.SM\.C022[234]$/.test(String(cueId??"")) && isExplicitRequiemMass(prepared,conditions);
}

// Ritus servandus XIII.1: this is a FORM-SELECTED TEXT substitution in the
// existing Ordinary cue IDs, NOT another Proper or reader corpus.
// https://www.intratext.com/IXT/LAT0820/_PO.HTM
// Source-owned Requiem text does not imply observed physical action.
const REQUIEM_AGNUS=Object.freeze(Object.fromEntries([
  ["AO.SM.C0222","dona eis réquiem.","grant them rest.","donnez-leur le repos."],
  ["AO.SM.C0223","dona eis réquiem.","grant them rest.","donnez-leur le repos."],
  ["AO.SM.C0224","dona eis réquiem sempitérnam.","grant them eternal rest.","donnez-leur le repos éternel."],
].map(([cueId,latinEnding,englishEnding,frenchEnding])=>[cueId,Object.freeze({
  lat:"Agnus Dei, qui tollis peccáta mundi: "+latinEnding,
  en:"Lamb of God, who takest away the sins of the world: "+englishEnding,
  fr:"Agneau de Dieu, qui enlevez les péchés du monde : "+frenchEnding,
})])));
export function requiemAgnusVariantsForResolvedMass(resolvedMass){
  if(!isExplicitRequiemMass({session:{resolvedMass}}))return null;
  return REQUIEM_AGNUS;
}

// In the 1962 Requiem the FIRST pre-Communion peace prayer is omitted,
// but the two following priest-Communion prayers remain. Exact canonical
// cue ownership must be preserved for LIVE / SIMPLE / MISSAL navigation.
// Ritus servandus X.4; XIII.1: https://www.intratext.com/IXT/LAT0820/_PO.HTM
const OMITTED_REQUIEM_ORDINARY_CUES=Object.freeze(["AO.SM.C0225"]);
export function requiemOmittedOrdinaryCuesForResolvedMass(resolvedMass){
  return isExplicitRequiemMass({session:{resolvedMass}})?OMITTED_REQUIEM_ORDINARY_CUES:Object.freeze([]);
}
export function isRequiemFirstPeacePrayerOmitted(cueId,prepared,conditions=null){
  return String(cueId??"")==="AO.SM.C0225"&&isExplicitRequiemMass(prepared,conditions);
}
