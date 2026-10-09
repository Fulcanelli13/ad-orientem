import { resolveCanonicalAssetUrl } from "../assets/asset-registry.js";
import { scriptureContextCapsule } from "../scripture/context.js";

export const APOSTOLATE_PRESENTATION_VERSION="apostolate-presentation-v1";
export const APOSTOLATE_ROOT_ID="ao-apostolate-root";

const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const isFr=state=>state?.language==="fr";
const L=(state,en,fr)=>isFr(state)?fr:en;
const pick=(pair,state)=>isFr(state)?(pair?.fr??pair?.en??""):(pair?.en??pair?.fr??"");

function icon(assetId){
  const url=resolveCanonicalAssetUrl(assetId);
  if(!url)return "";
  return `<span class="aoApostolateIcon" data-ao-asset-id="${esc(assetId)}" aria-hidden="true" style="background:currentColor;-webkit-mask:url('${esc(url)}') center/contain no-repeat;mask:url('${esc(url)}') center/contain no-repeat"></span>`;
}

function scenarioKind(id,state){
  if(id.startsWith("AQ"))return L(state,"Question","Question");
  if(id.startsWith("HS"))return L(state,"Pastoral help","Aide pastorale");
  if(id.startsWith("FH"))return L(state,"Family & home","Famille & foyer");
  if(id.startsWith("TF"))return L(state,"Teach the Faith","Transmettre la foi");
  if(id.startsWith("DV"))return L(state,"Introduce a devotion","Introduire une dévotion");
  if(id.startsWith("WC"))return L(state,"Work & social","Travail & vie sociale");
  return L(state,"Situation","Situation");
}

function sourceMarkup(source,state){
  if(!source)return "";
  const href=isFr(state)&&source.urlFr?source.urlFr:source.url;
  return `<li><a href="${esc(href)}" target="_blank" rel="noopener"><strong>${esc(source.work)}</strong><span>${esc(source.locator||"")}</span></a>${source.authority==="SACRED_SCRIPTURE"?scriptureContextCapsule(String(source.locator||"").split(" · ")[0],{french:isFr(state)}):""}</li>`;
}

function skillMarkup(skill,state){
  if(!skill)return "";
  return `<details class="aoApostolateSkill"><summary><strong>${esc(pick(skill.title,state))}</strong><span>${esc(pick(skill.summary,state))}</span></summary><div><p>${esc(pick(skill.explanation,state))}</p><h4>${esc(L(state,"Practise","À pratiquer"))}</h4><ul>${(skill.practice?.[isFr(state)?"fr":"en"]||[]).map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div></details>`;
}

function handoffLabel(h,state){
  const target=String(h?.targetId||"");
  if(target.startsWith("learn."))return L(state,"Open related Formation","Ouvrir la Formation liée");
  if(target.startsWith("pray."))return L(state,"Open related prayer","Ouvrir la prière liée");
  if(target.startsWith("mass"))return L(state,"Open Mass","Ouvrir la Messe");
  if(target==="find")return L(state,"Open Explore","Ouvrir Explorer");
  if(/^[A-Z]{2}\d{2}$/.test(target))return L(state,"Open related situation","Ouvrir la situation liée");
  return L(state,"Continue","Continuer");
}

function handoffsMarkup(scenario,state){
  if(!scenario?.handoffs?.length)return "";
  return `<div class="aoApostolateActions">${scenario.handoffs.map((h,i)=>`<button type="button" data-ao-ap-handoff="${i}">${esc(handoffLabel(h,state))}</button>`).join("")}</div>`;
}

