export const LATIN_COURSE_VERSION="latin-course-runtime-v1";
export const LATIN_COURSE_ROOT_ID="ao-latin-course-root";
export const LATIN_COURSE_ROUTE_ID="learn.latin";
export const LATIN_COURSE_DEFINITION=Object.freeze({
  id:LATIN_COURSE_ROUTE_ID,
  type:"module",
  domain:"learn",
  category:"language-formation",
  title:"Latin for the Missal",
});

const COURSE_URL=new URL("../../data/learn/latin-course-40-core350.v1.json",import.meta.url);
const lessonUrl=n=>new URL(`../../data/learn/latin-course-lessons/lesson-${String(n).padStart(2,"0")}.v1.json`,import.meta.url);
const STAGE_TITLES_FR=Object.freeze({
  1:"Entendre le latin de l’Église",
  2:"L’Ordinaire",
  3:"Actions et temps",
  4:"Structure",
  5:"Langage de la prière",
  6:"Canon",
  7:"Latin de l’Église",
  8:"Lire le Missel",
});

const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const langOf=win=>win?.AO_RUNTIME_V8?.store?.getState?.()?.language==="fr"?"fr":"en";
const L=(lang,en,fr)=>lang==="fr"?fr:en;
const norm=v=>String(v??"").trim().replace(/\s+/g," ").toLocaleLowerCase();
const tokenCanon=v=>String(v??"").replace(/^[^A-Za-zÀ-ÖØ-öø-ÿĀ-žÆŒæœ]+|[^A-Za-zÀ-ÖØ-öø-ÿĀ-žÆŒæœ]+$/g,"");

export function localizeLatinLesson(lesson,language="en"){
  const fr=language==="fr"?lesson?.localization?.fr:null;
  return Object.freeze({
    title:fr?.title||lesson?.title||"",
    grammarFocus:fr?.grammarFocus||lesson?.grammarFocus||"",
    readingOutcome:fr?.readingOutcome||lesson?.readingOutcome||"",
    objectives:Array.isArray(fr?.objectives)?fr.objectives:(lesson?.objectives||[]),
  });
}

export function localizeLatinExercise(exercise,language="en"){
  const fr=language==="fr"?exercise?.localization?.fr:null;
  const keys=exercise?.exerciseType==="matching"?Object.keys(exercise?.expectedAnswer||{}):[];
  const matchKeys=Object.fromEntries(keys.map(key=>[key,fr?.matchKeys?.[key]||key]));
  const matches=Object.fromEntries(keys.map(key=>[key,fr?.matches?.[key]??exercise?.expectedAnswer?.[key]??""]));
  return Object.freeze({
    prompt:fr?.prompt||exercise?.prompt||"",
    hint:fr?.hint||exercise?.hint||"",
    explanation:fr?.explanation||exercise?.explanation||"",
    options:Array.isArray(exercise?.options)?(Array.isArray(fr?.options)?fr.options:exercise.options):null,
    matchKeys,
    matches,
    answerGuide:fr?.answerGuide??exercise?.expectedAnswer??null,
    modelGuide:fr?.modelGuide??exercise?.expectedAnswer?.modelGuide??null,
    requiredChecks:fr?.requiredChecks??exercise?.expectedAnswer?.requiredChecks??[],
  });
}

export function canonicalChoiceValue(exercise,index){
  return Array.isArray(exercise?.options)&&Number.isInteger(index)?exercise.options[index]:undefined;
}

function sameScalar(a,b){return norm(a)===norm(b)}
function sameArray(a,b){
  return Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&a.every((v,i)=>sameScalar(v,b[i]));
}
function sameMap(a,b){
  if(!a||!b||typeof a!=="object"||typeof b!=="object"||Array.isArray(a)||Array.isArray(b))return false;
  const ak=Object.keys(a).sort(),bk=Object.keys(b).sort();
  return ak.length===bk.length&&ak.every((k,i)=>k===bk[i]&&sameScalar(a[k],b[k]));
}
function candidates(exercise){
  return [exercise?.expectedAnswer,...(exercise?.acceptedVariants||[])].filter(v=>v!==undefined);
}

