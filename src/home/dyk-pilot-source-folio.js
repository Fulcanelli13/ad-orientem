// Read-only, source-owned editorial folio for seven R34 All Souls proposals.
// No public Home import, no second fact corpus, and no publication approval.
const SOURCE_URL=new URL("../../data/research/did-you-know/dyk-r34-high-signal-24-editorial-selection.v1.json",import.meta.url);
const SCHEMA="AO_DYK_R34_HIGH_SIGNAL_24_REVIEW_SELECTION_V1";
const clean=v=>typeof v==="string"?v.trim():"";
const esc=v=>String(v??"").replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]));
const tr=(fr,en,french)=>fr?french:en;
const safeUrl=v=>/^https:\/\/[^<>"'\s]+$/.test(clean(v));

export function dykPilotSourceFolioModel(selection,id,language="en"){
  if(selection?.schema!==SCHEMA||selection.status!=="EDITORIAL_SELECTION_NOT_LIVE"||
     !Array.isArray(selection.records)||selection.records.length!==24||
     !/^DYK-[A-Z0-9-]+$/.test(clean(id)))return null;
  const row=selection.records.find(x=>x.id===id&&x.lane==="all-souls-november-2");
  const c=row?.pilot_home_copy,s=row?.pilot_source_folio;
  if(!row||row.release_authorized!==false||row.editorial_approval!==false||
     c?.review_status!=="PROPOSED_SOURCE_BOUNDED_EDITORIAL_COPY"||
     c?.final_english_signoff!==false||c?.final_french_signoff!==false||
     !clean(c.en)||!clean(c.fr)||!clean(c.scope)||
     s?.source_record_id!==row.source_id||!safeUrl(s.url)||
     s.link_browser_verified!==false||
     !["HISTORICAL_WEISER","ROMAN_RITUS"].includes(s.type))return null;
  const mass=s.type==="ROMAN_RITUS";
  if(mass){
    if(!/^[IVX]+\.\d+$/.test(clean(s.ritus_locator)))return null;
  }else{
    if(!Array.isArray(s.printed_pages)||!s.printed_pages.length||
       !s.printed_pages.every(Number.isInteger)||
       !Array.isArray(s.pdf_pages_1based)||!s.pdf_pages_1based.length||
       !s.pdf_pages_1based.every(Number.isInteger))return null;
  }
  const fr=language==="fr";
  const location=mass?"Ritus servandus, § "+s.ritus_locator:
    tr(fr,"Printed p. ","Page imprimée ")+s.printed_pages.join(", ")+
    tr(fr," · Source PDF p. "," · PDF p. ")+s.pdf_pages_1based.join(", ");
  return Object.freeze({
    id:row.id,language:fr?"fr":"en",fact:c[fr?"fr":"en"],
    sourceTitle:s.title?.[fr?"fr":"en"]||"",sourceUrl:s.url,
    sourceId:row.source_id,sourceLocation:location,
    scope:c.scope,sourceType:s.type,
    reviewOnly:true,readOnly:true,linkedToR34:true
  });
}
const CSS=".aoDykSourceShade{position:fixed;inset:0;z-index:2147483620;background:rgba(0,0,0,.65);display:flex;justify-content:center;align-items:flex-end;padding:0}"+
".aoDykSourceCard{box-sizing:border-box;width:min(680px,100%);max-height:min(88vh,880px);overflow:auto;background:var(--ao-bg-canvas,#0a111a);color:var(--ao-text-primary,#eee5d5);border:1px solid var(--ao-rule,#6c5b49);border-radius:18px 18px 0 0;padding:24px clamp(18px,5vw,32px) 36px;font:16px/1.65 var(--ao-font-body,Georgia,serif)}"+
".aoDykSourceTop{display:flex;justify-content:space-between;gap:18px;align-items:flex-start}"+
".aoDykSourceKicker{display:block;font:600 12px/1.4 system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--ao-text-secondary,#ccb894)}"+
".aoDykSourceCard h2{margin:14px 0;font:500 clamp(22px,5vw,29px)/1.27 var(--ao-font-display,Georgia,serif)}"+
".aoDykSourceCard p{margin:14px 0}.aoDykSourceMain{font:500 clamp(18px,4.4vw,22px)/1.53 var(--ao-font-body,Georgia,serif)}"+
".aoDykSourceSource{border-top:1px solid var(--ao-rule,#6c5b49);margin-top:22px;padding-top:18px}"+
".aoDykSourceMeta{font:13px/1.5 system-ui,sans-serif;color:var(--ao-text-secondary,#ccb894)}"+
".aoDykSourceCard a{color:var(--ao-link,#f0d295);overflow-wrap:anywhere;text-underline-offset:3px}"+
".aoDykSourceCard button{min-width:44px;min-height:44px;border:1px solid var(--ao-rule,#6c5b49);border-radius:8px;background:transparent;color:inherit;cursor:pointer;font-size:22px}"+
".aoDykSourceScope{font:13px/1.5 system-ui,sans-serif;color:var(--ao-text-secondary,#ccb894)}"+
"@media(min-width:720px){.aoDykSourceShade{align-items:center;padding:20px}.aoDykSourceCard{border-radius:18px}}";
export function dykPilotSourceFolioMarkup(model){
  if(!model?.reviewOnly||!model?.linkedToR34||!safeUrl(model.sourceUrl))return "";
  const fr=model.language==="fr";
  return '<style>'+CSS+'</style>'+
    '<div class="aoDykSourceShade" data-dyk-source-shade>'+
    '<article class="aoDykSourceCard" role="dialog" aria-modal="true" aria-labelledby="ao-dyk-source-heading" data-dyk-source-folio="'+esc(model.id)+'">'+
    '<div class="aoDykSourceTop"><span class="aoDykSourceKicker">'+
    esc(tr(fr,"Research preview · Not published","Aperçu de recherche · Non publié"))+
    '</span><button type="button" aria-label="'+esc(tr(fr,"Close source","Fermer la source"))+'" data-dyk-source-close>×</button></div>'+
    '<h2 id="ao-dyk-source-heading">'+esc(tr(fr,"Did you know?","Le saviez-vous ?"))+'</h2>'+
    '<p class="aoDykSourceMain">'+esc(model.fact)+'</p>'+
    '<div class="aoDykSourceSource"><span class="aoDykSourceKicker">'+esc(tr(fr,"Original source","Source originale"))+'</span>'+
    '<p>'+esc(model.sourceTitle)+'</p>'+
    '<p class="aoDykSourceMeta">'+esc(model.sourceLocation)+' · '+esc(model.sourceId)+'</p>'+
    '<p><a href="'+esc(model.sourceUrl)+'" target="_blank" rel="noopener noreferrer" data-dyk-original-source>'+
    esc(tr(fr,"Consult original source","Consulter la source originale"))+'</a></p>'+
    '<p class="aoDykSourceScope">'+esc(tr(fr,
      "Historical or liturgical source context only; not proof of a current or universal custom. The external source link is pending browser verification.",
      "Contexte historique ou liturgique seulement ; ne prouve pas un usage actuel ou universel. Le lien externe reste à vérifier dans le navigateur."))+
    '</p></div></article></div>';
}
export function createDykPilotSourceFolioOwner(win=globalThis,{loadSelection}={}){
  let overlay=null,opener=null,requestId=0;
  const read=loadSelection||(()=>win.fetch(SOURCE_URL).then(r=>{
    if(!r?.ok)throw Error("R34_SELECTION_UNAVAILABLE");
    return r.json();
  }));
  function close(){
    requestId++;
    if(!overlay)return false;
    overlay.remove?.();overlay=null;
    try{opener?.focus?.({preventScroll:true})}catch{opener?.focus?.()}
    opener=null;return true;
  }
  async function open({factId,language="en",trigger=null}={}){
    close();
    const request=++requestId;
    let model=null;
    try{model=dykPilotSourceFolioModel(await Promise.resolve(read()),factId,language)}
    catch{return false}
    if(request!==requestId||!model||!win?.document?.body||typeof win.document.createElement!=="function")return false;
    const node=win.document.createElement("div");
    node.innerHTML=dykPilotSourceFolioMarkup(model);
    const shade=node.querySelector?.("[data-dyk-source-shade]");
    const button=node.querySelector?.("[data-dyk-source-close]");
    const link=node.querySelector?.("[data-dyk-original-source]");
    if(!shade||!button||!link)return false;
    node.addEventListener?.("click",e=>{
      if(e.target===shade||e.target?.closest?.("[data-dyk-source-close]"))close();
    });
    node.addEventListener?.("keydown",e=>{
      if(e.key==="Escape"){e.preventDefault?.();close();return}
      if(e.key!=="Tab")return;
      if(e.shiftKey&&win.document.activeElement===button){e.preventDefault?.();link.focus?.()}
      else if(!e.shiftKey&&win.document.activeElement===link){e.preventDefault?.();button.focus?.()}
    });
    win.document.body.appendChild(node);
    overlay=node;opener=trigger;
    button.focus?.();
    return true;
  }
  function status(){return Object.freeze({reviewOnly:true,visible:Boolean(overlay),canonicalOwner:"R34",published:false})}
  return Object.freeze({open,close,status});
}