function guidanceMarkup(scenario,state,skills,sources){
  if(!scenario)return "";
  const lang=isFr(state)?"fr":"en";
  const skillRecords=(scenario.apfSkills||[]).map(id=>skills.get(id)).filter(Boolean);
  const sourceRecords=(scenario.sourceIds||[]).map(id=>sources[id]).filter(Boolean);
  return `
    <details class="aoApostolateDetail" open>
      <summary>${esc(L(state,"Why this answer","Pourquoi cette réponse"))}</summary>
      <p>${esc(pick(scenario.explanation,state))}</p>
    </details>
    <details class="aoApostolateDetail">
      <summary>${esc(L(state,"What to avoid","À éviter"))}</summary>
      <ul>${(scenario.avoid?.[lang]||[]).map(x=>`<li>${esc(x)}</li>`).join("")}</ul>
    </details>
    ${skillRecords.length?`<section class="aoApostolateSkills"><h2>${esc(L(state,"Skills for this conversation","Compétences pour cet échange"))}</h2>${skillRecords.map(x=>skillMarkup(x,state)).join("")}</section>`:""}
    ${sourceRecords.length?`<details class="aoApostolateSources"><summary>${esc(L(state,"Sources","Sources"))} · ${sourceRecords.length}</summary><ul>${sourceRecords.map(x=>sourceMarkup(x,state)).join("")}</ul></details>`:""}
    ${handoffsMarkup(scenario,state)}
  `;
}

function detailMarkup(scenario,state,skills,sources){
  if(!scenario)return "";
  return `
    <section class="aoApostolateScenarioHero">
      <div class="aoApostolateEyebrow">${esc(scenarioKind(scenario.id,state))}</div>
      <h1>${esc(pick(scenario.title,state))}</h1>
    </section>
    <section class="aoApostolateAnswer">
      <h2>${esc(L(state,"Short answer","Réponse courte"))}</h2>
      <p>${esc(pick(scenario.text,state))}</p>
    </section>
    ${guidanceMarkup(scenario,state,skills,sources)}
  `;
}
function practiceMarkup(scenario,state,skills,sources){
  if(!scenario)return "";
  const reveal=Boolean(state.practiceRevealed);
  return `
    <section class="aoApostolateScenarioHero">
      <div class="aoApostolateEyebrow">${esc(L(state,"PRACTISE","S’EXERCER"))} · ${esc(scenarioKind(scenario.id,state))}</div>
      <h1>${esc(pick(scenario.title,state))}</h1>
      <p>${esc(L(state,"Draft a short answer as if you were speaking to a real person. Nothing you type here is saved.","Rédigez une réponse brève comme si vous parliez à une personne réelle. Rien de ce que vous saisissez ici n’est enregistré."))}</p>
    </section>
    <label class="aoApostolateDraft">
      <span>${esc(L(state,"Your response","Votre réponse"))}</span>
      <textarea data-ao-ap-draft rows="6" placeholder="${esc(L(state,"Aim for 2–4 clear sentences.","Visez 2 à 4 phrases claires."))}">${esc(state.draft||"")}</textarea>
    </label>
    <button type="button" class="aoApostolatePrimary" data-ao-ap-compare>${esc(reveal?L(state,"Hide guide","Masquer le guide"):L(state,"Compare with guide","Comparer avec le guide"))}</button>
    ${reveal?`<section class="aoApostolateCompare"><h2>${esc(L(state,"A strong concise answer","Une réponse concise et solide"))}</h2><p>${esc(pick(scenario.text,state))}</p></section>${guidanceMarkup(scenario,state,skills,sources)}`:""}
  `;
}

function scenarioButton(scenario,state,{quote=false}={}){
  return `<button type="button" class="aoApostolateScenarioRow" data-ao-ap-scenario="${esc(scenario.id)}"><span class="kind">${esc(scenarioKind(scenario.id,state))}</span><strong>${quote?"“":""}${esc(pick(scenario.title,state))}${quote?"”":""}</strong><span class="arrow">${icon("ao-ui-next")}</span></button>`;
}

function filtered(records,state){
  const q=String(state.query||"").trim().toLocaleLowerCase(isFr(state)?"fr":"en");
  if(!q)return records;
  return records.filter(s=>[pick(s.title,state),pick(s.text,state)].join(" ").toLocaleLowerCase(isFr(state)?"fr":"en").includes(q));
}

function searchMarkup(state){
  return `<label class="aoApostolateSearch">${icon("ao-ui-search")}<input type="search" data-ao-ap-search value="${esc(state.query||"")}" placeholder="${esc(L(state,"Search situations","Rechercher une situation"))}"></label>`;
}

