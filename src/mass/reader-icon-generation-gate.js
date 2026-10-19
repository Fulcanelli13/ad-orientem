// Editorial/release gate, not a renderer. It must never affect the timing,
// source ownership, visibility of liturgical cues, or 1962 Mass text.
const sha256=/^[a-f0-9]{64}$/i;
const nonblank=x=>typeof x==="string"&&x.trim().length>0;
const validUrl=x=>nonblank(x)&&/^https:\/\/[^/\s]+\//i.test(x);
const pathIn=(path,root)=>nonblank(path)&&path.startsWith(root)&&
  !path.split("/").includes("..")&&!path.includes("\\");
const TYPES=new Set(["PHOTOGRAPH","HISTORICAL_ILLUSTRATION","DOCUMENTED_DRAWING"]);
const RIGHTS=new Set(["PUBLIC_DOMAIN_VERIFIED","LICENSED_FOR_TRANSFORMATION","EXPLICIT_PERMISSION"]);
const SOURCE_ROOT="assets/references/mass-icon-originals/";
const OUTPUT_ROOT="assets/generated/mass-icons/";

export function auditGeneratedMassIconCandidate(candidate,{registry,sourceIntegrity={},assetIntegrity={}}={}){
  const blockers=[];
  const pictures=candidate?.originalPictures??[];
  const sourceRequirements=registry?.evidenceRequirements?.originalPicture;
  const comparison=registry?.baseline?.referenceMasters??[];
  if(!registry||registry.schema!=="ao-mass-icon-generation-provenance-v1"||
      sourceRequirements?.required!==true)blockers.push("NO_SOURCE_FIRST_REGISTRY");
  if(!nonblank(candidate?.cueId)||!nonblank(candidate?.targetAction))
    blockers.push("MISSING_CANONICAL_CUE");
  if(!pictures.length)blockers.push("NO_ORIGINAL_PICTURE");
  for(const [index,p] of pictures.entries()){
    const prefix="SOURCE_"+index+"_";
    if(!TYPES.has(p?.kind))blockers.push(prefix+"INVALID_TYPE");
    if(!pathIn(p?.imageOriginalPath,SOURCE_ROOT))blockers.push(prefix+"NOT_STORED_WITH_PROVENANCE");
    if(!sha256.test(p?.sha256??""))blockers.push(prefix+"NO_IMAGE_CHECKSUM");
    if(!validUrl(p?.sourcePageUrl)||!validUrl(p?.sourceImageUrl))
      blockers.push(prefix+"MISSING_VERIFIABLE_ORIGIN");
    if(!nonblank(p?.titleOrDescription)||!nonblank(p?.publisherOrHoldingInstitution)||
        !nonblank(p?.creatorAttributionStatus))
      blockers.push(prefix+"MISSING_CATALOGUE_METADATA");
    if(!(nonblank(p?.photographerOrArtist)||p?.creatorAttributionStatus==="UNKNOWN_RESEARCHED"))
      blockers.push(prefix+"MISSING_CREATOR");
    if(p?.depictsExactAction!==true||!nonblank(p?.specificPoseEvidence))
      blockers.push(prefix+"DOES_NOT_DEPICT_ACTUAL_RITUAL_ACTION");
    if(!RIGHTS.has(p?.imageLicenseStatus)||!validUrl(p?.licenseEvidenceUrl))
      blockers.push(prefix+"RIGHTS_NOT_CLEARED");
    if(sourceIntegrity[p?.imageOriginalPath]!==p?.sha256)
      blockers.push(prefix+"SOURCE_FILE_NOT_VERIFIED");
  }
  if(!nonblank(candidate?.rubricalReference?.section)||
      !validUrl(candidate?.rubricalReference?.url)||
      candidate?.rubricalReview?.state!=="VERIFIED"||
      !nonblank(candidate?.rubricalReview?.details))
    blockers.push("RUBRICAL_VERIFICATION_INCOMPLETE");

  const approvedMasters=new Set(comparison.filter(x=>x.review==="ACCEPT").map(x=>x.key));
  const requiredKeys=candidate?.matchApprovedKeys??[];
  if(requiredKeys.length<2||!requiredKeys.every(x=>approvedMasters.has(x)))
    blockers.push("NOT_COMPARED_WITH_APPROVED_FAMILY");
  const family=candidate?.familyReview;
  if(family?.state!=="APPROVED"||family?.opticalScale32!=="PASS"||
      family?.opticalScale48!=="PASS"||
      !nonblank(family?.reviewEvidence)||!nonblank(family?.bankComparisonNotes)||
      !requiredKeys.every(key=>(family?.comparedMasterKeys??[]).includes(key)))
    blockers.push("APPROVED_FAMILY_HARMONY_NOT_VERIFIED");
  if(candidate?.userApproval?.state!=="APPROVED"||
      !nonblank(candidate?.userApproval?.evidence)||
      !nonblank(candidate?.userApproval?.reviewDate))
    blockers.push("USER_APPROVAL_MISSING");
  if(candidate?.status!=="APPROVED_FOR_PRODUCTION")blockers.push("NOT_RELEASED");
  const art=candidate?.asset;
  if(!pathIn(art?.path,OUTPUT_ROOT)||!sha256.test(art?.sha256??"")||
      assetIntegrity[art?.path]!==art?.sha256)
    blockers.push("GENERATED_ASSET_NOT_VERIFIED");
  return Object.freeze({ok:blockers.length===0,
    blockers:Object.freeze(blockers),
    id:candidate?.id??null,
    status:candidate?.status??"UNKNOWN",
  });
}

export function auditMassIconGenerationRegistry(registry,{sourceIntegrity={},assetIntegrity={}}={}){
  const issues=[];
  if(registry?.schema!=="ao-mass-icon-generation-provenance-v1")issues.push("INVALID_REGISTRY");
  const ids=new Set;
  const results=(registry?.candidates??[]).map(c=>{
    if(ids.has(c.id))issues.push("DUPLICATE_ID:"+c.id);
    ids.add(c.id);
    const gate=auditGeneratedMassIconCandidate(c,{registry,sourceIntegrity,assetIntegrity});
    if(c.status==="APPROVED_FOR_PRODUCTION"&&!gate.ok)
      issues.push("INELIGIBLE_PRODUCTION_ASSET:"+c.id+":"+gate.blockers.join(","));
    return gate;
  });
  for(const excluded of registry?.excludedConcepts??[]){
    if(excluded.releaseEligible!==false||excluded.state!=="UNSOURCED_CONCEPT_ONLY")
      issues.push("UNSOURCED_CONCEPT_NOT_QUARANTINED:"+excluded.id);
  }
  return Object.freeze({ok:issues.length===0,issues:Object.freeze(issues),
    candidates:Object.freeze(results),
    productionEligible:results.filter(x=>x.ok).length,
    blocked:results.filter(x=>!x.ok).map(x=>x.id)});
}
