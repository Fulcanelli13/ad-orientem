/**
 * Saturday Compline after First Vespers of Advent I (1960 BR 166b).
 * One on-demand source-first research pilot, not a published Office.
 *
 * All prayer text comes from exact original pinned 1960-compatible leaves.
 * This deliberately implements one explicit calendar appointment; no weekday
 * sweep, calendar inference, invented Common, translation or paid backend.
 * It does NOT assert independent completeness, translation fidelity or rights.
 */
import {DIVINUM_OFFICIUM_PIN as PIN} from "../app/source-transport-compat.js";
import {parsePinnedOfficeSectionHeadings}
 from "./pinned-section-heading-parser.js";
import {planWeeklyComplinePsalter,COMPLINE_MARIAN_SOURCE_SECTIONS}
 from "./weekday-compline-psalter-plan.js";
import {reviewAdventIComplineAppointment}
 from "./compline-advent-2026-appointments.js";
import {researchChristmas2026PrivateComplineAppointment}
 from "./compline-christmas-2026-research-gate.js";
import {researchDec28Jan03PrivateComplineAppointment}
 from "./compline-dec28-jan03-2027-source-gate.js";
import {researchJan04_10PrivateComplineAppointment}
 from "./compline-epiphany-jan04-10-2027-source-gate.js";
import {researchJan11_17PrivateComplineAppointment}
 from "./compline-jan11-17-2027-source-gate.js";
const PRIVATE_APPOINTMENT_STATUSES=new Set([
 "EXPLICIT_ROMAN_1960_APPOINTMENT_RESEARCH",
 "EXPLICIT_CHRISTMAS_2026_PRIVATE_SOURCE_RESEARCH"
]);
function privateComplineSourceAppointment(date){
 const advent=reviewAdventIComplineAppointment(date);
 return advent.status==="EXPLICIT_ROMAN_1960_APPOINTMENT_RESEARCH"?
  advent:researchChristmas2026PrivateComplineAppointment(date);
}

