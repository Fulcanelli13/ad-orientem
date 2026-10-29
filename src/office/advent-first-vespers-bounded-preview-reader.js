/**
 * Bounded pinned read-through for the ONE non-public Advent I 2026 preview.
 * No auto-date loop, no annual corpus, no fallback host/locale, no service,
 * no persistence. This is NOT the release-approved Office source transport.
 *
 * Input fetchSource is the host's already-installed fetch. Raw source leaves
 * are cached only for this in-memory session; repeated Vespers sections share
 * the same original upstream file.
 */
import {DIVINUM_OFFICIUM_PIN as PIN} from "../app/source-transport-compat.js";
const BASE="https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/"+PIN+"/web/www/horas/";
const PATHS=new Set([
 "Tempora/Adv1-0","Psalterium/Psalmi/Psalmi major",
 "Psalterium/Special/Major Special",
 "Psalterium/Common/Prayers"
]);
const PSALMS=new Set([143,144,232]);
const SECTIONS=Object.freeze({
 "Tempora/Adv1-0":new Set([
  "Ant Vespera","Ant Laudes","Capitulum Laudes","Ant 1","Oratio","Versum 1"
 ]),
 "Psalterium/Psalmi/Psalmi major":new Set(["Day6 Vespera"]),
 "Psalterium/Special/Major Special":new Set([
  "Hymnus Adv Vespera","Adv Versum 3"
 ]),
 "Psalterium/Common/Prayers":new Set([
  "Pater noster","Ave Maria","Deus in adjutorium",
  "Alleluia","Dominus","Benedicamus Domino",
  "Fidelium animae","Gloria","Deo gratias","Qui vivis","Oremus"
 ])
});
const LANGS={la:"Latin",en:"English",fr:"Francais"};
const NORMAL=/^\[([A-Za-z][A-Za-z0-9_. -]{0,100})\]\s*$/u;
export const ADVENT_FIRST_VESPERS_BOUNDED_SOURCE_SCHEMA=
 "ao.office.advent-i-2026-private-pinned-reader.v1";
export function parseAdventPreviewSourceSections(text,allowed){
 if(!(allowed instanceof Set)||allowed.size<1||allowed.size>20)
  throw Error("PRIVATE_PREVIEW_SECTION_ALLOWLIST_REQUIRED");
 if(typeof text!=="string"||text.length<40||text.length>320000)
  throw Error("PRIVATE_PREVIEW_RAW_SECTION_FILE_INVALID");
 const map=new Map();
 let section=null;
 for(const line of text.replace(/\r\n?/gu,"\n").split("\n")){
  const header=NORMAL.exec(line);
  if(header){
   section=allowed.has(header[1])?header[1]:null;
   if(section!==null){
    if(map.has(section))throw Error("PRIVATE_PREVIEW_DUPLICATED_SECTION:"+section);
    map.set(section,[]);
   }
   continue;
  }
  // Qualifier-headed alternate sections must never leak into a prior
  // unqualified section or silently override it.
  if(/^\[[^\]]+\]\s+\(/u.test(line)){section=null;continue}
  if(section!==null&&line.trim())map.get(section).push(line.trim());
 }
 if([...allowed].some(key=>!map.has(key)))
  throw Error("PRIVATE_PREVIEW_REQUIRED_SOURCE_SECTION_MISSING");
 return map;
}
export function createAdventFirstVespersBoundedPinnedReader({
 fetchSource,maxFiles=23
}={}){
 if(typeof fetchSource!=="function"||
    !Number.isInteger(maxFiles)||maxFiles<1||maxFiles>23)
  throw Error("PRIVATE_PREVIEW_FETCH_CONFIGURATION_INVALID");
 const cache=new Map();
 function urlFor(path,lang){
  if(path==="Ordinarium/Vespera"&&lang==="original")
   return BASE+"Ordinarium/Vespera.txt";
  if(!Object.hasOwn(LANGS,lang))throw Error("PRIVATE_PREVIEW_LANGUAGE_NOT_ALLOWED");
  if(PATHS.has(path))return BASE+LANGS[lang]+"/"+path+".txt";
  const m=/^Psalterium\/Psalmorum\/Psalm([0-9]{3})$/u.exec(path);
  if(m&&PSALMS.has(Number(m[1])))
   return BASE+LANGS[lang]+"/"+path+".txt";
  throw Error("PRIVATE_PREVIEW_SOURCE_OUTSIDE_FINITE_ALLOWLIST");
 }
 async function raw(path,lang){
  const url=urlFor(path,lang);
  if(!cache.has(url)){
   if(cache.size>=maxFiles)
    throw Error("PRIVATE_PREVIEW_SOURCE_READ_BUDGET_EXCEEDED");
   const request=Promise.resolve().then(()=>fetchSource(url,Object.freeze({
    method:"GET",mode:"cors",credentials:"omit",
    redirect:"error",referrerPolicy:"no-referrer",cache:"no-store"
   }))).then(async response=>{
    if(response?.ok!==true||response?.status!==200||
       (response.url&&response.url!==url)||
       typeof response.text!=="function")
     throw Error("PRIVATE_PREVIEW_PINNED_SOURCE_READ_FAILED");
    const v=await response.text();
    if(typeof v!=="string"||v.length>320000||v.length<20)
     throw Error("PRIVATE_PREVIEW_SOURCE_SIZE_INVALID");
    return v;
   });
   cache.set(url,request);
   request.catch(()=>{if(cache.get(url)===request)cache.delete(url)});
  }
  return cache.get(url);
 }
 async function readSource(path,language){
  if(!PATHS.has(path))
   throw Error("PRIVATE_PREVIEW_NAMED_SECTION_PATH_NOT_ALLOWED");
  const map=parseAdventPreviewSourceSections(await raw(path,language),SECTIONS[path]);
  return Object.freeze({sourceRevision:PIN,sourcePath:path,language,map});
 }
 async function readPsalmSource(path,language){
  if(!/^Psalterium\/Psalmorum\/Psalm(?:143|144)$/u.test(path))
   throw Error("PRIVATE_PREVIEW_SATURDAY_PSALM_PATH_NOT_ALLOWED");
  return Object.freeze({
   sourceRevision:PIN,sourcePath:path,language,
   text:await raw(path,language)
  });
 }
 async function readCanticleSource(path,language){
  if(path!=="Psalterium/Psalmorum/Psalm232")
   throw Error("PRIVATE_PREVIEW_CANTICLE_PATH_NOT_ALLOWED");
  return Object.freeze({
   sourceRevision:PIN,sourcePath:path,language,
   text:await raw(path,language)
  });
 }
 async function readOrdinaryText(path){
  if(path!=="Ordinarium/Vespera")throw Error("PRIVATE_PREVIEW_ORDINARY_PATH_NOT_ALLOWED");
  return raw(path,"original");
 }
 return Object.freeze({
  schema:ADVENT_FIRST_VESPERS_BOUNDED_SOURCE_SCHEMA,
  sourceRevision:PIN,readSource,readPsalmSource,
  readCanticleSource,readOrdinaryText,
  cachedDistinctFiles:()=>cache.size,
  maxSourceReads:maxFiles,
  calendarDiscovery:false,annualArchive:false,
  sourceTextPublished:false
 });
}
