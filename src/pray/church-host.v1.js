/**
 * Opt-in host for Claude's exact R8 Prayer Church, staged from the owner's
 * review package. Does not replace the canonical Prayer reader or its data.
 * The staged Church must be same-origin, and is intentionally NOT in this PR.
 */
const FRAME_PATH="./assets/pray-church/prayers.html";

export function churchPilotEnabled(win=globalThis){
  try{
    return new URL(win.location.href).searchParams.get("aoChurchPilot")==="1";
  }catch{return false}
}

export function createChurchHost(win=globalThis,{framePath=FRAME_PATH}={}){
  let frame=null,active=false,paused=false,previousOverflow="",loading=null;
  let onFrameMessage=null;
  // Claude's R8 accepts ?lang=... on boot and AO.on({type:"settings"})
  // while open. Keep the Church in the same language as the parent app.
  const settings=()=>({
    ao:1,type:"settings",
    lang:String(win.document?.documentElement?.lang||"en").toLowerCase().startsWith("fr")?"fr":"en",
    lc:win.document?.documentElement?.dataset?.lc||"r"
  });
  const sendSettings=()=>{
    try{frame?.contentWindow?.postMessage?.(settings(),win.location.origin)}catch{}
  };

  const localUrl=(resume=false)=>{
    const origin=new URL(win.location.href);
    const url=new URL(framePath,origin);
    if(url.origin!==origin.origin)throw Error("Prayer Church must be same-origin");
    // Avoid an English first paint before the asynchronous settings message.
    url.searchParams.set("lang",settings().lang);
    if(resume)url.searchParams.set("resume","1");
    return url;
  };
  const send=type=>{
    try{frame?.contentWindow?.postMessage?.({aoChurchHost:1,type},win.location.origin)}catch{}
  };
  function handleMessage(event){
    if(!frame||event.source!==frame.contentWindow||
       event.origin!==win.location.origin)return;
    const data=event.data;
    if(!data||data.ao!==1||typeof data.type!=="string")return;
    if(data.type==="go"){
      const route=String(data.route||"");
      if(route==="today"||route==="home"){
        // The west-door exit is the only route consumed by the host.
        // Other prayer destinations retain their canonical source owners.
        Promise.resolve(win.AO_APP_SHELL_V1?.navigate?.("home"))
          .catch(error=>win.console?.error?.("Church exit failed",error));
      }else{
        win.console?.warn?.("Church requested an unsupported host route",route);
      }
    }
  }
  async function open({resume=false}={}){
    if(active&&frame){show();return true}
    if(loading)return loading;
    loading=(async()=>{
      if(!win.document?.body||typeof win.fetch!=="function")return false;
      let src;
      try{src=localUrl(resume)}catch{return false}
      // Without the actual owner's R8 assets, the flag must fail closed
      // to the current production Prayer interface, never a blank frame.
      try{
        const response=await win.fetch(src.href,{method:"HEAD",cache:"no-store"});
        if(!response?.ok)return false;
      }catch{return false}
      const el=win.document.createElement("iframe");
      el.id="ao-r10-prayer-church";
      el.title="Interactive Prayer Church";
      el.setAttribute("aria-label","Interactive Prayer Church");
      el.style.cssText="position:fixed;inset:0;width:100%;height:100%;border:0;background:#070b11;z-index:2147483000;";
      // Trusted local same-origin source is required for the original
      // interior's camera and novena bridge to access the parent reader.
      el.src=src.href;
      frame=el;
      previousOverflow=win.document.body.style.overflow;
      const loaded=new Promise(resolve=>{
        let settled=false;
        const done=value=>{if(settled)return;settled=true;resolve(value)};
        el.addEventListener("load",()=>done(true),{once:true});
        el.addEventListener("error",()=>done(false),{once:true});
        win.setTimeout?.(()=>done(false),12000);
      });
      onFrameMessage=handleMessage;
      win.addEventListener("message",onFrameMessage);
      win.document.body.style.overflow="hidden";
      win.document.body.appendChild(el);
      const ok=await loaded;
      if(!ok){close();return false}
      active=true;paused=false;
      sendSettings();
      el.focus?.();
      return true;
    })().finally(()=>{loading=null});
    return loading;
  }
  function suspend(){
    if(!frame||!active||paused)return false;
    send("suspend");
    frame.style.visibility="hidden";
    frame.setAttribute("aria-hidden","true");
    paused=true;
    return true;
  }
  function show(){
    if(!frame||!active)return false;
    frame.style.visibility="visible";
    frame.removeAttribute("aria-hidden");
    paused=false;
    send("resume");
    sendSettings();
    frame.focus?.();
    return true;
  }
  function close(){
    if(frame)send("suspend");
    if(onFrameMessage)win.removeEventListener?.("message",onFrameMessage);
    onFrameMessage=null;
    frame?.remove?.();
    frame=null;active=false;paused=false;
    if(win.document?.body)win.document.body.style.overflow=previousOverflow;
    previousOverflow="";
    return true;
  }
  return Object.freeze({
    open,suspend,resume:show,close,
    active:()=>active,paused:()=>paused,
    frame:()=>frame,source:FRAME_PATH
  });
}
