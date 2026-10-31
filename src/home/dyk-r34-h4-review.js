// Explicit, reversible H7 QA entrypoint for the unpublished R34 seven-card review.
// This module never runs without ?aoDykR34Review=1. Ordinary H7 Home
// continues showing its six source-backed Glossary discoveries unchanged.
import {dykPilotSourceFolioModel,createDykPilotSourceFolioOwner} from "./dyk-pilot-source-folio.js";
const SOURCE=new URL("../../data/research/did-you-know/dyk-r34-high-signal-24-editorial-selection.v1.json",import.meta.url);
const htmlSafe=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let load=null;
let owner=null;
export function h4DykReviewEnabled(win=globalThis){
  try{return new URLSearchParams(win?.location?.search||"").get("aoDykR34Review")==="1"}
  catch{return false}
}
// A direct QA link must resolve to one of the seven source-verified IDs.
// The fact parameter alone is NEVER a route or publication authorization.
export function h7DykReviewDirectFact(win,data){
  if(!h4DykReviewEnabled(win)||data?.status!=="EDITORIAL_SELECTION_NOT_LIVE")return null;
  let id=null;
  try{id=new URLSearchParams(win?.location?.search||"").get("aoDykFact")}catch{return null}
  if(!id||!Array.isArray(data.records))return null;
  return data.records.some(x=>x.id===id&&x.lane==="all-souls-november-2"&&
    Boolean(dykPilotSourceFolioModel(data,id,"en"))&&
    Boolean(dykPilotSourceFolioModel(data,id,"fr")))?id:null;
}
function read(win){
  if(load)return load;
  load=Promise.resolve().then(async()=>{
    const response=await win.fetch(SOURCE,{cache:"no-store"});
    if(!response?.ok)throw Error("R34_PREVIEW_SOURCE_UNAVAILABLE");
    const data=await response.json();
    const rows=data?.records?.filter(x=>x.lane==="all-souls-november-2");
    if(data?.schema!=="AO_DYK_R34_HIGH_SIGNAL_24_REVIEW_SELECTION_V1"||
       data?.status!=="EDITORIAL_SELECTION_NOT_LIVE"||rows?.length!==7||
       rows.some(x=>!dykPilotSourceFolioModel(data,x.id,"en")||
                    !dykPilotSourceFolioModel(data,x.id,"fr")))throw Error("R34_REVIEW_NOT_SOURCE_VERIFIED");
    return data;
  }).catch(error=>{load=null;throw error});
  return load;
}
export function h4DykReviewMarkup(data,language="en"){
  const fr=language==="fr";
  if(data?.status!=="EDITORIAL_SELECTION_NOT_LIVE"||
     !Array.isArray(data.records)||data.records.length!==24)return "";
  const rows=data.records.filter(x=>x.lane==="all-souls-november-2");
  if(rows.length!==7||rows.some(x=>!dykPilotSourceFolioModel(data,x.id,language)))return "";
  const buttons=rows.map(x=>{
    const fact=x.pilot_home_copy[fr?"fr":"en"];
    return '<button type="button" data-dyk-r34-source="'+htmlSafe(x.id)+'" class="aoDykR34PreviewButton">'+
      '<span>'+htmlSafe(x.id)+'</span><strong>'+htmlSafe(fact)+'</strong></button>';
  }).join("");
  return '<style>.aoDykR34Preview{margin:14px 0 24px;border:1px dashed #d1a868;border-radius:12px;'+
    'padding:14px;background:rgba(120,85,45,.12);color:var(--ao-text-primary,#eee5d5)}'+
    '.aoDykR34Preview h2{margin:0 0 8px;font:600 14px/1.4 system-ui,sans-serif}'+
    '.aoDykR34Preview p{margin:0 0 12px;font:13px/1.45 system-ui,sans-serif;opacity:.85}'+
    '.aoDykR34PreviewButton{display:flex;flex-direction:column;gap:5px;text-align:left;'+
    'width:100%;min-height:44px;margin:8px 0;padding:10px 12px;border:1px solid #71654f;'+
    'border-radius:8px;background:transparent;color:inherit;cursor:pointer}'+
    '.aoDykR34PreviewButton span{font:11px/1.35 system-ui,sans-serif;opacity:.68}'+
    '.aoDykR34PreviewButton strong{font:500 15px/1.48 var(--ao-font-body,Georgia,serif)}'+
    '</style><section class="aoDykR34Preview" data-dyk-r34-review aria-label="'+
    htmlSafe(fr?"Aperçu privé des découvertes":"Unpublished discovery review")+'">'+
    '<h2>'+htmlSafe(fr?"QA éditoriale · Non publié":"Editorial QA · Not published")+'</h2>'+
    '<p>'+htmlSafe(fr?
      "Sept propositions documentées pour le 2 novembre. Cette liste est visible uniquement avec le paramètre de vérification. Aucune publication autorisée.":
      "Seven source-backed November 2 proposals. Visible only through the explicit review URL. No publication authorized.")+
    '</p>'+buttons+'</section>';
}
export async function mountH4DykReview(win=globalThis){
  if(!h4DykReviewEnabled(win))return false;
  const host=win?.document?.querySelector?.(".homeScreen.aoTodayH4");
  const anchor=host?.querySelector?.(".aoH4DiscoveryStandalone");
  if(!host||!anchor||!host.isConnected)return false;
  if(host.querySelector("[data-dyk-r34-review]"))return true;
  try{
    const data=await read(win);
    if(!host.isConnected||!anchor.isConnected||host.querySelector("[data-dyk-r34-review]"))return false;
    const language=host.dataset?.homeLanguage==="fr"?"fr":"en";
    const markup=h4DykReviewMarkup(data,language);
    if(!markup)return false;
    const node=win.document.createElement("div");
    node.innerHTML=markup;
    const panel=node.querySelector("[data-dyk-r34-review]");
    const style=node.querySelector("style");
    if(!panel||!style)return false;
    // The QA stylesheet must be attached with the panel, never left behind
    // in the temporary parsing container or installed in ordinary Home.
    panel.prepend(style);
    if(!owner)owner=createDykPilotSourceFolioOwner(win,{loadSelection:()=>data});
    panel.addEventListener("click",event=>{
      const button=event.target?.closest?.("[data-dyk-r34-source]");
      const id=button?.dataset?.dykR34Source;
      if(!id)return;
      event.preventDefault?.();
      void owner.open({factId:id,language:host.dataset?.homeLanguage==="fr"?"fr":"en",trigger:button});
    });
    anchor.after(panel);
    const directId=h7DykReviewDirectFact(win,data);
    if(directId){
      const button=[...panel.querySelectorAll("[data-dyk-r34-source]")]
        .find(el=>el.dataset?.dykR34Source===directId);
      if(button)await owner.open({factId:directId,language,trigger:button});
    }
    return true;
  }catch(error){
    try{win?.console?.error?.("Unpublished R34 preview failed closed",error)}catch{}
    return false;
  }
}
