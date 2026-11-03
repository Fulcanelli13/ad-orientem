// Offline editorial handoff from the existing 1,195-score 1961 archive to
// the selected 1962 Proper and its actual LIVE/MISSAL reader paragraphs.
// Never import archived GABC into the browser or auto-publish a score.
import {matchSelected1962ProperToGraduale,
  source1962ChantOpeningForMatch} from "./reader-proper-gabc-bulk-join.js";

export const INLINE_CHANT_BULK_REVIEW_SCHEMA="ao-mass-inline-proper-editorial-queue-v1";
const SLOT_FOR_TRACK=Object.freeze({
  INTROIT:"INTROIT",GRADUAL:"GRADUAL",
  ALLELUIA_TRACT_SEQUENCE:"ALLELUIA_TRACT_SEQUENCE",
  OFFERTORY:"OFFERTORY",COMMUNION:"COMMUNION"
});
const KEY_FOR_PART=Object.freeze({
  in:"PROPER_INTROIT",gr:"PROPER_GRADUAL",al:"PROPER_ALLELUIA",
  tr:"PROPER_TRACT",of:"PROPER_OFFERTORY",co:"PROPER_COMMUNION"
});
const SOURCE_PATH=/^(?:Tempora|Sancti|Commune)\/[A-Za-z0-9_-]+$/;
const freeze=Object.freeze;
const norm=s=>String(s??"").normalize("NFD")
  .replace(/[\u0300-\u036f]/g,"").replace(/[æ]/gi,"ae")
  .replace(/[œ]/gi,"oe").replace(/[j]/gi,"i")
  .toLowerCase().replace(/[^a-z]+/g," ").trim().replace(/\s+/g," ");
const asSourceLatin=text=>norm(source1962ChantOpeningForMatch(text));
const ownSource=(row,selected)=>String(row?.sourcePath||selected||"");
const sourceRowsFor=(slot,part)=>{
  const rows=slot?.data?.paragraphs;
  if(!Array.isArray(rows))return [];
  if(part==="al"||part==="tr"){
    const kind="AO.CHANT."+(part==="al"?"ALLELUIA":"TRACT");
    return rows.filter(row=>row?.liturgicalGroup===kind);
  }
  if(part==="gr")return rows.filter(row=>row?.liturgicalGroup==="AO.CHANT.GRADUAL");
  return rows;
};
const hold=(track,reason,extra={})=>freeze({
  track:track.track,part:track.part??null,
  selectionKey:KEY_FOR_PART[track.part]??null,
  status:"REVIEW_HOLD",reason,sourceStatus:track.status,
  candidates:freeze([]),...extra
});

/**
 * Turn the existing source-first matcher into paragraph-anchored review leads.
 * Each lead is unpublished. Text matches do not certify pitch, rubrical
 * variant, full-score segmentation, or a parish's actual musical selection.
 */
