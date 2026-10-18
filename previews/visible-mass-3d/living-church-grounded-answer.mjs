/**
 * P7 source-grounded answer pilot for the Canon. Not an LLM.
 * ONLY returns original READY Apostolate text/explanation read at request-time.
 * Mass Explorer and Mass Formation editorial study-release manifests are explicitly empty;
 * they are never used for answers, nor are unpublished research files.
 */
import {createAskChurchObjectiveEngine} from "../../src/learn/ask-church-objective-engine.js";
import {readAskChurchDigest} from "../../src/learn/ask-church-source-digest.js";
import {loadFormationP1Evidence} from "./living-church-formation-p1-evidence.mjs";
export const LIVING_CHURCH_GROUNDED_ANSWER_VERSION="AO_LC_P7_EXTRACTIVE_V1";
const SURVEY_URL=new URL("../../data/learn/ask-church-app-route-survey.v1.json",import.meta.url);
const RELEASE_URLS=[
 new URL("../../data/learn/mass-explorer-approved-studies.v1.json",import.meta.url),
 new URL("../../data/learn/mass-formation-approved-passages.v1.json",import.meta.url)
];
const okUrl=s=>{try{const u=new URL(s);return u.protocol==="https:"?u.href:null;}catch{return null;}};
const clean=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
const no=(code,lang)=>Object.freeze({ok:false,code,
 text:lang==="fr"?
  "Je ne dispose pas ici d'un texte approuvé suffisant pour répondre précisément. Consultez le module original ou précisez votre question.":
  "I do not have a sufficiently approved source passage to answer that precisely here. Consult the original module or narrow the question.",
 citations:[],mode:"SOURCE_GAP"});
const patterns=Object.freeze([
 {id:"apostolate:AQ04",rx:/\b(second sacrifice|sacrifice jesus again|sacrifice christ again|sacrifice again|repeat(ed)? sacrifice|re.?sacrific\w*|calvary|die again|another death|unbloody|calvaire|nouvelle mort|seconde mort|sacrifie.*une nouvelle fois|offrande sanglante)\b/},
 {id:"apostolate:AQ05",rx:/\b(transubstantiation|real presence|body and blood|bread (become|turn|really)|bread and wine|substance|species|truly present|really jesus|host becomes|eucharist|realite|presence reelle|substance|pain|vin|corps du christ|transsubstantiation|especes|eucharistie)\b/}
]);
function choose(input,previous){
 const q=clean(input).trim();
 if(q.length<3||q.length>320)return null;
 if(/^(why\??|how so\??|explain more\??|tell me more\??|pourquoi\??|expliquez\??)$/.test(q))
  return previous?.id||null;
 const matches=patterns.filter(p=>p.rx.test(q));
 // A compound question is ambiguous; do not merge theological claims.
 return matches.length===1?matches[0].id:null;
}
export async function loadCanonGroundedAnswers({fetchImpl=fetch,readDigest=readAskChurchDigest,lang="en"}={}){
 const language=lang==="fr"?"fr":"en";
 const [surveyResponse,...releaseResponses]=await Promise.all([
  fetchImpl(SURVEY_URL),...RELEASE_URLS.map(u=>fetchImpl(u))
 ]);
 if(!surveyResponse?.ok||releaseResponses.some(x=>!x?.ok))
  throw Error("Required original routing or release manifest missing");
 const [survey,...releases]=await Promise.all([surveyResponse.json(),...releaseResponses.map(x=>x.json())]);
 // If the editorial release regime changes, require a new review rather than silently
 // widening the conversation's evidence set.
 if(releases[0]?.schema!=="ao-mass-explorer-study-publication-v1"||
    releases[1]?.schema!=="ao-formation-approved-passages-v1"||
    releases[0]?.status!=="NO_APPROVED_STUDIES"||
    releases[1]?.status!=="NO_APPROVED_PASSAGES")
  throw Error("Mass editorial release status changed; new review required");
 const formationP1=await loadFormationP1Evidence({fetchImpl,lang:language});
 const router=createAskChurchObjectiveEngine(survey,{lang:language});
 if(!router.setObjective("practice")||!router.setBranch("eucharist"))
  throw Error("Original Ask the Church Eucharistic objective missing");
 const eligible=new Map(router.targets().filter(t=>t.scenario?.publicationState==="READY_IN_RUNTIME_SOT"&&
  t.route?.releaseGate!=="RESEARCH_ONLY").map(t=>[t.id,t]));
 for(const id of patterns.map(x=>x.id))if(!eligible.has(id))throw Error("Canonical Eucharist answer unavailable: "+id);
 let previous=null;
 async function answer(question,{guide="canon"}={}){
  if(guide!=="canon")return no("WRONG_GUIDE",language);
  const id=choose(question,previous);
  if(!id||!eligible.has(id)){
    previous=null;
    const existing=formationP1.answer(question);
    return existing.ok?existing:no("NOT_SUPPORTED_BY_APPROVED_CORPUS",language);
   }
  try{
   const record=await readDigest(eligible.get(id),{lang:language,situation:"eucharist"});
   if(!record?.text||record.sourceStatus!=="READY_IN_RUNTIME_SOT"||record.owner!=="Apostolate")
    return no("SOURCE_NOT_PUBLISHED",language);
   const citations=(record.sources||[]).map(x=>({label:String(x.label||"Source").slice(0,180),
    locator:String(x.locator||"").slice(0,180),url:okUrl(x.url)}))
    .filter(x=>x.url).slice(0,4);
   if(!citations.length)return no("NO_VERIFIED_SOURCE_LINKS",language);
   const followup=/^(why\??|how so\??|explain more\??|tell me more\??|pourquoi\??|expliquez\??)$/.test(clean(question).trim());
   const passage=followup?record.detail:record.text;
   if(!passage)return no("NO_SOURCE_EXPLANATION",language);
   previous=Object.freeze({id});
   return Object.freeze({
    ok:true,mode:"VERBATIM_APPROVED_SOURCE",owner:"Apostolate",id,
    title:String(record.title||id),text:String(passage),
    citations:Object.freeze(citations.map(x=>Object.freeze(x))),
    detailAvailable:!followup&&Boolean(record.detail),
    wordingOrigin:"ORIGINAL_MODULE_NOT_CHARACTER_QUOTATION",
    publication:"REVIEW_ONLY"
   });
  }catch{return no("SOURCE_RETRIEVAL_FAILED",language);}
 }
 return Object.freeze({
  version:LIVING_CHURCH_GROUNDED_ANSWER_VERSION,answer,
  status:()=>Object.freeze({eligibleIds:Object.freeze([...eligible.keys()]),previousSourceId:previous?.id||null,
    hasLLM:false,massExplorerStudiesPublished:false,massFormationPassagesPublished:false,
    formationP1:formationP1.audit()}),
  clear:()=>{previous=null;}
 });
}
