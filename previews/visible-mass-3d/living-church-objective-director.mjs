/**
 * Living Church character-facing adapter for Ask the Church's ORIGINAL registry.
 * Does not copy question answers, content modules, goals or theological prose.
 * Objective selection and route matching belong to PR #1391's source engine.
 */
import {createAskChurchObjectiveEngine,BRANCH_COPY} from "../../src/learn/ask-church-objective-engine.js";
const SURVEY_URL=new URL("../../data/learn/ask-church-app-route-survey.v1.json",import.meta.url);
export const LIVING_CHURCH_OBJECTIVES_VERSION="LC_ASK_CHURCH_CANONICAL_OBJECTIVES_V1";
const GUIDE_BY_BRANCH=Object.freeze({
 mass:"canon",first_mass:"canon",latin:"canon",
 eucharist:"pius-x",sacraments:"pius-x",scripture:"pius-x",
 protestant:"pius-x",critic:"pius-x",newcomer:"pius-x",
 places:"sacristan"
});
function guideFor(branch){return GUIDE_BY_BRANCH[branch]||"pius-x";}
export async function loadLivingChurchObjectives({fetchImpl=fetch,language="en"}={}){
 const response=await fetchImpl(SURVEY_URL);
 if(!response?.ok)throw Error("Canonical Ask the Church route survey unavailable");
 const survey=await response.json();
 const engine=createAskChurchObjectiveEngine(survey,{lang:language==="fr"?"fr":"en"});
 let selected=null;
 const showBranches=()=>engine.branches().map(x=>Object.freeze({id:x.id,title:x.title,guide:guideFor(x.id)}));
 const approvedTargets=()=>engine.targets().filter(x=>
    x.route?.releaseGate!=="RESEARCH_ONLY"&&
    (!x.scenario||x.scenario.publicationState==="READY_IN_RUNTIME_SOT"));
 const routeTargets=()=>approvedTargets().map(x=>x.id);
 async function digest(id,{lang=engine.snapshot().lang}={}){
  if(!selected||typeof id!=="string")return Object.freeze({ok:false,reason:"NO_ACTIVE_OBJECTIVE"});
  const target=approvedTargets().find(x=>x.id===id);
  if(!target||!selected.sourceRoutes.includes(id))return Object.freeze({ok:false,reason:"UNAPPROVED_SOURCE_TARGET"});
  // PR #1391's ORIGINAL source-owning adapter, not a copied doctrinal answer.
  const {readAskChurchDigest}=await import("../../src/learn/ask-church-source-digest.js");
  const record=await readAskChurchDigest(target,{lang:lang==="fr"?"fr":"en",situation:selected.branch});
  if(!record?.title||!record?.text)return Object.freeze({ok:false,reason:"NO_APPROVED_SOURCE_DIGEST"});
  const sources=(record.sources||[]).filter(x=>{
    try{return new URL(x.url).protocol==="https:";}catch{return false;}
  }).map(x=>Object.freeze({label:String(x.label||"Source").slice(0,150),
    locator:String(x.locator||"").slice(0,150),url:x.url})).slice(0,4);
  return Object.freeze({ok:true,id,title:String(record.title).slice(0,180),
   text:String(record.text).slice(0,1500),detail:String(record.detail||"").slice(0,2600),
   sourceStatus:String(record.sourceStatus||"").slice(0,80),
   owner:String(record.owner||"Original source owner").slice(0,100),
   sources:Object.freeze(sources)});
 }
 function choice(id){
  if(!engine.setObjective(id))return Object.freeze({ok:false,reason:"UNKNOWN_OBJECTIVE"});
  selected=null;
  return Object.freeze({ok:true,branches:showBranches()});
 }
 function branch(id){
  if(!engine.setBranch(id))return Object.freeze({ok:false,reason:"UNVERIFIED_BRANCH"});
  selected=Object.freeze({objective:engine.snapshot().objective,branch:id,
    guide:guideFor(id),title:BRANCH_COPY[id]?.[engine.snapshot().lang==="fr"?1:0]||id,
    sourceRoutes:Object.freeze(routeTargets())});
  return Object.freeze({ok:true,selection:selected});
 }
 function interpret(input){
  const result=engine.interpret(input);
  if(result.kind==="path"){
   const id=engine.snapshot().branch;
   selected=Object.freeze({objective:engine.snapshot().objective,branch:id,
    guide:guideFor(id),title:BRANCH_COPY[id]?.[engine.snapshot().lang==="fr"?1:0]||id,
    sourceRoutes:Object.freeze(routeTargets())});
   return Object.freeze({kind:"path",selection:selected});
  }
  selected=null;
  return Object.freeze({kind:result.kind,branches:result.kind==="objective"?showBranches():[]});
 }
 return Object.freeze({
  version:LIVING_CHURCH_OBJECTIVES_VERSION,
  objectives:()=>engine.objectives(),
  branches:showBranches,
  choice,branch,interpret,digest,
  snapshot:()=>Object.freeze({selection:selected,core:engine.snapshot()}),
  language:lang=>engine.language(lang),
  reset:()=>{engine.reset();selected=null;}
 });
}