function listMarkup(mode,state,scenarios){
  const all=[...scenarios.values()];
  if(mode==="answer"){
    const rows=filtered(all.filter(s=>s.id.startsWith("AQ")),state);
    return `<section class="aoApostolateListIntro"><h1>${esc(L(state,"Answer a question","Répondre à une question"))}</h1><p>${esc(L(state,"Start with a concise Catholic answer; deepen only if the person actually needs more.","Commencez par une réponse catholique concise ; approfondissez seulement si la personne en a réellement besoin."))}</p></section>${searchMarkup(state)}<div class="aoApostolateList">${rows.map(s=>scenarioButton(s,state)).join("")}</div>`;
  }
  if(mode==="practice"){
    const rows=filtered(all,state);
    return `<section class="aoApostolateListIntro"><h1>${esc(L(state,"Practise","S’exercer"))}</h1><p>${esc(L(state,"Choose a real situation, draft a short response, then compare it with the sourced guide. No score and no saved draft.","Choisissez une situation réelle, rédigez une réponse brève, puis comparez-la au guide sourcé. Aucun score et aucun brouillon enregistré."))}</p></section>${searchMarkup(state)}<div class="aoApostolateList">${rows.map(s=>scenarioButton(s,state)).join("")}</div>`;
  }
  const groups=[
    [L(state,"When someone wants to return or begin","Quand quelqu’un veut revenir ou commencer"),all.filter(s=>s.id.startsWith("HS")),true],
    [L(state,"Family & home","Famille & foyer"),all.filter(s=>s.id.startsWith("FH")),false],
    [L(state,"Teach or introduce the Faith","Transmettre ou introduire la foi"),all.filter(s=>s.id.startsWith("TF")),false],
    [L(state,"Introduce a devotion or practice","Introduire une dévotion ou une pratique"),all.filter(s=>s.id.startsWith("DV")),false],
    [L(state,"Work & social situations","Travail & vie sociale"),all.filter(s=>s.id.startsWith("WC")),false],
  ];
  return `<section class="aoApostolateListIntro"><h1>${esc(L(state,"Help someone","Aider quelqu’un"))}</h1><p>${esc(L(state,"Choose the situation that best matches the other person’s actual need. Apostolate does not replace a priest, sacrament or specialist owner.","Choisissez la situation qui correspond le mieux au besoin réel de l’autre personne. Apostolate ne remplace ni un prêtre, ni un sacrement, ni le module compétent."))}</p></section>${searchMarkup(state)}${groups.map(([title,records,quote])=>{const rows=filtered(records,state);return rows.length?`<section class="aoApostolateGroup"><h2>${esc(title)}</h2><div class="aoApostolateList">${rows.map(s=>scenarioButton(s,state,{quote})).join("")}</div></section>`:""}).join("")}`;
}

function skillDetailMarkup(skill,state,sources){
  if(!skill)return "";
  const lang=isFr(state)?"fr":"en";
  const sourceRecords=(skill.sourceIds||[]).map(id=>sources[id]).filter(Boolean);
  return `
    <section class="aoApostolateScenarioHero">
      <div class="aoApostolateEyebrow">${esc(L(state,"APOSTOLIC SKILL","COMPÉTENCE APOSTOLIQUE"))}</div>
      <h1>${esc(pick(skill.title,state))}</h1>
      <p>${esc(pick(skill.summary,state))}</p>
    </section>
    <section class="aoApostolateAnswer"><h2>${esc(L(state,"Why it matters","Pourquoi c’est important"))}</h2><p>${esc(pick(skill.explanation,state))}</p></section>
    <section class="aoApostolateSkills"><h2>${esc(L(state,"Practise","À pratiquer"))}</h2><ul>${(skill.practice?.[lang]||[]).map(x=>`<li>${esc(x)}</li>`).join("")}</ul></section>
    <details class="aoApostolateDetail"><summary>${esc(L(state,"What to avoid","À éviter"))}</summary><ul>${(skill.avoid?.[lang]||[]).map(x=>`<li>${esc(x)}</li>`).join("")}</ul></details>
    ${sourceRecords.length?`<details class="aoApostolateSources"><summary>${esc(L(state,"Sources","Sources"))} · ${sourceRecords.length}</summary><ul>${sourceRecords.map(x=>sourceMarkup(x,state)).join("")}</ul></details>`:""}
  `;
}