export const SATURDAY_COMPLINE_PILOT_SCHEMA="ao.office.2026-advent-i-saturday-compline-pilot.v1";
export const FERIAL_COMPLINE_PILOT_SCHEMA="ao.office.2026-advent-i-ferial-compline-pilot.v1";
const PSALMS_TO_READ=Object.freeze({
 Dominica:Object.freeze([4,90,133,233]),
 "Feria II":Object.freeze([6,7,233]),
 "Feria III":Object.freeze([11,12,15,233]),
 "Feria IV":Object.freeze([33,60,233]),
 "Feria V":Object.freeze([69,70,233]),
 "Feria VI":Object.freeze([76,85,233]),
 Sabbato:Object.freeze([87,102,233])
});
const BASE="https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/"+PIN+"/web/www/horas/";
const LOCALE=Object.freeze({la:"Latin",en:"English",fr:"Francais"});
const LANGS=Object.freeze(["la","en","fr"]);
const LATIN_ONLY=Object.freeze(["la"]);
function checkedLanguages(value){
 if(value===undefined)return LANGS;
 if(!Array.isArray(value))return null;
 if(value.length===1&&value[0]==="la")return LATIN_ONLY;
 if(value.length===3&&LANGS.every(l=>value.includes(l))&&
   new Set(value).size===3)return LANGS;
 return null;
}
const PSALMI="Psalterium/Psalmi/Psalmi minor";
const SPECIAL="Psalterium/Special/Minor Special";
const PRAYERS="Psalterium/Common/Prayers";
const MARIAN="Psalterium/Mariaant";
const allowed=Object.freeze({
 [PSALMI]:["Completorium"],
 [SPECIAL]:["Hymnus Completorium","Lectio Completorium",
  "Completorium_","Responsory Completorium","Versum 4","Ant 4"],
 [PRAYERS]:["Pater noster","Pater noster Et","Confiteor_","Tu autem_",
  "Deo gratias","Adjutorium nostrum","Misereatur","Indulgentiam",
  "Converte nos","Deus in adjutorium","Alleluia","Gloria","Dominus",
  "Kyrie","Oremus","Oratio Visita_","Per Dominum",
  "Jube domne","Benedictio Completorium_",
  "Benedictio Completorium2","Benedicamus Domino","Fidelium animae","Divinum auxilium"],
 [MARIAN]:COMPLINE_MARIAN_SOURCE_SECTIONS
});
const MAX_SOURCE_READS=24;
function held(reason,weekday="Sabbato"){
 return Object.freeze({
  schema:weekday==="Sabbato"?SATURDAY_COMPLINE_PILOT_SCHEMA:FERIAL_COMPLINE_PILOT_SCHEMA,status:"WITHHELD",reason,
  blocks:Object.freeze([]),frames:Object.freeze([]),
  canPreview:false,rightsApproved:false,publishable:false,published:false
 });
}
export function createComplinePinnedReader({
 fetchSource,weekday=null,date=null,languages,
 privateChristmasResearch=false,privateYearBoundaryResearch=false,
 privateEpiphanyResearch=false,privatePostEpiphanyResearch=false
}={}){
 const active=checkedLanguages(languages);
 if(!active)throw Error("COMPLINE_LANGUAGE_SCOPE_NOT_APPROVED");
 const reviewed=date===null?null:privatePostEpiphanyResearch?
  researchJan11_17PrivateComplineAppointment(date):
  privateEpiphanyResearch?
  researchJan04_10PrivateComplineAppointment(date):
  privateYearBoundaryResearch?
  researchDec28Jan03PrivateComplineAppointment(date):
  privateChristmasResearch?privateComplineSourceAppointment(date):
  reviewAdventIComplineAppointment(date);
 if(date!==null&&!(privatePostEpiphanyResearch?
     reviewed.status==="EXPLICIT_POST_EPIPHANY_PRIVATE_SOURCE_RESEARCH":
     privateEpiphanyResearch?
     reviewed.status==="EXPLICIT_EPIPHANY_2027_PRIVATE_SOURCE_RESEARCH":
     privateYearBoundaryResearch?
     reviewed.status==="EXPLICIT_DEC28_JAN03_PRIVATE_SOURCE_RESEARCH":
     privateChristmasResearch?
     PRIVATE_APPOINTMENT_STATUSES.has(reviewed.status):
     reviewed.status==="EXPLICIT_ROMAN_1960_APPOINTMENT_RESEARCH"))
  throw Error("COMPLINE_UNREVIEWED_DATE_READER_WITHHELD");
 const psalmDay=reviewed?.appointment?.psalmDay??weekday??"Sabbato";
 if(typeof fetchSource!=="function"||
    !Object.hasOwn(PSALMS_TO_READ,psalmDay)||
    (reviewed&&weekday!==null&&psalmDay!==weekday))
  throw Error("COMPLINE_FETCH_OR_WEEKDAY_NOT_SUPPORTED");
 const psalmIds=PSALMS_TO_READ[psalmDay];
 const cache=new Map();
 function url(path,language){
  if(!Object.hasOwn(LOCALE,language)||!active.includes(language))
   throw Error("COMPLINE_LANGUAGE_NOT_SUPPORTED");
  if(!Object.hasOwn(allowed,path)&&
    !psalmIds.some(n=>path==="Psalterium/Psalmorum/Psalm"+n))
   throw Error("COMPLINE_PATH_NOT_ALLOWED");
  return new URL(BASE+LOCALE[language]+"/"+path+".txt").href;
 }
 async function raw(path,language){
  const location=url(path,language);
  if(!cache.has(location)){
   if(cache.size>=MAX_SOURCE_READS)
    throw Error("COMPLINE_SOURCE_READ_BUDGET_EXCEEDED");
   const result=Promise.resolve().then(()=>fetchSource(location,{
    method:"GET",credentials:"omit",mode:"cors",redirect:"error",
    referrerPolicy:"no-referrer",cache:"no-store"
   })).then(async response=>{
    if(response?.status!==200||response?.ok!==true||
       (response.url&&response.url!==location)||
       typeof response.text!=="function")
     throw Error("COMPLINE_SOURCE_READ_FAILED:"+path);
    const text=await response.text();
    if(typeof text!=="string"||text.length<20||text.length>320000||
       text.includes("\u0000"))
     throw Error("COMPLINE_SOURCE_INVALID:"+path);
    return text;
   });
   cache.set(location,result);
   result.catch(()=>{if(cache.get(location)===result)cache.delete(location)});
  }
  return cache.get(location);
 }
 async function section(path,name,language){
  if(!Object.hasOwn(allowed,path)||!allowed[path].includes(name))
   throw Error("COMPLINE_SECTION_NOT_ALLOWED");
  // Some original-language leaves have conditional variant headings; the
  // parser chooses the exact unqualified source name, never a silent variant.
  const map=parsePinnedOfficeSectionHeadings(await raw(path,language),
   new Set([name]));
  const lines=map.get(name);
  if(!lines?.length)throw Error("COMPLINE_SOURCE_SECTION_MISSING:"+name);
  return [...lines];
 }
 async function psalm(number,language){
  if(!psalmIds.includes(number))throw Error("COMPLINE_PSALM_NOT_ALLOWED");
  return raw("Psalterium/Psalmorum/Psalm"+number,language);
 }
 return Object.freeze({
  sourceRevision:PIN,weekday:psalmDay,date,section,psalm,
  languages:active,cachedDistinctFiles:()=>cache.size,
  maxDistinctFiles:(4+psalmIds.length)*active.length
 });
}
function sourceLines(lines){
 if(!Array.isArray(lines)||!lines.length)return null;
 if(lines.some(line=>typeof line!=="string"||
    !line.trim()||line.length>10000||/[<>]/u.test(line)||
    /^(?:@|[$&]|(?:sed rubrica)|(?:rubrica ))/u.test(line)))return null;
 return lines;
}
function textOf(lines){
 const good=sourceLines(lines);
 if(!good)throw Error("COMPLINE_SOURCE_LINES_NOT_DIRECT");
 return [...good];
}
function sourceId(path,name){return path+"#"+name}
function projectBlock(kind,path,name,parts){
 const texts={};
 for(const l of Object.keys(parts)){
  texts[l]=Object.freeze(textOf(parts[l]));
 }
 return Object.freeze({
  kind,sourceId:sourceId(path,name),
  texts:Object.freeze(texts),originalSourceOnly:true,
  translationCertified:false,printedEditionCertified:false,
  rightsApproved:false
 });
}
function betweenNumbered(lines,number,start,end){
 const rows=lines.replace(/\r\n?/gu,"\n").trim().split("\n").filter(Boolean);
 if(!rows.length||rows.length>70)return null;
 const output=[];
 for(const line of rows){
  const m=new RegExp("^"+number+":([0-9]+)[a-z]? (.+)$","u").exec(line);
  if(!m)return null;
  const label=Number(m[1]);
  if((start===null||label>=start)&&(end===null||label<=end))output.push(line);
 }
 return output.length?output:null;
}
function stanzas(lines){
 const parts=[[]];
 for(const line of lines){
  if(line==="_"||line==="*"){
   if(!parts.at(-1).length)return null;
   parts.push([]);continue;
  }
  if(/^\(|^@|^\$|^&/u.test(line))return null;
  parts.at(-1).push(line);
 }
 return parts.some(x=>!x.length)?null:parts;
}
export async function assembleWeekdayComplinePilot({
 reader,weekday="Sabbato",date=null,languages,
 privateChristmasResearch=false,privateYearBoundaryResearch=false,
 privateEpiphanyResearch=false,privatePostEpiphanyResearch=false
}={}){
 const active=checkedLanguages(languages);
 if(!active)return held("COMPLINE_LANGUAGE_SCOPE_NOT_APPROVED",weekday);
 const appointedDate=date??(weekday==="Sabbato"?"2026-11-28":
  weekday==="Feria III"?"2026-12-01":null);
 const review=privatePostEpiphanyResearch?
  researchJan11_17PrivateComplineAppointment(appointedDate):
  privateEpiphanyResearch?
  researchJan04_10PrivateComplineAppointment(appointedDate):
  privateYearBoundaryResearch?
  researchDec28Jan03PrivateComplineAppointment(appointedDate):
  privateChristmasResearch?privateComplineSourceAppointment(appointedDate):
  reviewAdventIComplineAppointment(appointedDate);
 if(!(privatePostEpiphanyResearch?
     review.status==="EXPLICIT_POST_EPIPHANY_PRIVATE_SOURCE_RESEARCH":
     privateEpiphanyResearch?
     review.status==="EXPLICIT_EPIPHANY_2027_PRIVATE_SOURCE_RESEARCH":
     privateYearBoundaryResearch?
     review.status==="EXPLICIT_DEC28_JAN03_PRIVATE_SOURCE_RESEARCH":
     privateChristmasResearch?PRIVATE_APPOINTMENT_STATUSES.has(review.status):
     review.status==="EXPLICIT_ROMAN_1960_APPOINTMENT_RESEARCH"))
  return held("OFFICE_DATE_APPOINTMENT_NOT_REVIEWED",weekday);
 const appointment=review.appointment,psalmDay=appointment.psalmDay;
 const psalmIds=PSALMS_TO_READ[psalmDay];
 // Pre-existing trilingual deterministic adapters omit language metadata.
 // The new Latin-only adapter MUST declare its restriction explicitly.
 const readerLanguages=reader?.languages??LANGS;
 if(reader?.sourceRevision!==PIN||reader.weekday!==psalmDay||
    !Array.isArray(readerLanguages)||readerLanguages.length!==active.length||
    active.some(l=>!readerLanguages.includes(l))||
    (date!==null&&reader.date!==date)||
    typeof reader.section!=="function"||
    typeof reader.psalm!=="function")
  return held("PINNED_COMPLINE_READER_REQUIRED",psalmDay);
 const blocks=[];
 try{
  const sections={};
  const paths=Object.keys(allowed);
  // Four named source leaves plus only the appointed psalms per locale.
  // Saturday uses 21 pinned documents, Tuesday uses 24. No annual sweep.
  await Promise.all(active.map(async l=>{
   sections[l]={};
   for(const path of paths){
    sections[l][path]={};
    // Read all named sections through the cached original leaf.
    for(const name of path===MARIAN?[appointment.marianSection]:allowed[path]){
     try{sections[l][path][name]=await reader.section(path,name,l)}
     catch(e){throw Error(l+":"+path+"#"+name+":"+e.message)}
    }
   }
   sections[l].psalms={};
   for(const n of psalmIds)sections[l].psalms[n]=await reader.psalm(n,l);
  }));
  const at=(l,p,n)=>sections[l][p][n];
  const append=(kind,p,n,selector=null)=>{
   const parts={};
   for(const l of active)parts[l]=selector?
    selector(at(l,p,n),l):at(l,p,n);
   blocks.push(projectBlock(kind,p,n,parts));
  };
  const prayer=(k,kind="PRAYER",selector=null)=>
   append(kind,PRAYERS,k,selector);
  const minor=(k,kind="PRAYER",selector=null)=>
   append(kind,SPECIAL,k,selector);
  const isLine=(x)=>typeof x==="string"&&x.length>0;
  // 1960 rubrics: the blessing at Compline, short lesson and private
  // examination/confession precede the Deus in adjutorium opening.
  prayer("Jube domne","INVITATION",x=>{
   const lines=x.filter(z=>/^V\./u.test(z));
   return [lines.at(-1)];
  });
  prayer("Benedictio Completorium_","BLESSING");
  minor("Lectio Completorium","LESSON",x=>[x.find(z=>/^v\./u.test(z))]);
  prayer("Tu autem_","RESPONSE");
  prayer("Adjutorium nostrum","INVOCATION");
  prayer("Pater noster","PATER_NOSTER");
  prayer("Confiteor_","CONFITEOR",x=>[x.find(z=>/^v\./u.test(z))]);
  prayer("Misereatur","ABSOLUTION",x=>[x.find(z=>/^v\./u.test(z))]);
  prayer("Indulgentiam","ABSOLUTION",x=>[x.find(z=>/^v\./u.test(z))]);
  prayer("Converte nos","INVOCATION",x=>x.filter(z=>/^[VR]\./u.test(z)).slice(0,2));
  prayer("Deus in adjutorium","OPENING",x=>x.slice(0,4));
  prayer("Alleluia","ALLELUIA",x=>x.filter(z=>!z.startsWith("(")).slice(0,1));
  const plan=planWeeklyComplinePsalter({
   weekday:psalmDay,marianSection:appointment.marianSection,
   languages:active,
   sourceSections:Object.fromEntries(active.map(l=>[
    l,at(l,PSALMI,"Completorium")
   ]))
  });
  if(plan.status!=="SOURCE_FIRST_WEEKDAY_PSALTER_APPOINTMENT_RESEARCH_ONLY"||
     plan.psalmIds.some(n=>!psalmIds.includes(n))||
     plan.segments.length!==3)
   throw Error(plan.reason||"COMPLINE_WEEKDAY_PINNED_PSALTER_UNRESOLVED");
  blocks.push(projectBlock("ANTIPHON",PSALMI,"Completorium:"+psalmDay,
   Object.fromEntries(active.map(l=>[l,[plan.antiphons[l]]]))));
  for(const {number,start,end} of plan.segments){
   const portions={};
   for(const l of active){
    const lines=betweenNumbered(sections[l].psalms[number],
     number,start,end);
    if(!lines)throw Error("COMPLINE_PSALM_PART_MISSING:"+l+":"+number);
    portions[l]=lines;
   }
   const labels=portions.la.map(line=>
    Number(new RegExp("^"+number+":([0-9]+)[a-z]? ","u")
     .exec(line)?.[1]));
   if(labels.some(n=>!Number.isInteger(n))||
      active.some(l=>portions[l].length!==labels.length))
    throw Error("COMPLINE_PSALM_SOURCE_ROW_ALIGNMENT_LOST:"+number);
   const range=String(labels[0])+"-"+String(labels.at(-1));
   blocks.push(projectBlock("PSALM","Psalterium/Psalmorum/Psalm"+number,
    range,portions));
   prayer("Gloria","DOXOLOGY");
  }
  blocks.push(projectBlock("ANTIPHON",PSALMI,"Completorium:"+psalmDay,
   Object.fromEntries(active.map(l=>[l,[plan.antiphons[l]]]))));
  minor("Hymnus Completorium","HYMN",x=>{
   const part=stanzas(x);
   if(!part||part.length<2)throw Error("COMPLINE_HYMN_INVALID");
   return x.filter(z=>z!=="*");
  });
  minor("Completorium_","CHAPTER",x=>[x.find(z=>/^v\./u.test(z))]);
  prayer("Deo gratias","RESPONSE");
  minor("Responsory Completorium","SHORT_RESPONSORY",(x,l)=>{
   const first=x.find(z=>z.startsWith("R.br."));
   const responses=x.filter(z=>z.startsWith("R."));
   const verse=x.find(z=>z.startsWith("V."));
   if(!first||responses.length<3||!verse)
    throw Error("COMPLINE_SHORT_RESPONSORY_INVALID");
   // The original 1960 responsory has its Gloria in the middle.
   return [first,responses[0],verse,responses[1],
    ...at(l,PRAYERS,"Gloria").slice(0,2),responses.at(-1)];
  });
  minor("Versum 4","VERSICLE");
  minor("Ant 4","ANTIPHON");
  const nunc={};
  for(const l of active){
   const lines=sections[l].psalms[233].split(/\r?\n/u)
    .filter(z=>/^2:(?:29|30|31|32)\s/u.test(z));
   if(lines.length!==4)throw Error("COMPLINE_NUNC_DIMMITTIS_UNRESOLVED:"+l);
   nunc[l]=lines;
  }
  blocks.push(projectBlock("CANTICLE","Psalterium/Psalmorum",
   "Psalm233:Nunc dimittis",nunc));
  prayer("Gloria","DOXOLOGY");
  minor("Ant 4","ANTIPHON");
  prayer("Kyrie","KYRIE");
  prayer("Pater noster Et","PATER_NOSTER");
  // Preserve BOTH alternative dialogue pairs from the pinned witness.
  // The 1961 Ordinary chooses priest / non-priest at presentation time.
  prayer("Dominus","DIALOGUE",x=>x.slice(0,4));
  prayer("Oremus","OREMUS",x=>x.slice(0,1));
  prayer("Oratio Visita_","COLLECT");
  prayer("Per Dominum","CONCLUSION");
  // Preserve BOTH alternative dialogue pairs from the pinned witness.
  // The 1961 Ordinary chooses priest / non-priest at presentation time.
  prayer("Dominus","DIALOGUE",x=>x.slice(0,4));
  prayer("Benedicamus Domino","DISMISSAL",x=>x.slice(0,2));
  prayer("Benedictio Completorium2","BLESSING",x=>x.slice(0,1));
  // Advent seasonal Marian antiphon: retain source-owned verse and collect;
  // do NOT infer other-season alternates. The embedded $Oremus is replaced
  // with its actual existing Common/Prayers source rather than shown raw.
  const marian={},marianCollect={};
  for(const l of active){
   const all=at(l,MARIAN,appointment.marianSection);
   const prayerAt=all.findIndex(z=>z.trim()==="$Oremus");
   if(prayerAt<5||prayerAt>=all.length-1)
    throw Error("COMPLINE_SEASONAL_MARIAN_COLLECT_UNRESOLVED:"+l);
   const clean=z=>z.replace(/^\{:S-[^:]+:\}/u,"")
    .replace(/\{::\}/gu,"").trim();
   const ant=all.slice(0,prayerAt).filter(z=>z!=="_").map(clean);
   const collect=all.slice(prayerAt+1).filter(z=>z!=="_").map(clean);
   if(ant.length<3||collect.length!==1||
      ant.some(z=>!isLine(z))||collect.some(z=>!isLine(z)))
    throw Error("COMPLINE_SEASONAL_MARIAN_SOURCE_UNRESOLVED:"+l);
   marian[l]=ant;
   marianCollect[l]=collect;
  }
  blocks.push(projectBlock("MARIAN_ANTIPHON",MARIAN,appointment.marianSection,marian));
  prayer("Oremus","OREMUS",x=>x.slice(0,1));
  blocks.push(projectBlock("MARIAN_COLLECT",MARIAN,appointment.marianSection+":Oratio",marianCollect));
  // The 1961 Rubricae (179c, 181) distinguishes Compline's
  // "Benedicat et custodiat" blessing from the post-Marian final
  // "Divinum auxilium". "Fidelium animae" is NOT Compline's end.
  // Divinum Officium's pinned section has a 1963 rubric and optional
  // community response: select only its exact source-owned main line.
  // The R. Amen is sourced without invention from the already loaded
  // Common/Prayers#Fidelium animae response, NOT its Office versicle.
  const finalLines={},finalIncipit={
   la:/^Divínum auxílium \+ máneat semper nobíscum\.$/u,
   en:/^May the divine assistance \+ remain with us always\.$/u,
   fr:/^Que le secours divin \+ demeure toujours avec nous\.$/u
  };
  for(const l of active){
   const main=at(l,PRAYERS,"Divinum auxilium")
    .find(row=>finalIncipit[l].test(row));
   const amen=at(l,PRAYERS,"Fidelium animae")
    .find(row=>/^R\.\s/u.test(row));
   if(!main||!amen)
    throw Error("COMPLINE_1961_FINAL_ASSISTANCE_SOURCE_UNRESOLVED:"+l);
   finalLines[l]=[main,amen];
  }
  blocks.push(projectBlock("FINAL_ASSISTANCE",PRAYERS,
   "Divinum auxilium + Fidelium animae:Amen",finalLines));
  if(blocks.length!==42)throw Error("COMPLINE_REQUIRED_SEQUENCE_COUNT_CHANGED:"+blocks.length);
  const frames=[];
  blocks.forEach((b,eventIndex)=>{
   const portion=b.kind==="PSALM"||b.kind==="CANTICLE"?
    b.texts.la.length:1;
   const hymn=b.kind==="HYMN";
   const segments=hymn?
    Object.fromEntries(active.map(l=>[l,stanzas(b.texts[l])])):
    null;
   const perBlock=hymn?segments.la.length:portion;
   if(hymn&&active.some(l=>segments[l]?.length!==perBlock))
    throw Error("COMPLINE_HYMN_STANZAS_NOT_ALIGNED");
   if((b.kind==="PSALM"||b.kind==="CANTICLE")&&
     active.some(l=>b.texts[l].length!==perBlock))
    throw Error("COMPLINE_VERSE_LANGUAGES_MISALIGNED");
   for(let subIndex=0;subIndex<perBlock;subIndex++){
    const texts=Object.fromEntries(active.map(l=>[l,
     hymn?segments[l][subIndex]:
     perBlock===1?b.texts[l]:[b.texts[l][subIndex]]]));
    frames.push(Object.freeze({
     ...b,eventIndex,subIndex,subTotal:perBlock,
     focusType:hymn?"HYMN_STANZA":
      perBlock>1?(b.kind==="CANTICLE"?"MAGNIFICAT_VERSE":"PSALM_VERSE"):"WHOLE",
     label:perBlock>1?(b.kind==="CANTICLE"?"Luke 2":"Psalm")+" · "+(subIndex+1):null,
     texts:Object.freeze(texts)
    }));
   }
  });
  return Object.freeze({
   schema:psalmDay==="Sabbato"?SATURDAY_COMPLINE_PILOT_SCHEMA:FERIAL_COMPLINE_PILOT_SCHEMA,
   status:appointedDate==="2026-11-28"?
    "SOURCE_FIRST_SATURDAY_COMPLINE_RESEARCH_NOT_CERTIFIED":
    appointedDate==="2026-12-01"?
    "SOURCE_FIRST_FERIAL_TUESDAY_COMPLINE_RESEARCH_NOT_CERTIFIED":
    "SOURCE_FIRST_APPOINTED_COMPLINE_RESEARCH_NOT_CERTIFIED",
   civilDate:appointment.date,officeDate:appointment.officeDate??appointment.date,hour:"COMPLINE",
   weekday:psalmDay,civilWeekday:appointment.weekday,
   marianSection:appointment.marianSection,officeClass:appointment.officeClass,
   rubricalAppointment:appointedDate==="2026-11-28"?
    "SATURDAY_COMPLINE_AFTER_SUNDAY_FIRST_VESPERS_BR166B":
    appointedDate==="2026-12-01"?
    "ADVENT_I_FERIA_III_OFFICE_BR170_171_E":
    appointment.rubricalReason,
   sourceRevision:PIN,availableLanguages:active,
   blocks:Object.freeze(blocks),blockCount:blocks.length,
   frames:Object.freeze(frames),focusFrameCount:frames.length,
   sourceTextAltered:false,sourceDocumentsPerLanguage:4+psalmIds.length,
   firstVespersConcurrenceHandled:psalmDay==="Sabbato"||
    (appointment.officeDate??appointment.date)!==appointment.date,
   officeCompletenessCertified:false,translationApproved:false,
   rightsApproved:false,publishable:false,published:false
  });
 }catch(e){return held(String(e?.message??e),psalmDay)}
}
export function createSaturdayComplinePinnedReader({fetchSource}={}){
 return createComplinePinnedReader({fetchSource,weekday:"Sabbato"});
}
export function createFerialTuesdayComplinePinnedReader({fetchSource}={}){
 return createComplinePinnedReader({fetchSource,weekday:"Feria III"});
}
export async function assembleSaturdayComplinePilot({reader}={}){
 return assembleWeekdayComplinePilot({reader,weekday:"Sabbato"});
}
export async function assembleFerialTuesdayComplinePilot({reader}={}){
 return assembleWeekdayComplinePilot({reader,weekday:"Feria III"});
}
export async function assembleDatedComplinePilot({reader,date}={}){
 return assembleWeekdayComplinePilot({reader,date});
}

/** Source-first Latin Compline independent of uncleared translations.
 * It remains a noncertified release candidate, not a public Hour. */
export function createLatinComplinePinnedReader({fetchSource,date}={}){
 return createComplinePinnedReader({fetchSource,date,languages:LATIN_ONLY});
}
export async function assembleLatinDatedComplinePilot({reader,date}={}){
 return assembleWeekdayComplinePilot({reader,date,languages:LATIN_ONLY});
}

/**
 * Strictly private source-driven research, never imported by public Office
 * routes. Generic pinned readers still reject all Christmas dates.
 * The production release manifest independently withholds before fetch.
 */
export function createChristmas2026PrivateLatinPinnedReader({date,fetchSource}={}){
 const review=researchChristmas2026PrivateComplineAppointment(date);
 if(review.status!=="EXPLICIT_CHRISTMAS_2026_PRIVATE_SOURCE_RESEARCH")
  throw Error("CHRISTMAS_PRIVATE_RESEARCH_DATE_UNREVIEWED");
 return createComplinePinnedReader({
  date,fetchSource,languages:LATIN_ONLY,privateChristmasResearch:true
 });
}
export async function assembleChristmas2026PrivateLatinComplinePilot({reader,date}={}){
 const review=researchChristmas2026PrivateComplineAppointment(date);
 if(review.status!=="EXPLICIT_CHRISTMAS_2026_PRIVATE_SOURCE_RESEARCH")
  return held("CHRISTMAS_PRIVATE_RESEARCH_DATE_UNREVIEWED");
 return assembleWeekdayComplinePilot({
  reader,date,languages:LATIN_ONLY,privateChristmasResearch:true
 });
}

/**
 * YEAR-BOUNDARY PRIVATE RESEARCH ONLY. Intentionally separate from both
 * generic and earlier Christmas (21–27 December) reader constructors.
 * Nothing here changes public Office dates or marks a liturgy certified.
 */
export function createDec28Jan03PrivateLatinPinnedReader({date,fetchSource}={}){
 const review=researchDec28Jan03PrivateComplineAppointment(date);
 if(review.status!=="EXPLICIT_DEC28_JAN03_PRIVATE_SOURCE_RESEARCH")
  throw Error("YEAR_BOUNDARY_PRIVATE_COMPLINE_DATE_NOT_REVIEWED");
 return createComplinePinnedReader({
  date,fetchSource,languages:LATIN_ONLY,privateYearBoundaryResearch:true
 });
}
export async function assembleDec28Jan03PrivateLatinComplinePilot({reader,date}={}){
 const review=researchDec28Jan03PrivateComplineAppointment(date);
 if(review.status!=="EXPLICIT_DEC28_JAN03_PRIVATE_SOURCE_RESEARCH")
  return held("YEAR_BOUNDARY_PRIVATE_COMPLINE_DATE_NOT_REVIEWED");
 return assembleWeekdayComplinePilot({
  reader,date,languages:LATIN_ONLY,privateYearBoundaryResearch:true
 });
}

/**
 * Strictly opt-in Latin original Epiphany week source research, 4–10 Jan.
 * Not a public Office release, not a general year calendar resolver.
 * Chant tone and Holy Family doxology are still independent source holds.
 */
export function createJan04_10PrivateLatinPinnedReader({date,fetchSource}={}){
 const review=researchJan04_10PrivateComplineAppointment(date);
 if(review.status!=="EXPLICIT_EPIPHANY_2027_PRIVATE_SOURCE_RESEARCH")
  throw Error("EPIPHANY_PRIVATE_DATE_NOT_REVIEWED");
 return createComplinePinnedReader({
  date,fetchSource,languages:LATIN_ONLY,privateEpiphanyResearch:true
 });
}
export async function assembleJan04_10PrivateLatinComplinePilot({reader,date}={}){
 const review=researchJan04_10PrivateComplineAppointment(date);
 if(review.status!=="EXPLICIT_EPIPHANY_2027_PRIVATE_SOURCE_RESEARCH")
  return held("EPIPHANY_PRIVATE_DATE_NOT_REVIEWED");
 return assembleWeekdayComplinePilot({
  reader,date,languages:LATIN_ONLY,privateEpiphanyResearch:true
 });
}

/** The 11–17 January 2027 Latin source review is opt-in and never public. */
export function createJan11_17PrivateLatinPinnedReader({date,fetchSource}={}){
 const q=researchJan11_17PrivateComplineAppointment(date);
 if(q.status!=="EXPLICIT_POST_EPIPHANY_PRIVATE_SOURCE_RESEARCH")
  throw Error("JAN11_17_PRIVATE_DATE_NOT_REVIEWED");
 return createComplinePinnedReader({
  date,fetchSource,languages:LATIN_ONLY,privatePostEpiphanyResearch:true
 });
}
export async function assembleJan11_17PrivateLatinComplinePilot({reader,date}={}){
 const q=researchJan11_17PrivateComplineAppointment(date);
 if(q.status!=="EXPLICIT_POST_EPIPHANY_PRIVATE_SOURCE_RESEARCH")
  return held("JAN11_17_PRIVATE_DATE_NOT_REVIEWED");
 return assembleWeekdayComplinePilot({
  reader,date,languages:LATIN_ONLY,privatePostEpiphanyResearch:true
 });
}
