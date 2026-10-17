/**
 * The second, explicitly user-requested depth of a Missal rubric.
 * Only published source-owned directions enter here; a source paragraph's
 * original bracketed rubric is the SHORT version, not another direction.
 *
 * This is not the Mass Guide, formation commentary or a live observation.
 * It assembles original approved actions and their source anchors in order,
 * without promoting the held 62-action Canon / 67-event Solemn research.
 */
export const MISSAL_RUBRIC_DETAIL_OWNER="MISSAL_CERTIFIED_CEREMONIAL_DETAIL";
const CUE=/^AO\.SM\.C\d{4}$/;
const EVENT=/^(?:AO\.RUB\.C\d{4}\.\d\d|SMIN-0(?:0[1-9]|1[0-9]))$/;
const SOURCE="https://archive.ccwatershed.org/pdfs/5276-ritus-servandus-translated-english/download/";
const EVIDENCE=new Set(["MR62_RITUS","R18_SOLEMN_FORM_STATE"]);
const freeze=Object.freeze;
export function missalRubricDetailForParagraph(paragraph){
 const events=Array.isArray(paragraph?.publishedMissalRubrics)?
   paragraph.publishedMissalRubrics:[];
 const sourceCueIds=Array.isArray(paragraph?.sourceCueIds)?paragraph.sourceCueIds:[];
 const valid=events.filter(x=>x?.observedNow===false &&
   EVIDENCE.has(x.sourceId) && EVENT.test(String(x.id??"")) &&
   CUE.test(x.sourceCueId) && sourceCueIds.includes(x.sourceCueId) &&
   typeof x.displayText==="string"&&x.displayText.trim() &&
   typeof x.sourceUrl==="string"&&x.sourceUrl.startsWith("https://") &&
   typeof x.actor==="string"&&x.actor.trim());
 if(!valid.length)return null;
 const bracketed=paragraph?.kind==="RUBRIC" ||
   /^\s*\[/.test(String(paragraph?.primary??""));
 // No artificial expansion of a single unanchored generic short direction.
 // Single-word cues have authentic placement to disclose; single Solemn
 // events have a distinct sacred-minister actor to disclose.
 const hasLatinWord=valid.some(x=>typeof x.latinTrigger==="string"&&x.latinTrigger.trim());
 const hasMinister=valid.some(x=>x.sourceId==="R18_SOLEMN_FORM_STATE");
 if(!bracketed && valid.length===1 && !hasLatinWord && !hasMinister)return null;
 const index=new Map(sourceCueIds.map((id,i)=>[id,i]));
 const steps=valid.slice().sort((a,b)=>
   (index.get(a.sourceCueId)??1000)-(index.get(b.sourceCueId)??1000) ||
   (Number.isInteger(a.order)?a.order:100)-(Number.isInteger(b.order)?b.order:100))
   .map((e,i)=>freeze({
     id:e.id,cueId:e.sourceCueId,actor:e.actor,
     text:e.displayText,
     latinTrigger:typeof e.latinTrigger==="string"&&e.latinTrigger.trim()?
       e.latinTrigger.trim():null,
     sourceUrl:e.sourceUrl,
     sequence:i+1,
   }));
 return freeze({
   owner:MISSAL_RUBRIC_DETAIL_OWNER,
   shortAlreadyInSource:bracketed,
   sourceCueIds:freeze([...new Set(steps.map(x=>x.cueId))]),
   steps:freeze(steps),
   // Only primary 1962 source links from those same reviewed events.
   sourceUrl:steps.find(x=>x.sourceUrl===SOURCE)?.sourceUrl??steps[0].sourceUrl,
   observedNow:false,
 });
}
