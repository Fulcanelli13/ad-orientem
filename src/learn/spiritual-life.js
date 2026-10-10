import { captureModuleOrigin, returnToObservedOrigin } from "../app/module-return.js";
import { glossaryContextCapsule } from "../app/contextual-study.js";
import {
  SPIRITUAL_LIFE_ROUTE_ID,
  SPIRITUAL_LIFE_VERSION,
  SPIRITUAL_LIFE_LESSONS,
  SPIRITUAL_LIFE_LESSON_MAP,
  SPIRITUAL_LIFE_CLAIM_MAP,
  SPIRITUAL_LIFE_SOURCE_MAP,
  SPIRITUAL_LIFE_RUNTIME_AUDIT,
} from "./spiritual-life-data.js";

export const SPIRITUAL_LIFE_ROOT_ID="ao-spiritual-life-root";

const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]));
const stateOf=win=>win?.AO_RUNTIME_V8?.store?.getState?.()||{};
const isFr=win=>stateOf(win)?.language==="fr"||String(win?.document?.documentElement?.lang||"").toLowerCase().startsWith("fr");
const L=(win,en,fr)=>isFr(win)?fr:en;
const pick=(win,pair)=>pair?.[isFr(win)?"fr":"en"]||pair?.en||pair?.fr||"";

const HANDOFF_LABELS=Object.freeze({
  "learn.catechism":Object.freeze({en:"Traditional Catechism",fr:"Catéchisme traditionnel"}),
  "today.gospel":Object.freeze({en:"Today's Gospel",fr:"Évangile du jour"}),
  "pray.morning_evening":Object.freeze({en:"Morning & Evening Prayer",fr:"Prière du matin & du soir"}),
  "pray.confession":Object.freeze({en:"Confession",fr:"Confession"}),
  "programme.first_friday":Object.freeze({en:"First Friday",fr:"Premier vendredi"}),
  "calendar":Object.freeze({en:"Calendar",fr:"Calendrier"}),
  "learn.scapular":Object.freeze({en:"Brown Scapular",fr:"Scapulaire brun"}),
  "APF01":Object.freeze({en:"Apostolic spirit",fr:"Esprit apostolique"}),
});