function homeMarkup(state){
  const cards=[
    ["answer","ao-ui-search",L(state,"Answer a question","Répondre à une question"),L(state,"Concise Catholic answers to common objections and questions.","Réponses catholiques concises aux questions et objections courantes.")],
    ["help","ao-refined-help",L(state,"Help someone","Aider quelqu’un"),L(state,"Pastoral, family and practical situations where the next step matters as much as the explanation.","Situations pastorales, familiales et pratiques où la prochaine étape compte autant que l’explication.")],
    ["practice","ao-refined-study",L(state,"Practise","S’exercer"),L(state,"Draft a real answer, then compare it with the sourced model and apostolic skills.","Rédigez une réponse réelle, puis comparez-la au modèle sourcé et aux compétences apostoliques.")],
  ];
  return `<section class="aoApostolateHero"><div class="aoApostolateEyebrow">APOSTOLATE</div><h1>${esc(L(state,"Help with clarity and charity","Aider avec clarté et charité"))}</h1><p>${esc(L(state,"Answer honestly, help the person in front of you, and know when to hand the question to Formation, Prayer, Explore or a priest.","Répondez honnêtement, aidez la personne devant vous et sachez quand orienter vers la Formation, la Prière, Explorer ou un prêtre."))}</p></section><div class="aoApostolateHomeGrid">${cards.map(([id,asset,title,desc])=>`<button type="button" class="aoApostolateHomeCard" data-ao-ap-mode="${id}">${icon(asset)}<span><strong>${esc(title)}</strong><small>${esc(desc)}</small></span>${icon("ao-ui-next")}</button>`).join("")}</div>`;
}

