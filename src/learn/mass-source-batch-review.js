/**
 * Editorial-only source witness batch index over the existing 139-claim review.
 * One source locator can support multiple research claims but never automatically
 * qualifies a passage, quotation, edition, copyright claim or Mass rubric.
 */
export const MASS_SOURCE_BATCH_VERSION="mass-source-first69-locus-batches-v1";
export const MASS_SOURCE_BATCH_SCHEMA="AO_MASS_SOURCE_69_BATCH_REVIEW_V1";
const dataUrl=new URL("../../data/learn/research/mass-source-first69-locus-batches-20261016.v1.json",import.meta.url);
const choices=Object.freeze(["HOLD","PRIORITIZE_COLLATION","QUESTION_SCOPE","DO_NOT_USE"]);
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const tr=(fr,en,french)=>fr?french:en;
const invariant=(test,error)=>{if(!test)throw new Error("MASS_SOURCE_BATCH_"+error)};
const unique=a=>new Set(a).size===a.length;
const URL_SAFE=url=>typeof url==="string"&&/^https:\/\/[^\s]+$/.test(url);
export function validateMassSourceLocusBatches(data,sourceRegister){
 invariant(data?.schema===MASS_SOURCE_BATCH_SCHEMA,"SCHEMA");
 invariant(data.status==="NO_SOURCE_TEXT_PUBLISHED_OR_CERTIFIED"&&data.totalResearchClaims===69&&
  data.totalDistinctLoci===37&&data.originalWitnessPagesCollated===0&&
  data.publicationApproved===0&&data.reproductionApproved===0&&data.rightsApproved===0,"PUBLISH_GATE");
 invariant(Array.isArray(data.works)&&data.works.length===5,"FIVE_WORKS");
 invariant(Array.isArray(data.loci)&&data.loci.length===37,"LOCI");
 invariant(Array.isArray(data.gates)&&data.gates.length===6,"RELEASE_GATES");
 const works=new Map();
 for(const work of data.works){
  invariant(/^AO\.MASS\.WORK\.[A-Z]+$/.test(work.id)&&!works.has(work.id),"WORK_ID");
  invariant(typeof work.author==="string"&&typeof work.work==="string"&&work.work.length>4,"WORK_NAME");
  invariant(work.publicationApproved===false&&work.originalEditionVerified===false&&work.scanExamined===false,"WORK_CLEARANCE");
  invariant(work.sourceWitnessUrl===null||URL_SAFE(work.sourceWitnessUrl),"WORK_URL");
  invariant(typeof work.witnessStage==="string"&&work.witnessStage.length>3,"WORK_STAGE");
  works.set(work.id,work);
 }
 const ids=new Set(),refs=new Set();
 const sourceClaims=sourceRegister?.records
  ?new Map(sourceRegister.records.map(c=>[c.id,c]))
  :null;
 const total=new Map(),locations=new Map();
 for(const locus of data.loci){
  invariant(/^AO\.MASS\.WORK\.[A-Z]+\.L\d{2}$/.test(locus.id)&&!ids.has(locus.id)&&
    locus.workId===locus.id.replace(/\.L\d{2}$/,"")&&works.has(locus.workId),"LOCUS_ID");
  invariant(typeof locus.locus==="string"&&locus.locus.length>5,"LOCUS_TEXT");
  invariant(Array.isArray(locus.claimIds)&&locus.claimIds.length>0&&unique(locus.claimIds),"CLAIM_IDS");
  invariant(Array.isArray(locus.momentIds)&&locus.momentIds.length>0&&
    locus.momentIds.every(id=>/^AO\.CARD\.0(?:[0-2]\d|30)$/.test(id)),"MOMENT_IDS");
  invariant(locus.sourceImageChecked===false&&locus.editionCertified===false&&
    locus.quotationCleared===false&&locus.publicationApproved===false,"LOCUS_NOT_CERTIFIED");
  ids.add(locus.id);
  total.set(locus.workId,(total.get(locus.workId)||0)+locus.claimIds.length);
  locations.set(locus.workId,(locations.get(locus.workId)||0)+1);
  for(const id of locus.claimIds){
    invariant(/^VER-\d{3}$/.test(id)&&!refs.has(id),"CLAIM_IDENTITY");
    refs.add(id);
    if(sourceClaims){
      const origin=sourceClaims.get(id);
      invariant(origin?.researchGrade==="PASSAGE VERIFIED"&&origin.author===works.get(locus.workId).author&&
        origin.sourceLocator===locus.locus,"CROSSWALK");
      invariant(origin.publicationApproved===false&&origin.quotationReproductionCleared===false,"CLAIM_GATE");
      invariant(origin.guideIds.every(g=>locus.momentIds.includes(g)),"MOMENT_PARITY");
    }
  }
 }
 invariant(refs.size===69,"CLAIM_CENSUS");
 for(const w of data.works)invariant(total.get(w.id)===w.claimCount&&locations.get(w.id)===w.locusCount,"WORK_COUNTS");
 return data;
}
export async function loadMassSourceLocusBatches({fetchImpl=globalThis.fetch,sourceRegister}={}){
 if(typeof fetchImpl!=="function")throw new TypeError("fetch required");
 const res=await fetchImpl(dataUrl);
 if(!res?.ok)throw new Error("Source witness research unavailable ("+(res?.status??"network")+")");
 return validateMassSourceLocusBatches(await res.json(),sourceRegister);
}
export function massSourceBatchLocus(data,locusId){
 return data?.loci?.find(l=>l.id===locusId)||null;
}
export function massSourceBatchChoice(locus,claimChoices={}){
 const statuses=locus.claimIds.map(x=>claimChoices[x]||"HOLD");
 return new Set(statuses).size===1?statuses[0]:"MIXED";
}
export function massSourceBatchDecisionPatch(data,locusId,value){
 const locus=massSourceBatchLocus(data,locusId);
 if(!locus||!choices.includes(value))return null;
 return Object.fromEntries(locus.claimIds.map(id=>[id,value]));
}
export function massSourceBatchCss(){
 return [
 ".aoSourceBatchIndex{padding:16px 0;border-top:1px solid var(--ao-rule,rgba(255,255,255,.16));font:400 .84rem/1.5 var(--ao-font-ui,system-ui,sans-serif)}",
 ".aoSourceBatchIndex>summary{min-height:44px;cursor:pointer;font-weight:600;color:var(--liturgical,#c9ad78)}",
 ".aoSourceBatchIndex h3{font:500 1.03rem/1.4 var(--ao-font-display,Georgia,serif);margin:12px 0}",
 ".aoSourceBatchWork{padding:8px 0;border-top:1px solid var(--ao-rule,rgba(255,255,255,.12))}",
 ".aoSourceBatchWork>summary{cursor:pointer;min-height:44px;color:var(--ao-text-primary,#e9e4d9);font-weight:600}",
 ".aoSourceBatchLocus{padding:14px 0;border-top:1px solid var(--ao-rule,rgba(255,255,255,.09))}",
 ".aoSourceBatchLocus strong{font-size:.85rem;display:block;overflow-wrap:anywhere}",
 ".aoSourceBatchLocus small{display:block;font-size:.72rem;color:var(--ao-text-muted,var(--muted,#9ba5b1))}",
 ".aoSourceBatchLocus label{display:block;margin-top:8px;font-size:.76rem}",
 ".aoSourceBatchLocus select{min-height:44px;width:100%;max-width:430px;padding:7px 11px;margin-top:5px;border:1px solid var(--ao-rule,rgba(255,255,255,.2));border-radius:9px;background:var(--ao-surface-1,#101821);color:var(--ao-text-primary,#e9e4d9)}",
 ".aoSourceBatchIndex p,.aoSourceBatchIndex a{overflow-wrap:anywhere}",
 ".aoSourceBatchIndex a{color:var(--liturgical,#c9ad78);text-decoration:underline}",
 ".aoSourceBatchIndex :is(select,summary,button,a):focus-visible{outline:2px solid var(--liturgical,#c9ad78);outline-offset:3px}"
 ].join("");
}
const decisionLabel={
 HOLD:["Awaiting collation","À contrôler"],
 PRIORITIZE_COLLATION:["Prioritize original scan check","Priorité : contrôler l’original"],
 QUESTION_SCOPE:["Interpretation or locator disputed","Interprétation ou référence à vérifier"],
 DO_NOT_USE:["Do not use these claims","Ne pas utiliser ces assertions"]
};
export function massSourceBatchReviewHtml(data,{french=false,claimChoices={}}={}){
 validateMassSourceLocusBatches(data);
 const workRows=data.works.map(work=>{
  const loci=data.loci.filter(l=>l.workId===work.id);
  const witness=work.sourceWitnessUrl?
   '<a href="'+esc(work.sourceWitnessUrl)+'" target="_blank" rel="noopener noreferrer">'+
    esc(tr(french,"Open candidate witness (not certified)","Ouvrir la source candidate (non validée)"))+' ↗</a>':
   '<small>'+esc(tr(french,"No original witness pinned","Aucun témoin original fixé"))+'</small>';
  const inner=loci.map(locus=>{
   const selected=massSourceBatchChoice(locus,claimChoices);
   const opts=selected==="MIXED"?'<option value="MIXED" selected disabled>'+esc(tr(french,"Mixed individual decisions","Décisions individuelles différentes"))+'</option>':"";
   return '<section class="aoSourceBatchLocus" data-ao-source-batch-locus="'+esc(locus.id)+'">'+
    '<strong>'+esc(locus.locus)+'</strong>'+
    '<small>'+locus.claimIds.length+' '+esc(tr(french,"linked claim(s)","assertion(s) liée(s)"))+
    ' · '+esc(locus.momentIds.join(", "))+'</small>'+
    (locus.hasEditorialCaution?'<small>'+esc(tr(french,"Includes interpretation caution; examine claims individually before approving.","Comprend une réserve d'interprétation ; examiner chaque assertion."))+'</small>':"")+
    '<label>'+esc(tr(french,"Apply triage to all claims at this locator (not approval)","Trier toutes les assertions de cette référence (sans approbation)"))+
    '<select data-ao-source-batch-decision="'+esc(locus.id)+'" aria-label="'+esc(locus.id)+'">'+opts+
    choices.map(key=>'<option value="'+key+'"'+(selected===key?' selected':'')+'>'+
     esc(decisionLabel[key][french?1:0])+'</option>').join("")+'</select></label></section>';
  }).join("");
  return '<details class="aoSourceBatchWork" data-ao-source-work="'+esc(work.id)+'"><summary>'+
   esc(work.author)+' · '+work.claimCount+' '+esc(tr(french,"claims","assertions"))+
   ' / '+work.locusCount+' '+esc(tr(french,"source locators","références"))+'</summary>'+
   '<h3>'+esc(work.work)+'</h3><p>'+esc(work.editionToVerify)+'</p>'+
   '<p><strong>'+esc(tr(french,"Witness status: ","État de la source : "))+'</strong>'+esc(work.witnessStage)+'</p>'+
   '<p>'+esc(work.editorialRisk)+'</p>'+witness+inner+'</details>';
 }).join("");
 return '<details class="aoSourceBatchIndex" data-ao-source-batch-review><summary>'+
  esc(tr(french,"Batch-check the 69 strongest research claims","Vérifier par lots les 69 assertions les mieux documentées"))+
  '</summary><h3>'+esc(tr(french,"5 original works · 37 unique locators","5 ouvrages · 37 références distinctes"))+'</h3>'+
  '<p>'+esc(tr(french,"All 69 are research-grade candidates. Original printed-page and edition checks remain open; none is approved as an in-app quotation. A shared locator does not prove the interpretations are equivalent.",
  "Les 69 assertions sont des candidates de recherche. Les vérifications des pages et éditions restent à faire ; aucune citation n'est autorisée. Une même référence ne prouve pas des interprétations identiques."))+'</p>'+workRows+
  '<button type="button" class="aoMFEvidenceExport" data-ao-mf-evidence-export>'+
   esc(tr(french,"Export batch triage as JSON","Exporter le tri par lots (JSON)"))+'</button>'+
  '<p role="status" class="aoMFEvidenceNote" data-ao-source-batch-status></p></details>';
}