function css(){
  return `
#${SPIRITUAL_LIFE_ROOT_ID}{position:fixed;inset:0 0 calc(var(--ao-global-ribbon-h,68px) + var(--safe-bottom,0px)) 0;z-index:14983;background:var(--ao-bg-canvas,var(--bg,#080c12));color:var(--ao-text-primary,var(--text,#e9e4d9));overflow:auto;overscroll-behavior:contain;font-family:var(--ao-font-body,var(--font-body,Georgia,serif))}
#${SPIRITUAL_LIFE_ROOT_ID} *{box-sizing:border-box}
.aoSLTop{position:sticky;top:0;z-index:6;display:grid;grid-template-columns:44px minmax(0,1fr) 44px;align-items:center;gap:9px;padding:calc(10px + var(--safe-top,0px)) 12px 10px;background:color-mix(in srgb,var(--ao-bg-canvas,var(--bg,#080c12)) 95%,transparent);backdrop-filter:blur(14px);border-bottom:1px solid var(--ao-rule,var(--border,rgba(255,255,255,.12)))}
.aoSLTop button,.aoSLBtn{min-height:44px;border:1px solid var(--ao-rule,var(--border,rgba(255,255,255,.15)));border-radius:var(--ao-control-radius,11px);background:var(--ao-surface-1,var(--surface-1,#101821));color:inherit;padding:8px 12px}.aoSLTop button{width:44px;padding:0;font-size:1.05rem}.aoSLTopTitle{min-width:0;text-align:center}.aoSLTopTitle small{display:block;color:var(--liturgical,#c9ad78);font:600 .62rem/1.2 var(--ao-font-display,var(--font-display,Georgia,serif));letter-spacing:.11em;text-transform:uppercase}.aoSLTopTitle strong{display:block;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font:600 .98rem/1.2 var(--ao-font-display,var(--font-display,Georgia,serif))}
.aoSLWrap{width:min(760px,100%);margin:0 auto;padding:20px 15px 52px}.aoSLHero{padding:12px 1px 24px}.aoSLKicker{color:var(--liturgical,#c9ad78);font:600 .67rem/1.2 var(--ao-font-display,var(--font-display,Georgia,serif));letter-spacing:.12em;text-transform:uppercase}.aoSLHero h1{margin:7px 0 10px;font:500 clamp(2rem,8vw,3.2rem)/1.05 var(--ao-font-display,var(--font-display,Georgia,serif))}.aoSLHero p{margin:0;color:var(--muted,#9ba5b1);font-size:.98rem;line-height:1.58}.aoSLBoundary{margin-top:15px;padding:11px 12px;border-left:2px solid var(--liturgical,#c9ad78);background:var(--liturgical-soft,rgba(201,173,120,.065));color:var(--muted,#aeb6bf);font-size:.77rem;line-height:1.5}
.aoSLList{border-top:1px solid var(--ao-rule,var(--border,rgba(255,255,255,.12)))}.aoSLRow{display:grid;grid-template-columns:38px minmax(0,1fr) 24px;gap:10px;width:100%;align-items:start;padding:16px 2px;border:0;border-bottom:1px solid var(--ao-rule,var(--border,rgba(255,255,255,.12)));background:transparent;color:inherit;text-align:left}.aoSLRow:hover,.aoSLRow:focus-visible{outline:none;background:rgba(255,255,255,.025)}.aoSLNum{color:var(--liturgical,#c9ad78);font:600 .69rem/1.2 var(--ao-font-display,var(--font-display,Georgia,serif));letter-spacing:.08em;padding-top:3px}.aoSLRow strong{display:block;font:600 1.02rem/1.28 var(--ao-font-display,var(--font-display,Georgia,serif))}.aoSLRow p{margin:5px 0 0;color:var(--muted,#9ba5b1);font-size:.79rem;line-height:1.43}.aoSLArrow{color:var(--muted,#9ba5b1);padding-top:2px}
.aoSLLessonHead{padding:12px 1px 20px;border-bottom:1px solid var(--ao-rule,var(--border,rgba(255,255,255,.12)))}.aoSLLessonHead h1{margin:7px 0 8px;font:500 clamp(1.85rem,7vw,2.85rem)/1.08 var(--ao-font-display,var(--font-display,Georgia,serif))}.aoSLLessonHead p{margin:0;color:var(--muted,#9ba5b1);font-size:.95rem;line-height:1.55}
.aoSLBlocks{padding-top:4px}.aoSLBlock{padding:22px 1px;border-bottom:1px solid var(--ao-rule,var(--border,rgba(255,255,255,.1)))}.aoSLBlock h2{margin:0 0 8px;font:600 1.1rem/1.25 var(--ao-font-display,var(--font-display,Georgia,serif))}.aoSLBlock p{margin:0;font-size:1rem;line-height:1.67}
.aoSLPractice{margin:24px 0 6px;padding:16px;border:1px solid var(--liturgical-border,rgba(201,173,120,.35));border-radius:14px;background:var(--liturgical-soft,rgba(201,173,120,.065))}.aoSLPractice small{display:block;color:var(--liturgical,#c9ad78);font:600 .65rem/1.2 var(--ao-font-display,var(--font-display,Georgia,serif));letter-spacing:.09em;text-transform:uppercase}.aoSLPractice strong{display:block;margin-top:7px;font:600 1rem/1.45 var(--ao-font-display,var(--font-display,Georgia,serif))}.aoSLPractice p{margin:8px 0 0;color:var(--muted,#aeb6bf);font-size:.82rem;line-height:1.5}
.aoSLHandoffs{margin:22px 0 0;padding-top:16px;border-top:1px solid var(--ao-rule,var(--border,rgba(255,255,255,.12)))}.aoSLHandoffs small{display:block;margin-bottom:9px;color:var(--muted,#9ba5b1);font-size:.68rem;text-transform:uppercase;letter-spacing:.08em}.aoSLHandoffButtons{display:flex;flex-wrap:wrap;gap:8px}.aoSLBtn{font-size:.78rem}
.aoSLSources{font-family:var(--ao-font-ui,system-ui,sans-serif);margin:24px 0 0;padding-top:16px;border-top:1px solid var(--ao-rule,var(--border,rgba(255,255,255,.12)))}.aoSLSources summary{cursor:pointer;min-height:44px;display:flex;align-items:center;color:var(--muted,#9ba5b1);font:500 max(13px,.8125rem)/1.45 var(--ao-font-ui,system-ui,sans-serif)}.aoSLSource{margin:11px 0;padding-left:10px;border-left:1px solid var(--ao-rule,var(--border,rgba(255,255,255,.15)));font-size:.76rem;line-height:1.45}.aoSLSource a{color:var(--liturgical,#c9ad78);text-decoration:none}.aoSLSource em{display:block;margin-top:2px;color:var(--muted,#9ba5b1);font-style:normal}.aoSLSourceLoc{margin-top:4px;color:var(--muted,#9ba5b1);font-size:.71rem}
.aoSLInlineSources{font-family:var(--ao-font-ui,system-ui,sans-serif);margin-top:10px;color:var(--muted,#9ba5b1);font-size:max(13px,.8125rem);line-height:1.5}.aoSLInlineSources span{color:var(--muted,#9ba5b1)}.aoSLInlineSources a{color:var(--liturgical,#c9ad78);text-decoration:underline;text-decoration-color:color-mix(in srgb,currentColor 45%,transparent);text-underline-offset:3px;overflow-wrap:anywhere}.aoSLInlineSources a:focus-visible{outline:2px solid var(--liturgical,#c9ad78);outline-offset:3px}.aoSLSourceHold{font-style:italic}
.aoSLNav{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:25px}.aoSLNav button{min-height:48px;border:1px solid var(--ao-rule,var(--border,rgba(255,255,255,.15)));border-radius:12px;background:var(--ao-surface-1,var(--surface-1,#101821));color:inherit;padding:10px 12px;text-align:left}.aoSLNav button:last-child{text-align:right}.aoSLNav button:disabled{opacity:.35}.aoSLNav small{display:block;color:var(--muted,#9ba5b1);font-size:.64rem;text-transform:uppercase;letter-spacing:.07em}.aoSLNav strong{display:block;margin-top:3px;font-size:.8rem;line-height:1.25}
@media(max-width:430px){.aoSLWrap{padding-left:13px;padding-right:13px}.aoSLBlock p{font-size:.98rem}.aoSLHero h1{font-size:2.25rem}.aoSLHandoffButtons{display:grid}.aoSLBtn{width:100%}}
/* Semantic reading hierarchy: paragraphs and practice text, not compact labels. */
.aoSLBoundary,.aoSLRow p,.aoSLPractice p,.aoSLLessonHead p{font-size:max(14px,.875rem);line-height:1.55}
.aoSLSource,.aoSLSourceLoc{font-size:max(13px,.8125rem);line-height:1.55}

`;
}

