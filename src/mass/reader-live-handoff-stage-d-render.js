// Minimal Stage D presentation. All text is escaped before use in innerHTML.
// Six lanes describe their own owners. Never draw a Schola/organ progress
// marker at the reader's current native-card ordinal.
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>
  ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fixed=n=>Number(n).toFixed(3);
function polar(cx,cy,r,deg){
  const angle=(deg-90)*Math.PI/180;
  return {x:cx+r*Math.cos(angle),y:cy+r*Math.sin(angle)};
}
function sector(a,b,r1=64,r2=83){
  const outerStart=polar(100,100,r2,a+.35),outerEnd=polar(100,100,r2,b-.35);
  const innerEnd=polar(100,100,r1,b-.35),innerStart=polar(100,100,r1,a+.35);
  return "M "+fixed(outerStart.x)+" "+fixed(outerStart.y)
    +" A "+r2+" "+r2+" 0 0 1 "+fixed(outerEnd.x)+" "+fixed(outerEnd.y)
    +" L "+fixed(innerEnd.x)+" "+fixed(innerEnd.y)
    +" A "+r1+" "+r1+" 0 0 0 "+fixed(innerStart.x)+" "+fixed(innerStart.y)
    +" Z";
}
export function renderLiveHandoffTimelineHtml(timeline){
  if(timeline?.ok!==true)return '<div class="ao-lb-d-pending" role="status">Native LIVE source required</div>';
  return '<section class="ao-lb-d-timeline" aria-label="Six source-status lanes. Ordinal cards are not elapsed time">'
    +'<div class="ao-lb-d-trackhead"><strong>Mass sequence</strong><span>'
    +timeline.position+' / '+timeline.total+' · cards, not minutes</span></div>'
    +timeline.lanes.map(lane=>
      '<div class="ao-lb-d-lane" data-lane="'+esc(lane.id)+'" data-status="'+esc(lane.status)
      +'" aria-label="'+esc(lane.label||lane.id||lane.text)+'">'
      +'<div class="ao-lb-d-lanehead"><span>'+esc(lane.id==="PRIEST"?"Celebrant":
        lane.id==="MINISTERS"?"Ministers":lane.id==="SCHOLA"?"Schola":
        lane.id==="ORGAN"?"Organ":lane.id==="BELLS"?"Bells":"Faithful")+'</span>'
      +'<small title="'+esc(lane.text)+'">'+esc(lane.text)+'</small></div>'
      +'<div class="ao-lb-d-lane-track" aria-hidden="true">'
      +'<div class="ao-lb-d-cells">'
      +timeline.cards.map((card,i)=>
        '<span class="ao-lb-d-cell" data-current="'+(lane.location===i)+'"'
        +((lane.location===i)?' data-source-mark="true"':"")
        +'></span>').join("")
      +'</div></div></div>'
    ).join("")
    +'<p class="ao-lb-d-disclaimer">Schola, organ and ministers are not synchronized to card scrolling.</p>'
    +'</section>';
}
export function renderLiveHandoffWheelHtml(wheel){
  if(wheel?.ok!==true)return '<div class="ao-lb-d-pending" role="status">Native LIVE source required</div>';
  const title=esc(wheel.current?.title??"");
  const slices=wheel.segments.map(s=>
    '<path class="ao-lb-d-sector" data-wheel-current="'+s.current
    +'" data-wheel-visited="'+s.visited
    +'" d="'+sector(s.startAngle,s.endAngle)+'"/>').join("");
  return '<section class="ao-lb-d-wheel" aria-label="65 native Mass cards; ordinal position, not elapsed time">'
    +'<svg viewBox="0 0 200 200" aria-hidden="true" focusable="false">'
    +slices
    +'<circle class="ao-lb-d-wheel-core" cx="100" cy="100" r="56"/>'
    +'<text class="ao-lb-d-wheel-count" x="100" y="96" text-anchor="middle">'
    +wheel.current.sequence+' / '+wheel.total+'</text>'
    +'<text class="ao-lb-d-wheel-unit" x="100" y="116" text-anchor="middle">cards</text>'
    +'</svg>'
    +'<div class="ao-lb-d-wheel-caption"><strong>'+title+'</strong>'
    +'<span>Source-backed card · not a timer</span>'
    +'</div></section>';
}
export const LIVE_HANDOFF_STAGE_D_CSS=[
".ao-lb-d-timeline{width:min(100%,660px);height:100%;min-height:0;display:flex;flex-direction:column;justify-content:center;padding:7px 10px;color:#e9e5db;box-sizing:border-box}",
".ao-lb-d-trackhead{display:flex;justify-content:space-between;gap:8px;align-items:baseline;font:10px system-ui,sans-serif;margin-bottom:3px}",
".ao-lb-d-trackhead strong{font-size:11px;font-weight:600;letter-spacing:.02em}",
".ao-lb-d-trackhead span{opacity:.7;white-space:nowrap}",
".ao-lb-d-lane{display:grid;grid-template-columns:minmax(105px,40%) minmax(0,60%);align-items:center;gap:5px;min-height:24px;border-top:1px solid rgba(196,200,181,.10)}",
".ao-lb-d-lanehead{display:flex;flex-direction:column;gap:1px;min-width:0}",
".ao-lb-d-lanehead span{font:600 10px system-ui,sans-serif;letter-spacing:.02em}",
".ao-lb-d-lanehead small{font:9px system-ui,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#a7b3b1}",
".ao-lb-d-lane-track{overflow:hidden}",
".ao-lb-d-cells{display:grid;grid-template-columns:repeat(65,minmax(0,1fr));gap:1px;height:9px}",
".ao-lb-d-cell{display:block;background:rgba(191,204,194,.12);border-radius:1px;min-width:0}",
".ao-lb-d-cell[data-current='true']{background:rgba(235,201,131,.3)}",
".ao-lb-d-cell[data-source-mark='true']{background:#dfc688;box-shadow:0 0 6px rgba(221,191,129,.55)}",
".ao-lb-d-disclaimer{font:9px system-ui,sans-serif;color:#a9ada7;opacity:.82;margin:4px 0 0;text-align:center}",
".ao-lb-d-wheel{display:flex;align-items:center;justify-content:center;gap:8px;max-width:580px;width:100%;height:100%;box-sizing:border-box;padding:8px 12px}",
".ao-lb-d-wheel svg{height:100%;max-height:210px;aspect-ratio:1;flex:0 1 220px;min-width:0}",
".ao-lb-d-sector{fill:rgba(203,199,175,.15);stroke:rgba(5,8,12,.24);stroke-width:.2}",
".ao-lb-d-sector[data-wheel-visited='true']{fill:rgba(185,176,142,.35)}",
".ao-lb-d-sector[data-wheel-current='true']{fill:var(--ao-mass-accent,#d9c38f);stroke:#fff1be;stroke-width:.75}",
".ao-lb-d-wheel-core{fill:rgba(14,22,26,.85);stroke:rgba(217,207,167,.22);stroke-width:1}",
".ao-lb-d-wheel-count{fill:#eee3c9;font:600 25px system-ui,sans-serif}",
".ao-lb-d-wheel-unit{fill:#a8afaa;font:11px system-ui,sans-serif}",
".ao-lb-d-wheel-caption{flex:1 1 170px;min-width:0;display:flex;flex-direction:column;gap:6px}",
".ao-lb-d-wheel-caption strong{color:#f1e8d4;font:600 13px Georgia,serif;line-height:1.25}",
".ao-lb-d-wheel-caption span{color:#aeb8ad;font:10px system-ui,sans-serif}",
".ao-lb-d-pending{font:12px system-ui,sans-serif;color:#b9c1b6;padding:12px}",
"@media(max-width:380px){.ao-lb-d-lane{grid-template-columns:minmax(92px,38%) minmax(0,62%)}.ao-lb-d-lanehead small{font-size:8px}.ao-lb-d-wheel-caption strong{font-size:11px}.ao-lb-d-disclaimer{font-size:8px}}",
"@media(max-height:650px) and (orientation:landscape){.ao-lb-d-timeline{padding:2px 9px}.ao-lb-d-lane{min-height:19px}.ao-lb-d-wheel{gap:3px}.ao-lb-d-disclaimer{margin:2px 0 0}}"
].join("\n");
