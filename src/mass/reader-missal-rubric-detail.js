/**
 * Long Missal rubrics require substantially more ceremonial information than
 * the short text already printed in the 1962 Missal. The previously exported
 * R17 action lists merely repeated the same words and are NOT long rubrics.
 *
 * This file deliberately has no implicit expansion from event counts,
 * source-word anchors or purported research candidates. Release of any
 * future long copy requires independently approved text and matching cue.
 */
import {shouldShowExtendedMissalRubric} from "./reader-missal-book-rubrics.js";
export const MISSAL_RUBRIC_DETAIL_OWNER="MISSAL_CERTIFIED_CEREMONIAL_DETAIL";

export function missalRubricDetailForParagraph(paragraph){
 const detail=paragraph?.approvedExtendedCeremonial;
 if(!shouldShowExtendedMissalRubric(detail))return null;
 if(!Array.isArray(paragraph?.sourceCueIds) ||
    !paragraph.sourceCueIds.includes(detail.cueId) ||
    !/^AO\.SM\.C\d{4}$/.test(String(detail.cueId??"")) ||
    detail.description.trim()===String(paragraph?.primary??"").trim() ||
    detail.description.trim()===String(paragraph?.secondary??"").trim())
   return null;
 return Object.freeze({
   owner:MISSAL_RUBRIC_DETAIL_OWNER,
   sourceCueId:detail.cueId,
   description:detail.description.trim(),
   sourceUrl:detail.sourceUrl,
   observedNow:false,
 });
}
