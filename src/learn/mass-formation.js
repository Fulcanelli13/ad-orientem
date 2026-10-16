import { formationReaderCss, installFormationNavigation } from "./formation-ui.js";
import { resolveCanonicalAssetUrl } from "../assets/asset-registry.js";
import { massFormationScriptureHtml } from "./mass-formation-scripture-context.js";
import { sourceReferencePanelCss, sourceReferencePanelHtml } from "./source-reference-panel.js";
import { loadGuideRegistry } from "../mass/reader-guide.js";
import {massMomentsStudyCss,massMomentsStudyListHtml,massMomentStudyDetailHtml,massMomentStudyKeys} from "./mass-moments-study.js";
import {loadMassMomentEvidenceCatalog,massMomentEvidencePreviewEnabled,
 massMomentEvidenceReviewCss,massMomentEvidencePanelHtml,massMomentEvidenceSummaryHtml,
 sanitizeMassMomentEvidenceDecisions,massMomentEvidenceChoiceIsSafe,
 massMomentEvidenceDecisionExport} from "./mass-moment-evidence-review.js";

export const MASS_FORMATION_VERSION="mass-formation-campion-v1";
export const MASS_FORMATION_ROUTE="learn.mass";
export const MASS_FORMATION_ROOT_ID="ao-mass-formation-root";

const DATA_URL=new URL("../../data/learn/mass-formation-campion.v1.json",import.meta.url);
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const appState=win=>win?.AO_RUNTIME_V8?.store?.getState?.()??{};
const isFr=win=>appState(win)?.language==="fr"||String(win?.document?.documentElement?.lang||"").toLowerCase().startsWith("fr");
const pick=(win,value)=>{
  if(value==null)return "";
  if(typeof value==="string")return value;
  return String(isFr(win)?(value.fr??value.en??""):(value.en??value.fr??""));
};
const uiIcon=id=>{
  const url=resolveCanonicalAssetUrl(id);
  return url?'<span aria-hidden="true" style="display:inline-block;width:18px;height:18px;background:currentColor;-webkit-mask:url(\''+esc(url)+'\') center/contain no-repeat;mask:url(\''+esc(url)+'\') center/contain no-repeat"></span>':"";
};

