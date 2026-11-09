// Inline Ordinary *research references* at the canonical 65-card source cue.
// Only the explicit local Kyriale selection authorizes an example to appear.
// This never assigns a melody to a Mass, certifies notes, replaces its Latin,
// changes a cue, or claims a choir actually sang the selected setting.
import {offlineKyrialeResearchScore} from "./reader-kyriale-research-gabc.js";
import {KYRIALE_RESEARCH_NOTATION_EXAMPLES} from "./reader-kyriale-catalogue.js";
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
export function ordinaryMovementAtSourceParagraph({
  paragraph=null,form=null,resolvedMass=null
}={}){
  if(!paragraph||paragraph.kind==="RUBRIC"||
     !SUNG.has(String(form??"").toUpperCase())||
     isExplicitRequiemMass({session:{resolvedMass}}))return null;
  const cues=Array.isArray(paragraph.sourceCueIds)
    ?paragraph.sourceCueIds.map(String):[String(paragraph.id??"")];
  const anchors=INLINE_ORDINARY_SOURCE_ANCHORS.filter(anchor=>
    cues.includes(anchor.firstCueId) &&
    (!paragraph.sourceBlockId||paragraph.sourceBlockId===anchor.blockId));
  return anchors.length===1?anchors[0]:null;
}

export function offlineOrdinarySettingChoices(movement){
  return Object.freeze(KYRIALE_RESEARCH_NOTATION_EXAMPLES
    .filter(item=>item.movement===movement)
    .map(item=>Object.freeze({id:item.catalogueId,title:item.title,
      scoreId:item.scoreId,sourceUrl:item.sourceUrl})));
}

export function sourceBoundOrdinaryReferenceScores({
  paragraph=null,form=null,resolvedMass=null,selectedSettings={}
}={}){
  const anchor=ordinaryMovementAtSourceParagraph({paragraph,form,resolvedMass});
  if(!anchor)return EMPTY;
  const {movement,blockId,firstCueId}=anchor;
  const settingId=selectedSettings?.[movement];
  if(typeof settingId!=="string"||!settingId)return EMPTY;
  const source=offlineKyrialeResearchScore(movement,settingId);
  if(!source)return EMPTY;
  return Object.freeze([Object.freeze({
    ...source,id:source.scoreId,kind:"ORDINARY_RESEARCH",
    sourceName:source.title,incipit:source.title,
    movement,settingId,sourceBlockId:blockId,sourceCueIds:Object.freeze([firstCueId]),
    // A user-chosen setting is not certification of the actual Mass music.
    sourceContextCertified:false,publicScoreApproved:false,
    note:"Local source-indexed setting, not verified as sung at this Mass. "+
      "1961 GABC neumes, rhythm and Latin underlay await printed collation."
  })]);
}
