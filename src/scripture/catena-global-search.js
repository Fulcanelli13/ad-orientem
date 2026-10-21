/*
 * Opt-in cross-Gospel concordance for the Living Catena.
 * The index stores only lexical term-to-pericope locators; NO quotations.
 * A message is eligible for display only AFTER the canonical Catena loader
 * has fetched and integrity-validated its actual source chapter pack.
 */
import {CATENA_LOCAL_BASE,CATENA_SOURCE_COMMIT,loadCatenaForPassage} from "./catena-inline.js";
import {catenaSearchTerms,indexCatenaMessages,retrieveCatenaMessages} from "./catena-messenger.js";
export const CATENA_GLOBAL_SCHEMA="ao.catena.gospel-lexicon.v1";
export const CATENA_LEXICON_BASE=CATENA_LOCAL_BASE+"lexicon/";
const CENSUS=Object.freeze({
 matthew:[278,4825,"Matthew"],mark:[104,1451,"Mark"],
 luke:[245,3660,"Luke"],john:[187,2756,"John"]
});
const STORE="ao-scripture-catena-local-v1";
const memory=new Map();
const validNumber=x=>Number.isInteger(x)&&x>0&&x<201;

export function validateCatenaGospelLexicon(index,gospel){
 const count=CENSUS[gospel];
 if(!count||index?.schema!==CATENA_GLOBAL_SCHEMA||
    index.gospel!==gospel||index.sourceCommit!==CATENA_SOURCE_COMMIT||
    index.pericopeCount!==count[0]||index.fragmentCount!==count[1]||
    !Array.isArray(index.pericopes)||index.pericopes.length!==count[0]||
    !index.lexicon||typeof index.lexicon!=="object"||Array.isArray(index.lexicon))
  throw Error("INVALID_CATENA_LEXICON");
 const seen=new Set();
 for(const [id,chapter,verse] of index.pericopes){
  if(typeof id!=="string"||!id.startsWith("catena."+gospel+".")||
     seen.has(id)||!validNumber(chapter)||!validNumber(verse))
   throw Error("INVALID_CATENA_LEXICON_COORDINATES");
  seen.add(id);
 }
 return index;
}
async function readIndex(gospel,{fetcher=globalThis.fetch?.bind(globalThis),
 cacheStorage=globalThis.caches}={}){
 if(typeof fetcher!=="function")throw Error("CATENA_LEXICON_TRANSPORT_MISSING");
 const url=CATENA_LEXICON_BASE+gospel+".v1.json";
 let response=null,fromNetwork=false;
 try{
  response=await fetcher(url,{cache:"force-cache"});
  fromNetwork=Boolean(response?.ok);
 }catch{}
 if(!fromNetwork&&cacheStorage?.open){
  try{response=await(await cacheStorage.open(STORE)).match(url)}catch{}
 }
 if(!response?.ok)throw Error("CATENA_LEXICON_UNAVAILABLE");
 const index=validateCatenaGospelLexicon(await response.clone().json(),gospel);
 if(fromNetwork&&cacheStorage?.open){
  try{await(await cacheStorage.open(STORE)).put(url,response)}catch{}
 }
 return index;
}
export async function loadCatenaGospelLexicon(gospel,options={}){
 if(!CENSUS[gospel])throw Error("NOT_A_CATENA_GOSPEL");
 // Injected transports are used by deterministic tests; do not leak
 // test indexes into the production in-memory cache.
 if(options.fetcher)return readIndex(gospel,options);
 if(!memory.has(gospel))memory.set(gospel,readIndex(gospel,options)
  .catch(e=>{memory.delete(gospel);throw e}));
 return memory.get(gospel);
}
function postings(value,cap){
 if(typeof value!=="string"||!/^[0-9a-z]+(?:\.[0-9a-z]+)*$/.test(value))return [];
 return value.split(".").map(s=>parseInt(s,36)).filter(x=>Number.isSafeInteger(x)&&x>=0&&x<cap);
}
/**
 * Pure ranking over the four original Gospel indexes. Requires at least
 * two matched content words when a multiword question provides two or more.
 * A passage's high rank is evidence of literal vocabulary overlap ONLY.
 */