function css(){
  return [
    "#"+MASS_FORMATION_ROOT_ID+"{position:fixed;inset:0 0 calc(var(--ao-global-ribbon-h,68px) + var(--safe-bottom,0px)) 0;z-index:14972;background:var(--ao-bg-canvas,var(--bg,#080c12));color:var(--ao-text-primary,var(--text,#eee9df));overflow:auto;overscroll-behavior:contain;font-family:var(--ao-font-body,var(--font-body,Georgia,serif))}",
    "#"+MASS_FORMATION_ROOT_ID+" *{box-sizing:border-box}",
    ".aoMFTop{position:sticky;top:0;z-index:4;display:grid;grid-template-columns:42px minmax(0,1fr) 42px;gap:8px;align-items:center;padding:11px 14px;background:color-mix(in srgb,var(--ao-bg-canvas,var(--bg,#080c12)) 94%,transparent);backdrop-filter:blur(14px);border-bottom:1px solid var(--ao-rule,var(--border,rgba(255,255,255,.12)))}",
    ".aoMFTop button{width:40px;height:40px;border:1px solid var(--ao-rule,var(--border,rgba(255,255,255,.14)));border-radius:10px;background:var(--ao-surface-1,var(--surface-1,#101821));color:inherit;display:grid;place-items:center}.aoMFTop div{text-align:center;min-width:0}.aoMFTop small{display:block;color:var(--liturgical,#c9ad78);font:.63rem/1.2 var(--ao-font-display,Georgia,serif);letter-spacing:.12em}.aoMFTop strong{display:block;margin-top:2px;font:600 1rem/1.2 var(--ao-font-display,Georgia,serif)}",
    ".aoMFWrap{width:min(800px,100%);margin:0 auto;padding:20px 15px 44px}.aoMFIntro{margin:0 0 18px;color:var(--muted,#9ba5b1);font-size:.96rem;line-height:1.5}.aoMFList{border-top:1px solid var(--border,rgba(255,255,255,.12))}",
    ".aoMFStageRow{width:100%;padding:15px 2px;border:0;border-bottom:1px solid var(--border,rgba(255,255,255,.12));background:transparent;color:inherit;text-align:left;display:grid;grid-template-columns:34px 1fr;gap:10px}.aoMFStageRow .n{display:grid;place-items:center;width:28px;height:28px;border:1px solid var(--liturgical-border,rgba(201,173,120,.4));border-radius:50%;color:var(--liturgical,#c9ad78);font:.7rem/1 var(--ao-font-display,Georgia,serif)}.aoMFStageRow strong{display:block;font:600 1rem/1.25 var(--ao-font-display,Georgia,serif)}.aoMFStageRow p{margin:4px 0 0;color:var(--muted,#9ba5b1);font-size:.82rem;line-height:1.45}",
    ".aoMFQuestion{margin:0 0 6px;color:var(--liturgical,#c9ad78);font:.68rem/1.2 var(--ao-font-display,Georgia,serif);letter-spacing:.09em;text-transform:uppercase}.aoMFStage h1{margin:0 0 9px;font:500 clamp(1.8rem,7vw,2.7rem)/1.08 var(--ao-font-display,Georgia,serif)}.aoMFStageLead{margin:0 0 20px;color:var(--muted,#9ba5b1);line-height:1.52}",
    ".aoMFBible{border-top:1px solid var(--border,rgba(255,255,255,.16));margin:24px 0 4px;padding-top:20px}.aoMFBible h2{margin:0 0 7px;font:500 1.2rem/1.28 var(--ao-font-display,Georgia,serif)}.aoMFBible>p{margin:0 0 14px;color:var(--muted,#9ba5b1);font:.82rem/1.5 var(--ao-font-ui,system-ui,sans-serif)}.aoMFBible ul{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:10px;margin:0;padding:0;list-style:none}.aoMFBibleItem{border:1px solid var(--border,rgba(255,255,255,.13));border-radius:10px;padding:9px}.aoMFBibleItem button{display:flex;width:100%;min-height:44px;gap:7px;flex-wrap:wrap;align-items:center;justify-content:space-between;text-align:left;color:var(--liturgical,#c9ad78);background:transparent;border:0;font:.85rem/1.4 var(--ao-font-ui,system-ui,sans-serif);cursor:pointer}.aoMFBibleItem button strong{font-weight:500}.aoMFBibleItem button span{font-size:.73rem}.aoMFBibleItem small{display:block;margin-top:5px;font:.72rem/1.45 var(--ao-font-ui,system-ui,sans-serif);color:var(--muted,#9ba5b1)}",
    ".aoMFClaim{padding:15px 0;border-top:1px solid var(--border,rgba(255,255,255,.11))}.aoMFClaim p{margin:0;line-height:1.62}.aoMFSources{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}.aoMFSources a{display:inline-flex;align-items:center;min-height:29px;padding:5px 8px;border:1px solid var(--border,rgba(255,255,255,.13));border-radius:999px;color:var(--liturgical,#c9ad78);font:.68rem/1.2 var(--ao-font-ui,system-ui,sans-serif);text-decoration:none}.aoMFNav{display:flex;justify-content:space-between;gap:8px;margin-top:20px}.aoMFNav button{min-height:38px;padding:8px 11px;border:1px solid var(--border,rgba(255,255,255,.14));border-radius:9px;background:var(--surface-1,#101821);color:inherit}.aoMFError{padding:12px;border:1px solid var(--liturgical-border,rgba(201,173,120,.4));border-radius:10px;color:var(--muted,#9ba5b1)}"
  ].join("")+massMomentsStudyCss()+massMomentEvidenceReviewCss()+sourceReferencePanelCss()+formationReaderCss();
}

async function loadData(fetchImpl=globalThis.fetch){
  if(typeof fetchImpl!=="function")throw new TypeError("fetch implementation required");
  const response=await fetchImpl(DATA_URL);
  if(!response?.ok)throw new Error("Unable to load Mass formation data ("+(response?.status??"network")+")");
  const data=await response.json();
  if(data?.schema!=="ao-mass-formation-campion-v1"||!Array.isArray(data?.stages)||!Array.isArray(data?.sources))throw new Error("Invalid Mass formation data");
  return data;
}

