import {parseThematicReference} from './historia-thematic-collections.js';

// The second batch is data-curated, NOT published. The canonical Scripture
// witness loader retains sole verse-text ownership. This adapter does not
// change the 19 actively prototyped collection episodes.
export const THEMATIC_EXPANSION_BATCH2=Object.freeze([
 'miracles_of_christ','parables_and_teachings','biblical_prayers_and_canticles'
]);
export function stagedThematicBatch2(preflight,existingPilotCollections){
 if(preflight?.schema!=='AO_HISTORIA_THEMATIC_COLLECTIONS_EXPANSION_PREFLIGHT_V1' ||
    preflight?.status!=='RESEARCH_NOT_PUBLISHED_NOT_A_SECOND_VERSE_STORE' ||
    preflight?.restrictions?.neverPublishStagedAutomatically!==true ||
    preflight?.restrictions?.oneCanonicalScriptureOwner!==true ||
    !Array.isArray(preflight.stagedEntries) || preflight.stagedEntries.length!==191 ||
    !Array.isArray(preflight.manualSegmentationHolds) ||
    preflight.manualSegmentationHolds.length!==7)
  throw new Error('Unapproved or incomplete source-only expansion inventory');
 if(!Array.isArray(existingPilotCollections) || existingPilotCollections.length!==3)
  throw new Error('The 19-entry initial pilot must remain explicit');
 const piloted=new Set(existingPilotCollections.flatMap(g=>g.episodes.map(e=>e.id)));
 if(piloted.size!==19)throw new Error('Initial pilot cardinality changed');
 const eligible=preflight.stagedEntries.filter(e=>
  e.nextBatch==='BATCH_2_MIRACLES_PARABLES_CANTICLES');
 if(eligible.length!==41)throw new Error('The 41-entry thematic batch changed');
 const seen=new Set(piloted);
 const output=THEMATIC_EXPANSION_BATCH2.map(id=>{
  const episodes=eligible.filter(e=>e.primaryCollectionId===id).map(item=>{
   if(seen.has(item.id) || !/^hist-omitted-\d{3}$/.test(item.id) ||
     item.publicationStatus!=='RESEARCH_STAGED_NOT_LIVE' ||
     item.canonicalEpisodeId!==null||item.approvedCovenantalLink!==null ||
     item.atlasEventId!==null)throw Error('Unreviewed staged identity: '+item.id);
   const plan=parseThematicReference(item.sourceReference);
   if(plan.book!==item.canonicalBook ||
     plan.firstChapter!==item.sourceChapterStart ||
     plan.lastChapter!==item.sourceChapterEnd ||
     plan.chapters.length!==item.requestedChapterCount)
     throw Error('Staged source coordinate has drifted: '+item.id);
   seen.add(item.id);
   return Object.freeze({
    id:item.id,title:item.title,reference:item.sourceReference,
    primaryCollectionId:id,secondaryCollectionIds:Object.freeze(item.secondaryCollectionIds||[]),
    plan,publicationStatus:item.publicationStatus,
    covenantalAnchor:null,atlasEventId:null,
    editorialFlags:Object.freeze([...item.editorialFlags]),
    scriptureTextOwner:'EXISTING_CATHOLIC_WITNESS_LOADER_ONLY'
   });
  });
  return Object.freeze({id,title:id.replaceAll('_',' '),stage:'NOT_LIVE',
   episodes:Object.freeze(episodes)});
 });
 if(output.map(g=>g.episodes.length).join(',')!=='21,17,3' || seen.size!==60)
  throw new Error('Invalid second-batch category counts');
 return Object.freeze(output);
}
