/* Private, no-network scripted source review inside the existing P6 visual novel.
 * Not a conversational model, authenticated papal speech or published feature. */
(()=>{
'use strict';
const seed=document.getElementById('spxOfflineReplayData');
if(!seed)return;
const data=JSON.parse(seed.textContent);
if(data.schema!=='AO_SPX_P26_OFFLINE_REVIEW_CASES_V1'||data.publishingApproved!==false||
   data.modelProviderEnabled!==false||data.cases.length!==11||
   data.navigationAliasCount!==32||data.navigationAliases.length!==32||
   data.claimTraceUnits!==23||data.humanClaimCertifications!==0)
 throw Error('Unexpected offline dialogue evidence');
const groups=new Map();
for(const c of data.cases){
 if(!groups.has(c.chapterId))groups.set(c.chapterId,[]);
 groups.get(c.chapterId).push(c);
}
const normalize=x=>String(x||'').trim().normalize('NFC').toLocaleLowerCase();
if(data.cases.reduce((n,c)=>n+c.claimTrace.length,0)!==23||
   data.cases.some(c=>c.claimTrace.some(t=>t.humanReviewApproved!==false||
    t.translationApproved!==false||t.verbatimPapalSpeech!==false)))
 throw Error('Private per-sentence documentary gate failed');
const aliases=new Map();
for(const a of data.navigationAliases){
 if(a.status!=='NAVIGATION_SUGGESTION_ONLY_NOT_SOURCE_ANSWER_CERTIFIED'||
    !['en','fr'].includes(a.language)||
    !(groups.get(a.chapterId)||[]).some(c=>c.nodeId===a.matchedNodeId))
  throw Error('Invalid offline navigation alias');
 const key=a.chapterId+'|'+a.language+'|'+normalize(a.question);
 if(aliases.has(key))throw Error('Duplicated offline suggestion');
 aliases.set(key,a);
}
const tr={
 en:{
 title:'OFFLINE SOURCE DIALOGUE · PRIVATE DEMONSTRATION',
 limit:'11 reviewed questions · no API · no publication',
 label:'Choose a reviewed question, or find a related documented exchange',
 question:'Documented question',send:'Read editorial response',
 intro:'EDITORIAL RESPONSE · NOT THE VERBATIM WORDS OF ST PIUS X',
 sources:'Original-language source fragments · whole document not collated',
 none:'This question has no reviewed offline response. No papal speech has been invented.',
 scope:'This scripted study replays 11 unapproved EN/FR editorial drafts. It does not generate new answers or determine current sacramental law.',
 source:'Open the Vatican source',draft:'Private editorial draft, not a certified translation or pastoral ruling',
 example:'Try different wording',related:'A related reviewed exchange exists. It may not answer every part of your question.',
 relatedAction:'Open documented question',relatedCaution:'This is only a navigation suggestion. No new historical reply has been generated.',
 traceTitle:'Inspect sentence-by-sentence evidence',traceCaution:'Each link is an editorial interpretation of the cited original-language excerpt, not an independently certified translation or proof of the full sentence.',
 claimLabel:'Editorial sentence',witnessLabel:'Original source excerpt',webLine:'Vatican web-text line',sourceReview:'Source correspondence pending human review'
 },
 fr:{
 title:'DIALOGUE DOCUMENTAIRE HORS LIGNE · ÉTUDE PRIVÉE',
 limit:'11 questions étudiées · sans API · non publié',
 label:'Choisissez une question étudiée, ou cherchez un échange documentaire connexe',
 question:'Question documentée',send:'Lire la réponse éditoriale',
 intro:'RÉPONSE ÉDITORIALE · NON PAROLES TEXTUELLES DE SAINT PIE X',
 sources:'Extraits originaux · document complet non collationné',
 none:'Cette question ne possède aucune réponse hors ligne vérifiée. Aucune parole pontificale n’a été inventée.',
 scope:'Cette étude scénarisée reprend 11 rédactions provisoires en anglais et français. Elle ne crée aucune réponse et ne décide aucune question sacramentelle actuelle.',
 source:'Ouvrir la source vaticane',draft:'Rédaction éditoriale privée, non traduction ni avis pastoral certifiés',
 example:'Essayer une autre formulation',
 related:'Un échange documentaire connexe existe ; il ne répond pas nécessairement à toute votre question.',
 relatedAction:'Ouvrir la question documentée',
 relatedCaution:'Il s’agit uniquement d’une suggestion de navigation. Aucune réponse historique nouvelle n’a été créée.',
 traceTitle:'Examiner les sources phrase par phrase',traceCaution:'Chaque rapprochement est une interprétation éditoriale de l’extrait original, non une traduction certifiée ni une preuve indépendante de toute la phrase.',
 claimLabel:'Phrase éditoriale',witnessLabel:'Extrait du texte original',webLine:'Ligne du texte sur le site du Vatican',sourceReview:'Correspondance avec la source à vérifier'
 }
};
const root=document.createElement('section');root.id='spxc-offline-replay';root.hidden=true;
root.innerHTML="<div class='spxm-head'><strong id='spxm-offline-title'></strong><small id='spxm-offline-limit'></small></div>"+
 "<p id='spxm-offline-scope'></p><div id='spxm-guided-exchange'>"+
 "<button type='button' id='spxm-guided-start'></button>"+
 "<p id='spxm-guided-state' aria-live='polite'></p>"+
 "<div id='spxm-guided-continue'></div></div>"+
 "<div id='spxm-offline-choices'></div>"+
 "<button type='button' id='spxm-offline-example' class='spxm-offline-example'></button>"+
 "<form id='spxm-offline-form'><label for='spxm-offline-question' id='spxm-offline-label'></label>"+
 "<div class='spxm-row'><input id='spxm-offline-question' maxlength='240' autocomplete='off'>"+
 "<button id='spxm-offline-send' type='submit'></button></div></form>"+
 "<div id='spxm-offline-replies' aria-live='polite'></div>";
const $=id=>root.querySelector('#'+id);
const add=(tag,cl,text,parent)=>{
 const node=document.createElement(tag);if(cl)node.className=cl;
 node.textContent=text;parent.append(node);return node;
};
let active=null,language='en',lastChapter=null,lastLanguage=null;
// P2.46 guided conversations only navigate the EXISTING P22 source-owned
// questions and replies. They neither generate text nor certify authorship.
let guidedActive=false,guidedStep=0;
const guidedText={
 en:{start:'Begin a three-part source dialogue',restart:'Begin again',
  continue:'Continue the conversation',stage:'Documented turn',
  ready:'Follow a sequence of documented questions, one at a time. No model or invented papal replies.',
  progress:'Source-grounded question',complete:'The documented exchange is complete.',
  caution:'Guided playback of existing editorial answers · not a live conversation or authentic papal speech'},
 fr:{start:'Commencer un dialogue documentaire',restart:'Recommencer',
  continue:'Poursuivre le dialogue',stage:'Étape documentée',
  ready:'Suivez une suite de questions documentées, une à la fois. Aucun modèle ni propos pontifical inventé.',
  progress:'Question fondée sur les sources',complete:'Cet échange documentaire est terminé.',
  caution:'Reprise guidée de réponses éditoriales existantes · ni conversation libre ni paroles authentiques du pape'}
};
function guidedReset(){
 guidedActive=false;guidedStep=0;
}
function guidedRender(){
 if(root.hidden)return;
 const group=groups.get(active)||[],t=guidedText[language];
 const button=$('spxm-guided-start'),state=$('spxm-guided-state');
 button.textContent=guidedActive?t.restart:t.start;
 state.textContent=guidedActive?
   (guidedStep>=group.length?t.complete:t.progress+' '+(guidedStep+1)+' / '+group.length):
   t.ready;
 const next=$('spxm-guided-continue');next.replaceChildren();
 $('spxm-offline-choices').hidden=guidedActive;
 $('spxm-offline-example').hidden=guidedActive;
 if(!guidedActive)return;
 const foot=add('p','spxm-guided-caution',t.caution,next);
 if(guidedStep>=group.length){foot.classList.add('spxm-guided-finished');return;}
 const item=group[guidedStep];
 const action=add('button','spxm-guided-question',t.continue+': '+item.question[language],next);
 action.type='button';action.dataset.nextNodeId=item.nodeId;
 action.addEventListener('click',()=>{
   if(!guidedActive||root.hidden||active!==item.chapterId)return;
   $('spxm-offline-question').value=item.question[language];
   $('spxm-offline-form').requestSubmit();
 });
}
$('spxm-guided-start').addEventListener('click',()=>{
 if(root.hidden||!groups.has(active))return;
 guidedActive=true;guidedStep=0;
 $('spxm-offline-question').value='';
 $('spxm-offline-replies').replaceChildren();
 guidedRender();
 const starter=$('spxm-guided-continue .spxm-guided-question');
 if(starter)starter.click();
});

function contextChanged(context){
 active=context.chapterId;
 language=context.language==='fr'?'fr':'en';
 root.hidden=!groups.has(active);
 // In the four pilot subjects, the source-dialogue panel is the sole active
 // question surface. All 102 other subjects keep the original offline search.
 document.body.classList.toggle('spxc-offline-pilot-active',!root.hidden);
 const scroll=document.querySelector('.spxc-main-scroll');
 if(scroll&&!scroll.contains(root))scroll.append(root);
 if(root.hidden)return;
 const t=tr[language];
 $('spxm-offline-title').textContent=t.title;
 $('spxm-offline-limit').textContent=t.limit;
 $('spxm-offline-label').textContent=t.label;
 $('spxm-offline-send').textContent=t.send;
 $('spxm-offline-scope').textContent=t.scope;
 if(active!==lastChapter||language!==lastLanguage){
  guidedReset();
  $('spxm-offline-question').value='';
  $('spxm-offline-replies').replaceChildren();
  lastChapter=active;lastLanguage=language;
 }
 const sample=data.navigationAliases.find(a=>
  a.chapterId===active&&a.language===language);
 const example=$('spxm-offline-example');
 example.hidden=!sample;
 example.textContent=sample?t.example+': '+sample.question:'';
 example.onclick=sample?()=>{
  $('spxm-offline-question').value=sample.question;
  $('spxm-offline-form').requestSubmit();
 }:null;
 const choices=$('spxm-offline-choices');choices.replaceChildren();
 for(const c of groups.get(active)){
  const button=add('button','spxm-offline-choice',c.question[language],choices);
  button.type='button';
  button.addEventListener('click',()=>{
   $('spxm-offline-question').value=c.question[language];
   $('spxm-offline-form').requestSubmit();
  });
 }
 guidedRender();
}
document.addEventListener('ao-spx-review-context',e=>contextChanged(e.detail||{}));
$('spxm-offline-form').addEventListener('submit',e=>{
 e.preventDefault();
 if(!active||root.hidden)return;
 const t=tr[language],q=$('spxm-offline-question').value.trim();
 if(!q)return;
 const entry=add('article','spxm-entry','',$('spxm-offline-replies'));
 add('p','spxm-question',t.question+': '+q,entry);
 // Strict exact-question playback: no similarity ranking that might make
 // unsupported claims appear applicable to an unrelated free-form request.
 const group=groups.get(active)||[];
 const chosen=group.find(c=>normalize(c.question[language])===normalize(q));
 if(!chosen){
  // A manually triaged alternative formulation only suggests its source-owned
  // question; it NEVER silently reuses an answer to another visitor question.
  const alias=aliases.get(active+'|'+language+'|'+normalize(q));
  const target=alias&&group.find(c=>c.nodeId===alias.matchedNodeId);
  if(!target){
   add('p','spxm-held',t.none,entry);
   return;
  }
  add('p','spxm-related-notice',t.related,entry);
  const button=add('button','spxm-offline-related',
   t.relatedAction+': '+target.question[language],entry);
  button.type='button';
  button.addEventListener('click',()=>{
   $('spxm-offline-question').value=target.question[language];
   $('spxm-offline-form').requestSubmit();
  });
  add('p','spxm-offline-disclaimer',t.relatedCaution,entry);
  $('spxm-offline-question').value='';
  return;
 }
 // The guided cursor advances ONLY after the exact current source-owned
 // question was actually selected. Unsupported questions never advance it.
 if(guidedActive){
  const ordered=groups.get(active)||[];
  if(ordered[guidedStep]?.nodeId===chosen.nodeId){
   guidedStep++;
   guidedRender();
  }
 }
 add('p','spxm-warning',t.intro,entry);
 add('p','spxm-draft',chosen.reply[language],entry);
 add('p','spxm-source-label',t.sources,entry);
 for(const witness of chosen.witnesses){
  const details=document.createElement('details');details.className='spxm-offline-source';
  add('summary','',witness.id+' · '+witness.originalLanguage.toUpperCase()+
   ' · '+witness.locus,details);
  add('p','spxm-offline-original',witness.text,details);
  const link=add('a','',t.source,details);
  link.href=witness.sourceUrl;link.target='_blank';link.rel='noopener noreferrer';
  entry.append(details);
 }
 // Keep the full response readable. Only on request expose the individual
 // sentence-to-fragment *editorial* comparisons, never as verified quotations.
 const audit=document.createElement('details');audit.className='spxm-claim-audit';
 add('summary','',t.traceTitle+' · '+chosen.claimTrace.length, audit);
 add('p','spxm-trace-caution',t.traceCaution,audit);
 for(const unit of chosen.claimTrace){
  const section=add('section','spxm-trace-unit','',audit);
  add('p','spxm-trace-label',t.claimLabel+' '+unit.ordinal+' · '+t.sourceReview,section);
  add('p','spxm-trace-claim',unit.claim[language],section);
  for(const witness of unit.fragments){
   const block=add('div','spxm-trace-witness','',section);
   add('p','spxm-trace-label',t.witnessLabel+' · '+witness.id+
    ' · '+witness.originalLanguage.toUpperCase()+' · '+witness.locus,block);
   add('p','spxm-trace-original',witness.text,block);
   const link=add('a','',t.source,block);
   link.href=witness.sourceUrl;link.target='_blank';link.rel='noopener noreferrer';
  }
 }
 entry.append(audit);
 add('p','spxm-offline-disclaimer',t.draft,entry);
 $('spxm-offline-question').value='';
 // The five pre-approved sprite expressions are visual staging only.
 const portrait=document.getElementById('spxc-portrait');
 const artSource=document.getElementById('spxData');
 if(portrait&&artSource&&!portrait.hidden){
  const art=JSON.parse(artSource.textContent).art;
  const expression=chosen.expression;
  if(['neutral','welcoming','explaining','thoughtful','grave'].includes(expression)&&art[expression]){
   portrait.src=art[expression];portrait.dataset.expression=expression;
  }
 }
});
})();