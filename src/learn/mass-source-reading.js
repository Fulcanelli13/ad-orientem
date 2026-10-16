/**
 * Formation-only document citation reader. This is a contextual index of
 * existing published lesson claims; it never copies a third-party document,
 * certifies an edition or promotes a research-only Mass/P0 bibliography.
 */
import {sourceReferenceSafeUrl} from "./source-reference-panel.js";

export const MASS_SOURCE_READING_VERSION="ao-mass-source-reading-v1";
const escape=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const tr=(fr,en,french)=>fr?french:en;
const localized=(text,fr)=>typeof text==="string"?text:
 String(fr?(text?.fr??text?.en??""):(text?.en??text?.fr??""));
const types=Object.freeze({
 LITURGICAL_BOOK:["Liturgical book","Livre liturgique"],
 PAPAL_ENCYCLICAL:["Papal encyclical","Encyclique pontificale"],
 CONTEMPORARY_CEREMONIAL_MANUAL:["Ceremonial manual","Manuel cérémoniel"],
 IMPRIMATUR_CATECHETICAL_MISSAL:["Catechetical missal","Missel catéchétique"]
});
const roles=Object.freeze({
 NORMATIVE_1962:["1962 liturgical witness","Témoin liturgique de 1962"],
 DOCTRINAL_PRIMARY:["Primary doctrinal document","Document doctrinal primaire"],
 CEREMONIAL_REFERENCE:["Ceremonial reference","Référence cérémonielle"],
 DISCOVERY_AND_EXPLANATORY:["Explanatory reference","Référence explicative"]
});
const labelFor=(mapping,key,fr)=>mapping[key]?.[fr?1:0]??String(key||"");

export function massSourceStudyRecord(formation,stageId,sourceId){
 if(formation?.schema!=="ao-mass-formation-campion-v1")return null;
 const stage=formation?.stages?.find(item=>item.id===stageId);
 const source=formation?.sources?.find(item=>item.id===sourceId);
 if(!stage||!source)return null;
 const claims=(stage.claims||[]).filter(claim=>(claim.sources||[]).includes(sourceId));
 if(!claims.length)return null; // no free-floating reference: require an actual existing citation
 if(claims.some(claim=>!claim.id||!claim.text?.en||!claim.text?.fr))return null;
 const canonicalUrl=sourceReferenceSafeUrl(source.canonical_url||source.url);
 return Object.freeze({stageId,stageTitle:stage.title,sourceId,sourceTitle:source.title,
   authorityType:source.authority_type,role:source.role,canonicalUrl,
   claims:Object.freeze(claims.map(claim=>Object.freeze({
     id:claim.id,text:claim.text
   })))});
}

export function massSourceStudyHtml(record,{french=false}={}){
 if(!record)return "";
 const source=record.canonicalUrl;
 return '<section class="aoMFSourceReading" role="dialog" aria-modal="true" aria-labelledby="ao-mf-source-title" data-ao-mf-source-reader="'+
   escape(record.sourceId)+'" data-ao-mf-source-stage="'+escape(record.stageId)+'">'+
   '<header class="aoMFSourceReadingTop"><button type="button" data-ao-mf-source-close aria-label="'+
     tr(french,"Back to lesson","Retour à la leçon")+'">←</button>'+
   '<span>'+tr(french,"FORMATION · SOURCES","FORMATION · SOURCES")+'</span>'+
   '<button type="button" data-ao-mf-source-close aria-label="'+
     tr(french,"Close source context","Fermer le contexte documentaire")+'">×</button></header>'+
   '<div class="aoMFSourceReadingBody"><small class="aoMFSourceKicker">'+
     tr(french,"DOCUMENTARY CONTEXT","CONTEXTE DOCUMENTAIRE")+'</small>'+
   '<h1 id="ao-mf-source-title" tabindex="-1">'+escape(record.sourceTitle)+'</h1>'+
   '<p class="aoMFSourceStage">'+tr(french,"Referenced by","Cité dans")+' · '+
     escape(localized(record.stageTitle,french))+'</p>'+
   '<dl class="aoMFSourceMeta">'+
     '<div><dt>'+tr(french,"Type","Nature")+'</dt><dd>'+escape(labelFor(types,record.authorityType,french))+'</dd></div>'+
     '<div><dt>'+tr(french,"Role in existing source registry","Rôle dans le registre existant")+'</dt><dd>'+
       escape(labelFor(roles,record.role,french))+'</dd></div>'+
   '</dl>'+
   '<section class="aoMFSourceClaimList"><h2>'+tr(french,"Claims in this lesson citing this work","Propositions de la leçon citant cet ouvrage")+
      ' · '+record.claims.length+'</h2>'+
      '<p class="aoMFSourceDisclaimer">'+tr(french,
        "These are the lesson’s own statements, not quotations or verified passages from the original document. Each citation retains its original claim-level association.",
        "Ce sont des formulations de la leçon, non des citations ou des passages vérifiés du document original. Chaque référence conserve son association avec la proposition d’origine.")+'</p>'+
      '<ol>'+record.claims.map(claim=>'<li data-ao-mf-source-claim="'+escape(claim.id)+'">'+
         '<p>'+escape(localized(claim.text,french))+'</p></li>').join("")+'</ol></section>'+
   '<section class="aoMFSourceOriginal"><h2>'+tr(french,"Read the original document","Consulter le document original")+'</h2>'+
      '<p>'+tr(french,
         "The original document is not reproduced here. This link identifies a source, but does not by itself certify a particular passage, edition, or reproduction permission.",
         "Le document original n’est pas reproduit ici. Ce lien identifie une source, sans certifier à lui seul un passage, une édition ou les droits de reproduction.")+'</p>'+
      (source?'<a href="'+escape(source)+'" target="_blank" rel="noopener noreferrer" data-ao-mf-source-original="'+escape(record.sourceId)+'">'+
        tr(french,"Open original source","Ouvrir la source originale")+' ↗</a>':
        '<p class="aoMFSourceHeld">'+tr(french,"Document link held for verification","Lien documentaire en attente de vérification")+'</p>')+
   '</section><button type="button" class="aoMFSourceReturn" data-ao-mf-source-close>'+
      tr(french,"Return to the same lesson","Retourner à la même leçon")+'</button></div></section>';
}

