import {parseThematicReference} from './historia-thematic-collections.js';

/**
 * Non-published source-coordinate acceptance packet for the sixteen priority
 * main-narrative proposals. Does not create a reading, insert chapter text, or
 * paraphrase canonical Scripture. Printed-edition collation is still required.
 */
export function buildPriority16ScriptureSelections(proposal,review){
 if(proposal?.schema!=='AO_HISTORIA_PRIORITY16_ECONOMICAL_SCRIPTURE_SELECTIONS_V1' ||
    proposal?.status!=='SOURCE_BOUNDARY_CURATED_DRAFT_NOT_APPROVED_NOT_MERGED' ||
    proposal?.constraints?.doNotModify54ChapterManuscript!==true ||
    proposal?.constraints?.discontinuousVersesRenderedWithVisibleGaps!==true ||
    proposal?.constraints?.threeCatholicWitnessesRequired!==true ||
    !Array.isArray(proposal?.entries)||proposal.entries.length!==16 ||
    review?.schema!=='AO_HISTORIA_CORE_RESTORATION_46_EDITORIAL_ADJUDICATION_V1' ||
    review?.status!=='SOURCE_SCREENED_RECOMMENDATIONS_NOT_ACCEPTED' ||
    review.entries?.length!==46)
   throw new Error('Missing or unapproved source-selection owners');
 const byId=new Map(review.entries.map(r=>[r.episodeId,r]));
 const ids=new Set();
 const pack=proposal.entries.map(item=>{
   const base=byId.get(item.episodeId);
   if(!base||base.proposedEditorialDisposition!=='PRIORITY_SCOPED_MAIN_READING_REVIEW' ||
      ids.has(item.episodeId) ||
      item.title!==base.title ||
      JSON.stringify(item.sourceInventoryReferences)!==JSON.stringify(base.sourcePartsInResearchReader) ||
      item.insertionCandidate?.researchMovementId!==base.nearestProposedResearchMovement.id ||
      item.insertionCandidate?.status!=='UNAPPROVED_EDITORIAL_SLOT_NO_MANUSCRIPT_CHANGE' ||
      JSON.stringify(item.insertionCandidate.candidate54ChapterIds)!==
       JSON.stringify(base.nearestProposedResearchMovement.candidate54ChapterIds) ||
      item.selectionApproved!==false ||
      item.publicationApproval!==false ||
      item.currentCanonicalScriptureStatus!=='UNSELECTED_FROM_MAIN_READER' ||
      item.exactVerseWordingsCopiedIntoRegistry!==false ||
      !item.scripturalSelections?.length)
      throw new Error('Unapproved or mismatched source proposal: '+item.episodeId);
   ids.add(item.episodeId);
   const parentSpans=item.sourceInventoryReferences.flatMap(ref=>parseThematicReference(ref).chapters);
   const matchesParent=child=>parentSpans.some(parent=>
    parent.book===child.book && parent.chapter===child.chapter &&
    (parent.firstVerse===null||child.firstVerse>=parent.firstVerse) &&
    (parent.lastVerse===null||child.lastVerse<=parent.lastVerse));
   const pageSpans=item.scripturalSelections.map((part,i)=>{
     if(part.sequence!==i+1||part.scriptureSourceOnly!==true||
        typeof part.function!=='string'||!part.function.trim())
       throw new Error('Scripture source span lacks order/purpose: '+item.episodeId);
     const parsed=parseThematicReference(part.reference);
     if(parsed.firstVerse===null||parsed.lastVerse===null||
        parsed.firstChapter!==parsed.lastChapter||
        parsed.chapters.length!==1||
        !matchesParent(parsed.chapters[0]))
       throw new Error('Source-only excerpt must be an explicit in-bounds verse range: '+item.episodeId);
     return Object.freeze({
      reference:part.reference,sequence:part.sequence,role:part.function,
      ...parsed.chapters[0]
     });
   });
   const duplicates=new Set();
   for(const part of pageSpans){
    if((part.firstVerse??0)>part.lastVerse)
     throw new Error('Inverted verse range');
    for(let n=part.firstVerse;n<=part.lastVerse;n++){
     const key=part.book+':'+part.chapter+':'+n;
     if(duplicates.has(key))throw new Error('Overlapping or repeated excerpt verse: '+key);
     duplicates.add(key);
    }
   }
   const ordered=[...pageSpans].sort((a,b)=>{
     // Reading order is authoritative; only compare a book's own chapter+verse.
     return a.book===b.book?(a.chapter-b.chapter||a.firstVerse-b.firstVerse):0;
   });
   if(ordered.some((x,i)=>x!==pageSpans[i]))
    throw new Error('Biblical source order changed within book: '+item.episodeId);
   if(!item.rationale?.trim()||!item.integrityNote?.trim())
    throw new Error('Incomplete editorial risk disclosure');
   return Object.freeze({
    episodeId:item.episodeId,title:item.title,
    originalReadingRefs:Object.freeze([...item.sourceInventoryReferences]),
    proposalStatus:'RESEARCH_CURATED_NOT_ACCEPTED',
    insertion:Object.freeze({...item.insertionCandidate}),
    integrityNote:item.integrityNote,
    rationale:item.rationale,
    pageSpans:Object.freeze(pageSpans),
    selectionVerseCount:pageSpans.reduce((n,p)=>n+(p.lastVerse-p.firstVerse+1),0),
    usesWitnessTextOnly:true,printedEditionCollationApproved:false
   });
 });
 if(ids.size!==16||pack.reduce((n,e)=>n+e.pageSpans.length,0)!==32)
  throw new Error('Priority-16 research selection inventory has drifted');
 return Object.freeze(pack);
}
