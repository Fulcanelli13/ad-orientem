/* P2.29: read-only, source-first companion to the 11 scripted responses.
 * This offers original-text excerpts, NOT generated or authenticated replies. */
(()=>{
'use strict';
const tag=document.getElementById('spxOfflineReplayData');
if(!tag)return;
const data=JSON.parse(tag.textContent);
if(data.sourceGateSize!==144||!Array.isArray(data.sourceDossiers)||
 data.sourceDossiers.length!==data.sourceDossierCount||
 data.sourceDossiers.length+data.sourceDossierHeldCount+data.cases.length!==144||
 data.publishingApproved!==false)throw Error('Source dossier gate inconsistent');
const groups=new Map();
const reviewedIds=new Set(data.cases.map(x=>x.nodeId));
for(const d of data.sourceDossiers){
 if(d.answerApproved!==false||d.publicationApproved!==false||
 d.status!=='ORIGINAL_EXCERPT_RESEARCH_ONLY_NO_EDITORIAL_ANSWER'||
 reviewedIds.has(d.nodeId)||!d.originalWitnesses.length)throw Error('Invalid source-only dossier');
 if(!groups.has(d.chapterId))groups.set(d.chapterId,[]);
 groups.get(d.chapterId).push(d);
}
const translations={
 en:{
 title:'ORIGINAL SOURCE DOSSIER',
 sub:'Source excerpts available · not a composed papal answer',
 intro:'These questions point to original Latin or Italian passages. Only those extracts and narrow English research notes are available here. The longer character dialogue has not been verified against these passages.',
 notes:'English-only research note · editorial, not a translation',
 attribution:'Original text attributed to',
 author:'Pius X',other:'Quoted author — not personal testimony of Pius X',
 attributionUnknown:'Attribution under review',
 open:'Inspect primary-source excerpt',source:'Vatican original document',
 notice:'No complete answer, translation or historical voice has been approved',
 extra:'Research cautions',
 showDraft:'Inspect earlier unverified editorial reconstruction',
 hideDraft:'Return to original-source-first study'
 },
 fr:{
 title:'DOSSIER DES SOURCES ORIGINALES',
 sub:'Extraits disponibles · non une réponse composée du pape',
 intro:'Ces questions renvoient à des passages latins ou italiens. Seuls les extraits et les notes de recherche en anglais sont disponibles. Le dialogue du personnage n’a pas été vérifié intégralement.',
 notes:'Note de recherche en anglais · non une traduction',
 attribution:'Texte original attribué à',
 author:'Pie X',other:'Auteur cité — non témoignage personnel de Pie X',
 attributionUnknown:'Attribution à vérifier',
 open:'Examiner le passage original',source:'Document original du Vatican',
 notice:'Aucune réponse complète, traduction ou voix historique n’est approuvée',
 extra:'Réserves de recherche',
 showDraft:'Consulter l’ancienne reconstitution éditoriale non vérifiée',
 hideDraft:'Revenir aux sources originales'
 }
};
const section=document.createElement('section');
section.id='spxc-primary-source-dossier';
section.hidden=true;
section.innerHTML="<div class='spxm-head'><strong id='spxp29-title'></strong>"+
 "<small id='spxp29-sub'></small></div>"+
 "<p id='spxp29-intro'></p><button type='button' id='spxp29-draft-toggle' aria-pressed='false'></button>"+
 "<div id='spxp29-questions'></div>"+
 "<div id='spxp29-content' aria-live='polite'></div>";
const $=name=>section.querySelector('#'+name);
const element=(type,cls,text,parent)=>{
 const e=document.createElement(type);if(cls)e.className=cls;
 e.textContent=text;parent.append(e);return e;
};
let context=null,language='en',draftVisible=false;
function setDraftVisibility(show){
 draftVisible=!!show;
 document.body.classList.toggle('spxc-source-dossier-show-draft',draftVisible);
 const toggle=$('spxp29-draft-toggle'),t=translations[language];
 toggle.setAttribute('aria-pressed',String(draftVisible));
 toggle.textContent=draftVisible?t.hideDraft:t.showDraft;
}
$('spxp29-draft-toggle').addEventListener('click',()=>setDraftVisibility(!draftVisible));
const speak=(speaker,t)=>{
 if(speaker==='PIUS_X_AUTHOR')return t.author;
 if(speaker)return t.other+' ('+speaker.replaceAll('_',' ')+')';
 return t.attributionUnknown;
};
function renderEntry(item,lang){
 const t=translations[lang],content=$('spxp29-content');
 content.replaceChildren();
 const article=element('article','spxp29-excerpt-view','',content);
 element('p','spxp29-question',item.question[lang],article);
 element('p','spxp29-notice',t.notice,article);
 for(const w of item.originalWitnesses){
  const box=element('section','spxp29-witness','',article);
  element('p','spxp29-source-label',
    t.attribution+' '+speak(w.speaker,t)+' · '+w.originalLanguage.toUpperCase()+
    ' · '+w.id+' · '+w.locus,box);
  element('p','spxp29-original',w.originalText,box);
  element('p','spxp29-research-note',t.notes+': '+w.editorialResearchNoteEnglish,box);
  const link=element('a','spxp29-original-url',t.source,box);
  link.href=w.sourceUrl;link.target='_blank';link.rel='noopener noreferrer';
 }
 if(item.researchCautions.length){
  const cautions=element('details','spxp29-cautions','',article);
  element('summary','',t.extra,cautions);
  for(const warning of item.researchCautions)
   element('p','spxp29-caution',warning,cautions);
 }
}
document.addEventListener('ao-spx-review-context',e=>{
 const ctx=e.detail||{};
 context=ctx.chapterId;language=ctx.language==='fr'?'fr':'en';
 const docs=groups.get(context)||[];
 section.hidden=!docs.length;
 document.body.classList.toggle('spxc-source-dossier-active',!section.hidden);
 if(section.hidden){
  document.body.classList.remove('spxc-source-dossier-show-draft');
  draftVisible=false;
  return;
 }
 // Put documentary questions before any unverified P6 character dialogue.
 // Host replaces #spxc-main during navigation, so reattach on every render.
 const main=document.querySelector('#spxc-main');
 const before=main?.querySelector('.spxc-turn');
 if(main&&!main.contains(section))main.insertBefore(section,before||null);
 setDraftVisibility(false);
 const t=translations[language];
 $('spxp29-title').textContent=t.title;
 $('spxp29-sub').textContent=t.sub;
 $('spxp29-intro').textContent=t.intro;
 $('spxp29-content').replaceChildren();
 const items=$('spxp29-questions');items.replaceChildren();
 for(const d of docs){
  const button=element('button','spxp29-source-question',d.question[language],items);
  button.type='button';
  button.addEventListener('click',()=>{
   if(context!==d.chapterId||!items.contains(button))return;
   for(const b of items.querySelectorAll('button'))b.setAttribute('aria-pressed',String(b===button));
   renderEntry(d,language);
  });
 }
});
})();