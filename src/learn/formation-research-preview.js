import { FORMATION_RESEARCH_PREVIEW_DATA as DATA } from "./formation-research-preview-data.js";
import { TRADITIONAL_MASS_RESEARCH_PREVIEW_DATA as TLM } from "./traditional-mass-research-preview-data.js";
import {scriptureContextCapsule} from "../scripture/context.js";

export const FORMATION_RESEARCH_PREVIEW_ROOT="ao-formation-research-preview";
export const FORMATION_RESEARCH_PREVIEW_VERSION="FORMATION_RESEARCH_PREVIEW_V1";
const answerMap=new Map(DATA.answers.map(x=>[x.question_id,x]));
const debateMap=new Map(DATA.debates.map(x=>[x.id,x]));
const allQuestions=[...DATA.questions,...TLM.questions];
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const inline=x=>esc(x).replace(/\*\*([^*\n]+)\*\*/g,"<strong>$1</strong>").replace(/\*([^*\n]+)\*/g,"<em>$1</em>");
const fr=win=>win?.AO_RUNTIME_V8?.store?.getState?.()?.language==="fr"||win?.document?.documentElement?.lang==="fr";
const L=(win,en,french)=>fr(win)?french:en;
const body=(win,p)=>fr(win)?p?.text_fr||p?.text||"":p?.text||"";
const CSS=`
#ao-formation-research-preview{position:fixed;inset:0 0 calc(var(--ao-global-ribbon-h,68px) + var(--safe-bottom,0px)) 0;z-index:16001;overflow-y:auto;overscroll-behavior:contain;background:var(--ao-bg-canvas,#080c12);color:var(--ao-text-primary,#e9e4d9);font:1rem/1.65 var(--ao-font-body,Georgia,serif)}
#ao-formation-research-preview *{box-sizing:border-box}#ao-formation-research-preview[hidden]{display:none!important}
.aoFRTop{position:sticky;top:0;z-index:3;display:grid;grid-template-columns:46px minmax(0,1fr) 46px;align-items:center;gap:10px;padding:calc(9px + var(--safe-top,0px)) 14px 11px;background:var(--ao-bg-canvas,#080c12);border-bottom:1px solid var(--ao-rule,#3d3d40)}
.aoFRTop button,.aoFRPrevNext button{min-height:44px;background:transparent;color:inherit;border:1px solid var(--ao-rule,#3d3d40);border-radius:12px;font:1.05rem system-ui}
.aoFRTop div{text-align:center;line-height:1.3}.aoFRTop small{display:block;color:var(--ao-text-muted,#a9a5a0);font:.66rem system-ui;text-transform:uppercase;letter-spacing:.08em}
.aoFRTop strong{font:600 1.05rem var(--ao-font-display,Georgia,serif)}
.aoFRWrap{max-width:780px;padding:18px 15px 55px;margin:0 auto}.aoFRWrap h1{font:500 clamp(1.7rem,6vw,2.4rem)/1.2 var(--ao-font-display,Georgia,serif);margin:8px 0 22px}.aoFRWrap h2{font:600 1.22rem var(--ao-font-display,Georgia,serif);margin:27px 0 12px}
.aoFRWrap p{margin:0 0 12px;line-height:1.65}.aoFRMeta{font:.7rem system-ui;letter-spacing:.06em;color:var(--ao-text-muted,#a9a5a0)}
.aoFRNotice{border-left:2px solid var(--liturgical,#c9ad78);margin:14px 0;padding:12px;color:var(--ao-text-muted,#bdb6ab);font:.8rem/1.5 system-ui}
.aoFRSources{display:flex;flex-wrap:wrap;gap:6px 14px;margin:0 0 21px;font:400 max(13px,.8125rem)/1.5 var(--ao-font-ui,system-ui,sans-serif)}.aoFRSources a{color:var(--liturgical,#c9ad78);text-decoration:underline;overflow-wrap:anywhere}.aoFRSourceHold{color:var(--ao-text-muted,#bdb6ab);font-style:italic;overflow-wrap:anywhere}
.aoFRList{display:grid;gap:8px;margin-top:18px}.aoFRList button,.aoFRSub button{display:block;width:100%;padding:13px;text-align:left;border:1px solid var(--ao-rule,#3d3d40);border-radius:12px;background:var(--ao-surface-1,#101821);color:inherit;font:1rem/1.4 var(--ao-font-body,Georgia,serif)}
.aoFRList small{display:block;font:.7rem/1.4 system-ui;color:var(--ao-text-muted,#a9a5a0);margin-bottom:5px}
.aoFRSearch{display:block;width:100%;padding:12px;border:1px solid var(--ao-rule,#3d3d40);border-radius:12px;background:var(--ao-surface-1,#101821);color:inherit;font:1rem system-ui}
.aoFRSelect{display:flex;gap:7px;margin:13px 0}.aoFRSelect button{padding:8px 14px;color:inherit;background:transparent;border:1px solid var(--ao-rule,#3d3d40);border-radius:20px;font:.8rem system-ui}.aoFRSelect button[aria-pressed=true]{border-color:var(--liturgical,#c9ad78)}
.aoFRPart{border-top:1px solid var(--ao-rule,#3d3d40);padding:12px 0}.aoFRLead{color:var(--liturgical,#c9ad78);font:.72rem/1.6 system-ui;letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px}
.aoFRPrevNext{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:24px 0}.aoFRPrevNext button{font:.8rem system-ui}.aoFRPrevNext button:disabled{opacity:.35}
@media(max-width:440px){.aoFRWrap{padding:15px 12px 45px}}@media(prefers-reduced-motion:reduce){#ao-formation-research-preview{scroll-behavior:auto!important}}`;
// Curated *existing* biblical-source locators. These do not create new
// theological claims or mark unpublished Formation content as approved.
// Source title, type and exact primary URL must still match the frozen witness.
export const FORMATION_PREVIEW_BIBLE_WITNESSES=Object.freeze({
 "ISA714":Object.freeze({reference:"Isaiah 7:14",type:"SCRIPTURE",url:"https://www.drbo.org/chapter/27007.htm"}),
 "DRBOAPOC":Object.freeze({reference:"Revelation 17:1",type:"SCRIPTURE",url:"https://www.drbo.org/chapter/73017.htm"}),
 "HEBREWS-1":Object.freeze({reference:"Hebrews 1:1",type:"PRIMARY_OR_SCHOLARLY",url:"https://www.newadvent.org/bible/heb001.htm"}),
 "REVELATION-13":Object.freeze({reference:"Revelation 13:1",type:"PRIMARY_OR_SCHOLARLY",url:"https://bible.usccb.org/bible/revelation/13"}),
 "REVELATION-17":Object.freeze({reference:"Revelation 17:1",type:"CATHOLIC_SCRIPTURE_WITH_TRADITIONAL_COMMENTARY",url:"https://www.drbo.org/chapter/73017.htm"}),
 "1JOHN-2":Object.freeze({reference:"1 John 2:1",type:"PRIMARY_OR_SCHOLARLY",url:"https://bible.usccb.org/bible/1john/2"}),
 "2THESS-2":Object.freeze({reference:"2 Thessalonians 2:1",type:"PRIMARY_OR_SCHOLARLY",url:"https://bible.usccb.org/bible/2thessalonians/2"}),
 "OBADIAH":Object.freeze({reference:"Obadiah 1:1",type:"PRIMARY_OR_SCHOLARLY",url:"https://bible.usccb.org/bible/obadiah/1"})
});
export function formationPreviewBibleCapsule(win,group,id,record){
 if(group!=="biblical")return "";
 const reviewed=FORMATION_PREVIEW_BIBLE_WITNESSES[id];
 if(!reviewed || record?.url!==reviewed.url || record?.type!==reviewed.type)return "";
 return scriptureContextCapsule(reviewed.reference,{french:fr(win)});
}

