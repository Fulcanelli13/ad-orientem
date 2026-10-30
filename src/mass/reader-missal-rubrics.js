/**
 * Missal-only directions from the already PUBLISHED 1962 Ritus servandus
 * registry. One source cue -> one inline book annotation, NEVER a live
 * observation or a change to the ritual text/card/clock.
 *
 * The 19 Canon entries reuse the existing strict published Canon allowlist.
 * The other 33 entries are also individually approved in the shipped R17
 * registry; no new "1962_NORMATIVE" row is automatically promoted.
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
 "ELEVATES HOST AND CHALICE SLIGHTLY":["The priest raises the chalice slightly with the Sacred Host held above it, at omnis honor et gloria.","Le prêtre élève légèrement le calice avec la sainte Hostie tenue au-dessus, à omnis honor et gloria."],
 "GENUFLECTS":["The priest genuflects.","Le prêtre fait la génuflexion."],
 // Ritus servandus VIII.4: both palms open towards and above the Host
 // and chalice until Per Christum Dominum nostrum, then hands joined.
 "HANDS OVER OBLATIONS":["The priest extends both hands with open palms facing the Host and chalice, holds them over the offerings until Per Christum Dominum nostrum, then joins his hands.","Le prêtre étend les deux mains, les paumes ouvertes tournées vers l’Hostie et le calice, et les tient au-dessus des oblats jusqu’à Per Christum Dominum nostrum ; il joint alors les mains."],
 "JOINS HANDS":["The priest joins his hands.","Le prêtre joint les mains."],
 "KISSES ALTAR":["The priest kisses the altar.","Le prêtre baise l’autel."],
 "PLACES CHALICE":["The priest places the chalice on the altar.","Le prêtre pose le calice sur l’autel."],
 "PLACES HOST":["The priest places the Host on the corporal.","Le prêtre dépose l’Hostie sur le corporal."],
 "PROFOUND BOW":["The priest bows profoundly.","Le prêtre s’incline profondément."],
 // Ritus servandus VIII.4: eye-raising is brief and immediately followed
 // by lowering the gaze; do not turn it into a prolonged elevation pose.
 "RAISES EYES":["The priest raises his eyes to heaven and immediately lowers them while holding the Host, at et elevatis oculis in caelum.","Le prêtre élève les yeux au ciel et les abaisse aussitôt en tenant l’Hostie, à et elevatis oculis in caelum."],
 "RAISES EYES AND HANDS":["The priest raises his eyes and hands.","Le prêtre élève les yeux et les mains."],
 "RECEIVES CHALICE":["The priest receives the Precious Blood.","Le prêtre communie au Précieux Sang."],
 "RECEIVES HOST":["The priest receives the Sacred Host.","Le prêtre communie à la sainte Hostie."],
 "REMEMBERS THE DEAD":["The priest extends and joins his hands before his breast, then raises them towards his face; with his eyes fixed upon the Blessed Sacrament, he commemorates the dead, then extends his hands.","Le prêtre étend et joint les mains devant la poitrine, puis les élève vers le visage ; les yeux fixés sur le Saint-Sacrement, il fait mémoire des défunts, puis étend les mains."],
 "REMEMBERS THE LIVING":["The priest raises and joins his hands towards his face or breast, pauses with head slightly bowed to commemorate the living, then extends his hands.","Le prêtre élève et joint les mains vers le visage ou la poitrine ; la tête légèrement inclinée, il fait mémoire des vivants, puis étend les mains."],
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
// One already-canonical 1962 action lacks an accurate pictogram and a
// published R17 event. Reuse its immutable gesture-matrix ID as *text only*;
// never invent a rubric-event identity or count it among the 52 R17 actions.
// Exact existing VIII.6 server-bell source rows. These are printed ceremonial
// directions, NOT signals that the server rang a bell while a reader scrolled.
// The 1962 text permits either three rings or a continuous ring at each
// elevation; no local pattern is selected or simulated by this presentation.
const APPROVED_MISSAL_BELL_DIRECTIONS=Object.freeze({
 "AO.RUB.C0161.02":Object.freeze({
  label:"WARNING BELL",
  en:"A little before the Consecration, the server signals the faithful with the small altar bell.",
  fr:"Peu avant la consécration, le servant avertit les fidèles par un signal de sonnette.",
 }),
 "AO.RUB.C0174.03":Object.freeze({
  label:"ELEVATION BELL · HOST",
  en:"At the elevation of the Host, the server rings the bell three times, or continuously until the Host is replaced upon the corporal.",
  fr:"À l’élévation de la sainte Hostie, le servant sonne trois fois, ou de façon continue jusqu’à ce que l’Hostie soit reposée sur le corporal.",
 }),
 "AO.RUB.C0181.03":Object.freeze({
  label:"ELEVATION BELL · CHALICE",
  en:"At the elevation of the Chalice, the server rings the bell three times, or continuously until the Chalice is replaced upon the corporal.",
  fr:"À l’élévation du calice, le servant sonne trois fois, ou de façon continue jusqu’à ce que le calice soit reposé sur le corporal.",
 }),
});
const MINOR_MATRIX_ID="GM.P.C0204.01";
function exactMinorMatrix(matrix){
 if(matrix?.schema!=="ao-mass-gesture-matrix-v1" ||
    matrix.status!=="CANONICAL_GESTURE_SOT" ||
    matrix.invariants?.primaryRubricalAuthority!=="ROMAN_MISSAL_1962" ||
    !matrix.sources?.some(s=>s.id==="MR62_RITUS"&&s.role==="NORMATIVE_PRIMARY") ||
    !Array.isArray(matrix.items))return false;
 const x=matrix.items.find(item=>item.id===MINOR_MATRIX_ID);
 return x?.cueId==="AO.SM.C0204"&&x.actor==="PRIEST"&&
   x.authorityClass==="1962_NORMATIVE"&&x.gesture==="MINOR_ELEVATION"&&
   x.label==="ELEVATES HOST AND CHALICE SLIGHTLY"&&x.sequenceOrder===1&&
   x.displayPrimary===true&&x.iconKey==null&&
   x.iconStatus==="PENDING_EXACT_MASTER"&&x.sources?.includes("MR62_RITUS");
}
const FORM=new Set(["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
const validCue=id=>/^AO\.SM\.C\d{4}$/.test(String(id??""));
const frozen=Object.freeze;
const isCanon=id=>Number(id.slice(-4))>=150&&Number(id.slice(-4))<=207;

/**
 * Reuses original Canon publication authority and the explicit outside-Canon
 * list. A citation URL is reused, not copied from unapproved French research.
 */
