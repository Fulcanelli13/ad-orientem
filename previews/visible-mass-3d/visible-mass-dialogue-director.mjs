/**
 * The Visible Mass — review-only, source-ID dialogue director (slice 1).
 * No question/answer text lives here; the P1 VMQ and P1.5 answer registries
 * and the existing Mass Explorer remain the sole educational owners.
 * The slice is restricted to three objects with exact Brompton photo marks.
 */
export const GUIDED_SLICE_OBJECTS=Object.freeze(["AL01","AL06","SN02"]);
export const GUIDED_SLICE_STATE_VERSION=1;
const GRAPH_SCHEMA="AO_VISIBLE_MASS_GUIDED_TRAIL_GRAPH_RESEARCH_V1";
const OBJECTS=new Set(GUIDED_SLICE_OBJECTS);
const idIsValid=id=>typeof id==="string"&&/^VMQ-\d{4}$/.test(id);
const readonly=x=>Object.freeze(x);
const unique=a=>[...new Set(a)];
export function createVisibleMassDialogueDirector(graph,pilot,answeredIds,{initialState=null}={}){
 if(graph?.schema!==GRAPH_SCHEMA||graph?.status!=="RESEARCH_NAVIGATION_DESIGN_ONLY_NOT_PUBLICATION_NOT_A_SCRIPT"||
    pilot?.status!=="RESEARCH_ONLY_NO_PUBLICATION"||pilot?.questions?.length!==134||
    graph?.trails?.length!==4||graph?.exactPhotoBinding!=="BROMPTON_ALTAR_2019_B")
   throw new Error("Visible Mass guide source-owner gate failed");
 const sourceQuestions=new Map(pilot.questions.map(q=>[q.id,q]));
 const researched=new Set(answeredIds||[]);
 const permitted=id=>idIsValid(id)&&sourceQuestions.has(id)&&
   OBJECTS.has(sourceQuestions.get(id).primary_object_id)&&
   researched.has(id)&&!graph.heldQuestionsOnly.includes(id);
 const routes=new Map(graph.trails.map(t=>[t.id,readonly({
   id:t.id,title:t.title,
   originalStops:readonly([...t.suggested]),
   availableStops:readonly(t.suggested.filter(permitted))
 })]));
 if(routes.size!==4||[...routes.values()].some(t=>t.availableStops.length<2))throw Error("Three-photo route slice has insufficient sourced questions");
 let active=null,visible=false;
 const read=new Set();
 const skipped=new Map([...routes.keys()].map(id=>[id,new Set()]));
 const dismissed=new Set();
 let lastQuestionId=null;
 const currentRoute=()=>routes.get(active)||null;
 const nextFor=id=>{
   const route=routes.get(id);if(!route)return null;
   return route.availableStops.find(q=>!read.has(q)&&!skipped.get(id).has(q))||null;
 };
 function restore(snapshot){
   if(!snapshot||snapshot.version!==GUIDED_SLICE_STATE_VERSION)return false;
   for(const id of snapshot.read||[])if(permitted(id))read.add(id);
   for(const [key,ids] of Object.entries(snapshot.skipped||{})){
     if(!routes.has(key)||!Array.isArray(ids))continue;
     for(const id of ids)if(routes.get(key).availableStops.includes(id))skipped.get(key).add(id);
   }
   if(Array.isArray(snapshot.dismissed)){
     for(const id of snapshot.dismissed)if(routes.has(id))dismissed.add(id);
   }
   if(routes.has(snapshot.active))active=snapshot.active;
   visible=Boolean(snapshot.visible&&active);
   if(permitted(snapshot.lastQuestionId))lastQuestionId=snapshot.lastQuestionId;
   return true;
 }
 function serialize(){return readonly({
   version:GUIDED_SLICE_STATE_VERSION,
   active,visible,read:unique([...read]).sort(),
   skipped:Object.fromEntries([...skipped].map(([id,s])=>[id,[...s].sort()])),
   dismissed:[...dismissed].sort(),lastQuestionId
 });}
 function chooseTrail(id){
   if(!routes.has(id))return false;
   active=id;visible=true;dismissed.delete(id);return true;
 }
 function leaveGuide(){
   visible=false;return true;
 }
 function skipTrail(){
   if(active)dismissed.add(active);
   visible=false;return true;
 }
 function resume(){
   if(!active)return false;
   visible=true;return true;
 }
 function skipSuggestion(){
   if(!active)return false;
   const id=nextFor(active);
   if(!id)return false;
   skipped.get(active).add(id);
   return true;
 }
 function markRead(id){
   if(!permitted(id))return false;
   read.add(id);lastQuestionId=id;
   return true;
 }
 function related(id=lastQuestionId){
   if(!permitted(id))return readonly([]);
   return readonly(graph.crossovers.filter(e=>e.from===id&&
     e.status==="EDITORIAL_CONTEXTUAL_CANDIDATE_NO_PUBLICATION"&&
     permitted(e.to)&&!read.has(e.to)).slice(0,3).map(e=>readonly({
       questionId:e.to,objectId:sourceQuestions.get(e.to).primary_object_id,
       relation:e.relation,publication:"UNREVIEWED_RESEARCH_CANDIDATE"
     })));
 }
 function status(){
   const trail=currentRoute();
   return readonly({active,visible,readCount:read.size,
     nextQuestionId:active?nextFor(active):null,
     hasUnseen:active?Boolean(nextFor(active)):false,
     dismissed:readonly([...dismissed]),
     visitedQuestionIds:readonly([...read]),
     currentTrailSkipped:readonly([...(skipped.get(active)||[])]),
     lastQuestionId,
     availableRoutes:readonly([...routes.values()].map(t=>readonly({
       id:t.id,title:t.title,available:t.availableStops.length,
       unread:t.availableStops.filter(id=>!read.has(id)&&!skipped.get(t.id).has(id)).length
     })))
   });
 }
 // Exposes original question IDs only; callers read actual text directly from pilot.
 const target=id=>permitted(id)?readonly({
   questionId:id,objectId:sourceQuestions.get(id).primary_object_id,
   publication:"RESEARCH_DRAFT_NOT_PUBLISHED"
 }):null;
 if(initialState)restore(initialState);
 return readonly({status,serialize,restore,chooseTrail,leaveGuide,skipTrail,resume,skipSuggestion,markRead,related,target,
   nextSuggestion:()=>active?target(nextFor(active)):null});
}
