/**
 * Formation source-excerpt projection, NOT a textual certification engine.
 * Only an explicitly released, rights-documented editorial manifest can
 * authorize a quotation in the Formation source context. Research queues,
 * bare URLs, author claims, translations and draft P0 material never can.
 * No historical excerpt is included or released by this implementation.
 */
import {sourceReferenceSafeUrl} from "./source-reference-panel.js";

export const MASS_PASSAGE_PUBLICATION_VERSION="ao-formation-approved-passages-v1";
const validDate=value=>typeof value==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&
  !Number.isNaN(Date.parse(value+"T00:00:00Z"));
const nonempty=(value,max=512)=>typeof value==="string"&&value.length>0&&
  value.length<=max&&value.trim()===value;
const languageSet=new Set(["la","en","fr"]);
const rightsSet=new Set(["PUBLIC_DOMAIN","LICENSED","PERMISSION_GRANTED"]);
const release=/^AO-P1-FORMATION-\d{4}-\d{2}-\d{2}-[A-Z0-9]{3,24}$/;
const idPattern=/^AO\.FORM\.PASSAGE\.[0-9]{4}$/;

function isReleasedManifest(manifest){
 return manifest?.schema===MASS_PASSAGE_PUBLICATION_VERSION&&
   manifest?.scope==="FORMATION_ONLY"&&manifest?.status==="RELEASED_FOR_FORMATION"&&
   release.test(manifest.release_id||"")&&
   nonempty(manifest.reviewed_by,120)&&validDate(manifest.approved_on)&&
   Array.isArray(manifest.entries)&&manifest.entries.length>0;
}

function ownedEntry(entry,formation){
 if(!entry||!idPattern.test(entry.id||"")||
   !/^MF0[1-8]$/.test(entry.stage_id||"")||
   !/^SRC-[A-Z0-9-]+$/.test(entry.source_id||"")||
   !languageSet.has(entry.language)||entry.use!=="FORMATION_ONLY"||
   entry.review_status!=="APPROVED_FOR_PUBLICATION"||
   !nonempty(entry.reviewed_by,120)||!validDate(entry.reviewed_on)||
   !nonempty(entry.locus,140)||!nonempty(entry.edition,240)||
   !nonempty(entry.exact_text,12000)||
   !rightsSet.has(entry.rights_basis)||
   !sourceReferenceSafeUrl(entry.rights_evidence_url)||
   !sourceReferenceSafeUrl(entry.edition_url)||
   !Array.isArray(entry.claim_ids)||entry.claim_ids.length===0||
   new Set(entry.claim_ids).size!==entry.claim_ids.length)return false;
 const stage=formation?.stages?.find(row=>row.id===entry.stage_id);
 const source=formation?.sources?.find(row=>row.id===entry.source_id);
 if(!stage||!source)return false;
 const claimed=new Set((stage.claims||[]).filter(claim=>
   claim.sources?.includes(entry.source_id)).map(claim=>claim.id));
 return entry.claim_ids.every(id=>claimed.has(id));
}

/**
 * Fail CLOSED across the whole register on any invalid entry/duplicate.
 * Never accept a caller-provided excerpt detached from the original
 * published Mass Formation stage, claim and source record.
 */
export function releasedMassFormationPassages(manifest,formation){
 if(!isReleasedManifest(manifest)||formation?.schema!=="ao-mass-formation-campion-v1")return Object.freeze([]);
 const seen=new Set();
 for(const entry of manifest.entries){
   if(!ownedEntry(entry,formation)||seen.has(entry.id))return Object.freeze([]);
   seen.add(entry.id);
 }
 return Object.freeze(manifest.entries.map(entry=>Object.freeze({
   id:entry.id,stageId:entry.stage_id,sourceId:entry.source_id,
   language:entry.language,locus:entry.locus,edition:entry.edition,
   editionUrl:sourceReferenceSafeUrl(entry.edition_url),
   exactText:entry.exact_text,
   rightsBasis:entry.rights_basis,
   rightsEvidenceUrl:sourceReferenceSafeUrl(entry.rights_evidence_url),
   claimIds:Object.freeze([...entry.claim_ids])
 })));
}

export function formationPassagesForSource(passages,stageId,sourceId){
 if(!Array.isArray(passages))return Object.freeze([]);
 return Object.freeze(passages.filter(x=>x.stageId===stageId&&x.sourceId===sourceId));
}