export function publishedMissalRubricsForParagraph(paragraph,registry,{
 form="MISSA_CANTATA_SIMPLE",language="en",gestureMatrix=null,
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
 // The reader's THREE already sourced VIII.6 bell rows may be explained in
 // MISSAL at their exact source cue; they never activate an audio effect,
 // encode an observed server action, or choose a local ringing pattern.
 for(const cueId of ids){
  const rows=registry.items.filter(x=>x.cueId===cueId&&
   Object.hasOwn(APPROVED_MISSAL_BELL_DIRECTIONS,x.id)&&
   x.actor==="SERVER"&&x.kind==="BELL"&&x.displayPrimary===false&&
   x.authorityClass==="1962_NORMATIVE_WITH_LOCAL_PATTERN"&&
   x.sources?.includes("MR62_RITUS")&&
   x.presentationOwner==="reader-transients"&&
   Number.isInteger(x.order)&&
   x.label===APPROVED_MISSAL_BELL_DIRECTIONS[x.id].label);
  candidates.push(...rows.map(x=>({id:x.id,cueId,order:x.order,
   label:x.label,sourceUrl:source.url,kind:"BELL"})));
 }
 // The C0204 action belongs at the exact omnis honor et gloria paragraph.
 // A bare source anchor, a draft matrix row or a synthetic paragraph cannot
 // confer this certification. This remains descriptive, never observed now.
 if(ids.includes("AO.SM.C0204")&&exactMinorMatrix(gestureMatrix)){
  candidates.push({id:MINOR_MATRIX_ID,cueId:"AO.SM.C0204",order:1,
   label:"ELEVATES HOST AND CHALICE SLIGHTLY",kind:"MATRIX_TEXT_ONLY",
   sourceUrl:source.url});
 }
 const positioned=new Map(ids.map((id,i)=>[id,i]));
 return frozen(candidates.sort((a,b)=>
     positioned.get(a.cueId)-positioned.get(b.cueId)||a.order-b.order)
   .filter(x=>ACTIONS[x.label] || (x.kind==="STATE"&&APPROVED_MISSAL_PRIEST_STATES[x.id]) || (x.kind==="BELL"&&APPROVED_MISSAL_BELL_DIRECTIONS[x.id]))
   .map(x=>frozen({
     id:x.id,sourceCueId:x.cueId,actor:x.kind==="BELL"?"SERVER":"PRIEST",
     shortAction:x.label,displayText:x.kind==="BELL"
       ? APPROVED_MISSAL_BELL_DIRECTIONS[x.id][isFrench?"fr":"en"]
       : x.kind==="STATE" ? APPROVED_MISSAL_PRIEST_STATES[x.id][isFrench?"fr":"en"]
       : ACTIONS[x.label][isFrench?1:0],
     kind:x.kind??"ACTION",
     latinTrigger:x.triggerLat??null,order:x.order,
     sourceId:"MR62_RITUS",
     sourceUrl:x.sourceUrl??source.url,
     review:x.kind==="MATRIX_TEXT_ONLY"?"EXACT_1962_GESTURE_MATRIX_RUBRIC"
       :"EXISTING_PUBLISHED_R17_1962_RUBRIC",
     observedNow:false,
     owner:x.kind==="MATRIX_TEXT_ONLY"?"CERTIFIED_1962_MATRIX_TEXT_ONLY":MISSAL_RUBRIC_OWNER,
   })));
}

export function withPublishedMissalParagraphRubrics(paragraphs,registry,options={}){
 if(!Array.isArray(paragraphs))return frozen([]);
 return frozen(paragraphs.map(p=>{
   const rows=publishedMissalRubricsForParagraph(p,registry,options);
   return rows.length?frozen({...p,publishedMissalRubrics:rows}):p;
 }));
}
