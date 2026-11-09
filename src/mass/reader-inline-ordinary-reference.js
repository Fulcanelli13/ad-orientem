// Inline Ordinary *research references* at the canonical 65-card source cue.
// Only the explicit local Kyriale selection authorizes an example to appear.
// This never assigns a melody to a Mass, certifies notes, replaces its Latin,
// changes a cue, or claims a choir actually sang the selected setting.
import {offlineKyrialeResearchScore} from "./reader-kyriale-research-gabc.js";
import {isExplicitRequiemMass} from "./reader-requiem-conditions.js";

export const INLINE_ORDINARY_SOURCE_ANCHORS=Object.freeze([
  ["KYRIE","AO.SM.B015","AO.SM.C0044"],
  ["GLORIA","AO.SM.B016","AO.SM.C0053"],
  ["CREDO","AO.SM.B027","AO.SM.C0089"],
  ["SANCTUS_BENEDICTUS","AO.SM.B046","AO.SM.C0145"],
  ["AGNUS_DEI","AO.SM.B068","AO.SM.C0222"],
].map(([movement,blockId,firstCueId])=>
  Object.freeze({movement,blockId,firstCueId})));

const SUNG=new Set(["MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
const EMPTY=Object.freeze([]);

// One complete, unchanged 1961 GABC score is mounted at the movement's
// opening source cue. Gloria / Credo may use their combined intonation row;
// later sections must never repeat the entire score.
export function sourceBoundOrdinaryReferenceScores({
  paragraph=null,form=null,resolvedMass=null,selectedSettings={}
}={}){
  if(!paragraph||paragraph.kind==="RUBRIC"||
     !SUNG.has(String(form??"").toUpperCase())||
     isExplicitRequiemMass({session:{resolvedMass}}))return EMPTY;
  const cues=Array.isArray(paragraph.sourceCueIds)
    ?paragraph.sourceCueIds.map(String):[String(paragraph.id??"")];
  const anchors=INLINE_ORDINARY_SOURCE_ANCHORS.filter(anchor=>
    cues.includes(anchor.firstCueId) &&
    (!paragraph.sourceBlockId||paragraph.sourceBlockId===anchor.blockId));
  if(anchors.length!==1)return EMPTY;
  const {movement,blockId,firstCueId}=anchors[0];
  const settingId=selectedSettings?.[movement];
  if(typeof settingId!=="string"||!settingId)return EMPTY;
  const source=offlineKyrialeResearchScore(movement,settingId);
  if(!source)return EMPTY;
  return Object.freeze([Object.freeze({
    ...source,id:source.scoreId,kind:"ORDINARY_RESEARCH",
    movement,settingId,sourceBlockId:blockId,sourceCueIds:Object.freeze([firstCueId]),
    // A user-chosen setting is not certification of the actual Mass music.
    sourceContextCertified:false,publicScoreApproved:false,
    note:"Local source-indexed setting, not verified as sung at this Mass. "+
      "1961 GABC neumes, rhythm and Latin underlay await printed collation."
  })]);
}
