/**
 * P2 Living Church visual-novel overlay. Opt-in review only.
 * Content and return navigation remain owned by Visible Mass, Mass Explorer and Catechism.
 */
import {createLivingChurchConversationTrail} from "./living-church-conversation-trail.mjs";
export const LIVING_CHURCH_SCENE_VERSION="AO_LIVING_CHURCH_SCENE_P2";
const roles={
 sacristan:{name:"The Sacristan",role:"Explore the Church",stem:"sacristan"},
 canon:{name:"Monsieur le Chanoine",role:"Understand the Mass",stem:"canon"},
 "pius-x":{name:"St Pius X",role:"Learn the Faith",stem:"pius"}
};
const scripts={
 welcome:["sacristan","welcoming","Welcome. You may explore the church freely, or I can show you the altar and objects used at Mass.",[["Show me the altar","altar"],["Speak to the Canon","canon"],["Consult St Pius X","pius"]]],
 altar:["sacristan","explaining","Let us begin at the altar. You may inspect its original photographed objects or ask the Canon about the sacrifice of the Mass.",[["Open original altar object","object"],["Ask the Canon","sacrifice"],["Return","welcome"]]],
 object:["sacristan","thoughtful","The existing Visible Mass registry owns the altar crucifix entry. We should open its original record, not invent a second description.",[["View original object","source-object"],["Ask about the Mass","sacrifice"]]],
 canon:["canon","welcoming","I can guide you through the prayers, ceremonies and theological significance of the traditional Roman Mass.",[["Eucharistic sacrifice","sacrifice"],["The Roman Canon","roman-canon"],["St Pius X and doctrine","pius"]]],
 sacrifice:["canon","explaining","The Mass Explorer owns the source-backed theological exposition. For the Real Presence in catechetical terms, I can refer you to St Pius X.",[["Ask St Pius X","real-presence"],["Mass Explorer","source-mass"],["Return to altar","altar"]]],
 "roman-canon":["canon","thoughtful","The Roman Canon should be studied with its original prayer text in Mass Explorer. No new liturgical explanation is published here.",[["Mass Explorer","source-mass"],["Back to Mass questions","canon"]]],
 pius:["pius-x","neutral","This is a historical educational presentation, not St Pius X literally speaking. His original Catechism text must be distinguished from our dialogue framing.",[["Holy Eucharist","real-presence"],["Return to the Canon","canon"],["Return to the church","welcome"]]],
 "real-presence":["pius-x","explaining","Open the canonical St Pius X Catechism to read its original teaching about the Real Presence. This prototype will not invent quotations.",[["Open Catechism","source-catechism"],["Ask Canon about liturgy","sacrifice"],["Return to Sacristan","altar"]]],
 unknown:[null,"thoughtful","This question requires a source-backed answer. In this preview, select the appropriate original guide or registry rather than accepting a guess.",[["Church objects","altar"],["Mass theology","canon"],["Catechism","pius"]]]
};
const css='#lc-catechism-return{position:fixed;right:16px;bottom:calc(var(--ao-global-ribbon-h,68px) + 24px);z-index:2147483400;padding:12px 16px;background:#111b27;border:1px solid #c5a774;border-radius:8px;color:#f2e9d9;box-shadow:0 4px 18px #000b;font:13px system-ui,sans-serif;cursor:pointer}#lc-catechism-return[hidden]{display:none!important}#lc-catechism-return:focus-visible{outline:3px solid #e4c38d;outline-offset:2px}#lc-stage-open{position:fixed;bottom:20px;right:20px;z-index:97;background:#111923;color:#f5ebdb;border:1px solid #c9b487;border-radius:8px;padding:13px;font:13px system-ui,sans-serif;cursor:pointer}#lc-stage{position:fixed;inset:0;z-index:120;overflow:hidden;color:#f4ebdf;font-family:Georgia,serif;background:#080c12}#lc-stage[hidden]{display:none!important}#lc-stage *{box-sizing:border-box}#lc-stage .lc-bg{position:absolute;inset:0;background-size:cover;background-position:center;filter:brightness(.56) saturate(.72)}#lc-stage .lc-shade{position:absolute;inset:0;background:linear-gradient(#080b14d8,transparent 26%,transparent 50%,#080b12fa)}#lc-stage .lc-head{position:relative;z-index:12;padding:16px 22px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #a68c5a6a;background:#080c12b3}#lc-stage .lc-head strong{font-size:25px;font-weight:normal}#lc-stage .lc-head small{font:10px system-ui,sans-serif;letter-spacing:.14em;color:#d7be8b}#lc-stage button{background:#151d27;border:1px solid #70624c;color:#f3e6d3;border-radius:6px;padding:9px 12px;cursor:pointer;font:12px system-ui,sans-serif}#lc-stage button:focus-visible,#lc-stage-open:focus-visible{outline:2px solid #f7d18a;outline-offset:2px}#lc-stage .lc-guides{position:absolute;left:22px;top:95px;z-index:8;display:grid;gap:7px}#lc-stage .lc-guides button{display:grid;text-align:left;gap:3px;min-width:173px;background:#0c1421c9}#lc-stage .lc-guides button[aria-pressed=true]{border-color:#dfc28d;background:#322c24dc}#lc-stage .lc-guides small{font-size:10px;color:#bfb5a3}#lc-stage .lc-sprite{position:absolute;right:1vw;bottom:0;max-width:63vw;height:93vh;object-fit:contain;object-position:bottom;filter:drop-shadow(8px 10px 26px #000a)}#lc-stage .lc-panel{position:absolute;left:20px;bottom:20px;z-index:9;width:min(790px,70vw);background:#101821f2;border:1px solid #bba172;border-radius:8px;padding:18px 23px;box-shadow:0 16px 45px #000b}#lc-stage .lc-name{color:#e2c68d;text-transform:uppercase;letter-spacing:.1em;font:12px system-ui,sans-serif}#lc-stage .lc-dialogue{font:clamp(16px,1.85vw,21px)/1.45 Georgia,serif;margin:11px 0}#lc-stage .lc-note{font:11px/1.4 system-ui,sans-serif;color:#c5bba7;margin:10px 0}#lc-stage .lc-source-record{padding:11px 13px;background:#0a111b;border-left:2px solid #c8af7a;margin:10px 0;max-height:min(29vh,230px);overflow:auto;font:13px/1.5 Georgia,serif}#lc-stage .lc-source-record[hidden]{display:none!important}#lc-stage .lc-source-record strong{font:14px Georgia,serif;color:#efdab0}#lc-stage .lc-source-record small{display:block;margin:5px 0;color:#b8c1c9;font:10px/1.5 system-ui,sans-serif}#lc-stage .lc-source-record p{margin:7px 0;white-space:pre-wrap}#lc-stage .lc-source-record a{color:#ecd19e;overflow-wrap:anywhere;font:11px system-ui,sans-serif}#lc-stage .lc-source-record ul{margin:7px 0;padding-inline-start:18px}#lc-stage .lc-trail{position:absolute;inset:auto 0 0;z-index:15;max-height:min(60vh,480px);overflow-y:auto;background:#0c1420f8;border:1px solid #b49d74;border-radius:8px;padding:15px 17px;box-shadow:0 -8px 30px #000b}#lc-stage .lc-trail[hidden]{display:none!important}#lc-stage .lc-trail-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px}#lc-stage .lc-trail-title{font:18px Georgia,serif;color:#efdfc4}#lc-stage .lc-trail-list{margin:0;padding-left:21px}#lc-stage .lc-trail-list li{margin:6px 0;color:#e3d9c7;font:12px/1.5 system-ui,sans-serif}#lc-stage .lc-trail-list button{margin:4px 0;text-align:left}#lc-stage .lc-trail-hint{color:#b4afa6;font:11px/1.5 system-ui,sans-serif}#lc-stage .lc-objective-door{display:flex;gap:7px;flex-wrap:wrap}#lc-stage .lc-actions{display:flex;flex-wrap:wrap;gap:7px}#lc-stage .lc-ask{display:flex;gap:8px;margin-top:12px}#lc-stage .lc-ask input{width:100%;min-width:0;background:#0b1017;color:#fff;padding:10px;border:1px solid #5c646b;border-radius:6px;font:13px system-ui,sans-serif}#lc-stage .lc-missing{position:absolute;z-index:5;right:14px;top:34%;max-width:220px;padding:12px;background:#111b25ef;border:1px solid #7b684b;font:12px/1.5 system-ui,sans-serif}#lc-stage .lc-small{display:none}@media(max-width:700px){#lc-stage .lc-head{padding:10px}#lc-stage .lc-head strong{font-size:19px}#lc-stage .lc-guides{top:96px;left:8px;right:8px;display:flex;gap:4px}#lc-stage .lc-guides button{min-width:0;width:33.33%;padding:7px;font-size:11px}#lc-stage .lc-guides small{font-size:9px}#lc-stage .lc-sprite{height:69vh;max-width:110vw;right:-23vw;bottom:70px}#lc-stage .lc-panel{left:8px;right:8px;bottom:9px;width:auto;padding:12px}#lc-stage .lc-dialogue{font-size:15px;margin:8px 0}#lc-stage .lc-source-record{max-height:23vh;font-size:12px;padding:8px 10px}#lc-stage .lc-trail{max-height:55vh;padding:10px}#lc-stage .lc-actions{gap:5px;max-height:114px;overflow:auto}#lc-stage .lc-actions button{font-size:11px;padding:7px}#lc-stage .lc-small{display:none}}@media(prefers-reduced-motion:reduce){#lc-stage *{transition:none!important;animation:none!important}}';
export function mountLivingChurchVisualNovel({win=window,context,assetBase="./assets/living-church/"}={}){
 if(!context?.status||!context?.chooseGuide||!context.status().sceneSupported)throw Error("Source-owned P1 review context is required");
 const doc=win.document;
 if(doc.getElementById("lc-stage"))throw Error("Living Church P2 already mounted");
 const style=doc.createElement("style");style.textContent=css;doc.head.append(style);
 const button=doc.createElement("button");button.id="lc-stage-open";button.type="button";button.textContent="Meet the guides · preview";doc.body.append(button);
 const returnBtn=doc.createElement("button");returnBtn.id="lc-catechism-return";
 returnBtn.type="button";returnBtn.hidden=true;
 returnBtn.textContent="Return to the Living Church";doc.body.append(returnBtn);
 const root=doc.createElement("section");root.id="lc-stage";root.hidden=true;root.setAttribute("aria-label","Living Church visual-novel scene");
 root.innerHTML='<div class="lc-bg"></div><div class="lc-shade"></div><header class="lc-head"><div><small>AD ORIENTEM · REVIEW ONLY</small><div><strong>The Living Church</strong></div></div><button data-close>Return to photograph</button></header><nav class="lc-guides" aria-label="Choose a guide"></nav><div class="lc-small">Original Brompton Oratory photograph<br>Scripted, non-authoritative dialogue</div><img class="lc-sprite" alt=""><div class="lc-missing" hidden role="status">The approved character portrait is not yet installed in this research branch. Its locked original must be imported; no substitute will be generated.</div><section class="lc-panel" aria-label="Visual novel dialogue"><span class="lc-name"></span><p class="lc-dialogue" aria-live="polite"></p><section class="lc-source-record" aria-label="Original source excerpt" hidden></section><section class="lc-trail" aria-label="Conversation trail" hidden><div class="lc-trail-head"><strong class="lc-trail-title">This visit</strong><button type="button" data-close-trail>Return to conversation</button></div><p class="lc-trail-hint">Only guide choices, topic IDs and source IDs. No typed questions are saved in this list.</p><ol class="lc-trail-list"></ol></section><p class="lc-note" hidden>Scripted educational preview; original source owners remain authoritative.</p><div class="lc-actions"></div><div class="lc-objective-door"><button type="button" data-objectives>Choose a learning objective</button><button type="button" data-trail>Conversation trail</button></div><form class="lc-ask"><input maxlength="240" aria-label="Ask a question" placeholder="Ask about something in the church…"><button>Ask</button></form></section>';
 doc.body.append(root);
 const el=s=>root.querySelector(s),people=el(".lc-guides"),action=el(".lc-actions"),sprite=el(".lc-sprite");
 const trail=createLivingChurchConversationTrail({limit:20});
 const state={id:"welcome",guide:"sacristan",question:null,history:[],open:false,returnToken:null,nativePending:false,nativeFailure:null,selectedObjective:null,sourceReadCount:0,sourceOpen:null,sourcePending:false,sourceRecord:null,sourceHistory:[],sourceEpoch:0};
 let directorPromise=null;
 const getDirector=()=>directorPromise??=(import("./living-church-objective-director.mjs")
   .then(m=>m.loadLivingChurchObjectives({language:context.status()?.context?.lang||"en"}))
   .catch(e=>{directorPromise=null;throw e}));
 function addChoice(label,handler){
  const b=doc.createElement("button");b.type="button";b.textContent=label;
  b.onclick=handler;action.append(b);return b;
 }
 const sourcePanel=el(".lc-source-record"),trailPanel=el(".lc-trail");
 function showTrail(){
  const list=el(".lc-trail-list");list.replaceChildren();
  const entries=trail.entries(),seenSources=new Set();
  if(!entries.length)list.append(safe("li","","No guide or source selections yet."));
  for(const entry of entries){
   const li=doc.createElement("li");list.append(li);
   const objectiveNow=state.selectedObjective?.branch||null;
   if(entry.kind==="source"){
    const label="Source: "+readableSource(entry.sourceId)+" ("+roles[entry.guide].name+")";
    const historyKey=entry.objective+":"+entry.sourceId;
    const alreadyListed=seenSources.has(historyKey);
    seenSources.add(historyKey);
    if(alreadyListed){li.textContent=label+" · revisited";}
    else if(objectiveNow===entry.objective){
     const b=safe("button","",label+" · revisit");
     b.type="button";b.onclick=async()=>{trailPanel.hidden=true;await openSource(await getDirector(),entry.sourceId);};
     li.append(b);
    }else li.textContent=label+" · earlier objective";
   }else if(entry.kind==="guide"){
    const b=safe("button","","Guide: "+roles[entry.guide].name+" · return");
    b.type="button";b.onclick=()=>{
     trailPanel.hidden=true;visit(entry.guide==="sacristan"?"altar":entry.guide==="canon"?"canon":"pius");
    };li.append(b);
   }else{
    li.textContent="Objective: "+entry.objective.replace(/_/g," ")+
      (objectiveNow!==entry.objective?" · previously selected":" · current");
   }
  }
  trailPanel.hidden=false;
 }
 el("[data-trail]").onclick=showTrail;
 el("[data-close-trail]").onclick=()=>{trailPanel.hidden=true;};
 function clearSource(){state.sourceEpoch++;sourcePanel.hidden=true;sourcePanel.replaceChildren();state.sourceOpen=null;state.sourceRecord=null;}
 const safe=(tag,cls,value)=>{const e=doc.createElement(tag);if(cls)e.className=cls;if(value!==undefined)e.textContent=String(value);return e;};
 function renderSource(record){
  sourcePanel.replaceChildren();
  sourcePanel.append(safe("strong","",record.title));
  sourcePanel.append(safe("small","",record.owner+" · "+record.sourceStatus+" · "+record.id));
  sourcePanel.append(safe("p","",record.text));
  if(record.detail){
   const details=safe("details");const summary=safe("summary","","More from the original source");
   details.append(summary,safe("p","",record.detail));sourcePanel.append(details);
  }
  if(record.sources.length){
   const list=safe("ul");
   for(const source of record.sources){
    const item=safe("li"),link=safe("a","",source.label+(source.locator?" · "+source.locator:""));
    link.href=source.url;link.target="_blank";link.rel="noopener noreferrer";
    item.append(link);list.append(item);
   }
   sourcePanel.append(safe("small","","References supplied by the owning module"),list);
  }else sourcePanel.append(safe("small","","Module description only · no external citation certified in this digest"));
  sourcePanel.hidden=false;
 }
 async function openSource(director,id){
  if(state.nativePending||state.returnToken||state.sourcePending)return false;
  state.sourcePending=true;
  clearSource();const epoch=state.sourceEpoch;
  el(".lc-dialogue").textContent="Retrieving the original source record…";
  try{
   const record=await director.digest(id,{lang:context.status()?.context?.lang||"en"});
   if(epoch!==state.sourceEpoch||state.returnToken)return false;
   if(!record?.ok){
    el(".lc-dialogue").textContent="No approved source extract is available here ["+(record?.reason||"unavailable")+"]. Choose another reference.";
    addSourceActions(director);return false;
   }
   state.sourceOpen=record.id;state.sourceRecord=record;state.sourceReadCount++;
   trail.record({kind:"source",guide:state.guide,objective:state.selectedObjective?.branch||null,sourceId:record.id});
   // Keep source IDs only; do not retain the user's private free-text messages in this log.
   state.sourceHistory.push(record.id);
   if(state.sourceHistory.length>12)state.sourceHistory.shift();
   // These are editor/source-owner words, NEVER an impersonated historical quotation.
   el(".lc-dialogue").textContent="The following passage comes from "+record.owner+
    ", not from an invented statement by "+roles[state.guide].name+".";
   renderSource(record);
   addSourceActions(director);
   return true;
  }catch{
   if(epoch!==state.sourceEpoch)return false;
   el(".lc-dialogue").textContent="The original source cannot be retrieved here. No substitute explanation has been generated.";
   addSourceActions(director);return false;
  }finally{state.sourcePending=false;}
 }
 function readableSource(id){
  if(id.startsWith("apostolate:"))return "Question "+id.split(":")[1];
  if(id==="learn.mass_explorer")return "Mass Explorer";
  if(id==="learn.catechism")return "Original Catechism";
  if(id==="pray.confession")return "Confession preparation";
  return id.replace(/^learn\./,"Formation: ").replace(/^pray\./,"Prayer: ").replace(/[._]/g," ");
 }
 function addSourceActions(director){
  action.replaceChildren();
  const selection=state.selectedObjective;
  if(!selection)return;
  for(const id of selection.sourceRoutes.slice(0,4).filter(x=>x!==state.sourceOpen))
   addChoice("Read "+readableSource(id),()=>openSource(director,id));
  if(state.sourceHistory.length>1)addChoice("Earlier references",()=>{
    action.replaceChildren();
    for(const id of [...new Set(state.sourceHistory)].reverse())
      addChoice("Revisit "+readableSource(id),()=>openSource(director,id));
    addChoice("Back to current source",()=>addSourceActions(director));
  });
  addChoice("Back to subject",()=>presentObjective(selection));
  addChoice("Consult "+roles[selection.guide].name,
   ()=>visit(selection.guide==="sacristan"?"altar":selection.guide==="canon"?"canon":"pius"));
 }

 function showObjectives(director){
  clearSource();el(".lc-dialogue").textContent="What would you like to explore? Choose an objective to see the existing Ask the Church study paths.";
  action.replaceChildren();
  for(const x of director.objectives())addChoice(x.title,()=>chooseObjective(director,x.id));
  addChoice("Back to this conversation",()=>visit(state.id,false));
 }
 function chooseObjective(director,id){
  const result=director.choice(id);if(!result.ok)return false;
  showBranches(director,result.branches);return true;
 }
 function showBranches(director,branches){
  clearSource();el(".lc-dialogue").textContent="Which situation or subject fits your objective? These paths come from the existing Ask the Church registry.";
  action.replaceChildren();
  for(const x of branches)addChoice(x.title,()=>chooseBranch(director,x.id));
  addChoice("All objectives",()=>showObjectives(director));
 }
 function chooseBranch(director,id){
  const result=director.branch(id);if(!result.ok)return false;
  presentObjective(result.selection);return true;
 }
 function presentObjective(selection){
  if(!selection)return false;
  clearSource();
  state.selectedObjective=selection;
  trail.record({kind:"objective",guide:state.guide,objective:selection.branch});
  const guide=selection.guide;
  el(".lc-dialogue").textContent=selection.title+
    ". You may read the existing source material below, or ask "+roles[guide].name+
    " to continue. Sources belong to their original Ad Orientem modules.";
  action.replaceChildren();
  const topics=selection.sourceRoutes.slice(0,4);
  if(topics.length){
   addChoice("Read the first source",async()=>openSource(await getDirector(),topics[0]));
   if(topics.length>1)addChoice("Other references",async()=>addSourceActions(await getDirector()));
  }else addChoice("No approved excerpt available",()=>{});
  addChoice("Consult "+roles[guide].name,()=>visit(guide==="sacristan"?"altar":guide==="canon"?"canon":"pius"));
  addChoice("Other objectives",async()=>showObjectives(await getDirector()));
  return true;
 }
 async function openObjectives(){
  if(state.nativePending||state.returnToken)return false;
  el(".lc-dialogue").textContent="Loading existing Ask the Church objectives…";
  try{const director=await getDirector();showObjectives(director);return true;}
  catch{el(".lc-dialogue").textContent="The original Ask the Church source registry is unavailable. The existing guides remain usable.";return false;}
 }
 el("[data-objectives]").onclick=()=>void openObjectives();
 for(const id of Object.keys(roles)){const b=doc.createElement("button");b.type="button";b.dataset.guide=id;b.innerHTML="<strong>"+roles[id].name+"</strong><small>"+roles[id].role+"</small>";b.onclick=()=>visit(id==="sacristan"?"welcome":id==="canon"?"canon":"pius");people.append(b);}
 function close(){root.hidden=true;button.hidden=Boolean(state.returnToken);state.open=false;}
 function open(){if(state.returnToken||!context.status().sceneSupported)return false;const img=doc.getElementById("altar-photo");if(img)el(".lc-bg").style.backgroundImage="url("+JSON.stringify(img.currentSrc||img.src)+")";root.hidden=false;button.hidden=true;state.open=true;visit(state.id,false);return true;}
 function visit(id,record=true){
  clearSource();const row=scripts[id]||scripts.unknown;const guide=row[0]||state.guide;
  const result=context.chooseGuide(guide);if(!result?.ok)return false;
  state.id=id;state.guide=guide;
  people.querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.guide===guide)));
  el(".lc-name").textContent=guide==="pius-x"?"ST PIUS X · HISTORICAL PRESENTATION":roles[guide].name.toUpperCase();
  el(".lc-dialogue").textContent=row[2];
  sprite.onload=()=>{el(".lc-missing").hidden=true;};
  sprite.onerror=()=>{sprite.removeAttribute("src");el(".lc-missing").hidden=false;};
  sprite.src=assetBase+roles[guide].stem+"_"+row[1]+".webp";
  sprite.alt=roles[guide].name+", "+row[1]+" expression";
  action.replaceChildren();
  for(const [label,target] of row[3]){
   const b=doc.createElement("button");b.type="button";b.textContent=label;b.onclick=async()=>{
    if(target==="source-object"){close();win.AO_VISIBLE_MASS_HOTSPOT_PILOT?.select?.("AL01");return;}
    if(target==="source-mass"){
     if(state.nativePending||state.returnToken)return;
     if(state.guide!=="canon"||!["sacrifice","roman-canon"].includes(state.id)){
       el(".lc-dialogue").textContent="Choose the Canon's Mass explanation first.";
       return;
     }
     state.nativePending=true;state.nativeFailure=null;b.disabled=true;
     el(".lc-dialogue").textContent="Opening the canonical Mass Explorer at the source-linked moment…";
     try{
       const response=await context.handoff({
         routeId:"learn.mass_explorer",sourceRef:"AO.CARD.015"
       });
       if(response?.ok&&response.returnToken){
         state.returnToken=response.returnToken;
         root.hidden=true;button.hidden=true;state.open=false;
         returnBtn.hidden=false;returnBtn.focus({preventScroll:true});
         return;
       }
       state.nativeFailure=response?.code||"MASS_OWNER_UNAVAILABLE";
       el(".lc-dialogue").textContent="The canonical Mass Explorer could not be opened in this environment ["+
          state.nativeFailure+"]. Your current Canon dialogue and church view are preserved.";
     }catch{
       state.nativeFailure="MASS_HANDOFF_FAILED";
       el(".lc-dialogue").textContent="The canonical Mass Explorer could not be opened. Your Canon dialogue is preserved.";
     }finally{state.nativePending=false;b.disabled=false;}
     return;
    }
    if(target==="source-catechism"){
     if(state.nativePending||state.returnToken)return;
     if(state.guide!=="pius-x"||state.id!=="real-presence"){
       el(".lc-dialogue").textContent="Select the St Pius X Eucharist question before opening the original Catechism.";
       return;
     }
     state.nativePending=true;state.nativeFailure=null;b.disabled=true;
     el(".lc-dialogue").textContent="Opening original St Pius X Catechism · question 322…";
     try{
       const response=await context.handoff({
         routeId:"learn.catechism",sourceRef:"PX1912-Q322"
       });
       if(response?.ok&&response.returnToken){
         state.returnToken=response.returnToken;
         root.hidden=true;button.hidden=true;state.open=false;
         returnBtn.hidden=false;returnBtn.focus({preventScroll:true});
         return;
       }
       state.nativeFailure=response?.code||"NATIVE_OWNER_UNAVAILABLE";
       el(".lc-dialogue").textContent="The original Catechism could not open in this viewer ["+
         state.nativeFailure+"]. Your church scene, selected guide and question have been retained.";
     }catch{
       state.nativeFailure="CATECHISM_HANDOFF_FAILED";
       el(".lc-dialogue").textContent="The original Catechism is unavailable. Your church scene and question have been retained.";
     }finally{state.nativePending=false;b.disabled=false;}
     return;
    }
    visit(target);};action.append(b);
  }
  if(record){
   // In-memory session log excludes raw questions and personal circumstances.
   state.history.push({guide,id});if(state.history.length>20)state.history.shift();
   trail.record({kind:"guide",guide,objective:state.selectedObjective?.branch||null});
  }
  return true;
 }
 async function ask(q){
  q=String(q||"").trim();if(!q)return false;state.question=q;
  // A follow-up works only on the source record explicitly opened by the visitor.
  // Do not infer new theology or impersonate a historical guide.
  if(state.sourceRecord&&state.selectedObjective){
   const normalized=q.toLowerCase();
   if(/^(why|explain|tell me more|more detail|how come|pourquoi|explique)/.test(normalized)){
    const detail=sourcePanel.querySelector("details");
    if(detail){detail.open=true;el(".lc-dialogue").textContent="Expanded explanation from "+
       state.sourceRecord.owner+"; this is the owning module's text, not a generated answer.";
    }else el(".lc-dialogue").textContent="The original module supplies no longer approved explanation here.";
    return true;
   }
   if(/\b(source|sources|citation|reference|references|proof|origine|source|référence)\b/i.test(q)){
    el(".lc-dialogue").textContent=state.sourceRecord.sources.length?
      "References supplied by "+state.sourceRecord.owner+" appear below the excerpt.":
      "This excerpt is a module description only; no external source citation is certified here.";
    return true;
   }
   if(/^(next|another|other|more references|suivant|autre)/.test(normalized)){
    const ids=state.selectedObjective.sourceRoutes.filter(x=>x!==state.sourceOpen);
    if(ids.length)return openSource(await getDirector(),ids[0]);
    el(".lc-dialogue").textContent="No additional approved source extract is listed for this objective.";
    return true;
   }
  }
  try{
   const director=await getDirector();
   const suggested=director.interpret(q);
   if(suggested.kind==="path")return presentObjective(suggested.selection);
   if(suggested.kind==="objective"){showBranches(director,suggested.branches);return true;}
  }catch{/* The original source router may not be present in standalone/offline review. */}
  const text=q.toLowerCase();
  if(/\b(altar|chalice|crucifix|sacristy|vestment|tabernacle|church)\b/.test(text))return visit("altar");
  if(/\b(mass|canon|offertory|elevation|priest|sacrifice|ceremony)\b/.test(text))return visit("sacrifice");
  if(/\b(eucharist|real presence|catechism|sacrament|faith|commandment)\b/.test(text))return visit("real-presence");
  return visit("unknown");
 }
 async function returnFromNative(){
   if(!state.returnToken||state.nativePending)return false;
   state.nativePending=true;returnBtn.disabled=true;
   const token=state.returnToken;
   try{
     const outcome=await context.returnFromHandoff(token);
     if(!outcome?.ok){state.nativeFailure=outcome?.code||"SCENE_RESTORATION_FAILED";return false;}
     state.returnToken=null;state.nativeFailure=null;returnBtn.hidden=true;
     const reopened=open();
     if(reopened)el(".lc-actions button")?.focus?.({preventScroll:true});
     return reopened;
   }catch{state.nativeFailure="SCENE_RESTORATION_FAILED";return false;}
   finally{state.nativePending=false;returnBtn.disabled=false;}
 }
 returnBtn.onclick=()=>void returnFromNative();
 button.onclick=open;el("[data-close]").onclick=close;
 el(".lc-ask").onsubmit=e=>{e.preventDefault();const i=el(".lc-ask input");ask(i.value);i.value="";};
 root.addEventListener("keydown",e=>{if(e.key==="Escape"){e.stopPropagation();close();}});
 return Object.freeze({open,close,visit,ask,openObjectives,returnFromNative,status:()=>Object.freeze({version:LIVING_CHURCH_SCENE_VERSION,open:state.open,guide:state.guide,node:state.id,question:state.question,historyCount:state.history.length,trailCount:trail.count(),sourceReadCount:state.sourceReadCount,sourceHistoryCount:state.sourceHistory.length,sourceOpen:state.sourceOpen,selectedObjective:state.selectedObjective?.branch||null,nativeHandoffPending:state.nativePending,nativeReturnAvailable:!!state.returnToken,nativeFailure:state.nativeFailure,canonicalOwner:"EXISTING_CATECHISM_VISIBLE_MASS_AND_MASS_EXPLORER",published:false}),dispose:()=>{trail.clear();if(state.returnToken)throw Error("Cannot dispose active native Catechism return");button.remove();returnBtn.remove();root.remove();style.remove();}});
}
