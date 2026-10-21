import {parseThematicReference} from './historia-thematic-collections.js';
import {segmentedThematicResearchCollections} from './historia-thematic-composite.js';
import {applyThematicBoundaryAudit} from './historia-thematic-boundaries.js';

export const HISTORIA_RESEARCH_ALL_COLLECTIONS=Object.freeze([
 'great_biblical_narratives','prophets_and_their_lives','life_of_christ',
 'miracles_of_christ','parables_and_teachings','encounters_with_christ',
 'apostolic_church','visions_and_revelations','biblical_prayers_and_canticles'
]);

/**
 * Research-only source-coordinate projection of the final 150 inventory rows.
 * No Scripture words, dated chronology, Atlas identity or published text.
 * The first 67 rows retain their existing separately certified research paths.
 */
export function addRemainingThematicReadings(remainder,segmentedAndAuditedCollections,titles){
 if(remainder?.schema!=='AO_HISTORIA_THEMATIC_REMAINDER_EDITORIAL_RESEARCH_V1' ||
    remainder?.status!=='REFERENCE_AND_GENRE_REVIEW_NOT_PUBLICATION_OR_VERSE_COLLATION' ||
    remainder?.policies?.onlyExistingCatholicWitnessWords!==true ||
    remainder?.policies?.neverWriteVerseTextInRegistry!==true ||
    remainder?.policies?.doNotInferAtlasIdentity!==true ||
    !Array.isArray(remainder.entries)||remainder.entries.length!==150)
  throw new Error('The remaining source registry is not verified');
 if(!Array.isArray(segmentedAndAuditedCollections)||
    segmentedAndAuditedCollections.flatMap(g=>g.episodes).length!==67)
  throw new Error('The original 67 research readings are not intact');
 const ids=new Set(segmentedAndAuditedCollections.flatMap(g=>g.episodes.map(e=>e.id)));
 if(ids.size!==67)throw new Error('The prior source reading catalogue contains duplicates');
 const fresh=remainder.entries.map(entry=>{
  if(!/^hist-omitted-\d{3}$/.test(entry.id) ||
    ids.has(entry.id)||entry.reviewStatus!=='REFERENCE_AND_GENRE_REVIEW_RESEARCH_ONLY' ||
    entry.canonicalEpisodeId!==null||entry.atlasIdentity!==null||
    entry.approvedCovenantalContext!==null||entry.publishApproved!==false||
    entry.reusedWitnessTextOnly!==true||!entry.sourceParts?.length)
   throw new Error('A research omission was improperly promoted: '+entry.id);
  ids.add(entry.id);
  const planChapters=entry.sourceParts.flatMap((part,i)=>{
   if(part.order!==i+1)throw new Error('Reading parts out of order: '+entry.id);
   const parsed=parseThematicReference(part.reference);
   if(parsed.book!==part.book || parsed.firstChapter!==part.firstChapter ||
     parsed.lastChapter!==part.lastChapter ||
     parsed.firstVerse!==part.firstVerse||parsed.lastVerse!==part.lastVerse)
    throw new Error('Edited source bounds differ from the audited reference: '+entry.id);
   return parsed.chapters.map((ch,j)=>Object.freeze({
    ...ch,partIndex:i,partCount:entry.sourceParts.length,
    partReference:part.reference,partFirstChapter:j===0,
    companionNotContinuous:i>0&&j===0,
    relation:part.scope
   }));
  });
  const sourceWordsAbsent=Object.hasOwn(entry,'text')||Object.hasOwn(entry,'scriptureText');
  if(sourceWordsAbsent)throw new Error('Prohibited Scripture word copy in the research registry');
  return Object.freeze({
   id:entry.id,title:entry.title,reference:entry.proposedSourceReference,
   originalInventoryReference:entry.originalInventoryReference,
   primaryCollectionId:entry.primaryCollectionId,
   secondaryCollectionIds:Object.freeze([]),
   publicationStatus:'RESEARCH_STAGED_NOT_LIVE',
   plan:Object.freeze({
    reference:entry.proposedSourceReference,book:planChapters[0].book,
    chapters:Object.freeze(planChapters),
    type:entry.sourceParts.length>1?'NON_CONTIGUOUS_SOURCE_SEGMENTS':'REVIEWED_SINGLE_SOURCE_WINDOW'
   }),
   sourceReviewDisposition:entry.reasonCode,
   sourceReviewWarnings:Object.freeze([...entry.scopeWarnings]),
   segmentationNote:entry.editorialNote,
   editorialWindowReviewedNotCertified:true,
   chronologyStatus:entry.chronologyStatus,
   literaryFamily:entry.literaryFamily,
   atlasEventId:null,covenantalAnchor:null,
   scriptureTextOwner:'EXISTING_CATHOLIC_WITNESS_LOADER_ONLY'
  });
 });
 if(ids.size!==217||fresh.length!==150)
  throw new Error('The 217 existing classified Scripture entries were not reconciled');
 const groups=HISTORIA_RESEARCH_ALL_COLLECTIONS.map(id=>{
  const existing=segmentedAndAuditedCollections.find(g=>g.id===id);
  const additions=fresh.filter(ep=>ep.primaryCollectionId===id);
  const combined=[...(existing?.episodes||[]),...additions];
  combined.sort((a,b)=>Number(a.id.slice(-3))-Number(b.id.slice(-3)));
  if(!combined.length)throw new Error('Missing expected thematic category: '+id);
  return Object.freeze({
   id,title:titles?.[id]||existing?.title||id.replaceAll('_',' '),
   stage:'OPT_IN_ALL_217_RESEARCH_ONLY_NOT_PUBLISHED',
   episodes:Object.freeze(combined)
  });
 });
 const counts=groups.map(g=>g.episodes.length).join(',');
 if(counts!=='86,13,26,27,24,8,17,13,3')
  throw new Error('The nine source-collection sizes changed: '+counts);
 return Object.freeze(groups);
}

export function all217ThematicResearchCollections(
 remainder,sourceAudit,segmented,preflight,pilots,collectionTitles){
 const original=segmentedThematicResearchCollections(segmented,preflight,pilots);
 const reviewed=applyThematicBoundaryAudit(original,sourceAudit);
 return addRemainingThematicReadings(remainder,reviewed,collectionTitles);
}
