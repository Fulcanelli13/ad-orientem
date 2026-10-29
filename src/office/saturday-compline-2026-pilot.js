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
import {parseAdventPreviewSourceSections}
 from "./advent-first-vespers-bounded-preview-reader.js";

export const SATURDAY_COMPLINE_PILOT_SCHEMA="ao.office.2026-advent-i-saturday-compline-pilot.v1";
const BASE="https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/"+PIN+"/web/www/horas/";
const LOCALE=Object.freeze({la:"Latin",en:"English",fr:"Francais"});
const LANGS=Object.freeze(["la","en","fr"]);
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
  "Benedictio Completorium2","Benedicamus Domino","Fidelium animae"],
 [MARIAN]:["Advent"]
});
const psalmIds=[87,102,233];
const MAX_SOURCE_READS=21;
function held(reason){
 return Object.freeze({
  schema:SATURDAY_COMPLINE_PILOT_SCHEMA,status:"WITHHELD",reason,
  blocks:Object.freeze([]),frames:Object.freeze([]),
  canPreview:false,rightsApproved:false,publishable:false,published:false
 });
}
export function createSaturdayComplinePinnedReader({fetchSource}={}){
 if(typeof fetchSource!=="function")throw Error("COMPLINE_FETCH_INJECTION_REQUIRED");
 const cache=new Map();
 function url(path,language){
  if(!Object.hasOwn(LOCALE,language))
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
  const map=parseAdventPreviewSourceSections(await raw(path,language),
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
  sourceRevision:PIN,section,psalm,
  cachedDistinctFiles:()=>cache.size,maxDistinctFiles:MAX_SOURCE_READS
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
 for(const l of LANGS){
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
  const m=new RegExp("^"+number+":([0-9]+) (.+)$","u").exec(line);
  if(!m)return null;
  const label=Number(m[1]);
  if(label>=start&&label<=end)output.push(line);
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
export async function assembleSaturdayComplinePilot({reader}={}){
 if(reader?.sourceRevision!==PIN||typeof reader.section!=="function"||
    typeof reader.psalm!=="function")
  return held("PINNED_COMPLINE_READER_REQUIRED");
 const blocks=[];
 try{
  const sections={};
  const paths=Object.keys(allowed);
  // Only the four named source leaves per language plus three Psalm leaves:
  // 21 distinct original files at most; all in transient request cache.
  await Promise.all(LANGS.map(async l=>{
   sections[l]={};
   for(const path of paths){
    sections[l][path]={};
    // Read all named sections through the cached original leaf.
    for(const name of allowed[path]){
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
   for(const l of LANGS)parts[l]=selector?
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
  const sabbato={};
  for(const l of LANGS){
   const source=at(l,PSALMI,"Completorium");
   const index=source.findIndex(z=>/^Sabbato\s*=/u.test(z));
   if(index<0||!source[index+1]||
     source[index+1].replace(/\s/gu,"")!=="87,102(1-12),102(13-22)")
    throw Error("SATURDAY_PSALM_APPOINTMENT_MISSING:"+l);
   sabbato[l]=source[index].replace(/^Sabbato\s*=\s*/u,"");
  }
  blocks.push(projectBlock("ANTIPHON",PSALMI,"Completorium:Sabbato",
   Object.fromEntries(LANGS.map(l=>[l,[sabbato[l]]]))));
  for(const [number,start,end] of [[87,2,19],[102,1,12],[102,13,22]]){
   const portions={};
   for(const l of LANGS){
    const lines=betweenNumbered(sections[l].psalms[number],
     number,start,end);
    if(!lines)throw Error("COMPLINE_PSALM_PART_MISSING:"+l+":"+number);
    portions[l]=lines;
   }
   blocks.push(projectBlock("PSALM","Psalterium/Psalmorum",
    "Psalm"+number+":"+start+"-"+end,portions));
   prayer("Gloria","DOXOLOGY");
  }
  blocks.push(projectBlock("ANTIPHON",PSALMI,"Completorium:Sabbato",
   Object.fromEntries(LANGS.map(l=>[l,[sabbato[l]]]))));
  minor("Hymnus Completorium","HYMN",x=>{
   const part=stanzas(x);
   if(!part||part.length<2)throw Error("COMPLINE_HYMN_INVALID");
   return x.filter(z=>z!=="*");
  });
  minor("Completorium_","CHAPTER",x=>[x.find(z=>/^v\./u.test(z))]);
  prayer("Deo gratias","RESPONSE");
  minor("Responsory Completorium","SHORT_RESPONSORY",x=>{
   const first=x.find(z=>z.startsWith("R.br."));
   const responses=x.filter(z=>z.startsWith("R."));
   const verse=x.find(z=>z.startsWith("V."));
   if(!first||responses.length<3||!verse)
    throw Error("COMPLINE_SHORT_RESPONSORY_INVALID");
   // The original 1960 responsory has its Gloria in the middle.
   return [first,responses[0],verse,responses[1],...atPlaceholder(),responses.at(-1)];
  });
  minor("Versum 4","VERSICLE");
  minor("Ant 4","ANTIPHON");
  const nunc={};
  for(const l of LANGS){
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
  prayer("Dominus","DIALOGUE",x=>x.slice(2,4));
  prayer("Oremus","OREMUS",x=>x.slice(0,1));
  prayer("Oratio Visita_","COLLECT");
  prayer("Per Dominum","CONCLUSION");
  prayer("Dominus","DIALOGUE",x=>x.slice(2,4));
  prayer("Benedicamus Domino","DISMISSAL",x=>x.slice(0,2));
  prayer("Benedictio Completorium2","BLESSING",x=>x.slice(0,1));
  // Advent seasonal Marian antiphon: retain source-owned verse and collect;
  // do NOT infer other-season alternates. The embedded $Oremus is replaced
  // with its actual existing Common/Prayers source rather than shown raw.
  const marian={};
  for(const l of LANGS){
   const all=at(l,MARIAN,"Advent");
   const clean=all.filter(z=>!z.startsWith("$")&&z!=="_")
    .map(z=>z.replace(/^\{:S-[^:]+:\}/u,"").replace(/\{::\}/gu,"").trim());
   if(clean.length<7||clean.some(z=>!isLine(z)))
    throw Error("COMPLINE_ADVENT_MARIAN_SOURCE_UNRESOLVED:"+l);
   marian[l]=clean;
  }
  blocks.push(projectBlock("MARIAN_ANTIPHON",MARIAN,"Advent",marian));
  prayer("Fidelium animae","FINAL_RESPONSE",x=>x.slice(0,2));
  if(blocks.length!==37)throw Error("COMPLINE_REQUIRED_SEQUENCE_COUNT_CHANGED:"+blocks.length);
  const frames=[];
  blocks.forEach((b,eventIndex)=>{
   const portion=b.kind==="PSALM"||b.kind==="CANTICLE"?
    b.texts.la.length:1;
   const hymn=b.kind==="HYMN";
   const segments=hymn?
    Object.fromEntries(LANGS.map(l=>[l,stanzas(b.texts[l])])):
    null;
   const perBlock=hymn?segments.la.length:portion;
   if(hymn&&LANGS.some(l=>segments[l]?.length!==perBlock))
    throw Error("COMPLINE_HYMN_STANZAS_NOT_ALIGNED");
   if((b.kind==="PSALM"||b.kind==="CANTICLE")&&
     LANGS.some(l=>b.texts[l].length!==perBlock))
    throw Error("COMPLINE_VERSE_LANGUAGES_MISALIGNED");
   for(let subIndex=0;subIndex<perBlock;subIndex++){
    const texts=Object.fromEntries(LANGS.map(l=>[l,
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
   schema:SATURDAY_COMPLINE_PILOT_SCHEMA,
   status:"SOURCE_FIRST_SATURDAY_COMPLINE_RESEARCH_NOT_CERTIFIED",
   civilDate:"2026-11-28",officeDate:"2026-11-28",hour:"COMPLINE",
   rubricalAppointment:"SATURDAY_COMPLINE_AFTER_SUNDAY_FIRST_VESPERS_BR166B",
   sourceRevision:PIN,availableLanguages:LANGS,
   blocks:Object.freeze(blocks),blockCount:blocks.length,
   frames:Object.freeze(frames),focusFrameCount:frames.length,
   sourceTextAltered:false,sourceDocumentsPerLanguage:7,
   firstVespersConcurrenceHandled:true,
   officeCompletenessCertified:false,translationApproved:false,
   rightsApproved:false,publishable:false,published:false
  });
 }catch(e){return held(String(e?.message??e))}
}
function atPlaceholder(){return ["V. Glória Patri, et Fílio, et Spirítui Sancto."]}
