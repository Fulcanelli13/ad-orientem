/**
 * Opt-in visual port of Claude's "3 · The painting" from
 * Ad_Orientem_Essential_Prayers_Premium_Prototypes.html (A3 renderer).
 * Keep canonical source text and the existing Claude choir response engine.
 * This is NOT a second prayer corpus, and it does not publish new artwork.
 */
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
 const vern=record[language]?language:record.en?"en":record.fr?"fr":null;
 const latin=record.la||"";
 const primary=latin||record[vern]||"";
 if(!primary)return "";
 if(!vern||!latin)return '<div class="aoA3PlainText" lang="'+esc(latin?"la":vern)+'">'+faceText(primary,esc)+'</div>';
 return '<div class="sw" data-ao-a3-swap role="button" tabindex="0" aria-label="'+esc("Switch between Latin and translation")+'" aria-pressed="false">'+
  '<div class="st"><div class="a" lang="la">'+faceText(latin,esc)+'</div>'+
  '<div class="b" lang="'+esc(vern)+'">'+faceText(record[vern],esc)+'</div></div>'+
  '<div class="hint"><span class="ha">TAP · '+esc(vern==="fr"?"FRANÇAIS":"ENGLISH")+'</span>'+
  '<span class="hb">TAP · LATINE</span></div></div>';
}
export function renderClaudePaintingA3({id,record,photo,language="en",kind="prayer",esc,
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
 const body=kind==="litany"?
  '<article class="aoP435930Prayer aoChoirPrayer aoClaudeChoirPrayer" data-ao-choir-prayer="'+esc(id)+'" data-ao-choir-kind="litany">'+
  '<div class="aoP435930Text aoChoirFaces"><div class="aoP435930SemanticFace aoChoirFace aoClaudeChoirScroll" data-ao-pray-semantic="1" lang="'+esc(language)+'">'+choirRows+'</div></div>'+
  choirBar+'</article>':
  renderSwap(record,language,esc);
 return '<main class="aoP435930Body aoP435930LibraryReader aoClaudePaintingA3Host" data-ao-library-card="single" data-ao-claude-a3-view="'+esc(id)+'">'+
  '<section class="aoDevoCard aoClaudePaintingA3Card" data-ao-devo-card="'+esc(id)+'">'+
  '<div class="aoClaudePaintingA3 A3" data-ao-claude-painting-a3>'+
  '<div class="bg" aria-hidden="true" style="background-image:url('+esc(url)+')"></div>'+
  '<div class="sh" aria-hidden="true"></div>'+
  '<button type="button" class="aoA3ViewToggle" data-ao-a3-view aria-pressed="false" aria-label="See the painting alone" title="See the painting">◐</button>'+
  '<div class="ct"><span class="eyb">'+esc(String(latinTitle).toUpperCase())+'</span>'+
  '<h2>'+esc(title)+'</h2><div class="tx aoDevoCardScroll" role="region" aria-label="'+esc(title)+'">'+body+'</div>'+
  '<div class="cr">'+esc(credit)+'</div>'+
  (sourceMarkup?'<details class="aoA3Source"><summary>ⓘ Source</summary>'+sourceMarkup+'</details>':"")+
  '</div>'+rail+'</div></section></main>';
}
export function installClaudePaintingA3(mount,{navigate}={}){
 if(!mount)return false;
 let current=installed.get(mount);
 if(current){current.navigate=navigate;return true;}
 current={navigate,x:null,y:null,origin:null};
 installed.set(mount,current);
 const act=(event)=>{
  const root=event.target.closest?.("[data-ao-claude-painting-a3]");
  if(!root)return false;
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