// Internal research must expose unresolved evidence rather than silently
// dropping absent source IDs or non-document destinations from a paragraph.
export function formationResearchSourceLinks(win,ids,group){
  const set=DATA.sourceSets[group]||TLM.source_sets[group]||{};
  const unique=[...new Set(ids||[])];
  const items=(unique.length?unique:[null]).map(id=>{
    const record=id===null?null:set[id];
    let destination="";
    try{
      const parsed=new URL(record?.url||"");
      if(parsed.protocol==="https:")destination=parsed.href;
    }catch{}
    return destination
      ?`<a href="${esc(destination)}" target="_blank" rel="noopener noreferrer" title="${esc(record.title||id)}">${esc(record.title||id)} ↗</a>${formationPreviewBibleCapsule(win,group,id,record)}`
      :`<span class="aoFRSourceHold" data-ao-fr-source-hold="${esc(id??"none")}">${esc(id===null
        ?L(win,"No documentary source attached — review required","Aucune source documentaire jointe — examen requis")
        :L(win,"Source not verified","Source non vérifiée")+": "+id)}</span>`;
  }).join("");
  return `<nav class="aoFRSources" aria-label="${esc(L(win,"Sources and unresolved references","Sources et références non vérifiées"))}">${items}</nav>`;
}

export function createFormationResearchPreview(win=globalThis){
  const state={view:"list",questionId:null,debateId:null,query:"",scope:"all",open:false,touch:null};
  const root=()=>win?.document?.getElementById?.(FORMATION_RESEARCH_PREVIEW_ROOT)||null;
  const chosen=()=>allQuestions.find(x=>x.id===state.questionId)||null;
  const series=()=>state.questionId?.startsWith("TLM")?TLM.questions:DATA.questions;
  const title=q=>fr(win)?q?.title_fr:q?.title_en;
  const links=(ids,group)=>formationResearchSourceLinks(win,ids,group);
  const para=(p,kind)=>!p?"":`<p>${inline(body(win,p))}</p>${links(p.source_ids,kind)}`;
  const paragraphs=(ps,kind)=>(ps||[]).map(p=>para(p,kind)).join("");
  function argumentsView(items,kind){
    if(!items?.length)return "";
    return `<h2>${esc(L(win,"Objections & replies","Objections et réponses"))}</h2>`+items.map(x=>`<div class="aoFRPart">
    ${x.proponent?`<div class="aoFRLead">${esc(x.proponent)}</div>`:""}
    ${para(x.argument||x.objection,kind)}<div class="aoFRLead">${esc(L(win,"Reply","Réponse"))}</div>${para(x.response,kind)}</div>`).join("");
  }
  function answerView(){
    if(chosen()?.id?.startsWith("TLM"))return traditionalMassView(chosen());
    const a=answerMap.get(state.questionId);
    if(!a)return "";
    return `${paragraphs(a.answer_paragraphs,"biblical")}${argumentsView(a.objections,"biblical")}
    <h2>${esc(L(win,"Traditional Catholic argument","Argument catholique traditionnel"))}</h2>${para(a.traditional_argument,"biblical")}`;
  }
  function traditionalMassView(q){
    if(!q)return "";
    const labels={
      substantive:["Explanation & assessment","Explication et examen"],
      answer:["Answer","Réponse"],
      identified_objection:["Documented objection","Objection documentée"],
      critical_assessment:["Critical assessment","Examen critique"],
      assessment:["Assessment","Appréciation"],
      editorial_followup_question:["Editorial follow-up — not a quotation","Question éditoriale — non citée"],
      documented_reform_rationale:["Documented reform rationale","Justification documentée de la réforme"],
      source_based_critical_argument:["Source-based critical argument — editorial synthesis","Argument critique fondé sur des sources — synthèse éditoriale"],
    };
    const paragraphs=q.paragraphs.map(p=>{
      const label=labels[p.role]||["Source-linked research","Recherche sourcée"];
      const notice=p.role==="editorial_followup_question"
        ? `<p class="aoFRMeta">${esc(L(win,"This is an internal follow-up question, not an objection attributed to an external author. Source links provide topic context only.","Cette question interne n’est attribuée à aucun auteur extérieur. Les liens indiquent seulement le contexte documentaire."))}</p>`
        : "";
      return `<section class="aoFRPart"><div class="aoFRLead">${esc(L(win,...label))}</div><p>${inline(body(win,p))}</p>${notice}${links(p.source_ids,q.source_group)}</section>`;
    }).join("");
    const note=q.editorial_stage?.includes("NORMALIZED")
      ? L(win,"Normalized research summary, not a verbatim recovery of the earlier draft.","Synthèse de recherche, non reproduction intégrale de la version antérieure.")
      : L(win,"Source-linked bilingual research draft. Final source and theological approval pending.","Projet bilingue sourcé. Validation finale des sources et de la théologie à effectuer.");
    const prompt=q.question_prompt_provenance==="UNATTRIBUTED_EDITORIAL_PROMPT_NOT_A_QUOTATION"
      ? `<div class="aoFRMeta">${esc(L(win,"Question formulated for editorial study, not an attributed quotation.","Question formulée pour l'étude éditoriale, non citation attribuée."))}</div>`:"";
    const gate=q.publication_ready===false?`<div class="aoFRMeta">${esc(L(win,"Unapproved research · Do not publish","Recherche non approuvée · Ne pas publier"))}</div>`:"";
    return `<div class="aoFRNotice">${esc(note)}</div>${prompt}${gate}${paragraphs}`;
  }
  function debateView(){
    const d=debateMap.get(state.debateId);if(!d)return "";
    return `<div class="aoFRMeta">${esc(d.id)}</div><h1>${esc(fr(win)?d.title_fr:d.title)}</h1>
    <h2>${esc(L(win,"Answer","Réponse"))}</h2>${paragraphs(d.short_answer,"sedevacantism")}
    <h2>${esc(L(win,"Sedevacantist argument","Argument sédévacantiste"))}</h2><div class="aoFRLead">${esc(d.sedevacantist_case.attributed_to)}</div>${paragraphs(d.sedevacantist_case.paragraphs,"sedevacantism")}
    <h2>${esc(L(win,"Critical assessment","Examen critique"))}</h2>${paragraphs(d.critical_assessment,"sedevacantism")}
    ${argumentsView(d.objections,"sedevacantism")}
    <h2>${esc(L(win,"Traditional Catholic argument","Argument catholique traditionnel"))}</h2>${paragraphs(d.traditional_argument,"sedevacantism")}`;
  }
  function available(){
    return allQuestions.filter(q=>{
      const inScope=state.scope==="all"
        ||(state.scope==="apol"&&q.owner.startsWith("APOL-")&&!q.id.startsWith("TLM"))
        ||(state.scope==="crisis"&&q.owner.startsWith("CR-")&&!q.id.startsWith("TLM"))
        ||(state.scope==="tlm"&&q.id.startsWith("TLM"));
      return inScope&&[q.id,q.domain,q.owner,q.title_en,q.title_fr,q.id.startsWith("TLM")?"Traditional Mass":""].
        some(x=>String(x||"").toLowerCase().includes(state.query.toLowerCase()));
    });
  }
  function listItems(){
    const items=available();
    if(state.scope==="tlm"){
      const grouped=new Map();
      for(const q of items){if(!grouped.has(q.owner))grouped.set(q.owner,[]);grouped.get(q.owner).push(q);}
      return [...grouped].map(([owner,qs])=>{
        const canon=TLM.canonical_owners?.[owner];
        const heading=canon?.title||owner;
        const buttons=qs.map(q=>`<button type="button" data-ao-fr-question="${esc(q.id)}"><small>${esc(q.id)} · ${esc(owner)}</small>${esc(title(q))}</button>`).join("");
        return `<section class="aoFROwnerGroup" data-ao-fr-owner="${esc(owner)}"><h2>${esc(heading)}</h2><div class="aoFRMeta">${esc(L(win,"Existing Church Crisis dossier · draft subquestions","Dossier existant Crise de l’Église · sous-questions en projet"))}</div>${buttons}</section>`;
      }).join("")||`<p>${esc(L(win,"No matching questions.","Aucune question trouvée."))}</p>`;
    }
    return items.map(q=>`<button type="button" data-ao-fr-question="${esc(q.id)}"><small>${esc(q.id)} · ${esc(q.owner)}</small>${esc(title(q))}</button>`).join("")||`<p>${esc(L(win,"No matching questions.","Aucune question trouvée."))}</p>`;
  }
  function listView(){
    return `<div class="aoFRMeta">${esc(L(win,"Internal editorial preview","Aperçu éditorial interne"))}</div>
    <h1>${esc(L(win,"Apologetics & Church Crisis","Apologétique et crise de l’Église"))}</h1>
    <div class="aoFRNotice">${esc(L(win,"Research drafts only: source and theological approval pending. This material is not published.","Projets de recherche : les sources et la théologie restent à valider. Ces textes ne sont pas publiés."))}</div>
    <div class="aoFRSelect" role="group">
    ${[["all","All","Toutes"],["apol","Apologetics","Apologétique"],["crisis","Church Crisis","Crise de l’Église"],["tlm","Traditional Mass","Messe traditionnelle"]].map(z=>`<button type="button" data-ao-fr-scope="${z[0]}" aria-pressed="${state.scope===z[0]}">${esc(L(win,z[1],z[2]))}</button>`).join("")}</div>
    <input type="search" class="aoFRSearch" data-ao-fr-search aria-label="${esc(L(win,"Search","Rechercher"))}" placeholder="${esc(L(win,"Find a question","Rechercher une question"))}" value="${esc(state.query)}">
    <div class="aoFRList" data-ao-fr-results>${listItems()}</div>`;
  }
  function questionView(){
    const q=chosen();if(!q)return listView();
    const currentSeries=series(),i=currentSeries.findIndex(x=>x.id===q.id),prev=i>0,next=i<currentSeries.length-1;
    const owner=TLM.canonical_owners?.[q.owner];
    const ownerLine=owner&&q.id.startsWith("TLM")?`<p class="aoFRMeta">${esc(L(win,"Church Crisis owner","Dossier Crise de l’Église"))}: ${esc(owner.title)}</p>`:"";
    return `<div class="aoFRMeta">${esc(q.id)} · ${esc(q.owner)}</div>${ownerLine}<h1>${esc(title(q))}</h1>
    <div class="aoFRNotice">${esc(L(win,"Unpublished editorial draft","Projet éditorial non publié"))}</div>${answerView()}
    ${q.debate_ids?.length?`<h2>${esc(L(win,"Complete debates","Débats complets"))}</h2><div class="aoFRSub">${q.debate_ids.map(id=>{const d=debateMap.get(id);return d?`<button type="button" data-ao-fr-debate="${esc(id)}">${esc(fr(win)?d.title_fr:d.title)}</button>`:""}).join("")}</div>`:""}
    <nav class="aoFRPrevNext"><button type="button" data-ao-fr-move="-1"${prev?"":" disabled"}>${esc(L(win,"Previous","Précédente"))}</button>
    <button type="button" data-ao-fr-move="1"${next?"":" disabled"}>${esc(L(win,"Next","Suivante"))}</button></nav>`;
  }
  function ensure(){
    const doc=win?.document;if(!doc?.body)return null;
    let el=root();if(el)return el;
    el=doc.createElement("section");el.id=FORMATION_RESEARCH_PREVIEW_ROOT;el.setAttribute("role","region");el.setAttribute("aria-label","Formation research preview");
    el.addEventListener("click",ev=>{
      const b=ev.target?.closest?.("button");if(!b)return;
      if(b.hasAttribute("data-ao-fr-back")){ev.preventDefault?.();back();return;}
      if(b.hasAttribute("data-ao-fr-home")){ev.preventDefault?.();close();win?.AO_APP_SHELL_V1?.navigate?.("home");return;}
      if(b.dataset.aoFrQuestion){ev.preventDefault?.();openQuestion(b.dataset.aoFrQuestion);return;}
      if(b.dataset.aoFrDebate){ev.preventDefault?.();openDebate(b.dataset.aoFrDebate);return;}
      if(b.dataset.aoFrScope){ev.preventDefault?.();state.scope=b.dataset.aoFrScope;paint();return;}
      if(b.dataset.aoFrMove){ev.preventDefault?.();move(Number(b.dataset.aoFrMove));}
    });
    el.addEventListener("input",ev=>{if(ev.target?.matches?.("[data-ao-fr-search]")){state.query=ev.target.value;const x=root()?.querySelector?.("[data-ao-fr-results]");if(x)x.innerHTML=listItems();}});
    el.addEventListener("touchstart",ev=>{const p=ev.touches?.[0];state.touch=p?{x:p.clientX,y:p.clientY}:null;},{passive:true});
    el.addEventListener("touchend",ev=>{const p=ev.changedTouches?.[0],t=state.touch;state.touch=null;if(!p||!t||state.view!=="question")return;const dx=p.clientX-t.x,dy=p.clientY-t.y;if(Math.abs(dx)>75&&Math.abs(dx)>1.8*Math.abs(dy))move(dx<0?1:-1);},{passive:true});
    el.addEventListener("keydown",ev=>{if(ev.key==="Escape"){ev.preventDefault?.();back();}});
    doc.body.append(el);return el;
  }
  function paint(){
    const el=ensure();if(!el||!state.open)return false;
    el.lang=fr(win)?"fr":"en";
    el.innerHTML=`<style>${CSS}</style><header class="aoFRTop">
    <button type="button" data-ao-fr-back aria-label="${esc(L(win,"Back","Retour"))}">‹</button>
    <div><small>${esc(L(win,"Internal · Not published","Interne · Non publié"))}</small><strong>Formation</strong></div>
    <button type="button" data-ao-fr-home aria-label="${esc(L(win,"Home","Accueil"))}">⌂</button></header>
    <main class="aoFRWrap">${state.view==="list"?listView():state.view==="question"?questionView():debateView()}</main>`;
    el.hidden=false;return true;
  }
  function open(){if(!ensure())return false;state.open=true;return paint();}
  function openQuestion(id){if(!allQuestions.some(x=>x.id===id))return false;state.questionId=id;state.debateId=null;state.view="question";paint();root()?.scrollTo?.(0,0);return true;}
  function openDebate(id){if(!chosen()?.debate_ids?.includes(id)||!debateMap.has(id))return false;state.debateId=id;state.view="debate";paint();root()?.scrollTo?.(0,0);return true;}
  function move(delta){const questions=series(),n=questions.findIndex(x=>x.id===state.questionId)+delta;return questions[n]?openQuestion(questions[n].id):false;}
  function back(){if(state.view==="debate"){state.view="question";state.debateId=null;paint();return true;}if(state.view==="question"){state.view="list";state.questionId=null;paint();return true;}return close(true);}
  function close(toLearn=false){const el=root();try{el?.querySelector?.(":focus")?.blur?.();}catch{}el?.remove?.();state.open=false;state.view="list";state.questionId=null;state.debateId=null;if(toLearn)win?.AO_LEARN_APP_V1?.open?.();return true;}
  function status(){return Object.freeze({version:FORMATION_RESEARCH_PREVIEW_VERSION,open:state.open,view:state.view,questions:allQuestions.length,traditionalMassQuestions:TLM.questions.length,traditionalMassOwnerDossiers:Object.keys(TLM.canonical_owners||{}).length,approvedTraditionalMassQuestions:0,answered:answerMap.size,debates:debateMap.size,published:false});}
  return Object.freeze({open,openQuestion,openDebate,back,close,paint,status});
}
export function installFormationResearchPreview(win=globalThis){
  if(!win?.AO_FORMATION_RESEARCH_PREVIEW_V1)win.AO_FORMATION_RESEARCH_PREVIEW_V1=createFormationResearchPreview(win);
  return win.AO_FORMATION_RESEARCH_PREVIEW_V1;
}
