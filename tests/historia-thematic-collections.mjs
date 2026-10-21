import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  parseThematicReference, buildThematicPilots,
  selectThematicChapterVerses, THEMATIC_EDITION_IDS
} from '../src/scripture/historia-thematic-collections.js';
import {thematicNearestContext, THEMATIC_NEAREST_CONTEXT}
  from '../src/scripture/historia-thematic-context.js';
import {validateScriptureWitness} from '../src/scripture/witness-loader.js';

const j = p => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const registry = j('../data/research/historia-salutis-thematic-episode-reconciliation-20261021.v2.json');
const manuscript = j('../data/research/historia-salutis-p3-provisional-reading-chapter-consolidation-20261021.v2.json');
const collections = buildThematicPilots(registry);
const episodes = collections.flatMap(c => c.episodes);
assert.deepEqual(collections.map(c => c.episodes.length), [7,6,6]);
assert.equal(episodes.length, 19);
assert.equal(new Set(episodes.map(e => e.id)).size, 19);
assert.equal(manuscript.readingChapters.length, 54);
assert.equal(manuscript.status, 'RESEARCH_NAVIGATION_PROPOSAL_NOT_ACCEPTED');
assert.equal(Object.keys(THEMATIC_NEAREST_CONTEXT).length, 19);
assert.equal(readFileSync(new URL('../research/historia-thematic-collections-preview.html',
  import.meta.url), 'utf8').includes('historia-thematic-preview.js'), true);

assert.deepEqual(
  parseThematicReference('Tobit 4–12').chapters.map(s => s.chapter),
  [4,5,6,7,8,9,10,11,12]
);
assert.equal(parseThematicReference('John 2:1–11').chapters[0].lastVerse,11);
assert.equal(parseThematicReference('1 Samuel 17').book,'1Samuel');
assert.throws(() => parseThematicReference('Noncanonical 7:3'));
assert.throws(() => parseThematicReference('John 2:11–1'));

const witnessCache = new Map();
function witnessFor(edition, book) {
  const key = edition + ':' + book;
  if (!witnessCache.has(key)) {
    const raw = j('../data/scripture/witness/' + edition + '/' + book + '.json');
    witnessCache.set(key, validateScriptureWitness(raw, edition, book));
  }
  return witnessCache.get(key);
}
let checkedPages = 0, checkedVerseRows = 0, missingSlots = 0;
for (const episode of episodes) {
  const context = thematicNearestContext(episode.id, manuscript);
  assert.equal(context.sourceTextPresent, false);
  if (context.chapterId) {
    assert(manuscript.readingChapters.some(c => c.id === context.chapterId));
    assert.equal(context.anchorStatus, 'NEAREST_THEMATIC_CONTEXT_NOT_EXACT_SOURCE_PLACEMENT');
  }
  assert.equal(episode.plan.reference, episode.reference);
  assert.equal(episode.plan.chapters[0].book, episode.plan.book);
  for (const edition of THEMATIC_EDITION_IDS) {
    // Traditional Catholic Esther additions use different chapter schemes.
    if (episode.plan.book === 'Esther' && edition !== 'dr-challoner') continue;
    const rows = witnessFor(edition, episode.plan.book);
    for (const segment of episode.plan.chapters) {
      const rendered = selectThematicChapterVerses(rows, edition, segment);
      assert(rendered.verses.length > 0, episode.reference);
      assert.equal(rendered.sourceStatus, 'UNCOLLATED_SOURCE_WITNESS');
      for (const v of rendered.verses) {
        const original = rows.find(r => r.chapter === v.chapter && r.verseStart === v.verse);
        assert(original, v.reference);
        assert.equal(v.text, original.text, 'Scripture words were altered or generated');
      }
      checkedPages++;
      checkedVerseRows += rendered.verses.length;
      missingSlots += rendered.missingVerseNumbers.length;
    }
  }
}
const sample=[
  {editionId:'dr-challoner',book:'Luke',chapter:10,verseStart:25,text:'A',
    sourceWitness:true,reviewed:false,sourceStatus:'UNCOLLATED_SOURCE_WITNESS'},
  {editionId:'dr-challoner',book:'Luke',chapter:10,verseStart:27,text:'B',
    sourceWitness:true,reviewed:false,sourceStatus:'UNCOLLATED_SOURCE_WITNESS'}
];
const gaps=selectThematicChapterVerses(sample,'dr-challoner',
  parseThematicReference('Luke 10:25–27').chapters[0]);
assert.deepEqual(gaps.missingVerseNumbers,[26]);
assert.throws(()=>selectThematicChapterVerses(
  [{...sample[0],sourceStatus:'APPROVED'}],'dr-challoner',
  parseThematicReference('Luke 10:25–27').chapters[0]));
assert.equal(episodes.find(e=>e.id==='hist-omitted-093').plan.book,'Judith');
assert.equal(thematicNearestContext('hist-omitted-093',manuscript).chapterId,null);
console.log('Historia thematic research contract PASS: 19 episodes, 3 collections, ' +
  checkedPages+' chapter reading views, '+checkedVerseRows+' exact witness verse checks, ' +
  missingSlots+' explicitly signalled gaps; 54 P3 chapters unchanged.');
