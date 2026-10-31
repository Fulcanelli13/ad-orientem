// One canonical R34 source owner for H7 Home's future released discoveries.
// No second bank and no public facts until BOTH global and per-fact gates pass.
const SOURCE=new URL("../../data/research/did-you-know/dyk-r34-high-signal-24-editorial-selection.v1.json",import.meta.url);
const SCHEMA="AO_DYK_R34_HIGH_SIGNAL_24_REVIEW_SELECTION_V1";
const safeUrl=value=>typeof value==="string"&&/^https:\/\/[^<>"'\s]+$/.test(value);
const clean=x=>typeof x==="string"?x.trim():"";
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const validDate=x=>/^\d{4}-\d{2}-\d{2}$/.test(x||"")&&!Number.isNaN(Date.parse(x+"T12:00:00Z"));
let selectionPromise=null;
export function loadDykPrioritySelection(win=globalThis){
 if(selectionPromise)return selectionPromise;
 selectionPromise=Promise.resolve().then(()=>win.fetch(SOURCE,{cache:"no-store"})).then(r=>{
   if(!r?.ok)throw Error("DYK_PRIORITY_UNAVAILABLE");return r.json();
 }).catch(e=>{selectionPromise=null;throw e});
 return selectionPromise;
}
export function dykPublishedCandidates(data,date){
 if(data?.schema!==SCHEMA||data.publication_stage!=="APPROVED_PARTIAL_LIVE"||
    !Array.isArray(data.records)||data.records.length!==24||!validDate(date))return [];
 const published=data.records.filter(row=>{
   const c=row.pilot_home_copy||row.editorial_review_copy;
   const s=row.pilot_source_folio||row.editorial_source_reference;
   const dest=row.pilot_destination_audit||row.editorial_destination_audit;
   const screen=row.priority_lexical_screen;
   const pages=s?.pdf_pages_1based;
   return /^DYK-[A-Z0-9-]+$/.test(row.id||"")&&
      row.editorial_approval===true&&row.release_authorized===true&&
      c?.final_english_signoff===true&&c?.final_french_signoff===true&&
      screen?.manual_semantic_novelty_approved===true&&
      screen.exact_english_collision_count===0&&screen.exact_french_collision_count===0&&
      screen.exact_source_id_collision_count===0&&
      Array.isArray(row.publication_days)&&row.publication_days.includes(date)&&
      row.publication_days.every(validDate)&&
      ((row.pilot_home_copy&&dest?.publishable_deep_link===true&&
          dest.exact_in_app_route_verified===true)||
       (row.editorial_review_copy&&dest?.publishable===true&&
          dest.verified_in_app===true));
 }).filter(row=>{
   const s=row.pilot_source_folio||row.editorial_source_reference;
   if(!s)return false;
   const url=s.url||s.source_url;
   const pages=s.pdf_pages_1based;
   return safeUrl(url)&&s.source_record_id===row.source_id&&
     Array.isArray(pages)&&pages.length>0&&pages.every(n=>Number.isInteger(n)&&n>=1&&n<=5000)&&
     (s.link_browser_verified===true||s.browser_deep_link_checked===true);
 });
 // At most twelve candidates per selected liturgical date; stable ID order.
 return published.sort((a,b)=>a.id.localeCompare(b.id)).slice(0,12);
}
export function dykPublishedPick(data,date){
 const facts=dykPublishedCandidates(data,date);
 if(!facts.length)return null;
 const day=Math.floor(Date.parse(date+"T12:00:00Z")/86400000);
 return facts[((day%facts.length)+facts.length)%facts.length];
}
export function dykPublishedModel(data,id,date,language="en"){
 const row=dykPublishedCandidates(data,date).find(r=>r.id===id);
 if(!row)return null;
 const c=row.pilot_home_copy||row.editorial_review_copy;
 const s=row.pilot_source_folio||row.editorial_source_reference;
 const fr=language==="fr",url=s.url||s.source_url;
 const isCanon=row.source_family==="ROMAN_MASS_1962"||s.type==="ROMAN_RITUS";
 const label=isCanon?(fr?"Canon romain · Ritus servandus":"Roman Canon · Ritus servandus"):
   row.source_family==="PITRE_1900"?(fr?"Pitrè · Coutumes historiques":"Pitrè · Historical customs"):
   (fr?"Weiser · Coutumes historiques":"Weiser · Historical customs");
 return Object.freeze({id:row.id,language:fr?"fr":"en",fact:c[fr?"fr":"en"],
   label,sourceId:row.source_id,sourceUrl:url,
   links:s.pdf_pages_1based.map(page=>({page,url:url+"#page="+page})),published:true});
}
const STYLE='.aoDykPublishedShade{position:fixed;inset:0;z-index:2147483620;background:#000b;display:flex;justify-content:center;align-items:flex-end}'+
'.aoDykPublishedCard{box-sizing:border-box;width:min(680px,100%);max-height:90vh;overflow:auto;padding:24px 22px 36px;border-radius:16px 16px 0 0;background:var(--ao-bg-canvas,#0a111a);color:var(--ao-text-primary,#eee5d5);border:1px solid var(--ao-rule,#71654f);font:16px/1.65 var(--ao-font-body,Georgia,serif)}'+
'.aoDykPublishedCard h2{margin:12px 0;font:500 24px/1.3 var(--ao-font-display,Georgia,serif)}'+
'.aoDykPublishedCard a{display:inline-block;min-height:44px;padding:6px 0;color:var(--ao-link,#f0d295);overflow-wrap:anywhere}'+
'.aoDykPublishedCard button{float:right;min-width:44px;min-height:44px;border:1px solid currentColor;background:transparent;color:inherit;border-radius:8px;font-size:22px}'+
'@media(min-width:720px){.aoDykPublishedShade{align-items:center;padding:20px}.aoDykPublishedCard{border-radius:16px}}';
export function dykPublishedMarkup(model){
 if(!model?.published||!safeUrl(model.sourceUrl)||!Array.isArray(model.links)||!model.links.length||
   model.links.some(x=>!Number.isInteger(x.page)||x.page<1||x.page>5000||
      x.url!==model.sourceUrl+"#page="+x.page))return "";
 const fr=model.language==="fr";
 return '<style>'+STYLE+'</style><div class="aoDykPublishedShade" data-dyk-published-shade>'+
   '<article class="aoDykPublishedCard" role="dialog" aria-modal="true" aria-labelledby="ao-dyk-published-title" data-dyk-published="'+esc(model.id)+'">'+
   '<button type="button" data-dyk-published-close aria-label="'+(fr?"Fermer":"Close")+'">×</button>'+
   '<small>'+esc(model.label)+'</small><h2 id="ao-dyk-published-title">'+
   (fr?"Le saviez-vous ?":"Did you know?")+'</h2><p>'+esc(model.fact)+'</p>'+
   '<p>'+esc(fr?"Source originale":"Original source")+' · '+esc(model.sourceId)+'</p>'+
   model.links.map((x,i)=>'<p><a href="'+esc(x.url)+'" target="_blank" rel="noopener noreferrer">'+
     esc((fr?"Consulter la source, PDF p. ":"Read source, PDF p. ")+x.page)+'</a></p>').join("")+
   '<small>'+esc(fr?"Contexte historique ou rubrique de 1962 selon la source citée.":"Historical context or 1962 rubric, as identified in the cited source.")+'</small>'+
   '</article></div>';
}
export async function openDykPublishedSource(win,{id,date,language="en",trigger}={}){
 if(!win?.document?.createElement||!id||!validDate(date))return false;
 let data;try{data=await loadDykPrioritySelection(win)}catch{return false}
 const model=dykPublishedModel(data,id,date,language);
 if(!model)return false;
 const node=win.document.createElement("div");node.innerHTML=dykPublishedMarkup(model);
 const shade=node.querySelector("[data-dyk-published-shade]");
 const close=()=>{node.remove();try{trigger?.focus?.({preventScroll:true})}catch{trigger?.focus?.()}};
 if(!shade)return false;
 node.addEventListener("click",event=>{
   if(event.target===shade||event.target?.closest?.("[data-dyk-published-close]"))close();
 });
 node.addEventListener("keydown",event=>{
   if(event.key==="Escape"){event.preventDefault?.();close();return}
   if(event.key!=="Tab")return;
   const items=[...node.querySelectorAll('button,a')];
   if(!items.length)return;
   if(event.shiftKey&&win.document.activeElement===items[0]){event.preventDefault?.();items.at(-1).focus()}
   else if(!event.shiftKey&&win.document.activeElement===items.at(-1)){event.preventDefault?.();items[0].focus()}
 });
 win.document.body.appendChild(node);
 node.querySelector("[data-dyk-published-close]")?.focus?.();
 return true;
}
