/**
 * Prayer-family presentation workspace. Preserves the original Confession and
 * Tenebrae source owners and their DOM (no duplicate prayer bodies).
 * Horizontal gestures choose one of three *views*. Source-card progression
 * remains with its explicit timeline / Next controls. Vertical gestures scroll
 * the text region. The divider is continuously resizable, never two-position.
 */
import {prayerCeremonialSceneState,renderPrayerCeremonialScene} from "./prayer-ceremonial-stage.v1.js";
import "./prayer-ritual-workspace-styles.js";
import {releasedModulePhotoMarkup} from "../art/released-module-paintings.v1.js";
import {mountPrayerChurchCinema} from "./prayer-church-cinema.v1.js";

export const PRAYER_RITUAL_WORKSPACE_VERSION="prayer-ritual-workspace-v1";
export const RITUAL_VIEW_MODES=Object.freeze(["scene","both","text"]);
export const RITUAL_DEFAULT_RATIOS=Object.freeze({scene:.68,both:.39,text:.14});
export function ritualRatio(n){
  const x=Number(n);
  return Number.isFinite(x)?Math.min(.72,Math.max(.12,x)):.39;
}
export function ritualModeIndex(mode){return Math.max(0,RITUAL_VIEW_MODES.indexOf(mode));}
export function nextRitualMode(mode,direction){
  const i=ritualModeIndex(mode);
  return RITUAL_VIEW_MODES[Math.max(0,Math.min(2,i+(direction>0?1:-1)))];
}
// Session-only layout preference. No prayer texts, sins, Office choices, or
// user actions are persisted to disk, localStorage, analytics or URL.
const layouts=new Map();
const L=(f,en,fr)=>f?fr:en;

