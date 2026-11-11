// Local GABC → responsive SVG notation. No remote scripts or runtime network.
// Exsurge is an MIT-licensed, pinned, vendored dependency in assets/vendor/exsurge.
// This component neither starts audio nor drives liturgical cue/Schola state.
const BUNDLE_URL=new URL("../../assets/vendor/exsurge/exsurge.min.js",import.meta.url);
const LOAD_BY_DOCUMENT=new WeakMap();
function browserExsurge(doc){
  return doc?.defaultView?.exsurge ?? globalThis.exsurge ?? null;
}
export function loadOfflineExsurge(doc){
  if(!doc?.createElement) return Promise.reject(new TypeError("Document required"));
  const existing=browserExsurge(doc);
  if(existing?.Gabc && existing?.ChantScore)return Promise.resolve(existing);
  if(LOAD_BY_DOCUMENT.has(doc))return LOAD_BY_DOCUMENT.get(doc);
  const promise=new Promise((resolve,reject)=>{
    const script=doc.createElement("script");
    script.src=BUNDLE_URL.href;
    script.async=true;
    script.dataset.aoChantEngraver="exsurge";
    script.onload=()=>{
      const api=browserExsurge(doc);
      if(api?.Gabc?.createMappingsFromSource && api?.ChantScore && api?.ChantContext)
        resolve(api);
      else reject(new Error("Local Exsurge bundle did not expose notation API"));
    };
    script.onerror=()=>reject(new Error("Bundled Exsurge unavailable (offline asset missing)"));
    (doc.head??doc.body??doc.documentElement)?.appendChild(script);
  }).catch(error=>{LOAD_BY_DOCUMENT.delete(doc);throw error});
  LOAD_BY_DOCUMENT.set(doc,promise);
  return promise;
}
export function engraverWidth(viewport){
  const width=Number(viewport?.clientWidth??0);
  // Reserve a small safety margin; layout automatically wraps staff systems.
  return Math.max(180,Math.round((width||340)-16));
}
// Each instance is bound to a single panel; callers may hold two independent
// instances for inline and expanded score. Stale renders may never overwrite
// the selected chant during quick option/viewport changes.
export function createOfflineChantEngraver({
 viewport,document=viewport?.ownerDocument,horizontalStaffWidth=null
}={}){
 // The optional wider source-layout is ONLY for the Schola's horizontal
 // notation viewport. Reader/print/full-score clients retain their
 // existing responsive, multi-system engraving and resizing.
 const fixedWidth=Number.isFinite(horizontalStaffWidth)
   ?Math.max(800,Math.min(1800,Math.round(horizontalStaffWidth))):null;
 const targetWidth=()=>fixedWidth??engraverWidth(viewport);
  if(!viewport?.replaceChildren || !document?.createElement)
    throw new TypeError("Offline chant viewport and document required");
  let requestId=0,activeGabc=null,score=null,context=null,library=null;
  let laidOut=false,lastWidth=0,destroyed=false,observer=null;
  let pending=Promise.resolve(false);
  function replaceScoreNode(width){
    const svg=score.createSvgNode(context);
    if(!svg)throw new Error("Exsurge emitted no SVG");
    svg.setAttribute("aria-hidden","true"); // Parent has the human-readable aria label.
    svg.style.maxWidth=fixedWidth?"none":"100%";
    // A truly wider SVG is required for source notes to travel horizontally.
    // Scaling a 1200px layout down to the dock width defeats follow scrolling.
    if(fixedWidth)svg.style.width=width+"px";
    svg.style.height="auto";
    svg.style.display="block";
    viewport.replaceChildren(svg);
  }
  function layout(width,request){
    return new Promise((resolve,reject)=>{
      const apply=()=>{
        if(destroyed||request!==requestId)return resolve(false);
        try{replaceScoreNode(width);lastWidth=width;resolve(true)}
        catch(e){reject(e)}
      };
      try{score.layoutChantLines(context,width,apply)}
      catch(e){reject(e)}
    });
  }
  async function engrave(gabc){
    if(destroyed)throw new Error("Engraver destroyed");
    if(typeof gabc!=="string"||!gabc.includes("%%"))
      throw new TypeError("Nonempty GABC source required");
    const request=++requestId;
    activeGabc=gabc;laidOut=false;score=null;context=null;lastWidth=0;
    const job=(async()=>{
      const api=await loadOfflineExsurge(document);
      if(destroyed||request!==requestId)return false;
      library=api;
      const ctx=new api.ChantContext();
      const mappings=api.Gabc.createMappingsFromSource(ctx,gabc);
      const parsed=new api.ChantScore(ctx,mappings,true);
      const firstLayout=()=>new Promise((resolve,reject)=>{
        try{
          if(typeof parsed.performLayoutAsync==="function")
            parsed.performLayoutAsync(ctx,resolve,reject);
          else {parsed.performLayout(ctx);resolve()}
        }catch(e){reject(e)}
      });
      await firstLayout();
      if(destroyed||request!==requestId)return false;
      context=ctx;score=parsed;laidOut=true;
      return layout(targetWidth(),request);
    })();
    pending=job;
    return job;
  }
  async function reflow(){
    const request=requestId;
    if(destroyed||!activeGabc)return false;
    try{
      await pending;
      if(!laidOut||!score||request!==requestId||destroyed)return false;
      const width=targetWidth();
      if(width===lastWidth)return false;
      return await layout(width,request);
    }catch{return false}
  }
  function observe(){
    if(observer||destroyed)return;
    const View=document?.defaultView;
    if(typeof View?.ResizeObserver!=="function")return;
    observer=new View.ResizeObserver(()=>{void reflow()});
    observer.observe(viewport);
  }
  function destroy(){
    destroyed=true;requestId+=1;observer?.disconnect?.();observer=null;
    activeGabc=null;score=null;context=null;library=null;laidOut=false;
  }
  return Object.freeze({
    engrave,reflow,observe,destroy,
    getState:()=>Object.freeze({rendered:laidOut,sourceLoaded:Boolean(library),
      lastWidth,hasGabc:Boolean(activeGabc),destroyed}),
  });
}