export function rankCatenaPassages(indexes,query,{
 currentPericopeIds=[],limit=20
}={}){
 const terms=catenaSearchTerms(query);
 if(!terms.length)return [];
 const banned=new Set(currentPericopeIds);
 const valid=indexes.filter(x=>x&&CENSUS[x.gospel]);
 const total=valid.reduce((n,x)=>n+x.pericopes.length,0);
 const scores=new Map();
 for(const term of terms){
  const postingsByGospel=[];
  let df=0;
  for(const idx of valid){
   const positions=postings(idx.lexicon?.[term],idx.pericopes.length);
   postingsByGospel.push([idx,positions]);
   df+=positions.length;
  }
  if(!df)continue;
  const weight=1+Math.log(1+total/df);
  for(const [idx,positions] of postingsByGospel)for(const i of positions){
   const p=idx.pericopes[i],id=p[0];if(banned.has(id))continue;
   if(!scores.has(id))scores.set(id,{
    id,gospel:idx.gospel,book:CENSUS[idx.gospel][2],
    chapter:p[1],verse:p[2],score:0,matched:0
   });
   const hit=scores.get(id);
   hit.matched++;hit.score+=weight;
  }
 }
 const required=terms.length>=2?2:1;
 return [...scores.values()].filter(x=>x.matched>=required)
  .sort((a,b)=>b.matched-a.matched||b.score-a.score||
    a.book.localeCompare(b.book)||a.chapter-b.chapter||a.verse-b.verse)
  .slice(0,Math.min(40,Math.max(1,limit)));
}
function namedFather(rows,query){
 const q=String(query||"").toLowerCase();
 return [...new Set(rows.map(r=>r.father))].filter(f=>
  f.length>=4&&q.includes(f.toLowerCase()));
}
/**
 * Query all four Gospel concordances and expand a bounded set of hits via
 * verified canonical chapter packs. Partial network failure is disclosed.
 * Search never introduces another edition or remote commentary provider.
 */
export async function searchCatenaAcrossGospels(question,{
 currentPericopeIds=[],currentAuthors=[],fetcher=globalThis.fetch?.bind(globalThis),
 cacheStorage=globalThis.caches,cryptoProvider=globalThis.crypto,
 limit=3
}={}){
 const terms=catenaSearchTerms(question);
 if(!terms.length)return {results:[],unavailable:[],searched:0};
 const bookNames=Object.keys(CENSUS);
 const loaded=await Promise.all(bookNames.map(async g=>{
  try{return {g,index:await loadCatenaGospelLexicon(g,{fetcher,cacheStorage})}}
  catch(error){return {g,error:String(error?.message||error)}}}));
 const indexes=loaded.filter(x=>x.index).map(x=>x.index);
 const unavailable=loaded.filter(x=>x.error).map(x=>x.g);
 if(!indexes.length)return {results:[],unavailable,searched:0};
 const authors=namedFather(currentAuthors.map(f=>({father:f})),question);
 const contentQuery=authors.length
  ?terms.filter(t=>!authors.some(f=>f.toLowerCase().includes(t))).join(" ")
  :question;
 if(!catenaSearchTerms(contentQuery).length)return {results:[],unavailable,searched:indexes.length};
 const matches=rankCatenaPassages(indexes,contentQuery,
  {currentPericopeIds,limit:24});
 const results=[],used=new Set(),target=Math.min(5,Math.max(1,limit));
 let attempts=0;
 for(const match of matches){
  if(results.length>=target||attempts>=16)break;
  attempts++;
  try{
   const sections=await loadCatenaForPassage({
    book:match.book,chapter:match.chapter,verseStart:match.verse,verseEnd:match.verse
   },{fetcher,cacheStorage,cryptoProvider});
   const original=sections.find(p=>p.id===match.id);
   if(!original||used.has(original.id))continue;
   const rows=indexCatenaMessages([original]).filter(r=>!authors.length||authors.includes(r.father));
   const hits=retrieveCatenaMessages(rows,contentQuery,{limit:1});
   if(!hits.length)continue;
   const row=hits[0];
   // All displayed text, attribution, citations and source links MUST come
   // from the integrity-checked canonical chapter pack, not the index.
   used.add(original.id);
   results.push(Object.freeze({...row,reference:original.citation,
    fromAnotherPassage:true}));
  }catch{unavailable.push(match.gospel)}
 }
 return {results,unavailable:[...new Set(unavailable)],searched:indexes.length};
}
