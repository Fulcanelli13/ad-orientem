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
 // One source action near the heading is enough. The bibliographic URL is
 // external; no unapproved full text or editorial quote is embedded.
 const sourceAccess='<section class="aoMFSourceAccess" aria-label="'+
   tr(french,"Original document","Document original")+'">'+
   (source?'<a href="'+escape(source)+'" target="_blank" rel="noopener noreferrer" data-ao-mf-source-original="'+escape(record.sourceId)+'">'+
     tr(french,"Open original document","Consulter le document original")+' ↗</a>':
     '<span class="aoMFSourceHeld">'+tr(french,"Document link held for verification","Lien documentaire en attente de vérification")+'</span>')+
   '<p>'+tr(french,
     "Original text not reproduced. The link alone does not verify a passage, edition or reproduction rights.",
     "Texte original non reproduit. Le lien seul ne vérifie ni passage, ni édition, ni droits de reproduction.")+'</p></section>';
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
   '</dl>'+sourceAccess+
   '<section class="aoMFSourceClaimList"><h2>'+tr(french,"Claims in this lesson citing this work","Propositions de la leçon citant cet ouvrage")+
      ' · '+record.claims.length+'</h2>'+
      '<p class="aoMFSourceDisclaimer">'+tr(french,
        "The lesson’s statements below are not quotations or verified passages from the original document.",
        "Les propositions ci-dessous proviennent de la leçon, non des citations ou des passages vérifiés du document original.")+'</p>'+
      '<ol>'+record.claims.map(claim=>'<li data-ao-mf-source-claim="'+escape(claim.id)+'">'+
         '<small class="aoMFSourceClaimId">'+escape(claim.id)+'</small>'+
         '<p>'+escape(localized(claim.text,french))+'</p></li>').join("")+'</ol></section>'+
   '<button type="button" class="aoMFSourceReturn" data-ao-mf-source-close>'+
      tr(french,"Return to the same lesson","Retourner à la même leçon")+'</button></div></section>';
}

export function massSourceStudyCss(){
 return [
 '.aoMFSourceReading{position:fixed;inset:0 0 calc(var(--ao-global-ribbon-h,68px) + var(--safe-bottom,0px)) 0;z-index:14982;overflow:auto;overscroll-behavior:contain;background:var(--ao-bg-canvas,#080c12);color:var(--ao-text-primary,#eee9df);font-family:var(--ao-font-body,Georgia,serif)}',
 '.aoMFSourceReading *{box-sizing:border-box}.aoMFSourceReadingTop{position:sticky;top:0;z-index:2;display:grid;grid-template-columns:42px 1fr 42px;align-items:center;gap:8px;padding:8px 12px;background:var(--ao-bg-canvas,#080c12);border-bottom:1px solid var(--ao-rule,rgba(255,255,255,.14))}',
 '.aoMFSourceReadingTop span{text-align:center;font:600 .7rem/1.3 var(--ao-font-ui,system-ui);letter-spacing:.07em;color:var(--liturgical,#c9ad78)}',
 '.aoMFSourceReading button{cursor:pointer}.aoMFSourceReadingTop button{width:42px;height:42px;border:1px solid var(--ao-rule,#393c40);border-radius:9px;background:var(--ao-surface-1,#101821);color:inherit;font:1.2rem/1 system-ui}',
 '.aoMFSourceReadingBody{width:min(760px,100%);padding:19px 17px 46px;margin:0 auto}.aoMFSourceKicker{color:var(--liturgical,#c9ad78);font:.7rem/1.3 var(--ao-font-ui,system-ui);letter-spacing:.08em}',
 '.aoMFSourceReading h1{font:500 clamp(1.55rem,5.3vw,2.3rem)/1.18 var(--ao-font-display,Georgia,serif);margin:9px 0 6px;overflow-wrap:anywhere}',
 '.aoMFSourceStage,.aoMFSourceDisclaimer,.aoMFSourceAccess p{color:var(--ao-text-muted,#a9a5a0);line-height:1.5}.aoMFSourceStage{margin:0 0 10px;font-size:.87rem}',
 '.aoMFSourceMeta{display:flex;align-items:center;flex-wrap:wrap;gap:5px 15px;margin:10px 0 12px;padding:0}',
 '.aoMFSourceMeta>div{display:flex;align-items:baseline;gap:6px;min-width:0;margin:0;padding:0;background:none;border:none}',
 '.aoMFSourceMeta dt{font:.7rem/1.4 var(--ao-font-ui,system-ui);color:var(--ao-text-muted,#a9a5a0)}',
 '.aoMFSourceMeta dd{margin:0;font:500 .81rem/1.4 var(--ao-font-body,Georgia,serif);overflow-wrap:anywhere}',
 '.aoMFSourceAccess{display:flex;align-items:center;flex-wrap:wrap;gap:6px 13px;padding:12px 0 13px;border-top:1px solid var(--ao-rule,#393c40);border-bottom:1px solid var(--ao-rule,#393c40)}',
 '.aoMFSourceAccess a,.aoMFSourceReturn{display:inline-flex;align-items:center;min-height:44px;padding:10px 13px;border:1px solid var(--liturgical,#c9ad78);border-radius:9px;color:var(--liturgical,#c9ad78);background:transparent;text-decoration:none;font:.84rem/1.35 var(--ao-font-ui,system-ui)}',
 '.aoMFSourceAccess p{flex:1 1 230px;margin:0;font:.73rem/1.55 var(--ao-font-ui,system-ui)}.aoMFSourceHeld{color:var(--ao-text-muted,#a9a5a0)}',
 '.aoMFSourceClaimList{margin:19px 0 0}.aoMFSourceReading h2{font:500 1.19rem/1.34 var(--ao-font-display,Georgia,serif);margin:3px 0 7px}',
 '.aoMFSourceDisclaimer{font:.81rem/1.5 var(--ao-font-ui,system-ui);margin:0 0 9px}',
 '.aoMFSourceClaimList ol{padding-left:22px;margin:9px 0}.aoMFSourceClaimList li{padding:8px 0 11px;border-bottom:1px solid var(--ao-rule,#393c40);line-height:1.58}.aoMFSourceClaimList li p{margin:4px 0 0}',
 '.aoMFSourceClaimId{display:block;font:.7rem/1.35 var(--ao-font-ui,system-ui);color:var(--liturgical,#c9ad78);letter-spacing:.03em}',
 '.aoMFSourceReturn{margin-top:16px}.aoMFSourceReading button:focus-visible,.aoMFSourceReading a:focus-visible{outline:2px solid var(--liturgical,#c9ad78);outline-offset:3px}',
 '@media(max-width:430px){.aoMFSourceReadingBody{padding:16px 14px 42px}.aoMFSourceMeta{gap:6px}.aoMFSourceAccess p{flex-basis:100%}}'
 ].join("");
}
