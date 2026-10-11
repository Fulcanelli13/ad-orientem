// A swipe across navigation must never synthesize an app transition.
// Observe movement passively: do not prevent native scrolling or map gestures.
export function createScrollTapGuard(doc,{contains=()=>true,trackAnywhere=false,threshold=12,windowMs=280}={}){
  let touch=null,recent=null,pointer=null;
  const position=(event,kind)=>{
    const source=kind==="end"?event?.changedTouches?.[0]:event?.touches?.[0];
    return source&&Number.isFinite(source.clientX)&&Number.isFinite(source.clientY)
      ?{x:source.clientX,y:source.clientY}:null;
  };
  function start(event){
    const pos=position(event,"start");
    touch=pos&&event.touches?.length===1&&(trackAnywhere||contains(event.target))
      ?{...pos,moved:false}:null;
  }
  function move(event){
    if(!touch)return;
    const pos=position(event,"move");
    if(event.touches?.length>1){touch.moved=true;return;}
    if(pos&&Math.hypot(pos.x-touch.x,pos.y-touch.y)>=threshold)touch.moved=true;
  }
  function end(event){
    if(!touch)return;
    if(touch.moved){
      const pos=position(event,"end")??touch;
      recent={x:pos.x,y:pos.y,at:Date.now()};
    }
    touch=null;
  }
  function pointerStart(event){
    if(event.pointerType!=="mouse"||event.button!==0||!(trackAnywhere||contains(event.target)))return;
    pointer={x:event.clientX,y:event.clientY,moved:false};
  }
  function pointerMove(event){
    if(pointer&&Math.hypot(event.clientX-pointer.x,event.clientY-pointer.y)>=threshold)pointer.moved=true;
  }
  function pointerEnd(event){
    if(pointer?.moved&&Number.isFinite(event.clientX)&&Number.isFinite(event.clientY))
      recent={x:event.clientX,y:event.clientY,at:Date.now()};
    pointer=null;
  }
  function ignoreClick(event){
    if(!recent||event?.detail===0||!contains(event.target))return false;
    if(Date.now()-recent.at>windowMs){recent=null;return false;}
    const d=Math.hypot((event.clientX??-999)-recent.x,(event.clientY??-999)-recent.y);
    if(d>36)return false;
    recent=null;
    return true;
  }
  function captureClick(event){
    if(!ignoreClick(event))return;
    event.preventDefault?.();
    event.stopImmediatePropagation?.();
    event.stopPropagation?.();
  }
  const listeners=[
    ["touchstart",start,{capture:true,passive:true}],
    ["touchmove",move,{capture:true,passive:true}],
    ["touchend",end,{capture:true,passive:true}],
    ["touchcancel",end,{capture:true,passive:true}],
    ["pointerdown",pointerStart,true],["pointermove",pointerMove,true],
    ["pointerup",pointerEnd,true],["pointercancel",pointerEnd,true],
    ["click",captureClick,true],
  ];
  for(const [type,handler,opts] of listeners)doc?.addEventListener?.(type,handler,opts);
  return Object.freeze({
    ignoreClick,
    dispose(){for(const [type,handler,opts] of listeners)doc?.removeEventListener?.(type,handler,opts)},
  });
}