function top(win,title,lesson){
  const kicker=lesson?L(win,`Lesson ${lesson} of ${SPIRITUAL_LIFE_LESSONS.length}`,`Leçon ${lesson} sur ${SPIRITUAL_LIFE_LESSONS.length}`):L(win,"Formation","Formation");
  return `<style data-ao-sl-style>${css()}</style><header class="aoSLTop"><button type="button" data-ao-sl-back aria-label="${esc(L(win,"Back","Retour"))}">‹</button><div class="aoSLTopTitle"><small>${esc(kicker)}</small><strong>${esc(title)}</strong></div><button type="button" data-ao-sl-close aria-label="${esc(L(win,"Close","Fermer"))}">×</button></header>`;
}

function lessonClaimIds(lesson){
  return [...new Set([...lesson.blocks.flatMap(block=>block.claims||[]),...(lesson.practice?.claims||[])])];
}

function lessonSources(lesson){
  const ids=[];
  for(const claimId of lessonClaimIds(lesson)){
    const claim=SPIRITUAL_LIFE_CLAIM_MAP[claimId];
    for(const sourceId of claim?.source_ids||[])if(!ids.includes(sourceId))ids.push(sourceId);
  }
  return ids.map(id=>SPIRITUAL_LIFE_SOURCE_MAP[id]).filter(Boolean);
}