export function apostolateCss(){
  return `
#${APOSTOLATE_ROOT_ID}{position:fixed;inset:0 0 calc(var(--ao-global-ribbon-h,68px) + var(--safe-bottom,0px)) 0;z-index:var(--ao-z-surface,2147481800);overflow:auto;overscroll-behavior:contain;background:var(--ao-bg-canvas,#080c12);color:var(--ao-text-primary,#e9e4d9);font-family:var(--ao-font-body,Georgia,serif)}
#${APOSTOLATE_ROOT_ID} *{box-sizing:border-box}
.aoApostolateTop{position:sticky;top:0;z-index:8;display:grid;grid-template-columns:44px minmax(0,1fr) 44px;gap:10px;align-items:center;padding:calc(10px + var(--safe-top,0px)) var(--ao-page-gutter,14px) 10px;background:color-mix(in srgb,var(--ao-bg-canvas,#080c12) 94%,transparent);backdrop-filter:blur(var(--ao-topbar-blur,16px));border-bottom:1px solid var(--ao-rule,rgba(255,255,255,.11))}
.aoApostolateTop button{width:44px;height:44px;border:1px solid var(--ao-rule,rgba(255,255,255,.11));border-radius:999px;background:var(--ao-surface-1,#101821);color:inherit}.aoApostolateTopTitle{text-align:center}.aoApostolateTopTitle small{display:block;color:var(--ao-text-muted,#9ba5b1);font:650 var(--ao-type-ui-xs,11px)/1.2 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.1em}.aoApostolateTopTitle strong{display:block;margin-top:2px;font:600 1rem/1.2 var(--ao-font-display,Georgia,serif)}
.aoApostolateIcon{display:inline-block;width:20px;height:20px;flex:0 0 auto}
.aoApostolateWrap{width:min(var(--ao-content-max,760px),100%);margin:auto;padding:20px var(--ao-page-gutter,14px) 46px}
.aoApostolateHero,.aoApostolateScenarioHero,.aoApostolateListIntro{padding:8px 0 20px}.aoApostolateEyebrow{color:var(--ao-liturgical-accent,#c9ad78);font:650 var(--ao-type-ui-xs,11px)/1.2 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.11em;text-transform:uppercase}.aoApostolateHero h1,.aoApostolateScenarioHero h1,.aoApostolateListIntro h1{margin:7px 0 8px;font:500 clamp(1.8rem,7vw,2.8rem)/1.06 var(--ao-font-display,Georgia,serif)}.aoApostolateHero p,.aoApostolateScenarioHero p,.aoApostolateListIntro p{margin:0;color:var(--ao-text-muted,#9ba5b1);line-height:1.55}
.aoApostolateHomeGrid{display:grid;gap:10px}.aoApostolateHomeCard{width:100%;min-height:92px;display:grid;grid-template-columns:42px minmax(0,1fr) 20px;gap:12px;align-items:center;padding:14px;border:1px solid var(--ao-rule,rgba(255,255,255,.11));border-radius:var(--ao-card-radius,15px);background:var(--ao-surface-1,#101821);color:inherit;text-align:left}.aoApostolateHomeCard>.aoApostolateIcon:first-child{width:36px;height:36px;color:var(--ao-liturgical-accent,#c9ad78)}.aoApostolateHomeCard strong{display:block;font:600 1.05rem/1.25 var(--ao-font-display,Georgia,serif)}.aoApostolateHomeCard small{display:block;margin-top:5px;color:var(--ao-text-muted,#9ba5b1);font:500 var(--ao-type-ui-sm,12px)/1.4 var(--ao-font-ui,system-ui,sans-serif)}
.aoApostolateSearch{min-height:44px;display:flex;align-items:center;gap:9px;margin-bottom:14px;padding:0 12px;border:1px solid var(--ao-rule,rgba(255,255,255,.11));border-radius:var(--ao-control-radius,11px);background:var(--ao-surface-1,#101821)}.aoApostolateSearch input{width:100%;height:42px;border:0;outline:0;background:transparent;color:inherit;font:500 var(--ao-type-ui,14px)/1.2 var(--ao-font-ui,system-ui,sans-serif)}
.aoApostolateGroup{margin-top:22px}.aoApostolateGroup>h2,.aoApostolateSkills>h2,.aoApostolateAnswer>h2,.aoApostolateCompare>h2{margin:0 0 9px;font:600 1rem/1.25 var(--ao-font-display,Georgia,serif)}.aoApostolateList{display:grid;gap:7px}.aoApostolateScenarioRow{width:100%;min-height:62px;display:grid;grid-template-columns:minmax(0,1fr) 22px;gap:8px;padding:11px 12px;border:1px solid var(--ao-rule,rgba(255,255,255,.11));border-radius:var(--ao-control-radius,11px);background:var(--ao-surface-1,#101821);color:inherit;text-align:left}.aoApostolateScenarioRow .kind{grid-column:1;color:var(--ao-liturgical-accent,#c9ad78);font:650 var(--ao-type-ui-xs,11px)/1.2 var(--ao-font-ui,system-ui,sans-serif);text-transform:uppercase;letter-spacing:.06em}.aoApostolateScenarioRow strong{grid-column:1;font:600 .95rem/1.35 var(--ao-font-display,Georgia,serif)}.aoApostolateScenarioRow .arrow{grid-column:2;grid-row:1/3;align-self:center}
.aoApostolateAnswer,.aoApostolateCompare{padding:15px;border:1px solid var(--ao-liturgical-border,rgba(201,173,120,.38));border-radius:var(--ao-card-radius,15px);background:var(--ao-liturgical-soft,rgba(201,173,120,.08))}.aoApostolateAnswer p,.aoApostolateCompare p{margin:0;line-height:1.6}
.aoApostolateDetail,.aoApostolateSources,.aoApostolateSkill{margin-top:12px;border-top:1px solid var(--ao-rule,rgba(255,255,255,.11))}.aoApostolateDetail>summary,.aoApostolateSources>summary,.aoApostolateSkill>summary{min-height:44px;display:flex;align-items:center;gap:8px;cursor:pointer;color:var(--ao-liturgical-accent,#c9ad78);font:650 var(--ao-type-ui-sm,12px)/1.3 var(--ao-font-ui,system-ui,sans-serif)}.aoApostolateDetail p,.aoApostolateDetail ul,.aoApostolateSkill>div,.aoApostolateSources ul{margin:0 0 12px;line-height:1.55}.aoApostolateSkills{margin-top:20px}.aoApostolateSkill summary{align-items:flex-start;flex-direction:column;padding:9px 0}.aoApostolateSkill summary span{color:var(--ao-text-muted,#9ba5b1);font-weight:500}.aoApostolateSkill h4{margin:10px 0 5px}.aoApostolateSources ul{padding-left:20px}.aoApostolateSources li{margin:7px 0}.aoApostolateSources a{color:inherit;text-decoration:none}.aoApostolateSources a span{display:block;color:var(--ao-text-muted,#9ba5b1);font:500 var(--ao-type-ui-xs,11px)/1.4 var(--ao-font-ui,system-ui,sans-serif)}
.aoApostolateActions{display:flex;gap:8px;flex-wrap:wrap;margin-top:18px}.aoApostolateActions button,.aoApostolatePrimary{min-height:44px;padding:8px 12px;border:1px solid var(--ao-liturgical-border,rgba(201,173,120,.38));border-radius:var(--ao-control-radius,11px);background:var(--ao-liturgical-soft,rgba(201,173,120,.08));color:inherit;font:650 var(--ao-type-ui-sm,12px)/1.2 var(--ao-font-ui,system-ui,sans-serif)}
.aoApostolateDraft{display:grid;gap:7px}.aoApostolateDraft>span{font:650 var(--ao-type-ui-sm,12px)/1.2 var(--ao-font-ui,system-ui,sans-serif)}.aoApostolateDraft textarea{width:100%;min-height:130px;padding:12px;border:1px solid var(--ao-rule,rgba(255,255,255,.11));border-radius:var(--ao-control-radius,11px);background:var(--ao-surface-1,#101821);color:inherit;font:500 1rem/1.5 var(--ao-font-body,Georgia,serif);resize:vertical}.aoApostolatePrimary{margin-top:10px}.aoApostolateCompare{margin-top:18px}
@media(max-width:560px){.aoApostolateWrap{padding-left:var(--ao-page-gutter-phone,12px);padding-right:var(--ao-page-gutter-phone,12px)}}
`;
}