export function gradeLatinExercise(exercise,response){
  if(!exercise)return Object.freeze({graded:false,correct:false,selfCheck:false});
  if(exercise.exerciseType==="read_aloud_model"||exercise.exerciseType==="passage_analysis"){
    return Object.freeze({graded:false,correct:false,selfCheck:true});
  }
  let correct=false;
  if(exercise.exerciseType==="matching"){
    correct=sameMap(response,exercise.expectedAnswer);
  }else if(Array.isArray(exercise.expectedAnswer)){
    correct=candidates(exercise).some(answer=>sameArray(response,answer));
  }else{
    correct=candidates(exercise).some(answer=>sameScalar(response,answer));
  }
  return Object.freeze({graded:true,correct,selfCheck:false});
}

function matchingValueLabels(exercise,localized){
  const map=new Map();
  for(const [key,value] of Object.entries(exercise?.expectedAnswer||{})){
    map.set(String(value),localized.matches?.[key]??String(value));
  }
  return map;
}

function sourceLabel(lesson,id){
  const source=(lesson?.sources||[]).find(x=>x.id===id);
  if(!source)return id;
  return [source.work,source.section].filter(Boolean).join(" · ")||id;
}

function css(){
  return `
#${LATIN_COURSE_ROOT_ID}{position:fixed;inset:0 0 calc(var(--ao-global-ribbon-h,68px) + var(--safe-bottom,0px)) 0;z-index:14980;background:var(--ao-bg-canvas,var(--bg,#080c12));color:var(--ao-text-primary,var(--text,#e9e4d9));overflow:auto;overscroll-behavior:contain;font-family:var(--ao-font-body,var(--font-body,Georgia,serif))}
#${LATIN_COURSE_ROOT_ID} *{box-sizing:border-box}
.aoLatinTop{position:sticky;top:0;z-index:5;display:grid;grid-template-columns:44px minmax(0,1fr) 44px;align-items:center;gap:8px;padding:calc(10px + var(--safe-top,0px)) max(12px,env(safe-area-inset-right)) 10px max(12px,env(safe-area-inset-left));background:color-mix(in srgb,var(--ao-bg-canvas,var(--bg,#080c12)) 95%,transparent);backdrop-filter:blur(14px);border-bottom:1px solid var(--ao-rule,var(--border,rgba(255,255,255,.13)))}
.aoLatinTop button,.aoLatinBtn{min-width:44px;min-height:44px;border:1px solid var(--ao-rule,var(--border,rgba(255,255,255,.16)));border-radius:11px;background:var(--ao-surface-1,var(--surface-1,#101821));color:inherit;font:600 .78rem/1.2 system-ui,sans-serif}
.aoLatinTopTitle{text-align:center;min-width:0}.aoLatinTopTitle small{display:block;color:var(--liturgical,#c9ad78);font:.62rem/1.2 system-ui,sans-serif;letter-spacing:.12em}.aoLatinTopTitle strong{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font:600 1rem/1.25 var(--ao-font-display,Georgia,serif)}
.aoLatinWrap{width:min(820px,100%);margin:0 auto;padding:20px 14px 46px}.aoLatinHero{padding:8px 0 20px}.aoLatinHero .kicker{color:var(--liturgical,#c9ad78);font:600 .66rem/1.2 system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase}.aoLatinHero h1{margin:6px 0 8px;font:600 clamp(1.7rem,6vw,2.5rem)/1.08 var(--ao-font-display,Georgia,serif)}.aoLatinHero p{margin:0;color:var(--muted,#a9b0b8);line-height:1.55}
.aoLatinStageList,.aoLatinLessonList{display:grid;gap:10px}.aoLatinStage,.aoLatinLessonLink{width:100%;min-height:62px;padding:12px 14px;text-align:left;border:1px solid var(--ao-rule,var(--border,rgba(255,255,255,.13)));border-radius:14px;background:var(--ao-surface-1,var(--surface-1,#101821));color:inherit}.aoLatinStage strong,.aoLatinLessonLink strong{display:block;font:600 1rem/1.25 var(--ao-font-display,Georgia,serif)}.aoLatinStage span,.aoLatinLessonLink span{display:block;margin-top:4px;color:var(--muted,#a9b0b8);font:.78rem/1.35 system-ui,sans-serif}
.aoLatinMeta{display:grid;gap:7px;padding:12px 0 17px;border-bottom:1px solid var(--ao-rule,var(--border,rgba(255,255,255,.13)))}.aoLatinMeta b{color:var(--liturgical,#c9ad78);font:.7rem/1.2 system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase}.aoLatinMeta p{margin:0;line-height:1.5}.aoLatinObjectives{margin:8px 0 0;padding-left:20px;color:var(--muted,#a9b0b8);line-height:1.45}
.aoLatinBlock{padding:18px 0;border-bottom:1px solid var(--ao-rule,var(--border,rgba(255,255,255,.13)))}.aoLatinBlock h2{margin:0 0 8px;color:var(--liturgical,#c9ad78);font:600 1rem/1.25 var(--ao-font-display,Georgia,serif)}.aoLatinBlock p{margin:0;line-height:1.62}.aoLatinSources{margin-top:9px;color:var(--muted,#a9b0b8);font:.72rem/1.35 system-ui,sans-serif}.aoLatinSources summary{cursor:pointer}
.aoLatinPractice{margin-top:24px;padding-top:18px;border-top:2px solid var(--liturgical-border,rgba(201,173,120,.34))}.aoLatinPracticeHead{display:flex;align-items:baseline;justify-content:space-between;gap:12px}.aoLatinPracticeHead h2{margin:0;font:600 1.2rem/1.2 var(--ao-font-display,Georgia,serif)}.aoLatinPracticeHead span{color:var(--muted,#a9b0b8);font:.75rem/1.2 system-ui,sans-serif}.aoLatinExercise{margin-top:12px;padding:15px;border:1px solid var(--ao-rule,var(--border,rgba(255,255,255,.13)));border-radius:15px;background:var(--ao-surface-1,var(--surface-1,#101821))}.aoLatinPrompt{font:600 1.02rem/1.45 var(--ao-font-display,Georgia,serif)}.aoLatinStimulus{margin:12px 0;padding:11px;border-left:2px solid var(--liturgical,#c9ad78);background:rgba(255,255,255,.025);font:500 1.03rem/1.55 var(--font-liturgical,Georgia,serif)}.aoLatinHint{margin:9px 0;color:var(--muted,#a9b0b8);font:.82rem/1.45 system-ui,sans-serif}.aoLatinChoices{display:grid;gap:8px;margin-top:12px}.aoLatinChoice,.aoLatinToken{min-height:44px;padding:9px 11px;border:1px solid var(--ao-rule,var(--border,rgba(255,255,255,.16)));border-radius:10px;background:transparent;color:inherit;text-align:left}.aoLatinChoice.selected,.aoLatinToken.selected{border-color:var(--liturgical,#c9ad78);background:var(--liturgical-soft,rgba(201,173,120,.09))}.aoLatinTokens{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}.aoLatinToken{min-width:0}.aoLatinInput,.aoLatinSelect,.aoLatinTextarea{width:100%;min-height:44px;margin-top:10px;padding:9px 10px;border:1px solid var(--ao-rule,var(--border,rgba(255,255,255,.16)));border-radius:9px;background:var(--ao-bg-canvas,var(--bg,#080c12));color:inherit;font:inherit}.aoLatinTextarea{min-height:92px;resize:vertical}.aoLatinMatch{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px;align-items:center;margin-top:8px}.aoLatinMatch label{font-size:.9rem}.aoLatinActions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.aoLatinActions .primary{border-color:var(--liturgical,#c9ad78);background:var(--liturgical-soft,rgba(201,173,120,.11))}.aoLatinFeedback{margin-top:13px;padding:11px;border-radius:10px;background:rgba(255,255,255,.035);line-height:1.48}.aoLatinFeedback strong{display:block;margin-bottom:4px}.aoLatinModel{margin:9px 0 0;padding-left:19px}.aoLatinExerciseNav{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:11px}.aoLatinError{padding:12px;border:1px solid #9f5b5b;border-radius:10px}.aoLatinLoading{padding:24px 0;color:var(--muted,#a9b0b8)}
@media(max-width:560px){.aoLatinMatch{grid-template-columns:1fr}.aoLatinWrap{padding-left:12px;padding-right:12px}}
`;
}

