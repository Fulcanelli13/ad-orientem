
(()=>{
 const GOSPEL_CLASSES=['ao-gospel-preparation','ao-gospel-move','ao-gospel-threshold','ao-gospel-announcement','ao-gospel-reading','ao-gospel-conclusion','ao-gospel-kiss','ao-homily-focus'];
 const state={phase:'',lastCue:'',homilyShown:false,prepShown:false};
 const oldHook=window.__AO_FUNCTIONAL_MOTION;
 const q=s=>document.querySelector(s);
 function clear(){GOSPEL_CLASSES.forEach(c=>document.body.classList.remove(c));state.phase='';}
 function semIcon(sid){
   const r=window.aoResolveIconRef?.('SEM:'+sid);if(!r?.src)return '';
   const variant=String(r.binding?.variant||''),mirror=variant.includes('MIRROR_HORIZONTAL')?' ao-mirror-x':'';
   return `<span class="section-icon ao-mask-icon${mirror}" data-icon-semantic="${sid}" style="--ao-mask:url('${r.src}')"></span>`;
 }
 function cinema(kind,main,sub,sid,ms){try{window.__AO_EVENT_CINEMA?.(kind,main,sub,semIcon(sid),ms)}catch(e){}}
 function setPhase(phase){
   if(state.phase===phase)return;GOSPEL_CLASSES.forEach(c=>document.body.classList.remove(c));state.phase=phase;if(phase)document.body.classList.add(phase);
 }
 function apply(el,block,priest){
   if(document.body.dataset.mode!=='live'){clear();return;}
   const macro=block?.Macro_ID||'',cue=el?.dataset?.cue||'';
   if(macro==='AO.SM.M08'){
     setPhase('ao-homily-focus');
     if(!state.homilyShown){state.homilyShown=true;cinema('homily','HOMILY','LISTEN','ACTION.HOMILY',1350)}
     state.lastCue=cue;return;
   }
   if(macro!=='AO.SM.M07'){clear();state.homilyShown=false;state.prepShown=false;state.lastCue=cue;return;}
   state.homilyShown=false;
   let phase='';
   if(cue==='AO.SM.C0079'||cue==='AO.SM.C0080')phase='ao-gospel-preparation';
   else if(cue==='AO.SM.C0081')phase='ao-gospel-move';
   else if(cue==='AO.SM.C0082'||cue==='AO.SM.C0083')phase='ao-gospel-threshold';
   else if(cue==='AO.SM.C0084'||cue==='AO.SM.C0085')phase='ao-gospel-announcement';
   else if(cue==='AO.SM.C0086')phase='ao-gospel-reading';
   else if(cue==='AO.SM.C0087')phase='ao-gospel-conclusion';
   else if(cue==='AO.SM.C0088')phase='ao-gospel-kiss';
   setPhase(phase);
   if((cue==='AO.SM.C0079')&&!state.prepShown){state.prepShown=true;cinema('gospel','HOLY GOSPEL','PREPARATION','ACTION.GOSPEL',1400)}
   if(cue==='AO.SM.C0088'&&state.lastCue!==cue)cinema('gospel','GOSPEL','BOOK KISSED','ACTION.GOSPEL',1100);
   state.lastCue=cue;
 }
 window.__AO_FUNCTIONAL_MOTION=function(el,block,priest,resp,userResp){
   try{oldHook?.(el,block,priest,resp,userResp)}catch(e){console.warn('Prior functional motion hook:',e)}
   try{apply(el,block,priest)}catch(e){console.warn('Gospel cinematic hook:',e)}
 };
 AO.Cinematics.Gospel=window.AO_GOSPEL_CINEMATIC={version:'2.0',macros:['AO.SM.M07','AO.SM.M08'],cues:['AO.SM.C0079','AO.SM.C0080','AO.SM.C0081','AO.SM.C0082','AO.SM.C0083','AO.SM.C0084','AO.SM.C0085','AO.SM.C0086','AO.SM.C0087','AO.SM.C0088'],textMotion:false,grammar:['prepare','orient','stand/respond','three-crosses','proclaim','respond','kiss','homily-release']};
})();