export function installPrayerRitualWorkspace({mount,kind,french=false,hour="MATINS",ceremony=null}={}){
  if(!["confession","tenebrae"].includes(kind))return null;
  const root=mount?.querySelector(kind==="confession"?
    ".aoP435930ConfessionReader:not([data-ao-confession-private-reader])":".aoTenebBody");
  const doc=root?.ownerDocument;
  if(!doc||root.dataset.aoRitualWorkspaceReady==="true")return null;
  // The historical optional Tenebrae visual is a projection of the supplied
  // ceremony model, never an arbitrary nested figure moved from source text.
  const sourceScene=root.querySelector(".aoPrayerCeremonialScene");
  const scene=kind==="confession"?sourceScene:null;
  const children=[...root.children];
  let take=children;
  if(kind==="tenebrae"){
    // Keep the original Office/day/hour selectors and source explanation.
    const mode=root.querySelector(".aoTenebMode");
    if(!mode)return null;
    const index=children.indexOf(mode);
    if(index<0)return null;
    take=children.slice(index+1);
  }
  // Do not reparent the scene into the text panel when its original position
  // was the Confession main's first direct child.
  // Original released Confession art is promoted into the visual region;
  // never move it back into the scrolling text in the reparenting pass.
  take=take.filter(node=>node!==scene&&
    !(kind==="confession"&&node.matches?.(".aoPrayerConfessionCover")));
  const anchor=take[0]??null;
  const workspace=doc.createElement("section");
  workspace.className="aoPrayerRitualWorkspace";
  workspace.dataset.aoPrayerWorkspace=kind;
  workspace.dataset.aoRitualWorkspaceReady="true";
  workspace.setAttribute("aria-label",L(french,"Prayer scene and text","Scène et texte de prière"));
  const visual=doc.createElement("div");
  visual.className="aoPrayerRitualVisual";
  const divider=doc.createElement("div");
  divider.className="aoPrayerRitualDivider";
  divider.dataset.aoRitualDivider="";
  divider.tabIndex=0;
  divider.setAttribute("role","separator");
  divider.setAttribute("aria-orientation","horizontal");
  divider.setAttribute("aria-label",L(french,"Resize the scene and prayer text","Redimensionner la scène et la prière"));
  divider.setAttribute("aria-valuemin","12");
  divider.setAttribute("aria-valuemax","72");
  const body=doc.createElement("div");
  body.className="aoPrayerRitualText";
  body.setAttribute("role","region");
  body.setAttribute("aria-label",L(french,"Prayer text and guide","Texte et guide de prière"));
  body.tabIndex=0;
  const figure=scene??(()=>{
    const f=doc.createElement("div");
    const visualState=kind==="tenebrae"?
      prayerCeremonialSceneState({
        kind:ceremony?.enabled===true?"tenebrae":"tenebrae-office",
        stage:hour,ceremony
      }):
      prayerCeremonialSceneState({
        kind:"confession",stage:Number(root.dataset.aoConfessionSection??0)
      });
    f.innerHTML=renderPrayerCeremonialScene(visualState,{french});
    return f.firstElementChild;
  })();
  // Remove only the redundant visual from the optional source-owned aside.
  // Keep the real Office passages, explanatory material, and user controls.
  if(kind==="tenebrae"&&sourceScene)sourceScene.remove();
  if(!figure)return null;
  visual.append(figure);
  if(kind==="confession"){
    // Reuse the existing publicly released NGA Murillo photograph. Stage 0
    // already has this image in its canonical owner; move that DOM node,
    // don't duplicate its downloaded asset, credit or source contract.
    const released=root.querySelector(".aoPrayerConfessionCover");
    const frame=released??(()=>{
      const host=doc.createElement("div");
      host.innerHTML=releasedModulePhotoMarkup("confession",{
        className:"aoPrayerConfessionCover"
      });
      return host.firstElementChild;
    })();
    if(frame){
      frame.classList.add("aoPrayerRitualSceneArt");
      frame.dataset.aoRitualArtSource="released-murillo-nga";
      figure.insertBefore(frame,figure.firstChild);
      figure.classList.add("aoPrayerCeremonialScene--painted");
    }
  }
  const tabs=doc.createElement("nav");
  tabs.className="aoPrayerRitualViews";
  tabs.setAttribute("aria-label",L(french,"Presentation views","Vues de présentation"));
  const labels={scene:L(french,"Scene","Scène"),both:L(french,"Together","Ensemble"),text:L(french,"Text","Texte")};
  for(const name of RITUAL_VIEW_MODES){
    const button=doc.createElement("button");
    button.type="button";
    button.dataset.aoRitualView=name;
    button.textContent=labels[name];
    tabs.append(button);
  }
  visual.append(tabs);
  workspace.append(visual,divider,body);
  if(anchor)root.insertBefore(workspace,anchor);
  else root.append(workspace);
  for(const el of take)body.append(el);
  root.dataset.aoRitualWorkspaceReady="true";
  const remembered=layouts.get(kind);
  let mode=RITUAL_VIEW_MODES.includes(remembered?.mode)?remembered.mode:"both";
  let ratio=ritualRatio(remembered?.ratio??RITUAL_DEFAULT_RATIOS[mode]);
  const renderRatio=()=>{
    workspace.dataset.aoRitualMode=mode;
    workspace.style.setProperty("--ao-ritual-scene-share",(ratio*100).toFixed(2)+"%");
    divider.setAttribute("aria-valuenow",String(Math.round(ratio*100)));
    for(const b of tabs.querySelectorAll("button")){
      b.setAttribute("aria-pressed",String(b.dataset.aoRitualView===mode));
    }
    layouts.set(kind,{mode,ratio});
  };
  const setMode=chosen=>{
    if(!RITUAL_VIEW_MODES.includes(chosen))return false;
    mode=chosen;
    ratio=RITUAL_DEFAULT_RATIOS[mode];
    renderRatio();
    return true;
  };
  tabs.addEventListener("click",e=>{
    const target=e.target.closest("[data-ao-ritual-view]");
    if(target) {e.stopPropagation();setMode(target.dataset.aoRitualView);}
  });
  let drag=null;
  divider.addEventListener("pointerdown",e=>{
    if(e.button!==0&&e.pointerType==="mouse")return;
    const height=workspace.getBoundingClientRect().height;
    if(height<=0)return;
    drag={startY:e.clientY,initial:ratio,height};
    divider.setPointerCapture?.(e.pointerId);
    e.preventDefault();
  });
  divider.addEventListener("pointermove",e=>{
    if(!drag)return;
    ratio=ritualRatio(drag.initial+(e.clientY-drag.startY)/drag.height);
    mode="both"; // continuous custom split; not a snap-to-preset command.
    renderRatio();
  });
  const endDrag=()=>{drag=null};
  divider.addEventListener("pointerup",endDrag);
  divider.addEventListener("pointercancel",endDrag);
  divider.addEventListener("lostpointercapture",endDrag);
  divider.addEventListener("keydown",e=>{
    if(!["ArrowUp","ArrowDown","Home","End"].includes(e.key))return;
    e.preventDefault();e.stopPropagation();
    ratio=ritualRatio(e.key==="Home"?.12:e.key==="End"?.72:ratio+(e.key==="ArrowDown"?.035:-.035));
    mode="both";renderRatio();
  });
  // Only deliberate horizontal gestures switch presentation views. Never
  // synthesize the next Office passage, Confession stage or liturgical event.
  let touch=null;
  const blocked=t=>Boolean(t?.closest?.("button,a,input,textarea,select,summary,[contenteditable],.aoDevoTimeline,.aoTenebJump,[data-ao-ritual-divider]"));
  workspace.addEventListener("touchstart",e=>{
    const t=e.touches?.[0];
    touch=e.touches?.length===1&&!blocked(e.target)?
      {x:t.clientX,y:t.clientY,at:Date.now()}:null;
  },{capture:true,passive:true});
  workspace.addEventListener("touchend",e=>{
    if(!touch)return;
    const old=touch;touch=null;
    const t=e.changedTouches?.[0];if(!t)return;
    const dx=t.clientX-old.x,dy=t.clientY-old.y;
    if(Date.now()-old.at>1300||Math.abs(dx)<70||Math.abs(dx)<=Math.abs(dy)*1.35)return;
    if(setMode(nextRitualMode(mode,dx<0?1:-1))){
      e.stopPropagation();if(e.cancelable)e.preventDefault();
    }
  },{capture:true,passive:false});
  workspace.addEventListener("touchcancel",()=>touch=null,{capture:true,passive:true});
  workspace.addEventListener("keydown",e=>{
    if(e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||
      !["ArrowLeft","ArrowRight"].includes(e.key)||blocked(e.target))return;
    e.preventDefault();e.stopPropagation();
    setMode(nextRitualMode(mode,e.key==="ArrowRight"?1:-1));
  },true);
  renderRatio();
  // Donor perspective camera is a *visual projection* on top of the original
  // source-owned Office or Confession reader. No physical/sacramental act is
  // inferred by a card change; optional Tenebrae candles follow ceremony only.
  const phase=kind==="confession"?(figure.dataset.aoScenePhase||"prepare"):"office";
  const cinema=mountPrayerChurchCinema({visual,kind,phase,ceremony,french});
  return Object.freeze({
    workspace,visual,body,divider,cinema,get mode(){return mode},get ratio(){return ratio},setMode
  });
}
