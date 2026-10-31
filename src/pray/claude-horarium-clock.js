/**
 * Claude's Horarium (AO_Prayer_Hours_Angelus.html), ported from the exact
 * pinned prototype app-ui JS. Text, season and calendar posture remain owned
 * by the canonical Angelus reader. The clock is an hour-choice aid, NOT a
 * scheduler or claim that any bell has actually rung.
 */
const SKY=Object.freeze({
 6:Object.freeze(["#3b2a2a","#c98a6a"]),
 12:Object.freeze(["#22303a","#c9c2a6"]),
 18:Object.freeze(["#2a2238","#b0704a"])
});
const HOURS=Object.freeze([6,12,18]);
export const CLAUDE_HORARIUM_BELLS=Object.freeze([3,3,3,9]);
export const CLAUDE_HORARIUM_HOUR_LABELS=Object.freeze({6:"vi",12:"xii",18:"xviii"});

export function claudeHorariumHourFromClock(hour=12){
 const n=Number(hour);
 return n<10?6:n<16?12:18;
}
export function claudeHorariumClock(hour=12,language="en"){
 const french=language==="fr";
 const h=HOURS.includes(+hour)?+hour:12;
 // This is Claude's literal three-point quadratic Bézier hour/sun layout.
 const t=(h-6)/12,P=[[24,96],[150,-36],[276,96]];
 const bx=(1-t)**2*P[0][0]+2*(1-t)*t*P[1][0]+t*t*P[2][0];
 const by=(1-t)**2*P[0][1]+2*(1-t)*t*P[1][1]+t*t*P[2][1];
 const sky=SKY[h],id="ao-prayer-horarium-sky";
 const svg='<svg viewBox="0 0 300 110" preserveAspectRatio="xMidYMid slice" role="img" aria-label="\${french?"Heure de la journée":"Hour of the day"}">'+
  '<defs><linearGradient id="'+id+'" x1="0" y1="1" x2="0" y2="0">'+
  '<stop offset="0" stop-color="'+sky[1]+'" stop-opacity=".55"/>'+
  '<stop offset="1" stop-color="'+sky[0]+'" stop-opacity=".12"/></linearGradient></defs>'+
  '<rect width="300" height="110" fill="url(#'+id+')"/>'+
  '<path d="M24 92 Q150 -36 276 92" fill="none" stroke="currentColor" stroke-opacity=".35" stroke-dasharray="2 4"/>'+
  '<line x1="0" y1="93" x2="300" y2="93" stroke="currentColor" stroke-opacity=".5"/>'+
  '<circle cx="'+bx+'" cy="'+by+'" r="9" fill="#E6C36A"/>'+
  '<circle cx="'+bx+'" cy="'+by+'" r="17" fill="#E6C36A" opacity=".16"/>'+
  HOURS.map(hh=>{
   const x=hh===6?24:hh===12?150:276;
   return '<text x="'+x+'" y="108" text-anchor="middle" font-family="IM Fell English SC,Georgia" font-size="13" fill="currentColor" fill-opacity="'+(hh===h?1:.5)+'">'+CLAUDE_HORARIUM_HOUR_LABELS[hh]+'</text>';
  }).join('')+'</svg>';
 return '<div class="aoClaudeHorariumClock" data-ao-claude-horarium-hour="'+h+'">'+svg+
  '<div class="aoClaudeHorariumHourTargets" role="group" aria-label="\${french?"Heure de l’Angélus":"Angelus hour"}">'+
  HOURS.map(hh=>'<button type="button" data-p435930-angelus-hour="'+hh+'" aria-pressed="'+String(h===hh)+'" aria-label="'+(french?(hh===6?"Six heures du matin":hh===12?"Midi":"Six heures du soir"):(hh===6?"Six in the morning":hh===12?"Noon":"Six in the evening"))+'">'+CLAUDE_HORARIUM_HOUR_LABELS[hh]+'</button>').join('')+
  '</div></div>';
}
/** The four groups are Claude's 3·3·3·9, not a count of Hail Mary beads.
 * The existing canonical reader owns chapter count; the indicator updates
 * on user-selected card index without advancing anything automatically.
 */
export function claudeHorariumStrokes(index=0){
 const active=Math.max(0,Math.min(3,Math.trunc(Number(index)||0)));
 return '<div class="aoClaudeHorariumStrokes" role="group" aria-label="Angelus bell-stroke groups: three, three, three, nine">'+
  CLAUDE_HORARIUM_BELLS.map((number,i)=>
   '<span class="'+(i<active?'dn':i===active?'cu':'')+'" data-ao-bell-group="'+i+'" aria-label="'+number+' strokes">'+
   '<span class="aoClaudeHorariumStrokeGroup">'+
   Array.from({length:number},()=>'<i aria-hidden="true"></i>').join('')+
   '</span></span>').join('')+
  '</div>';
}
export function syncClaudeHorariumStrokes(root,index){
 const active=Math.max(0,Math.min(3,Math.trunc(Number(index)||0)));
 const row=root?.querySelector(".aoClaudeHorariumStrokes");
 if(!row)return false;
 row.querySelectorAll("[data-ao-bell-group]").forEach(node=>{
  const i=Number(node.dataset.aoBellGroup);
  node.classList.toggle("dn",i<active);
  node.classList.toggle("cu",i===active);
 });
 return true;
}
