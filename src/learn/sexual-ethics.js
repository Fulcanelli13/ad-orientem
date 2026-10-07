import {
  CSE_QUESTIONS,
  CSE_QUESTION_MAP,
  CSE_SECTIONS,
  CSE_SECTION_MAP,
  CSE_SOURCE_MAP,
  CSE_VALIDATION,
  SEXUAL_ETHICS_ROUTE,
  SEXUAL_ETHICS_VERSION,
} from "./sexual-ethics-data/index.js";
import { CSE_RELATED_TARGETS, relatedTargetsFor } from "./sexual-ethics-data/sot.js";

export const SEXUAL_ETHICS_ROOT_ID="ao-sexual-ethics-root";

const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]));
const stateOf=win=>win?.AO_RUNTIME_V8?.store?.getState?.()||{};
const isFr=win=>stateOf(win)?.language==="fr"||String(win?.document?.documentElement?.lang||"").toLowerCase().startsWith("fr");
const L=(win,en,fr)=>isFr(win)?fr:en;
const pick=(win,pair)=>pair?.[isFr(win)?1:0]||pair?.[0]||"";
const norm=value=>String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();

const DEPTH_LABELS=Object.freeze({
  STANDARD:["Answer","Réponse"],
  EXPANDED:["Expanded","Approfondie"],
  DEBATE:["Debate","Débat"],
});
const LAYER_LABELS=Object.freeze({
  PERENNIAL:["Perennial doctrine","Doctrine pérenne"],
  LATER_APPLICATION:["Later application","Application ultérieure"],
  PASTORAL_CASE:["Pastoral case","Cas pastoral"],
});

function css(){
  return `
#${SEXUAL_ETHICS_ROOT_ID}{position:fixed;inset:0 0 calc(var(--ao-global-ribbon-h,68px) + var(--safe-bottom,0px)) 0;z-index:14982;background:var(--bg,#07111d);color:var(--text,#eee9df);overflow:auto;overscroll-behavior:contain;font-family:var(--font-liturgical,Georgia,serif)}
#${SEXUAL_ETHICS_ROOT_ID} *{box-sizing:border-box}
.aoCSETop{position:sticky;top:0;z-index:6;display:grid;grid-template-columns:44px minmax(0,1fr) 44px;align-items:center;gap:8px;padding:calc(12px + var(--safe-top,0px)) 12px 12px;background:color-mix(in srgb,var(--bg,#07111d) 94%,transparent);backdrop-filter:blur(12px);border-bottom:1px solid var(--border,rgba(255,255,255,.13))}
.aoCSETop button,.aoCSEBtn{min-height:44px;border:1px solid var(--border,rgba(255,255,255,.16));border-radius:10px;background:var(--surface-1,#102235);color:inherit;padding:8px 11px}.aoCSETop button{width:44px;padding:0;font-size:1.1rem}
.aoCSETop small{display:block;color:var(--liturgical,#c7ae6d);font:600 .65rem/1.2 var(--font-display,serif);letter-spacing:.1em;text-transform:uppercase}.aoCSETop strong{display:block;margin-top:2px;font:600 clamp(1.05rem,4.6vw,1.45rem)/1.12 var(--font-display,Georgia,serif)}
.aoCSEWrap{width:min(900px,100%);margin:0 auto;padding:18px 16px 48px}.aoCSEIntro{margin:0 0 14px;color:var(--muted,rgba(238,233,223,.72));line-height:1.55}.aoCSENote{margin:12px 0 18px;padding:12px;border-left:2px solid var(--liturgical,#c7ae6d);background:var(--liturgical-soft,rgba(199,174,109,.07));color:var(--muted,rgba(238,233,223,.76));font-size:.78rem;line-height:1.5}
.aoCSESearch{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;margin:0 0 18px}.aoCSESearch input{min-height:44px;width:100%;border:1px solid var(--border,rgba(255,255,255,.16));border-radius:10px;background:var(--surface-1,#102235);color:inherit;padding:9px 12px;font:inherit}.aoCSESearch input:focus{outline:2px solid var(--liturgical,#c7ae6d);outline-offset:1px}.aoCSECount{align-self:center;color:var(--muted);font-size:.74rem}
.aoCSEList{display:grid;border-top:1px solid var(--border,rgba(255,255,255,.13))}.aoCSERow{width:100%;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;padding:14px 2px;border:0;border-bottom:1px solid var(--border,rgba(255,255,255,.13));background:transparent;color:inherit;text-align:left}.aoCSERow strong{font:600 1rem/1.3 var(--font-display,Georgia,serif)}.aoCSERow span{color:var(--muted,rgba(238,233,223,.62));font-size:.72rem}.aoCSERow:hover,.aoCSERow:focus-visible{outline:none;background:rgba(255,255,255,.025)}
.aoCSESectionMeta{display:flex;gap:7px;align-items:center;flex-wrap:wrap;margin-top:5px}.aoCSEBadge{display:inline-flex;padding:3px 7px;border:1px solid var(--liturgical-border,rgba(199,174,109,.35));border-radius:999px;color:var(--liturgical,#c7ae6d);font:600 .61rem/1.2 var(--font-display,system-ui);letter-spacing:.055em;text-transform:uppercase}.aoCSELayer{color:var(--muted);font-size:.68rem}
.aoCSEQNum{color:var(--liturgical,#c7ae6d);font:600 .7rem/1.2 var(--font-display,serif);letter-spacing:.08em}.aoCSEQuestion{margin:6px 0 14px;font:600 clamp(1.45rem,6vw,2.2rem)/1.12 var(--font-display,Georgia,serif)}.aoCSEAnswer{margin:0;padding:16px;border:1px solid var(--border,rgba(255,255,255,.14));border-radius:13px;background:var(--surface-1,#102235);font-size:1rem;line-height:1.62}
.aoCSEExplore{margin-top:12px}.aoCSEDetail{margin-top:12px;padding:14px;border-left:2px solid var(--liturgical,#c7ae6d);background:var(--liturgical-soft,rgba(199,174,109,.07));line-height:1.62}.aoCSEDetail[hidden]{display:none!important}
.aoCSERelated{margin:17px 0 0;padding-top:11px;border-top:1px solid var(--border,rgba(255,255,255,.13))}.aoCSERelated small{display:block;margin-bottom:8px;color:var(--muted);font-size:.7rem;text-transform:uppercase;letter-spacing:.08em}.aoCSERelatedButtons{display:flex;gap:8px;flex-wrap:wrap}.aoCSERelated .aoCSEBtn{font-size:.76rem}\n.aoCSESources{margin:17px 0 0;border-top:1px solid var(--border,rgba(255,255,255,.13));padding-top:11px}.aoCSESources summary{cursor:pointer;color:var(--muted);font-size:.78rem}.aoCSESource{margin:9px 0;padding-left:10px;border-left:1px solid var(--border,rgba(255,255,255,.14));font-size:.76rem;line-height:1.45}.aoCSESource a{color:var(--liturgical,#c7ae6d)}.aoCSESource em{color:var(--muted);font-style:normal}
.aoCSEEmpty{padding:22px 0;color:var(--muted);line-height:1.5}
@media(max-width:520px){.aoCSEWrap{padding-left:13px;padding-right:13px}.aoCSETop{padding-left:8px;padding-right:8px}.aoCSESearch{grid-template-columns:1fr}.aoCSECount{justify-self:start}}
`;
}

