/**
 * Editorial-only source-locator triage for Mass moments.
 * No quoted source passage is packaged or published by this adapter.
 * A workbook label such as PASSAGE VERIFIED never authorizes display.
 * Deliberately not an alternative source drawer / Scripture reader.
 */
export const MASS_MOMENT_EVIDENCE_SCHEMA="AO_MASS_MOMENT_AUTHOR_EVIDENCE_REVIEW_V1";
export const MASS_MOMENT_EVIDENCE_VERSION="ao-mass-moment-evidence-triage-v1";
export const MASS_MOMENT_EVIDENCE_DECISIONS=Object.freeze([
 "HOLD","PRIORITIZE_COLLATION","QUESTION_SCOPE","DO_NOT_USE"
]);
const DATA_URL=new URL("../../data/learn/research/mass-moment-author-evidence-review-20261016.v1.json",import.meta.url);
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const tr=(fr,en,french)=>fr?french:en;
const assert=(ok,message)=>{if(!ok)throw Error("AO_MASS_SOURCE_RESEARCH_"+message)};
const card=id=>/^AO\.CARD\.0(?:[0-2][0-9]|30)$/.test(id);
export function massMomentEvidencePreviewEnabled(win=globalThis){
  try{return new URLSearchParams(String(win?.location?.search??"")).get("massEvidenceReview")==="1";}
  catch{return false;}
}
export function validateMassMomentEvidenceCatalog(catalog){
 assert(catalog?.schema===MASS_MOMENT_EVIDENCE_SCHEMA,"SCHEMA");
 assert(catalog.status==="RESEARCH_CANDIDATES_ONLY__NO_PUBLICATION","STATUS");
 assert(Array.isArray(catalog.records)&&catalog.records.length===139,"CENSUS");
 assert(catalog.census?.claims===139&&catalog.census?.passageVerifiedResearchLabel===69&&
  catalog.census?.publicationApproved===0&&catalog.census?.reproductionCleared===0&&
  catalog.census?.reviewedTextForRelease===0,"RELEASE_COUNTS");
 const ids=new Set(),owners=new Set();let passage=0;
 for(const r of catalog.records){
  assert(/^VER-\d{3}$/.test(r?.id??"")&&!ids.has(r.id),"ID");
  ids.add(r.id);
  assert(/^AO\.V3\.\d{4}\.U\d{3}$/.test(r.unitId??""),"UNIT");
  assert(Array.isArray(r.guideIds)&&r.guideIds.length>=1&&r.guideIds.every(card),"GUIDE");
  for(const guideId of r.guideIds)owners.add(guideId);
  assert(typeof r.author==="string"&&r.author.trim()&&
   typeof r.sourceLocator==="string"&&r.sourceLocator.trim(),"LOCATOR");
  assert(typeof r.researchGrade==="string"&&r.researchGrade.trim(),"GRADE");
  assert(r.publicationApproved===false&&r.quotationReproductionCleared===false&&
   r.sourceEditionCollated===false,"PUBLICATION");
  if(r.researchGrade==="PASSAGE VERIFIED")passage++;
 }
 assert(passage===69&&owners.size===16,"RESEARCH_COUNTS");
 return catalog;
}
export async function loadMassMomentEvidenceCatalog({fetchImpl=globalThis.fetch}={}){
 if(typeof fetchImpl!=="function")throw new TypeError("fetch required");
 const response=await fetchImpl(DATA_URL);
 if(!response?.ok)throw Error("Mass evidence review unavailable ("+(response?.status??"network")+")");
 return validateMassMomentEvidenceCatalog(await response.json());
}
export function massMomentEvidenceForGuide(catalog,guideId){
 validateMassMomentEvidenceCatalog(catalog);
 if(!card(guideId))return [];
 return catalog.records.filter(r=>r.guideIds.includes(guideId));
}
export function massMomentEvidenceChoiceIsSafe(choice){
 return MASS_MOMENT_EVIDENCE_DECISIONS.includes(choice);
}
export function sanitizeMassMomentEvidenceDecisions(catalog,choices){
 validateMassMomentEvidenceCatalog(catalog);
 const known=new Set(catalog.records.map(r=>r.id)),out={};
 for(const [id,choice] of Object.entries(choices&&typeof choices==="object"?choices:{})){
  if(known.has(id)&&massMomentEvidenceChoiceIsSafe(choice)&&choice!=="HOLD")out[id]=choice;
 }
 return out;
}
export function massMomentEvidenceDecisionExport(catalog,choices){
 const records=sanitizeMassMomentEvidenceDecisions(catalog,choices);
 return Object.freeze({
  schema:"AO_MASS_EVIDENCE_TRIAGE_DECISIONS_V1",
  sourceCatalog:MASS_MOMENT_EVIDENCE_SCHEMA,
  sourceWorkbook:catalog.source,
  decisionSemantics:"EDITORIAL_QUEUE_PRIORITY_ONLY__NOT_CITATION_APPROVAL",
  publicationApproved:false,approvedQuotations:0,
  records:Object.entries(records).sort(([a],[b])=>a.localeCompare(b)).map(([claimId,choice])=>({claimId,choice}))
 });
}
const name=Object.freeze({
 HOLD:["Awaiting review","À vérifier"],
 PRIORITIZE_COLLATION:["Check printed original","Contrôler l'original"],
 QUESTION_SCOPE:["Check interpretation","Vérifier l'interprétation"],
 DO_NOT_USE:["Do not use","Ne pas utiliser"]
});
export function massMomentEvidenceReviewCss(){
 return [
  ".aoMFEvidence{margin:25px 0;border-top:1px solid var(--ao-rule,rgba(255,255,255,.14));padding:17px 0;font:400 .88rem/1.55 var(--ao-font-ui,system-ui,sans-serif)}",
  ".aoMFEvidence>summary{min-height:44px;cursor:pointer;color:var(--liturgical,#c9ad78);font-weight:600}",
  ".aoMFEvidenceNote{color:var(--ao-text-muted,var(--muted,#9ba5b1));font-size:.77rem;line-height:1.6}",
  ".aoMFEvidenceAuthor{border-top:1px solid var(--ao-rule,rgba(255,255,255,.1));padding:9px 0}",
  ".aoMFEvidenceAuthor>summary{cursor:pointer;min-height:44px;font-size:.88rem;color:var(--ao-text-primary,#eee9df)}",
  ".aoMFEvidenceRow{border-top:1px solid var(--ao-rule,rgba(255,255,255,.09));padding:11px 1px}",
  ".aoMFEvidenceRow>strong{display:block;font:.7rem/1.4 var(--ao-font-ui,system-ui,sans-serif);color:var(--liturgical,#c9ad78)}",
  ".aoMFEvidenceRow p{overflow-wrap:anywhere;margin:4px 0;font-size:.8rem;line-height:1.55}",
  ".aoMFEvidenceRow small{color:var(--ao-text-muted,var(--muted,#9ba5b1));font-size:.71rem}",
  ".aoMFEvidenceRow label{display:block;margin-top:8px;font-size:.76rem}",
  ".aoMFEvidenceRow select{display:block;margin:5px 0 0;width:100%;min-height:44px;max-width:420px;border:1px solid var(--ao-rule,rgba(255,255,255,.2));border-radius:8px;background:var(--ao-surface-1,#101821);color:var(--ao-text-primary,#e9e4d9);padding:8px}",
  ".aoMFEvidenceExport{border:1px solid var(--ao-rule,rgba(255,255,255,.2));border-radius:9px;min-height:44px;padding:8px 13px;background:var(--ao-surface-1,#101821);color:var(--liturgical,#c9ad78);margin-top:14px}",
  ".aoMFEvidence :is(summary,select,button):focus-visible{outline:2px solid var(--liturgical,#c9ad78);outline-offset:3px}"
 ].join("");
}
/**
 * Print only SOURCE METADATA. No authoritative source assertions, full
 * quotations, links to unchecked OCR, or clickable citations. This panel
 * is available solely when explicitly opened with massEvidenceReview=1.
 */
