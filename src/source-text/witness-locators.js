import {extractReviewedEdition} from "./edition-adapters.js";
// Witness-level canonical locator parsing. Does not fetch or reproduce body text.
// The profile registry is research metadata, not a rights or editorial certificate.
const NAT=/^[1-9][0-9]{0,5}$/;
const ROMAN=["I","II","III","IV","V"];
const PROFILE_ID=/^WIT-[A-Z0-9]+(?:-[A-Z0-9]+)*$/;
export function normalizeWitnessLocator(profile,raw){
 if(!profile||!PROFILE_ID.test(profile.id??"")||typeof raw!=="string")
  throw new Error("SOURCE_WITNESS_PROFILE_INVALID");
 if(!["HTML_CONTENT_READ_2026-10-15"].includes(profile.verified) ||
    profile.handling!=="INDEX_AND_LINK_ONLY")
  throw new Error("SOURCE_WITNESS_CONTENT_NOT_INSPECTED");
 const loc=raw.trim();let key,label,externalPage=null;
 switch(profile.locatorFamily){
  case "PAPAL_EN_NUMBERED_PARAGRAPH":{
   // Official English body paragraphs; the footnote list has its own numbers.
   const n=loc.match(/^(?:§\s*)?([1-9][0-9]{0,2})$/);
   if(!n||Number(n[1])>210)throw new Error("SOURCE_WITNESS_PARAGRAPH_INVALID");
   key="md-en-p"+n[1].padStart(3,"0");label="§"+Number(n[1]);break;
  }
  case "TANQUEREY_NUMBERED_SECTION":{
   const n=loc.match(/^(?:§\s*|#\s*)?([1-9][0-9]{0,3})$/);
   if(!n)throw new Error("SOURCE_WITNESS_SECTION_INVALID");
   key="tanquerey-s"+n[1].padStart(4,"0");label="§"+Number(n[1]);break;
  }
  case "HUME_ENQUIRY_SECTION_PARAGRAPH":{
   const m=loc.match(/^E\s+([1-9]|1[0-2])\.([1-9][0-9]{0,2})$/i);
   if(!m)throw new Error("SOURCE_WITNESS_HUME_LOCATOR_INVALID");
   key="hume-e"+m[1].padStart(2,"0")+"-p"+m[2].padStart(3,"0");
   label="E "+Number(m[1])+"."+Number(m[2]);break;
  }
  case "SALES_PART_CHAPTER":{
   const m=loc.match(/^(I|II|III|IV|V)\.([1-9][0-9]?)$/i);
   if(!m)throw new Error("SOURCE_WITNESS_SALES_CHAPTER_INVALID");
   key="sales-part-"+m[1].toLowerCase()+"-ch"+m[2].padStart(2,"0");
   label="Part "+m[1].toUpperCase()+", ch. "+Number(m[2]);break;
  }
  case "PRINTED_PAGE_EXCERPT":{
   // Printed-page identity is distinct from the DjVu scan sequence number.
   const m=loc.match(/^p([1-9][0-9]{0,3}):s([0-9]{3})$/);
   if(!m)throw new Error("SOURCE_WITNESS_PRINT_PAGE_INVALID");
   key="ce1913-v3-p"+m[1]+"-s"+m[2];
   label="p"+m[1]+":s"+m[2];break;
  }
  default:throw new Error("SOURCE_WITNESS_LOCATOR_UNREVIEWED");
 }
 return Object.freeze({workId:profile.sourceWorkId,witnessProfileId:profile.id,
  sourceLocator:label,sourceAnchor:key,locatorAudit:"SHAPE_VALID_ONLY_NOT_TEXT_COLLATED",
  externalPage:profile.witnessUrl??null});
}
export function validateExternalLocatorBinding({profile,locator,hostUrl,nodeKind="body"}={}){
 if(nodeKind!=="body")throw new Error("SOURCE_WITNESS_NONBODY_LOCATOR_REFUSED");
 const record=normalizeWitnessLocator(profile,locator);
 if(typeof hostUrl!=="string"||!hostUrl.startsWith("https://"))
  throw new Error("SOURCE_WITNESS_LINK_REQUIRED");
 const allowed=[profile.witnessUrl,...(profile.witnessUrls??[])].filter(Boolean);
 if(!allowed.includes(hostUrl))throw new Error("SOURCE_WITNESS_URL_NOT_REGISTERED");
 if(profile.observedLocatorPages){
  const pinned=profile.observedLocatorPages[record.sourceLocator];
  if(!pinned)throw new Error("SOURCE_WITNESS_LOCATOR_PAGE_UNVERIFIED");
  if(pinned!==hostUrl)throw new Error("SOURCE_WITNESS_LOCATOR_WRONG_PAGE");
 }
 return Object.freeze({...record,externalPage:hostUrl});
}
export function editionQualifiedCitation({work,passageId,sourceAnchor}={}){
 if(!work||typeof work.id!=="string"||typeof work.editionId!=="string"||
    typeof work.witnessId!=="string"||
    !work.id.startsWith("WORK-")||
    !work.editionId.trim()||!work.witnessId.trim()||
    typeof passageId!=="string"||!passageId.startsWith(work.id+"/")||
    !/^[a-z0-9][a-z0-9-]{0,79}$/.test(sourceAnchor??""))
  throw new Error("SOURCE_CITATION_QUALIFICATION_INVALID");
 return [work.id,work.editionId,work.witnessId,sourceAnchor].map(encodeURIComponent).join("::");
}
// Reshape a manually inspected, cleared excerpt into the existing edition adapter.
// No publisher-specific scraping, automatic footnote splitting or rights changes.
export function createAnchoredWitnessFixture({profile,hostUrl,heading,records}={}){
 if(!Array.isArray(records)||!records.length||records.length>10000||
    typeof heading!=="string"||!heading.trim())
  throw new Error("SOURCE_WITNESS_EXTRACT_INVALID");
 const seen=new Set(),rows=[],bindings=[];
 for(const record of records){
  if(typeof record.text!=="string"||!record.text.trim()||
     /[\u0000-\u001f]/.test(record.text))
   throw new Error("SOURCE_WITNESS_TEXT_INVALID");
  const binding=validateExternalLocatorBinding({profile,locator:record.locator,hostUrl:record.hostUrl??hostUrl});
  if(seen.has(binding.sourceAnchor))throw new Error("SOURCE_WITNESS_LOCATOR_DUPLICATE");
  seen.add(binding.sourceAnchor);bindings.push(binding);
  rows.push("["+binding.sourceAnchor+"] "+record.text);
 }
 return Object.freeze({adapter:"numbered-paragraphs-v1",
  headedText:"# "+heading.trim()+"\n"+rows.join("\n"),
  locators:Object.freeze(bindings)});
}

export function extractReviewedWitnessDocument({profile,work,review,hostUrl,heading,records}={}){
 if(profile?.sourceWorkId!==work?.id||profile?.id!==work?.witnessId)
  throw new Error("SOURCE_WITNESS_WORK_IDENTITY_MISMATCH");
 const prepared=createAnchoredWitnessFixture({profile,hostUrl,heading,records});
 const selectedReview={...review,adapter:prepared.adapter};
 const parsed=extractReviewedEdition({work,review:selectedReview,sourceText:prepared.headedText});
 if(parsed.passages.length!==prepared.locators.length)
  throw new Error("SOURCE_WITNESS_EXTRACT_ALIGNMENT_FAILED");
 const passages=parsed.passages.map((passage,i)=>{
  const source=prepared.locators[i];
  if(!passage.id.endsWith("/"+source.sourceAnchor))
   throw new Error("SOURCE_WITNESS_EXTRACT_ANCHOR_MISMATCH");
  const extent=records[i]?.sourceExtent;
  if(extent!==undefined&&!["SENTENCE_ONLY","COMPLETE_PRINTED_PARAGRAPH_PRELIMINARY","PARAGRAPH_OPENING_FRAGMENT"].includes(extent))
   throw new Error("SOURCE_WITNESS_EXTENT_INVALID");
  return Object.freeze({...passage,sourceLocator:source.sourceLocator,
   ...(extent===undefined?{}:{sourceExtent:extent}),
   sourcePage:source.externalPage,
   editionQualifiedCitation:editionQualifiedCitation({work,passageId:passage.id,
    sourceAnchor:source.sourceAnchor})});
 });
 return Object.freeze({...parsed,passages:Object.freeze(passages)});
}
