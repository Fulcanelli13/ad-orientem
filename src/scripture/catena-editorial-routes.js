/*
 * Research-only modern reader-question navigation.
 * The corpus remains the sole source for displayed Father-attributed words.
 * These research mappings are NOT approval for publication or theological claims.
 */
import {loadCatenaForPassage,CATENA_SOURCE_COMMIT} from "./catena-inline.js";
export const CATENA_EDITORIAL_ROUTE_URL=new URL("../../data/scripture/catena/editorial-matthew-routes.v1.json",import.meta.url).href;
const SKIP=new Set("a an and are as at be by can did do does for from had has have how in into is it its of on or our should that the their them this those to was were what when where which who why will with would about mean meaning called between through".split(" "));
function words(value){
 const text=String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
 return [...new Set((text.match(/[a-z]{4,}/g)||[]).filter(w=>!SKIP.has(w)).map(w=>{
  if(w==="jesus"||w==="jesu")return "christ";
  if(w==="apostles")return "apostle";
  if(w==="fathers")return "father";
  if(w==="genealogies")return "genealogy";
  if(w.endsWith("ies")&&w.length>=7)return w.slice(0,-3)+"y";
  if(w.endsWith("s")&&w.length>5&&!w.endsWith("ss"))return w.slice(0,-1);
  return w;
 }))];
}
export function parseMatthewEditorialReference(input){
 const q=String(input||"").trim();
 if(/\b(mark|luke|john)\s+\d{1,2}:\d{1,3}/i.test(q))return {invalid:true,ref:null,remainder:q};
 const match=/\b(?:(matthew|matt|mt)\.?\s+)?(\d{1,2}):(\d{1,3})(?:\s*[-–]\s*(\d{1,3}))?\b/i.exec(q);
 if(!match)return {invalid:false,ref:null,remainder:q};
 if(!match[1]&&q!==match[0])return {invalid:true,ref:null,remainder:q};
 const chapter=Number(match[2]),first=Number(match[3]),last=Number(match[4]||match[3]);
 if(chapter<1||chapter>28||first<1||last<first||last>200||last-first>30)
  return {invalid:true,ref:null,remainder:q};
 return {invalid:false,ref:{chapter,first,last},remainder:(q.slice(0,match.index)+" "+q.slice(match.index+match[0].length)).trim()};
}
export function validateCatenaEditorialRoutes(data){
 if(data?.schema!=="ao.catena.matthew-editorial-routes.v1"||data.sourceCommit!==CATENA_SOURCE_COMMIT||
  data.researchCommit!=="5e8406758f8126fc369f97e4a60c5d2c7e97de0c"||
  data.status!=="research_only_no_human_signoff"||
  data.records?.length!==192||data.groups?.length!==31||
  data.reviewedCount!==192||data.groupCount!==31)
   throw new Error("CATENA_EDITORIAL_ROUTES_INVALID");
 const seen=new Map();
 for(const r of data.records){
  if(!/^catena\.matthew\.\d{1,2}\.\d{1,3}:\d+$/.test(r.sourcePointer)||
   seen.has(r.sourcePointer)||!r.inheritedFatherLabel?.trim()||
   !Number.isInteger(r.sourceCharacterCount)||r.sourceCharacterCount<10||
   !Array.isArray(r.modernReaderQuestions)||!r.modernReaderQuestions.length||
   !r.modernReaderQuestions.every(q=>typeof q==="string"&&q.endsWith("?"))||
   !Array.isArray(r.verseKeys)||!r.verseKeys.length||
   !r.verseKeys.every(k=>/^matthew\/\d{1,2}\/\d{1,3}$/.test(k))||
   typeof r.mixedAuthor!=="boolean"||typeof r.parallelReviewDisagreement!=="boolean"||
   r.humanApproved!==false||r.publicationEligibility!=="blocked_research_only")
   throw new Error("CATENA_EDITORIAL_POINTER_INVALID");
  seen.set(r.sourcePointer,r);
 }
 for(const g of data.groups){
  if(!g.modernEditorialReaderQuestion?.endsWith("?")||
   !Array.isArray(g.sourcePointers)||g.sourcePointers.length<2||
   g.sourcePointers.some(p=>!seen.has(p))||
   g.publicationEligibility!=="blocked_research_only"||g.humanApproved!==false)
   throw new Error("CATENA_EDITORIAL_GROUP_INVALID");
 }
 return Object.freeze({data,byPointer:seen});
}
let routePromise;
export async function loadCatenaEditorialRoutes({fetcher=globalThis.fetch?.bind(globalThis)}={}){
 if(typeof fetcher!=="function")throw new Error("CATENA_EDITORIAL_FETCH_UNAVAILABLE");
 if(!routePromise){
  routePromise=(async()=>{
   const response=await fetcher(CATENA_EDITORIAL_ROUTE_URL,{cache:"force-cache"});
   if(!response?.ok)throw new Error("CATENA_EDITORIAL_INDEX_UNAVAILABLE");
   return validateCatenaEditorialRoutes(await response.json());
  })().catch(err=>{routePromise=null;throw err});
 }
 return routePromise;
}
function supported(query,candidate){
 const asked=words(query),target=new Set(words(candidate));
 if(!asked.length)return null;
 const present=asked.filter(t=>target.has(t));
 if(present.length<2 && !(asked.length===1&&asked[0].length>=5&&present.length===1))return null;
 if(asked.length>=3&&present.length/asked.length<0.65)return null;
 // Names of contemporary technologies in an otherwise biblical question
 // must not be silently ignored as though Fathers addressed them.
 if(asked.some(t=>t.length>=8&&!target.has(t)))return null;
 return present.length*20+Math.round(100*present.length/asked.length);
}
export function discoverCatenaEditorialRoutes(registry,query="",{currentPericopeIds=[],limit=12}={}){
 if(!registry?.byPointer)return [];
 const parsed=parseMatthewEditorialReference(query);
 if(parsed.invalid)return [];
 const verseWanted=parsed.ref&&new Set(Array.from({length:parsed.ref.last-parsed.ref.first+1},
  (_,i)=>"matthew/"+parsed.ref.chapter+"/"+(parsed.ref.first+i)));
 const current=new Set(currentPericopeIds);
 const remaining=parsed.remainder.replace(/[?!.,;:]+/g," ").trim();
 if(!verseWanted&&!remaining.trim()&&!current.size)return [];
 function eligible(p){
  const r=registry.byPointer.get(p);if(!r)return false;
  if(verseWanted&&!r.verseKeys.some(k=>verseWanted.has(k)))return false;
  if(!verseWanted&&!remaining.trim()&&current.size&&
    !current.has(p.slice(0,p.lastIndexOf(":"))))return false;
  return true;
 }
 const found=[];
 for(const g of registry.data.groups){
  const matches=g.sourcePointers.filter(eligible);
  if(!matches.length)continue;
  const score=remaining?supported(remaining,g.modernEditorialReaderQuestion):0;
  if(remaining&&score===null)continue;
  found.push({kind:"comparison",id:g.routeId,question:g.modernEditorialReaderQuestion,
   sourcePointers:matches,score:score+12,relation:g.relation,caution:g.caution,approved:false});
 }
 for(const r of registry.data.records){
  if(!eligible(r.sourcePointer))continue;
  const opts=remaining?r.modernReaderQuestions.map(q=>({q,score:supported(remaining,q)}))
   .filter(x=>x.score!==null).sort((a,b)=>b.score-a.score):[{q:r.modernReaderQuestions[0],score:0}];
  if(!opts.length)continue;
  found.push({kind:"single",id:r.sourcePointer,question:opts[0].q,
   sourcePointers:[r.sourcePointer],score:opts[0].score,approved:false});
 }
 found.sort((a,b)=>b.score-a.score||((a.kind==="comparison"?0:1)-(b.kind==="comparison"?0:1))||
  a.question.localeCompare(b.question));
 return found.slice(0,Math.min(20,Math.max(1,limit)));
}
export async function retrieveCatenaEditorialPassages(registry,route,{
 loader=loadCatenaForPassage,fetcher=globalThis.fetch?.bind(globalThis),
 cacheStorage=globalThis.caches,cryptoProvider=globalThis.crypto
}={}){
 if(!registry?.byPointer||route?.approved!==false||
  !Array.isArray(route.sourcePointers)||route.sourcePointers.length>8)
  throw new Error("CATENA_EDITORIAL_ROUTE_UNVERIFIED");
 const output=[];
 for(const ptr of route.sourcePointers){
  const r=registry.byPointer.get(ptr);
  if(!r)throw new Error("CATENA_UNKNOWN_EDITORIAL_POINTER");
  const key=r.verseKeys[0],m=/^matthew\/(\d+)\/(\d+)$/.exec(key);
  if(!m)throw new Error("CATENA_EDITORIAL_VERSE_INVALID");
  const selections=await loader({book:"Matthew",chapter:Number(m[1]),verseStart:Number(m[2]),verseEnd:Number(m[2])},
    {fetcher,cacheStorage,cryptoProvider});
  const pericope=ptr.slice(0,ptr.lastIndexOf(":")),ordinal=Number(ptr.slice(ptr.lastIndexOf(":")+1));
  const section=selections.find(s=>s.id===pericope);
  const segment=section?.segments?.[ordinal];
  if(!segment||segment.father!==r.inheritedFatherLabel||
   segment.text.length!==r.sourceCharacterCount||
   !/^https:\/\/www\.ecatholic2000\.com\//.test(section.source?.url||""))
   throw new Error("CATENA_EDITORIAL_CANONICAL_PARITY_FAILURE");
  output.push(Object.freeze({id:ptr,pericopeId:pericope,ordinal:ordinal+1,
   father:segment.father,text:segment.text,citation:section.citation,sourceUrl:section.source.url,
   reference:section.citation,editorialResearchLead:true,editorialQuestion:route.question}));
 }
 return output;
}
