// M64 — January 1 and Epiphany source-identity audit, not a player deployment.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const load=path=>JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const registry=load('data/research/mass-music-m64-nativity-octave-epiphany-proper-candidates.v1.json');
const m62=load('data/research/mass-music-m62-christmas-playback-candidates.v1.json');
const index=load('data/mass/chant-corpus/gr1961-proper-index.json');
const sha=s=>createHash('sha256').update(s,'utf8').digest('hex');
const expected=Object.freeze({
 NATIVITY_OCTAVE_INTROIT:[72,'in','33','Puer natus est','CHRISTMAS_DAY_INTROIT',159],
 NATIVITY_OCTAVE_GRADUAL:[1163,'gr','33','Viderunt omnes','CHRISTMAS_DAY_GRADUAL',263],
 NATIVITY_OCTAVE_ALLELUIA:[863,'al','49','Multifarie olim',null,245],
 NATIVITY_OCTAVE_OFFERTORY:[1274,'of','35','Tui sunt caeli','CHRISTMAS_DAY_OFFERTORY',174],
 NATIVITY_OCTAVE_COMMUNION:[1139,'co','35','Viderunt omnes','CHRISTMAS_DAY_COMMUNION',55],
 EPIPHANY_INTROIT:[403,'in','57','Ecce advenit',null,125],
 EPIPHANY_GRADUAL:[205,'gr','57','Omnes de Saba',null,236],
 EPIPHANY_ALLELUIA:[524,'al','58','Vidimus stellam',null,155],
 EPIPHANY_OFFERTORY:[1147,'of','59','Reges Tharsis',null,189],
 EPIPHANY_COMMUNION:[918,'co','59','Vidimus stellam',null,62]
});
assert.equal(registry.schema,'ao-schola-m64-nativity-octave-epiphany-1961-source-audit-v1');
assert.equal(registry.stage,'ARCHIVE_SOURCE_IDENTITIES_AND_EXSURGE_PARITY_RESEARCH_ONLY_NOT_PUBLIC_PLAYER');
assert.equal(registry.editionId,2);
assert.equal(registry.originalArchiveSnapshot,index.snapshotDate);
assert.equal(index.screening.validStaged,1195);
assert.equal(registry.programmeMasses.length,2);
assert.deepEqual(registry.programmeMasses.map(x=>x.id),['NATIVITY_OCTAVE','EPIPHANY']);
assert.deepEqual(registry.programmeMasses.map(x=>x.liturgicalDate),['2027-01-01','2027-01-06']);
assert.equal(new Date('2027-01-01T12:00:00Z').getUTCDay(),5);
assert.equal(new Date('2027-01-06T12:00:00Z').getUTCDay(),3);
assert.deepEqual(registry.programmeMasses.map(x=>x.title1962),[
 'In Octava Nativitatis Domini','In Epiphania Domini']);
