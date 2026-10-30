// A release-only, fail-closed selector. Research ledgers are deliberately not imported.
import {isPradoHeldArtworkId,pradoProvenanceInMedia} from "./sacred-art-prado-source-holds.js";
// Caller must supply the actual canonical 1962 Proper for the selected date.
const sha = value => typeof value === "string" && /^[0-9a-f]{64}$/i.test(value);
const localPath = value => typeof value === "string"
  && /^assets\/approved\/sacred-art\/[a-zA-Z0-9/_-]+\.(webp|png|jpg|jpeg)$/.test(value)
  && !value.includes("..");
const exactString = value => typeof value === "string" && value.trim().length > 0;

function qualifiedMedia(record) {
  const m=record?.media;
  return record?.status==="PRODUCTION_CERTIFIED"
    && !isPradoHeldArtworkId(record?.artworkId)
    && !pradoProvenanceInMedia(m)
    && m?.nonPradoSourceVerified===true
    && m?.exactOriginalVerified===true
    && m?.publicReuseRightsVerified===true
    && m?.photoFileRightsVerified===true
    && m?.cropVerified===true
    && m?.phoneVisualQaVerified===true
    && m?.localFilePresent===true
    && localPath(m?.path)
    && sha(m?.sha256)
    && exactString(m?.attribution)
    && exactString(m?.sourceUrl)
    && exactString(m?.rightsEvidenceUrl)
    && (m?.rightsBasis==="PUBLIC_DOMAIN" || m?.rightsBasis==="COMPATIBLE_OPEN_LICENCE");
}

export function selectCertifiedSacredArt({resolvedProper, releaseRecords=[], approved=[], rejected=[]}={}) {
  if(resolvedProper?.status!=="ready" || resolvedProper?.source!=="CANONICAL_1962_PROPER"
      || resolvedProper?.gospelVerified!==true || !exactString(resolvedProper?.date)
      || !exactString(resolvedProper?.principalId))return null;
  if(!Array.isArray(releaseRecords)||!Array.isArray(approved)||!Array.isArray(rejected))return null;
  const approvals=new Set(approved.map(x=>typeof x==="string"?x:x?.artworkId));
  const exclusions=new Set(rejected.map(x=>typeof x==="string"?x:x?.artworkId));
  const choices=[];
  for(const r of releaseRecords) {
    if(!approvals.has(r?.artworkId) || exclusions.has(r?.artworkId) || !qualifiedMedia(r))continue;
    for(const p of r.placements||[]) {
      if(p?.status!=="CERTIFIED_EXACT_PLACEMENT" || p.date!==resolvedProper.date
          || p.principalId!==resolvedProper.principalId)continue;
      const gospel=p.role==="GOSPEL_SCENE" && p.match==="GOSPEL_EXACT"
          && exactString(p.gospelRef) && p.gospelRef===resolvedProper.gospelRef;
      const feast=p.role==="FEAST_ICONOGRAPHY" && p.match==="EXACT_FEAST_SUBJECT"
          && p.feastPrincipalId===resolvedProper.principalId;
      if(!gospel && !feast)continue;
      choices.push({r,p,gospel,priority:Number.isInteger(p.priority)?p.priority:99});
    }
  }
  choices.sort((a,b)=>Number(b.gospel)-Number(a.gospel)
    || a.priority-b.priority || a.r.artworkId.localeCompare(b.r.artworkId));
  const picked=choices[0];
  if(!picked)return null;
  return Object.freeze({
    artworkId:picked.r.artworkId,
    src:picked.r.media.path,
    attribution:picked.r.media.attribution,
    rightsBasis:picked.r.media.rightsBasis,
    rightsEvidenceUrl:picked.r.media.rightsEvidenceUrl,
    imageSha256:picked.r.media.sha256,
    role:picked.p.role,
    isLiteralGospelScene:picked.gospel,
    date:resolvedProper.date,
    principalId:resolvedProper.principalId
  });
}