// Render the exact frozen SOT authorities adjacent to the text they support.
// The lesson bibliography remains available for full locators and provenance.
function claimSources(claimIds){
  const ids=new Set();
  for(const claimId of claimIds||[]){
    const claim=SPIRITUAL_LIFE_CLAIM_MAP[claimId];
    for(const sourceId of claim?.source_ids||[])ids.add(sourceId);
  }
  return [...ids].map(id=>SPIRITUAL_LIFE_SOURCE_MAP[id]).filter(Boolean);
}
// The Tanquerey witness is split across two verified full-text pages:
// general means (§§407ff.) and beginners' prayer/methods (§§643–700).
// Cite the section actually containing the claims, never the first page
// merely because it is stored as the default canonical URL.
export function resolveSpiritualLifeSourceTarget(win,source,claimIds=[]){
  if(source.id==="SL-TANQUEREY-1930"&&
      claimIds.some(id=>/^SL0[34]-Q\d+$/.test(id)))
    return source.continuation_url||source.canonical_url;
  if(isFr(win)&&source.french_canonical_url)return source.french_canonical_url;
  return source.canonical_url||"";
}
function claimSourceMarkup(win,claimIds){
  const sources=claimSources(claimIds);
  const links=sources.map(source=>{
    const url=resolveSpiritualLifeSourceTarget(win,source,claimIds);
    if(!/^https:\/\//.test(url))return "";
    const short=source.id==="SL-TANQUEREY-1930"
      ?L(win,"Tanquerey · The Spiritual Life","Tanquerey · La Vie spirituelle")
      :source.title.split(" · ").pop();
    const section=source.id==="SL-TANQUEREY-1930"
      ?(url===source.continuation_url?" · §§643–700":" · §§407–617")
      :source.id==="SL-CIC83-992-997"?" · cann. 992–997":"";
    return `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer" title="${esc(source.title+section)}" aria-label="${esc(source.title+section)}">${esc(short+section)} ↗</a>`;
  }).filter(Boolean);
  if(!links.length)return `<div class="aoSLInlineSources aoSLSourceHold">${esc(L(win,"Source link not verified","Lien source non vérifié"))}</div>`;
  return `<div class="aoSLInlineSources" data-ao-sl-claim-sources="${esc((claimIds||[]).join(" "))}"><span>${esc(L(win,"Sources","Sources"))}:</span> ${links.join(" · ")}</div>`;
}

function sourceMarkup(win,lesson){
  const sources=lessonSources(lesson);
  if(!sources.length)return "";
  return `<details class="aoSLSources"><summary>${esc(L(win,"Sources & provenance","Sources & provenance"))} ▾</summary>${sources.map(source=>{
    const locators=Array.isArray(source.locators)?source.locators:(source.locator?[source.locator]:[]);
    const meta=[source.authority_type?String(source.authority_type).replaceAll("_"," "):"",source.role?String(source.role).replaceAll("_"," "):""].filter(Boolean).join(" · ");
    const target=resolveSpiritualLifeSourceTarget(win,source,lessonClaimIds(lesson));
    const continuation=source.id==="SL-TANQUEREY-1930"&&target===source.continuation_url;
    const applicable=continuation
      ?locators.filter(locator=>/#643|#688|#700|prayer of beginners|mental prayer/i.test(locator))
      :source.id==="SL-TANQUEREY-1930"
        ?locators.filter(locator=>!/#643|#688|#700|prayer of beginners|mental prayer/i.test(locator))
        :locators;
    const linked=/^https:\/\//.test(target)
      ?`<a href="${esc(target)}" target="_blank" rel="noopener noreferrer"><strong>${esc(source.title)}</strong> ↗</a>`
      :`<strong>${esc(source.title)}</strong> · ${esc(L(win,"Direct source link not verified","Lien direct non vérifié"))}`;
    return `<div class="aoSLSource">${linked}${meta?`<em>${esc(meta)}</em>`:""}${applicable.length?`<div class="aoSLSourceLoc">${applicable.map(esc).join("<br>")}</div>`:""}</div>`;
  }).join("")}</details>`;
}

function handoffMarkup(win,lesson){
  const visible=(lesson.handoffs||[]).filter(item=>item.surface!=="apostolate");
  if(!visible.length)return "";
  return `<section class="aoSLHandoffs"><small>${esc(L(win,"Continue in the canonical owner","Continuer dans le module compétent"))}</small><div class="aoSLHandoffButtons">${visible.map((item,index)=>{
    const label=HANDOFF_LABELS[item.target]||{en:item.target,fr:item.target};
    return `<button type="button" class="aoSLBtn" data-ao-sl-handoff="${esc(String(index))}">${esc(pick(win,label))} →</button>`;
  }).join("")}</div></section>`;
}

function listHtml(win){
  return `${top(win,L(win,"Spiritual Life","Vie spirituelle"),null)}<main class="aoSLWrap"><section class="aoSLHero"><div class="aoSLKicker">${esc(L(win,"14 lessons · sourced formation","14 leçons · formation sourcée"))}</div><h1>${esc(L(win,"Spiritual Life","Vie spirituelle"))}</h1><p>${esc(L(win,"A practical course in recollection, mental prayer, examination, spiritual reading, ordinary duties and a stable rule of life. It teaches principles and methods; it does not replace a confessor or spiritual director.","Un parcours pratique sur le recueillement, l’oraison mentale, l’examen, la lecture spirituelle, les devoirs ordinaires et une règle de vie stable. Il enseigne des principes et des méthodes ; il ne remplace pas un confesseur ou un directeur spirituel."))}</p><div class="aoSLBoundary">${esc(L(win,"There is no score, streak or spiritual-performance tracker. Lessons are for understanding and practice, not measuring holiness.","Il n’y a ni score, ni série, ni suivi de performance spirituelle. Les leçons servent à comprendre et à pratiquer, non à mesurer la sainteté."))}</div></section><div class="aoSLList">${SPIRITUAL_LIFE_LESSONS.map((lesson,index)=>`<button type="button" class="aoSLRow" data-ao-sl-lesson="${esc(lesson.id)}"><span class="aoSLNum">${String(index+1).padStart(2,"0")}</span><span><strong>${esc(pick(win,lesson.title))}</strong><p>${esc(pick(win,lesson.summary))}</p></span><span class="aoSLArrow">›</span></button>`).join("")}</div></main>`;
}

function lessonHtml(win,lesson){
  const index=SPIRITUAL_LIFE_LESSONS.findIndex(item=>item.id===lesson.id);
  const prev=index>0?SPIRITUAL_LIFE_LESSONS[index-1]:null;
  const next=index<SPIRITUAL_LIFE_LESSONS.length-1?SPIRITUAL_LIFE_LESSONS[index+1]:null;
  return `${top(win,pick(win,lesson.title),index+1)}<main class="aoSLWrap"><section class="aoSLLessonHead"><div class="aoSLKicker">${esc(L(win,"Spiritual Life","Vie spirituelle"))}</div><h1>${esc(pick(win,lesson.title))}</h1><p>${esc(pick(win,lesson.summary))}</p>${({SL01:"G001",SL03:"G324",SL06:"G328",SL07:"G328",SL12:"G044"})[lesson.id]?'<div class="aoSLContextTerm">'+glossaryContextCapsule(({SL01:"G001",SL03:"G324",SL06:"G328",SL07:"G328",SL12:"G044"})[lesson.id],{french:isFr(win)})+'</div>':''}</section><div class="aoSLBlocks">${lesson.blocks.map(block=>`<section class="aoSLBlock"><h2>${esc(pick(win,block.h))}</h2><p>${esc(pick(win,block.t))}</p>${claimSourceMarkup(win,block.claims)}</section>`).join("")}</div><section class="aoSLPractice"><small>${esc(L(win,"Practice · not scored","Mise en pratique · sans score"))}</small><strong>${esc(pick(win,lesson.practice.prompt))}</strong><p>${esc(pick(win,lesson.practice.guidance))}</p>${claimSourceMarkup(win,lesson.practice.claims)}</section>${handoffMarkup(win,lesson)}${sourceMarkup(win,lesson)}<nav class="aoSLNav" aria-label="${esc(L(win,"Lesson navigation","Navigation des leçons"))}"><button type="button" data-ao-sl-prev ${prev?"":"disabled"}><small>${esc(L(win,"Previous","Précédente"))}</small><strong>${prev?esc(pick(win,prev.title)):"—"}</strong></button><button type="button" data-ao-sl-next ${next?"":"disabled"}><small>${esc(L(win,"Next","Suivante"))}</small><strong>${next?esc(pick(win,next.title)):"—"}</strong></button></nav></main>`;
}

export function createSpiritualLifeRuntime(win=globalThis){
  const state={view:"list",lessonId:null};
  function root(){return win?.document?.getElementById?.(SPIRITUAL_LIFE_ROOT_ID)||null;}
  function currentLesson(){return SPIRITUAL_LIFE_LESSON_MAP[state.lessonId]||null;}

  function ensureRoot(){
    const doc=win?.document;if(!doc?.body)return null;
    let node=root();if(node)return node;
    node=doc.createElement("section");
    node.id=SPIRITUAL_LIFE_ROOT_ID;
    node.dataset.aoSpiritualLifeVersion=SPIRITUAL_LIFE_VERSION;
    node.setAttribute("role","region");
    node.setAttribute("aria-label",L(win,"Spiritual Life","Vie spirituelle"));
    node.addEventListener("click",event=>{
      const target=event.target?.closest?.("button,a");if(!target)return;
      if(target.matches("[data-ao-sl-close]")){event.preventDefault?.();close(true);return;}
      if(target.matches("[data-ao-sl-back]")){event.preventDefault?.();back();return;}
      if(target.dataset.aoSlLesson){event.preventDefault?.();openLesson(target.dataset.aoSlLesson);return;}
      if(target.matches("[data-ao-sl-prev]")){event.preventDefault?.();move(-1);return;}
      if(target.matches("[data-ao-sl-next]")){event.preventDefault?.();move(1);return;}
      if(target.dataset.aoSlHandoff!=null){event.preventDefault?.();openHandoff(Number(target.dataset.aoSlHandoff));return;}
    });
    doc.body.append(node);
    return node;
  }

  function render(){
    const node=ensureRoot();if(!node)return false;
    const lesson=currentLesson();
    node.innerHTML=state.view==="lesson"&&lesson?lessonHtml(win,lesson):listHtml(win);
    node.hidden=false;node.removeAttribute("aria-hidden");
    return true;
  }

  let entryOrigin=null,lessonFromList=false;
  function open(opts={}){
    entryOrigin=captureModuleOrigin(win,"learn");lessonFromList=false;
    if(!SPIRITUAL_LIFE_RUNTIME_AUDIT.bilingual||!SPIRITUAL_LIFE_RUNTIME_AUDIT.allClaimsResolved||!SPIRITUAL_LIFE_RUNTIME_AUDIT.allSourcesResolved)return false;
    if(opts.lessonId&&SPIRITUAL_LIFE_LESSON_MAP[opts.lessonId]){state.view="lesson";state.lessonId=opts.lessonId;}
    else{state.view="list";state.lessonId=null;}
    win?.document?.body?.classList?.add?.("aoSpiritualLifeOpen");
    render();root()?.scrollTo?.(0,0);return true;
  }

  function openLesson(id){
    if(!SPIRITUAL_LIFE_LESSON_MAP[id])return false;
    if(state.view==="list")lessonFromList=true;
    state.view="lesson";state.lessonId=id;render();root()?.scrollTo?.(0,0);return true;
  }

  function move(delta){
    const lesson=currentLesson();if(!lesson)return false;
    const index=SPIRITUAL_LIFE_LESSONS.findIndex(item=>item.id===lesson.id);
    const target=SPIRITUAL_LIFE_LESSONS[index+delta];if(!target)return false;
    return openLesson(target.id);
  }

  function back(){
    if(state.view==="lesson"&&lessonFromList){state.view="list";state.lessonId=null;lessonFromList=false;render();root()?.scrollTo?.(0,0);return true;}
    return close(true);
  }

  function openHandoff(index){
    const lesson=currentLesson();if(!lesson)return false;
    const visible=(lesson.handoffs||[]).filter(item=>item.surface!=="apostolate");
    const item=visible[index];if(!item)return false;
    if(item.surface==="formation"){
      close(false);
      try{return win?.AO_LEARN_APP_V1?.openModule?.(item.target)??false;}catch{return false;}
    }
    if(item.surface==="pray"){
      close(false);
      try{
        if(typeof win?.AO_PRAY_V435930?.open==="function")return win.AO_PRAY_V435930.open(item.target,{returnContext:SPIRITUAL_LIFE_ROUTE_ID})!==false;
        return win?.AO_PRAY_APP_V1?.open?.()??false;
      }catch{return false;}
    }
    if(item.surface==="calendar"){
      try{win?.AO_LEARN_APP_V1?.close?.();}catch{}
      close(false);
      try{return win?.AO_APP_SHELL_V1?.navigate?.("calendar")??false;}catch{return false;}
    }
    return false;
  }

  function close(returnToLearn=false){
    const node=root();try{node?.querySelector?.(":focus")?.blur?.();}catch{}
    node?.remove?.();win?.document?.body?.classList?.remove?.("aoSpiritualLifeOpen");
    state.view="list";state.lessonId=null;
    if(returnToLearn)return returnToObservedOrigin(win,entryOrigin,{
      close:()=>{},restoreParent:()=>win?.AO_LEARN_APP_V1?.open?.()
    });
    return true;
  }

  function status(){
    return Object.freeze({
      version:SPIRITUAL_LIFE_VERSION,
      installed:true,
      open:Boolean(root()),
      route:SPIRITUAL_LIFE_ROUTE_ID,
      view:state.view,
      lessonId:state.lessonId,
      lessons:SPIRITUAL_LIFE_LESSONS.length,
      claims:SPIRITUAL_LIFE_RUNTIME_AUDIT.claims,
      sources:SPIRITUAL_LIFE_RUNTIME_AUDIT.sources,
      scoring:false,
      persistence:false,
      visibleLauncher:true,
    });
  }

  return Object.freeze({version:SPIRITUAL_LIFE_VERSION,open,openLesson,back,close,render,status});
}

export function ensureSpiritualLifeRegistry(win=globalThis){
  if(win?.AO_MODULES?.__aoSpiritualLifeV1)return win.AO_MODULES;
  const base=win?.AO_MODULES;if(!base)return null;
  const runtime=win.AO_SPIRITUAL_LIFE_V1||createSpiritualLifeRuntime(win);win.AO_SPIRITUAL_LIFE_V1=runtime;
  const definition=Object.freeze({id:SPIRITUAL_LIFE_ROUTE_ID,type:"module",domain:"learn",category:"spiritual-life",title:"Spiritual Life",hidden:false});
  const wrapper={...base,__aoSpiritualLifeV1:true,
    get(id){return id===SPIRITUAL_LIFE_ROUTE_ID?definition:base.get?.(id)||null;},
    resolve(id){if(id===SPIRITUAL_LIFE_ROUTE_ID)return {ok:true,input:id,id,defaults:{},chain:[id],definition};return base.resolve?.(id);},
    async open(id,opts={}){if(id===SPIRITUAL_LIFE_ROUTE_ID)return {ok:runtime.open(opts),input:String(id),canonicalId:id,type:"module",domain:"learn",options:opts,aliasChain:[id],error:null};return base.open?.(id,opts);},
    list(filter={}){const prior=[...(base.list?.(filter)||[])].filter(item=>item?.id!==SPIRITUAL_LIFE_ROUTE_ID);if((!filter.type||filter.type==="module")&&(!filter.domain||String(filter.domain).toLowerCase()==="learn"))prior.push(definition);return prior;}
  };
  win.AO_MODULES=wrapper;win.AO_MODULE_REGISTRY_V36=wrapper;return wrapper;
}

export function installSpiritualLifeModule(win=globalThis){
  if(!win)return false;
  if(!win.AO_SPIRITUAL_LIFE_V1)win.AO_SPIRITUAL_LIFE_V1=createSpiritualLifeRuntime(win);
  ensureSpiritualLifeRegistry(win);
  return win.AO_SPIRITUAL_LIFE_V1;
}
