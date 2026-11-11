// The existing 65-card LIVE reader deliberately splits Gloria (3 cards)
// and Credo (4 cards). This source-only map lets the ONE Schola syllable
// coordinate choose a *visual* prayer card without touching the priest
// observation clock or pretending that singing was actually heard.
// Never used to select/approve a score or infer a local musical setting.
import {scholaMassTextAnchors,normalizeScholaLatin} from "./reader-schola-mass-text-sync.js";

const TRACKS=Object.freeze({
 KYRIE:Object.freeze({section:"AO.CARD.002",first:44,last:52,expected:9}),
 GLORIA:Object.freeze({section:"AO.CARD.003",first:53,last:69,expected:16}),
 CREDO:Object.freeze({section:"AO.CARD.009",first:89,last:105,expected:16}),
});
const unsupported=reason=>Object.freeze({
 supported:false,reason,anchors:Object.freeze([]),
 cardForIndex:()=>null
});
const sourceCueNumber=id=>{
 const hit=/^AO\.SM\.C(\d{4})$/.exec(String(id??""));
 return hit?Number(hit[1]):null;
};

export function buildOrdinaryScholaCardFollowMap({
 gabc,trackId,cards
}={}){
 const spec=TRACKS[trackId];
 if(!spec||!Array.isArray(cards)||typeof gabc!=="string")
  return unsupported("UNSUPPORTED_TRACK_OR_SOURCE");
 const subset=cards.filter(c=>String(c?.sourceSectionId??c?.sectionId)===spec.section)
   .sort((a,b)=>Number(a.sequence)-Number(b.sequence));
 if(!subset.length)return unsupported("CANONICAL_CARDS_NOT_FOUND");
 const paragraphs=[];
 for(const card of subset){
  for(const p of card.paragraphs??[]){
   if(p.kind==="RUBRIC")continue;
   const owned=(p.sourceCueIds??[]).some(id=>{
    const n=sourceCueNumber(id);
    return n!=null&&n>=spec.first&&n<=spec.last;
   });
   if(!owned)continue;
   const latin=String(p.primary??p.latin??"").trim();
   if(!latin||!p.id)return unsupported("MISSING_CANONICAL_LATIN");
   paragraphs.push(Object.freeze({
    id:card.sectionId+"::"+p.id,latin,cardId:card.sectionId
   }));
  }
 }
 if(paragraphs.length!==spec.expected)
  return unsupported("CANONICAL_PARAGRAPH_CENSUS_DRIFT");
 const aligned=scholaMassTextAnchors(gabc,paragraphs,{trackId});
 const sequence=aligned.syllables.map(s=>normalizeScholaLatin(s.label)).join("");
 if(aligned.anchors.length!==paragraphs.length||
    aligned.anchors[0]?.start!==0 ||
    aligned.anchors.at(-1)?.end!==sequence.length ||
    aligned.anchors.some((a,i)=>i>0&&aligned.anchors[i-1].end!==a.start))
  return unsupported("GABC_CANONICAL_LATIN_MISMATCH");
 const sourceById=new Map(paragraphs.map(p=>[p.id,p]));
 const cardById=new Map(subset.map(card=>[card.sectionId,card]));
 const anchors=Object.freeze(aligned.anchors.map(anchor=>Object.freeze({
  start:anchor.start,end:anchor.end,
  sectionId:sourceById.get(anchor.id)?.cardId??null,
  sourceParagraphId:anchor.id
 })));
 if(anchors.some(a=>!a.sectionId||!cardById.has(a.sectionId)))
  return unsupported("CANONICAL_CARD_LINK_MISSING");
 function cardForIndex(index){
  if(!Number.isInteger(index)||index<0||index>=aligned.offsets.length)
    return null;
  const offset=aligned.offsets[index];
  const anchor=anchors.find(a=>offset>=a.start&&offset<a.end);
  return anchor?cardById.get(anchor.sectionId)??null:null;
 }
 return Object.freeze({
  supported:true,reason:null,anchors,trackId,
  count:aligned.syllables.length,sourceSectionId:spec.section,
  cardForIndex
 });
}
