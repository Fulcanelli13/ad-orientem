/**
 * Original-text-preserving read focus for the UNPUBLISHED Advent I 2026
 * First Vespers research preview. This is a presentation projection only:
 *  - five Saturday psalm portions retain every original numbered verse row,
 *    including intentionally repeated labels and 144:13a/13b
 *  - 10 Magnificat verses retain exact three-language line order
 *  - six hymn stanzas retain exact original lines and boundaries
 *  - source events, rubrics and the collect ending are NEVER changed
 *
 * Every focus unit is aligned by source verse/stanza ordinal. If any locale
 * has fewer or differently labelled verses, the entire focus is withheld.
 * No synthetic translation, fallback, certification or public route.
 */
import {DIVINUM_OFFICIUM_PIN as PIN} from "../app/source-transport-compat.js";
import {ADVENT_FIRST_VESPERS_PREVIEW_SCHEMA}
 from "./advent-first-vespers-preview-model.js";

export const OFFICE_ADVENT_FOCUS_SCHEMA=
 "ao.office.advent-i-2026-source-preserving-focus.v1";
const LANG=["la","en","fr"];
const SEGMENTS=[
 ["Psalm143#1-8",9],["Psalm143#9-15",9],
 ["Psalm144#1-7",7],["Psalm144#8-13a",6],
 ["Psalm144#13b-21",9]
];
function fail(reason){
 return Object.freeze({
  schema:OFFICE_ADVENT_FOCUS_SCHEMA,status:"WITHHELD",reason,
  frames:Object.freeze([]),sourceTextAltered:false,
  liturgicallyCertified:false,publicationAuthorized:false,published:false
 });
}
function safeLine(v){
 return typeof v==="string"&&v.length>0&&v.length<19000&&
 !v.includes("\u0000");
}
function hasLocales(block){
 return LANG.every(lang=>Array.isArray(block.texts?.[lang])&&
  block.texts[lang].length>0&&
  block.texts[lang].every(line=>safeLine(line)));
}
function psalmRows(block,number,count){
 const result={};
 let labels;
 for(const lang of LANG){
  if(block.texts[lang].length!==1)return null;
  const lines=block.texts[lang][0].split("\n");
  if(lines.length!==count||lines.some(line=>!safeLine(line)))return null;
  const thisLabels=lines.map(line=>{
   const m=/^(143|144):(\d+[ab]?) \S/u.exec(line);
   return m&&Number(m[1])===number?m[1]+":"+m[2]:null;
  });
  if(thisLabels.some(x=>x===null)||
    (labels&&thisLabels.some((x,i)=>x!==labels[i])))return null;
  labels??=thisLabels;
  result[lang]=lines;
 }
 return {lines:result,labels};
}
function magnificatRows(block){
 const result={};
 let labels;
 for(const lang of LANG){
  const lines=block.texts[lang];
  if(lines.length!==10)return null;
  const thisLabels=lines.map(line=>{
   const m=/^Luke 1:(4[6-9]|5[0-5]) \S/u.exec(line);
   return m?Number(m[1]):null;
  });
  if(thisLabels.some((x,i)=>x!==i+46)||
    (labels&&thisLabels.some((x,i)=>x!==labels[i])))return null;
  labels??=thisLabels;
  result[lang]=[...lines];
 }
 return {lines:result,labels};
}
function hymnStanzas(block){
 const result={};
 for(const lang of LANG){
  const lines=block.texts[lang],stanzas=[[]];
  if(lines.length<24||lines.length>40)return null;
  for(const line of lines){
   if(line==="\n"){
    if(stanzas.at(-1).length===0)return null;
    stanzas.push([]);continue;
   }
   stanzas.at(-1).push(line);
  }
  if(stanzas.length!==6||
    stanzas.some((stanza,i)=>stanza.length!==(i===5?5:4))||
    stanzas[5][4]!==(
     lang==="fr"?"Ainsi soit-il.":"Amen."
    ))return null;
  result[lang]=stanzas;
 }
 return result;
}
function same(source,parts,type){
 // No source string can disappear when we group verses by rows or
 // the original hymn text by its five literal stanza separators.
 if(type==="HYMNS"){
  return LANG.every(lang=>source.texts[lang].join("\u0001")===
   parts.map(x=>x.texts[lang].join("\u0001"))
    .join("\u0001\n\u0001"));
 }
 if(type==="PSALM"){
  return LANG.every(lang=>source.texts[lang][0]===
   parts.map(x=>x.texts[lang][0]).join("\n"));
 }
 if(type==="CANTICLE"){
  return LANG.every(lang=>source.texts[lang].join("\u0001")===
   parts.map(x=>x.texts[lang][0]).join("\u0001"));
 }
 return false;
}
function frame(block,eventIndex,subIndex,subTotal,focusType,label,texts){
 return Object.freeze({
  eventIndex,kind:block.kind,sourceId:block.sourceId,
  position:block.position,slot:block.slot,
  subIndex,subTotal,focusType,label,
  texts:Object.freeze(Object.fromEntries(
   LANG.map(lang=>[lang,Object.freeze([...texts[lang]])])
  )),
  originalSourceOnly:block.originalSourceOnly,
  translationCertified:false,printedEditionCertified:false,
  rightsApproved:false
 });
}
export function buildAdventI2026ReadingFocus({preview}={}){
 if(preview?.schema!==ADVENT_FIRST_VESPERS_PREVIEW_SCHEMA||
  preview.status!=="PRIVATE_RESEARCH_PREVIEW_SOURCE_SEQUENCE_ONLY"||
  preview.sourceRevision!==PIN||
  preview.civilDate!=="2026-11-28"||preview.officeDate!=="2026-11-29"||
  preview.officePart!=="FIRST"||preview.calendarScope!=="UNIVERSAL_ONLY"||
  preview.blockCount!==38||!Array.isArray(preview.blocks)||
  preview.blocks.length!==38||preview.psalmPortions!==5||
  preview.antiphonUses!==12||
  preview.doxologyPositionsIncludingOpening!==7||
  preview.sourceCollectEndingOnce!==true||
  preview.researchOnly!==true||
  preview.completeHourCertified!==false||
  preview.printedEditionCertified!==false||
  preview.translationApproved!==false||
  preview.rightsApproved!==false||
  preview.publishable!==false||preview.published!==false)
  return fail("FOCUS_SOURCE_ONLY_UNPUBLISHED_PREVIEW_REQUIRED");

 const frames=[];
 let psalms=0,hymns=0,magnificats=0;
 for(let eventIndex=0;eventIndex<preview.blocks.length;eventIndex++){
  const block=preview.blocks[eventIndex];
  if(!block||typeof block.kind!=="string"||
    !("sourceId" in block))return fail("FOCUS_INVALID_SOURCE_EVENT");
  if(block.kind==="RESEARCH_CALENDAR_NOTICE"){
   if(block.texts!==null||
     typeof block.message!=="string"||
     !block.message.includes("Local calendars remain unreviewed"))
    return fail("FOCUS_UNREVIEWED_CALENDAR_NOTICE_MISSING");
   frames.push(frame(block,eventIndex,0,1,"NOTICE",null,
    {la:[block.message],en:[block.message],fr:[block.message]}));
   continue;
  }
  if(block.originalSourceOnly!==true||!hasLocales(block))
   return fail("FOCUS_SOURCE_LANGUAGE_TEXT_MISSING:"+block.kind);
  let parts=null;
  if(block.kind==="PSALM_PORTION"){
   const expected=SEGMENTS[psalms];
   if(!expected||!block.sourceId.endsWith(expected[0]))
    return fail("FOCUS_PSALM_SOURCE_BOUNDARY_CHANGED");
   const number=psalms<2?143:144;
   const rows=psalmRows(block,number,expected[1]);
   if(!rows)return fail("FOCUS_TRILINGUAL_PSALM_VERSE_ALIGNMENT_UNRESOLVED");
   parts=rows.labels.map((label,i)=>frame(block,eventIndex,i,expected[1],
    "PSALM_VERSE",label,Object.fromEntries(LANG.map(lang=>[
     lang,[rows.lines[lang][i]]
    ]))));
   if(!same(block,parts,"PSALM"))return fail("FOCUS_PSALM_ROW_LOSS");
   psalms++;
  }else if(block.kind==="MAGNIFICAT"){
   const rows=magnificatRows(block);
   if(!rows)return fail("FOCUS_TRILINGUAL_MAGNIFICAT_ALIGNMENT_UNRESOLVED");
   parts=rows.labels.map((label,i)=>frame(block,eventIndex,i,10,
    "MAGNIFICAT_VERSE","Luke 1:"+label,
    Object.fromEntries(LANG.map(lang=>[lang,[rows.lines[lang][i]]]))));
   if(!same(block,parts,"CANTICLE"))return fail("FOCUS_CANTICLE_VERSE_LOSS");
   magnificats++;
  }else if(block.kind==="HYMN"){
   const stanzas=hymnStanzas(block);
   if(!stanzas)return fail("FOCUS_TRILINGUAL_HYMN_STANZAS_UNRESOLVED");
   parts=Array.from({length:6},(_,i)=>frame(block,eventIndex,i,6,
    "HYMN_STANZA",null,Object.fromEntries(LANG.map(lang=>[
     lang,stanzas[lang][i]
    ]))));
   if(!same(block,parts,"HYMNS"))return fail("FOCUS_HYMN_LINE_LOSS");
   hymns++;
  }
  if(parts)frames.push(...parts);
  else frames.push(frame(block,eventIndex,0,1,"WHOLE",null,block.texts));
 }
 if(psalms!==5||hymns!==1||magnificats!==1||
  preview.blocks.filter(x=>x.kind==="COLLECT_ENDING").length!==1||
  frames.filter(x=>x.kind==="COLLECT_ENDING").length!==1||
  frames.filter(x=>x.kind==="RESEARCH_CALENDAR_NOTICE").length!==1)
  return fail("FOCUS_LITURGICAL_SOURCE_BLOCK_COUNTS_CHANGED");
 return Object.freeze({
  schema:OFFICE_ADVENT_FOCUS_SCHEMA,
  status:"RESEARCH_VERSE_AND_STANZA_FOCUS_NOT_CERTIFIED",
  originalEventCount:preview.blocks.length,
  focusFrameCount:frames.length,
  frames:Object.freeze(frames),
  psalmVerseRows:40,magnificatVerseRows:10,hymnStanzas:6,
  allLanguagesAlignedByPinnedSourceOrdinals:true,
  sourceTextAltered:false,sourceEventsReordered:false,
  completeHourCertified:false,translationApproved:false,
  rightsApproved:false,publishable:false,published:false
 });
}
