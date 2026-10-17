/**
 * Optional documentary guide in the existing source-owned sanctuary viewer.
 * Non-linear visual-novel pacing comes from observations and choices, not
 * fictional theological dialogue, a new answer owner or historical roleplay.
 */
import {createVisibleMassDialogueDirector} from "./visible-mass-dialogue-director.mjs";
import {
 VISIBLE_MASS_BEATS,VISIBLE_MASS_PATH_OPENINGS,
 VISIBLE_MASS_PRIORITY_CROSSOVERS,validateVisibleMassBeats
} from "./visible-mass-narrative-beats.mjs";
const KEY="ao-visible-mass-visitor-trails-v1";
const INTRO_KEY="ao-visible-mass-visitor-introductions-v1";
const el=(doc,id)=>doc.getElementById(id);
function load(win,key){
 try{return JSON.parse(win.sessionStorage?.getItem(key)||"null");}catch{return null;}
}
export function mountVisibleMassDialogueFolio(win,{graph,pilot,answerIds,navigate,
 onPreview=null,onModeChange=()=>{}}){
 const contract=validateVisibleMassBeats(graph,pilot,answerIds);
 const doc=win.document;
 const director=createVisibleMassDialogueDirector(graph,pilot,answerIds,{initialState:load(win,KEY)});
 const questions=new Map(pilot.questions.map(q=>[q.id,q]));
 const objects=new Map(pilot.objects.map(o=>[o.object_id,o]));
 const strong=new Set(VISIBLE_MASS_PRIORITY_CROSSOVERS.map(x=>x.from+">"+x.to));
 const dock=el(doc,"guide-dock");
 if(!dock)throw new Error("Visible Mass contextual guide surface absent");
 dock.hidden=false;
 const priorIntroductions=load(win,INTRO_KEY);
 const introduced=new Set(Array.isArray(priorIntroductions)?priorIntroductions.filter(id=>
   graph.trails.some(t=>t.id===id)):[]);
 let newlyIntroduced=null;
 const store=(key,value)=>{
   try{win.sessionStorage?.setItem(key,JSON.stringify(value));}catch{}
 };
 const save=()=>{
   store(KEY,director.serialize());
   store(INTRO_KEY,[...introduced]);
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
   newlyIntroduced=null;
   // Original photograph and original VMQ question detail own the destination.
   // Navigating is not equivalent to reading.
   return navigate(target.objectId,target.questionId);
 };
 function chooseTrail(id){
   const ok=director.chooseTrail(id);
   if(!ok)return false;
   newlyIntroduced=introduced.has(id)?null:id;
   introduced.add(id);
   save();render();onModeChange("discover");
   return true;
 }
 function alternatives(st,next){
   const sources=[next?.questionId,st.lastQuestionId].filter(Boolean);
   const used=new Set();
   const found=[];
   for(const sourceId of sources){
     for(const relation of director.related(sourceId)){
       if(!strong.has(sourceId+">"+relation.questionId)||
          used.has(relation.questionId)||relation.questionId===next?.questionId)continue;
       used.add(relation.questionId);
       found.push(relation);
       if(found.length===2)return found;
     }
   }
   return found;
 }
 function render(){
   const st=director.status(),routes=el(doc,"guide-routes"),actions=el(doc,"guide-actions");
   routes.replaceChildren();actions.replaceChildren();
   const toggle=el(doc,"guide-toggle");
   toggle.textContent=st.visible?"Hide guide":st.active?"Resume guide":"Choose a trail";
   toggle.setAttribute("aria-pressed",String(st.visible));
   el(doc,"guide-status").textContent="Six original photo objects · "+
     st.readCount+" questions explored · unapproved research preview";
   const prompt=el(doc,"guide-prompt"),targetLabel=el(doc,"guide-target");
   const opening=el(doc,"guide-opening");
   prompt.hidden=false;targetLabel.hidden=true;
   if(opening){
     opening.hidden=!st.visible||!newlyIntroduced;
     opening.textContent=newlyIntroduced?VISIBLE_MASS_PATH_OPENINGS[newlyIntroduced]:"";
   }
   // All four paths remain selectable, even when the visitor abandons one.
   for(const route of st.availableRoutes){
     const action=button(route.title.en+(route.unread?"":" · explored"),
       ()=>chooseTrail(route.id),
       {pressed:route.id===st.active&&st.visible});
     action.dataset.trail=route.id;routes.appendChild(action);
   }
   if(!st.active||!st.visible){
     prompt.textContent=st.active?
       "Your guide is paused. Choose another trail or continue exploring the photograph.":
       "Where would you like to begin? Choose a curiosity, or inspect the photograph freely.";
     return;
   }
   const next=director.nextSuggestion();
   if(next){
     const source=questions.get(next.questionId),obj=objects.get(next.objectId);
     const beat=VISIBLE_MASS_BEATS[next.questionId];
     if(!source||!beat)throw Error("Source-bound dialogue beat absent "+next.questionId);
     prompt.textContent=beat.observation;
     targetLabel.textContent=source.question.en;
     targetLabel.hidden=false;
     actions.append(button("Investigate this question",()=>go(next.questionId),
       {kind:"guide-primary",data:next.questionId}));
     if(typeof onPreview==="function"){
       const focus=button("Locate in photograph",()=>{
         const chosen=director.target(next.questionId);
         if(chosen)onPreview(chosen.objectId);
       },{kind:"guide-photo"});
       focus.dataset.guidePreview=next.objectId;
       focus.title="Find the actual photographed object without opening its answer";
       actions.append(focus);
     }
     actions.append(button("Skip suggestion",()=>{
       director.skipSuggestion();newlyIntroduced=null;save();render();
     },{kind:"guide-quiet"}));
   }else{
     prompt.textContent="There are no new suggestions on this trail. The church remains open for further exploration.";
   }
   const options=alternatives(st,next);
   if(options.length){
     const title=doc.createElement("p");title.className="guide-option-title";
     title.textContent="Or follow another clue";
     actions.append(title);
     for(const option of options){
       const q=questions.get(option.questionId);
       if(!q)continue;
       actions.append(button(q.question.en,()=>go(option.questionId),
         {kind:"guide-alternative",data:option.questionId}));
     }
   }
   const exits=doc.createElement("div");exits.className="guide-exits";
   exits.append(
     button("Skip this path",()=>{
       director.skipTrail();newlyIntroduced=null;save();render();onModeChange("explore");
     },{kind:"guide-quiet"}),
     button("Explore freely",()=>{
       director.leaveGuide();newlyIntroduced=null;save();render();onModeChange("explore");
     },{kind:"guide-quiet"})
   );
   actions.append(exits);
 }
 const toggle=el(doc,"guide-toggle");
 toggle.onclick=()=>{
   const st=director.status();
   if(!st.active){
     el(doc,"guide-routes")?.querySelector?.("button")?.focus?.({preventScroll:true});
     return;
   }
   newlyIntroduced=null;
   if(st.visible){director.leaveGuide();onModeChange("explore");}
   else {director.resume();onModeChange("discover");}
   save();render();
 };
 render();
 return Object.freeze({
   status:()=>director.status(),
   serialize:()=>director.serialize(),
   chooseTrail,
   nextSuggestion:()=>director.nextSuggestion(),
   explore:go,
   markRead(id){
     const changed=director.markRead(id);
     if(changed){newlyIntroduced=null;save();render();}
     return changed;
   },
   show(){
     const ok=director.resume();
     if(ok){newlyIntroduced=null;save();render();}
     return ok;
   },
   hide(){director.leaveGuide();newlyIntroduced=null;save();render();return true;},
   render,contract,
   publication:"RESEARCH_ONLY_NEVER_PUBLICATION"
 });
}
