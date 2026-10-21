import {parseThematicReference} from './historia-thematic-collections.js';
import {expandedThematicResearchCollections} from './historia-thematic-expansion.js';

const GENRE_LOCKS=Object.freeze({
 'hist-omitted-173':'PARALLEL_GOSPEL_WITNESSES_NOT_SEQUENTIAL_EVENTS',
 'hist-omitted-217':'LITERARY_WISDOM_FRAME_WITH_MAJOR_OMITTED_MIDDLE'
});
const SEVEN_IDS=Object.freeze(['hist-omitted-007','hist-omitted-056','hist-omitted-077',
 'hist-omitted-095','hist-omitted-114','hist-omitted-173','hist-omitted-217']);

/** Assemble discontinuous source locators without making new Scripture text.
 * Each component part is retained as a distinct chapter/verse navigation page.
 */
export function buildSegmentedResearchEpisodes(registry){
 if(registry?.schema!=='AO_HISTORIA_THEMATIC_COMPOSITE_SCRIPTURE_SEGMENTS_V1' ||
    registry?.status!=='RESEARCH_SOURCE_COORDINATES_ONLY_NOT_PUBLISHED' ||
    registry?.policies?.neverJoinDiscontinuousSourceVersesIntoNewText!==true ||
    registry?.policies?.estherVersificationStrictlyEditionScoped!==true ||
    !Array.isArray(registry.entries)||registry.entries.length!==7)
  throw new Error('Invalid segregated Scripture references');
 const keys=new Set();
 const episodes=registry.entries.map(entry=>{
  if(!SEVEN_IDS.includes(entry.id)||keys.has(entry.id)||
     entry.publicationStatus!=='RESEARCH_SEGMENTED_NOT_APPROVED' ||
     entry.canonicalEpisodeId!==null || entry.atlasEventId!==null ||
     entry.approvedCovenantalLink!==null ||
     !entry.parts?.length || !entry.readerAllowedEditions?.length)
   throw new Error('Unapproved segmented candidate: '+entry.id);
  keys.add(entry.id);
  if(entry.id==='hist-omitted-095' &&
     (entry.readerAllowedEditions.length!==1 ||
      entry.readerAllowedEditions[0]!=='dr-challoner'||
      entry.parts[0]?.reference!=='Esther 14:1–19'))
   throw new Error('Esther prayer may not be remapped automatically');
  if(GENRE_LOCKS[entry.id] && entry.relation!==GENRE_LOCKS[entry.id])
   throw new Error('Wisdom/parallel genre guard changed');
  const chapters=entry.parts.flatMap((part,i)=>{
   if(part.sequence!==i+1 ||
      part.sourceStatus!=='PINNED_UNCOLLATED_SCRIPTURE_WITNESS')
    throw new Error('Invalid part order or source: '+entry.id);
   return parseThematicReference(part.reference).chapters.map((chapter,j)=>Object.freeze({
    ...chapter,
    partIndex:i,partCount:entry.parts.length,
    partReference:part.reference,
    partFirstChapter:j===0,
    companionNotContinuous:i>0&&j===0,
    relation:entry.relation
   }));
  });
  const uniqueChapters=new Set(chapters.map(c=>
   c.book+':'+c.chapter+':'+c.firstVerse+':'+c.lastVerse));
  if(uniqueChapters.size!==chapters.length)throw new Error('Duplicated segment coordinate');
  return Object.freeze({
   id:entry.id,title:entry.title,reference:entry.originalInventoryReference,
   primaryCollectionId:entry.primaryCollectionId,secondaryCollectionIds:Object.freeze([]),
   publicationStatus:entry.publicationStatus,
   plan:Object.freeze({
    reference:entry.originalInventoryReference,book:chapters[0].book,
    chapters:Object.freeze(chapters),
    type:'NON_CONTIGUOUS_SOURCE_SEGMENTS',
    supportedEditions:Object.freeze([...entry.readerAllowedEditions])
   }),
   segmentationNote:entry.note,
   sourceSegmentationRelation:entry.relation,
   covenantalAnchor:null,atlasEventId:null,
   editorialFlags:Object.freeze([entry.relation,'MANUAL_SOURCE_SEGMENTATION']),
   scriptureTextOwner:'EXISTING_CATHOLIC_WITNESS_LOADER_ONLY'
  });
 });
 if(keys.size!==7||SEVEN_IDS.some(id=>!keys.has(id)) ||
    episodes.reduce((n,e)=>n+e.plan.chapters.length,0)!==15)
  throw new Error('Incomplete seven-record Scripture segmentation');
 return Object.freeze(episodes);
}

/** A third research-only mode; the accepted 19- and 60-reading modes are intact. */
export function segmentedThematicResearchCollections(segmentRegistry,preflight,pilots){
 const first=expandedThematicResearchCollections(preflight,pilots);
 const seven=buildSegmentedResearchEpisodes(segmentRegistry);
 const ordered=[...first.map(x=>x.id),'prophets_and_their_lives','life_of_christ'];
 const collections=ordered.map(id=>{
  const original=first.find(x=>x.id===id),extra=seven.filter(e=>e.primaryCollectionId===id);
  const entries=[...(original?.episodes||[]),...extra].sort((a,b)=>Number(a.id.slice(-3))-Number(b.id.slice(-3)));
  return Object.freeze({
   id,title:original?.title||({
    prophets_and_their_lives:'Prophets and Their Lives',life_of_christ:'Life of Christ'
   }[id]),
   stage:'OPT_IN_SEGMENTED_RESEARCH_NOT_PUBLISHED',
   episodes:Object.freeze(entries)
  });
 });
 if(collections.map(g=>g.episodes.length).join(',')!=='11,27,24,3,1,1' ||
    new Set(collections.flatMap(g=>g.episodes.map(e=>e.id))).size!==67)
  throw new Error('Unexpected 67-reading segmented research catalogue');
 return Object.freeze(collections);
}