function top(win,title,kicker){
  return `<style data-ao-cse-style>${css()}</style><header class="aoCSETop"><button type="button" data-ao-cse-back aria-label="${esc(L(win,"Back","Retour"))}">‹</button><div><small>${esc(kicker||L(win,"Formation","Formation"))}</small><strong>${esc(title)}</strong></div><button type="button" data-ao-cse-close aria-label="${esc(L(win,"Close","Fermer"))}">×</button></header>`;
}

function depthLabel(win,depth){const pair=DEPTH_LABELS[depth]||DEPTH_LABELS.STANDARD;return L(win,pair[0],pair[1]);}
function layerLabel(win,layer){const pair=LAYER_LABELS[layer]||LAYER_LABELS.PERENNIAL;return L(win,pair[0],pair[1]);}

function relatedDetails(win,item){
  const targets=relatedTargetsFor(item);
  if(!targets.length)return "";
  return `<div class="aoCSERelated"><small>${esc(L(win,"Related in Ad Orientem","À voir aussi dans Ad Orientem"))}</small><div class="aoCSERelatedButtons">${targets.map(target=>`<button type="button" class="aoCSEBtn" data-ao-cse-related="${esc(target.id)}">${esc(pick(win,target.label))} →</button>`).join("")}</div></div>`;
}

