// Read-only source-to-reader music crosswalk. There is no second music
// registry: Schola tracks, the selected reader model, sung source corpus and
// special-rite registry retain their original ownership. This projection
// cannot start, complete or claim observation of a musical performance.
const freeze=Object.freeze;
const unique=xs=>freeze([...new Set(xs.filter(Boolean).map(String))]);
const blockIds=card=>new Set((card?.blocks??[]).map(b=>String(b.blockId??b.Block_ID??"")));
const cueIds=card=>new Set((card?.paragraphs??[]).flatMap(p=>p.sourceCueIds??[]).map(String));
const intersect=(a,b)=>a.some(value=>b.has(value));

export function buildReaderMusicCrosswalk({
  presentationModel,sungCorpus,scholaTracks=[],riteMusicRegistry=null
}={}){
  if(!Array.isArray(presentationModel?.cards))throw new TypeError("Resolved reader cards required");
  if(!Array.isArray(sungCorpus?.blocks))throw new TypeError("Sung source blocks required");
  if(!Array.isArray(scholaTracks))throw new TypeError("Schola track list required");
  if(riteMusicRegistry && riteMusicRegistry.schema!=="ao-mass-special-rite-music-events-v1")
    throw new TypeError("Unverified special-rite music registry");

  const cards=presentationModel.cards;
  const blocks=sungCorpus.blocks;
  const sourceBlocks=new Set(blocks.map(b=>String(b.Block_ID)));
  const ordinary=scholaTracks.map(track=>{
    const donorBlocks=blocks.filter(block=>block.Macro_ID===track.macroId);
    const sources=unique([...(track.canonicalBlockIds??[]),
      ...donorBlocks.map(block=>block.Block_ID)]);
    for(const id of sources)if(!sourceBlocks.has(id))
      throw new Error("Unknown canonical Schola source block "+track.id+":"+id);
    // Sung proper anchor cues and choir-owned phrase cues are different
    // categories. Never claim a priest's source anchor was heard as choir.
    const choirCues=unique((track.segments??[]).map(x=>x.cueId));
    const sourceAnchorCues=unique(sources.flatMap(id=>
      (blocks.find(b=>b.Block_ID===id)?.units??[]).map(u=>u.cue_id)));
    const matching=cards.filter(card=>
      intersect(sources,blockIds(card)) || intersect(choirCues,cueIds(card)));
    return freeze({
      trackId:String(track.id),
      kind:String(track.kind),
      macroId:track.macroId??null,
      sourceBlockIds:sources,
      choirCueIds:choirCues,
      sourceAnchorCueIds:sourceAnchorCues,
      // All IDs below come from the actual selected presentation model,
      // not historical 1..30, 48 or curated-65 numerical guesses.
      presentationCardIds:unique(matching.map(c=>c.sectionId)),
      sourceSectionIds:unique(matching.map(c=>c.sourceSectionId??c.sectionId)),
      sourceEventIds:unique(matching.flatMap(c=>c.sourceEventIds??c.eventIds??[])),
      resolvedPhraseCount:(track.segments??[]).length,
      sourceMapped:matching.length>0,
      performanceStatus:"INDEXED_NOT_OBSERVED",
      clockOwner:"INDEPENDENT_SCHOLA",
    });
  });
  const special=(riteMusicRegistry?.rites??[]).flatMap(rite=>
    (rite.events??[]).map(event=>freeze({
      eventId:String(event.id),
      riteId:String(rite.id),
      // These are existing native-rite stage IDs, NEVER ordinary Mass cards.
      riteStageId:String(event.stageId),
      sourceFile:String(rite.sourceFile),
      sourcePaths:unique(event.sourcePaths??[]),
      kind:String(event.kind),
      performers:String(event.performers),
      condition:String(event.condition),
      endBoundary:event.endBoundary??null,
      performanceStatus:event.kind==="SOURCE_HOLD"
        ? "SOURCE_HOLD" : "INDEXED_NOT_OBSERVED",
      clockOwner:"SPECIAL_RITE_NOT_ORDINARY_SCHOLA",
    })));
  const trackIds=ordinary.map(t=>t.trackId);
  const eventIds=special.map(t=>t.eventId);
  if(new Set(trackIds).size!==trackIds.length)throw new Error("Duplicate Ordinary Schola track");
  if(new Set(eventIds).size!==eventIds.length)throw new Error("Duplicate special-rite music event");
  const unmapped=ordinary.filter(t=>!t.sourceMapped).map(t=>t.trackId);
  return freeze({
    schema:"ao-mass-music-source-crosswalk-v1",
    readerStructureOwner:presentationModel.structureOwner,
    presentationCardCount:cards.length,
    ordinary:freeze(ordinary),
    special:freeze(special),
    ordinaryUnmappedTracks:freeze(unmapped),
    sourceOwners:freeze([
      "reader-text-sung.v1.json",
      "reader-schola.js",
      "resolved presentationModel.cards",
      "mass-special-rite-music-events-20261019.v1.json",
    ]),
    notLivePerformanceEvidence:true,
  });
}
