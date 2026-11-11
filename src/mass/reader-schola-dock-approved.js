// Schola dock score eligibility. Research transcriptions and source-neume
// previews are NOT approved for automatic Mass display. A score must have
// both existing musical/text approval and an explicit independent Schola
// promotion record tied to the actual track, setting and source.
import {APPROVED_MASS_INLINE_GABC} from "./reader-inline-chant-approved.js";
import {selectApprovedInlineScore,selectedMassInlineSettings} from "./reader-inline-chant-selector.js";
import {selectApprovedCompleteScholaTrackScore} from "./reader-live-handoff-schola-track-score.js";

export const SCHOLA_DOCK_APPROVAL_SCHEMA="ao-schola-dock-score-approval-v1";
// Zero Schola promotions as at 10 November 2026. The separately approved
// Ite VIII celebrant/response scores are not Schola tracks. Do not copy
// provisional GregoBase records into this array to make the dock look ready.
export const SCHOLA_DOCK_SCORE_APPROVALS=Object.freeze([]);

const PROPER=Object.freeze({
 INTROIT:{block:"AO.SM.B014",keys:["PROPER_INTROIT"]},
 GRADUAL:{block:"AO.SM.B021",keys:["PROPER_GRADUAL"]},
 ALLELUIA_TRACT_SEQUENCE:{block:"AO.SM.B022",
  keys:["PROPER_ALLELUIA","PROPER_TRACT","PROPER_SEQUENCE"]},
 OFFERTORY:{block:"AO.SM.B030",keys:["PROPER_OFFERTORY"]},
 COMMUNION:{block:"AO.SM.B085",keys:["PROPER_COMMUNION"]}
});
const ORDINARY=new Set(["KYRIE","GLORIA","CREDO","SANCTUS_BENEDICTUS","AGNUS_DEI"]);
const SUNG=new Set(["MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
const clean=s=>String(s??"").trim();

/**
 * Only a positive editorial permission can surface a GABC score in the
 * running Schola dock. Never infer the melody from the feast, an incipit,
 * a parish profile, the priest's card, or a provisional reference preview.
 * The returned score still describes EXPECTED music, not observed singing.
 */
export function selectApprovedScholaDockScore({
 schola,form,resolvedMass,localProgramme,
 approvedScores=APPROVED_MASS_INLINE_GABC,
 approvalRegistry=SCHOLA_DOCK_SCORE_APPROVALS
}={}){
 const track=clean(schola?.trackId);
 const isProper=Object.hasOwn(PROPER,track);
 if(!SUNG.has(clean(form).toUpperCase())||
    (!isProper&&!ORDINARY.has(track))||
    schola?.musicStatus!=="EXPECTED_NOT_OBSERVED"||
    schola?.composedWorkId||!Array.isArray(approvedScores)||
    !Array.isArray(approvalRegistry))return null;
 const segmentId=clean(schola?.segmentId);
 const cueId=clean(schola?.cueId);
 const latin=clean(schola?.latin);
 if(!latin||(isProper?!segmentId:!cueId))return null;
 const sourcePath=clean(resolvedMass?.proper?.data?.sourcePath??
   resolvedMass?.proper?.sourcePath??resolvedMass?.properSource);
 if(isProper&&!sourcePath)return null;
 const settings=selectedMassInlineSettings({localProgramme,resolvedMass});
 const paragraph={
  id:segmentId,kind:"TEXT",primary:latin,sourceCueIds:cueId?[cueId]:[],
  sourceBlockId:isProper?PROPER[track].block:null
 };
 const matches=[];
 for(const row of approvalRegistry){
  if(row?.schema!==SCHOLA_DOCK_APPROVAL_SCHEMA ||
     row.score_status!=="approved"||row.trackId!==track ||
     !clean(row.scoreId)||!clean(row.settingId)||
     row.licence!=="CC0-1.0"||!/^https:\/\//.test(clean(row.sourceUrl))||
     !/^[a-f0-9]{64}$/.test(clean(row.gabcSha256)))continue;
  if(isProper){
   if(row.sourcePath!==sourcePath||
      row.sourceParagraphId!==segmentId||
      row.sourceBlockId!==PROPER[track].block)continue;
  }else if(row.sourceCueId!==cueId)continue;
  const score=approvedScores.find(candidate=>
   candidate?.scoreId===row.scoreId &&
   candidate?.settingId===row.settingId &&
   candidate?.gabcSha256===row.gabcSha256 &&
   (isProper ? PROPER[track].keys.includes(candidate?.selectionKey) &&
      candidate?.sourcePath===sourcePath &&
      candidate?.sourceParagraphId===segmentId &&
      candidate?.sourceBlockId===PROPER[track].block
    : candidate?.selectionKey===track && candidate?.sourceCueId===cueId));
  if(!score||score.sourceUrl!==row.sourceUrl)continue;
  const selected=selectApprovedInlineScore({
   paragraph,form,selectedSettings:settings,resolvedMass,
   approvedScores:[score]
  });
  if(selected)matches.push(selected);
 }
 // A whole approved Kyriale setting can span every native Schola cue in a
 // movement. Require the *complete* native source-track identity, rather
 // than approving each priest-card/syllable as a separate musical score.
 const fullScore=selectApprovedCompleteScholaTrackScore({
   schola,form,resolvedMass,settings,approvedScores,approvalRegistry,
   schema:SCHOLA_DOCK_APPROVAL_SCHEMA
 });
 // Two mutually eligible source records are an ambiguity, never an occasion
 // to choose whichever row happened to appear first.
 if(matches.length+Number(Boolean(fullScore))!==1)return null;
 if(fullScore)return fullScore;
 return Object.freeze({
  ...matches[0],score_status:"approved",
  scholaTrackId:track,scholaSegmentId:segmentId,
  musicalPerformance:"EXPECTED_NOT_OBSERVED"
 });
}