function sourceDetails(win,item){
  const refs=item.refs||[];
  if(!refs.length)return "";
  return `<details class="aoCSESources"><summary>${esc(L(win,"Sources & provenance","Sources & provenance"))} ▾</summary>${refs.map(([sourceId,locator])=>{
    const source=CSE_SOURCE_MAP[sourceId];if(!source)return "";
    const url=isFr(win)?(source.canonical_url_fr||source.canonical_url):source.canonical_url;
    const authority=source.authority_type?String(source.authority_type).replaceAll("_"," "):"";
    return `<div class="aoCSESource"><strong>${esc(source.title)}</strong>${locator?` · ${esc(locator)}`:""}<br><em>${esc(authority)}${source.role==="argument_lead"?` · ${esc(L(win,"research / argument lead","guide de recherche / argumentation"))}`:""}</em>${url?` · <a href="${esc(url)}" target="_blank" rel="noopener">${esc(L(win,"Open","Ouvrir"))} ↗</a>`:""}</div>`;
  }).join("")}</details>`;
}

function searchQuestions(query,win){
  const needle=norm(query);
  if(!needle)return [];
  return CSE_QUESTIONS.filter(item=>{
    const hay=[...item.q,...item.a,...(item.d||[])].map(norm).join(" ");
    return hay.includes(needle);
  });
}

function questionRow(win,item){
  return `<button type="button" class="aoCSERow" data-ao-cse-question="${esc(item.id)}"><div><strong>${esc(pick(win,item.q))}</strong><div class="aoCSESectionMeta">${item.depth!=="STANDARD"?`<span class="aoCSEBadge">${esc(depthLabel(win,item.depth))}</span>`:""}${item.layer!=="PERENNIAL"?`<span class="aoCSELayer">${esc(layerLabel(win,item.layer))}</span>`:""}</div></div><span>${esc(String(item.number).padStart(3,"0"))} ›</span></button>`;
}

function searchBox(win,query,count){
  return `<div class="aoCSESearch"><input type="search" data-ao-cse-search value="${esc(query||"")}" placeholder="${esc(L(win,"Search all 150 questions…","Rechercher dans les 150 questions…"))}" aria-label="${esc(L(win,"Search sexual ethics questions","Rechercher dans les questions de morale sexuelle"))}"><span class="aoCSECount">${count==null?"":esc(L(win,`${count} result${count===1?"":"s"}`,`${count} résultat${count===1?"":"s"}`))}</span></div>`;
}

function sectionsHtml(win,state){
  const results=state.query?searchQuestions(state.query,win):[];
  if(state.query){
    return `${top(win,L(win,"Catholic Sexual Ethics","Morale sexuelle catholique"))}<main class="aoCSEWrap">${searchBox(win,state.query,results.length)}${results.length?`<div class="aoCSEList">${results.map(item=>questionRow(win,item)).join("")}</div>`:`<div class="aoCSEEmpty">${esc(L(win,"No matching question.","Aucune question correspondante."))}</div>`}</main>`;
  }
  return `${top(win,L(win,"Catholic Sexual Ethics","Morale sexuelle catholique"))}<main class="aoCSEWrap"><p class="aoCSEIntro">${esc(L(win,"150 concise, source-backed questions on Catholic sexual ethics. Most answers are brief; only the most important objections open into a deeper argument.","150 questions concises et sourcées sur la morale sexuelle catholique. La plupart des réponses sont brèves ; seules les objections les plus importantes s’ouvrent sur une argumentation plus approfondie."))}</p><div class="aoCSENote">${esc(L(win,"Research architecture informed by Lawler · Boyle · May; doctrinal claims are traced to the cited primary or authoritative sources.","Architecture de recherche éclairée par Lawler · Boyle · May ; les affirmations doctrinales sont rattachées aux sources primaires ou autorisées citées."))}</div>${searchBox(win,"",null)}<div class="aoCSEList">${CSE_SECTIONS.map(section=>`<button type="button" class="aoCSERow" data-ao-cse-section="${esc(section.id)}"><strong>${esc(pick(win,section.title))}</strong><span>10 ${esc(L(win,"questions","questions"))} ›</span></button>`).join("")}</div></main>`;
}

function sectionHtml(win,section){
  const items=CSE_QUESTIONS.filter(item=>item.section===section.id);
  return `${top(win,pick(win,section.title),L(win,"Catholic Sexual Ethics","Morale sexuelle catholique"))}<main class="aoCSEWrap"><p class="aoCSEIntro">${esc(L(win,"Choose a question. Debate and Expanded entries contain an optional deeper explanation.","Choisissez une question. Les entrées Débat et Approfondie comportent une explication facultative plus développée."))}</p><div class="aoCSEList">${items.map(item=>questionRow(win,item)).join("")}</div></main>`;
}

