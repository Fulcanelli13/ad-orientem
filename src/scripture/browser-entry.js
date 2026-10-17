import { mountScriptureLibrary } from "./library.js";
import { installScriptureStyles, installScriptureContextStyles } from "./styles.js";
import { loadScriptureBook } from "./pack-loader.js";
import {loadScriptureWitness,hasScriptureWitness} from "./witness-loader.js";
import { parseScriptureContext } from "./context.js";
import {scriptureSegmentContext} from "./segments.js";
export const SCRIPTURE_BROWSER_VERSION="ao-scripture-library-v1";
export function installScriptureBrowserOwner(win=globalThis){
 if(win.AO_SCRIPTURE_APP_V1)return win.AO_SCRIPTURE_APP_V1;
 const doc=win.document;
 installScriptureContextStyles(doc);
 let reader=null,previousFocus=null,previousOverflow=null,onCloseReturn=null,journey=null;
 const loaded=new Map();
 const inflight=new Set();
 function overlay(){
   if(!doc?.createElement)return null;
   let root=doc.getElementById("ao-scripture-overlay");
   if(!root){
     root=doc.createElement("div");
     root.id="ao-scripture-overlay";root.hidden=true;
     root.setAttribute("role","dialog");root.setAttribute("aria-modal","true");
     root.setAttribute("aria-label","Sacred Scripture");
     doc.body?.append(root);
   }
   return root;
 }
 function close(){
   if(!reader||journey)return false;
   reader.destroy();reader=null;
   const node=overlay();if(node)node.hidden=true;
   if(doc.body && previousOverflow!==null)doc.body.style.overflow=previousOverflow;
   previousOverflow=null;
   // A full Home → Pray → Home journey may replace the original Home
   // launcher element. Restore keyboard focus to its current equivalent.
   const focusReturn=previousFocus?.isConnected?previousFocus:
     (win?.AO_APP_SHELL_V1?.getActive?.()==="home"?
       doc.querySelector?.("[data-home-scripture]"):null);
   focusReturn?.focus?.({preventScroll:true});previousFocus=null;
   const restore=onCloseReturn;onCloseReturn=null;
   if(typeof restore==="function")try{restore()}catch(error){win.console?.error?.("Scripture return context failed",error)}
   return true;
 }
 // Verified reciprocal deep links may only begin on Home. Other active
 // parent modules (especially an ongoing Mass or Rosary) remain untouched.
 function canOpenRelatedObject(record){
   if(!reader||!record?.target||!doc?.body)return false;
   // Lazy Bible text loading may repaint the *hidden* reader during a
   // journey. Preserve the original launch button for focus on return.
   if((journey?.surface??win?.AO_APP_SHELL_V1?.getActive?.())!=="home")return false;
   if(!journey&&win?.AO_PRAY_APP_V1?.status?.()?.open===true)return false;
   if(!journey&&win?.AO_MASS_FORMATION_V1?.status?.()?.open===true)return false;
   if(record.target.type==="massFormation")
     return /^MF0[1-8]$/.test(record.target.stageId);
   if(record.target.type==="novena")
     return /^[a-z0-9_]+$/.test(record.target.novenaId);
   if(record.target.type==="rosary")
     return /^(joy|lum|sor|glo)[1-5]$/.test(record.target.mysteryId)&&
       (record.target.bead===undefined||
        (Number.isInteger(record.target.bead)&&record.target.bead>=1&&record.target.bead<=10));
   if(record.target.type==="atlas")
     return /^biblical:(event|passage):[a-z0-9-]+$/.test(record.target.eventKey);
   if(record.target.type==="calendarReading")
     return /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(record.target.date)&&
       ["EPISTLE_OR_LESSON","GOSPEL"].includes(record.target.slot)&&
       typeof record.target.sourcePath==="string"&&!!record.target.sourcePath&&
       typeof record.target.reference==="string"&&!!record.target.reference;
   return false;
 }
 async function openRelatedObject(record){
   if(journey||!canOpenRelatedObject(record))return false;
   const node=overlay(),shell=win.AO_APP_SHELL_V1;
   if(!node||node.hidden)return false;
   const receipt={id:record.id,surface:shell.getActive(),scrollTop:node.scrollTop};
   journey=receipt;
   node.hidden=true;
   if(doc.body)doc.body.style.overflow=previousOverflow??"";
   const reveal=()=>{
     // A shell transition can replace Home's DOM. Keep the original reader
     // subtree owned by the canonical Scripture overlay, not by that route.
     if(!node.isConnected||doc.getElementById("ao-scripture-overlay")!==node){
       doc.getElementById("ao-scripture-overlay")?.remove();
       doc.body?.append(node);
     }
     reader?.resume?.();
     node.hidden=false;
     if(doc.body)doc.body.style.overflow="hidden";
     node.scrollTop=receipt.scrollTop;
     const selector='[data-scripture-open-related-object="'+record.id+'"]';
     const focusExact=()=>{
       const target=node.querySelector?.(selector);
       if(!target)return false;
       target.focus?.({preventScroll:true});
       node.scrollTop=receipt.scrollTop;
       return true;
     };
     // Route owners can schedule post-navigation focus after their own
     // Promise resolves. Reassert the return target on the next render frames,
     // without changing any Scripture reading or module state.
     win.requestAnimationFrame?.(()=>win.requestAnimationFrame?.(focusExact));
     win.setTimeout?.(focusExact,120);
     if(!focusExact()){
       // Related-object records are loaded on demand; the exact button may
       // arrive after we have reattached the Scripture reading subtree.
       node.querySelector?.(".aoScriptureRelated summary")?.focus?.({preventScroll:true});
       if(typeof win.MutationObserver==="function"){
         const observer=new win.MutationObserver(()=>{
           if(focusExact()||!reader||journey)observer.disconnect();
         });
         observer.observe(node,{childList:true,subtree:true});
         win.setTimeout?.(()=>observer.disconnect(),5000);
       }
     }
     return true;
   };
   const restore=async()=>{
     if(journey!==receipt)return false;
     // Do NOT clear the guard until after shell navigation. That navigation
     // may request the Scripture owner to close; a suspended reader must
     // survive and retain the original verse, edition and local trail.
     try{
       if(shell.getActive()!==receipt.surface){
         const returned=await shell.navigate(receipt.surface);
         if(returned?.ok!==true)win.console?.warn?.("Scripture source surface did not reopen");
       }
     }catch(error){win.console?.error?.("Scripture return route failed",error)}
     if(journey!==receipt)return false;
     journey=null;
     return reveal();
   };
   let accepted=false;
   try{
     if(record.target.type==="massFormation"){
       const {createMassFormationRuntime}=await import("../learn/mass-formation.js");
       const owner=win.AO_MASS_FORMATION_V1||
         (win.AO_MASS_FORMATION_V1=createMassFormationRuntime(win,{fetchImpl:win.fetch?.bind(win)}));
       accepted=(await owner.open({stageId:record.target.stageId}))===true;
       if(accepted){
         const frame=doc.getElementById("ao-mass-formation-root");
         if(!frame)accepted=false;
         else{
           // The Mass Formation owner is evolving independently. Capture
           // only source-initiated Back/Close while its exact lesson is open;
           // keep Mass Moments, ordinary Learn and all owner files unchanged.
           const sourceBack=event=>{
             const button=event.target?.closest?.("[data-ao-mf-back],[data-ao-mf-close]");
             if(!button||!frame.contains(button))return;
             event.preventDefault();event.stopImmediatePropagation();
             frame.removeEventListener("click",sourceBack,true);
             owner.close(false);
             void restore();
           };
           frame.addEventListener("click",sourceBack,true);
         }
       }
     }else if(record.target.type==="novena"){
       const nav=await shell.navigate("pray");
       if(nav?.ok===true){
         const result=await win?.AO_MODULES?.open?.("pray.novenas",{
           novenaId:record.target.novenaId,returnContext:null,onCloseReturn:restore
         });
         accepted=result?.ok===true;
       }
     }else if(record.target.type==="rosary"){
       const nav=await shell.navigate("pray");
       if(nav?.ok===true){
         const result=await win?.AO_MODULES?.open?.("pray.rosary",{
           sourceObject:record.target,returnContext:null,onCloseReturn:restore
         });
         accepted=result?.ok===true;
       }
     }else if(record.target.type==="atlas"){
       const nav=await shell.navigate("find");
       if(nav?.ok===true){
         accepted=(await win?.AO_FIND_APP_V1?.openAtlasEvent?.(record.target.eventKey,{
           onCloseReturn:restore
         }))===true;
       }
     }else if(record.target.type==="calendarReading"){
       // Revalidate the selected, source-verified Proper *before* changing
       // surfaces. A stale Bible card cannot open an unrelated Mass.
       const {matchingSelectedCalendarScriptureObject}=await import(
         "../calendar/selected-scripture-objects.js");
       const current=win.AO_RUNTIME_V8?.store?.getState?.();
       if(matchingSelectedCalendarScriptureObject(current,record.target)){
         const nav=await shell.navigate("calendar");
         if(nav?.ok===true){
           accepted=(await win?.AO_CALENDAR_APP_V1?.openSelectedScriptureReading?.(
             record.target,{onCloseReturn:restore}))===true;
         }
       }
     }
   }catch(error){win.console?.error?.("Scripture object navigation failed",error)}
   if(accepted)return true;
   if(journey===receipt){
     journey=null;
     try{if(shell.getActive()!==receipt.surface)await shell.navigate(receipt.surface)}catch{}
     reveal();
   }
   return false;
 }
 function open({passage=null,language=null,context=null,initialDepth="selected",onCloseReturn:restoreOnClose=null}={}){
   const node=overlay();if(!node||journey)return false;
   installScriptureStyles(doc);
   if(!reader){previousFocus=doc.activeElement;previousOverflow=doc.body?.style?.overflow??"";}
   onCloseReturn=typeof restoreOnClose==="function"?restoreOnClose:null;
   reader?.destroy?.();
   const current=language||win.AO_RUNTIME_V8?.store?.getState?.()?.language||"en";
   reader=mountScriptureLibrary(node,{
     passage,context,initialDepth,language:current==="fr"?"fr":"en",storage:win.localStorage,
     records:[...loaded.values()].flat(),
     onClose:close,
     canOpenRelatedObject,
     onOpenRelatedObject:openRelatedObject,
     onNeedBook:async({book,editionId})=>{
       const key=editionId+":"+book;
       if(inflight.has(key))return;
       if(loaded.has(key)){return;}
       inflight.add(key);
       try{
         const records=hasScriptureWitness(editionId,book)
          ?await loadScriptureWitness(editionId,book,{fetcher:win.fetch?.bind(win),cacheStorage:win.caches})
          :await loadScriptureBook(editionId,book,{
           fetcher:win.fetch?.bind(win),cacheStorage:win.caches,cryptoProvider:win.crypto
         });
         loaded.set(key,records);
         if(reader)reader.setRecords([...loaded.values()].flat());
       }catch(error){
         // Unavailable or unapproved translations remain external-link-only.
         if(win?.console?.debug)win.console.debug("Scripture edition is not locally available",error);
       }finally{inflight.delete(key);}
     },
     openExternal:(url)=>win.open?.(url,"_blank","noopener,noreferrer")
   });
   node.hidden=false;
   if(doc.body)doc.body.style.overflow="hidden";
   node.querySelector?.("[data-scripture-close]")?.focus?.();
   return true;
 }
 function openContext(reference,{language=null,depth="selected",onCloseReturn=null}={}){
   const parsed=parseScriptureContext(reference);
   if(!parsed)return false;
   return open({passage:parsed.passage,context:parsed,language,initialDepth:depth==="commentary"?"commentary":"selected",onCloseReturn});
 }
 function openSegments(segments,{language=null,reference=null,provenance=null,liturgicalArrangement=null,onCloseReturn=null}={}){
   try{
     const context=scriptureSegmentContext(segments,{reference,provenance});
     // The shared reader remains in canonical biblical order. A rare 1962
    // liturgical transposition (Ember Saturday Daniel) is explained visibly;
    // this note never changes verse coordinates, editions or source rights.
    if(liturgicalArrangement){
      const a=liturgicalArrangement;
      if(a.schema!=="ao-liturgical-bible-verse-order-v1" ||
         a.canonicalReference!==context.reference ||
         context.reference!=="Daniel 3:47–51" ||
         !Array.isArray(a.liturgicalVerseOrder) ||
         a.liturgicalVerseOrder.join("|")!=="Daniel 3:49|Daniel 3:47–48|Daniel 3:50–51" ||
         typeof a.noteEn!=="string"||typeof a.noteFr!=="string" ||
         a.noteEn.length<80||a.noteFr.length<80)return false;
      return open({passage:context.passage,context:Object.freeze({...context,liturgicalArrangement:a}),language,onCloseReturn});
    }
    return open({passage:context.passage,context,language,onCloseReturn});
   }catch{return false;}
 }
 const click=e=>{
   const capsule=e.target?.closest?.("[data-ao-scripture-context]");
   if(capsule){
     e.preventDefault?.();e.stopImmediatePropagation?.();
     const accepted=openContext(capsule.getAttribute("data-ao-scripture-context"),{depth:capsule.dataset.aoScriptureDepth==="commentary"?"commentary":"selected"});
     if(!accepted){
       const error=doc.createElement("span");
       error.setAttribute("role","alert");error.className="aoScriptureContextError";
       error.textContent=win.AO_RUNTIME_V8?.store?.getState?.()?.language==="fr"
         ?"Référence biblique non reconnue. Utilisez le lien de la source."
         :"Unrecognised Bible reference. Use the original source link.";
       capsule.parentElement?.querySelector?.(".aoScriptureContextError")?.remove();
       capsule.insertAdjacentElement("afterend",error);
     }
     return;
   }
   const button=e.target?.closest?.("[data-home-scripture]");
   if(!button)return;
   e.preventDefault?.();e.stopPropagation?.();open();
 };
 const key=e=>{
   if(!reader||journey)return;
   if(e.key==="Escape"){e.preventDefault?.();e.stopPropagation?.();close();return;}
   if(e.key!=="Tab")return;
   const node=overlay();
   const focusables=[...(node?.querySelectorAll?.("button:not([disabled]),input:not([disabled]),select:not([disabled]),a[href]")||[])]
     .filter(el=>!el.closest?.("details:not([open])") && el.getClientRects?.().length);
   if(!focusables.length)return;
   const first=focusables[0],last=focusables[focusables.length-1];
   if(e.shiftKey && (doc.activeElement===first||!node.contains(doc.activeElement))){e.preventDefault();last.focus();}
   else if(!e.shiftKey && (doc.activeElement===last||!node.contains(doc.activeElement))){e.preventDefault();first.focus();}
 };
 doc?.addEventListener?.("click",click,true);
 doc?.addEventListener?.("keydown",key);
 const api=Object.freeze({version:SCRIPTURE_BROWSER_VERSION,open,openContext,openSegments,close,
   status:()=>Object.freeze({installed:true,open:Boolean(reader&&!journey),suspended:Boolean(journey),reader:reader?.status?.()??null})});
 win.AO_SCRIPTURE_APP_V1=api;
 win.AO_SCRIPTURE_CONTEXT_V1=Object.freeze({version:"scripture-context-v1",open:openContext,openSegments,parse:parseScriptureContext});
 return api;
}
if(typeof window!=="undefined"&&typeof document!=="undefined")installScriptureBrowserOwner(window);
