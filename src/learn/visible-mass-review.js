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
 let returnFocus=null,askIntegration=null,askLoading=false,askReturnButton=null,characterFolio=null,characterLoading=false;
 const askReviewEnabled=()=>{
  const params=new URLSearchParams(win?.location?.search||"");
  return visibleMassReviewEnabled(win)&&params.get("aoLivingChurchReview")==="1";
 };
 const characterReviewEnabled=()=>askReviewEnabled()&&new URLSearchParams(win?.location?.search||'').get('aoLivingChurchCharacters')==='1';
 const root=()=>win?.document?.getElementById?.(ROOT)??null;
 function close(){
   if(askIntegration?.status?.()?.suspended)return false;
   characterFolio?.close?.();characterFolio=null;
   askIntegration?.close?.();askIntegration=null;
   askReturnButton?.remove?.();askReturnButton=null;
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
#${ROOT} .vmrTop{display:grid;grid-template-columns:44px minmax(0,1fr) 44px 44px;gap:10px;align-items:center;padding:calc(7px + var(--safe-top,0px)) 12px 9px;background:var(--ao-bg-canvas,#080c12);border-bottom:1px solid var(--ao-rule,rgba(255,255,255,.15))}
#${ROOT} .vmrTop button{width:44px;height:44px;border:1px solid var(--ao-rule,rgba(255,255,255,.18));border-radius:50%;background:var(--ao-surface-1,#101821);color:inherit;font:20px/1 Georgia,serif}
#${ROOT} .vmrHeading{text-align:center;min-width:0}#${ROOT} .vmrHeading small{display:block;color:var(--liturgical,#c9ad78);font:600 10px/1.2 system-ui,sans-serif;letter-spacing:.11em}#${ROOT} .vmrHeading strong{font:600 16px/1.25 Georgia,serif}
#${ROOT} .vmrDisclaimer{margin:0;padding:6px 12px;color:var(--ao-text-muted,#aeb5be);font:11px/1.5 system-ui,sans-serif;text-align:center}
#${ROOT} iframe{display:block;width:100%;min-height:0;flex:1;border:0;background:#080c12}
#${ROOT} :is(button,iframe):focus-visible{outline:2px solid var(--liturgical,#c9ad78);outline-offset:2px}
#aoLivingChurchReturnSanctuary{position:fixed;bottom:calc(var(--ao-global-ribbon-h,68px) + var(--safe-bottom,0px) + 18px);right:18px;z-index:calc(var(--ao-z-global-nav,2147483300) + 4);border:1px solid #b39d79;border-radius:24px;padding:12px 16px;background:#0d1822;color:#efe4d0;font:14px Georgia,serif;box-shadow:0 4px 24px #0008;cursor:pointer}
#aoLivingChurchReturnSanctuary[hidden]{display:none!important}
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
   const askButton=doc.createElement("button");
   askButton.type="button";askButton.textContent="?";
   askButton.setAttribute("aria-label","Ask the Church from the selected sanctuary object");
   askButton.title="Ask the Church";
   // When character review is active, the visual-novel folio is the one
   // conversational surface. The original Ask preview remains for P2-only
   // research sessions but never runs as a competing UI here.
   if(!askReviewEnabled()||characterReviewEnabled()){askButton.hidden=true;askButton.disabled=true;}
   const charactersButton=doc.createElement('button');
   charactersButton.type='button';charactersButton.textContent='✠';
   charactersButton.setAttribute('aria-label','Talk with the three guides');
   charactersButton.title='The Sacristan · Monsieur le Chanoine · St Pius X';
   if(!characterReviewEnabled()){charactersButton.hidden=true;charactersButton.disabled=true;}
   top.append(back,title,charactersButton,askButton);
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
   if(askReviewEnabled()){
    let restoreCatechismLayout=null;
    const onNativeOpen=({routeId}={})=>{
     if(routeId==="learn.catechism"){
      const original=doc.getElementById("ao-cate-root");
      if(original){
       const inline=original.getAttribute("style");
       restoreCatechismLayout=()=>{
        if(inline===null)original.removeAttribute("style");
        else original.setAttribute("style",inline);
       };
       // The canonical Catechism owns this DOM, but normally mounts in the
       // document flow. Within the full-screen photographic reviewer it
       // would remain >3,000px below the viewport. Temporary visual staging
       // keeps its original text/controller and does NOT clone its content.
       Object.assign(original.style,{
        position:"fixed",inset:"0 0 calc(var(--ao-global-ribbon-h,68px) + var(--safe-bottom,0px)) 0",
        zIndex:"15010",overflowY:"auto",overscrollBehavior:"contain",
        background:"#080c12",color:"#eee7dc",margin:"0",
        boxSizing:"border-box",width:"auto",maxWidth:"100%",
        overflowX:"hidden",overflowWrap:"break-word",lineHeight:"1.5",
        padding:"clamp(12px,2vw,24px) clamp(12px,3vw,36px) 28px"
       });
      }
     }
     node.style.visibility="hidden";
    };
    const onNativeReturn=()=>{
     try{restoreCatechismLayout?.();}finally{restoreCatechismLayout=null;node.style.visibility="";}
    };
    askReturnButton=doc.createElement("button");
    askReturnButton.type="button";
    askReturnButton.id="aoLivingChurchReturnSanctuary";
    askReturnButton.textContent="Return to the church";
    askReturnButton.setAttribute("aria-label","Return to the original church photograph");
    askReturnButton.hidden=true;
    askReturnButton.onclick=async()=>{
     if(!askIntegration)return;
     askReturnButton.disabled=true;
     try{
      const result=await askIntegration.returnToSanctuary();
      if(!result.ok)disclaimer.textContent="Sanctuary return not verified: "+result.code;
      else characterFolio?.show?.();
     }finally{askReturnButton.disabled=false;}
    };
    doc.body.append(askReturnButton);
    askButton.onclick=async()=>{
     if(askLoading)return;
     askLoading=true;askButton.disabled=true;
     try{
      characterFolio?.hide?.();
      if(!askIntegration){
       const mod=await import("./living-church-ask-integration.js");
       const response=await win.fetch(new URL("../../data/learn/ask-church-app-route-survey.v1.json",import.meta.url));
       if(!response.ok)throw Error("Original Ask the Church survey unavailable");
       askIntegration=mod.createLivingChurchAskIntegration(win,{
        frame,returnButton:askReturnButton,survey:await response.json(),
        onNativeOpen,onNativeReturn
       });
      }
      const verdict=await askIntegration.openGuide();
      if(!verdict.ok)disclaimer.textContent=verdict.code==="SELECT_ORIGINAL_SANCTUARY_OBJECT_FIRST"
       ?"Select one of the original six photographed objects before starting the guide."
       :"The research guide cannot open: "+verdict.code;
     }catch(error){
      disclaimer.textContent="The Living Church research connection is unavailable.";
      win?.console?.warn?.("Ask the Church source-owner connection failed",error);
     }finally{askLoading=false;askButton.disabled=false;}
    };
    if(characterReviewEnabled()){
     charactersButton.onclick=async()=>{
      if(characterLoading)return;
      characterLoading=true;charactersButton.disabled=true;
      try{
       let survey;
       if(!askIntegration){
        const mod=await import('./living-church-ask-integration.js');
        const response=await win.fetch(new URL('../../data/learn/ask-church-app-route-survey.v1.json',import.meta.url));
        if(!response.ok)throw Error('Original Ask route registry unavailable');
        survey=await response.json();
        askIntegration=mod.createLivingChurchAskIntegration(win,{frame,returnButton:askReturnButton,survey,
         onNativeOpen,onNativeReturn});
       }
       askIntegration.hideGuide?.();
       if(!characterFolio){
        if(!survey){
         const response=await win.fetch(new URL('../../data/learn/ask-church-app-route-survey.v1.json',import.meta.url));
         if(!response.ok)throw Error('Original Ask route registry unavailable');
         survey=await response.json();
        }
        const mod=await import('./living-church-character-folio.js');
        characterFolio=await mod.mountLivingChurchCharacterFolio(win,{host:node,frame,integration:askIntegration,survey});
       }else if(!characterFolio.show())throw Error('Original selected photo is not source-verified');
       disclaimer.textContent='Three-guide review · original source records only · no historical speech attributed';
      }catch(error){
       disclaimer.textContent='Select an original photograph object before opening the three guides.';
       win?.console?.warn?.('Living Church character stage unavailable',error);
      }finally{characterLoading=false;charactersButton.disabled=false;}
     };
    }
   }
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
   researchAnswersPublished:false,ownsRitualEngine:false,
   singleConversationSurface:characterReviewEnabled()?"three-character-folio":"original-ask",
   canonicalObjectiveSessionCount:askIntegration?.status?.().objectiveSessionCount||0,
   objective:askIntegration?.status?.().objective||null,
   folioObjective:characterFolio?.status?.().objective||null});
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