assert.deepEqual(registry.programmeMasses.map(x=>x.class),['I','I']);
assert.ok(registry.programmeMasses.every(x=>x.fixedDate));
assert.deepEqual(registry.counts,{
 liturgicalSlots:10,archivedIdentities:10,newToExisting60ScorePlayer:6,
 reusedFromChristmasDay:4,uniqueArchivalScoreIdsInThisAudit:10,
 sourceDigitalNoteheadsAllSlots:1663,sourceDigitalNoteheadsNewScores:1012,
 sourceDigitalNoteheadsReused:651,missingArchiveTranscriptions:0
});
for(const [key,expectedValue] of Object.entries({
 noAutomaticallyPublishedMelodies:true,noPlayerChangesThisStage:true,
 noAutomatedMassAssignment:true,noAutoPlay:true,retain65CardMassReader:true,
 noLowMass:true,noMissalMode:true,noRequiem:true,
 noPrintNeumeCertification:true,noGregorianRhythmCertification:true,
 noEditorialMusicApproval:true,noArchiveRewrite:true,noVercel:true,
 githubActionsAndPagesOnly:true,noPaidServices:true,
 reusedMusicDoNotDuplicateGabc:true,no1974Substitution:true
}))assert.equal(registry.restrictions[key],expectedValue,'restriction changed '+key);
assert.equal(registry.scores.length,10);
const cache=new Map();
const archive=path=>{if(!cache.has(path))cache.set(path,load(path));return cache.get(path)};
const seen=new Set(),sourceIds=new Set();
let newSources=0,reused=0,newNotes=0,reusedNotes=0;
for(const spec of registry.scores){
 const e=expected[spec.selectionId];
 assert.ok(e,'Unrecognized slot '+spec.selectionId);
 assert.equal(spec.selectionId,spec.mass+'_'+spec.role);
 assert.equal(spec.gregobaseId,e[0],spec.selectionId+' archival number');
 assert.equal(spec.scoreId,'GREGOBASE-'+e[0]);
 assert.equal(spec.officePart,e[1]);
 assert.equal(spec.gradualeRomanum1961Page,e[2]);
 assert.equal(spec.incipit,e[3]);
 assert.equal(spec.reuseExistingChristmasDaySelectionId,e[4]);
 assert.equal(spec.sourceNoteheads,e[5]);
 assert.equal(spec.sourceApproval,false);
 assert.equal(spec.printedNoteheadCertification,false);
 assert.equal(spec.autoAssign,false);
 assert.equal(spec.exsurgeGabcParityTested,true);
 assert.ok(!seen.has(spec.selectionId));seen.add(spec.selectionId);
 assert.ok(!sourceIds.has(spec.scoreId));sourceIds.add(spec.scoreId);
 assert.equal(spec.sourceArchivePath,
  'data/mass/chant-corpus/gr1961-proper-'+String(spec.archiveBatch).padStart(3,'0')+'.json');
 const b=archive(spec.sourceArchivePath);
 assert.equal(b.sourceEditionId,2);
 const hits=b.items.filter(x=>x.id===spec.scoreId);
 assert.equal(hits.length,1,'Archive record unique for '+spec.selectionId);
 const source=hits[0];
 assert.equal(source.releaseStatus,'RESEARCH_IMPORT_NOT_EDITORIALLY_APPROVED');
 for(const key of ['gregobaseId','officePart','incipit','sourceUrl','gradualeRomanum1961Page'])
  assert.equal(source[key],spec[key]);
 assert.equal(source.sha256,spec.gabcSha256);
 assert.equal(sha(source.gabc),spec.gabcSha256);
 assert.equal(source.gabc.length,spec.rawGabcLength);
 assert.equal((source.gabc.match(/\(::\)/g)||[]).length,spec.sourceGabcSections);
 assert.equal((source.gabc.match(/[a-m]vv/g)||[]).length,spec.sourceBivirgaMatches);
 assert.equal(spec.phraseNoteCounts.reduce((n,x)=>n+x,0),spec.sourceNoteheads);
 if(spec.reuseExistingChristmasDaySelectionId){
  const previous=m62.scores.find(x=>x.selectionId===spec.reuseExistingChristmasDaySelectionId);
  assert.ok(previous,'Existing Christmas score cannot be fabricated');
  assert.equal(previous.scoreId,spec.scoreId);
  assert.equal(previous.sha256,spec.gabcSha256);
  assert.equal(previous.sourceNotes,spec.sourceNoteheads);
  assert.equal(previous.sourceFingerprint,spec.sourceFingerprint);
  reused++;reusedNotes+=spec.sourceNoteheads;
 }else{newSources++;newNotes+=spec.sourceNoteheads;}
}
assert.deepEqual([...seen].sort(),Object.keys(expected).sort());
assert.equal(newSources,6);assert.equal(newNotes,1012);
assert.equal(reused,4);assert.equal(reusedNotes,651);
const byId=new Map(registry.scores.map(x=>[x.selectionId,x]));
assert.notEqual(byId.get('EPIPHANY_ALLELUIA').scoreId,byId.get('EPIPHANY_COMMUNION').scoreId);
assert.notEqual(byId.get('EPIPHANY_ALLELUIA').officePart,byId.get('EPIPHANY_COMMUNION').officePart);
assert.notEqual(byId.get('NATIVITY_OCTAVE_GRADUAL').scoreId,byId.get('NATIVITY_OCTAVE_COMMUNION').scoreId);
assert.equal(registry.distinctNamesWithDifferentScores.length,2);
assert.ok(registry.sources.some(x=>x.kind==='PRINTED_GRADUALE_1961'));
assert.ok(registry.sources.some(x=>x.kind==='PRINTED_1962_MISSAL'));
console.log('PASS M64: 10 exact Jan 1/Epiphany 1961 Proper archive identities; 6 new melodies, 4 Christmas Day reuses, no runtime modification');
