#!/usr/bin/env node
// Sacred Art research-gallery regression: ownership, selected originals, and rating immutability.
// Manual / CI use: node tests/sacred-art-acquisition-gallery-integrity.mjs
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const readJson = p => JSON.parse(readFileSync(p,'utf8'));
const root = 'data/calendar/sacred-art-review-uploads/';
const baseline = readJson(root+'20261016-unified-review-embedded-data.v1.json');
const reconciled = readJson(root+'20261016-16-category-object-reconciliation.v1.json');
const html = readFileSync('docs/research/review-galleries/ao-sacred-art-unified-curator-20261016.html','utf8');
const open = '<script type="application/json" id="model-data">';
const from = html.indexOf(open), to = html.indexOf('</script>',from);
assert.ok(from >= 0 && to > from, 'Embedded 168-category curator model exists');
const current = JSON.parse(html.slice(from+open.length,to));
assert.equal(baseline.categories.length,168);
assert.equal(current.categories.length,168);
assert.deepEqual(current.seed,baseline.seed,'Human decisions and locked score seeds cannot change');
assert.deepEqual(current.meta,baseline.meta,'Human review provenance cannot change');
const byId = new Map(current.categories.map(c=>[c.id,c]));
assert.equal(byId.size,168,'Unique category IDs');
for(const old of baseline.categories){
 const c=byId.get(old.id);
 assert.ok(c,'Missing original category '+old.id);
 assert.equal(c.index,old.index);
 assert.equal(c.label,old.label);
 const live=new Map(c.works.map(w=>[w.id,w]));
 assert.equal(live.size,c.works.length,'No repeated artwork ID within '+old.id);
 for(const w of old.works){
  const x=live.get(w.id);
  assert.ok(x,'Previously registered original removed: '+w.id);
  for(const k of ['title','artist','historicalArtRating','lockedArtRating','oct12Selected']){
   assert.deepEqual(x[k],w[k],'Historic artwork metadata changed: '+w.id+' '+k);
  }
 }
}
const at = (n,id) => {
 const c=current.categories.find(c=>c.index===n);
 assert.ok(c,'Missing category '+n);
 const w=c.works.find(w=>w.id===id);
 assert.ok(w,'Missing original '+n+':'+id);
 return w;
};
const selected = [
 [135,'ART-nthony-van-yck-amentation-of-hrist','403'],
 [139,'ART-eter-aul-ubens-he-oly-rinity','314']
];
for(const [idx,id,accession] of selected){
 const work=at(idx,id);
 assert.equal(work.oct12Selected,true,'Protected user selection');
 assert.ok(work.photos.some(p=>p.page.includes(accession)&&p.preview.startsWith('https://')),'Exact selected image missing: '+id);
}
const hilary=at(43,'ART-uan-orrea-de-ivar-aint-awrence-aint-ilary-two-sided-altarpiece-panel');
assert.equal(hilary.oct12Selected,true,'Historic 12 October decision retained as history');
assert.equal(hilary.notEligible,true,'Prado Saint Hilary THE HERMIT must not count for Poitiers');
assert.match(hilary.hold,/WRONG_SAINT/);
assert.equal(reconciled.rows.find(x=>x.index===43).subjectIdentityEligible,false);
const damian=at(35,'G30-007');
assert.ok(!damian.photos.some(p=>p.id==='Pierodamiani2.JPG'),'Barbiani photo must not inherit Damian original 5-star artwork score');
const barbiani=at(35,'CLOSEOUT-PETER-DAMIAN-BARBIANI-CLASSENSE');
assert.equal(barbiani.lockedArtRating,false);
assert.ok(barbiani.photos.some(p=>p.id==='Pierodamiani2.JPG'));
const icon=at(81,'B02-HELP-ICON-BYZ');
assert.ok(!icon.photos.some(p=>/Original icon of Our Lady of Perpertual Help/.test(p.id)),'False mosaic must not be shown as original icon');
assert.ok(icon.photos.some(p=>p.id==='PerpetualExact.jpg'));
for(const [idx,id] of [
 [26,'italy-0900119548'],
 [26,'G28-003'],
 [35,'G30-007'],
 [35,'G30-006'],
 [37,'G30-010'],
 [70,'G17-009'],
 [105,'ART-udovico-azzolino-hrist-isputing-with-the-octors'],
 [129,'ART-iandomenico-iepolo-urial-of-hrist-rado-assion-series'],
 [157,'ART-uido-eni-usannah-and-the-lders']
]){
 assert.ok(at(idx,id).photos.length,'Acquired exact-original photo missing from gallery: '+idx+'/'+id);
}
const categoriesWithPhoto=current.categories.filter(c=>c.works.some(w=>w.photos.length)).length;
assert.ok(categoriesWithPhoto>=93,'Research-gallery-linked image coverage regressed');
assert.equal(reconciled.counts.photographicImageAcquisitionCovered,153,'Source acquisition count is NOT gallery-linked count');
assert.equal(reconciled.counts.totalCategories,168);
console.log('PASS Sacred Art gallery integrity: 168 source categories, '+categoriesWithPhoto+' have linked image previews; all human review seed decisions preserved; selected originals and identity holds protected.');
