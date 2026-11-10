// Direct visual geometry port from the final Claude handoff's arc(),
// wheel() rings and tlWin() layout. The source owns VISUAL SHAPES ONLY:
// the actual 65 native cards, source cue status and independent Schola
// controller remain the sole sources of liturgical/performance truth.
function claudeWheelArc(r1,r2,a1,a2){const p=(r,a)=>[r*Math.sin(a),-r*Math.cos(a)];const lg=a2-a1>Math.PI?1:0;const [x1,y1]=p(r2,a1),[x2,y2]=p(r2,a2),[x3,y3]=p(r1,a2),[x4,y4]=p(r1,a1);return `M${x1},${y1}A${r2},${r2} 0 ${lg} 1 ${x2},${y2}L${x3},${y3}A${r1},${r1} 0 ${lg} 0 ${x4},${y4}Z`}
function claudeSectionForCard(ref){
 const n=Number(String(ref??"").replace(/^\D+/,""));
 if(n<=19)return "cat";
 if(n<=29)return "off";
 if(n<=45)return "can";
 if(n<=59)return "com";
 return "end";
}
function claudeWheelRender(wheel,timeline){
 if(wheel?.ok!==true || timeline?.ok!==true)return `<div class="ao-claude-source-hold">Native 65-card source required</div>`;
 const SEC={cat:"#8c6d4f",off:"#b88a2e",can:"#a83a35",com:"#3f6f93",end:"#6a5a99"};
 const A=n=>2*Math.PI*n/65;
 const posture=timeline.lanes?.find(x=>x.id==="FAITHFUL");
 const bell=timeline.lanes?.find(x=>x.id==="BELLS");
 let g=`<svg class="ao-claude-wheel-svg" viewBox="-300 -300 600 600" role="img" aria-label="Multi-ring Mass wheel, card ordinal, not elapsed time">`;
 wheel.segments.forEach((c,i)=>{
  const ring=claudeWheelArc(222,262,A(i),A(i+1));
  const current=c.current;
  const post=current&&posture?.location===i?{
   KNEEL:"#9b4a55",STAND:"#3f7f63",SIT:"#a88a45"}[posture.text]:"#282e31";
  g+=`<path d="${ring}" fill="${SEC[claudeSectionForCard(c.referenceId)]}" stroke="#0b1016" stroke-width="1.5" opacity="${current?1:.82}"/>`;
  g+=`<path d="${claudeWheelArc(178,214,A(i),A(i+1))}" fill="${post||"#282e31"}" stroke="#0b1016" stroke-width="1"/>`;
 });
 g+=`<circle r="158" fill="none" stroke="#2c3645" stroke-width="22" opacity=".75"/>`;
 if(bell?.location!=null){const i=bell.location,a=A(i+.5);g+=`<circle cx="${282*Math.sin(a)}" cy="${-282*Math.cos(a)}" r="10" fill="#d4a640" stroke="#d4a640" stroke-width="3"/>`;}
 g+=`<g transform="rotate(${360*(timeline.position-.5)/65})"><line x1="0" y1="0" x2="0" y2="-262" stroke="#fff" stroke-width="6" stroke-linecap="round"/><circle r="14" fill="#fff"/></g></svg>`;
 return `<div class="ao-claude-wheel-page" data-wheel-design="CLAUDE_ORIGINAL_MULTI_RING">
  <div class="ao-claude-wheel-left">${g}</div>
  <div class="ao-claude-wheel-right">
   <div class="ao-claude-icons" aria-label="Cue icons require exact native owner"></div>
   <p class="ao-claude-meaning-pending" aria-label="The original handoff's draft meanings remain in editorial review"></p>
  </div>
 </div>`;
}
function claudeTimelineRender(timeline,{span=8,width=390,height=230}={}){
 if(timeline?.ok!==true)return `<div class="ao-claude-source-hold">Native 65-card source required</div>`;
 const W=Math.max(200,Number(width)||390),H=Math.max(95,Number(height)||230);
 const ppm=W/Math.max(3,Math.min(40,span)),now=timeline.position-.5,x=v=>W/2+(v-now)*ppm;
 const rows=[["PRIEST","PRIEST",26],["MINISTERS","MINISTERS",12],["SCHOLA","SCHOLA",18],["ORGAN","ORGAN",8],["BELLS","BELLS",12],["FAITHFUL","YOU",14]];
 const gap=4,tot=rows.reduce((s,r)=>s+r[2],0)+gap*(rows.length-1),sc=(H-14)/tot;
 let y=12;const Y={};rows.forEach(([k,,h])=>{Y[k]=[y,h*sc];y+=h*sc+gap*sc;});
 let g=`<svg viewBox="0 0 ${W} ${H}" width="100%" height="100%" role="img" aria-label="Six native source-status lanes, ordinal not minutes">
 <defs><pattern id="secR" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="5" fill="rgba(238,233,223,.05)"/><rect width="1.2" height="5" fill="rgba(238,233,223,.3)"/></pattern></defs>`;
 const priest=timeline.lanes.find(l=>l.id==="PRIEST"),faithful=timeline.lanes.find(l=>l.id==="FAITHFUL"),bell=timeline.lanes.find(l=>l.id==="BELLS");
 timeline.cards.forEach((c,i)=>{
  const a=x(i),w=ppm;
  if(a+w<=0||a>=W)return;
  const current=c.current;
  const pfill=current&&priest?.location===i?"rgba(238,233,223,.34)":"rgba(238,233,223,.065)";
  g+=`<rect x="${a+.5}" y="${Y.PRIEST[0]}" width="${Math.max(1,w-1)}" height="${Y.PRIEST[1]}" rx="2.5" fill="${pfill}" ${current?'stroke="#c9ad78" stroke-width="1.2"':""}/>`;
  const n=i+1;
  if(w>20)g+=`<text x="${a+w/2}" y="9" text-anchor="middle" style="font:${current?600:500} 8.5px Georgia,serif;fill:${current?"#c9ad78":"rgba(238,233,223,.4)"}">${n}</text>`;
  const postureFill=current&&faithful?.location===i?{
    KNEEL:"#9b4a55",STAND:"#3f7f63",SIT:"#a88a45"}[faithful.text]:null;
  if(postureFill)g+=`<rect x="${a}" y="${Y.FAITHFUL[0]}" width="${w+.3}" height="${Y.FAITHFUL[1]}" fill="${postureFill}"/>`;
 });
 if(bell?.location!=null){const cy=Y.BELLS[0]+Y.BELLS[1]/2;
  g+=`<circle cx="${x(bell.location+.5)}" cy="${cy}" r="${Y.BELLS[1]*.38}" fill="#d4a640" stroke="#d4a640" stroke-width="1.5"/>`;
 }
 g+=`<rect x="${W/2-.75}" y="10" width="1.5" height="${H-10}" fill="#fff" opacity=".9"/>`;
 const fs=Math.min(10,Math.max(6.5,(H-14)/rows.length*.5));
 rows.forEach(([k,n])=>{g+=`<text x="3" y="${Y[k][0]+Y[k][1]/2+fs*.38}" style="font:600 ${fs}px Georgia,serif;letter-spacing:.6px;fill:rgba(238,233,223,.62);paint-order:stroke;stroke:#0b1016;stroke-width:3px">${n}</text>`;});
 g+='</svg>';
 return `<div class="ao-claude-timeline-page" data-timeline-design="CLAUDE_ORIGINAL_SIX_LANES">
 <div class="ao-claude-timeline-canvas">${g}</div>
 <div class="ao-claude-timeline-zoom">
 <button type="button" data-claude-zoom="-1" aria-label="Show fewer native cards">−</button>
 <button type="button" data-claude-zoom="1" aria-label="Show more native cards">+</button>
 </div></div>`;
}
export {claudeWheelRender,claudeTimelineRender};
export const CLAUDE_PORT_CSS=[
".ao-claude-timeline-page{width:100%;height:100%;position:relative;min-height:0;background:#0b1016}",
".ao-claude-timeline-canvas{position:absolute;inset:8px 6px 22px 6px}",
".ao-claude-timeline-zoom{position:absolute;right:10px;top:8px;display:flex;gap:4px;z-index:3}",
".ao-claude-timeline-zoom button{width:28px;height:26px;border-radius:8px;border:1px solid rgba(255,255,255,.105);background:rgba(13,18,24,.85);color:#eee9df;font:15px Georgia,serif;cursor:pointer}",
".ao-claude-wheel-page{display:grid;grid-template-columns:46% 54%;align-items:stretch;width:100%;height:100%;min-width:0;overflow:hidden;background:#0d1116}",
".ao-claude-wheel-left{display:flex;justify-content:center;align-items:center;padding:8px 0 22px 8px;min-width:0;min-height:0}",
".ao-claude-wheel-svg{width:100%;height:100%;min-width:0;max-height:100%;display:block}",
".ao-claude-wheel-right{overflow-y:auto;padding:8px 10px 24px 6px;font:13.5px/1.28 'EB Garamond',Georgia,serif;display:flex;flex-direction:column;justify-content:center;gap:2px}",
".ao-claude-icons{display:flex;flex-wrap:wrap;gap:5px;margin:2px 0 8px;min-height:35px}",
".ao-claude-meaning-pending{font:14.5px/1.38 'EB Garamond',Georgia,serif;min-height:35px;color:rgba(238,233,223,.45);margin:0}",
"@media(max-width:380px){.ao-claude-wheel-right{padding-right:5px}.ao-claude-wheel-left{padding-left:2px}}"
].join("\n");
