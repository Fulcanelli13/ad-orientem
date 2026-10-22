import {parseThematicReference} from './historia-thematic-collections.js';

/**
 * Display the 16 curatorial proposals inside the existing Scripture reader.
 * Never replaces the canonical 217-reading corpus or the 54-chapter manuscript;
 * this adapter is enabled ONLY by a separate explicit research-review flag.
 */
export function overlayEconomicalRestorationResearch(selections,decisionLedger,groups){
 if(selections?.schema!=='AO_HISTORIA_SIXTEEN_ECONOMICAL_SCRIPTURE_SELECTIONS_V1' ||
   selections?.status!=='EXACT_SCRIPTURE_COORDINATE_PROPOSALS_UNAPPROVED' ||
   selections?.policy?.originalBibleWordingNeverDuplicated!==true ||
   selections?.policy?.allOmissionsVisiblyDisclosed!==true ||
   selections?.policy?.explicitEditorialAcceptanceBeforeManuscriptEdit!==true ||
   selections?.entries?.length!==16 ||
   decisionLedger?.schema!=='AO_HISTORIA_CORE_RESTORATION_46_EDITORIAL_ADJUDICATION_V1' ||
   decisionLedger?.status!=='SOURCE_SCREENED_RECOMMENDATIONS_NOT_ACCEPTED' ||
   !Array.isArray(groups)||groups.length!==9||
   groups.flatMap(c=>c.episodes).length!==217)
  throw new Error('Restoration draft source/approval gate was not met');
 const approvals=new Map(decisionLedger.entries.map(x=>[x.episodeId,x]));
 const drafts=new Map(selections.entries.map(x=>[x.episodeId,x]));
 if(drafts.size!==16)throw new Error('Duplicated economical-draft identity');
 let converted=0,spans=0,selected=0;
 const revised=groups.map(group=>Object.freeze({
  ...group,
  stage:'SOURCE_ONLY_RESTORATION_ECONOMY_RESEARCH_NOT_PUBLISHED',
  episodes:Object.freeze(group.episodes.map(episode=>{
   const proposal=drafts.get(episode.id);
   if(!proposal)return episode;
   const decision=approvals.get(episode.id);
   if(!decision ||
     decision.proposedEditorialDisposition!=='PRIORITY_SCOPED_MAIN_READING_REVIEW' ||
     decision.nearestProposedResearchMovement.id!==proposal.proposedResearchMovement ||
     decision.mainReaderUpdateApproved!==false||
     decision.publicationApproved!==false||
     episode.reference!==proposal.inventoryScriptureReference ||
     proposal.manuscriptInsertApproved!==false||
     proposal.publicationApproved!==false||
     proposal.status!=='CURATED_DIRECT_SCRIPTURE_COORDINATES_AWAITING_SOURCE_TESTS_AND_ACCEPTANCE')
    throw new Error('Unapproved or unrelated restoration draft: '+episode.id);
   if(!proposal.proposedExcerptParts?.length)throw new Error('Missing source excerpts');
   converted++;
   const pages=proposal.proposedExcerptParts.flatMap((part,index)=>{
    if(part.order!==index+1)throw Error('Excerpt part order changed: '+episode.id);
    const parsed=parseThematicReference(part.reference);
    return parsed.chapters.map((p,j)=>Object.freeze({
     ...p,
     partIndex:index,partCount:proposal.proposedExcerptParts.length,
     partReference:part.reference,partFirstChapter:j===0,
     companionNotContinuous:index>0&&j===0,
     relation:'SOURCE_EXCERPT_NOT_ACCEPTED_FOR_MAIN_NARRATIVE'
    }));
   });
   spans+=proposal.proposedExcerptParts.length;
   selected+=proposal.expectedSelectedVerseCount;
   return Object.freeze({
    ...episode,
    // Source citation is the exact chosen fragments, never modified Scripture.
    reference:proposal.proposedExcerptParts.map(x=>x.reference).join('; '),
    originalInventoryReference:proposal.inventoryScriptureReference,
    plan:Object.freeze({...episode.plan,book:pages[0].book,
     reference:proposal.proposedExcerptParts.map(x=>x.reference).join('; '),
     type:pages.length>1?'NON_CONTIGUOUS_SOURCE_SEGMENTS':'REVIEWED_SINGLE_SOURCE_WINDOW',
     chapters:Object.freeze(pages)}),
    editorialEconomyProposal:Object.freeze({
     status:'NOT_EDITORIALLY_APPROVED',
     originalVerseCount:proposal.expectedSourceVerseCount,
     proposedVerseCount:proposal.expectedSelectedVerseCount,
     proposedMovement:proposal.proposedResearchMovement,
     sourceGapDisclosure:proposal.materialOmissionDisclosure,
     rationale:proposal.editorialRationale
    }),
    segmentationNote:proposal.editorialRationale,
    publicationStatus:'RESEARCH_RESTORATION_DRAFT_NOT_LIVE',
    scriptureTextOwner:'EXISTING_CATHOLIC_WITNESS_LOADER_ONLY'
   });
  }))
 }));
 if(converted!==16||spans!==41||selected!==178)
  throw new Error('Restoration-draft economy changed: '+converted+'/'+spans+'/'+selected);
 return Object.freeze(revised);
}
