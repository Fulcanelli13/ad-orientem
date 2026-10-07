import {
  CATHOLIC_LIFE_COURSES,
  CATHOLIC_LIFE_COURSE_MAP,
  CATHOLIC_LIFE_STAGE_MAP,
  CATHOLIC_LIFE_SOURCE_MAP,
  CATHOLIC_LIFE_VALIDATION,
  CATHOLIC_LIFE_VERSION,
  CATHOLIC_LIFE_ROUTE,
} from "./catholic-life-data/index.js";

export const CATHOLIC_LIFE_ROOT_ID="ao-catholic-life-root";

const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]));
const stateOf=win=>win?.AO_RUNTIME_V8?.store?.getState?.()||{};
const isFr=win=>stateOf(win)?.language==="fr"||String(win?.document?.documentElement?.lang||"").toLowerCase().startsWith("fr");
const L=(win,en,fr)=>isFr(win)?fr:en;

const LAYER_LABELS=Object.freeze({
  SHARED:["Shared","Commun"],
  PROFILE_1962:["1962","1962"],
  CURRENT:["Current","Actuel"],
  PASTORAL:["Pastoral","Pastoral"],
  HISTORICAL:["Historical","Historique"],
  CUSTOM:["Custom","Coutume"],
  PRODUCT:["Ad Orientem","Ad Orientem"],
});

function css(){
  return `
#${CATHOLIC_LIFE_ROOT_ID}{position:fixed;inset:0 0 calc(var(--ao-global-ribbon-h,68px) + var(--safe-bottom,0px)) 0;z-index:14980;background:var(--bg,#07111d);color:var(--text,#eee9df);overflow:auto;overscroll-behavior:contain;font-family:var(--font-liturgical,Georgia,serif)}
#${CATHOLIC_LIFE_ROOT_ID} *{box-sizing:border-box}
.aoCLTop{position:sticky;top:0;z-index:5;display:grid;grid-template-columns:44px minmax(0,1fr) 44px;align-items:center;gap:8px;padding:calc(12px + var(--safe-top,0px)) 12px 12px;background:color-mix(in srgb,var(--bg,#07111d) 94%,transparent);backdrop-filter:blur(12px);border-bottom:1px solid var(--border,rgba(255,255,255,.13))}
.aoCLTop button,.aoCLBtn{min-height:44px;border:1px solid var(--border,rgba(255,255,255,.16));border-radius:10px;background:var(--surface-1,#102235);color:inherit;padding:8px 11px}
.aoCLTop button{width:44px;padding:0;font-size:1.1rem}.aoCLTop small{display:block;color:var(--liturgical,#c7ae6d);font:600 .65rem/1.2 var(--font-display,serif);letter-spacing:.1em;text-transform:uppercase}.aoCLTop strong{display:block;margin-top:2px;font:600 clamp(1.15rem,5vw,1.55rem)/1.1 var(--font-display,Georgia,serif)}
.aoCLWrap{width:min(880px,100%);margin:0 auto;padding:18px 16px 44px}.aoCLIntro{color:var(--muted,rgba(238,233,223,.72));line-height:1.55;margin:0 0 18px}
.aoCLList{display:grid;border-top:1px solid var(--border,rgba(255,255,255,.13))}.aoCLRow{width:100%;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;padding:15px 2px;border:0;border-bottom:1px solid var(--border,rgba(255,255,255,.13));background:transparent;color:inherit;text-align:left}.aoCLRow strong{font:600 1.02rem/1.25 var(--font-display,Georgia,serif)}.aoCLRow span{color:var(--muted,rgba(238,233,223,.62));font-size:.76rem}
.aoCLQuestion{margin:4px 0 8px;color:var(--liturgical,#c7ae6d);font:600 .75rem/1.3 var(--font-display,serif);letter-spacing:.07em;text-transform:uppercase}.aoCLObjective{margin:0 0 18px;color:var(--muted,rgba(238,233,223,.72));line-height:1.55}
.aoCLCard{padding:16px 0;border-bottom:1px solid var(--border,rgba(255,255,255,.13))}.aoCLCard h2{margin:0 0 9px;font:600 1.05rem/1.25 var(--font-display,Georgia,serif)}.aoCLClaim{margin:0 0 13px}.aoCLClaim p{margin:6px 0 0;line-height:1.58}.aoCLBadge{display:inline-flex;align-items:center;padding:3px 7px;border:1px solid var(--liturgical-border,rgba(199,174,109,.35));border-radius:999px;color:var(--liturgical,#c7ae6d);font:600 .61rem/1.2 var(--font-display,system-ui);letter-spacing:.055em;text-transform:uppercase}.aoCLTerritory{margin-left:6px;color:var(--muted);font-size:.68rem}
.aoCLSources{margin:7px 0 0}.aoCLSources summary{cursor:pointer;color:var(--muted,rgba(238,233,223,.62));font-size:.72rem}.aoCLSource{margin:7px 0;padding-left:10px;border-left:1px solid var(--border,rgba(255,255,255,.14));font-size:.75rem;line-height:1.4}.aoCLSource a{color:var(--liturgical,#c7ae6d)}
.aoCLApplication{margin:22px 0;padding:15px;border:1px solid var(--border,rgba(255,255,255,.15));border-radius:12px;background:var(--surface-1,#102235)}.aoCLApplication small{color:var(--liturgical,#c7ae6d);font:600 .65rem/1.2 var(--font-display,serif);letter-spacing:.08em;text-transform:uppercase}.aoCLApplication p{line-height:1.5}.aoCLAnswer{margin-top:11px;padding:11px;border-left:2px solid var(--liturgical,#c7ae6d);background:var(--liturgical-soft,rgba(199,174,109,.08))}
.aoCLCompletion{margin:22px 0 0;padding:13px 0;border-top:1px solid var(--border,rgba(255,255,255,.13));color:var(--muted);line-height:1.5}.aoCLNav{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.aoCLBtn.primary{border-color:var(--liturgical-border,rgba(199,174,109,.4));background:var(--liturgical-soft,rgba(199,174,109,.13))}
@media(max-width:520px){.aoCLWrap{padding-left:13px;padding-right:13px}.aoCLTop{padding-left:8px;padding-right:8px}}
`;
}

