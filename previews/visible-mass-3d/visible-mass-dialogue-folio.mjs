/**
 * Small folio over original sanctuary pilot. Displays original VMQ question
 * labels from Phase 1; never copies answer prose, invents rubrics or pretends
 * a camera position is certified beyond the six source-mapped photo hotspots.
 */
import {createVisibleMassDialogueDirector} from "./visible-mass-dialogue-director.mjs";
const KEY="ao-visible-mass-visitor-trails-v1";
const el=(doc,id)=>doc.getElementById(id);
function load(win){
 try{return JSON.parse(win.sessionStorage?.getItem(KEY)||"null");}catch{return null;}
}
export function mountVisibleMassDialogueFolio(win,{graph,pilot,answerIds,navigate}){
 const doc=win.document;
 const director=createVisibleMassDialogueDirector(graph,pilot,answerIds,{initialState:load(win)});
 const registry=new Map(pilot.questions.map(q=>[q.id,q]));
 const originalObject=new Map(pilot.objects.map(o=>[o.object_id,o]));
 const dock=el(doc,"guide-dock");
 if(!dock)throw new Error("Guide folio mounting point absent");
 dock.hidden=false;
 const save=()=>{
   try{win.sessionStorage?.setItem(KEY,JSON.stringify(director.serialize()));}catch{}
 };
 const button=(label,action,{kind="",pressed=null,data=null}={})=>{
   const b=doc.createElement("button");b.type="button";b.textContent=label;
   if(kind)b.className=kind;
   if(pressed!==null)b.setAttribute("aria-pressed",String(pressed));
   if(data)b.dataset.guideQuestion=data;
   b.onclick=action;
   return b;
 };
 const go=id=>{
   const target=director.target(id);
   if(!target)return false;
   // The original pilot owns the photograph position and question display.
   // No camera or content is fabricated by the folio.
   return navigate(target.objectId,target.questionId);
 };
 function render(){
   const st=director.status();
   const routes=el(doc,"guide-routes"),actions=el(doc,"guide-actions");
   routes.replaceChildren();actions.replaceChildren();
   const toggle=el(doc,"guide-toggle");
   toggle.textContent=st.visible?"Hide guide":st.active?"Resume guide":"Choose a trail";
   toggle.setAttribute("aria-pressed",String(st.visible));
   el(doc,"guide-status").textContent="Six photographed objects · "+st.readCount+
      " questions visited · research-only, not approved instruction";
   const prompt=el(doc,"guide-prompt"),targetLabel=el(doc,"guide-target");
   prompt.hidden=false;targetLabel.hidden=true;
   // Keep alternative trails directly accessible even when a whole path is
   // dismissed. The visitor must never resume a skipped path to switch tracks.
   for(const route of st.availableRoutes){
     const action=button(route.title.en+(route.unread?"":" · nothing new"),
       ()=>{director.chooseTrail(route.id);save();render();},
       {pressed:route.id===st.active&&st.visible});
     action.dataset.trail=route.id;routes.appendChild(action);
   }
   if(!st.active||!st.visible){
     prompt.textContent=st.active?
       "Your trail is paused. Choose another path, explore freely, or resume.":
       "What would you like to investigate?";
     return;
   }
   const next=director.nextSuggestion();
   if(next){
     const source=registry.get(next.questionId);
     const obj=originalObject.get(next.objectId);
     prompt.textContent=source?.question?.en||"";
     targetLabel.textContent=(obj?.label||next.objectId)+" · "+next.questionId+
       " · research preview";
     targetLabel.hidden=false;
     actions.append(
       button("Explore this question",()=>go(next.questionId),{data:next.questionId}),
       button("Skip suggestion",()=>{director.skipSuggestion();save();render();})
     );
   }else{
     prompt.textContent="No new suggestions on this trail. Switch paths, revisit a discovery, or explore freely.";
   }
   actions.append(
     button("Skip this path",()=>{director.skipTrail();save();render();},{kind:"guide-quiet"}),
     button("Explore freely",()=>{director.leaveGuide();save();render();},{kind:"guide-quiet"})
   );
   for(const relation of director.related().slice(0,2)){
     const source=registry.get(relation.questionId);
     if(!source)continue;
     actions.append(button("A possible connection: "+source.question.en,
       ()=>go(relation.questionId),{kind:"guide-quiet",data:relation.questionId}));
   }
 }
 const toggle=el(doc,"guide-toggle");
 toggle.onclick=()=>{
   const st=director.status();
   if(!st.active){
     // The label "Choose a trail" must actually take the visitor to the
     // available trails; no inert first-visit control.
     el(doc,"guide-routes")?.querySelector?.("button")?.focus?.({preventScroll:true});
     return;
   }
   if(st.visible)director.leaveGuide();
   else director.resume();
   save();render();
 };
 render();
 return Object.freeze({
   status:()=>director.status(),
   serialize:()=>director.serialize(),
   chooseTrail(id){const ok=director.chooseTrail(id);if(ok){save();render();}return ok;},
   nextSuggestion:()=>director.nextSuggestion(),
   explore:go,
   markRead(id){const changed=director.markRead(id);if(changed){save();render();}return changed;},
   show(){const ok=director.resume();if(ok){save();render();}return ok;},
   render,
   // No review UI can cause automatic publication of the research answers.
   publication:"RESEARCH_ONLY_NEVER_PUBLICATION"
 });
}
