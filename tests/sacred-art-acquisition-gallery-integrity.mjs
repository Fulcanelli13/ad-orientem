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

assert.match(html,/const fallback=commonsFile\\?original\\.split\\('\\?'\\)\\[0\\]\\+'\\?width=640'/,
  'Mobile image load must never auto-retry an unbounded full-resolution Commons original');
assert.ok(html.includes('Research only · not selectable (identity, image or rights hold)'),
  'Ineligible artworks require a neutral research hold label, not a misleading wrong-saint diagnosis');

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
assert.ok(categoriesWithPhoto===168,'Acquisition-to-gallery linked photo coverage has is not exactly 168; photo pointer source discovery regressions');
const stationCategories=current.categories.filter(c=>c.index>=116&&c.index<=129);
assert.equal(stationCategories.length,14);
assert.ok(stationCategories.every(c=>c.works.some(w=>w.photos.length>0)),'All fourteen Station originals must have an exact source photo linked');
for(const n of [117,119,120,121,123,127]){
 const c=current.categories.find(c=>c.index===n);
 assert.ok(c.works.some(w=>w.photos.some(p=>p.status.includes('CC_BY_SA'))),'The six reopened San Polo source photos must retain their attribution-sharealike licence provenance');
}
for(const n of [89,93,99]){
 const c=current.categories.find(c=>c.index===n);
 assert.ok(c.works.some(w=>w.photos.some(p=>p.id.startsWith('W87-SHA-'))),'W87 verified museum photo disappeared from gallery');
}
// Research images are not themselves rights-cleared, visually approved, or app-published.
const protectedExact = (n,id,needle) => {
 const w=at(n,id);
 const norm=s=>decodeURIComponent(s).toLowerCase().replace(/[^a-z0-9]+/g,'');
 assert.ok(w.photos.some(p=>norm(p.page).includes(norm(needle))), 'Museum-source link missing '+id);
};
for(const n of [101,133])protectedExact(n,'ART-hilippe-de-hampaigne-he-nnunciation','The_Annunciation_MET_DT5656');
for(const n of [113,130,164]){
 protectedExact(n,'ART-ean-estout-entecost','Restout_-_La_Pentec');
 assert.match(at(n,'ART-ean-estout-entecost').hold,/RIGHTS_HOLD/);
}
protectedExact(154,'ART-eter-aul-ubens-aniel-in-the-ions-en','Daniel_in_the_Lions');
protectedExact(19,'met-437722','The_Mass_of_Saint_Gregory');
protectedExact(110,'ART-nthony-van-yck-he-ance-hrust','Christ_on_the_cross_between_the_two_criminals');
protectedExact(167,'ART-ustache-e-ueur-aint-aul-reaching-at-phesus','The_Preaching_of_St_Paul_at_Ephesus');
for(const [idx,originalId,candidateId] of [
 [103,'ART-ean-on-r-me-he-ge-of-ugustus-irth-of-hrist','CLOSEOUT-NATIVITY-GEROME-AMIENS-FINISHED-1855'],
 [131,'ART-ean-on-r-me-he-ge-of-ugustus-irth-of-hrist','CLOSEOUT-NATIVITY-GEROME-AMIENS-FINISHED-1855'],
 [114,'ART-eter-aul-ubens-ssumption-of-the-irgin','CLOSEOUT-ASSUMPTION-ANTWERP-CATHEDRAL-1626'],
 [134,'ART-eter-aul-ubens-ssumption-of-the-irgin','CLOSEOUT-ASSUMPTION-ANTWERP-CATHEDRAL-1626'],
 [111,'ART-eter-aul-ubens-esurrection-of-hrist','CLOSEOUT-RUBENS-RESURRECTION-ANTWERP-CATHEDRAL-1611']
]){
 assert.ok(at(idx,originalId).oct12Selected,'Historic unaccessioned selection remains protected');
 const candidate=at(idx,candidateId);
 assert.equal(candidate.oct12Selected,undefined,'A different physical painting must NOT inherit user selection');
 assert.equal(candidate.historicalArtRating,undefined,'No historic rating inheritance on alternatives');
 assert.equal(candidate.lockedArtRating,false);
 assert.ok(candidate.photos.length);
 assert.match(candidate.hold,/NO_HISTORIC|NO_SCORE/);
}
for(const [idx,work,accession] of [
 [6,'W02-001','P001099'],[11,'ART-eter-aul-ubens-aint-atthias-postolate','P001653']
]){
 const w=at(idx,work);
 assert.ok(w.photos.some(p=>p.status.includes(accession)),'Exact Prado Apostolate source missing '+idx);
}
for(const [idx,original,candidate] of [
 [12,'ART-usepe-de-ibera-aint-aul-postolate','CLOSEOUT-RIBERA-PRADO-SAINT-PAUL-P001074'],
 [13,'ART-usepe-de-ibera-aint-udas-haddeus','CLOSEOUT-RIBERA-PRADO-SAINT-JUDE-P001092'],
 [142,'ART-eter-aul-ubens-ain-and-bel','CLOSEOUT-RUBENS-COURTAULD-P1978PG353-CAIN'],
 [152,'ART-aravaggio-avid-with-the-ead-of-oliath','CLOSEOUT-CARAVAGGIO-BORGHESE-455-DAVID']
]){
 assert.equal(at(idx,original).oct12Selected,true,'Protected historical original not preserved '+idx);
 const w=at(idx,candidate);
 assert.equal(w.oct12Selected,undefined,'User choice incorrectly inherited by separate variant '+idx);
 assert.equal(w.historicalArtRating,undefined,'Historic rating incorrectly inherited by separate variant '+idx);
 assert.ok(w.photos.length,'Research alternative missing its own photo '+idx);
 assert.match(w.hold,/NO_HUMAN|NO_RATING|NO_HISTORIC|NO_SCORE/,'Variant hold missing '+idx);
}
for(const [idx,oldId,alternativeId] of [
 [25,'celine-1894-john-cross','CLOSEOUT-JOHN-CROSS-KATOWICE-1656'],
 [48,'carmel-lisieux-1925-therese-aux-roses','CLOSEOUT-THERESE-HISTORIC-PHOTO-PRE1897']
]){
 const previouslyReviewed=at(idx,oldId);
 const historicalAlternative=at(idx,alternativeId);
 assert.ok(previouslyReviewed,'Previously reviewed work must remain intact');
 assert.ok(historicalAlternative.photos.length,'Unselected historical research image missing');
 assert.equal(historicalAlternative.lockedArtRating,false);
 assert.equal(historicalAlternative.oct12Selected,undefined);
 assert.equal(historicalAlternative.historicalArtRating,undefined);
 assert.match(historicalAlternative.hold,/NO_RATING_TRANSFER/);
}
const cyril=at(41,'CLOSEOUT-NANNONI-1637-CYRIL-0900117888A-1');
assert.equal(cyril.notEligible,true,'Carmelite Cyril of Constantinople versus Jerusalem identity cannot silently pass');
assert.equal(cyril.photos.length,0,'Italian catalogue metadata cannot stand in for painted-surface photograph');
assert.match(cyril.hold,/CARMELITE/);
const fussy=at(43,'CLOSEOUT-HILARY-FUSSY-1703-RESTORATION');
assert.equal(fussy.notEligible,true,'1703 Fussy painting source lacks image/photo licence');
assert.equal(fussy.photos.length,0);
assert.ok(fussy.photoSourceEvidence.officialRegistration.includes('2022'),'Source-registration citation expected');
for(const n of [113,130,164]){
 const w=at(n,'ART-ean-estout-entecost');
 assert.match(w.photoSourceEvidence.museumOfficialArtist,/Jean II Restout/,'Correct 1732 Louvre painter not Restout Elder');
 assert.equal(w.photoSourceEvidence.removeExternalFrameForFinalApp,true,'Painted-surface image needs exterior gilt-frame trimming');
 assert.equal(w.photoSourceEvidence.sourcePhotoRightsUnresolved,true);
}
const solimena=at(41,'CLOSEOUT-SOLIMENA-CYRIL-JERUSALEM-NAPLES-PROVISIONAL');
assert.equal(solimena.notEligible,true,'Solimena museum accession and photographic rights not yet certified');
assert.equal(solimena.lockedArtRating,false,'No 12 Oct human rating transfer to Solimena');
assert.equal(solimena.photos.length,1,'Unselected mobile research source must remain linked');
assert.match(solimena.hold,/MUSEO_DIOCESANO_NAPOLI/);
assert.match(solimena.photos[0].rights,/NEVER app distribution/,'Photo reuse rights have not been cleared');
assert.equal(solimena.photoSourceEvidence.browserInAppTested,false,'Source preview does not establish actual HTML browser QA');
const hilaryPhoto=at(43,'CLOSEOUT-HILARY-AUCTION-CHISWICK-210389');
assert.equal(hilaryPhoto.notEligible,true,'Auction original is a research-only subject lead, not approved as an app image');
assert.equal(hilaryPhoto.historicalArtRating,undefined,'Auction photo cannot inherit previous user rating');
assert.match(hilaryPhoto.hold,/PHOTO_COMMERCIAL_REUSE_RIGHTS_UNCLEARED/);
assert.equal(hilaryPhoto.photos.length,1);
const ineligibleSourceCategories=current.categories.filter(cat=>!cat.works.some(w=>w.photos.length&&!w.notEligible)).map(cat=>cat.index);
assert.deepEqual(ineligibleSourceCategories,[41,43],'Exactly Cyril and Hilary still have no eligible image-source record');
const holdCategories=[];
const missingNow=current.categories.filter(c=>!c.works.some(w=>w.photos.length)).map(c=>c.index).sort((a,b)=>a-b);
assert.deepEqual(missingNow,holdCategories,'All 168 subject categories should have at least one research photo source, not silently substituted');
assert.equal(reconciled.counts.photographicImageAcquisitionCovered,153,'Source acquisition count is NOT gallery-linked count');
assert.equal(reconciled.counts.totalCategories,168);
console.log('PASS Sacred Art gallery integrity: 168 source categories, '+categoriesWithPhoto+' have linked image previews; all human review seed decisions preserved; selected originals and identity holds protected.');