function top(win,title,kicker="Catholic Life"){
  return `<style data-ao-catholic-life-style>${css()}</style><header class="aoCLTop"><button type="button" data-ao-cl-back aria-label="${esc(L(win,"Back","Retour"))}">‹</button><div><small>${esc(kicker)}</small><strong>${esc(title)}</strong></div><button type="button" data-ao-cl-close aria-label="${esc(L(win,"Close","Fermer"))}">×</button></header>`;
}

function sourceDetails(win,sourceIds=[]){
  const records=[...new Set(sourceIds)].map(id=>CATHOLIC_LIFE_SOURCE_MAP[id]).filter(Boolean);
  if(!records.length)return "";
  return `<details class="aoCLSources"><summary>${esc(L(win,"Sources","Sources"))} ▾</summary>${records.map(source=>`<div class="aoCLSource"><strong>${esc(source.title||source.source_id)}</strong>${source.locator?` · ${esc(source.locator)}`:""}<br><span>${esc(source.authority_type||"")}</span>${source.canonical_url?` · <a href="${esc(source.canonical_url)}" target="_blank" rel="noopener">${esc(L(win,"Open","Ouvrir"))} ↗</a>`:""}</div>`).join("")}</details>`;
}

function layerLabel(win,claim){
  const pair=LAYER_LABELS[claim.layer]||[claim.layer,claim.layer];
  return L(win,pair[0],pair[1]);
}

function claimHtml(win,claim){
  const territory=(claim.territory||[]).filter(Boolean);
  return `<div class="aoCLClaim"><span class="aoCLBadge">${esc(layerLabel(win,claim))}</span>${territory.length?`<span class="aoCLTerritory">${esc(territory.join(" · "))}</span>`:""}<p>${esc(claim.text)}</p>${sourceDetails(win,claim.sources)}</div>`;
}

function stageHtml(win,stage,reveal){
  const app=stage.application;
  const currentCourse=CATHOLIC_LIFE_COURSES.find(course=>course.stages.some(item=>item.id===stage.id));
  return `${top(win,stage.title,currentCourse?.title||"Catholic Life")}<main class="aoCLWrap"><div class="aoCLQuestion">${esc(stage.question)}</div><p class="aoCLObjective">${esc(stage.objective)}</p>${(stage.cards||[]).map(card=>`<article class="aoCLCard"><h2>${esc(card.title)}</h2>${(card.claims||[]).map(claim=>claimHtml(win,claim)).join("")}</article>`).join("")}${app?`<section class="aoCLApplication"><small>${esc(L(win,"Apply","Application"))}</small><p>${esc(app.prompt)}</p>${reveal?`<div class="aoCLAnswer"><strong>${esc(app.answer)}</strong></div>`:`<button class="aoCLBtn primary" type="button" data-ao-cl-reveal>${esc(L(win,"Reveal answer","Voir la réponse"))}</button>`}</section>`:""}<div class="aoCLCompletion"><strong>${esc(L(win,"You now know","Vous savez maintenant"))}</strong><br>${esc(stage.completion||"")}</div><div class="aoCLNav"><button class="aoCLBtn" type="button" data-ao-cl-course="${esc(currentCourse?.id||"")}">${esc(L(win,"Course stages","Étapes du cours"))}</button>${internalLinks(stage).map(link=>`<button class="aoCLBtn" type="button" data-ao-cl-stage="${esc(link.target_id)}">${esc(L(win,"Related stage","Étape liée"))}: ${esc(CATHOLIC_LIFE_STAGE_MAP[link.target_id]?.title||link.target_id)}</button>`).join("")}</div></main>`;
}

