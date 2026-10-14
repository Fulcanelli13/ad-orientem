import {MYSTERY_MASS_REVIEW_DATA as DATA} from "./mystery-mass-review-data.js";

export const MYSTERY_MASS_ROUTE="learn.mystery_mass";
export const MYSTERY_MASS_VERSION="mystery-mass-dual-review-v1";
const ROOT_ID="ao-mystery-mass-review-root";

// The two unpublished manuscript paths are only available with an explicit
// preview flag. This is actual application routing, not permission to release
// unfinished theological / French copy or unapproved sacred-art selections.
export function mysteryMassReviewEnabled(win=globalThis){
  return /(?:^|[?&])mysteryReview=1(?:&|$)/.test(String(win?.location?.search||""));
}
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const titleOf=(o,fr)=>typeof o==="string"?o:String(o?.[fr?"fr":"en"]??"");
const ui=(fr,en,french)=>fr?french:en;
const chapters=mode=>mode==="biblical"?DATA.biblical:DATA.liturgical;
const safeLink=(url)=>typeof url==="string"&&/^https:\/\/[^\s<>"']+$/.test(url)?url:null;
function studyMarkup(source){
  // The archival EN/FR manuscripts contain source links in Markdown.
  // Links must be escaped and https-only; no HTML from research is trusted.
  const string=String(source||""),regex=/\[([^\]]+)\]\((https:\/\/[^\s)]+)\)/g;
  let out="",from=0,m;
  while((m=regex.exec(string))){
    out+=esc(string.slice(from,m.index));
    const url=safeLink(m[2]);
    out+=url?'<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(m[1])+'</a>':esc(m[0]);
    from=regex.lastIndex;
  }
  return out+esc(string.slice(from));
}
function styles(){
return `
#${ROOT_ID}{position:fixed;inset:0;z-index:3150;overflow:auto;overscroll-behavior:contain;background:var(--ao-bg,#080c12);color:var(--ao-text,#eee9df);font-family:var(--ao-font-ui,system-ui,sans-serif)}
#${ROOT_ID} *{box-sizing:border-box}
#${ROOT_ID} .mmTop{position:sticky;top:0;z-index:2;background:rgba(8,12,18,.95);border-bottom:1px solid rgba(203,181,135,.24);padding:12px max(16px,env(safe-area-inset-left));display:flex;align-items:center;gap:12px;justify-content:space-between}
#${ROOT_ID} button{color:inherit;cursor:pointer}
#${ROOT_ID} button:focus-visible,#${ROOT_ID} a:focus-visible{outline:2px solid #c6b18c;outline-offset:3px}
#${ROOT_ID} .mmTop button,#${ROOT_ID} .mmNav button,#${ROOT_ID} .mmSwitch button,#${ROOT_ID} .mmJump button,#${ROOT_ID} .mmDepth button{border:1px solid rgba(213,194,157,.24);border-radius:10px;background:rgba(255,255,255,.025);padding:11px 13px}
#${ROOT_ID} .mmTop strong{font:500 1.02rem/1.25 'Cinzel',Georgia,serif;text-align:center}
#${ROOT_ID} .mmTop small{font:.62rem/1.2 system-ui;letter-spacing:.18em;color:#bda985}
#${ROOT_ID} .mmMain{width:min(940px,100%);margin:auto;padding:24px 18px 65px}
#${ROOT_ID} .mmKicker{color:#cbb48a;font:.65rem/1.3 system-ui;letter-spacing:.16em;text-transform:uppercase}
#${ROOT_ID} h1{font:500 clamp(1.65rem,5vw,2.8rem)/1.1 'EB Garamond',Georgia,serif;margin:12px 0}
#${ROOT_ID} .mmLead{font:1rem/1.5 'EB Garamond',Georgia,serif;color:#c1bbae;margin:0 0 22px}
#${ROOT_ID} .mmSwitch{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:18px 0 27px}
#${ROOT_ID} .mmSwitch button[aria-pressed="true"]{background:rgba(197,169,118,.13);border-color:#ad9268;color:#f5e8d0}
#${ROOT_ID} .mmSwitch button{font:.83rem/1.3 system-ui;min-height:52px}
#${ROOT_ID} .mmNav{display:flex;justify-content:space-between;align-items:center;gap:10px;margin:22px 0}
#${ROOT_ID} button:disabled{opacity:.27;cursor:default}
#${ROOT_ID} .mmNumber{font:.7rem/1.2 system-ui;letter-spacing:.13em;color:#a7a297}
#${ROOT_ID} .mmStory{border-top:1px solid rgba(220,194,147,.17);padding-top:24px}
#${ROOT_ID} .mmStory p{font:1.16rem/1.65 'EB Garamond',Georgia,serif;white-space:pre-line;margin:12px 0 18px}
#${ROOT_ID} .mmStory .mmTransition{font-style:italic;color:#d3c1a6;padding-left:16px;border-left:2px solid rgba(194,165,110,.42)}
#${ROOT_ID} .mmNotes{border-top:1px solid rgba(220,194,147,.16);margin-top:28px;padding-top:22px}
#${ROOT_ID} .mmNotes h2{font:500 1.45rem/1.2 'EB Garamond',Georgia,serif;margin:0 0 14px}
#${ROOT_ID} .mmScripture{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0 22px}
#${ROOT_ID} .mmScripture button,#${ROOT_ID} .mmJump button{font:.8rem/1.3 system-ui;min-height:42px}
#${ROOT_ID} .mmScripture button{border:1px solid rgba(194,165,110,.35);border-radius:999px;background:rgba(197,169,118,.065);padding:10px 13px}
#${ROOT_ID} .mmJump{display:flex;flex-wrap:wrap;gap:8px}
#${ROOT_ID} .mmSources a{display:block;width:fit-content;line-height:1.5;color:#d8bc8c;font-size:.8rem;margin:8px 0;text-decoration:underline;text-underline-offset:3px}
#${ROOT_ID} .mmStudy{padding:18px 0;border-bottom:1px solid rgba(220,194,147,.14)}
#${ROOT_ID} .mmStudy p{font:1.04rem/1.55 'EB Garamond',Georgia,serif;margin:8px 0}
#${ROOT_ID} .mmStudy a{color:#d8bc8c}
#${ROOT_ID} .mmQuestion{color:#d6c09b;font:italic 1.2rem/1.5 'EB Garamond',Georgia,serif}
#${ROOT_ID} .mmDisclaimer{font:.68rem/1.45 system-ui;color:#a6a299}
#${ROOT_ID} .mmSourceTitle{color:#d2b987;font:.72rem/1.35 system-ui;letter-spacing:.04em}
#${ROOT_ID} .mmDepth[aria-pressed="true"]{background:rgba(197,169,118,.13)}
#${ROOT_ID} .mmJump button{max-width:100%;text-align:left}
#${ROOT_ID} .mmNoArt{font:.78rem/1.45 system-ui;color:#99978f;margin-top:8px}
@media(max-width:440px){#${ROOT_ID} .mmMain{padding:17px 15px 58px}#${ROOT_ID} .mmStory p{font-size:1.09rem}#${ROOT_ID} .mmTop{padding:10px 12px}#${ROOT_ID} .mmTop strong{font-size:.87rem}#${ROOT_ID} .mmNav button{padding:10px}#${ROOT_ID} .mmSwitch button{font-size:.75rem}}
@media(prefers-reduced-motion:reduce){#${ROOT_ID} *{scroll-behavior:auto!important;animation:none!important}}
`;}
const scriptureButtons=(refs,fr)=>refs.length?'<section class="mmNotes"><h2>'+ui(fr,"Sacred Scripture","Écriture sainte")+'</h2><div class="mmScripture">'+refs.map(ref=>'<button type="button" data-ao-scripture-context="'+esc(ref)+'">'+esc(ref)+' · '+ui(fr,"Read in context","Lire en contexte")+'</button>').join("")+'</div><small class="mmDisclaimer">'+ui(fr,"Bible texts and translations are provided only by the shared certified reader.","Le lecteur biblique commun fournit seul les textes et leurs traductions certifiés.")+'</small></section>':"";
const sourceLinks=(refs,fr)=>refs.length?'<section class="mmNotes mmSources"><h2>'+ui(fr,"Authors and sources","Auteurs et sources")+'</h2>'+refs.filter(x=>safeLink(x.url)).map(x=>'<a href="'+esc(x.url)+'" target="_blank" rel="noopener noreferrer">'+esc(x.title)+' ↗</a>').join("")+'</section>':"";
function bodyBiblical(scene,fr){
 const links=scene.massOwners.map(id=>({id,target:DATA.liturgical.find(x=>x.id===id)})).filter(x=>x.target);
 return '<article class="mmStory"><h1>'+esc(titleOf(scene.title,fr))+'</h1><p>'+esc(titleOf(scene.narrative,fr))+'</p><p class="mmTransition">'+esc(titleOf(scene.transition,fr))+'</p></article>'+
 scriptureButtons(scene.scripture,fr)+
 '<section class="mmNotes"><h2>'+ui(fr,"The Mass reveals the connection","Les liens avec la Messe")+'</h2><div class="mmJump">'+links.map(x=>'<button type="button" data-mm-jump-mass="'+esc(x.id)+'">'+esc(x.target.title)+' →</button>').join("")+'</div></section>'+
 sourceLinks(scene.sourceCitations,fr)+
 (scene.qualified.length?'<p class="mmDisclaimer">'+esc(ui(fr,"Source distinctions remain under review.","Les distinctions entre sources restent à réviser."))+'</p>':"");
}
function bodyLiturgical(scene,fr,deep){
 const blocks=scene.studies.map((study,i)=>'<div class="mmStudy"><div class="mmSourceTitle">'+ui(fr,"Study of the Mass · source dossier","Étude de la Messe · dossier")+' '+esc(study.id)+'</div><p>'+studyMarkup(titleOf(deep?study.deep:study.short,fr))+'</p></div>').join("");
 const canon=scene.canon?'<section class="mmNotes"><h2>'+ui(fr,"Theological question","Question théologique")+'</h2><div class="mmQuestion">'+esc(scene.canon.question)+'</div><div class="mmStudy"><p>'+esc(scene.canon.text)+'</p></div><small class="mmDisclaimer">'+ui(fr,"Critical commentary is in English pending French editorial review.","Commentaire critique provisoirement en anglais, en attente de révision française.")+'</small></section>':"";
 const biblical=scene.biblicalScenes.map(id=>({id,scene:DATA.biblical.find(x=>x.id===id)})).filter(x=>x.scene);
 return '<article class="mmStory"><h1>'+esc(scene.title)+'</h1><small class="mmDisclaimer">'+ui(fr,"1962 Roman Mass · historical and theological study; not a live rubric.","Messe romaine de 1962 · étude historique et théologique, non rubrique en direct.")+'</small></article>'+
 '<div class="mmNotes mmDepth"><button type="button" data-mm-depth aria-pressed="'+String(deep)+'">'+ui(fr,deep?"Short explanation":"Detailed study",deep?"Résumé":"Étude approfondie")+'</button></div>'+
 blocks+canon+scriptureButtons(scene.scripture,fr)+
 (biblical.length?'<section class="mmNotes"><h2>'+ui(fr,"Return to salvation history","Retour à l’histoire du salut")+'</h2><div class="mmJump">'+biblical.map(x=>'<button type="button" data-mm-jump-bible="'+esc(x.id)+'">'+esc(titleOf(x.scene.title,fr))+' →</button>').join("")+'</div></section>':"")+
 sourceLinks(scene.authorLinks,fr);
}
export function mysteryMassReviewMarkup({mode="biblical",index=0,language="en",deep=true}={}){
 const fr=language==="fr",list=chapters(mode),current=list[index]??list[0],i=list.indexOf(current);
 if(!current)return "";
 const label=ui(fr,"Editorial review · unpublished text","Révision éditoriale · texte inédit");
 return '<style data-mm-style>'+styles()+'</style>'+
 '<header class="mmTop"><button type="button" data-mm-close aria-label="'+ui(fr,"Back to Formation","Retour à Formation")+'">←</button><div><small>'+label+'</small><strong>'+ui(fr,"Mystery of the Mass","Le Mystère de la Messe")+'</strong></div><button type="button" data-mm-home aria-label="'+ui(fr,"Home","Accueil")+'">⌂</button></header>'+
 '<main class="mmMain"><div class="mmKicker">'+ui(fr,"One sacrifice · two journeys","Un seul sacrifice · deux parcours")+'</div>'+
 '<div class="mmSwitch" role="group" aria-label="'+ui(fr,"Choose chronology","Choisir la chronologie")+'">'+
 '<button type="button" data-mm-mode="biblical" aria-pressed="'+String(mode==="biblical")+'">'+ui(fr,"Bible chronology · Meditation","Chronologie biblique · Méditation")+'</button>'+
 '<button type="button" data-mm-mode="liturgical" aria-pressed="'+String(mode==="liturgical")+'">'+ui(fr,"Mass chronology · Study","Chronologie de la Messe · Étude")+'</button></div>'+
 '<div class="mmNumber">'+String(i+1).padStart(2,"0")+' / '+String(list.length).padStart(2,"0")+'</div>'+
 (mode==="biblical"?bodyBiblical(current,fr):bodyLiturgical(current,fr,deep))+
 '<nav class="mmNav" aria-label="'+ui(fr,"Journey navigation","Parcours")+'"><button type="button" data-mm-move="-1" '+(i===0?"disabled":"")+'>'+ui(fr,"← Previous","← Précédent")+'</button><button type="button" data-mm-move="1" '+(i===list.length-1?"disabled":"")+'>'+ui(fr,"Next →","Suivant →")+'</button></nav>'+
 '<p class="mmNoArt">'+ui(fr,"Images will appear only after source, subject and artwork approval; no unreviewed painting has been inserted.","Les images ne seront intégrées qu'après vérification de la source, du sujet et de l'œuvre ; aucune peinture non approuvée n'a été ajoutée.")+'</p></main>';
}
export function createMysteryMassReviewRuntime(win=globalThis){
 let state={mode:"biblical",bIndex:0,mIndex:0,deep:true,language:"en"};
 const root=()=>win.document?.getElementById?.(ROOT_ID)||null;
 const currentIndex=()=>state.mode==="biblical"?state.bIndex:state.mIndex;
 const setIndex=n=>{if(state.mode==="biblical")state.bIndex=n;else state.mIndex=n;};
 function ensureRoot(){
  const doc=win.document;if(!doc?.body)return null;
  let node=root();if(node)return node;
  node=doc.createElement("section");node.id=ROOT_ID;node.setAttribute("role","region");node.setAttribute("aria-label","Mystery of the Mass · editorial review");
  node.addEventListener("click",event=>{
    const button=event.target?.closest?.("button");if(!button||!node.contains(button))return;
    // Shared scripture browser catches [data-ao-scripture-context] at document
    // capture phase and preserves our current chapter after closing.
    if(button.hasAttribute("data-ao-scripture-context"))return;
    if(button.matches("[data-mm-close]")){event.preventDefault();close(true);return;}
    if(button.matches("[data-mm-home]")){event.preventDefault();close(false);void win.AO_APP_SHELL_V1?.navigate?.("home");return;}
    if(button.dataset.mmMode){state.mode=button.dataset.mmMode;render();return;}
    if(button.dataset.mmMove){const next=currentIndex()+Number(button.dataset.mmMove);if(next>=0&&next<chapters(state.mode).length){setIndex(next);render();}return;}
    if(button.hasAttribute("data-mm-depth")){state.deep=!state.deep;render();return;}
    if(button.dataset.mmJumpMass){const at=DATA.liturgical.findIndex(x=>x.id===button.dataset.mmJumpMass);if(at>=0){state.mIndex=at;state.mode="liturgical";render();}return;}
    if(button.dataset.mmJumpBible){const at=DATA.biblical.findIndex(x=>x.id===button.dataset.mmJumpBible);if(at>=0){state.bIndex=at;state.mode="biblical";render();}return;}
  });
  doc.body.append(node);return node;
 }
 function render(){
  const node=ensureRoot();if(!node)return false;
  const lang=win.AO_RUNTIME_V8?.store?.getState?.()?.language??state.language;
  state.language=lang==="fr"?"fr":"en";
  node.innerHTML=mysteryMassReviewMarkup({mode:state.mode,index:currentIndex(),language:state.language,deep:state.deep});
  node.hidden=false;node.removeAttribute("aria-hidden");node.scrollTop=0;
  return true;
 }
 function open(opts={}){
  if(!mysteryMassReviewEnabled(win))return false;
  state.mode=opts.mode==="liturgical"?"liturgical":"biblical";
  state.bIndex=DATA.biblical.some(x=>x.id===opts.sceneId)?DATA.biblical.findIndex(x=>x.id===opts.sceneId):0;
  state.mIndex=DATA.liturgical.some(x=>x.id===opts.ownerId)?DATA.liturgical.findIndex(x=>x.id===opts.ownerId):0;
  if(opts.sceneId)state.mode="biblical";if(opts.ownerId)state.mode="liturgical";
  win.document?.body?.classList?.add?.("aoMysteryMassReviewOpen");
  return render();
 }
 function close(back=false){
  const node=root();try{node?.querySelector?.(":focus")?.blur?.()}catch{}
  node?.remove?.();win.document?.body?.classList?.remove?.("aoMysteryMassReviewOpen");
  if(back)Promise.resolve().then(()=>win.AO_LEARN_APP_V1?.open?.());
  return true;
 }
 const status=()=>Object.freeze({version:MYSTERY_MASS_VERSION,open:Boolean(root()),mode:state.mode,biblicalIndex:state.bIndex,liturgicalIndex:state.mIndex,unpublished:true,biblicalScenes:DATA.biblical.length,liturgicalSections:DATA.liturgical.length});
 return Object.freeze({open,close,render,status});
}
export function installMysteryMassReview(win=globalThis){
 if(!win?.AO_MODULES)return false;
 if(!win.AO_MYSTERY_MASS_REVIEW_V1)win.AO_MYSTERY_MASS_REVIEW_V1=createMysteryMassReviewRuntime(win);
 const rt=win.AO_MYSTERY_MASS_REVIEW_V1;
 if(win.AO_MODULES.__aoMysteryMassReviewV1)return rt;
 const base=win.AO_MODULES;
 const definition=Object.freeze({id:MYSTERY_MASS_ROUTE,domain:"learn",type:"module",category:"mass-mystagogy",title:"Mystery of the Mass"});
 const wrapper={...base,__aoMysteryMassReviewV1:true,
 get(id){return id===MYSTERY_MASS_ROUTE?definition:base.get?.(id)??null;},
 resolve(id){return id===MYSTERY_MASS_ROUTE?{ok:true,input:id,id,defaults:{},chain:[id],definition}:base.resolve?.(id);},
 async open(id,opts={}){if(id===MYSTERY_MASS_ROUTE)return {ok:rt.open(opts),canonicalId:id};return base.open?.(id,opts);},
 list(filter={}){const previous=(base.list?.(filter)||[]).filter(x=>x.id!==MYSTERY_MASS_ROUTE);
 if(mysteryMassReviewEnabled(win)&&(!filter.type||filter.type==="module")&&(!filter.domain||filter.domain==="learn"))previous.push(definition);return previous;}
 };
 win.AO_MODULES=wrapper;win.AO_MODULE_REGISTRY_V36=wrapper;
 return rt;
}
