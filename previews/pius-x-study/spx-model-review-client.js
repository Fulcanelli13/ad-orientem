/* Additional review layer; never part of the published St Pius X dialogue. */
(()=>{
"use strict";
// Only the explicitly opt-in local P56 pilot uses bilingual atomic cues.
 // The ordinary private review and approved offline scene stay unchanged.
const localP56=document.querySelector('meta[name="ao-spx-p56-local"]')
 ?.getAttribute('content')==='P53_ATOMIC_CLAIM_CUES';
const root=document.createElement('section');
root.id='spxc-model-review';
root.innerHTML="<div class='spxm-head'><strong>MODEL-ASSISTED PRIVATE EDITORIAL TRIAL</strong><small id='spxm-limit'>No historical or doctrinal approval</small></div>"+
 "<form id='spxm-form'><label id='spxm-label' for='spxm-question'>Follow up freely on this documented subject</label>"+
 "<div class='spxm-row'><input id='spxm-question' type='text' autocomplete='off' maxlength='240' required>"+
 "<button id='spxm-send' type='submit'>Draft a reply</button></div></form>"+
 "<p id='spxm-scope'></p>"+
 "<button type='button' id='spxm-voice-mode'></button>"+
 "<div id='spxm-replies' aria-live='polite'></div>";
const $=id=>root.querySelector('#'+id);
const translations={
 en:{label:'Follow up on this documented subject',send:'Draft a reply',scope:'The model can adapt only existing unpublished editorial passages. Previous dialogue provides context, never historical evidence. This is not authenticated speech of St Pius X.',
 wait:'Preparing a research draft and independently checking its claims…',
 held:'Reply withheld: the model could not establish support in the supplied passages.',
 intro:'AI-COMPOSED EDITORIAL DRAFT · NOT THE WORDS OF ST PIUS X',sources:'Underlying unapproved editorial source pointers:',witnessSources:'Matched original-language excerpt locators · editorial only:',
 followups:'Continue with a documented question',historicalOn:'Voice: historical editorial reconstruction',
 documentaryOn:'Voice: documentary reply',
 historicalNote:'Constructed first-person prose is NOT an authenticated quote from St Pius X.',
  prompt:'Question from visitor',error:'Unavailable. No invented reply has been displayed.'},
 fr:{label:'Approfondir librement le sujet documentaire',send:'Rédiger une réponse',scope:'Le modèle ne peut adapter que les passages éditoriaux inédits existants. Les réponses précédentes servent au contexte, non de preuve historique. Ce ne sont pas des paroles authentifiées de saint Pie X.',
 wait:'Préparation de la rédaction et contrôle indépendant des affirmations…',
 held:'Réponse suspendue : sources éditoriales insuffisantes pour étayer le propos.',
 intro:'RÉDACTION IA NON APPROUVÉE · NON PAROLES DE SAINT PIE X',sources:'Références éditoriales non approuvées :',witnessSources:'Références exactes aux passages originaux · étude éditoriale seulement :',
 followups:'Continuer avec une question documentée',historicalOn:'Style : reconstruction historique',
 documentaryOn:'Style : réponse documentaire',
 historicalNote:'La première personne reconstruite ne constitue PAS une citation authentique de saint Pie X.',
  prompt:'Question du visiteur',error:'Service indisponible. Aucune réponse inventée n’a été affichée.'}
};
let context=null,history=[],busy=false,lastSubject=null,lastLanguage=null;
let voiceMode='documentary';
function renderVoiceMode(){
 const t=translations[context?.language]||translations.en;
 $('spxm-voice-mode').textContent=voiceMode==='historical'?t.historicalOn:t.documentaryOn;
 $('spxm-voice-mode').disabled=busy;
}
$('spxm-voice-mode').addEventListener('click',()=>{
 if(busy||!context?.chapterId)return;
 voiceMode=voiceMode==='documentary'?'historical':'documentary';
 history=[];$('spxm-replies').replaceChildren();
 renderVoiceMode();
});
function attach(){
 const sc=document.querySelector('.spxc-main-scroll');
 if(sc&&!sc.contains(root))sc.append(root);
}
function paragraph(content,cls){const p=document.createElement('p');if(cls)p.className=cls;p.textContent=content;return p;}
function display(lang){
 const t=translations[lang]||translations.en;
 $('spxm-label').textContent=t.label;$('spxm-send').textContent=t.send;
 $('spxm-scope').textContent=t.scope+(localP56?
  (lang==='fr'?
   ' MODÈLE LOCAL EXPÉRIMENTAL · les réponses peuvent être lentes. Texte historique reconstruit et non authentifié; les réponses documentées restent disponibles.':
   ' LOCAL EXPERIMENTAL MODEL · replies may be slow. Constructed historical language is not authenticated; authored documentary answers remain available.'):'');
 $('spxm-limit').textContent=localP56?
  'PRIVATE LOCAL 7B PILOT · NO PUBLICATION · NO CLOUD':
  'PRIVATE · UNCOLLATED ORIGINALS · NO PUBLICATION';
 renderVoiceMode();
}
document.addEventListener('ao-spx-review-context',e=>{
 const v=e.detail||{};context={chapterId:v.chapterId,nodeId:v.nodeId,language:v.language};
 if(lastSubject!==context.chapterId||lastLanguage!==context.language){
  history=[];voiceMode='documentary';lastSubject=context.chapterId;lastLanguage=context.language;$('spxm-replies').replaceChildren();
 }
 root.hidden=!context.chapterId;attach();display(context.language);
});
$('spxm-form').addEventListener('submit',async e=>{
 e.preventDefault();if(busy||!context?.chapterId)return;
 const question=$('spxm-question').value.trim().slice(0,240);
 if(question.length<4)return;
 const t=translations[context.language]||translations.en;
 const snapshot={...context,voiceMode},previous=[...history];
 const transcript=$('spxm-replies');
 const entry=document.createElement('article');entry.className='spxm-entry';
 entry.append(paragraph(t.prompt+': '+question,'spxm-question'),paragraph(t.wait,'spxm-status'));
 transcript.append(entry);busy=true;$('spxm-send').disabled=true;
 try{
  const resp=await fetch('/api/pius-x-review',{method:'POST',
   headers:{'content-type':'application/json','x-ao-review':'1'},
   body:JSON.stringify({...snapshot,question,history:previous,
     autoRoute:['SPX-PILOT-01','SPX-PILOT-09','SPX-029','SPX-NEW-012'].includes(snapshot.chapterId),
     ...(localP56&&snapshot.chapterId==='SPX-PILOT-01'?
       {experimentalComposerProfile:'P53_ATOMIC_CLAIM_CUES'}:{})})});
  const result=await resp.json();
  entry.querySelector('.spxm-status')?.remove();
  if(context.chapterId!==snapshot.chapterId||context.language!==snapshot.language||
    voiceMode!==snapshot.voiceMode){entry.remove();return;}
  if(result.status!=='draft'||typeof result.reply!=='string'){
   entry.append(paragraph(t.held+' ('+String(result.reason||'not_certified')+')','spxm-held'));return;
  }
  entry.append(paragraph(t.intro,'spxm-warning'));
  if(result.voiceMode==='historical')entry.append(paragraph(t.historicalNote,'spxm-voice-disclaimer'));
  entry.append(paragraph(result.reply,'spxm-draft'));
  const citedWitnesses=Array.isArray(result.claimWitnesses)&&
   result.claimWitnesses.length>0;
  entry.append(paragraph(citedWitnesses?t.witnessSources:t.sources,'spxm-source-label'));
  // Witness IDs have already been checked against the selected node by the
  // private server. Legacy replies retain their weaker node-only references.
  const cited=citedWitnesses?result.claimWitnesses:(result.evidence||[]);
  for(const ev of cited){
   const line=document.createElement('div'),a=document.createElement('a');
   const u=String(ev.sourceUrl||'');
   if(!u.startsWith('https://www.vatican.va/'))continue;
   a.href=u;a.target='_blank';a.rel='noopener noreferrer';
   const edition=ev.originalLanguage?String(ev.originalLanguage).toUpperCase()+' · ':'';
   const speaker=ev.speaker?String(ev.speaker).replaceAll('_',' ')+' · ':'';
   a.textContent=String(ev.id)+' · '+edition+speaker+String(ev.locus||'')+' (NOT COLLATED)';
   line.append(a);entry.append(line);
  }
  history.push({chapterId:snapshot.chapterId,language:snapshot.language,question,response:result.reply});
  history=history.slice(-3);
  // Each continuation is a pre-existing, exact documented source question:
  // no model-generated or untrusted user-history question is ever shown.
  const options=Array.isArray(result.sourceOwnedFollowups)?result.sourceOwnedFollowups:[];
  const safe=options.filter(x=>x&&x.chapterId===snapshot.chapterId&&
   x.language===snapshot.language&&x.status==='ORIGINAL_SOURCE_QUESTION_SUGGESTION_ONLY'&&
   x.notAnAnswer===true&&x.publishingApproved===false&&
   typeof x.question==='string'&&x.question.length<=240&&x.nodeId!==result.selectedSourceNodeId);
  if(safe.length){
   const wrapper=document.createElement('div');wrapper.className='spxm-next-source';
   wrapper.append(paragraph(t.followups,'spxm-next-caption'));
   for(const option of safe.slice(0,2)){
    const btn=document.createElement('button');btn.type='button';btn.className='spxm-next-option';
    btn.textContent=option.question;btn.dataset.nodeId=option.nodeId;
    btn.addEventListener('click',()=>{
     if(busy||!context||context.chapterId!==snapshot.chapterId||
      context.language!==snapshot.language||voiceMode!==snapshot.voiceMode)return;
     $('spxm-question').value=option.question;
     $('spxm-form').requestSubmit();
    });
    wrapper.append(btn);
   }
   entry.append(wrapper);
  }
  if(result.expression&&document.querySelector('#spxc-portrait:not([hidden])')){
   const art=JSON.parse(document.getElementById('spxData').textContent).art;
   const image=document.getElementById('spxc-portrait');
   if(['neutral','welcoming','explaining','thoughtful','grave'].includes(result.expression)&&art[result.expression]){
    image.src=art[result.expression];image.dataset.expression=result.expression;
   }
  }
  $('spxm-question').value='';
 }catch{
  entry.querySelector('.spxm-status')?.remove();entry.append(paragraph(t.error,'spxm-held'));
 }finally{busy=false;$('spxm-send').disabled=false;renderVoiceMode();}
});
root.hidden=true;
})();