function internalLinks(stage){
  return (stage.links||[]).filter(link=>link.target_module==="CATHOLIC_LIFE"&&CATHOLIC_LIFE_STAGE_MAP[link.target_id]);
}

function courseHtml(win,course){
  return `${top(win,course.title)}<main class="aoCLWrap"><p class="aoCLIntro">${esc(L(win,"Choose a stage. Each stage is practical formation with claim-level provenance and explicit 1962/current/custom distinctions where needed.","Choisissez une étape. Chaque étape est une formation pratique avec provenance des affirmations et distinction explicite entre 1962, actuel et coutume lorsque nécessaire."))}</p><div class="aoCLList">${course.stages.map(stage=>`<button type="button" class="aoCLRow" data-ao-cl-stage="${esc(stage.id)}"><strong>${esc(stage.title)}</strong><span>${esc(stage.id)}</span></button>`).join("")}</div></main>`;
}

function coursesHtml(win){
  return `${top(win,L(win,"Catholic Life","Vie catholique"),L(win,"Formation","Formation"))}<main class="aoCLWrap"><p class="aoCLIntro">${esc(L(win,"79 source-backed stages on how Catholics recognise, distinguish and act in church, sacramental life, devotion, the Catholic year and the wider Church.","79 étapes sourcées sur la manière de reconnaître, distinguer et agir dans la vie de l’Église, les sacrements, les dévotions, l’année catholique et l’Église au sens large."))}</p><div class="aoCLList">${CATHOLIC_LIFE_COURSES.map(course=>`<button type="button" class="aoCLRow" data-ao-cl-course="${esc(course.id)}"><strong>${esc(course.title)}</strong><span>${course.stages.length} ${esc(L(win,"stages","étapes"))}</span></button>`).join("")}</div></main>`;
}