function sourceMap(data){return Object.fromEntries((data?.sources??[]).map(source=>[source.id,source]));}
function top(win,title){
  return '<style data-ao-mf-style>'+css()+'</style><header class="aoMFTop"><button type="button" data-ao-mf-back aria-label="'+esc(isFr(win)?"Retour":"Back")+'">'+uiIcon("ao-ui-back")+'</button><div><small>FORMATION</small><strong>'+esc(title)+'</strong></div><button type="button" data-ao-mf-close aria-label="'+esc(isFr(win)?"Fermer":"Close")+'">'+uiIcon("ao-ui-close")+'</button></header>';
}
function listHtml(win,data){
  const rows=data.stages.map(stage=>'<button type="button" class="aoMFStageRow" data-ao-mf-stage="'+esc(stage.id)+'"><span class="n">'+esc(stage.order)+'</span><span><strong>'+esc(pick(win,stage.title))+'</strong><p>'+esc(pick(win,stage.summary))+'</p></span></button>').join("");
  return top(win,pick(win,data.title))+'<main class="aoMFWrap"><p class="aoMFIntro">'+esc(pick(win,data.intro))+'</p>'+
  '<div class="aoMFStudyEntry"><button type="button" data-ao-mf-open-moments>'+
   esc(isFr(win)?"Parcourir les 32 moments de la Messe chantée":"Explore the 32 moments of the Sung Mass")+' →</button></div>'+
  '<div class="aoMFList">'+rows+'</div></main>';
}
// Further reading requires explicit editorial selection from sources already
// supporting the lesson. Third-party digitizations are not promoted automatically.
const MASS_FORMATION_FURTHER_READING=Object.freeze({
  MF01:["SRC-MEDIATOR-DEI"],MF02:["SRC-MEDIATOR-DEI"],
  MF03:["SRC-MEDIATOR-DEI"],MF04:[],
  MF05:["SRC-MEDIATOR-DEI"],MF06:["SRC-MEDIATOR-DEI"],
  MF07:["SRC-MEDIATOR-DEI"],MF08:["SRC-MEDIATOR-DEI"]
});
function stageHtml(win,data,stage){
  const sources=sourceMap(data);
  const claims=stage.claims.map(claim=>'<article class="aoMFClaim" data-ao-mf-claim="'+esc(claim.id)+'"><p>'+esc(pick(win,claim.text))+'</p></article>').join("");
  const evidence=stage.claims.map(claim=>({id:claim.id,text:pick(win,claim.text),sourceIds:claim.sources}));
  const references=sourceReferencePanelHtml({
    rows:evidence,registry:sources,french:isFr(win),idPrefix:stage.id,
    furtherReadingIds:MASS_FORMATION_FURTHER_READING[stage.id]||[]
  });
  return top(win,pick(win,stage.title))+'<main class="aoMFWrap aoMFStage"><div class="aoMFQuestion">'+esc(pick(win,stage.question))+'</div><h1>'+esc(pick(win,stage.title))+'</h1><p class="aoMFStageLead">'+esc(pick(win,stage.summary))+'</p>'+claims+
    massFormationScriptureHtml(stage.id,{french:isFr(win)})+references+
    '<nav class="aoMFNav"><button type="button" data-ao-mf-prev>'+esc(isFr(win)?"Précédent":"Previous")+'</button><button type="button" data-ao-mf-list>'+esc(isFr(win)?"Toutes les étapes":"All stages")+'</button><button type="button" data-ao-mf-next>'+esc(isFr(win)?"Suivant":"Next")+'</button></nav></main>';
}

