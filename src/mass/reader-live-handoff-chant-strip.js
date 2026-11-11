// Stage E: lay out the EXISTING approved Exsurge Schola notation as Claude's
// horizontally scrollable strip. This module owns only DOM presentation:
// the native Schola track, score approval, syllable follower, Mass card and
// ritual state remain entirely with their existing controllers.
export const LIVE_HANDOFF_CHANT_STRIP_CSS=[
 ".ao-reader-shell.ao-live-band-enabled .ao-schola-approved-score[data-score-status='approved']{position:relative;overflow:hidden}",
 ".ao-reader-shell.ao-live-band-enabled .ao-live-chant-scroll{position:relative;display:block;width:100%;height:63px;max-height:63px;min-width:0;overflow-x:auto;overflow-y:hidden;overscroll-behavior-x:contain;touch-action:pan-x;scrollbar-width:none;cursor:grab;padding-inline:30% 70%}",
 ".ao-reader-shell.ao-live-band-enabled .ao-live-chant-scroll::-webkit-scrollbar{display:none}",
 ".ao-reader-shell.ao-live-band-enabled .ao-live-chant-scroll[data-dragging='true']{cursor:grabbing}",
 // Wide layout keeps printed neumes on long horizontal systems rather than
 // forcing a tiny 320px text/staff layout. Existing Exsurge ResizeObserver
 // relays the changed staff width to its source-only notation engraver.
 ".ao-reader-shell.ao-live-band-enabled .ao-schola-approved-staff[data-live-chant-horizontal='true']{width:4096px!important;min-width:4096px!important;max-width:none!important;height:63px!important;max-height:63px!important;overflow:hidden;touch-action:pan-x}",
 ".ao-reader-shell.ao-live-band-enabled .ao-schola-approved-staff[data-live-chant-horizontal='true'] svg{max-width:none!important;height:auto!important}",
 ".ao-reader-shell.ao-live-band-enabled .ao-live-chant-now{position:absolute;z-index:4;pointer-events:none;top:0;left:30%;height:63px;width:2px;background:#d4b16a;box-shadow:0 0 7px rgba(212,177,106,.64)}",
 "@media(max-width:380px){.ao-reader-shell.ao-live-band-enabled .ao-live-chant-scroll{height:62px;max-height:62px}.ao-reader-shell.ao-live-band-enabled .ao-live-chant-now{height:62px}}",
 "@media(prefers-reduced-motion:reduce){.ao-reader-shell.ao-live-band-enabled .ao-live-chant-scroll{scroll-behavior:auto}}"
].join("\n");

export function installLiveHandoffChantStrip({root,document=root?.ownerDocument}={}){
 const panel=root?.querySelector?.('[data-role="schola-approved-score"]');
 const staff=root?.querySelector?.('[data-role="schola-approved-staff"]');
 if(!panel||!staff||staff.parentNode!==panel||!document?.createElement)
   return Object.freeze({mounted:false,reason:"NATIVE_APPROVED_NOTATION_REQUIRED",
     setEnabled:()=>false,dispose(){}});
 const afterStaff=staff.nextSibling;
 const scroller=document.createElement("div");
 scroller.className="ao-live-chant-scroll";
 scroller.setAttribute("aria-label","Horizontally scroll the existing source-approved Gregorian score");
 scroller.dataset.aoLiveChantScroll="true";
 const playhead=document.createElement("div");
 playhead.className="ao-live-chant-now";
 playhead.dataset.aoLiveChantNow="true";
 playhead.setAttribute("aria-hidden","true");
 let enabled=false,disposed=false,drag=null;
 const visible=()=>enabled&&panel.dataset.scoreStatus==="approved"&&!panel.hidden;
 // The existing notation follower alone owns source-syllable progression.
 // It marks exactly matched Exsurge lyrics on the SVG and changes this
 // index independently from the priest's card. Follow that read-only mark;
 // do not interpolate from the card number or drive the Schola controller.
 function alignEstimatedSyllable(){
   if(!visible())return false;
   const active=staff.querySelector('svg text[data-schola-follow-active="true"]');
   if(!active)return false; // no exact source lyric mapping; do not guess
   const glyph=active.getBoundingClientRect(),box=scroller.getBoundingClientRect();
   if(!glyph.width||!box.width)return false;
   const dx=glyph.left+glyph.width/2-(box.left+box.width*.3);
   if(Math.abs(dx)>2)scroller.scrollLeft+=dx;
   return true;
 }
 const Observer=document?.defaultView?.MutationObserver;
 const followerObserver=typeof Observer==="function"
   ?new Observer(alignEstimatedSyllable):null;
 function pointerDown(e){
   if(e.pointerType!=="mouse"||e.button!==0||!visible())return;
   drag={id:e.pointerId,x:e.clientX,start:scroller.scrollLeft,started:false};
 }
 function pointerMove(e){
   if(!drag||drag.id!==e.pointerId)return;
   const dx=e.clientX-drag.x;
   if(!drag.started&&Math.abs(dx)>6){
     drag.started=true;
     scroller.setPointerCapture?.(e.pointerId);
     scroller.dataset.dragging="true";
   }
   if(drag.started)scroller.scrollLeft=drag.start-dx;
 }
 function pointerEnd(e){
   if(!drag||drag.id!==e.pointerId)return;
   if(scroller.hasPointerCapture?.(e.pointerId))
     scroller.releasePointerCapture?.(e.pointerId);
   drag=null;delete scroller.dataset.dragging;
 }
 scroller.addEventListener("pointerdown",pointerDown);
 scroller.addEventListener("pointermove",pointerMove);
 scroller.addEventListener("pointerup",pointerEnd);
 scroller.addEventListener("pointercancel",pointerEnd);
 function setEnabled(next){
   if(disposed)return false;
   const on=next===true;
   if(on===enabled)return true;
   enabled=on;drag=null;
   if(on){
     panel.insertBefore(scroller,staff);
     scroller.appendChild(staff);
     panel.insertBefore(playhead,scroller.nextSibling);
     staff.dataset.liveChantHorizontal="true";
     panel.dataset.liveChantSource="APPROVED_NATIVE_ONLY";
     followerObserver?.observe(staff,{attributes:true,
       attributeFilter:["data-schola-follow-index"]});
     alignEstimatedSyllable();
   }else{
     followerObserver?.disconnect();
     panel.insertBefore(staff,afterStaff?.parentNode===panel?afterStaff:null);
     scroller.remove();playhead.remove();
     delete staff.dataset.liveChantHorizontal;
     delete panel.dataset.liveChantSource;
   }
   return true;
 }
 function dispose(){
   if(disposed)return;
   setEnabled(false);disposed=true;
   scroller.removeEventListener("pointerdown",pointerDown);
   scroller.removeEventListener("pointermove",pointerMove);
   scroller.removeEventListener("pointerup",pointerEnd);
   scroller.removeEventListener("pointercancel",pointerEnd);
 }
 return Object.freeze({mounted:true,setEnabled,dispose,
   getState:()=>Object.freeze({enabled,sourceOnly:true,approvedScoreVisible:visible(),
     hasPlayhead:Boolean(playhead.parentNode),canScroll:Boolean(scroller.scrollWidth>scroller.clientWidth)})});
}