function top(lang,title,canStepBack=true){
  return `<style data-ao-latin-style>${css()}</style><header class="aoLatinTop">
    <button type="button" data-ao-latin-back aria-label="${esc(L(lang,"Back","Retour"))}">${canStepBack?"←":"×"}</button>
    <div class="aoLatinTopTitle"><small>FORMATION · LATIN</small><strong>${esc(title)}</strong></div>
    <button type="button" data-ao-latin-close aria-label="${esc(L(lang,"Close","Fermer"))}">×</button>
  </header>`;
}

function sourcesMarkup(lesson,referenceIds,lang){
  if(!Array.isArray(referenceIds)||!referenceIds.length)return "";
  return `<details class="aoLatinSources"><summary>${esc(L(lang,"Sources","Sources"))}</summary><div>${referenceIds.map(id=>esc(sourceLabel(lesson,id))).join("<br>")}</div></details>`;
}

function stageTitle(stage,lang){
  return lang==="fr"?(STAGE_TITLES_FR[stage.stage]||stage.title):stage.title;
}

function canonicalTokenList(stimulus){
  return String(stimulus||"").split(/\s+/).filter(Boolean).map((display,index)=>({display,canonical:tokenCanon(display),index}));
}

function answerGuideMarkup(exercise,localized,lang){
  if(exercise.exerciseType==="read_aloud_model"){
    const checks=Array.isArray(localized.requiredChecks)?localized.requiredChecks:[];
    return `<div class="aoLatinFeedback"><strong>${esc(L(lang,"Model","Modèle"))}</strong><div>${esc(localized.modelGuide||"")}</div>${checks.length?`<ul class="aoLatinModel">${checks.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:""}</div>`;
  }
  const guide=localized.answerGuide;
  const list=Array.isArray(guide)?guide:[guide];
  return `<div class="aoLatinFeedback"><strong>${esc(L(lang,"Model answer","Réponse-type"))}</strong><div>${list.filter(Boolean).map(esc).join(" · ")}</div><div>${esc(localized.explanation)}</div></div>`;
}

function exerciseMarkup(exercise,lang,response,feedback){
  const loc=localizeLatinExercise(exercise,lang);
  const stimulus=exercise.stimulus?`<div class="aoLatinStimulus">${esc(exercise.stimulus)}</div>`:"";
  let input="";
  if(exercise.exerciseType==="multiple_choice"||exercise.exerciseType==="syllable_select"){
    input=`<div class="aoLatinChoices">${(exercise.options||[]).map((canonical,i)=>`<button type="button" class="aoLatinChoice ${response===canonical?"selected":""}" data-ao-latin-choice-index="${i}">${esc(loc.options?.[i]??canonical)}</button>`).join("")}</div>`;
  }else if(exercise.exerciseType==="token_select"){
    const selected=new Set(Array.isArray(response?.indices)?response.indices:[]);
    input=`<div class="aoLatinTokens">${canonicalTokenList(exercise.stimulus).map(t=>`<button type="button" class="aoLatinToken ${selected.has(t.index)?"selected":""}" data-ao-latin-token-index="${t.index}">${esc(t.display)}</button>`).join("")}</div>`;
  }else if(exercise.exerciseType==="matching"){
    const values=[...new Set(Object.values(exercise.expectedAnswer||{}).map(String))];
    const valueLabels=matchingValueLabels(exercise,loc);
    input=Object.keys(exercise.expectedAnswer||{}).map(key=>`<div class="aoLatinMatch"><label>${esc(loc.matchKeys[key]||key)}</label><select class="aoLatinSelect" data-ao-latin-match-key="${esc(key)}"><option value="">—</option>${values.map(v=>`<option value="${esc(v)}" ${response?.[key]===v?"selected":""}>${esc(valueLabels.get(v)||v)}</option>`).join("")}</select></div>`).join("");
  }else if(exercise.exerciseType==="passage_analysis"){
    input=`<textarea class="aoLatinTextarea" data-ao-latin-text placeholder="${esc(L(lang,"Write your analysis…","Écrivez votre analyse…"))}">${esc(typeof response==="string"?response:"")}</textarea>`;
  }else if(exercise.exerciseType==="read_aloud_model"){
    input="";
  }else{
    input=`<input class="aoLatinInput" data-ao-latin-text value="${esc(typeof response==="string"?response:"")}" autocomplete="off">`;
  }
  const selfCheck=exercise.exerciseType==="passage_analysis"||exercise.exerciseType==="read_aloud_model";
  let feedbackHtml="";
  if(feedback?.shown){
    if(selfCheck) feedbackHtml=answerGuideMarkup(exercise,loc,lang);
    else feedbackHtml=`<div class="aoLatinFeedback"><strong>${esc(feedback.correct?L(lang,"Correct","Correct"):L(lang,"Try again","Réessayez"))}</strong><div>${esc(loc.explanation)}</div></div>`;
  }
  return `<article class="aoLatinExercise">
    <div class="aoLatinPrompt">${esc(loc.prompt)}</div>
    ${stimulus}
    <details class="aoLatinHint"><summary>${esc(L(lang,"Hint","Indice"))}</summary>${esc(loc.hint)}</details>
    ${input}
    <div class="aoLatinActions"><button type="button" class="aoLatinBtn primary" data-ao-latin-check>${esc(selfCheck?L(lang,"Show model","Afficher le modèle"):L(lang,"Check","Vérifier"))}</button></div>
    ${feedbackHtml}
  </article>`;
}

export function createLatinCourseRuntime(win=globalThis){
  const state={
    open:false,screen:"stages",course:null,stage:null,stageLessons:[],lesson:null,
    loading:false,error:"",exerciseIndex:0,responses:new Map(),feedback:new Map(),
    cache:new Map(),unsub:null,lastLanguage:null,
  };

  const root=()=>win?.document?.getElementById?.(LATIN_COURSE_ROOT_ID)||null;
  async function fetchJson(url){
    const fetcher=win?.fetch?.bind(win)||globalThis.fetch?.bind(globalThis);
    if(typeof fetcher!=="function")throw new Error("FETCH_UNAVAILABLE");
    const res=await fetcher(url);
    if(!res?.ok)throw new Error(`HTTP_${res?.status||"ERR"}`);
    return res.json();
  }
  async function ensureCourse(){
    if(state.course)return state.course;
    state.course=await fetchJson(COURSE_URL);
    return state.course;
  }
  async function loadLesson(n){
    if(state.cache.has(n))return state.cache.get(n);
    const lesson=await fetchJson(lessonUrl(n));
    state.cache.set(n,lesson);
    return lesson;
  }
  async function loadStage(number){
    state.loading=true;state.error="";state.stage=number;state.screen="stage";render();
    try{
      const course=await ensureCourse();
      const stage=course.stages.find(x=>x.stage===number);
      const [first,last]=stage?.lessons||[];
      const lessons=await Promise.all(Array.from({length:last-first+1},(_,i)=>loadLesson(first+i)));
      state.stageLessons=lessons;
    }catch(error){state.error=String(error?.message||error)}
    state.loading=false;render();
  }
  async function openLesson(number){
    state.loading=true;state.error="";render();
    try{
      state.lesson=await loadLesson(number);
      state.exerciseIndex=0;
      state.screen="lesson";
    }catch(error){state.error=String(error?.message||error)}
    state.loading=false;render();
  }
  function ensureRoot(){
    const doc=win?.document;if(!doc?.body)return null;
    let node=root();if(node)return node;
    node=doc.createElement("section");node.id=LATIN_COURSE_ROOT_ID;node.dataset.aoLatinCourseOwner=LATIN_COURSE_VERSION;node.setAttribute("role","region");
    node.addEventListener("click",onClick);node.addEventListener("input",onInput);node.addEventListener("change",onInput);
    doc.body.append(node);return node;
  }
  function attach(){
    if(state.unsub)return;
    const store=win?.AO_RUNTIME_V8?.store;
    if(typeof store?.subscribe!=="function")return;
    state.lastLanguage=langOf(win);
    state.unsub=store.subscribe(()=>{
      const next=langOf(win);
      if(next!==state.lastLanguage){state.lastLanguage=next;if(state.open)queueMicrotask(render)}
    });
  }
  function renderStages(node,lang){
    const course=state.course;
    return `${top(lang,L(lang,"Latin for the Missal","Latin du Missel"),false)}<main class="aoLatinWrap"><section class="aoLatinHero"><div class="kicker">${esc(L(lang,"40-lesson formation course","Parcours de formation en 40 leçons"))}</div><h1>${esc(L(lang,"Read the Latin of the Church","Lire le latin de l’Église"))}</h1><p>${esc(L(lang,"From pronunciation and cases to the Ordinary, Collects, Canon, Propers and an unseen Missal capstone.","De la prononciation et des cas jusqu’à l’Ordinaire, aux oraisons, au Canon, aux Propres et à un couronnement sur un texte inconnu du Missel."))}</p></section><div class="aoLatinStageList">${(course?.stages||[]).map(stage=>`<button type="button" class="aoLatinStage" data-ao-latin-stage="${stage.stage}"><strong>${esc(stageTitle(stage,lang))}</strong><span>${esc(L(lang,`Lessons ${stage.lessons[0]}–${stage.lessons[1]}`,`Leçons ${stage.lessons[0]}–${stage.lessons[1]}`))}</span></button>`).join("")}</div></main>`;
  }
  function renderStage(node,lang){
    const course=state.course,stage=course?.stages?.find(x=>x.stage===state.stage);
    const title=stage?stageTitle(stage,lang):L(lang,"Stage","Étape");
    const body=state.loading?`<div class="aoLatinLoading">${esc(L(lang,"Loading lessons…","Chargement des leçons…"))}</div>`:state.error?`<div class="aoLatinError">${esc(state.error)}</div>`:`<div class="aoLatinLessonList">${state.stageLessons.map(lesson=>{const loc=localizeLatinLesson(lesson,lang);return `<button type="button" class="aoLatinLessonLink" data-ao-latin-lesson="${lesson.lesson}"><strong>${esc(L(lang,`Lesson ${lesson.lesson}`,`Leçon ${lesson.lesson}`))} · ${esc(loc.title)}</strong><span>${esc(loc.grammarFocus)}</span></button>`}).join("")}</div>`;
    return `${top(lang,title,true)}<main class="aoLatinWrap"><section class="aoLatinHero"><div class="kicker">${esc(L(lang,`Stage ${state.stage}`,`Étape ${state.stage}`))}</div><h1>${esc(title)}</h1></section>${body}</main>`;
  }
  function renderLesson(node,lang){
    const lesson=state.lesson;
    if(!lesson)return `${top(lang,L(lang,"Lesson","Leçon"),true)}<main class="aoLatinWrap"><div class="aoLatinLoading">${esc(L(lang,"Loading…","Chargement…"))}</div></main>`;
    const loc=localizeLatinLesson(lesson,lang);
    const blocks=(lesson.learningBlocks||[]).map(block=>{
      const title=lang==="fr"?(block.localization?.fr?.title||block.title):block.title;
      const copy=lang==="fr"?(block.learnerCopy?.fr||block.learnerCopy?.en||""):(block.learnerCopy?.en||"");
      return `<section class="aoLatinBlock"><h2>${esc(title)}</h2><p>${esc(copy)}</p>${sourcesMarkup(lesson,block.referenceIds,lang)}</section>`;
    }).join("");
    const exercises=lesson.exercises||[],idx=Math.min(state.exerciseIndex,Math.max(0,exercises.length-1)),exercise=exercises[idx];
    const practice=exercise?`<section class="aoLatinPractice"><div class="aoLatinPracticeHead"><h2>${esc(L(lang,"Practice","Exercices"))}</h2><span>${idx+1} / ${exercises.length}</span></div>${exerciseMarkup(exercise,lang,state.responses.get(exercise.id),state.feedback.get(exercise.id))}<div class="aoLatinExerciseNav"><button type="button" class="aoLatinBtn" data-ao-latin-ex-prev ${idx===0?"disabled":""}>${esc(L(lang,"Previous","Précédent"))}</button><button type="button" class="aoLatinBtn" data-ao-latin-ex-next ${idx>=exercises.length-1?"disabled":""}>${esc(L(lang,"Next","Suivant"))}</button></div>${sourcesMarkup(lesson,exercise.referenceIds,lang)}</section>`:"";
    return `${top(lang,loc.title,true)}<main class="aoLatinWrap"><section class="aoLatinHero"><div class="kicker">${esc(L(lang,`Lesson ${lesson.lesson}`,`Leçon ${lesson.lesson}`))}</div><h1>${esc(loc.title)}</h1></section><section class="aoLatinMeta"><div><b>${esc(L(lang,"Grammar","Grammaire"))}</b><p>${esc(loc.grammarFocus)}</p></div><div><b>${esc(L(lang,"Reading target","Objectif de lecture"))}</b><p>${esc(loc.readingOutcome)}</p></div><ul class="aoLatinObjectives">${loc.objectives.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></section>${blocks}${practice}</main>`;
  }
  function render(){
    const node=ensureRoot();if(!node||!state.open)return false;
    const lang=langOf(win);node.lang=lang;node.setAttribute("aria-label",L(lang,"Latin course","Cours de latin"));
    if(!state.course&&state.loading)node.innerHTML=`${top(lang,L(lang,"Latin for the Missal","Latin du Missel"),false)}<main class="aoLatinWrap"><div class="aoLatinLoading">${esc(L(lang,"Loading course…","Chargement du cours…"))}</div></main>`;
    else if(state.error&&!state.course)node.innerHTML=`${top(lang,L(lang,"Latin for the Missal","Latin du Missel"),false)}<main class="aoLatinWrap"><div class="aoLatinError">${esc(state.error)}</div></main>`;
    else if(state.screen==="lesson")node.innerHTML=renderLesson(node,lang);
    else if(state.screen==="stage")node.innerHTML=renderStage(node,lang);
    else node.innerHTML=renderStages(node,lang);
    return true;
  }
  function currentExercise(){return state.lesson?.exercises?.[state.exerciseIndex]||null}
  function onInput(event){
    const exercise=currentExercise();if(!exercise)return;
    const target=event.target;
    if(target?.matches?.("[data-ao-latin-text]")){
      state.responses.set(exercise.id,target.value??"");state.feedback.delete(exercise.id);
    }else if(target?.matches?.("[data-ao-latin-match-key]")){
      const prior={...(state.responses.get(exercise.id)||{})};prior[target.dataset.aoLatinMatchKey]=target.value;state.responses.set(exercise.id,prior);state.feedback.delete(exercise.id);
    }
  }
  function onClick(event){
    const target=event.target?.closest?.("button");if(!target)return;
    if(target.matches("[data-ao-latin-close]")){event.preventDefault();close();return}
    if(target.matches("[data-ao-latin-back]")){event.preventDefault();if(state.screen==="lesson"){state.screen="stage";state.lesson=null;render()}else if(state.screen==="stage"){state.screen="stages";state.stage=null;state.stageLessons=[];render()}else close();return}
    if(target.dataset.aoLatinStage){event.preventDefault();void loadStage(Number(target.dataset.aoLatinStage));return}
    if(target.dataset.aoLatinLesson){event.preventDefault();void openLesson(Number(target.dataset.aoLatinLesson));return}
    const exercise=currentExercise();if(!exercise)return;
    if(target.dataset.aoLatinChoiceIndex!==undefined){
      const index=Number(target.dataset.aoLatinChoiceIndex);state.responses.set(exercise.id,canonicalChoiceValue(exercise,index));state.feedback.delete(exercise.id);render();return;
    }
    if(target.dataset.aoLatinTokenIndex!==undefined){
      const index=Number(target.dataset.aoLatinTokenIndex),tokens=canonicalTokenList(exercise.stimulus),prior=state.responses.get(exercise.id)||{indices:[],canonical:[]};
      const set=new Set(prior.indices||[]);if(set.has(index))set.delete(index);else set.add(index);
      const indices=[...set].sort((a,b)=>a-b),canonical=indices.map(i=>tokens[i]?.canonical).filter(Boolean);
      state.responses.set(exercise.id,{indices,canonical});state.feedback.delete(exercise.id);render();return;
    }
    if(target.matches("[data-ao-latin-check]")){
      let response=state.responses.get(exercise.id);
      if(exercise.exerciseType==="token_select")response=response?.canonical||[];
      const result=gradeLatinExercise(exercise,response);
      state.feedback.set(exercise.id,{shown:true,correct:result.correct,selfCheck:result.selfCheck});render();return;
    }
    if(target.matches("[data-ao-latin-ex-prev]")){state.exerciseIndex=Math.max(0,state.exerciseIndex-1);render();return}
    if(target.matches("[data-ao-latin-ex-next]")){state.exerciseIndex=Math.min((state.lesson?.exercises?.length||1)-1,state.exerciseIndex+1);render();return}
  }
  async function open(){
    state.open=true;state.screen="stages";state.stage=null;state.stageLessons=[];state.lesson=null;state.error="";state.loading=true;ensureRoot();attach();render();
    try{await ensureCourse()}catch(error){state.error=String(error?.message||error)}
    state.loading=false;render();return true;
  }
  function close(){
    state.open=false;const node=root();if(node){const active=win?.document?.activeElement;if(node.contains(active))try{active.blur?.()}catch{}node.remove()}
    state.screen="stages";state.stage=null;state.stageLessons=[];state.lesson=null;state.loading=false;state.error="";return true;
  }
  function status(){
    return Object.freeze({version:LATIN_COURSE_VERSION,installed:true,open:Boolean(state.open&&root()),screen:state.screen,stage:state.stage,lesson:state.lesson?.lesson??null,language:langOf(win),cachedLessons:state.cache.size,canonicalResponses:state.responses.size});
  }
  return Object.freeze({version:LATIN_COURSE_VERSION,open,close,status,render,loadStage,openLesson});
}

export function ensureLatinCourseRegistry(win=globalThis){
  if(win?.AO_MODULES?.__aoLatinCourseV1)return win.AO_MODULES;
  const base=win?.AO_MODULES;if(!base)return null;
  const runtime=win.AO_LATIN_COURSE_V1||createLatinCourseRuntime(win);win.AO_LATIN_COURSE_V1=runtime;
  const wrapper={...base,__aoLatinCourseV1:true,
    get(id){if(id===LATIN_COURSE_ROUTE_ID)return LATIN_COURSE_DEFINITION;return base.get?.(id)||null},
    resolve(id){if(id===LATIN_COURSE_ROUTE_ID)return {ok:true,input:id,id,defaults:{},chain:[id],definition:LATIN_COURSE_DEFINITION};return base.resolve?.(id)},
    async open(id,opts={}){if(id===LATIN_COURSE_ROUTE_ID)return {ok:await runtime.open(opts)!==false,input:String(id),canonicalId:id,type:"module",domain:"learn",options:opts,aliasChain:[id],error:null};return base.open?.(id,opts)},
    list(filter={}){const prior=[...(base.list?.(filter)||[])].filter(x=>x?.id!==LATIN_COURSE_ROUTE_ID);if((!filter.type||filter.type==="module")&&(!filter.domain||String(filter.domain).toLowerCase()==="learn"))prior.push(LATIN_COURSE_DEFINITION);return prior}
  };
  win.AO_MODULES=wrapper;win.AO_MODULE_REGISTRY_V36=wrapper;return wrapper;
}

export function installLatinCourseModule(win=globalThis){
  if(!win)return false;
  if(!win.AO_LATIN_COURSE_V1)win.AO_LATIN_COURSE_V1=createLatinCourseRuntime(win);
  ensureLatinCourseRegistry(win);
  return win.AO_LATIN_COURSE_V1;
}
