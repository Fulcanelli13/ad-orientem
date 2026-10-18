/**
 * P2 Living Church visual-novel overlay. Opt-in review only.
 * Content and return navigation remain owned by Visible Mass, Mass Explorer and Catechism.
 */
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
const css='#lc-catechism-return{position:fixed;right:16px;bottom:calc(var(--ao-global-ribbon-h,68px) + 24px);z-index:2147483400;padding:12px 16px;background:#111b27;border:1px solid #c5a774;border-radius:8px;color:#f2e9d9;box-shadow:0 4px 18px #000b;font:13px system-ui,sans-serif;cursor:pointer}#lc-catechism-return[hidden]{display:none!important}#lc-catechism-return:focus-visible{outline:3px solid #e4c38d;outline-offset:2px}#lc-stage-open{position:fixed;bottom:20px;right:20px;z-index:97;background:#111923;color:#f5ebdb;border:1px solid #c9b487;border-radius:8px;padding:13px;font:13px system-ui,sans-serif;cursor:pointer}#lc-stage{position:fixed;inset:0;z-index:120;overflow:hidden;color:#f4ebdf;font-family:Georgia,serif;background:#080c12}#lc-stage[hidden]{display:none!important}#lc-stage *{box-sizing:border-box}#lc-stage .lc-bg{position:absolute;inset:0;background-size:cover;background-position:center;filter:brightness(.56) saturate(.72)}#lc-stage .lc-shade{position:absolute;inset:0;background:linear-gradient(#080b14d8,transparent 26%,transparent 50%,#080b12fa)}#lc-stage .lc-head{position:relative;z-index:12;padding:16px 22px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #a68c5a6a;background:#080c12b3}#lc-stage .lc-head strong{font-size:25px;font-weight:normal}#lc-stage .lc-head small{font:10px system-ui,sans-serif;letter-spacing:.14em;color:#d7be8b}#lc-stage button{background:#151d27;border:1px solid #70624c;color:#f3e6d3;border-radius:6px;padding:9px 12px;cursor:pointer;font:12px system-ui,sans-serif}#lc-stage button:focus-visible,#lc-stage-open:focus-visible{outline:2px solid #f7d18a;outline-offset:2px}#lc-stage .lc-guides{position:absolute;left:22px;top:95px;z-index:8;display:grid;gap:7px}#lc-stage .lc-guides button{display:grid;text-align:left;gap:3px;min-width:173px;background:#0c1421c9}#lc-stage .lc-guides button[aria-pressed=true]{border-color:#dfc28d;background:#322c24dc}#lc-stage .lc-guides small{font-size:10px;color:#bfb5a3}#lc-stage .lc-sprite{position:absolute;right:1vw;bottom:0;max-width:63vw;height:93vh;object-fit:contain;object-position:bottom;filter:drop-shadow(8px 10px 26px #000a)}#lc-stage .lc-panel{position:absolute;left:20px;bottom:20px;z-index:9;width:min(790px,70vw);background:#101821f2;border:1px solid #bba172;border-radius:8px;padding:18px 23px;box-shadow:0 16px 45px #000b}#lc-stage .lc-name{color:#e2c68d;text-transform:uppercase;letter-spacing:.1em;font:12px system-ui,sans-serif}#lc-stage .lc-dialogue{font:clamp(16px,1.85vw,21px)/1.45 Georgia,serif;margin:11px 0}#lc-stage .lc-note{font:11px/1.4 system-ui,sans-serif;color:#c5bba7;margin:10px 0}#lc-stage .lc-actions{display:flex;flex-wrap:wrap;gap:7px}#lc-stage .lc-ask{display:flex;gap:8px;margin-top:12px}#lc-stage .lc-ask input{width:100%;min-width:0;background:#0b1017;color:#fff;padding:10px;border:1px solid #5c646b;border-radius:6px;font:13px system-ui,sans-serif}#lc-stage .lc-missing{position:absolute;z-index:5;right:14px;top:34%;max-width:220px;padding:12px;background:#111b25ef;border:1px solid #7b684b;font:12px/1.5 system-ui,sans-serif}#lc-stage .lc-small{display:none}@media(max-width:700px){#lc-stage .lc-head{padding:10px}#lc-stage .lc-head strong{font-size:19px}#lc-stage .lc-guides{top:96px;left:8px;right:8px;display:flex;gap:4px}#lc-stage .lc-guides button{min-width:0;width:33.33%;padding:7px;font-size:11px}#lc-stage .lc-guides small{font-size:9px}#lc-stage .lc-sprite{height:69vh;max-width:110vw;right:-23vw;bottom:70px}#lc-stage .lc-panel{left:8px;right:8px;bottom:9px;width:auto;padding:12px}#lc-stage .lc-dialogue{font-size:15px;margin:8px 0}#lc-stage .lc-actions{gap:5px;max-height:114px;overflow:auto}#lc-stage .lc-actions button{font-size:11px;padding:7px}#lc-stage .lc-small{display:none}}@media(prefers-reduced-motion:reduce){#lc-stage *{transition:none!important;animation:none!important}}';
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
 root.innerHTML='<div class="lc-bg"></div><div class="lc-shade"></div><header class="lc-head"><div><small>AD ORIENTEM · REVIEW ONLY</small><div><strong>The Living Church</strong></div></div><button data-close>Return to photograph</button></header><nav class="lc-guides" aria-label="Choose a guide"></nav><div class="lc-small">Original Brompton Oratory photograph<br>Scripted, non-authoritative dialogue</div><img class="lc-sprite" alt=""><div class="lc-missing" hidden role="status">The approved character portrait is not yet installed in this research branch. Its locked original must be imported; no substitute will be generated.</div><section class="lc-panel" aria-label="Visual novel dialogue"><span class="lc-name"></span><p class="lc-dialogue" aria-live="polite"></p><p class="lc-note" hidden>Scripted educational preview; original source owners remain authoritative.</p><div class="lc-actions"></div><form class="lc-ask"><input maxlength="240" aria-label="Ask a question" placeholder="Ask about something in the church…"><button>Ask</button></form></section>';
 doc.body.append(root);
 const el=s=>root.querySelector(s),people=el(".lc-guides"),action=el(".lc-actions"),sprite=el(".lc-sprite");
 const state={id:"welcome",guide:"sacristan",question:null,history:[],open:false,returnToken:null,nativePending:false,nativeFailure:null};
 for(const id of Object.keys(roles)){const b=doc.createElement("button");b.type="button";b.dataset.guide=id;b.innerHTML="<strong>"+roles[id].name+"</strong><small>"+roles[id].role+"</small>";b.onclick=()=>visit(id==="sacristan"?"welcome":id==="canon"?"canon":"pius");people.append(b);}
 function close(){root.hidden=true;button.hidden=Boolean(state.returnToken);state.open=false;}
 function open(){if(state.returnToken||!context.status().sceneSupported)return false;const img=doc.getElementById("altar-photo");if(img)el(".lc-bg").style.backgroundImage="url("+JSON.stringify(img.currentSrc||img.src)+")";root.hidden=false;button.hidden=true;state.open=true;visit(state.id,false);return true;}
 function visit(id,record=true){
  const row=scripts[id]||scripts.unknown;const guide=row[0]||state.guide;
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
  if(record)state.history.push({guide,id,question:state.question});
  return true;
 }
 function ask(q){
  q=String(q||"").trim();if(!q)return false;state.question=q;
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
 return Object.freeze({open,close,visit,ask,returnFromNative,status:()=>Object.freeze({version:LIVING_CHURCH_SCENE_VERSION,open:state.open,guide:state.guide,node:state.id,question:state.question,historyCount:state.history.length,nativeHandoffPending:state.nativePending,nativeReturnAvailable:!!state.returnToken,nativeFailure:state.nativeFailure,canonicalOwner:"EXISTING_CATECHISM_VISIBLE_MASS_AND_MASS_EXPLORER",published:false}),dispose:()=>{if(state.returnToken)throw Error("Cannot dispose active native Catechism return");button.remove();returnBtn.remove();root.remove();style.remove();}});
}
