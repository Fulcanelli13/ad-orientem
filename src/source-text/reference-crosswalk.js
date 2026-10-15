// Thin, read-only presentation adapter. Canonical works and Formation dossiers
// remain owned by data/reference; this module imports no books or raw text.
const valid=(s)=>typeof s==="string"&&s.trim().length>0;
function readInputs({canonical,formation,profiles}={}){
 if(canonical?.schema!=="ao-canonical-works-pilot-v1"||
    formation?.schema!=="AO_FORMATION_SOURCE_CROSSWALK_V1"||
    profiles?.schema!=="AO_SOURCE_TEXT_WITNESS_PROFILES_V1"||
    !Array.isArray(canonical.works)||!Array.isArray(formation.source_bindings)||
    !Array.isArray(formation.witness_index)||!Array.isArray(profiles.profiles))
  throw new Error("REF_CROSSWALK_INPUT_INVALID");
 return {canonical,formation,profiles};
}
function lookup(form,key){
 const binding=form.source_bindings.find(x=>x.key===key);
 if(!binding)throw new Error("REF_BINDING_NOT_FOUND");
 const witness=form.witness_index.find(x=>x.id===binding.witness_id);
 if(!witness||!witness.source_bindings?.includes(key)||
    !valid(witness.url)||!witness.url.startsWith("https://"))
  throw new Error("REF_SOURCE_WITNESS_MISMATCH");
 return {binding,witness};
}
// Present existing links without ever interpreting title resemblance as
// proof of shared edition, quotation, authorship or contextual approval.
export function resolveFormationReference({formation,key}={}){
 if(formation?.schema!=="AO_FORMATION_SOURCE_CROSSWALK_V1"||!valid(key))
  throw new Error("REF_FORMATION_INPUT_INVALID");
 const {binding,witness}=lookup(formation,key);
 return Object.freeze({
  bindingKey:binding.key,sourceScope:binding.scope,
  title:binding.title,locator:binding.locator??null,
  role:binding.role??"UNREVIEWED",url:witness.url,
  urlWitnessId:witness.id,
  contextApproved:binding.original_context_approved===true,
  sourcePassageStatus:binding.original_passage_status??"UNVERIFIED",
  presentation:"READ_FURTHER_EXTERNAL_LINK",
  // No inference of authority from URL host, title, format or topic.
  claimCitationApproved:false,quotationApproved:false,
  exactEditionMatched:false,localBookImported:false
 });
}
export function resolveCanonicalWork({canonical,workId}={}){
 if(!Array.isArray(canonical?.works)||!valid(workId))
  throw new Error("REF_WORK_INPUT_INVALID");
 const work=canonical.works.find(x=>x.id===workId);
 if(!work)throw new Error("REF_CANONICAL_WORK_NOT_FOUND");
 return Object.freeze({workId:work.id,title:work.title,type:work.type,
  displayLocatorPolicy:work.display_locator??null,
  existingWitnessIds:[...(work.witness_ids??[])],
  edition:work.edition??null,rights:work.rights??"UNREVIEWED",
  canonicalOwner:"data/reference/canonical-works-pilot.v1.json",
  textImported:false,productionCitationApproved:false});
}
export function inspectReferenceInventory(inputs){
 const {canonical,formation,profiles}=readInputs(inputs);
 const workIds=new Set(),keys=new Set(),witnessMap=new Map();
 for(const work of canonical.works){
  if(!valid(work.id)||workIds.has(work.id))throw new Error("REF_WORK_DUPLICATE");
  workIds.add(work.id);
 }
 for(const w of formation.witness_index){
  if(!valid(w.id)||witnessMap.has(w.id)||!valid(w.url))
   throw new Error("REF_URL_WITNESS_INVALID");
  witnessMap.set(w.id,w);
 }
 let approvedContexts=0;
 for(const b of formation.source_bindings){
  if(!valid(b.key)||keys.has(b.key))throw new Error("REF_BINDING_DUPLICATE");
  keys.add(b.key);const witness=witnessMap.get(b.witness_id);
  if(!witness||!witness.source_bindings?.includes(b.key))
   throw new Error("REF_BINDING_WITNESS_ORPHAN");
  if(b.original_context_approved===true)approvedContexts++;
 }
 const verifiedProfiles=profiles.profiles.filter(p=>workIds.has(p.sourceWorkId)).length;
 return Object.freeze({schema:"AO_REFERENCE_LINK_AUDIT_V1",
  canonicalWorks:canonical.works.length,
  formationScopedBindings:formation.source_bindings.length,
  formationUrlWitnesses:formation.witness_index.length,
  formationContextApproved:approvedContexts,
  witnessProfiles:profiles.profiles.length,
  profilesForCanonicalWorks:verifiedProfiles,
  importedBookTexts:0,createdDuplicateSourceBindings:0,
  newClaimLinksApproved:0,readFurtherPresentationOnly:true,
  ownerRegistry:"data/reference/canonical-works-pilot.v1.json",
  ownerFormation:"data/reference/formation-canonical-source-crosswalk.v1.json"});
}

