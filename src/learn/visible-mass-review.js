/**
 * The Visible Mass — gated Learn integration.
 *
 * Reuses the original sourced sanctuary pilot in an isolated same-origin
 * document, preserving its 97 draft answer IDs, six real-photo hotspots and
 * independent photograph citations. No new doctrinal, ritual or glossary
 * owner is created. This review module is NOT a public Formation release.
 */
import {visibleMassReviewEnabled,VISIBLE_MASS_REVIEW_ROUTE} from "./visible-mass-review-gate.js";
const VERSION="visible-mass-canonical-learn-review-v1";
const ROOT="ao-visible-mass-review-root";
const PHOTO_URL=new URL("../../previews/visible-mass-3d/sanctuary-hotspot-pilot.html",import.meta.url);
const EXPLORER_ROUTE="learn.mass_explorer";
const GUIDE_PATTERN=/^AO\.CARD\.(?:010|015|024|025)$/;
export function createVisibleMassReviewRuntime(win=globalThis){
 let returnFocus=null;
 const root=()=>win?.document?.getElementById?.(ROOT)??null;
 function close(){
   const node=root();
   try{if(node?.contains?.(win.document.activeElement))win.document.activeElement?.blur?.();}catch{}
   node?.remove?.();
   win?.document?.body?.classList?.remove?.("aoVisibleMassReviewOpen");
   try{returnFocus?.focus?.({preventScroll:true});}catch{}
   returnFocus=null;
   return true;
 }
 function ensureRoot(){
   const doc=win?.document;
   if(!doc?.body)return null;
   const previous=root();if(previous)return previous;
   const node=doc.createElement("section");
   node.id=ROOT;
   node.setAttribute("role","region");
   node.setAttribute("aria-label","The Visible Mass · research preview");
   node.dataset.aoVisibleMassOwner=VERSION;
   const style=doc.createElement("style");
   style.textContent=`
#${ROOT}{position:fixed;inset:0 0 calc(var(--ao-global-ribbon-h,68px) + var(--safe-bottom,0px)) 0;z-index:14960;display:flex;flex-direction:column;background:var(--ao-bg-canvas,#080c12);color:var(--ao-text-primary,#e9e4d9);font-family:var(--ao-font-body,Georgia,serif)}
#${ROOT}[hidden]{display:none!important}#${ROOT} *{box-sizing:border-box}
#${ROOT} .vmrTop{display:grid;grid-template-columns:44px minmax(0,1fr) 44px;gap:10px;align-items:center;padding:calc(7px + var(--safe-top,0px)) 12px 9px;background:var(--ao-bg-canvas,#080c12);border-bottom:1px solid var(--ao-rule,rgba(255,255,255,.15))}
#${ROOT} .vmrTop button{width:44px;height:44px;border:1px solid var(--ao-rule,rgba(255,255,255,.18));border-radius:50%;background:var(--ao-surface-1,#101821);color:inherit;font:20px/1 Georgia,serif}
#${ROOT} .vmrHeading{text-align:center;min-width:0}#${ROOT} .vmrHeading small{display:block;color:var(--liturgical,#c9ad78);font:600 10px/1.2 system-ui,sans-serif;letter-spacing:.11em}#${ROOT} .vmrHeading strong{font:600 16px/1.25 Georgia,serif}
#${ROOT} .vmrDisclaimer{margin:0;padding:6px 12px;color:var(--ao-text-muted,#aeb5be);font:11px/1.5 system-ui,sans-serif;text-align:center}
#${ROOT} iframe{display:block;width:100%;min-height:0;flex:1;border:0;background:#080c12}
#${ROOT} :is(button,iframe):focus-visible{outline:2px solid var(--liturgical,#c9ad78);outline-offset:2px}
`;
   node.append(style);
   const top=doc.createElement("header");top.className="vmrTop";
   const back=doc.createElement("button");
   back.type="button";back.textContent="←";
   back.setAttribute("aria-label","Return to Formation");
   back.onclick=()=>close();
   const title=doc.createElement("div");title.className="vmrHeading";
   const kicker=doc.createElement("small");kicker.textContent="AD ORIENTEM · RESEARCH";
   const heading=doc.createElement("strong");heading.textContent="The Visible Mass";
   title.append(kicker,heading);
   const empty=doc.createElement("span");
   top.append(back,title,empty);
   const disclaimer=doc.createElement("p");disclaimer.className="vmrDisclaimer";
   disclaimer.textContent="Experimental church photograph · English-only research drafts · not approved teaching or normative rubrics";
   const frame=doc.createElement("iframe");
   frame.title="Visible Mass · original six-hotspot photographic research viewer";
   frame.setAttribute("referrerpolicy","strict-origin-when-cross-origin");
   frame.src=PHOTO_URL.href;
   frame.addEventListener("load",()=>{
     try{
       const child=frame.contentWindow;
       if(!child||child.location.origin!==win.location.origin)
         throw Error("Visible Mass requires same-origin app resources");
       // Narrow, same-origin bridge: the child may ONLY open the existing
       // published Mass Explorer at four previously researched Guide IDs.
       // Never hand it the parent registry, Mass engine or reader state.
       child.AO_MODULES=Object.freeze({open:async(route,options={})=>{
         if(route!==EXPLORER_ROUTE||!GUIDE_PATTERN.test(options.momentKey))
           return {ok:false,error:"UNAPPROVED_MASS_CONTEXT"};
         if(!visibleMassReviewEnabled(win)||!root())
           return {ok:false,error:"REVIEW_NOT_ACTIVE"};
         if(typeof win?.AO_MODULES?.open!=="function")
           return {ok:false,error:"CANONICAL_EXPLORER_UNAVAILABLE"};
         return win.AO_MODULES.open(EXPLORER_ROUTE,{
           momentKey:options.momentKey,
           trigger:options.trigger
         });
       }});
     }catch(error){
       disclaimer.textContent="Research-only photographic viewer · native Mass Explorer handoff unavailable in this environment";
       win?.console?.warn?.("Visible Mass same-origin research bridge unavailable",error);
     }
   });
   node.append(top,disclaimer,frame);
   doc.body.append(node);
   return node;
 }
 function open({trigger}={}){
   if(!visibleMassReviewEnabled(win))return false;
   if(!win?.document?.body)return false;
   returnFocus=trigger??win?.document?.activeElement??null;
   const node=ensureRoot();
   if(!node)return false;
   node.hidden=false;
   win.document.body.classList.add("aoVisibleMassReviewOpen");
   return true;
 }
 const status=()=>Object.freeze({installed:true,open:Boolean(root()&&!root().hidden),version:VERSION,
   researchOnly:true,publicRoute:false,originalSceneAsset:"BROMPTON_ALTAR_2019_B",
   researchAnswersPublished:false,ownsRitualEngine:false});
 return Object.freeze({open,close,status});
}
export function installVisibleMassReviewModule(win=globalThis){
 if(!visibleMassReviewEnabled(win))return false;
 if(win?.AO_VISIBLE_MASS_REVIEW_V1)return win.AO_VISIBLE_MASS_REVIEW_V1;
 const owner=createVisibleMassReviewRuntime(win);
 win.AO_VISIBLE_MASS_REVIEW_V1=owner;
 const base=win.AO_MODULES;
 if(!base||base.__aoVisibleMassReviewV1)return owner;
 const definition=Object.freeze({id:VISIBLE_MASS_REVIEW_ROUTE,type:"module",domain:"learn",category:"research-preview",title:"The Visible Mass · research preview"});
 const wrapper={...base,__aoVisibleMassReviewV1:true,
   get(id){return id===VISIBLE_MASS_REVIEW_ROUTE?definition:base.get?.(id)||null;},
   resolve(id){return id===VISIBLE_MASS_REVIEW_ROUTE?{ok:true,input:id,id,defaults:{},chain:[id],definition}:base.resolve?.(id);},
   async open(id,opts={}){
     if(id===VISIBLE_MASS_REVIEW_ROUTE)return {ok:owner.open(opts),canonicalId:id,type:"module",domain:"learn"};
     return base.open?.(id,opts);
   },
   list(filter={}){
     const prior=[...(base.list?.(filter)||[])].filter(x=>x?.id!==VISIBLE_MASS_REVIEW_ROUTE);
     if((!filter.type||filter.type==="module")&&(!filter.domain||filter.domain==="learn"))prior.push(definition);
     return prior;
   }
 };
 win.AO_MODULES=wrapper;
 win.AO_MODULE_REGISTRY_V36=wrapper;
 return owner;
}
