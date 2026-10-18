/**
 * St Pius X review referrals use the EXISTING 433-question witness index.
 * We never store translated answers, paraphrase doctrine or author quotations.
 * Search terms and displayed stems come directly from that source owner.
 */
export const LIVING_CHURCH_CATECHISM_SOURCE_VERSION="AO_LC_P4_PX1912_REFERRALS_V1";
export const ORIGINAL_PX1912_INDEX_URL=new URL(
 "../../data/learn/ltfaith-pius-x-en-witness-index.v1.json",import.meta.url);
export const catechismRef=number=>
 Number.isInteger(number)&&number>=1&&number<=433?
 "PX1912-Q"+String(number).padStart(3,"0"):null;
export const catechismNumber=ref=>{
 const m=/^PX1912-Q(\d{3})$/.exec(String(ref||""));
 const n=m?Number(m[1]):null;
 return Number.isInteger(n)&&n>=1&&n<=433? n:null;
};
const normalize=value=>String(value||"").normalize("NFD")
 .replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9 ]/g," ")
 .replace(/\s+/g," ").trim();
export function createOriginalCatechismReferralIndex(source){
 if(!source||!Array.isArray(source.entries)||source.entries.length!==433)
  throw Error("Exact original 433-question witness index required");
 const map=new Map();
 for(const entry of source.entries){
  if(!Number.isInteger(entry.q)||entry.q<1||entry.q>433||
     typeof entry.q_stem!=="string"||entry.q_stem.trim().length<5||
     typeof entry.source_file_url!=="string"||
     !/^https:\/\/github\.com\//.test(entry.source_file_url)||
     map.has(entry.q))throw Error("Unverified PX1912 witness entry");
  // Preserve the original English wording, including its capitalisation.
  map.set(entry.q,Object.freeze({
   number:entry.q,ref:catechismRef(entry.q),stem:entry.q_stem,
   owner:"LTFAITH_PIUS_X_EN_WITNESS",link:entry.source_file_url
  }));
 }
 if(map.size!==433||[...Array(433)].some((_,i)=>!map.has(i+1)))
  throw Error("Incomplete original Catechism index");
 const all=Object.freeze([...map.values()].sort((a,b)=>a.number-b.number));
 const search=(query,{limit=12}={})=>{
  const words=normalize(query).split(" ").filter(x=>x.length>=2).slice(0,8);
  if(!words.length)return Object.freeze([]);
  const results=all.map(item=>{
   const target=normalize(item.stem);
   let score=0;
   for(const word of words){
    if(target.includes(word))score+=target.startsWith(word)?6:3;
    else return null;
   }
   return {...item,score};
  }).filter(Boolean).sort((a,b)=>b.score-a.score||a.number-b.number)
    .slice(0,Math.min(Math.max(1,limit),30));
  return Object.freeze(results.map(({score,...item})=>Object.freeze(item)));
 };
 return Object.freeze({
  status:()=>Object.freeze({version:LIVING_CHURCH_CATECHISM_SOURCE_VERSION,
   sourceOwner:"LTFAITH_PIUS_X_EN_WITNESS",count:all.length,
   textAvailable:"ORIGINAL_ENGLISH_QUESTION_STEMS_ONLY",
   nativeAnswerOwnedBy:"AO_TRADITIONAL_CATECHISM",publication:"REVIEW_ONLY"}),
  get:number=>map.get(number)||null,
  hasRef:ref=>Number.isInteger(catechismNumber(ref))&&map.has(catechismNumber(ref)),
  search
 });
}
export async function loadOriginalCatechismReferralIndex(win=globalThis){
 const response=await win.fetch(ORIGINAL_PX1912_INDEX_URL.href);
 if(!response?.ok)throw Error("Original Catechism witness source unavailable");
 return createOriginalCatechismReferralIndex(await response.json());
}
