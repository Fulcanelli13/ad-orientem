import {ESSENTIAL_HOLY_CARD_IDS_V1,essentialHolyCardParts} from "./essential-holy-card-parts.js";

export const CLAUDE_HOLY_CARD_FAMILY="ao-claude-holy-card-v1";
const num=["i","ii","iii","iv","v","vi","vii","viii","ix","x","xi","xii","xiii","xiv","xv"];
const roman=i=>num[i]||String(i+1);
const incipit=p=>{
 const text=String(p?.la||"").trim();
 if(!text)return "";
 const phrase=text.split(/[.,;:!?]/)[0].trim();
 return phrase.length<=48?phrase:phrase.split(/\s+/).slice(0,5).join(" ");
};
/** The original Claude case of cards, populated with the actual source
 * registry. Art is only inserted if its pre-approved URL is explicitly passed.
 * No generated/unknown plate is substituted for an absent painting.
 */
export function claudeHolyCardCase({ids=ESSENTIAL_HOLY_CARD_IDS_V1,prayers,esc,title}){
 if(typeof esc!=="function")throw new TypeError("Escape function required");
 const cards=ids.filter(id=>prayers?.[id]);
 return '<section class="aoClaudeHolyCase" data-ao-claude-holy-case>'+
  '<div class="aoClaudeHolyCaseHead"><h2>'+esc(title||"Essential Prayers")+'</h2></div>'+
  '<div class="aoClaudeHolyFan">'+cards.map((id,i)=>{
    const p=prayers[id];
    return '<button type="button" data-p435930-lib-open="'+esc(id)+'" aria-label="'+esc(p.title||id)+'">'+
      '<div class="aoClaudeHolyFanIn"><div class="aoClaudeHolyCasePlate" aria-hidden="true"></div>'+
      '<small lang="la">'+esc(incipit(p)||p.title)+'</small></div></button>';
   }).join('')+'</div></section>';
}
export function claudeHolyCard({id,p,face="en",vernacular="en",esc,flipped=false,artUrl=""}={}){
 if(typeof esc!=="function")throw new TypeError("Escape function required");
 if(!p||!id)return "";
 const bilingual=face==="both"&&!!p.la&&!!p[vernacular];
 const language=bilingual?vernacular:p[face]?face:p[vernacular]?vernacular:p.en?"en":p.la?"la":null;
 if(!language)return "";
 const beats=essentialHolyCardParts(id,language,p[language])||[];
 const latinBeats=bilingual?essentialHolyCardParts(id,"la",p.la)||[]:[];
 const latinIncipit=incipit(p),title=(language==="fr"||bilingual&&vernacular==="fr")?(p.titleFr||p.title):p.title;
 const paragraphs=beats.map((part,i)=>{
  const text=part.text.trim(),initial=i===0&&text?'<span class="aoClaudeHolyInitial">'+esc(text.charAt(0))+'</span>':'';
  const body=i===0?text.slice(1):text;
  return '<p class="aoP435930EssentialBeat aoLibraryLine'+(part.collective?' aoP435930EssentialCollective':'')+
   '" data-ao-essential-index="'+i+'" lang="'+language+'">'+initial+
   '<span>'+esc(body)+'</span></p>';
 }).join("");
 const latinBlock=bilingual?'<div class="aoClaudeHolyLatinText" lang="la">'+latinBeats.map((part,i)=>
  '<p class="aoP435930EssentialBeat" data-ao-essential-index="la-'+i+'">'+esc(part.text.trim())+'</p>').join('')+'</div>':'';
 const image=artUrl&&/^https:\/\//.test(artUrl)?
  '<img src="'+esc(artUrl)+'" alt="" loading="lazy" decoding="async">':'';
 return '<article class="aoP435930Prayer aoP435930EssentialCard aoClaudeHolyCard" data-ao-essential-card="'+esc(id)+'" data-ao-claude-holy-card>'+
  '<div class="aoClaudeHolyDeck"><div class="aoClaudeHolyLace'+(flipped?' flip':'')+
   '" role="button" tabindex="0" data-p435930-essential-card-turn aria-label="'+esc(flipped?'Turn to front of card':'Turn to prayer text')+'">'+
   '<div class="aoClaudeHolyInner">'+
   '<div class="aoClaudeHolyFace aoClaudeHolyFront"><div class="aoClaudeHolyPlate">'+image+'</div>'+
   '<div class="aoClaudeHolyTitle"><small lang="la">'+esc(latinIncipit)+'</small>'+
    '<h3>'+esc(title||id)+'</h3></div></div>'+
   '<div class="aoClaudeHolyFace aoClaudeHolyBack"><div class="aoClaudeHolyOrn">✠</div>'+
    '<h4 lang="la">'+esc(latinIncipit)+'</h4>'+
    '<div class="aoClaudeHolyBackScroll aoP435930Text" data-ao-pray-semantic="1" role="region" aria-label="'+esc(title||id)+'">'+latinBlock+paragraphs+'</div>'+
    '<div class="aoClaudeHolyOrn aoClaudeHolyClosing">❦</div></div>'+
   '</div></div><div class="aoClaudeHolyHint">'+esc(flipped?'Tap to turn back · swipe for the next card':'Tap to turn the card over')+'</div></div>'+
   '</article>';
}
/** The source model never writes a focus level into a text string. A genuine
 * paragraph, including the collective Hail Mary continuation, lights fully.
 */
export function installClaudeHolyBackFocus(card){
 const sc=card?.querySelector(".aoClaudeHolyBackScroll");
 if(!sc)return ()=>{};
 const items=[...sc.querySelectorAll(".aoP435930EssentialBeat")];
 if(!items.length)return ()=>{};
 let frame=0;
 const win=sc.ownerDocument?.defaultView;
 const focus=()=>{
  frame=0;
  const box=sc.getBoundingClientRect(),axis=box.top+box.height*.40;
  let found=0,best=Infinity;
  for(let i=0;i<items.length;i++){
   const rect=items[i].getBoundingClientRect();
   const dist=Math.abs(rect.top-axis);
   if(dist<best){best=dist;found=i}
  }
  items.forEach((el,i)=>{
   const value=i===found?"1":i<found?".55":".82";
   el.dataset.aoDevoActive=String(i===found);
   el.style.setProperty("opacity",value,"important");
  });
 };
 const queue=()=>{if(!frame&&win)frame=win.requestAnimationFrame(focus)};
 const select=e=>{
  const target=e.target.closest?.(".aoP435930EssentialBeat");
  if(!target||!items.includes(target))return;
  e.stopPropagation(); // selecting a prayer paragraph must never flip the card
  const box=sc.getBoundingClientRect(),rect=target.getBoundingClientRect();
  sc.scrollTop+=rect.top-box.top-box.height*.40;queue();
 };
 sc.addEventListener("scroll",queue,{passive:true});
 sc.addEventListener("click",select);
 queue();
 return ()=>{
  sc.removeEventListener("scroll",queue);
  sc.removeEventListener("click",select);
  if(frame)win?.cancelAnimationFrame(frame);
 };
}
