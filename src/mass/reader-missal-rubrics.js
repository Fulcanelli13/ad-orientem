/**
 * Missal-only directions from the already PUBLISHED 1962 Ritus servandus
 * registry. One source cue -> one inline book annotation, NEVER a live
 * observation or a change to the ritual text/card/clock.
 *
 * The 19 Canon entries reuse the existing strict published Canon allowlist.
 * The other 33 entries are individually approved in the frozen R17 registry.
 * New Ritus XII.1 bowed-hands detail is a separate, fully source-identified,
 * exact-cue display addendum. It never alters the frozen 57-event art crosswalk
 * nor manufactures an observed priest/Schola action clock.
 */
import {publishedCanonRubricsForParagraph} from "./reader-canon-published-rubrics.js";

export const MISSAL_RUBRIC_OWNER="PUBLISHED_R17_MISSAL_INLINE";
const NONCANON_APPROVED=new Set([
 "AO.RUB.C0010.01","AO.RUB.C0058.01","AO.RUB.C0061.01",
 "AO.RUB.C0064.01","AO.RUB.C0067.01","AO.RUB.C0068.01",
 "AO.RUB.C0072.01","AO.RUB.C0079.01","AO.RUB.C0093.01",
 "AO.RUB.C0101.01","AO.RUB.C0104.01","AO.RUB.C0111.01",
 "AO.RUB.C0111.02","AO.RUB.C0111.03","AO.RUB.C0115.01",
 "AO.RUB.C0115.02","AO.RUB.C0115.03","AO.RUB.C0117.01",
 "AO.RUB.C0117.02","AO.RUB.C0119.01","AO.RUB.C0126.01",
 "AO.RUB.C0208.01","AO.RUB.C0219.01","AO.RUB.C0228.01",
 "AO.RUB.C0232.01","AO.RUB.C0232.02","AO.RUB.C0234.01",
 "AO.RUB.C0234.02","AO.RUB.C0262.01","AO.RUB.C0262.02",
 "AO.RUB.C0263.01","AO.RUB.C0263.02","AO.RUB.C0263.03",
]);
// A single published priest label can include an action belonging to the
// deacon in Solemn Mass. Fail closed rather than misassign the priest's role.
const SOLEMN_MIXED_ROLE=new Set(["AO.RUB.C0115.03"]);
const ACTIONS=Object.freeze({
 "BLESSES OFFERINGS":["The priest blesses the offerings.","Le prêtre bénit les offrandes."],
 "BOWS HEAD":["The priest inclines his head.","Le prêtre incline la tête."],
 "BOWS HEAD TO CROSS":["The priest inclines his head towards the cross.","Le prêtre incline la tête vers la croix."],
 "COVERS CHALICE":["The priest covers the chalice.","Le prêtre recouvre le calice."],
 "CROSSES WITH CHALICE":["The priest traces a sign of the Cross with the chalice.","Le prêtre trace un signe de croix avec le calice."],
 "CROSSES WITH PATEN":["The priest traces a sign of the Cross with the paten.","Le prêtre trace un signe de croix avec la patène."],
 "ELEVATES CHALICE":["The priest elevates the chalice.","Le prêtre élève le calice."],
 "ELEVATES HOST":["The priest elevates the Sacred Host.","Le prêtre élève la sainte Hostie."],
 "GENUFLECTS":["The priest genuflects.","Le prêtre fait la génuflexion."],
 "HANDS OVER OBLATIONS":["The priest extends his hands over the offerings.","Le prêtre étend les mains sur les offrandes."],
 "JOINS HANDS":["The priest joins his hands.","Le prêtre joint les mains."],
 "KISSES ALTAR":["The priest kisses the altar.","Le prêtre baise l’autel."],
 "PLACES CHALICE":["The priest places the chalice on the altar.","Le prêtre pose le calice sur l’autel."],
 "PLACES HOST":["The priest places the Host on the corporal.","Le prêtre dépose l’Hostie sur le corporal."],
 "PROFOUND BOW":["The priest bows profoundly.","Le prêtre s’incline profondément."],
 "RAISES EYES":["The priest raises his eyes.","Le prêtre élève les yeux."],
 "RAISES EYES AND HANDS":["The priest raises his eyes and hands.","Le prêtre élève les yeux et les mains."],
 "RECEIVES CHALICE":["The priest receives the Precious Blood.","Le prêtre communie au Précieux Sang."],
 "RECEIVES HOST":["The priest receives the Sacred Host.","Le prêtre communie à la sainte Hostie."],
 "REMEMBERS THE DEAD":["The priest silently commemorates the dead.","Le prêtre fait silencieusement mémoire des défunts."],
 "REMEMBERS THE LIVING":["The priest silently commemorates the living.","Le prêtre fait silencieusement mémoire des vivants."],
 "REPLACES AND COVERS CHALICE":["The priest replaces and covers the chalice.","Le prêtre repose et recouvre le calice."],
 "REPLACES HOST":["The priest replaces the Sacred Host.","Le prêtre repose la sainte Hostie."],
 "RISES FACING ALTAR":["The priest stands facing the altar.","Le prêtre se tient debout face à l’autel."],
 "SETS PATEN ASIDE":["The priest sets the paten aside.","Le prêtre met la patène de côté."],
 "SIGNS HIMSELF":["The priest makes the sign of the Cross.","Le prêtre fait sur lui le signe de croix."],
 "SIGNS WITH CHALICE":["The priest makes a sign of the Cross with the chalice.","Le prêtre trace un signe de croix avec le calice."],
 "SIGNS WITH HOST":["The priest makes a sign of the Cross with the Host.","Le prêtre trace un signe de croix avec l’Hostie."],
 "TAKES SACRED HOST":["The priest takes the Sacred Host.","Le prêtre prend la sainte Hostie."],
 "THREE CROSSES":["The priest traces three signs of the Cross.","Le prêtre trace trois signes de croix."],
 "THREE CROSSES WITH HOST OVER CHALICE":["The priest traces three crosses with the Host over the chalice.","Le prêtre trace trois croix avec l’Hostie au-dessus du calice."],
 "THREE CROSSES WITH PARTICLE":["The priest traces three signs of the Cross with the sacred Particle.","Le prêtre trace trois signes de croix avec la parcelle de l’Hostie."],
 "TWO CROSSES WITH HOST":["The priest traces two crosses with the Host.","Le prêtre trace deux croix avec l’Hostie."],
});
// Two ALREADY CERTIFIED, source-backed lasting priest states intentionally
// excluded from the 52 immediate-action counter. MISSAL explanation only:
// positioning the page NEVER starts or ends the real action in LIVE mode.
// Ritus servandus VIII.5 and X.5; original MR62_RITUS provenance is reused.
const APPROVED_MISSAL_PRIEST_STATES=Object.freeze({
 "AO.RUB.C0174.06":Object.freeze({
  label:"THUMB AND INDEX FINGERS REMAIN JOINED",key:"THUMB_INDEX_JOINED",value:true,
  en:"After replacing the elevated Host, the priest keeps each thumb and forefinger joined, except when handling the consecrated Host, until the purification of his fingers after Communion.",
  fr:"Après avoir reposé l’Hostie élevée, le prêtre garde le pouce et l’index de chaque main joints, sauf lorsqu’il touche l’Hostie consacrée, jusqu’à l’ablution des doigts après la communion.",
 }),
 "AO.RUB.C0248.01":Object.freeze({
  label:"THUMB AND INDEX FINGER DISCIPLINE ENDS",key:"THUMB_INDEX_JOINED",value:false,
  en:"With the purification of his fingers after Communion, the priest ceases to keep each thumb and forefinger joined.",
  fr:"Après l’ablution des doigts qui suit la communion, le prêtre cesse de tenir joints le pouce et l’index de chaque main.",
 }),
});
const FORM=new Set(["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
const validCue=id=>/^AO\.SM\.C\d{4}$/.test(String(id??""));
const frozen=Object.freeze;
const isCanon=id=>Number(id.slice(-4))>=150&&Number(id.slice(-4))<=207;

// Explicit source certification outside the 57 frozen rubric/icon master.
// C0261 already contains the complete silent prayer. The 1962 Ritus XII.1
// directs the priest's posture for that prayer; it does NOT create a new
// visible prayer card or constitute evidence of a live timed observation.
// Source: https://archive.ccwatershed.org/pdfs/5276-ritus-servandus-translated-english/download/#page=22
// Witness: https://icrspfrance.fr/textes-liturgiques.php?article=a0003_ancien
export const RITUS_1962_PLACEAT_ADDENDUM=Object.freeze({
  id:"MR62.ADD.C0261.01",
  cueId:"AO.SM.C0261",
  actor:"PRIEST",
  kind:"GESTURE",
  sourceSection:"Ritus servandus XII.1",
  triggerLat:"Placeat tibi, sancta Trinitas",
  en:"The priest bows his head over the altar, with his joined hands resting upon it, and says this prayer silently.",
  fr:"Le prêtre incline la tête devant l’autel, les mains jointes posées sur celui-ci, et récite cette prière à voix basse.",
  owner:"MR62_1962_MISSAL_ADDITIONS",
  review:"NEW_1962_RITUS_SOURCE_CERTIFIED_ADDENDUM",
});

/**
 * Reuses original Canon publication authority and the explicit outside-Canon
 * list. A citation URL is reused, not copied from unapproved French research.
 */
export function publishedMissalRubricsForParagraph(paragraph,registry,{
 form="MISSA_CANTATA_SIMPLE",language="en",
}={}){
 if(registry?.schema!=="ao-reader-rubric-events-v1" ||
    registry.status!=="SOURCE_BACKED_OVERLAY" ||
    registry.authority!=="PRESENTATION_RUBRIC_DETAIL_ONLY" ||
    !Array.isArray(registry.items) ||
    !Array.isArray(registry.sources) ||
    !FORM.has(String(form).toUpperCase()))
   return frozen([]);
 const source=registry.sources.find(x=>x.id==="MR62_RITUS"&&
   x.role==="NORMATIVE_PRIMARY"&&typeof x.url==="string"&&
   /^https:\/\//.test(x.url));
 if(!source)return frozen([]);
 const ids=[...new Set((paragraph?.sourceCueIds??[]).filter(validCue))];
 const isFrench=String(language).toLowerCase().startsWith("fr");
 const candidates=[];
 const canon=publishedCanonRubricsForParagraph(paragraph,registry,{form});
 candidates.push(...canon.rubrics.map(x=>({id:x.id,cueId:x.sourceCueId,order:x.order,
   label:x.shortAction,triggerLat:x.latinTrigger,sourceUrl:x.sourceUrl})));
 for(const cueId of ids.filter(id=>!isCanon(id))){
  const rows=registry.items.filter(x=>x.cueId===cueId &&
    NONCANON_APPROVED.has(x.id) && x.id.startsWith("AO.RUB."+cueId.slice(-5)+".") &&
    x.actor==="PRIEST"&&x.kind!=="STATE"&&x.kind!=="BELL" &&
    x.authorityClass==="1962_NORMATIVE" &&
    x.sources?.includes("MR62_RITUS") && Number.isInteger(x.order) &&
    typeof x.label==="string" && ACTIONS[x.label] &&
    !(String(form).toUpperCase()==="SOLEMN"&&SOLEMN_MIXED_ROLE.has(x.id)));
  candidates.push(...rows.map(x=>({id:x.id,cueId,order:x.order,
    label:x.label,triggerLat:x.triggerLat??null,sourceUrl:source.url})));
 }
 // Persistent post-Consecration finger discipline is *not* a new gesture
 // clock. Attach source-approved facts only to their original visible cues.
 for(const cueId of ids){
  const rows=registry.items.filter(x=>x.cueId===cueId&&
   Object.hasOwn(APPROVED_MISSAL_PRIEST_STATES,x.id)&&
   x.actor==="PRIEST"&&x.kind==="STATE"&&x.displayPrimary===false&&
   x.authorityClass==="1962_NORMATIVE"&&x.sources?.includes("MR62_RITUS")&&
   Number.isInteger(x.order)&&
   x.label===APPROVED_MISSAL_PRIEST_STATES[x.id].label&&
   x.stateKey===APPROVED_MISSAL_PRIEST_STATES[x.id].key&&
   x.stateValue===APPROVED_MISSAL_PRIEST_STATES[x.id].value);
  candidates.push(...rows.map(x=>({id:x.id,cueId,order:x.order,
   label:x.label,sourceUrl:source.url,kind:"STATE"})));
 }
 const positioned=new Map(ids.map((id,i)=>[id,i]));
 const original=frozen(candidates.sort((a,b)=>
     positioned.get(a.cueId)-positioned.get(b.cueId)||a.order-b.order)
   .filter(x=>ACTIONS[x.label] || (x.kind==="STATE"&&APPROVED_MISSAL_PRIEST_STATES[x.id]))
   .map(x=>frozen({
     id:x.id,sourceCueId:x.cueId,actor:"PRIEST",
     shortAction:x.label,displayText:x.kind==="STATE" ? APPROVED_MISSAL_PRIEST_STATES[x.id][isFrench?"fr":"en"] : ACTIONS[x.label][isFrench?1:0],
     kind:x.kind??"ACTION",
     latinTrigger:x.triggerLat??null,order:x.order,
     sourceId:"MR62_RITUS",
     sourceUrl:x.sourceUrl??source.url,review:"EXISTING_PUBLISHED_R17_1962_RUBRIC",
     observedNow:false,owner:MISSAL_RUBRIC_OWNER,
   })));
 // Never use a text match or external preference to activate this direction.
 // Preserve the original published registry and its 414-row icon crosswalk.
 const placeat=RITUS_1962_PLACEAT_ADDENDUM;
 const addendumAllowed=ids.includes(placeat.cueId) &&
   !registry.items.some(x=>x.cueId===placeat.cueId && x.actor==="PRIEST") &&
   !original.some(x=>x.sourceCueId===placeat.cueId);
 if(!addendumAllowed)return original;
 const added=frozen({
   id:placeat.id,sourceCueId:placeat.cueId,actor:placeat.actor,
   shortAction:"BOWS AT ALTAR WITH JOINED HANDS",
   displayText:placeat[isFrench?"fr":"en"],
   kind:placeat.kind,latinTrigger:placeat.triggerLat,order:1,
   sourceId:"MR62_RITUS",sourceUrl:source.url,
   review:placeat.review,observedNow:false,owner:placeat.owner,
 });
 return frozen([...original,added].sort((a,b)=>
   positioned.get(a.sourceCueId)-positioned.get(b.sourceCueId)||
   a.order-b.order));
}

export function withPublishedMissalParagraphRubrics(paragraphs,registry,options={}){
 if(!Array.isArray(paragraphs))return frozen([]);
 return frozen(paragraphs.map(p=>{
   const rows=publishedMissalRubricsForParagraph(p,registry,options);
   return rows.length?frozen({...p,publishedMissalRubrics:rows}):p;
 }));
}
