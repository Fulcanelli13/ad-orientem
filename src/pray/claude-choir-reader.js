import {claudeChoirSourceUnits,claudeChoirFootFor} from "./claude-choir-fixed-foot.js";

/** Structural port of Claude's .choirw / .scr / .q / .resp, without the
 * review harness or its placeholder/abridged litany text. */
const DIVISIONS=Object.freeze([
 ["Trinity",/^(?:God the Father|Père céleste|Pater de cælis)/i],
 ["Holy Mary",/^(?:Holy Mary|Sainte Marie|Sancta Maria)/i],
 ["Mother",/^(?:Mother of Christ|Mère du Christ|Mater Christi)/i],
 ["Virgin",/^(?:Virgin most prudent|Vierge très prudente|Virgo prudentissima)/i],
 ["Titles",/^(?:Mirror of justice|Miroir de justice|Speculum iustitiae)/i],
 ["Queen",/^(?:Queen of Angels|Reine des Anges|Regina Angelorum)/i],
 ["Agnus Dei",/^(?:Lamb of God|Agneau de Dieu|Agnus Dei)/i]
]);
function sectionLabel(invocation,id,language,part){
 if(!id.startsWith("litany_loreto"))return null;
 for(const [label,match] of DIVISIONS)if(match.test(invocation))return label;
 if(part===0)return language==="fr"?"Kyrie":"Kyrie";
 return null;
}
export function claudeChoirRows(id,language,source,{esc,inline=false}={}){
 if(typeof esc!=="function")throw new TypeError("Escape function required");
 const units=claudeChoirSourceUnits(source);
 if(!units)return "";
 let section=0;
 return units.map((unit,i)=>{
  if(unit.kind==="gap"){section++;return '<div class="aoClaudeChoirGap" aria-hidden="true"></div>';}
  const heading=sectionLabel(unit.invocation,id,language,i);
  const opening=heading?'<div class="aoClaudeChoirSection"><span>'+esc(heading)+'</span></div>':'';
  const res=claudeChoirFootFor(unit);
  const label=unit.kind==="source-role"?' aoClaudeChoirOriginalRole':'';
  const text=unit.invocation;
  const response=inline&&res?
   '<span class="aoClaudeChoirInlineResponse"><span aria-hidden="true">℟</span> '+esc(res)+'</span>':'';
  return opening+'<p class="aoChoirBeat aoClaudeChoirBeat'+label+
   '" data-ao-choir-source-index="'+i+'" data-ao-choir-answer="'+esc(res)+
   '" data-ao-choir-kind="'+unit.kind+'">'+esc(text)+response+'</p>';
 }).join("");
}
export function claudeChoirFixedBar(){
 return '<div class="aoClaudeChoirResponse" aria-live="polite" aria-atomic="true" hidden>'+
  '<span class="aoClaudeChoirResponseMark" aria-hidden="true">℟</span>'+
  '<b class="aoClaudeChoirResponseText"></b>'+
  '<small></small></div>';
}
export function moveClaudeChoirBar(card){
 const bar=card?.querySelector(".aoClaudeChoirResponse");
 if(!bar)return null;
 // The original .resp is a sibling of .scr, NOT part of scrolling text.
 card.append(bar);
 return bar;
}
export function syncClaudeChoirBar(card,element,{inline=false}={}){
 const bar=card?.querySelector(".aoClaudeChoirResponse");
 if(!bar)return false;
 const focus=element?.matches?.(".aoClaudeChoirBeat")?element:
  card.querySelector('.aoClaudeChoirBeat[data-ao-devo-active="true"]')||
  card.querySelector('.aoClaudeChoirBeat');
 const answer=focus?.dataset?.aoChoirAnswer||"";
 const show=!inline&&Boolean(answer);
 bar.hidden=!show;
 if(show){
  const text=bar.querySelector(".aoClaudeChoirResponseText");
  if(text.textContent!==answer)text.textContent=answer;
  bar.classList.remove("ring");
  void bar.offsetWidth;
  bar.classList.add("ring");
 }
 return show;
}
