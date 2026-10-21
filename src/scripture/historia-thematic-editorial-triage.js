import {parseThematicReference} from './historia-thematic-collections.js';

/** Apply source-seam research findings without ever promoting a candidate to
 * a canonical event, Atlas location, Scripture translation, or selected P3
 * paragraph. The entire source registry remains separately auditable.
 */
export function apply150EditorialTriage(collections,review){
 if(review?.schema!=='AO_HISTORIA_THEMATIC_150_EDITORIAL_CERTIFICATION_QUEUE_V1' ||
    review?.status!=='SOURCE_BOUNDARY_AND_CROSS_VIEW_TRIAGE_NOT_EDITORIAL_CERTIFICATION' ||
    review?.policy?.allEntriesResearchOnly!==true ||
    review?.policy?.atlasMatchesNotCanonicalIdentity!==true ||
    review?.policy?.retainsOriginalInventoryRefs!==true ||
    review?.totals?.rows!==150 ||
    review?.totals?.proposedBoundaryCorrections!==10 ||
    !Array.isArray(review.entries)||review.entries.length!==150)
  throw new Error('Thematic editorial evidence registry is unverified');
 if(!Array.isArray(collections) || collections.flatMap(c=>c.episodes||[]).length!==217)
  throw new Error('The 217 source-owned readings are required');
 const references=new Map(review.entries.map(e=>[e.id,e]));
 if(references.size!==150)throw new Error('Duplicate editorial-review ID');
 let checked=0,corrected=0;
 const adapted=collections.map(group=>Object.freeze({
  ...group,episodes:Object.freeze(group.episodes.map(episode=>{
   const item=references.get(episode.id);
   if(!item)return episode;
   checked++;
   if(episode.publicationStatus!=='RESEARCH_STAGED_NOT_LIVE' ||
      episode.originalInventoryReference!==item.originalInventoryReference ||
      episode.primaryCollectionId!==item.primaryCollectionId ||
      item.published!==false || item.canonicalEpisodeId!==null ||
      item.approvedAtlasEventId!==null ||
      item.approvedCovenantalChapterId!==null ||
      item.catholicEditionCollationStatus!=='UNCOLLATED' ||
      item.auditStatus!=='SOURCE_RANGE_SCREENED_RESEARCH_ONLY_NO_PUBLICATION_APPROVAL')
    throw new Error('Editorial source reference or publication gate drifted: '+episode.id);
   if(!item.correctionJustification)return episode;
   corrected++;
   const parts=item.proposedSourceParts;
   if(!parts?.length||parts.some((p,i)=>p.order!==i+1))
    throw new Error('Missing source-boundary part order for '+episode.id);
   const chapters=parts.flatMap((part,i)=>{
    const plan=parseThematicReference(part.reference);
    return plan.chapters.map((ch,j)=>Object.freeze({
     ...ch,partIndex:i,partCount:parts.length,
     partReference:part.reference,partFirstChapter:j===0,
     companionNotContinuous:i>0&&j===0,
     relation:'SOURCE_SCENE_BOUNDARY_REVIEW_NOT_PUBLISHED'
    }));
   });
   if(!chapters.length)throw new Error('Empty corrected reader span for '+episode.id);
   const scope=parts.map(x=>x.reference).join('; ');
   return Object.freeze({
    ...episode,reference:scope,
    plan:Object.freeze({
     ...episode.plan,reference:scope,book:chapters[0].book,
     type:parts.length>1?'NON_CONTIGUOUS_SOURCE_SEGMENTS':'REVIEWED_SINGLE_SOURCE_WINDOW',
     chapters:Object.freeze(chapters)
    }),
    sourceReviewDisposition:'RESEARCH_SOURCE_WINDOW_REFINEMENT_NOT_PUBLICATION_APPROVAL',
    sourceReviewWarnings:Object.freeze(['RESEARCH_SOURCE_BOUNDARY_REVIEW_NOT_APPROVED']),
    segmentationNote:item.correctionJustification,
    editorialWindowReviewedNotCertified:true
   });
  }))
 }));
 if(checked!==150||corrected!==10)
  throw new Error('Thematic boundary-review coverage changed: '+checked+' / '+corrected);
 return Object.freeze(adapted);
}
