// Editorial-only projection of Canon cue rubric anchors onto rendered R17
// paragraphs. This is NOT a production LIVE rubric/gesture engine.
// It returns no French draft text and never infers priest actions from scroll.
import {resolveCanonLatinWordAnchors} from "./reader-canon-latin-anchors.js";

const CUE=/^AO[.]SM[.]C[0-9]{4}$/;
const FORMS=new Set(["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
const WORD="SOURCE_LATIN_WORDS";
const FROZEN_EMPTY=Object.freeze([]);

function freezeRows(rows){return Object.freeze(rows.map(row=>Object.freeze(row)));}
function latinSurface(paragraph){
  // Private Canon prayer is vernacular-first in the reader; the Latin is
  // its unmodified alternate, not the primary string visible by default.
  if(paragraph?.displayLanguage==="VERNACULAR"){
    return typeof paragraph?.alternate==="string" ? paragraph.alternate : null;
  }
  return typeof paragraph?.primary==="string" ? paragraph.primary : null;
}
export function projectCanonInlineEditorialPlacements({
  paragraphs,controller,promotion,sourceLatinByCue,form="LOW",
  editorialPreview=false,
}={}){
  if(!Array.isArray(paragraphs))throw new TypeError("R17 reader paragraphs required");
  if(editorialPreview!==true || !FORMS.has(String(form).toUpperCase())){
    return Object.freeze({
      status:"EDITORIAL_PREVIEW_DISABLED",publicationReady:0,canPublish:false,
      paragraphs:FROZEN_EMPTY,
    });
  }
  if(typeof controller?.project!=="function"||
     promotion?.schema!=="ao-mass-canon-42-rubric-promotion-review-v1"||
     promotion.status!=="EDITORIAL_TRIAGE_REQUIRES_INDEPENDENT_SOURCE_AND_COPY_APPROVAL"||
     !sourceLatinByCue||typeof sourceLatinByCue!=="object")
    throw new Error("Source-validated Canon controller, 42-cue triage and Latin registry required");
  const decisions=new Map();
  for(const entry of promotion.decisions??[]){
    if(!CUE.test(String(entry.cueId))||decisions.has(entry.cueId)||
       !/^AO[.]CANON[.]R62[.][0-9]{3}$/.test(String(entry.candidateActionId))||
       entry.publication!=="NOT_APPROVED_NOT_VISIBLE")
      throw new Error("Unapproved Canon triage identity is missing or altered");
    decisions.set(entry.cueId,entry);
  }
  if(decisions.size!==42)throw new Error("All 42 unpublished Canon decisions required");

  const seen=new Set();
  const results=paragraphs.map((paragraph,index)=>{
    const ids=Array.isArray(paragraph?.sourceCueIds)
      ?[...new Set(paragraph.sourceCueIds.map(String).filter(id=>CUE.test(id)))] : [];
    const candidateIds=ids.filter(id=>decisions.has(id));
    const placements=[];
    for(const cueId of candidateIds){
      // The same rubric must not be attached to multiple reader paragraphs
      // when a compiled reader includes synthetic/duplicate source surfaces.
      if(seen.has(cueId))throw new Error(cueId+": Canon cue repeated in multiple reader paragraphs");
      seen.add(cueId);
      const decision=decisions.get(cueId);
      const review=controller.project(cueId,{form,editorialPreview:true});
      if(review.previewEnabled!==true || review.canPublish!==false)
        throw new Error(cueId+": Canon review is not strictly editorial");
      const actions=[...(review.priestActions??[]),...(review.ministerActions??[])];
      const matches=actions.filter(a=>a.id===decision.candidateActionId);
      if(matches.length!==1 || matches[0].publishable!==false)
        throw new Error(cueId+": unpublished micro-action source identity diverges");
      const action=matches[0];
      let status,spans=FROZEN_EMPTY;
      if(action.anchorKind!==WORD){
        status="NON_TEXT_SOURCE_EVENT";
      }else if(ids.length!==1){
        status="COMPOSITE_PARAGRAPH_REQUIRES_SOURCE_SEGMENTATION";
      }else{
        const latin=latinSurface(paragraph);
        const original=sourceLatinByCue[cueId];
        if(typeof original!=="string"||typeof latin!=="string" ||latin!==original){
          // Reader text can have corrected or recomposed Latin. Exact offsets
          // from the frozen source must NEVER be copied into that new surface.
          status="RENDERED_LATIN_MISMATCH_REVALIDATION_REQUIRED";
        }else{
          const anchor=resolveCanonLatinWordAnchors({
            sourceLatin:latin,anchorKind:action.anchorKind,
            anchorLatin:action.checkedLatinWords,
          });
          status=anchor.status;
          if(status==="WORD_MATCH_EXACT")
            spans=freezeRows(anchor.spans.map(s=>({
              start:s.start,end:s.end,latin:latin.slice(s.start,s.end),
              sourceCharactersUnchanged:true,
            })));
        }
      }
      placements.push(Object.freeze({
        cueId,actionId:decision.candidateActionId,actor:action.actor,
        reviewTrack:decision.reviewTrack,reviewGate:decision.reviewGate,
        placementPolicy:decision.placement,
        sourceAnchorKind:action.anchorKind,
        status,spans,
        displayText:null,faithfulPosture:null,priestActionNow:null,
        publication:"NOT_APPROVED_NOT_VISIBLE",canPublish:false,
      }));
    }
    return Object.freeze({
      paragraphId:String(paragraph?.id??index),
      owner:"EXACT_SOURCE_CUE_ONLY",sourceCueIds:Object.freeze(ids),
      placements:Object.freeze(placements),canPublish:false,
    });
  });
  return Object.freeze({
    status:"EDITORIAL_PREVIEW_ONLY",publicationReady:0,canPublish:false,
    paragraphs:Object.freeze(results),
    unmatchedGapCueIds:Object.freeze([...decisions.keys()].filter(id=>!seen.has(id))),
  });
}