export function massMomentEvidencePanelHtml(catalog,guideId,{french=false,decisions={}}={}){
 const rows=massMomentEvidenceForGuide(catalog,guideId);
 const intro=tr(french,
  "Editorial research · source locators only. No source excerpt, edition or reproduction is certified for app publication. The workbook’s ‘passage verified’ label is a research grade, not an approval.",
  "Recherche éditoriale · références seulement. Aucun extrait ou édition n'est validé pour publication. « Passage verified » est une qualification de recherche, non une autorisation.");
 const authors=[...new Set(rows.map(x=>x.author))];
 const groups=authors.map(author=>{
  const records=rows.filter(x=>x.author===author);
  return '<details class="aoMFEvidenceAuthor"><summary>'+esc(author)+' · '+records.length+'</summary>'+
   records.map(r=>{
    const choice=massMomentEvidenceChoiceIsSafe(decisions[r.id])?decisions[r.id]:"HOLD";
    return '<article class="aoMFEvidenceRow" data-ao-mf-evidence-claim="'+esc(r.id)+'">'+
     '<strong>'+esc(r.id)+' · '+esc(r.unitId)+'</strong>'+
     '<p>'+esc(r.sourceLocator)+'</p>'+
     '<small>'+esc(r.researchGrade)+' · '+esc(r.interpretationType)+
     (r.editorialCaution&&r.editorialCaution!=="None"?" · "+esc(r.editorialCaution):"")+'</small>'+
     '<label>'+esc(tr(french,"Editorial triage (not publication approval)","Tri éditorial (sans autorisation de publication)"))+
     '<select data-ao-mf-evidence-decision="'+esc(r.id)+'" aria-label="'+esc(r.id)+'">'+
     MASS_MOMENT_EVIDENCE_DECISIONS.map(key=>'<option value="'+key+'"'+(choice===key?' selected':'')+'>'+esc(name[key][french?1:0])+'</option>').join("")+
     '</select></label></article>';
   }).join("")+'</details>';
 }).join("");
 const sum=rows.length?groups:('<p>'+esc(tr(french,"No historical evidence candidates attached to this moment.","Aucune référence historique candidate liée à cette étape."))+'</p>');
 return '<details class="aoMFEvidence" data-ao-mf-evidence-review="'+esc(guideId)+'">'+
  '<summary>'+esc(tr(french,"Editorial source review","Révision éditoriale des sources"))+' · '+rows.length+'</summary>'+
  '<p class="aoMFEvidenceNote">'+esc(intro)+'</p>'+sum+
  '<button type="button" class="aoMFEvidenceExport" data-ao-mf-evidence-export>'+
    esc(tr(french,"Export triage decisions (JSON)","Exporter les décisions (JSON)"))+
  '</button></details>';
}
