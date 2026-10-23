/* Private, no-network scripted source review inside the existing P6 visual novel.
 * Not a conversational model, authenticated papal speech or published feature. */
(()=>{
'use strict';
const seed=document.getElementById('spxOfflineReplayData');
if(!seed)return;
const data=JSON.parse(seed.textContent);
if(data.schema!=='AO_SPX_P26_OFFLINE_REVIEW_CASES_V1'||data.publishingApproved!==false||
   data.modelProviderEnabled!==false||data.cases.length!==11)throw Error('Unexpected offline dialogue evidence');
const groups=new Map();
for(const c of data.cases){
 if(!groups.has(c.chapterId))groups.set(c.chapterId,[]);
 groups.get(c.chapterId).push(c);
}
const tr={
 en:{
 title:'OFFLINE SOURCE DIALOGUE · PRIVATE DEMONSTRATION',
 limit:'11 reviewed questions · no API · no publication',
 label:'Choose a documented question, or type it exactly below',
 question:'Documented question',send:'Read editorial response',
 intro:'EDITORIAL RESPONSE · NOT THE VERBATIM WORDS OF ST PIUS X',
 sources:'Original-language source fragments · whole document not collated',
 none:'This question has no reviewed offline response. No papal speech has been invented.',
 scope:'This scripted study replays 11 unapproved EN/FR editorial drafts. It does not generate new answers or determine current sacramental law.',
 source:'Open the Vatican source',draft:'Private editorial draft, not a certified translation or pastoral ruling'
 },
 fr:{
 title:'DIALOGUE DOCUMENTAIRE HORS LIGNE · ÉTUDE PRIVÉE',
 limit:'11 questions étudiées · sans API · non publié',
 label:'Choisissez une question documentée ou saisissez-la exactement',
 question:'Question documentée',send:'Lire la réponse éditoriale',
 intro:'RÉPONSE ÉDITORIALE · NON PAROLES TEXTUELLES DE SAINT PIE X',
 sources:'Extraits originaux · document complet non collationné',
 none:'Cette question ne possède aucune réponse hors ligne vérifiée. Aucune parole pontificale n’a été inventée.',
 scope:'Cette étude scénarisée reprend 11 rédactions provisoires en anglais et français. Elle ne crée aucune réponse et ne décide aucune question sacramentelle actuelle.',
 source:'Ouvrir la source vaticane',draft:'Rédaction éditoriale privée, non traduction ni avis pastoral certifiés'
 }
};
const root=document.createElement('section');root.id='spxc-offline-replay';root.hidden=true;
root.innerHTML="<div class='spxm-head'><strong id='spxm-offline-title'></strong><small id='spxm-offline-limit'></small></div>"+
 "<p id='spxm-offline-scope'></p><div id='spxm-offline-choices'></div>"+
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
function contextChanged(context){
 active=context.chapterId;
 language=context.language==='fr'?'fr':'en';
 root.hidden=!groups.has(active);
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
  $('spxm-offline-question').value='';
  $('spxm-offline-replies').replaceChildren();
  lastChapter=active;lastLanguage=language;
 }
 const choices=$('spxm-offline-choices');choices.replaceChildren();
 for(const c of groups.get(active)){
  const button=add('button','spxm-offline-choice',c.question[language],choices);
  button.type='button';
  button.addEventListener('click',()=>{
   $('spxm-offline-question').value=c.question[language];
   $('spxm-offline-form').requestSubmit();
  });
 }
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
 const chosen=(groups.get(active)||[]).find(c=>c.question[language].normalize('NFC').toLocaleLowerCase()===
  q.normalize('NFC').toLocaleLowerCase());
 if(!chosen){
  add('p','spxm-held',t.none,entry);
  return;
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