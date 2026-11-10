// Source-derived, estimated Schola notation following. Not a microphone,
// pitch detector, choir-performance observation, or liturgical cue clock.
// Caller must first pass the independently approved Schola score gate.
const LETTER=/\p{L}/u;
const MARKUP=/<[^>]+>|\{[^}]*\}|\\(?:greheightstar|grealt|grestar|GreStar)\b/gu;
const normal=s=>String(s??"").normalize("NFD")
  .replace(/[\u0300-\u036f]/g,"").replace(/[æœ]/gi,c=>c.toLowerCase()==="æ"?"ae":"oe")
  .replace(/[^\p{L}\p{N}]/gu,"").toLowerCase();

export function scholaGabcSyllables(gabc){
 const value=String(gabc??"");
 const delimiter=value.indexOf("%%");
 if(delimiter<0)return Object.freeze([]);
 const body=value.slice(delimiter+2);
 const items=[];
 const re=/([^()]*)\(([^()]*)\)/gu;
 for(const match of body.matchAll(re)){
  // Each GABC lyric syllable precedes the neume group attached to it.
  // Clefs, barlines and spacing commands have no lexical syllable.
  const raw=match[1].replace(MARKUP,"").replace(/[{}~*]/g,"").trim();
  if(!LETTER.test(raw))continue;
  const label=raw.replace(/[-_]+$/,"").trim();
  if(!label||!LETTER.test(label))continue;
  if(items.length>=600)return Object.freeze([]); // refuse unbounded DOM rows
  items.push(Object.freeze({index:items.length,label,identity:normal(label)}));
 }
 return Object.freeze(items);
}

// Musical durations are unobserved. This deterministic visual cadence is
// approximate and can be corrected by touch at any syllable.
export function createScholaFollowClock({
 stepMs=1600,schedule=globalThis.setTimeout,cancel=globalThis.clearTimeout,
 onStep=()=>{}
}={}){
 if(typeof schedule!=="function"||typeof cancel!=="function")
  throw new TypeError("Timers required");
 const duration=Math.max(500,Math.min(9000,Number(stepMs)||1600));
 let count=0,index=0,running=false,timer=null,destroyed=false;
 const release=()=>{if(timer!==null){cancel(timer);timer=null;}};
 function tick(){
  timer=null;
  if(!running||destroyed)return;
  if(index>=count-1){running=false;return;}
  index+=1;
  onStep(Object.freeze({index,count,origin:"estimated"}));
  if(index<count-1)arm();
  else running=false; // last lyric does NOT mean singing has ended
 }
 function arm(){release();if(running&&index<count-1)timer=schedule(tick,duration);}
 function start(total){
  release();if(destroyed)return false;
  count=Math.floor(Number(total)||0);index=0;
  if(count<1||count>600){count=0;running=false;return false;}
  running=true;
  onStep(Object.freeze({index,count,origin:"estimated"}));arm();
  return true;
 }
 function seek(next){
  if(destroyed||count<1)return false;
  const n=Number(next);
  if(!Number.isFinite(n))return false;
  index=Math.max(0,Math.min(count-1,Math.floor(n)));
  running=index<count-1;
  onStep(Object.freeze({index,count,origin:"manual"}));arm();
  return true;
 }
 function shift(delta){return seek(index+Number(delta||0));}
 function destroy(){release();running=false;count=0;destroyed=true;}
 return Object.freeze({
  start,seek,shift,destroy,
  getState:()=>Object.freeze({index,count,running,pending:timer!==null,destroyed})
 });
}

// Map the printed SVG lyric elements only when EVERY source syllable
// matches in order. Do not mark an arbitrary neume as the current note if
// Exsurge uses an unexpected DOM structure or lyrics differ.
export function mapScholaSvgLyrics(svg,syllables){
 if(!svg?.querySelectorAll||!Array.isArray(syllables)||!syllables.length)return [];
 const nodes=[...svg.querySelectorAll("text")];
 const targets=[];let from=0;
 for(const part of syllables){
  const found=nodes.findIndex((node,i)=>i>=from &&
    normal(node.textContent)===part.identity);
  if(found<0)return [];
  targets.push(nodes[found]);from=found+1;
 }
 if(new Set(targets).size!==syllables.length)return [];
 targets.forEach((node,i)=>{node.dataset.scholaSyllableIndex=String(i);});
 return targets;
}