export function buildSelectedMassInlineProperReviewBatch({
  properSlots,archive,readerParagraphs=[]
}={}){
  const matched=matchSelected1962ProperToGraduale({properSlots,archive});
  const sourcePath=String(matched.sourcePath??"");
  if(matched.status!=="SOURCE_FIRST_CANDIDATES_ONLY_NOT_SCORES")
    return freeze({schema:INLINE_CHANT_BULK_REVIEW_SCHEMA,
      status:"SOURCE_HOLD",sourcePath:sourcePath||null,
      reason:matched.status,tracks:freeze([]),
      candidateCount:0,anchoredCandidateCount:0,publicScores:0});
  const entries=[];
  for(const track of matched.tracks){
    const slot=properSlots?.slots?.[SLOT_FOR_TRACK[track.track]];
    const rows=sourceRowsFor(slot,track.part);
    if(!KEY_FOR_PART[track.part]){
      entries.push(hold(track,"UNSUPPORTED_OR_UNRESOLVED_CHANT_ROLE"));continue;
    }
    if(!track.scoreCandidates?.length){
      entries.push(hold(track,"NO_SOURCE_TEXT_CANDIDATE"));continue;
    }
    if(rows.length!==1||!rows[0]?.id||!rows[0]?.latin){
      entries.push(hold(track,"SOURCE_PARAGRAPH_AMBIGUOUS_OR_MISSING",{sourceRowCount:rows.length}));continue;
    }
    const sourceRow=rows[0],owner=ownSource(sourceRow,sourcePath);
    if(!SOURCE_PATH.test(owner)){
      entries.push(hold(track,"SOURCE_OWNER_NOT_CERTIFIED"));continue;
    }
    const sourceLatin=asSourceLatin(sourceRow.latin);
    const matching=readerParagraphs.filter(row=>
      String(row?.id??"")===String(sourceRow.id)&&
      String(row?.sourcePath||sourcePath)===owner&&
      typeof row?.sourceBlockId==="string"&&row.sourceBlockId.length>4&&
      [row.primary,row.secondary,row.alternate].some(v=>asSourceLatin(v)===sourceLatin));
    if(matching.length!==1){
      entries.push(hold(track,matching.length?"READER_PARAGRAPH_AMBIGUOUS":
        "READER_PARAGRAPH_NOT_SOURCE_ANCHORED",{sourceParagraphId:String(sourceRow.id)}));
      continue;
    }
    const paragraph=matching[0];
    const candidates=freeze(track.scoreCandidates.map(candidate=>freeze({
      scoreId:candidate.scoreId,
      sourceGabcSha256:candidate.sourceGabcSha256,
      sourceUrl:candidate.sourceUrl,
      printed1961Page:candidate.printed1961Page??null,
      matchedOpeningWords:candidate.matchingOpeningWords,
      sourcePath,sourceOwner:owner,
      sourceParagraphId:String(paragraph.id),
      sourceBlockId:paragraph.sourceBlockId,
      sourceCueIds:freeze([...(paragraph.sourceCueIds??[])].map(String)),
      selectionKey:KEY_FOR_PART[track.part],
      original1962Latin:sourceRow.latin,
      approval:"EDITORIAL_REVIEW_REQUIRED",
      musicalNotationVerified:false,fullTextVerified:false,
      publicScore:false
    })));
    entries.push(freeze({track:track.track,part:track.part,
      selectionKey:KEY_FOR_PART[track.part],
      status:track.status==="UNIQUE_SOURCE_TEXT_CANDIDATE"?
        "PARAGRAPH_ANCHORED_MUSIC_REVIEW_REQUIRED":
        "PARAGRAPH_ANCHORED_VARIANT_REVIEW_REQUIRED",
      sourceStatus:track.status,
      sourceParagraphId:String(paragraph.id),sourceBlockId:paragraph.sourceBlockId,
      candidates}));
  }
  return freeze({schema:INLINE_CHANT_BULK_REVIEW_SCHEMA,
    status:"EDITORIAL_REVIEW_ONLY_NO_PUBLICATION",sourcePath,
    tracks:freeze(entries),
    candidateCount:entries.reduce((n,e)=>n+e.candidates.length,0),
    anchoredCandidateCount:entries.filter(e=>e.status.startsWith("PARAGRAPH_ANCHORED_")).length,
    publicScores:0,
    notes:"Compare printed notation, full syllable mapping, 1962 variant, exact chant segmentation and explicit approval before publication."
  });
}

/** Deduplicate recurring source scores across an entire selected-Mass roster. */
export function buildAnnualInlineProperReviewQueue({selectedMasses=[],archive}={}){
  if(!Array.isArray(selectedMasses))throw new TypeError("SELECTED_MASSES_ARRAY_REQUIRED");
  const seenMasses=new Set(),leads=new Map(),batches=[];
  for(const item of selectedMasses){
    const selectedId=String(item?.selectedMassId??"");
    if(!selectedId||seenMasses.has(selectedId))
      throw new Error("SELECTED_MASS_ID_MISSING_OR_DUPLICATED");
    seenMasses.add(selectedId);
    const batch=buildSelectedMassInlineProperReviewBatch({
      properSlots:item.properSlots,archive,readerParagraphs:item.readerParagraphs
    });
    batches.push(freeze({selectedMassId:selectedId,batch}));
    for(const track of batch.tracks){
      for(const candidate of track.candidates??[]){
        const key=[candidate.sourcePath,candidate.sourceOwner,
          candidate.sourceBlockId,candidate.sourceParagraphId,
          candidate.selectionKey,candidate.scoreId,candidate.sourceGabcSha256].join("|");
        const stored=leads.get(key);
        if(stored){stored.occurrences.push(selectedId);continue;}
        leads.set(key,{...candidate,occurrences:[selectedId]});
      }
    }
  }
  const reviewLeads=freeze([...leads.values()].map(lead=>freeze({
    ...lead,occurrences:freeze(lead.occurrences)
  })));
  return freeze({schema:"ao-mass-inline-annual-proper-editorial-queue-v1",
    status:"RESEARCH_ONLY_NOT_PUBLISHED",selectedMassCount:batches.length,
    sourceCandidateOccurrences:batches.reduce((n,b)=>n+b.batch.candidateCount,0),
    distinctReviewLeadCount:reviewLeads.length,
    batches:freeze(batches),reviewLeads,publicScores:0});
}