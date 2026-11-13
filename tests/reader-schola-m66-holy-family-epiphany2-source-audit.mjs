// M66 source-identity and calendar audit. Research only; no playback mutation.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gabcResearchFingerprint} from '../src/mass/reader-schola-exsurge-gabc-melody.js';
const load=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const registry=load('data/research/mass-music-m66-holy-family-epiphany2-proper-candidates.v1.json');
const index=load('data/mass/chant-corpus/gr1961-proper-index.json');
const m65=load('data/research/mass-music-m64-nativity-octave-epiphany-proper-candidates.v1.json');
const sha=s=>createHash('sha256').update(s,'utf8').digest('hex');
const expected={
 HOLY_FAMILY_INTROIT:[336,'in','59','Exsultet gaudio'],
 HOLY_FAMILY_GRADUAL:[260,'gr','60','Unam petii... Beati'],
 HOLY_FAMILY_ALLELUIA:[816,'al','61','Vere tu es'],
 HOLY_FAMILY_OFFERTORY:[93,'of','63','Tulerunt Jesum'],
 HOLY_FAMILY_COMMUNION:[626,'co','63','Descendit Jesus (Comm.)'],
 EPIPHANY2_INTROIT:[13,'in','67','Omnis terra'],
 EPIPHANY2_GRADUAL:[932,'gr','68','Misit Dominus'],
 EPIPHANY2_ALLELUIA:[538,'al','68','Laudate Deum'],
 EPIPHANY2_OFFERTORY:[937,'of','69','Jubilate Deo universa'],
 EPIPHANY2_COMMUNION:[230,'co','70','Dicit Dominus']
};
assert.equal(registry.schema,'ao-schola-m66-holy-family-epiphany2-1961-source-audit-v1');
assert.equal(registry.stage,'ARCHIVE_SOURCE_IDENTITY_SCREEN_PENDING_EXSURGE_NOTE_COUNT_REPORT_NO_PLAYER_CHANGE');
assert.equal(registry.editionId,index.sourceEditionId);
assert.equal(registry.originalArchiveSnapshot,index.snapshotDate);
assert.equal(index.screening.validStaged,1195);
assert.equal(registry.programmeMasses.length,2);
assert.deepEqual(registry.programmeMasses.map(x=>x.id),['HOLY_FAMILY','EPIPHANY2']);
assert.deepEqual(registry.programmeMasses.map(x=>x.liturgicalDate),['2027-01-10','2027-01-17']);
assert.deepEqual(registry.programmeMasses.map(x=>x.title1962),[
 'Sanctae Familiae Jesu Mariae Joseph','Dominica II post Epiphaniam']);
assert.deepEqual(registry.programmeMasses.map(x=>x.class),['II','II']);
assert.deepEqual(registry.programmeMasses.map(x=>x.liturgicalColour),['WHITE','GREEN']);
assert.equal(new Date('2027-01-10T12:00:00Z').getUTCDay(),0);
assert.equal(new Date('2027-01-17T12:00:00Z').getUTCDay(),0);
assert.equal(new Date('2027-01-24T12:00:00Z').getUTCDay(),0);
assert.ok(registry.programmeMasses[1].rubric.includes('Septuagesima'));
assert.deepEqual(registry.programmeMasses.map(x=>x.expectedRoles),[
 ['INTROIT','GRADUAL','ALLELUIA','OFFERTORY','COMMUNION'],
 ['INTROIT','GRADUAL','ALLELUIA','OFFERTORY','COMMUNION']]);
assert.deepEqual(registry.counts,{
 liturgicalSlots:10,archivedIdentities:10,newToExisting66ScorePlayer:10,reusedFromExistingPlayer:0,
 uniqueArchivalScoreIdsInThisAudit:10,missingArchiveTranscriptions:0,
 sourceDigitalNoteheadsAllSlots:null,sourceDigitalNoteheadsCertifiedForResearch:false});