export function createCatholicLifeRuntime(win=globalThis){
  const state={view:"courses",courseId:null,stageId:null,reveal:false};
  function root(){return win?.document?.getElementById?.(CATHOLIC_LIFE_ROOT_ID)||null;}
  function ensureRoot(){
    const doc=win?.document;if(!doc?.body)return null;
    let node=root();if(node)return node;
    node=doc.createElement("section");node.id=CATHOLIC_LIFE_ROOT_ID;
    node.dataset.aoCatholicLifeVersion=CATHOLIC_LIFE_VERSION;
    node.setAttribute("role","region");node.setAttribute("aria-label",L(win,"Catholic Life","Vie catholique"));
    node.addEventListener("click",event=>{
      const target=event.target?.closest?.("button,a");if(!target)return;
      if(target.matches("[data-ao-cl-close]")){event.preventDefault?.();close(true);return;}
      if(target.matches("[data-ao-cl-back]")){event.preventDefault?.();back();return;}
      if(target.dataset.aoClCourse){event.preventDefault?.();openCourse(target.dataset.aoClCourse);return;}
      if(target.dataset.aoClStage){event.preventDefault?.();openStage(target.dataset.aoClStage);return;}
      if(target.matches("[data-ao-cl-reveal]")){event.preventDefault?.();state.reveal=true;render();return;}
    });
    doc.body.append(node);return node;
  }
  function render(){
    const node=ensureRoot();if(!node)return false;
    if(state.view==="stage"&&CATHOLIC_LIFE_STAGE_MAP[state.stageId])node.innerHTML=stageHtml(win,CATHOLIC_LIFE_STAGE_MAP[state.stageId],state.reveal);
    else if(state.view==="course"&&CATHOLIC_LIFE_COURSE_MAP[state.courseId])node.innerHTML=courseHtml(win,CATHOLIC_LIFE_COURSE_MAP[state.courseId]);
    else node.innerHTML=coursesHtml(win);
    node.hidden=false;node.removeAttribute("aria-hidden");return true;
  }
  function open(opts={}){
    if(!CATHOLIC_LIFE_VALIDATION.ok){try{win?.console?.error?.("Catholic Life corpus invalid",CATHOLIC_LIFE_VALIDATION.errors);}catch{}return false;}
    if(opts.stageId&&CATHOLIC_LIFE_STAGE_MAP[opts.stageId]){state.stageId=opts.stageId;state.courseId=CATHOLIC_LIFE_COURSES.find(c=>c.stages.some(s=>s.id===opts.stageId))?.id||null;state.view="stage";}
    else if(opts.courseId&&CATHOLIC_LIFE_COURSE_MAP[opts.courseId]){state.courseId=opts.courseId;state.view="course";}
    else{state.view="courses";state.courseId=null;state.stageId=null;}
    state.reveal=false;win?.document?.body?.classList?.add?.("aoCatholicLifeOpen");render();return true;
  }
  function openCourse(id){if(!CATHOLIC_LIFE_COURSE_MAP[id])return false;state.courseId=id;state.stageId=null;state.view="course";state.reveal=false;render();root()?.scrollTo?.(0,0);return true;}
  function openStage(id){const stage=CATHOLIC_LIFE_STAGE_MAP[id];if(!stage)return false;state.stageId=id;state.courseId=CATHOLIC_LIFE_COURSES.find(c=>c.stages.some(s=>s.id===id))?.id||state.courseId;state.view="stage";state.reveal=false;render();root()?.scrollTo?.(0,0);return true;}
  function back(){if(state.view==="stage"&&state.courseId)return openCourse(state.courseId);if(state.view==="course"){state.view="courses";state.courseId=null;render();return true;}return close(true);}
  function close(returnToLearn=false){const node=root();try{node?.querySelector?.(":focus")?.blur?.();}catch{}node?.remove?.();win?.document?.body?.classList?.remove?.("aoCatholicLifeOpen");state.view="courses";state.courseId=null;state.stageId=null;state.reveal=false;if(returnToLearn)Promise.resolve().then(()=>win?.AO_LEARN_APP_V1?.open?.());return true;}
  function status(){return Object.freeze({version:CATHOLIC_LIFE_VERSION,installed:true,open:Boolean(root()),route:CATHOLIC_LIFE_ROUTE,view:state.view,courseId:state.courseId,stageId:state.stageId,courses:CATHOLIC_LIFE_COURSES.length,stages:Object.keys(CATHOLIC_LIFE_STAGE_MAP).length,validation:CATHOLIC_LIFE_VALIDATION});}
  return Object.freeze({version:CATHOLIC_LIFE_VERSION,open,openCourse,openStage,close,back,render,status});
}

export function ensureCatholicLifeRegistry(win=globalThis){
  if(win?.AO_MODULES?.__aoCatholicLifeV1)return win.AO_MODULES;
  const base=win?.AO_MODULES;if(!base)return null;
  const runtime=win.AO_CATHOLIC_LIFE_V1||createCatholicLifeRuntime(win);win.AO_CATHOLIC_LIFE_V1=runtime;
  const definition=Object.freeze({id:CATHOLIC_LIFE_ROUTE,type:"module",domain:"learn",category:"catholic-life",title:"Catholic Life"});
  const wrapper={...base,__aoCatholicLifeV1:true,
    get(id){return id===CATHOLIC_LIFE_ROUTE?definition:base.get?.(id)||null;},
    resolve(id){if(id===CATHOLIC_LIFE_ROUTE)return {ok:true,input:id,id,defaults:{},chain:[id],definition};return base.resolve?.(id);},
    async open(id,opts={}){if(id===CATHOLIC_LIFE_ROUTE)return {ok:runtime.open(opts),input:String(id),canonicalId:id,type:"module",domain:"learn",options:opts,aliasChain:[id],error:null};return base.open?.(id,opts);},
    list(filter={}){const prior=[...(base.list?.(filter)||[])].filter(item=>item?.id!==CATHOLIC_LIFE_ROUTE);if((!filter.type||filter.type==="module")&&(!filter.domain||String(filter.domain).toLowerCase()==="learn"))prior.push(definition);return prior;}
  };
  win.AO_MODULES=wrapper;win.AO_MODULE_REGISTRY_V36=wrapper;return wrapper;
}

export function installCatholicLifeModule(win=globalThis){
  if(!win)return false;
  if(!win.AO_CATHOLIC_LIFE_V1)win.AO_CATHOLIC_LIFE_V1=createCatholicLifeRuntime(win);
  ensureCatholicLifeRegistry(win);
  return win.AO_CATHOLIC_LIFE_V1;
}