function questionHtml(win,item,reveal){
  const detail=item.d?pick(win,item.d):"";
  const section=CSE_SECTION_MAP[item.section];
  return `${top(win,pick(win,section?.title||["Catholic Sexual Ethics","Morale sexuelle catholique"]),L(win,"Catholic Sexual Ethics","Morale sexuelle catholique"))}<main class="aoCSEWrap"><div class="aoCSEQNum">CSE · ${esc(String(item.number).padStart(3,"0"))}</div><h1 class="aoCSEQuestion">${esc(pick(win,item.q))}</h1><div class="aoCSESectionMeta"><span class="aoCSEBadge">${esc(depthLabel(win,item.depth))}</span><span class="aoCSELayer">${esc(layerLabel(win,item.layer))}</span></div><p class="aoCSEAnswer">${esc(pick(win,item.a))}</p>${detail?`<div class="aoCSEExplore"><button type="button" class="aoCSEBtn" data-ao-cse-reveal>${esc(reveal?L(win,"Hide deeper explanation","Masquer l’explication approfondie"):L(win,item.depth==="DEBATE"?"Explore the objection":"Go deeper",item.depth==="DEBATE"?"Explorer l’objection":"Approfondir"))}</button><div class="aoCSEDetail" ${reveal?"":"hidden"}>${esc(detail)}</div></div>`:""}${relatedDetails(win,item)}${sourceDetails(win,item)}</main>`;
}

export function createSexualEthicsRuntime(win=globalThis){
  const state={view:"sections",sectionId:null,questionId:null,query:"",reveal:false,returnView:"sections"};
  function root(){return win?.document?.getElementById?.(SEXUAL_ETHICS_ROOT_ID)||null;}
  function ensureRoot(){
    const doc=win?.document;if(!doc?.body)return null;
    let node=root();if(node)return node;
    node=doc.createElement("section");node.id=SEXUAL_ETHICS_ROOT_ID;node.dataset.aoSexualEthicsVersion=SEXUAL_ETHICS_VERSION;
    node.setAttribute("role","region");node.setAttribute("aria-label",L(win,"Catholic Sexual Ethics","Morale sexuelle catholique"));
    node.addEventListener("click",event=>{
      const target=event.target?.closest?.("button,a");if(!target)return;
      if(target.matches("[data-ao-cse-close]")){event.preventDefault?.();close(true);return;}
      if(target.matches("[data-ao-cse-back]")){event.preventDefault?.();back();return;}
      if(target.dataset.aoCseSection){event.preventDefault?.();openSection(target.dataset.aoCseSection);return;}
      if(target.dataset.aoCseQuestion){event.preventDefault?.();openQuestion(target.dataset.aoCseQuestion);return;}
      if(target.dataset.aoCseRelated){event.preventDefault?.();openRelated(target.dataset.aoCseRelated);return;}
      if(target.matches("[data-ao-cse-reveal]")){event.preventDefault?.();state.reveal=!state.reveal;render();return;}
    });
    node.addEventListener("input",event=>{
      const input=event.target?.closest?.("[data-ao-cse-search]");if(!input)return;
      state.query=input.value||"";state.view="sections";state.sectionId=null;state.questionId=null;state.reveal=false;render({preserveSearchFocus:true});
    });
    doc.body.append(node);return node;
  }
  function render({preserveSearchFocus=false}={}){
    const node=ensureRoot();if(!node)return false;
    if(state.view==="question"&&CSE_QUESTION_MAP[state.questionId])node.innerHTML=questionHtml(win,CSE_QUESTION_MAP[state.questionId],state.reveal);
    else if(state.view==="section"&&CSE_SECTION_MAP[state.sectionId])node.innerHTML=sectionHtml(win,CSE_SECTION_MAP[state.sectionId]);
    else node.innerHTML=sectionsHtml(win,state);
    node.hidden=false;node.removeAttribute("aria-hidden");
    if(preserveSearchFocus){
      const input=node.querySelector?.("[data-ao-cse-search]");if(input){const p=input.value.length;queueMicrotask(()=>{try{input.focus({preventScroll:true});input.setSelectionRange(p,p);}catch{}});}
    }
    return true;
  }
  function open(opts={}){
    if(!CSE_VALIDATION.ok){try{win?.console?.error?.("Catholic Sexual Ethics corpus invalid",CSE_VALIDATION.errors);}catch{}return false;}
    state.query="";
    if(opts.questionId&&CSE_QUESTION_MAP[opts.questionId]){state.questionId=opts.questionId;state.sectionId=CSE_QUESTION_MAP[opts.questionId].section;state.view="question";state.returnView="section";}
    else if(opts.sectionId&&CSE_SECTION_MAP[opts.sectionId]){state.sectionId=opts.sectionId;state.view="section";}
    else{state.view="sections";state.sectionId=null;state.questionId=null;}
    state.reveal=false;win?.document?.body?.classList?.add?.("aoSexualEthicsOpen");render();return true;
  }
  function openSection(id){if(!CSE_SECTION_MAP[id])return false;state.sectionId=id;state.questionId=null;state.view="section";state.reveal=false;state.query="";render();root()?.scrollTo?.(0,0);return true;}
  function openQuestion(id){const item=CSE_QUESTION_MAP[id];if(!item)return false;state.returnView=state.query?"sections":"section";state.questionId=id;state.sectionId=item.section;state.view="question";state.reveal=false;render();root()?.scrollTo?.(0,0);return true;}
  function openRelated(id){
    const target=CSE_RELATED_TARGETS[id];if(!target)return false;
    close(false);
    if(target.surface==="learn"){
      try{return win?.AO_MODULES?.open?.(id,{from:SEXUAL_ETHICS_ROUTE})??false;}catch{return false;}
    }
    if(target.surface==="pray"){
      try{
        if(typeof win?.AO_PRAY_V435930?.open==="function")return win.AO_PRAY_V435930.open(id,{returnContext:SEXUAL_ETHICS_ROUTE})!==false;
        return win?.AO_PRAY_APP_V1?.open?.()??false;
      }catch{return false;}
    }
    return false;
  }
  function back(){
    if(state.view==="question"){state.questionId=null;state.reveal=false;state.view=state.returnView==="sections"?"sections":"section";render();return true;}
    if(state.view==="section"){state.view="sections";state.sectionId=null;render();return true;}
    return close(true);
  }
  function close(returnToLearn=false){const node=root();try{node?.querySelector?.(":focus")?.blur?.();}catch{}node?.remove?.();win?.document?.body?.classList?.remove?.("aoSexualEthicsOpen");state.view="sections";state.sectionId=null;state.questionId=null;state.query="";state.reveal=false;if(returnToLearn)Promise.resolve().then(()=>win?.AO_LEARN_APP_V1?.open?.());return true;}
  function status(){return Object.freeze({version:SEXUAL_ETHICS_VERSION,installed:true,open:Boolean(root()),route:SEXUAL_ETHICS_ROUTE,view:state.view,sectionId:state.sectionId,questionId:state.questionId,questions:CSE_QUESTIONS.length,sections:CSE_SECTIONS.length,validation:CSE_VALIDATION});}
  return Object.freeze({version:SEXUAL_ETHICS_VERSION,open,openSection,openQuestion,close,back,render,status});
}