assert.equal(m65.scores.length,10);
assert.equal(registry.scores.length,10);
for(const key of [
 'noAutomaticallyPublishedMelodies','noPlayerChangesThisStage','noAutomatedMassAssignment',
 'noAutoPlay','retain65CardMassReader','noLowMass','noMissalMode','noRequiem',
 'noPrintNeumeCertification','noGregorianRhythmCertification',
 'noEditorialMusicApproval','noArchiveRewrite','noVercel','githubActionsAndPagesOnly',
 'noPaidServices','no1974Substitution'
])assert.equal(registry.restrictions[key],true,key);
const cache=new Map(),seen=new Set(),identity=new Set();
function archive(path){
 if(!cache.has(path))cache.set(path,load(path));
 return cache.get(path);
}
for(const spec of registry.scores){
 const known=expected[spec.selectionId];
 assert.ok(known,'Unexpected feast/day or slot '+spec.selectionId);
 assert.equal(spec.mass+'_'+spec.role,spec.selectionId);
 assert.equal(spec.gregobaseId,known[0]);
 assert.equal(spec.scoreId,'GREGOBASE-'+known[0]);
 assert.equal(spec.officePart,known[1]);
 assert.equal(spec.gradualeRomanum1961Page,known[2]);
 assert.equal(spec.incipit,known[3]);
 assert.equal(spec.sourceArchivePath,
  'data/mass/chant-corpus/gr1961-proper-'+String(spec.archiveBatch).padStart(3,'0')+'.json');
 assert.ok(!seen.has(spec.selectionId));seen.add(spec.selectionId);
 assert.ok(!identity.has(spec.scoreId));identity.add(spec.scoreId);
 assert.ok(!m65.scores.some(x=>x.scoreId===spec.scoreId));
 assert.equal(spec.sourceApproval,false);
 assert.equal(spec.printedNoteheadCertification,false);
 assert.equal(spec.autoAssign,false);
 assert.equal(spec.reusedExistingSelectionId,null);
 const a=archive(spec.sourceArchivePath);
 assert.equal(a.sourceEditionId,2);
 const exact=a.items.filter(x=>x.id===spec.scoreId);
 assert.equal(exact.length,1,'Archive exact score ID');
 const record=exact[0];
 assert.equal(record.releaseStatus,'RESEARCH_IMPORT_NOT_EDITORIALLY_APPROVED');
 for(const key of ['gregobaseId','officePart','incipit','sourceUrl','gradualeRomanum1961Page'])
  assert.equal(record[key],spec[key],spec.selectionId+' '+key);
 assert.equal(record.sha256,spec.gabcSha256);
 assert.equal(sha(record.gabc),spec.gabcSha256);
 assert.equal(record.gabc.length,spec.rawGabcLength);
 assert.equal((record.gabc.match(/\\(::\\)/g)||[]).length,spec.sourceGabcSections);
 assert.equal((record.gabc.match(/[a-m]vv/g)||[]).length,spec.sourceBivirgaMatches);
 assert.equal(gabcResearchFingerprint(record.gabc),spec.sourceFingerprint);
 const adapted=record.gabc.replace(/([a-m])vv/g,(_,n)=>n+'v/'+n+'v');
 const render='name:'+spec.incipit+';\\noffice-part:'+spec.officePart+';\\n%%\\n'+adapted;
 assert.equal(gabcResearchFingerprint(render),spec.rendererFingerprint);
 assert.equal(spec.sourceNoteheads,null);
 assert.equal(spec.phraseNoteCounts,null);
 assert.equal(spec.exsurgeGabcParityTested,false);
}
assert.deepEqual([...seen].sort(),Object.keys(expected).sort());
assert.equal(identity.size,10);
assert.equal(registry.sources.length,5);
assert.ok(registry.sources.some(x=>x.kind==='1961_PRIMARY_PRINTED_PROPER'));
assert.ok(registry.sources.some(x=>x.kind==='1962_CALENDAR_SEPTUAGESIMA'));
console.log('PASS M66 SOURCE: ten exact original 1961 1962-appointed Proper identities, zero player changes, 2027 Holy Family and Epiphany II calendar correct');
