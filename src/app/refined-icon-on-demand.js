/*
 * Refined icon geometry is optional until an actual displayed <use> consumes it.
 * Keep historical <symbol id> nodes present for compatibility and diagnostics,
 * but do not place network-backed <use> children in those symbols on cold boot.
 */
(()=>{
  "use strict";
  if(typeof document==="undefined")return;
  const doc=document,ns="http://www.w3.org/2000/svg";
  const icons=new Map();
  let observer=null,scheduled=false;
  const stats={activations:0,scans:0};
  const visible=el=>{
    const svg=el.ownerSVGElement??el.closest?.("svg");
    if(!svg||svg.closest?.("symbol,defs,template,[hidden]"))return false;
    if(!svg.isConnected)return false;
    // The rendered SVG's box is independent of the currently-empty symbol's
    // bounding box. Inspect the host, not the zero-geometry <use>.
    return typeof svg.getClientRects!=="function" || svg.getClientRects().length>0;
  };
  const activate=id=>{
    const node=icons.get(id);
    if(!node||node.dataset.aoRefinedActive==="true")return false;
    const href=node.getAttribute("data-ao-refined-lazy");
    if(!href)return false;
    const el=doc.createElementNS(ns,"use");
    el.setAttribute("href",href);
    el.setAttribute("width","100%");
    el.setAttribute("height","100%");
    node.appendChild(el);
    node.dataset.aoRefinedActive="true";
    stats.activations++;
    if(stats.activations===icons.size)observer?.disconnect();
    return true;
  };
  const scan=()=>{
    stats.scans++;
    for(const el of doc.querySelectorAll("use")){
      const href=el.getAttribute("href")||el.getAttribute("xlink:href")||"";
      if(!href.startsWith("#")||!icons.has(href.slice(1)))continue;
      if(visible(el))activate(href.slice(1));
    }
  };
  const schedule=()=>{
    if(scheduled)return;
    scheduled=true;
    queueMicrotask(()=>{scheduled=false;scan();});
  };
  const install=()=>{
    if(icons.size)return;
    for(const el of doc.querySelectorAll("symbol[data-ao-refined-lazy]")){
      const id=el.getAttribute("id");
      if(id)icons.set(id,el);
    }
    if(!icons.size)return;
    observer=new MutationObserver(schedule);
    observer.observe(doc.documentElement,{
      childList:true,subtree:true,attributes:true,
      attributeFilter:["href","xlink:href","class","style","hidden"]
    });
    scan();
    doc.addEventListener("pageshow",schedule);
  };
  if(doc.readyState==="loading")doc.addEventListener("DOMContentLoaded",install,{once:true});
  else install();
  globalThis.AO_LAZY_REFINED_ICONS_V1=Object.freeze({
    get registered(){return icons.size;},
    get activated(){return stats.activations;},
    scan,activate,status:()=>Object.freeze({...stats,registered:icons.size})
  });
})();
