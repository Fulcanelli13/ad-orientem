import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildThematicPilots,parseThematicReference} from '../src/scripture/historia-thematic-collections.js';

const read = p => readFileSync(new URL('../' + p, import.meta.url),'utf8');
const registry = JSON.parse(read('data/research/historia-salutis-thematic-episode-reconciliation-20261021.v2.json'));
const catalogue = buildThematicPilots(registry);
const bible = read('src/scripture/library.js');
const owner = read('src/scripture/browser-entry.js');
const style = read('src/scripture/styles.js');
const workbench = read('research/historia-thematic-collections-preview.html');
const episodes = catalogue.flatMap(g=>g.episodes);

assert.equal(episodes.length,19);
assert.deepEqual(catalogue.map(g=>g.episodes.length),[7,6,6]);
assert.equal(new Set(episodes.map(e=>e.id)).size,19);
assert.equal(new Set(episodes.map(e=>e.reference)).size,19);
assert(episodes.every(e=>e.plan.book && e.plan.chapters.length && e.plan.reference===e.reference));
assert.equal(parseThematicReference('Tobit 4–12').chapters.length,9);
assert.equal(parseThematicReference('Judith 8–13').chapters.length,6);
assert.equal(parseThematicReference('Esther 4–8').chapters.length,5);
assert.equal(parseThematicReference('Mark 4:35–41').chapters[0].lastVerse,41);

assert(owner.includes('new URLSearchParams(win.location?.search||"").get("ao_historia_collections")==="1"'),
 'In-app collections must be opt-in research only');
assert(owner.includes('loadThematic()') && owner.includes('buildThematicPilots'));
assert(owner.includes('openThematicEpisode,close'));
assert(owner.includes('thematicCatalogue:thematicCatalogue??thematicCache,initialThematicEpisodeId,'));
assert(bible.includes('openThematicEpisode(id){return selectThematic(id);}'));
assert(bible.includes('setThematicCatalogue(groups,id=null)'));
assert(bible.includes('positionThematic();draw()'));
assert(bible.includes('thematicEpisode.plan.book==="Esther"'));
assert(bible.includes('data') && bible.includes('nav.dataset.historiaCollections="RESEARCH_NOT_PUBLISHED"'));
assert(bible.includes('dataset.historiaActiveEpisode=thematicEpisode.id'));
assert(bible.includes('dataset.historiaExit=""'));
assert(style.includes('.aoScriptureThematic'));
assert(!workbench.includes('src/scripture/library.js'), 'Standalone research prototype remains separate');
assert(!read('src/scripture/historia-thematic-collections.js').includes('innerHTML'));
assert(!read('src/scripture/historia-thematic-collections.js').includes('Math.random'));

const original=JSON.parse(read('data/research/historia-salutis-p3-provisional-reading-chapter-consolidation-20261021.v2.json'));
assert.equal(original.readingChapters.length,54);
assert.equal(original.status,'RESEARCH_NAVIGATION_PROPOSAL_NOT_ACCEPTED');
console.log('PASS: gated in-app thematic Scripture bridge retains canonical reader, all 19 source-coordinate episodes, 54-chapter manuscript lock, and Esther safety.');
