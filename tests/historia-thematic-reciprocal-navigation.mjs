import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {buildThematicPilots} from '../src/scripture/historia-thematic-collections.js';
import {thematicNearestContext} from '../src/scripture/historia-thematic-context.js';

const text = path => readFileSync(new URL('../'+path,import.meta.url),'utf8');
const json = path => JSON.parse(text(path));
const registry=json('data/research/historia-salutis-thematic-episode-reconciliation-20261021.v2.json');
const cross=json('data/research/historia-salutis-thematic-identity-covenant-context-20261021.v1.json');
const atlas=json('data/explore/bible-places-compact.v1.json');
const reader=json('data/research/historia-salutis-p3-provisional-reading-chapter-consolidation-20261021.v2.json');
const proof=json('data/research/historia-salutis-v18-continuous-reading-proof.v1.json');
const preview=text('prototypes/historia-salutis-p3-continuous-reader-20261021.html');
const owner=text('src/scripture/browser-entry.js');
const library=text('src/scripture/library.js');
const groups=buildThematicPilots(registry);
const pilots=groups.flatMap(g=>g.episodes);
assert.equal(cross.entries.length,19);
assert.equal(pilots.length,19);
assert.equal(reader.readingChapters.length,54);
assert.equal(proof.movements.length,37);

let miracles=0,parables=0,composite=0,unlinked=0,contextual=0,unplaced=0;
const movementMap={};
for(const e of cross.entries){
 const pilot=pilots.find(x=>x.id===e.episodeId);
 assert(pilot, e.episodeId);
 assert.equal(e.reference,pilot.reference);
 const a=e.atlasIdentity;
 if(!a)unlinked++;
 else {
  const place=atlas.entries.find(x=>x.id===a.atlasPlaceId);
  const event=place?.events.find(x=>x.id===a.atlasEventId);
  assert(event,'Atlas event must exist: '+e.episodeId);
  assert.equal(a.atlasSourceReference,event.reference);
  assert.equal(a.confirmedCanonicalEpisodeId,null);
  assert.equal(a.geolocationVerifiedForThisEpisode,false);
  if(a.relation==='SAME_NAMED_SCRIPTURAL_MIRACLE_ATLAS_RECORD'){
   miracles++;assert.equal(event.category,'MIRACLE');
   assert.equal(e.reference,event.reference);
  }else if(a.relation==='SAME_NAMED_SCRIPTURAL_TEACHING_ATLAS_RECORD'){
   parables++;assert.equal(event.category,'LIFE_EVENT');
   assert.equal(e.reference,event.reference);
  }else if(a.relation==='PASSAGE_CONTAINED_IN_COMPOSITE_TEACHING_ATLAS_RECORD'){
   composite++;assert.equal(a.atlasEventId,'olives-additional-069');
   assert.equal(a.atlasSourceReference,'Matthew 25:1–30');
   assert.notEqual(e.reference,event.reference);
  }else throw Error('Unreviewed Atlas relationship: '+a.relation);
 }
 const c=e.covenantalContext;
 if(c){
  contextual++;
  const ch=reader.readingChapters.find(x=>x.id===c.provisionalReaderChapterId);
  const mv=proof.movements.find(x=>x.id===c.sourceMovementId);
  assert(ch&&mv,e.episodeId);
  assert(mv.originalResearchChapterIds.some(h=>ch.originalChapterIds.includes(h)));
  assert.equal(mv.sequence,c.sourceMovementNumber);
  assert.equal(c.sourceSelectedForEpisode,false);
  assert.equal(c.relation,'NEAREST_COVENANT_CONTEXT_NOT_EPISODE_QUOTATION');
  const nearest=thematicNearestContext(e.episodeId,reader);
  assert.equal(nearest.chapterId,c.provisionalReaderChapterId);
  movementMap[e.episodeId]=c.sourceMovementId;
 }else {
  unplaced++;assert.equal(e.episodeId,'hist-omitted-093');
 }
}
assert.deepEqual([miracles,parables,composite,unlinked,contextual,unplaced],[6,3,2,8,18,1]);