export function ensureSexualEthicsRegistry(win=globalThis){
  if(win?.AO_MODULES?.__aoSexualEthicsV1)return win.AO_MODULES;
  const base=win?.AO_MODULES;if(!base)return null;
  const runtime=win.AO_SEXUAL_ETHICS_V1||createSexualEthicsRuntime(win);win.AO_SEXUAL_ETHICS_V1=runtime;
  const definition=Object.freeze({id:SEXUAL_ETHICS_ROUTE,type:"module",domain:"learn",category:"sexual-ethics",title:"Catholic Sexual Ethics"});
  const wrapper={...base,__aoSexualEthicsV1:true,
    get(id){return id===SEXUAL_ETHICS_ROUTE?definition:base.get?.(id)||null;},
    resolve(id){if(id===SEXUAL_ETHICS_ROUTE)return {ok:true,input:id,id,defaults:{},chain:[id],definition};return base.resolve?.(id);},
    async open(id,opts={}){if(id===SEXUAL_ETHICS_ROUTE)return {ok:runtime.open(opts),input:String(id),canonicalId:id,type:"module",domain:"learn",options:opts,aliasChain:[id],error:null};return base.open?.(id,opts);},
    list(filter={}){const prior=[...(base.list?.(filter)||[])].filter(item=>item?.id!==SEXUAL_ETHICS_ROUTE);if((!filter.type||filter.type==="module")&&(!filter.domain||String(filter.domain).toLowerCase()==="learn"))prior.push(definition);return prior;}
  };
  win.AO_MODULES=wrapper;win.AO_MODULE_REGISTRY_V36=wrapper;return wrapper;
}

export function installSexualEthicsModule(win=globalThis){
  if(!win)return false;
  if(!win.AO_SEXUAL_ETHICS_V1)win.AO_SEXUAL_ETHICS_V1=createSexualEthicsRuntime(win);
  ensureSexualEthicsRegistry(win);
  return win.AO_SEXUAL_ETHICS_V1;
}