export function createScholaNotationFollower({staff,strip,document=staff?.ownerDocument,
 window=document?.defaultView,stepMs=1600}={}){
 if(!staff?.addEventListener||!strip?.replaceChildren||!document?.createElement)
  throw new TypeError("Schola staff, syllable strip and document required");
 let parts=[],buttons=[],targets=[],startPoint=null,destroyed=false,active=-1;
 const clock=createScholaFollowClock({
  stepMs,
  schedule:window?.setTimeout?.bind(window)??globalThis.setTimeout,
  cancel:window?.clearTimeout?.bind(window)??globalThis.clearTimeout,
  onStep:({index,origin})=>{
   if(destroyed)return;
   active=index;strip.dataset.scholaFollowIndex=String(index);
   strip.dataset.scholaFollowOrigin=origin;
   for(let i=0;i<buttons.length;i++){
    buttons[i].dataset.active=String(i===index);
    if(i===index)buttons[i].setAttribute("aria-current","true");
    else buttons[i].removeAttribute("aria-current");
   }
   for(let i=0;i<targets.length;i++)targets[i].dataset.scholaFollowActive=String(i===index);
   const button=buttons[index];
   if(button)strip.scrollLeft=Math.max(0,button.offsetLeft-
     (strip.clientWidth-button.offsetWidth)/2);
   const node=targets[index];
   if(node?.getBoundingClientRect){
    const position=node.getBoundingClientRect(),parent=staff.getBoundingClientRect();
    staff.scrollTop+=position.top-parent.top-(staff.clientHeight-position.height)/2;
   }
   staff.dataset.scholaFollowIndex=String(index);
  }
 });
 function click(event){
  const target=event.target?.closest?.("[data-schola-syllable-index]");
  if(!target||!strip.contains(target))return;
  const index=Number(target.dataset.scholaSyllableIndex);
  if(Number.isInteger(index))clock.seek(index);
 }
 function pointDown(event){
  if(!parts.length)return;
  startPoint={x:event.clientX,y:event.clientY,id:event.pointerId};
 }
 function pointUp(event){
  if(!startPoint||startPoint.id!==event.pointerId)return;
  const p=startPoint;startPoint=null;
  const dx=event.clientX-p.x,dy=event.clientY-p.y;
  if(Math.abs(dx)>38&&Math.abs(dx)>Math.abs(dy)*1.2){
   clock.shift(dx<0?3:-3);
   event.preventDefault?.();
   return;
  }
  if(Math.abs(dx)>18||Math.abs(dy)>18||!targets.length)return;
  // A finger can hit a neume instead of the lyric glyph. Choose the closest
  // SOURCE-ALIGNED lyric element in the rendered staff, not a time estimate.
  let winner=-1,distance=Infinity;
  targets.forEach((node,i)=>{
   const r=node.getBoundingClientRect();
   const x=r.left+r.width/2,y=r.top+r.height/2;
   const d=(x-event.clientX)**2+(y-event.clientY)**2;
   if(d<distance){distance=d;winner=i;}
  });
  if(winner>=0)clock.seek(winner);
 }
 const pointCancel=()=>{startPoint=null;};
 strip.addEventListener("click",click);
 staff.addEventListener("pointerdown",pointDown);
 staff.addEventListener("pointerup",pointUp);
 staff.addEventListener("pointercancel",pointCancel);
 function start(gabc){
  if(destroyed)return false;
  parts=scholaGabcSyllables(gabc);buttons=[];targets=[];strip.replaceChildren();
  if(!parts.length){strip.hidden=true;return false;}
  const frag=document.createDocumentFragment();
  for(const part of parts){
   const node=document.createElement("button");
   node.type="button";node.dataset.scholaSyllableIndex=String(part.index);
   node.className="ao-schola-follow-syllable";
   node.textContent=part.label;
   node.setAttribute("aria-label","Resynchronise expected chant at syllable "+
    (part.index+1)+" of "+parts.length+": "+part.label);
   buttons.push(node);frag.append(node);
  }
  strip.append(frag);strip.hidden=false;
  targets=mapScholaSvgLyrics(staff.querySelector("svg"),parts);
  staff.dataset.scholaLyricsMapped=String(targets.length===parts.length);
  return clock.start(parts.length);
 }
 function destroy(){
  if(destroyed)return;destroyed=true;clock.destroy();
  strip.removeEventListener("click",click);
  staff.removeEventListener("pointerdown",pointDown);
  staff.removeEventListener("pointerup",pointUp);
  staff.removeEventListener("pointercancel",pointCancel);
  strip.replaceChildren();strip.hidden=true;
 }
 return Object.freeze({
  start,destroy,seek:index=>clock.seek(index),shift:by=>clock.shift(by),
  getState:()=>Object.freeze({...clock.getState(),syllables:parts.length,
   mapped:targets.length===parts.length&&parts.length>0,active})
 });
}