export function createMassFormationRuntime(win=globalThis,{fetchImpl=globalThis.fetch}={}){
  const state={data:null,guideRegistry:null,view:"list",stageId:null,momentKey:null,
    guideError:false,returnFocus:null,loading:null,guideLoading:null,
    evidenceCatalog:null,evidenceLoading:null,evidenceError:false,evidenceChoices:{}};
  const root=()=>win?.document?.getElementById?.(MASS_FORMATION_ROOT_ID)??null;
  async function ensureData(){
    if(state.data)return state.data;
    if(!state.loading)state.loading=loadData(fetchImpl).then(data=>{state.data=data;return data}).finally(()=>{state.loading=null});
    return state.loading;
  }
  async function ensureGuides(){
    if(state.guideRegistry)return state.guideRegistry;
    if(!state.guideLoading)state.guideLoading=loadGuideRegistry({fetchImpl}).then(({registry})=>{
      state.guideRegistry=registry;state.guideError=false;return registry;
    }).finally(()=>{state.guideLoading=null});
    return state.guideLoading;
  }
  const evidenceStoreKey="ao.mass.source-evidence-triage.v1";
  async function ensureEvidence(){
    if(!massMomentEvidencePreviewEnabled(win))return null;
    if(state.evidenceCatalog)return state.evidenceCatalog;
    if(!state.evidenceLoading)state.evidenceLoading=loadMassMomentEvidenceCatalog({fetchImpl}).then(catalog=>{
      state.evidenceCatalog=catalog;state.evidenceError=false;
      try{state.evidenceChoices=sanitizeMassMomentEvidenceDecisions(
        catalog,JSON.parse(win?.localStorage?.getItem?.(evidenceStoreKey)||"{}"));}catch{state.evidenceChoices={};}
      return catalog;
    }).finally(()=>{state.evidenceLoading=null});
    return state.evidenceLoading;
  }
  function saveEvidenceDecision(id,choice){
    if(!state.evidenceCatalog||!state.evidenceCatalog.records.some(r=>r.id===id)||
      !massMomentEvidenceChoiceIsSafe(choice))return false;
    if(choice==="HOLD")delete state.evidenceChoices[id];
    else state.evidenceChoices[id]=choice;
    try{win?.localStorage?.setItem?.(evidenceStoreKey,JSON.stringify(state.evidenceChoices));}catch{}
    return true;
  }
  function exportEvidenceDecisions(){
    if(!state.evidenceCatalog||!massMomentEvidencePreviewEnabled(win))return false;
    const payload=massMomentEvidenceDecisionExport(state.evidenceCatalog,state.evidenceChoices);
    const blob=new win.Blob([JSON.stringify(payload,null,2)+"\n"],{type:"application/json"});
    const href=win.URL.createObjectURL(blob);
    const anchor=win.document.createElement("a");
    anchor.href=href;anchor.download="Ad_Orientem_Mass_Source_Triage_2026-10-16.json";
    win.document.body.append(anchor);anchor.click();anchor.remove();
    win.setTimeout?.(()=>win.URL.revokeObjectURL(href),1000);
    return true;
  }
  function ensureRoot(){
    const doc=win?.document;if(!doc?.body)return null;
    let node=root();if(node)return node;
    node=doc.createElement("section");node.id=MASS_FORMATION_ROOT_ID;node.dataset.aoMassFormationOwner=MASS_FORMATION_VERSION;node.setAttribute("role","region");node.setAttribute("aria-label","Understand the Mass");
    node.addEventListener("click",event=>{
      const target=event.target?.closest?.("button");if(!target)return;
      if(target.matches("[data-ao-mf-evidence-export]")){
        event.preventDefault();try{exportEvidenceDecisions();}catch(error){
          try{win.console?.warn?.("Source triage export failed",error);}catch{}
        }return;
      }
      if(target.matches("[data-ao-mf-close]")){event.preventDefault();close(true);return;}
      if(target.matches("[data-ao-mf-back],[data-ao-mf-list]")){event.preventDefault();
        if(state.view==="moment"){state.view="moments";state.momentKey=null;}
        else {state.view="list";state.stageId=null;}
        render();return;
      }
      if(target.matches("[data-ao-mf-open-moments]")){
        event.preventDefault();
        ensureGuides().then(()=>{if(!root())return;state.view="moments";state.stageId=null;render()})
          .catch(()=>{state.guideError=true;state.view="list";render()});
        return;
      }
      if(target.matches("[data-ao-mf-moments-list]")){
        event.preventDefault();state.view="moments";state.momentKey=null;render();return;
      }
      if(target.dataset.aoMfMoment&&state.guideRegistry?.entries?.[target.dataset.aoMfMoment]){
        event.preventDefault();state.view="moment";state.momentKey=target.dataset.aoMfMoment;render();return;
      }
      if(target.matches("[data-ao-mf-moment-prev],[data-ao-mf-moment-next]")&&state.guideRegistry){
        event.preventDefault();
        const keys=massMomentStudyKeys(state.guideRegistry),i=keys.indexOf(state.momentKey);
        const next=i+(target.matches("[data-ao-mf-moment-next]")?1:-1);
        if(next>=0&&next<keys.length){state.momentKey=keys[next];render()}return;
      }
      if(target.dataset.aoMfRelatedStage&&state.data?.stages?.some(s=>s.id===target.dataset.aoMfRelatedStage)){
        event.preventDefault();state.stageId=target.dataset.aoMfRelatedStage;state.view="stage";render();return;
      }
      if(target.dataset.aoMfStage){event.preventDefault();state.view="stage";state.stageId=target.dataset.aoMfStage;state.momentKey=null;render();return;}
      const stages=state.data?.stages??[],idx=stages.findIndex(x=>x.id===state.stageId);
      if(target.matches("[data-ao-mf-prev]")&&idx>0){event.preventDefault();state.stageId=stages[idx-1].id;render();return;}
      if(target.matches("[data-ao-mf-next]")&&idx>=0&&idx<stages.length-1){event.preventDefault();state.stageId=stages[idx+1].id;render();return;}
    });
    node.addEventListener("change",event=>{
      const select=event.target?.closest?.("[data-ao-mf-evidence-decision]");
      if(select&&massMomentEvidencePreviewEnabled(win))
        saveEvidenceDecision(select.dataset.aoMfEvidenceDecision,select.value);
    });
    doc.body.append(node);return node;
  }
  function render(){
    const node=ensureRoot();if(!node||!state.data)return false;
    const stage=state.data.stages.find(x=>x.id===state.stageId);
    const fr=isFr(win);
    const stageTitles=Object.fromEntries(state.data.stages.map(s=>[s.id,pick(win,s.title)]));
    node.innerHTML=state.view==="stage"&&stage?stageHtml(win,state.data,stage):
      state.view==="moments"&&state.guideRegistry?
        top(win,fr?"Moments de la Messe":"Mass moments")+massMomentsStudyListHtml(state.guideRegistry,{french:fr}):
      state.view==="moment"&&state.guideRegistry?.entries?.[state.momentKey]?
        top(win,state.guideRegistry.entries[state.momentKey].moment)+
          massMomentStudyDetailHtml(state.guideRegistry,state.momentKey,{french:fr,stageTitles}):
      listHtml(win,state.data)+(state.guideError?
        '<div role="status" class="aoMFError">'+esc(fr?"Le Guide est temporairement indisponible ; les leçons restent accessibles.":"The Guide is temporarily unavailable; the lessons remain available.")+'</div>':"");
    if(state.view==="moments"&&state.evidenceCatalog&&massMomentEvidencePreviewEnabled(win)){
      const main=node.querySelector(".aoMFMomentsList");
      if(main){
        main.insertAdjacentHTML("afterbegin",massMomentEvidenceSummaryHtml(state.evidenceCatalog,{french:fr}));
        const counts=new Map();
        for(const claim of state.evidenceCatalog.records)
          for(const key of claim.guideIds)counts.set(key,(counts.get(key)||0)+1);
        for(const button of main.querySelectorAll("[data-ao-mf-moment]")){
          const count=counts.get(button.dataset.aoMfMoment)||0;
          if(!count)continue;
          const hint=node.ownerDocument.createElement("small");
          hint.className="aoMFEvidenceNote";hint.style.display="block";
          hint.textContent=count+" "+(fr?"références de recherche":"research references");
          button.querySelector("span:last-child")?.append(hint);
        }
      }
    }
    if(state.view==="moment"&&massMomentEvidencePreviewEnabled(win)){
      const main=node.querySelector(".aoMFMomentDetail");
      const nav=main?.querySelector(".aoMFNav");
      if(state.evidenceCatalog&&nav){
        nav.insertAdjacentHTML("beforebegin",massMomentEvidencePanelHtml(
          state.evidenceCatalog,state.momentKey,{french:fr,decisions:state.evidenceChoices}));
      }else if(state.evidenceError&&nav){
        const note=fr?"Sources de recherche indisponibles. Le Guide reste accessible.":
          "Research source review unavailable. Existing Guide is unaffected.";
        nav.insertAdjacentHTML("beforebegin",'<p class="aoMFEvidenceNote" role="status">'+esc(note)+'</p>');
      }
    }
    node.hidden=false;node.removeAttribute("aria-hidden");node.scrollTop=0;
    installFormationNavigation(win,node);
    queueMicrotask(()=>node.querySelector("button,a[href]")?.focus?.({preventScroll:true}));
    return true;
  }
  async function open(opts={}){
    state.returnFocus=opts.trigger??win?.document?.activeElement??null;
    try{await ensureData()}catch(error){
      const node=ensureRoot();if(node)node.innerHTML=top(win,isFr(win)?"Comprendre la Messe":"Understand the Mass")+'<main class="aoMFWrap"><div class="aoMFError">'+esc(String(error?.message??error))+'</div></main>';
      return false;
    }
    state.view=opts.stageId&&state.data.stages.some(x=>x.id===opts.stageId)?"stage":"list";
    state.stageId=state.view==="stage"?opts.stageId:null;
    state.momentKey=null;
    if(massMomentEvidencePreviewEnabled(win)){
      try{await ensureEvidence();}catch{state.evidenceError=true;}
    }
    if(opts.momentKey){
      try{
        const guides=await ensureGuides();
        if(guides.entries[opts.momentKey]){state.view="moment";state.momentKey=opts.momentKey;}
      }catch{state.guideError=true;}
    }else if(opts.view==="moments"){
      try{await ensureGuides();state.view="moments";}
      catch{state.guideError=true;}
    }
    win?.document?.body?.classList?.add?.("aoMassFormationOpen");
    render();return true;
  }
  function close(returnToLearn=false){
    const node=root();try{node?.querySelector?.(":focus")?.blur?.()}catch{}node?.remove?.();win?.document?.body?.classList?.remove?.("aoMassFormationOpen");
    state.view="list";state.stageId=null;state.momentKey=null;
    if(returnToLearn)Promise.resolve().then(()=>win?.AO_LEARN_APP_V1?.open?.());
    else try{state.returnFocus?.focus?.({preventScroll:true})}catch{}
    state.returnFocus=null;return true;
  }
  function status(){return Object.freeze({version:MASS_FORMATION_VERSION,installed:true,open:Boolean(root()),view:state.view,stageId:state.stageId,stages:state.data?.stages?.length??0,moments:state.guideRegistry?32:0,momentKey:state.momentKey,sourceBacked:Boolean(state.data),evidenceReview:massMomentEvidencePreviewEnabled(win)&&Boolean(state.evidenceCatalog),evidenceTriageCount:Object.keys(state.evidenceChoices).length});}
  return Object.freeze({version:MASS_FORMATION_VERSION,open,close,render,status});
}

