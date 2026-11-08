// One canonical R34 source owner for H7 Home's future released discoveries.
// No second bank and no public facts until BOTH global and per-fact gates pass.
const SOURCE=new URL("../../data/research/did-you-know/dyk-r34-high-signal-24-editorial-selection.v1.json",import.meta.url);
const SCHEMA="AO_DYK_R34_HIGH_SIGNAL_24_REVIEW_SELECTION_V1";
const safeUrl=value=>typeof value==="string"&&/^https:\/\/[^<>"'\s]+$/.test(value);
const clean=x=>typeof x==="string"?x.trim():"";
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const validDate=x=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(x||""))return false;const date=new Date(x+"T12:00:00Z");return !Number.isNaN(date.getTime())&&date.toISOString().slice(0,10)===x;};
// Stable per-day shuffle across the *combined* published and Glossary pool.
// No browser storage, tracking, paid runtime, or unreviewed research publication.
export const DYK_GLOSSARY_FALLBACK_IDS=Object.freeze(["G195","G213","G219","G235","G194","G240","G197","G200","G203","G212","G215","G216","G218","G224","G241","G242","G248","G255","G259","G260","G274","G283","G290","G300"]);
function shuffledHomeIds(ids,cycle){
 const ordered=[...new Set(ids)].sort();
 let state=2166136261;
 for(const ch of cycle+"|"+ordered.join("|")){state=Math.imul(state^ch.charCodeAt(0),16777619)}
 state=(state>>>0)||1;
 const random=()=>{
   state^=state<<13;state^=state>>>17;state^=state<<5;
   return state>>>0;
 };
 for(let i=ordered.length-1;i>0;i--){
   const j=random()%(i+1);
   [ordered[i],ordered[j]]=[ordered[j],ordered[i]];
 }
 return ordered;
}
export function dykHomeRotationSlot(date,publishedIds=[],fallbackIds=DYK_GLOSSARY_FALLBACK_IDS){
 if(!validDate(date)||!Array.isArray(publishedIds)||!Array.isArray(fallbackIds))return null;
 const ids=[...new Set([...publishedIds,...fallbackIds].filter(id=>
   typeof id==="string"&&(/^(?:G\d{3}|DYK-[A-Z0-9-]+)$/).test(id)))];
 if(!ids.length)return null;
 const ordinal=Math.floor(Date.parse(date+"T12:00:00Z")/86400000);
 const cycle=Math.floor(ordinal/ids.length);
 const order=shuffledHomeIds(ids,cycle);
 // Avoid an adjacent repeat when the pool shuffles at a cycle boundary.
 if(order.length>1){
   const prior=shuffledHomeIds(ids,cycle-1);
   if(order[0]===prior.at(-1)) [order[0],order[1]]=[order[1],order[0]];
 }
 return order[((ordinal%ids.length)+ids.length)%ids.length];
}

// Publish only the separately source-verified, bilingual historical release projection.
// The 640-row research registry and 612 private previews remain outside the live bundle.
const HISTORY_SOURCE=new URL("../../data/did-you-know/weiser-historical-20-publication.v1.json",import.meta.url);
const HISTORY_SCHEMA="AO_DYK_HISTORICAL_WEISER20_PUBLICATION_V1";
let historicalLoad=null;
export function loadDykHistoricalRelease(win=globalThis){
 if(historicalLoad)return historicalLoad;
 historicalLoad=Promise.resolve().then(()=>win.fetch(HISTORY_SOURCE,{cache:"no-store"})).then(r=>{
   if(!r?.ok)throw Error("DYK_HISTORICAL_UNAVAILABLE");return r.json();
 }).catch(error=>{historicalLoad=null;throw error});
 return historicalLoad;
}
export function dykHistoricalCandidates(data,date){
 if(!validDate(date)||data?.schema!==HISTORY_SCHEMA||
    data.release_stage!=="APPROVED_PARTIAL_LIVE"||
    !Array.isArray(data.records)||data.records.length!==20)return [];
 const unique=new Set();
 return data.records.filter(row=>{
   const copy=row?.pilot_home_copy,source=row?.source;
   if(!/^DYK-G520-W-0(?:0[1-9]|1[0-9]|20)$/.test(row?.id||"")||unique.has(row.id))return false;
   unique.add(row.id);
   return row.editorial_approval===true&&row.release_authorized===true&&
     row.semantic_novelty_reviewed===true&&row.historical_local_only===true&&
     row.publication_kind==="EVERGREEN_HISTORICAL"&&
     row.source_family==="WEISER_1958"&&
     copy?.final_english_signoff===true&&copy?.final_french_signoff===true&&
     clean(copy.en).length>25&&clean(copy.fr).length>25&&
     safeUrl(source?.url)&&source?.original_image_checked===true&&source?.deep_link_checked===true&&
     source.source_record_id===row.source_id&&
     Array.isArray(source.pdf_pages_1based)&&source.pdf_pages_1based.length>0&&
     source.pdf_pages_1based.every(p=>Number.isInteger(p)&&p>=1&&p<=384);
 });
}
export function dykHistoricalModel(data,id,date,language="en"){
 const row=dykHistoricalCandidates(data,date).find(r=>r.id===id);
 if(!row)return null;
 const fr=language==="fr";
 return Object.freeze({
   id:row.id,language:fr?"fr":"en",fact:row.pilot_home_copy[fr?"fr":"en"],
   label:fr?"Weiser · Coutumes historiques":"Weiser · Historical customs",
   sourceId:row.source_id,sourceUrl:row.source.url,
   links:row.source.pdf_pages_1based.map(page=>({page,url:row.source.url+"#page="+page})),
   published:true
 });
}

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
    !Array.isArray(data.records)||data.records.length<1||data.records.length>1000||!validDate(date))return [];
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
 const selected=dykHomeRotationSlot(date,facts.map(row=>row.id));
 return facts.find(row=>row.id===selected)||null;
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
 const [data,historical]=await Promise.all([
   loadDykPrioritySelection(win).catch(()=>null),
   loadDykHistoricalRelease(win).catch(()=>null)
 ]);
 const model=dykPublishedModel(data,id,date,language)||
   dykHistoricalModel(historical,id,date,language);
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