export function renderApostolatePresentation(root,state,{scenarios,skills,sources}={}){
  if(!root)return false;
  const selected=state.selectedId?scenarios.get(state.selectedId):null;
  const selectedSkill=state.selectedSkillId?skills.get(state.selectedSkillId):null;
  root.dataset.aoApostolatePresentationOwner=APOSTOLATE_PRESENTATION_VERSION;
  root.lang=isFr(state)?"fr":"en";
  let body="";
  if(state.view==="home")body=homeMarkup(state);
  else if(state.view==="answer"||state.view==="help")body=listMarkup(state.view,state,scenarios);
  else if(state.view==="practice"&&!selected)body=listMarkup("practice",state,scenarios);
  else if(state.view==="practice"&&selected)body=practiceMarkup(selected,state,skills,sources);
  else if(state.view==="scenario")body=detailMarkup(selected,state,skills,sources);
  else if(state.view==="skill")body=skillDetailMarkup(selectedSkill,state,sources);
  else body=homeMarkup(state);
  const canBack=state.view!=="home";
  root.innerHTML=`<style data-ao-apostolate-style>${apostolateCss()}</style><header class="aoApostolateTop"><button type="button" data-ao-ap-back aria-label="${esc(L(state,canBack?"Back":"Back to Formation",canBack?"Retour":"Retour à la Formation"))}">${icon("ao-ui-back")}</button><div class="aoApostolateTopTitle"><small>APOSTOLATE</small><strong>${esc(L(state,"Apostolate","Apostolat"))}</strong></div><button type="button" data-ao-ap-home aria-label="${esc(L(state,"Home","Accueil"))}">${icon("ao-nav-home")}</button></header><main class="aoApostolateWrap">${body}</main>`;
  return true;
}
