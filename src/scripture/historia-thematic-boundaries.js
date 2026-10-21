import {parseThematicReference} from './historia-thematic-collections.js';

/** An editorially reviewed research projection, never a new Scripture store.
 * Keep omission-inventory ranges intact as provenance while using precise
 * source witness coordinates as the reading plan.
 */
export function applyThematicBoundaryAudit(collections,sourceAudit){
 if(sourceAudit?.schema!=='AO_HISTORIA_THEMATIC_BATCH2_EDITORIAL_BOUNDARY_AUDIT_V1' ||
    sourceAudit?.status!=='RESEARCH_SOURCE_BOUNDARY_REVIEW_NOT_EDITORIAL_APPROVAL' ||
    !sourceAudit?.policies?.noScriptureTextDuplicated ||
    !sourceAudit?.policies?.keepOriginalInventoryCitations ||
    sourceAudit?.entries?.length!==41)
  throw new Error('Missing 41-entry bounded Scripture audit');
 if(!Array.isArray(collections)||!collections.length)
  throw new Error('No research collections to audit');
 const corrections=new Map(sourceAudit.entries.map(e=>[e.id,e]));
 if(corrections.size!==41)throw new Error('Duplicate source-boundary review');
 let applied=0,adjusted=0;
 const updated=collections.map(group=>Object.freeze({
  ...group,
  episodes:Object.freeze(group.episodes.map(item=>{
   const review=corrections.get(item.id);
   if(!review)return item;
   if(item.publicationStatus!=='RESEARCH_STAGED_NOT_LIVE' ||
      item.reference!==review.originalInventoryReference ||
      item.primaryCollectionId!==review.primaryCollectionId ||
      review.proposedMainNarrativePromotion!==false ||
      review.canonicalAtlasIdentity!==null||review.canonicalCovenantChapterId!==null ||
      !review.readerParts?.length ||
      review.status!=='RESEARCH_WINDOW_SCREENED_NOT_PUBLICATION_APPROVED')
    throw new Error('Incompatible or promoted reading boundary: '+item.id);
   applied++;
   const isChanged=review.boundaryDisposition!=='RETAIN_REFERENCED_PASSAGE';
   if(isChanged)adjusted++;
   const chapters=review.readerParts.flatMap((part,i)=>{
    if(part.partIndex!==i)throw new Error('Source-reading part order changed');
    const p=parseThematicReference(part.reference);
    if(!p.chapters.length)throw new Error('Empty source window');
    return p.chapters.map((row,j)=>Object.freeze({
     ...row,partIndex:i,partCount:review.readerParts.length,
     partReference:part.reference,partFirstChapter:j===0,
     companionNotContinuous:i>0&&j===0,
     relation:part.relationToPrevious
    }));
   });
   const request=review.readerParts.map(x=>x.reference).join('; ');
   const result=Object.freeze({
    ...item,
    title:review.readerTitle,
    reference:request,
    originalInventoryReference:review.originalInventoryReference,
    plan:Object.freeze({
     ...item.plan,
     book:chapters[0].book,
     reference:request,
     chapters:Object.freeze(chapters),
     type:review.readerParts.length>1?'NON_CONTIGUOUS_SOURCE_SEGMENTS':'REVIEWED_SINGLE_SOURCE_WINDOW'
    }),
    publicationStatus:'RESEARCH_STAGED_NOT_LIVE',
    sourceReviewDisposition:review.boundaryDisposition,
    sourceReviewWarnings:Object.freeze([...review.cautionFlags]),
    segmentationNote:review.editorialNote,
    editorialWindowReviewedNotCertified:true
   });
   if(result.scriptureTextOwner!=='EXISTING_CATHOLIC_WITNESS_LOADER_ONLY' ||
      result.atlasEventId!==null || result.covenantalAnchor!==null)
    throw new Error('Publication or provenance error in boundary projection');
   return result;
  }))
 }));
 if(applied!==41||adjusted!==4)
  throw new Error('Some of the 41 source windows were not audited: '+applied+' / '+adjusted);
 return Object.freeze(updated);
}