export function massSourceStudyCss(){
 return [
 '.aoMFSourceReading{position:fixed;inset:0 0 calc(var(--ao-global-ribbon-h,68px) + var(--safe-bottom,0px)) 0;z-index:14982;overflow:auto;overscroll-behavior:contain;background:var(--ao-bg-canvas,#080c12);color:var(--ao-text-primary,#eee9df);font-family:var(--ao-font-body,Georgia,serif)}',
 '.aoMFSourceReading *{box-sizing:border-box}.aoMFSourceReadingTop{position:sticky;top:0;z-index:2;display:grid;grid-template-columns:44px 1fr 44px;align-items:center;gap:9px;padding:10px 13px;background:var(--ao-bg-canvas,#080c12);border-bottom:1px solid var(--ao-rule,rgba(255,255,255,.14))}',
 '.aoMFSourceReadingTop span{text-align:center;font:600 .7rem/1.3 var(--ao-font-ui,system-ui);letter-spacing:.1em;color:var(--liturgical,#c9ad78)}',
 '.aoMFSourceReading button{cursor:pointer}.aoMFSourceReadingTop button{width:42px;height:42px;border:1px solid var(--ao-rule,#393c40);border-radius:9px;background:var(--ao-surface-1,#101821);color:inherit;font:1.2rem/1 system-ui}',
 '.aoMFSourceReadingBody{width:min(760px,100%);padding:24px 17px 55px;margin:0 auto}.aoMFSourceKicker{color:var(--liturgical,#c9ad78);font:.72rem/1.3 var(--ao-font-ui,system-ui);letter-spacing:.09em}',
 '.aoMFSourceReading h1{font:500 clamp(1.7rem,6vw,2.5rem)/1.15 var(--ao-font-display,Georgia,serif);margin:13px 0 8px;overflow-wrap:anywhere}',
 '.aoMFSourceStage,.aoMFSourceDisclaimer,.aoMFSourceOriginal p{color:var(--ao-text-muted,#a9a5a0);line-height:1.6}',
 '.aoMFSourceMeta{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:22px 0 32px}.aoMFSourceMeta>div{padding:11px;border:1px solid var(--ao-rule,#393c40);border-radius:9px;background:var(--ao-surface-1,#101821)}',
 '.aoMFSourceMeta dt{font:.72rem/1.5 var(--ao-font-ui,system-ui);color:var(--ao-text-muted,#a9a5a0)}.aoMFSourceMeta dd{margin:5px 0 0;font:500 .94rem/1.4 var(--ao-font-body,Georgia,serif)}',
 '.aoMFSourceClaimList,.aoMFSourceOriginal{margin:25px 0;padding-top:16px;border-top:1px solid var(--ao-rule,#393c40)}.aoMFSourceReading h2{font:500 1.35rem/1.3 var(--ao-font-display,Georgia,serif);margin:4px 0 9px}',
 '.aoMFSourceClaimList ol{padding-left:23px}.aoMFSourceClaimList li{padding:8px 0 11px;border-bottom:1px solid var(--ao-rule,#393c40);line-height:1.67}.aoMFSourceClaimList li p{margin:0}',
 '.aoMFSourceOriginal a,.aoMFSourceReturn{display:inline-flex;align-items:center;min-height:44px;padding:10px 13px;border:1px solid var(--liturgical,#c9ad78);border-radius:9px;color:var(--liturgical,#c9ad78);background:transparent;text-decoration:none;font:.91rem/1.4 var(--ao-font-ui,system-ui)}',
 '.aoMFSourceReturn{margin-top:24px}.aoMFSourceReading button:focus-visible,.aoMFSourceReading a:focus-visible{outline:2px solid var(--liturgical,#c9ad78);outline-offset:3px}',
 '@media(max-width:430px){.aoMFSourceReadingBody{padding:19px 14px 48px}.aoMFSourceMeta{grid-template-columns:1fr}}'
 ].join("");
}
