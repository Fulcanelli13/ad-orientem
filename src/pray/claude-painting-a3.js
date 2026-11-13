/**
 * Opt-in visual port of Claude's "3 · The painting" from
 * Ad_Orientem_Essential_Prayers_Premium_Prototypes.html (A3 renderer).
 * Keep canonical source text and the existing Claude choir response engine.
 * This is NOT a second prayer corpus, and it does not publish new artwork.
 */
import {a3CuratedPassages,a3ReadingLayout} from "./claude-painting-a3-experience.js";
export const CLAUDE_PAINTING_A3_PILOT="ao-prayer-painting-a3-v1";
export const CLAUDE_A3_ESSENTIAL_SEQUENCE=Object.freeze([
 "foundations_sign_of_cross","foundations_our_father","foundations_hail_mary",
 "foundations_glory_be","sacrament_act_of_contrition",
 "foundations_guardian_angel","foundations_grace_before_meals"
]);
const installed=new WeakMap();
const artPath=photo=>{
 const path=String(photo?.image||"");
 return /^assets\/[a-zA-Z0-9/_-]+\.(?:webp|png|jpe?g)$/.test(path)?"/"+path:"";
};
export function claudePaintingA3Enabled(win){
 try{return new URLSearchParams(win.location.search).get("aoPrayerPaintingA3")==="1";}
 catch{return false;}
}
export function eligibleClaudePaintingA3({record,photo,id,kind="prayer"}={}){
 if(!record||!artPath(photo)||!id)return false;
 return kind==="litany"||kind==="prayer";
}
function faceText(value,esc){
 return esc(String(value||"")).replace(/\r/g,"");
}
function renderSwap(record,language,esc){
 const vern=(language==="en"||language==="fr")&&record[language]?language:record.en?"en":record.fr?"fr":null;
 const latin=record.la||"";
 const primary=latin||record[vern]||"";
 if(!primary)return "";
 if(!vern||!latin)return '<div class="aoA3PlainText" lang="'+esc(latin?"la":vern)+'">'+faceText(primary,esc)+'</div>';
 return '<div class="sw" data-ao-a3-swap role="button" tabindex="0" aria-label="'+esc("Switch between Latin and translation")+'" aria-pressed="false">'+
  '<div class="st"><div class="a" lang="la" aria-hidden="false">'+faceText(latin,esc)+'</div>'+
  '<div class="b" aria-hidden="true" lang="'+esc(vern)+'">'+faceText(record[vern],esc)+'</div></div>'+
  '<div class="hint"><span class="ha">TAP · '+esc(vern==="fr"?"FRANÇAIS":"ENGLISH")+'</span>'+
  '<span class="hb">TAP · LATINE</span></div></div>';
}
function focusPassages(id,record,language,esc){
 const vern=(language==="en"||language==="fr")&&record[language]?language:record.en?"en":record.fr?"fr":null;
 const latin=a3CuratedPassages(id,record.la,"la");
 const translated=vern?a3CuratedPassages(id,record[vern],vern):null;
 if(!latin||!translated)return null;
 const verse=(parts,face,lang)=>parts.map((part,i)=>
  '<span class="aoA3FocusVerse" data-a3-face="'+face+'" data-a3-verse="'+i+
  '" lang="'+lang+'" '+(face==="la"&&i===0?"":'hidden')+'>'+esc(part.trim())+'</span>'
 ).join("");
 return {html:'<div class="aoA3FocusBody" aria-label="Contemplative reading">'+
   '<button type="button" class="aoA3FocusTranslate" data-ao-a3-focus-translate aria-label="Switch contemplative language">'+
    (vern==="fr"?"FRANÇAIS":"ENGLISH")+'</button>'+
   '<button type="button" class="aoA3FocusStage" data-ao-a3-focus-next aria-label="Next contemplative passage">'+
   verse(latin,"la","la")+verse(translated,"vern",vern)+'</button>'+
   '<div class="aoA3FocusProgress" data-ao-a3-focus-progress>1 / '+latin.length+'</div>'+
   '<div class="aoA3FocusHint">TAP · CONTINUE</div></div>',count:latin.length};
}
function syncFocusedPassage(root){
 const current=root.dataset.aoA3FocusLanguage==="vern"?"vern":"la";
 const all=[...root.querySelectorAll(".aoA3FocusVerse")];
 const size=all.filter(el=>el.dataset.a3Face===current).length;
 const index=Math.min(Math.max(0,Number(root.dataset.aoA3FocusStep)||0),Math.max(0,size-1));
 root.dataset.aoA3FocusStep=String(index);
 all.forEach(el=>el.hidden=el.dataset.a3Face!==current||Number(el.dataset.a3Verse)!==index);
 const count=root.querySelector("[data-ao-a3-focus-progress]");
 if(count)count.textContent=(index+1)+" / "+size;
 const hint=root.querySelector(".aoA3FocusHint");
 if(hint)hint.textContent=index===size-1?"END OF PRAYER":"TAP · CONTINUE";
 const button=root.querySelector("[data-ao-a3-focus-translate]");
 const vernLang=root.querySelector(".aoA3FocusVerse[data-a3-face=vern]")?.getAttribute("lang")||"en";
 if(button)button.textContent=current==="la"?(vernLang==="fr"?"FRANÇAIS":"ENGLISH"):"LATINE";
}
function updateA3Fit(root){
 if(!root||!root.isConnected)return;
 if(root.dataset.aoA3Kind==="litany")return; // keep source-owned Choir layout intact
 const useTranslation=!!root.querySelector(".sw.v");
 const face=root.querySelector(useTranslation?".sw .st .b":".sw .st .a")||
   root.querySelector(".aoA3PlainText");
 const textHeight=face?Math.max(face.scrollHeight,face.getBoundingClientRect().height):0;
 const layout=a3ReadingLayout(textHeight,root.clientHeight||1);
 root.classList.toggle("aoA3FitVeil",layout==="veil");
 root.classList.toggle("aoA3FitCinematic",layout==="cinematic");
 root.dataset.aoA3ReadingLayout=layout;
}
function setA3Mode(root,mode){
 const focus=mode==="focus"&&!!root.querySelector(".aoA3FocusBody");
 root.classList.toggle("aoA3ModeFocus",focus);
 root.classList.toggle("aoA3ModePray",!focus);
 root.querySelectorAll("[data-ao-a3-mode]").forEach(button=>
  button.setAttribute("aria-pressed",String(button.dataset.aoA3Mode===(focus?"focus":"pray"))));
 if(focus){root.dataset.aoA3FocusStep="0";syncFocusedPassage(root);}
 else updateA3Fit(root);
}
export function renderClaudePaintingA3({id,record,photo,language="en",uiLanguage=language,kind="prayer",esc,
  choirRows="",choirBar="",inline=false,sourceMarkup="",sequence=CLAUDE_A3_ESSENTIAL_SEQUENCE}={}){
 if(typeof esc!=="function")throw new TypeError("Escape function required");
 if(!eligibleClaudePaintingA3({record,photo,id,kind}))return "";
 const url=artPath(photo);
 const title=language==="fr"?(record.titleFr||record.title):record.title;
 const latinTitle=record.latinTitle||record.title||"Orationes";
 const credit=[photo.artist,photo.title].filter(Boolean).join(" · ");
 const nav=(kind==="prayer"&&sequence.includes(id))?sequence:[id];
 const active=nav.indexOf(id);
 const rail='<div class="rail" aria-label="Prayer position">'+nav.map((key,i)=>
   '<button type="button" data-ao-a3-open="'+esc(key)+'" class="'+(i===active?"on":"")+
   '" aria-current="'+(i===active?"true":"false")+'" aria-label="'+esc("Prayer "+(i+1))+'"></button>').join("")+'</div>';
 const missingUi=(uiLanguage==="en"||uiLanguage==="fr")&&!record[uiLanguage];
 const languageNote=missingUi?
  '<p class="aoA3LanguageNote" lang="'+esc(uiLanguage)+'">'+
   esc(uiLanguage==="fr"?"Texte français indisponible dans cette source ; seule la langue conservée est affichée.":"English text is not available in this source; the available source language is shown.")+
  '</p>':"";
 const focus=kind==="prayer"?focusPassages(id,record,language,esc):null;
 const modeBar=focus?'<div class="aoA3ExperienceModes" role="group" aria-label="Prayer presentation">'+
  '<button type="button" data-ao-a3-mode="pray" aria-pressed="true">'+(uiLanguage==="fr"?"PRIER":"PRAY")+'</button>'+
  '<button type="button" data-ao-a3-mode="focus" aria-pressed="false">'+(uiLanguage==="fr"?"MÉDITER":"CONTEMPLATE")+'</button></div>':"";
 const focusBody=focus?focus.html:"";
 const body=kind==="litany"?
  '<article class="aoP435930Prayer aoChoirPrayer aoClaudeChoirPrayer" data-ao-choir-prayer="'+esc(id)+'" data-ao-choir-kind="litany">'+
  '<div class="aoP435930Text aoChoirFaces"><div class="aoP435930SemanticFace aoChoirFace aoClaudeChoirScroll" data-ao-pray-semantic="1" lang="'+esc(language)+'">'+choirRows+'</div></div>'+
  choirBar+'</article>':
  renderSwap(record,language,esc);
 return '<main class="aoP435930Body aoP435930LibraryReader aoClaudePaintingA3Host" data-ao-library-card="single" data-ao-claude-a3-view="'+esc(id)+'">'+
  '<section class="aoDevoCard aoClaudePaintingA3Card" data-ao-devo-card="'+esc(id)+'">'+
  '<div class="aoClaudePaintingA3 A3 aoA3ModePray" data-ao-claude-painting-a3 data-ao-a3-kind="'+esc(kind)+'" data-ao-a3-id="'+esc(id)+'" data-ao-a3-focus-step="0" data-ao-a3-focus-language="la">'+
  '<div class="ambient" aria-hidden="true" style="background-image:url('+esc(url)+')"></div><img class="bg" src="'+esc(url)+'" alt="'+esc(credit)+'" draggable="false" decoding="async">'+
  '<div class="sh" aria-hidden="true"></div><div class="veil" aria-hidden="true"></div>'+
  '<button type="button" class="aoA3ViewToggle" data-ao-a3-view aria-pressed="false" aria-label="See the painting alone" title="See the painting">◐</button>'+
  modeBar+'<div class="ct"><span class="eyb">'+esc(String(latinTitle).toUpperCase())+'</span>'+
  '<h2>'+esc(title)+'</h2><button type="button" class="aoA3VeilToggle" data-ao-a3-lift aria-label="Lower the prayer">⌃</button>'+
  '<div class="tx aoDevoCardScroll" role="region" aria-label="'+esc(title)+'">'+body+'</div>'+focusBody+
  '<div class="cr">'+esc(credit)+'</div>'+
  languageNote+(sourceMarkup?'<details class="aoA3Source"><summary>ⓘ Source</summary>'+sourceMarkup+'</details>':"")+
  '</div>'+rail+'</div></section></main>';
}
export function installClaudePaintingA3(mount,{navigate}={}){
 if(!mount)return false;
 let current=installed.get(mount);
 if(current){current.navigate=navigate;current.scheduleFit?.();return true;}
 current={navigate,x:null,y:null,origin:null};
 installed.set(mount,current);
 const updateVisible=()=>{
  const root=mount.querySelector("[data-ao-claude-painting-a3]");
  if(root){updateA3Fit(root);syncFocusedPassage(root);}
 };
 const scheduleFit=()=>{
   if(typeof requestAnimationFrame==="function")requestAnimationFrame(updateVisible);
   else updateVisible();
 };
 current.scheduleFit=scheduleFit;
 scheduleFit();
 if(typeof document!=="undefined"&&document.fonts?.ready)
   document.fonts.ready.then(scheduleFit).catch(()=>{});
 if(typeof window!=="undefined")window.addEventListener("resize",scheduleFit,{passive:true});
 const act=(event)=>{
  const root=event.target.closest?.("[data-ao-claude-painting-a3]");
  if(!root)return false;
  const mode=event.target.closest?.("[data-ao-a3-mode]");
  if(mode){setA3Mode(root,mode.dataset.aoA3Mode);return true;}
  const lift=event.target.closest?.("[data-ao-a3-lift]");
  if(lift){
    const closed=root.classList.toggle("aoA3VeilClosed");
    lift.setAttribute("aria-label",closed?"Lift the prayer":"Lower the prayer");
    lift.textContent=closed?"⌄":"⌃";
    return true;
  }
  const translate=event.target.closest?.("[data-ao-a3-focus-translate]");
  if(translate){
    root.dataset.aoA3FocusLanguage=root.dataset.aoA3FocusLanguage==="vern"?"la":"vern";
    root.dataset.aoA3FocusStep="0";syncFocusedPassage(root);return true;
  }
  const next=event.target.closest?.("[data-ao-a3-focus-next]");
  if(next){
    const face=root.dataset.aoA3FocusLanguage==="vern"?"vern":"la";
    const count=root.querySelectorAll('.aoA3FocusVerse[data-a3-face="'+face+'"]').length;
    root.dataset.aoA3FocusStep=String(Math.min(count-1,(Number(root.dataset.aoA3FocusStep)||0)+1));
    syncFocusedPassage(root);return true;
  }
  const view=event.target.closest?.("[data-ao-a3-view]");
  if(view){
   const active=root.classList.toggle("view");
   root.closest(".aoClaudePaintingA3Card")?.classList.toggle("aoPaintingOnly",active);
   view.setAttribute("aria-pressed",String(active));
   view.setAttribute("aria-label",active?"Return to prayer":"See the painting alone");
   return true;
  }
  const swap=event.target.closest?.("[data-ao-a3-swap]");
  if(swap){
   const active=swap.classList.toggle("v");
   swap.setAttribute("aria-pressed",String(active));
   const a=swap.querySelector(".st .a"),b=swap.querySelector(".st .b");
   a?.setAttribute("aria-hidden",String(active));
   b?.setAttribute("aria-hidden",String(!active));
   scheduleFit();
   return true;
  }
  const target=event.target.closest?.("[data-ao-a3-open]");
  if(target){
   if(target.dataset.aoA3Open!==root.closest("[data-ao-claude-a3-view]")?.dataset.aoClaudeA3View)
    current.navigate?.(target.dataset.aoA3Open);
   return true;
  }
  return false;
 };
 mount.addEventListener("click",event=>{
  if(act(event)){event.preventDefault();event.stopPropagation();}
 },true);
 mount.addEventListener("keydown",event=>{
  if(event.key!=="Enter"&&event.key!==" ")return;
  if(event.target?.matches?.("[data-ao-a3-swap]")){
   if(act(event)){event.preventDefault();event.stopPropagation();}
  }
 },true);
 mount.addEventListener("pointerdown",event=>{
  const root=event.target.closest?.("[data-ao-claude-painting-a3]");
  if(!root||event.target.closest?.("button,a,.tx,summary,details,[role=button]"))return;
  current.x=event.clientX;current.y=event.clientY;current.origin=root;
 },{passive:true});
 mount.addEventListener("pointerup",event=>{
  if(current.y==null||!current.origin)return;
  const dy=event.clientY-current.y,dx=event.clientX-current.x;
  const root=current.origin;current.x=null;current.y=null;current.origin=null;
  if(!root.isConnected||Math.abs(dy)<60||Math.abs(dy)<Math.abs(dx)*1.4)return;
  const buttons=[...root.querySelectorAll("[data-ao-a3-open]")];
  const index=buttons.findIndex(b=>b.getAttribute("aria-current")==="true");
  const target=buttons[index+(dy<0?1:-1)];
  if(target)current.navigate?.(target.dataset.aoA3Open);
 },{passive:true});
 return true;
}