const mapMatch=preview.match(/var expected=(\{[^\n]+\});/);
assert(mapMatch,'The existing research manuscript must explicitly whitelist reciprocal episode links');
const embedded=JSON.parse(mapMatch[1]);
assert.deepEqual(embedded,movementMap,'Prototype links must equal source-owned context registry');
assert(preview.includes('window.requestAnimationFrame(function(){target.scrollIntoView'));
assert(preview.includes('url.searchParams.set("ao_historia_collections","1")'));
assert(preview.includes('url.hash=episode'));
assert(preview.includes('The omitted biblical episode is not claimed to occur within this manuscript movement.'));
assert(owner.includes('thematicLinks=mapping;'));
assert(owner.includes('get("ao_historia_collections")==="1"'));
assert(owner.includes('if(/^hist-omitted-\\d{3}$/.test(id))'));
assert(owner.includes('win.addEventListener?.("load",bootReturn,{once:true})'));
assert(library.includes('a.dataset.historiaContextLink=thematicEpisode.id'));
assert(library.includes('dest.searchParams.set("hs_context",c.sourceMovementId)'));
assert(library.includes('dest.searchParams.set("episode",thematicEpisode.id)'));
assert(library.includes('No defensible precise chronological placement for this episode.'));

// Pure browser-URL contract: no external host or unbounded redirects.
for(const [id,anchor] of Object.entries(movementMap)){
 const outbound=new URL('https://reader.example/prototypes/historia-salutis-p3-continuous-reader-20261021.html');
 outbound.searchParams.set('hs_context',anchor);
 outbound.searchParams.set('episode',id);
 const accepted=embedded[id]===outbound.searchParams.get('hs_context');
 assert(accepted,id);
 const returnURL=new URL('../index.html',outbound);
 returnURL.searchParams.set('ao_historia_collections','1');
 returnURL.hash=id;
 assert.equal(returnURL.origin,outbound.origin);
 assert.equal(returnURL.pathname,'/index.html');
 assert.equal(returnURL.hash,'#'+id);
}
assert(!Object.hasOwn(embedded,'hist-omitted-093'));
assert.equal(new URLSearchParams('?ao_historia_collections=0').get('ao_historia_collections'),'0');

// A documented Atlas row is not necessarily one of the 151 live Atlas stops.
const liveAtlas=text('src/find/bible-atlas.js');
const navigable=cross.entries.filter(e=>e.atlasRuntimeNavigation?.eventKey);
const documentedUnroutable=cross.entries.filter(e=>e.atlasIdentity&&!e.atlasRuntimeNavigation?.eventKey);
assert.equal(navigable.length,4);
assert.equal(documentedUnroutable.length,7);
assert.equal(cross.totals.atlasRuntimeNavigable,4);
assert.equal(cross.totals.atlasDocumentedNonRoutable,7);
for(const entry of navigable){
 const a=entry.atlasIdentity;
 assert.equal(entry.atlasRuntimeNavigation.eventKey,'biblical:event:'+a.atlasEventId);
 assert(liveAtlas.includes('"'+a.atlasEventId+'"'));
}
for(const entry of documentedUnroutable){
 assert(!liveAtlas.includes('"'+entry.atlasIdentity.atlasEventId+'"'));
 assert.equal(entry.atlasRuntimeNavigation.status,'ATLAS_RECORD_NOT_IN_151_SEQUENCE');
}
assert(library.includes('linked?.atlasRuntimeNavigation?.status==="EVENT_PRESENT_IN_ATLAS_151_SEQUENCE"'));
assert(library.includes('visit.dataset.scriptureOpenRelatedObject=record.id'));
assert(library.includes('onOpenRelatedObject(record)'));

const originalWitness='data/scripture/witness/dr-challoner/John.json';
const a=json(originalWitness);
assert.equal(a.sourceStatus,'UNCOLLATED_SOURCE_WITNESS');
console.log('PASS Historia reciprocal identity and research-navigation gates: 19 episode links, 6 miracle / 3 teaching / 2 composite Atlas records, 8 unmatched, 18 covenant context returns, 1 chronology hold.');