/**
 * Read-only reconciliation of the CURRENT Formation owner snapshot with its
 * historical 408-binding audit baseline. No claim revalidation or URL crawling.
 * The current snapshot lives in data/reference on main, not under source-text.
 */
export function inspectCurrentFormationRevision({formation,revision,profiles}={}){
 if(formation?.schema!=="AO_FORMATION_SOURCE_CROSSWALK_V1"||
    revision?.schema!=="AO_FORMATION_CURRENT_SOURCE_RECONCILIATION_V2"||
    profiles?.schema!=="AO_SOURCE_TEXT_WITNESS_PROFILES_V1"||
    !Array.isArray(revision.added_source_bindings)||
    !Array.isArray(revision.old_identity_changes)||
    !Array.isArray(revision.missing_historical_bindings)||
    revision.baseline?.historical_source_bindings!==formation.source_bindings.length)
  throw new Error("REF_REVISION_INPUT_OR_BASELINE_INVALID");
 if(revision.old_identity_changes.length||revision.missing_historical_bindings.length)
  throw new Error("REF_REVISION_HISTORICAL_BINDINGS_CHANGED");
 const seen=new Set(),urls=new Set(),records=[];
 const witnesses=new Map(formation.witness_index.map(w=>[w.id,w.url]));
 for(const binding of formation.source_bindings){
  const url=witnesses.get(binding.witness_id);
  if(!valid(binding.key)||seen.has(binding.key)||!valid(url))
   throw new Error("REF_REVISION_HISTORICAL_BINDING_INVALID");
  seen.add(binding.key);urls.add(url);
  records.push({key:binding.key,url,contextApproved:binding.original_context_approved===true,
   stage:"HISTORICAL_OWNER_BINDING"});
 }
 for(const binding of revision.added_source_bindings){
  if(!valid(binding.key)||seen.has(binding.key)||
     !valid(binding.url)||!binding.url.startsWith("https://")||
     binding.original_context_approved!==false)
   throw new Error("REF_REVISION_ADDITION_INVALID");
  seen.add(binding.key);urls.add(binding.url);
  records.push({key:binding.key,url:binding.url,contextApproved:false,
   stage:"EXISTING_OWNER_CORRECTION"});
 }
 if(records.length!==revision.metrics?.source_bindings||
    urls.size!==revision.metrics?.url_witnesses||
    revision.metrics.scoped_source_bindings_added!==revision.added_source_bindings.length||
    revision.metrics.scoped_source_bindings_removed!==0||
    revision.metrics.currently_independently_certified_new_claims!==0)
  throw new Error("REF_REVISION_COUNTS_OR_APPROVAL_CONTRADICTORY");
 const urlProfiles=new Map();
 for(const p of profiles.profiles){
  if(p.handling!=="INDEX_AND_LINK_ONLY")continue;
  for(const url of [p.witnessUrl,...(p.witnessUrls??[])].filter(Boolean)){
   if(!urlProfiles.has(url))urlProfiles.set(url,[]);
   urlProfiles.get(url).push(p.id);
  }
 }
 const matched=records.filter(r=>urlProfiles.has(r.url))
  .map(r=>({bindingKey:r.key,profileIds:[...urlProfiles.get(r.url)],
   match:"EXACT_URL_ONLY_NOT_PASSAGE_OR_EDITION_CERTIFICATION",
   sourceContextApproved:r.contextApproved,
   publicDisplayApproved:false}));
 return Object.freeze({schema:"AO_REFERENCE_CURRENT_REVISION_AUDIT_V1",
  currentSourceBindings:records.length,currentUrlWitnesses:urls.size,
  historicalSourceBindings:formation.source_bindings.length,
  newlyAddedByOwner:revision.added_source_bindings.length,
  originalHistoricalBindingsRemoved:0,
  existingProfileUrlMatches:matched,
  newClaimCertifications:0,
  productionDisplayApproved:false,
  authority:"data/reference/formation-current-source-reconciliation.v2.json",
  noDuplicateCatalogues:true});
}
/**
 * A compact citation proposal, NOT a public citation assertion.
 * Only the original module owner may approve showing it.
 */
export function prepareReferencePresentation({formation,key,profiles}={}){
 const source=resolveFormationReference({formation,key});
 const candidates=(profiles?.profiles??[]).filter(p=>
  p.handling==="INDEX_AND_LINK_ONLY"&&
  [p.witnessUrl,...(p.witnessUrls??[])].includes(source.url));
 return Object.freeze({
  bindingKey:source.bindingKey,owner:"FORMATION",
  compactTitle:source.title,
  deeperLocator:source.locator,
  originalRole:source.role,
  link:{label:"Read further",url:source.url},
  potentialWitnessProfiles:candidates.map(p=>p.id),
  witnessMatchStatus:candidates.length?
    "EXACT_URL_ONLY_NOT_VERIFIED_PASSAGE":"NO_EDITION_PROFILE_MATCH",
  inlineCitation:null,quote:null,
  publicDisplayApproved:false,
  reviewNeeded:"SOURCE_OWNER_CONTEXT_AND_EXACT_LOCATOR_IF_CLAIM_CITATION",
  htmlOrBookTextImported:false});
}