export function ensureMassFormationRegistry(win=globalThis){
  if(win?.AO_MODULES?.__aoMassFormationV1)return win.AO_MODULES;
  const base=win?.AO_MODULES;if(!base)return null;
  const runtime=win.AO_MASS_FORMATION_V1||createMassFormationRuntime(win);win.AO_MASS_FORMATION_V1=runtime;
  const definition=Object.freeze({id:MASS_FORMATION_ROUTE,type:"module",domain:"learn",category:"mass-formation",title:"Understand the Mass"});
  const wrapper={...base,__aoMassFormationV1:true,
    get(id){return id===MASS_FORMATION_ROUTE?definition:base.get?.(id)||null;},
    resolve(id){if(id===MASS_FORMATION_ROUTE)return {ok:true,input:id,id,defaults:{},chain:[id],definition};return base.resolve?.(id);},
    async open(id,opts={}){if(id===MASS_FORMATION_ROUTE)return {ok:await runtime.open(opts),input:String(id),canonicalId:id,type:"module",domain:"learn",options:opts,aliasChain:[id],error:null};return base.open?.(id,opts);},
    list(filter={}){const prior=[...(base.list?.(filter)||[])].filter(item=>item?.id!==MASS_FORMATION_ROUTE);if((!filter.type||filter.type==="module")&&(!filter.domain||String(filter.domain).toLowerCase()==="learn"))prior.push(definition);return prior;}
  };
  win.AO_MODULES=wrapper;win.AO_MODULE_REGISTRY_V36=wrapper;return wrapper;
}

export function installMassFormationModule(win=globalThis){
  if(!win)return false;
  if(!win.AO_MASS_FORMATION_V1)win.AO_MASS_FORMATION_V1=createMassFormationRuntime(win);
  ensureMassFormationRegistry(win);
  return win.AO_MASS_FORMATION_V1;
}

if(typeof window!=="undefined"&&typeof document!=="undefined")installMassFormationModule(window);
