// Sacred Atlas: fail-closed bridge from bilingual research histories into the
// existing published Place folio format. Not imported by the public data loader.
// Never turn an inventory entry, locator source or mere URL match into approval.
export const SACRED_GUIDE_REVIEW_RELEASE_VERSION="ao.sacred-guide-review-release.v1";
const rows=x=>Array.isArray(x)?x:[];
const filled=x=>typeof x==="string"&&x.trim().length>0;
const https=x=>typeof x==="string"&&/^https:\/\/[^\s]+$/.test(x);
const geographicUrl=x=>typeof x==="string"&&/^https:\/\/(?:www\.)?(?:mapcarta\.com|openstreetmap\.org|wikidata\.org|(?:en|fr|de|es|pt)\.wikipedia\.org)\//i.test(x);
const stableText=g=>JSON.stringify([g?.place_id,g?.shrine_id,g?.subtitle_en,g?.subtitle_fr,
  rows(g?.sections).map(s=>[s.id,s.title_en,s.title_fr,rows(s.paragraphs).map(p=>[p.en,p.fr,p.source_id,p.source_url])])]);
export function sacredGuideRevision(guide){
  // Change-detection fingerprint only, not a cryptographic signature.
  let h=2166136261;
  for(const c of stableText(guide)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)>>>0;}
  return "fnv1a32-"+h.toString(16).padStart(8,"0");
}
export function inspectSacredGuideEvidence(guide,shrine,sourceRecords=[]){
  const issues=[],bySource=new Map(rows(sourceRecords).map(s=>[s?.id,s]));
  const used=new Set();
  if(!guide||guide.place_id!==shrine?.place_id||guide.shrine_id!==shrine?.shrine_id)
    issues.push("CANONICAL_ID_MISMATCH");
  if(guide?.publication_authorized!==false||guide?.state!=="BILINGUAL_EXTENDED_DRAFT_SECOND_EDITOR_REQUIRED_NOT_PUBLISHED")
    issues.push("NOT_RESEARCH_DRAFT");
  if(!filled(guide?.subtitle_en)||!filled(guide?.subtitle_fr))issues.push("MISSING_BILINGUAL_SUBTITLE");
  if(rows(guide?.sections).length!==3)issues.push("EXPECTED_THREE_SECTIONS");
  let paragraphCount=0;
  const sectionIds=new Set();
  for(const section of rows(guide?.sections)){
    if(!filled(section?.id)||sectionIds.has(section.id))issues.push("DUPLICATE_OR_EMPTY_SECTION_ID");
    sectionIds.add(section?.id);
    if(!filled(section?.title_en)||!filled(section?.title_fr))issues.push("MISSING_SECTION_TITLE");
    if(rows(section?.paragraphs).length!==1)issues.push("EXPECTED_ONE_PARAGRAPH_PER_SECTION");
    for(const p of rows(section?.paragraphs)){
      paragraphCount++;
      if(!filled(p.en)||!filled(p.fr))issues.push("MISSING_BILINGUAL_PARAGRAPH");
      // Editorial instructions belong in the source review, never in the
      // visitor's historical account. Both languages need reader-ready prose.
      const enMeta=/\b(?:the|a|an)\s+(?:atlas(?:\s+(?:card|entry))?|guide(?:\s+(?:card|profile))?|visitor\s+card|historical\s+profile|profile)\s+(?:should|must|may|can|needs?)\b/i;
      const frMeta=/\b(?:le|la|un|une)\s+(?:guide|fiche|atlas|profil)\s+(?:doit|devrait|peut|ne\s+doit)\b/i;
      const enMemo=/\b(?:atlas|guide|profile|visitor card|pilgrimage card|historical profile|editorial)\b/i;
      const frMemo=/\b(?:atlas|guide|fiche|profil|éditorial)\b/i;
      const enImplementation=/\b(?:the|this|our)\s+(?:app|application)\b|\bcanonical\s+(?:map|place|geographic)\b|route[- ]geometry|\b(?:approved\s+(?:photograph|image)|photograph(?:ic)?\s+(?:requires?|must|should|would need))\b/i;
      const frImplementation=/\bl[’\x27]application\b|\bgéographiques?\s+canoniques?\b|\bitinéraire\s+cartographié\s+doit\b/i;
      const enInternalMediaMap=/\b(?:GPS|map pins?|map coordinates?|map records?|canonical (?:Place|site|map|geographic|IDs?|record)|cover image|approved image|image rights|published record|database|the app|the Atlas|photographs?|GPX file)\b/i;
      const frInternalMediaMap=/(?:\bGPS\b|\b(?:photo(?:s|graphies?)?|épingles?\s+cartographiqu(?:e|es)|lieux?\s+canoniques?|identifiants?\s+(?:de\s+)?sites?|tracé\s+GPS|coordonn[ée]es?\s+cartographiqu(?:e|es))\b|l[’']application)/i;
      if(enMeta.test(p.en||"")||frMeta.test(p.fr||"")||enMemo.test(p.en||"")||frMemo.test(p.fr||"")||enImplementation.test(p.en||"")||frImplementation.test(p.fr||"")||enInternalMediaMap.test(p.en||"")||frInternalMediaMap.test(p.fr||""))
        issues.push("EDITORIAL_INSTRUCTIONS_IN_VISITOR_COPY");
      const wave1Bibliography=!filled(p.source_id)&&Number(guide.draft_order)<=56&&
        rows(guide.bibliography_urls).includes(p.source_url);
      const canonicalLink=filled(p.source_id)&&rows(shrine?.source_ids).includes(p.source_id)&&
        bySource.get(p.source_id)?.url===p.source_url;
      const researchSource=bySource.get(p.source_id);
      const researchLink=filled(p.source_id)&&rows(guide?.research_source_ids).includes(p.source_id)&&
        researchSource?.scope==="RESEARCH_ONLY"&&researchSource?.place_id===guide?.place_id&&
        researchSource?.url===p.source_url&&rows(guide?.bibliography_urls).includes(p.source_url);
      const registryLink=canonicalLink||researchLink;
      if(!https(p.source_url)||!(registryLink||wave1Bibliography))
        issues.push("BROKEN_CANONICAL_SOURCE_LINK");
      used.add(registryLink?p.source_id:p.source_url);
    }
  }
  const sources=[...used].map(id=>bySource.get(id)||
    (https(id)?{id,url:id,contribution:"WAVE1_DIRECT_SOURCE_IN_GUIDE_BIBLIOGRAPHY"}:null)).filter(Boolean);
  const locatorOnly=sources.length>0&&sources.every(s=>geographicUrl(s.url));
  if(locatorOnly)issues.push("GEOGRAPHIC_LOCATOR_NOT_HISTORICAL_EVIDENCE");
  const identityOnly=sources.length>0&&sources.every(s=>
    /Evidence of the named physical Catholic site|Formal ecclesiastical designation is not inferred from geographic information|physical map reference/i.test(s.contribution||""));
  if(identityOnly)issues.push("SOURCE_METADATA_LIMITED_TO_SITE_IDENTITY");
  if(!sources.length)issues.push("NO_LINKED_SOURCE");
  // This classifier cannot verify whether a page substantiates each sentence.
  return Object.freeze({place_id:guide?.place_id??null,revision:sacredGuideRevision(guide),
    issues:Object.freeze([...new Set(issues)]),paragraph_count:paragraphCount,
    source_count:sources.length,source_ids:Object.freeze([...used]),
    evidence_alignment_verified:false,publication_ready:false});
}
export function reviewedSacredGuideForReader(guide,shrine,sourceRecords=[],review=null){
  const assessment=inspectSacredGuideEvidence(guide,shrine,sourceRecords);
  // Separate editor's evidence/language decision from owner's release authority.
  if(assessment.issues.some(x=>x!=="GEOGRAPHIC_LOCATOR_NOT_HISTORICAL_EVIDENCE"&&
     x!=="SOURCE_METADATA_LIMITED_TO_SITE_IDENTITY"))return null;
  if(!review||review.place_id!==guide.place_id||
     review.revision!==assessment.revision||
     review.decision!=="APPROVED_FOR_PUBLICATION"||
     review.source_to_claim_checked!==true||
     review.french_reviewed!==true||
     review.english_reviewed!==true||
     review.ecclesial_identity_checked!==true||
     review.owner_release_authorized!==true||
     !filled(review.editor)||!/^20\d\d-\d\d-\d\d$/.test(review.reviewed_on)||
     !https(review.official_url)||!filled(review.region_en)||!filled(review.region_fr))return null;
  // An exact-revision owner-authorised PARTIAL release may omit specific held
  // paragraphs. It can never publish an unchecked paragraph, and cannot be
  // inferred merely because one reviewer left evidence incomplete.
  const partial=review.release_scope==="PARTIAL_VERIFIED_SECTIONS";
  if(review.release_scope && !partial&&review.release_scope!=="COMPLETE_VERIFIED_SECTIONS")return null;
  if(partial&&(review.hold_policy!=="OMIT_UNVERIFIED_PARAGRAPHS"||
      review.verified_paragraphs_only!==true))return null;
  const paragraphEvidence=rows(review.paragraph_evidence);
  if(paragraphEvidence.length!==assessment.paragraph_count)return null;
  const seen=new Set(),sections=[];
  let held=0,published=0;
  for(const section of guide.sections){
    const paragraphs=[];
    for(let i=0;i<section.paragraphs.length;i++){
      const key=section.id+":"+i,e=paragraphEvidence.find(row=>row.key===key);
      const p=section.paragraphs[i];
      if(!e||seen.has(key)||!https(e.source_url)||
         e.source_url!==p.source_url||geographicUrl(e.source_url))return null;
      seen.add(key);
      if(e.checked===false){
        if(!partial||!filled(e.hold_reason))return null;
        held++;
        continue;
      }
      if(e.checked!==true||!filled(e.editor_note))return null;
      paragraphs.push({en:p.en,fr:p.fr,source_url:e.source_url});
      published++;
    }
    if(paragraphs.length)
      sections.push({id:section.id,title_en:section.title_en,title_fr:section.title_fr,paragraphs});
  }
  if(seen.size!==paragraphEvidence.length||published<1||
     (partial&&held<1)||(!partial&&held>0))return null;
  return Object.freeze({
    place_id:guide.place_id,publication:"PUBLISHED",
    official_url:review.official_url,region_en:review.region_en,region_fr:review.region_fr,
    subtitle_en:guide.subtitle_en,subtitle_fr:guide.subtitle_fr,
    image_policy:"USE_APPROVED_PLACE_MEDIA_ONLY",gallery:Object.freeze([]),
    sections:Object.freeze(sections),stops:Object.freeze([]),chronology:Object.freeze([]),
    programmes:Object.freeze([]),visit:null,
  });
}

// One explicit owner decision may authorize an exact list of already
// editor-approved guide revisions. Missing or stale authorization fails closed;
// the owner decision does not substitute for source, language or identity review.
export function resolveSacredGuideBatchAuthorization(reviews=[],batch=null){
  const entries=rows(reviews);
  if(batch==null)return entries;
  if(batch.kind!=="OWNER_EXACT_REVISION_BATCH"||batch.authorized!==true||
     !filled(batch.owner)||!/^20\d\d-\d\d-\d\d$/.test(batch.authorized_on)||
     !rows(batch.approved_revisions).length)
    throw Error("INVALID_OWNER_BATCH_AUTHORIZATION");
  const byPlace=new Map(),approved=new Set();
  for(const r of entries){
    if(!filled(r?.place_id)||byPlace.has(r.place_id))
      throw Error("DUPLICATE_OR_INVALID_EDITORIAL_REVIEW");
    byPlace.set(r.place_id,r);
  }
  for(const row of batch.approved_revisions){
    if(!filled(row?.place_id)||!filled(row?.revision)||approved.has(row.place_id))
      throw Error("DUPLICATE_OR_INVALID_BATCH_GUIDE_REVISION");
    const review=byPlace.get(row.place_id);
    if(!review||review.decision!=="APPROVED_FOR_PUBLICATION"||
       review.revision!==row.revision||review.source_to_claim_checked!==true||
       review.english_reviewed!==true||review.french_reviewed!==true||
       review.ecclesial_identity_checked!==true||!filled(review.editor)||
       !/^20\d\d-\d\d-\d\d$/.test(review.reviewed_on)||
       !rows(review.paragraph_evidence).length)
      throw Error("UNREVIEWED_OR_STALE_BATCH_GUIDE: "+row.place_id);
    approved.add(row.place_id);
  }
  return entries.map(r=>approved.has(r.place_id)?
    {...r,owner_release_authorized:true}:r);
}

export function buildReviewedSacredGuideCorpus(guides=[],shrines=[],sources=[],reviews=[],published=[]){
  const byPlace=new Map(rows(shrines).map(s=>[s.place_id,s]));
  const byReview=new Map();
  for(const r of rows(reviews)){
    if(!filled(r?.place_id)||byReview.has(r.place_id))throw Error("DUPLICATE_OR_INVALID_REVIEW_ID");
    byReview.set(r.place_id,r);
  }
  const existing=new Set(rows(published).map(x=>x?.place_id).filter(Boolean)),seen=new Set(),out=[];
  for(const guide of rows(guides)){
    if(seen.has(guide?.place_id))throw Error("DUPLICATE_DRAFT_PLACE_ID");
    seen.add(guide?.place_id);
    const review=byReview.get(guide.place_id);
    if(!review||review.decision!=="APPROVED_FOR_PUBLICATION")continue;
    if(existing.has(guide.place_id))throw Error("ALREADY_PUBLISHED_PLACE");
    const result=reviewedSacredGuideForReader(guide,byPlace.get(guide.place_id),sources,review);
    if(!result)throw Error("INVALID_EDITORIAL_RELEASE_DECISION: "+guide.place_id);
    out.push(result);
  }
  for(const [id,r] of byReview){
    if(r.decision==="APPROVED_FOR_PUBLICATION"&&!seen.has(id))
      throw Error("ORPHAN_PUBLICATION_APPROVAL: "+id);
  }
  return Object.freeze({schema:"AO_ILLUSTRATED_PLACE_GUIDES_V1",guides:Object.freeze(out)});
}
