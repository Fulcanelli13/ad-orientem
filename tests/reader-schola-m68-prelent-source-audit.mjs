// M68: source identity for 2027 Septuagesima, Sexagesima and Quinquagesima.
// Research only, with no new audio or calendar assignment.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gabcResearchFingerprint} from '../src/mass/reader-schola-exsurge-gabc-melody.js';
import {PROPER_RESEARCH_SOURCES} from '../src/mass/reader-schola-proper-research-melody.js';
const read=path=>JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const registry=read('data/research/mass-music-m68-prelent-three-sundays-proper-candidates.v1.json');
const index=read('data/mass/chant-corpus/gr1961-proper-index.json');
const sha=s=>createHash('sha256').update(s,'utf8').digest('hex');
const expected={
 SEPTUAGESIMA:[
  ['INTROIT','in',1168,'73','Circumdederunt me'],
  ['GRADUAL','gr',222,'74','Adjutor in opportunitatibus'],
  ['TRACT','tr',926,'75','De profundis'],
  ['OFFERTORY','of',1194,'76','Bonum est confiteri'],
  ['COMMUNION','co',640,'76','Illumina faciem']],
 SEXAGESIMA:[
  ['INTROIT','in',529,'77','Exsurge'],
  ['GRADUAL','gr',1265,'78','Sciant gentes'],
  ['TRACT','tr',1178,'78','Commovisti'],
  ['OFFERTORY','of',265,'79','Perfice gressus'],
  ['COMMUNION','co',554,'80','Introibo']],
 QUINQUAGESIMA:[
  ['INTROIT','in',1381,'80','Esto mihi'],
  ['GRADUAL','gr',850,'81','Tu es Deus'],
  ['TRACT','tr',1299,'82','Jubilate Domino'],
  ['OFFERTORY','of',1317,'83','Benedictus es'],
  ['COMMUNION','co',677,'84','Manducaverunt']]
};
assert.equal(registry.schema,'ao-schola-m68-prelent-three-sundays-gr1961-archive-audit-v1');
assert.equal(registry.stage,'DIGITAL_EXSURGE_NOTEHEADS_LOCKED_PRINT_HOLD_NO_PLAYER_CHANGE');
assert.equal(registry.archive,'data/mass/chant-corpus/gr1961-proper-index.json');
assert.equal(registry.editionId,2);
assert.equal(registry.editionId,index.sourceEditionId);
assert.equal(registry.originalArchiveSnapshot,index.snapshotDate);
assert.equal(index.screening.validStaged,1195);
assert.deepEqual(registry.programmeMasses.map(x=>[x.id,x.date,x.rank,x.colour]),[
 ['SEPTUAGESIMA','2027-01-24','II','VIOLET'],
 ['SEXAGESIMA','2027-01-31','II','VIOLET'],
 ['QUINQUAGESIMA','2027-02-07','II','VIOLET']]);
assert.equal(registry.programmeMasses.length,3);
for(const p of registry.programmeMasses){
 assert.equal(new Date(p.date+'T12:00:00Z').getUTCDay(),0);
 assert.equal(p.replacesAlleluiaWithTract,true);
 assert.equal(p.noGloriaInExcelsis,true);
 assert.deepEqual(p.roles,['INTROIT','GRADUAL','TRACT','OFFERTORY','COMMUNION']);
}
assert.deepEqual(registry.counts,{
 days:3,slots:15,introit:3,gradual:3,tract:3,offertory:3,communion:3,alleluia:0,
 newArchiveIdentities:15,duplicateGregoBaseIdsWithinBatch:0,
 duplicateIdsInExisting75MelodyPlayer:0,existingProperSelectionsBeforeAudit:59,
 sourceDigitalNoteheads:3404,sourceDigitalNoteheadsCertifiedForResearch:true});
assert.equal(PROPER_RESEARCH_SOURCES.length,74);
assert.equal(new Set(PROPER_RESEARCH_SOURCES.map(x=>x.selectionId)).size,74);
// Preserve M68's research-time baseline and ensure M69 only adds its own 15.
const prior=PROPER_RESEARCH_SOURCES.filter(x=>
 !['SEPTUAGESIMA_','SEXAGESIMA_','QUINQUAGESIMA_']
  .some(prefix=>x.selectionId.startsWith(prefix)));
assert.equal(prior.length,59);
const existing=new Set(prior.map(x=>x.scoreId));
const cache=new Map(),seenIds=new Set(),seenSelection=new Set();
const archive=path=>{if(!cache.has(path))cache.set(path,read(path));return cache.get(path)};
assert.equal(registry.scores.length,15);
for(const score of registry.scores){
 const list=expected[score.massId];
 assert.ok(list,'Unexpected pre-Lent mass');
 const row=list.find(x=>x[0]===score.role);
 assert.ok(row,score.selectionId+' wrong role, no Alleluia');
 const [role,part,id,page,incipit]=row;
 assert.equal(score.selectionId,score.massId+'_'+role);
 assert.equal(score.officePart,part);
 assert.equal(score.gregobaseId,id);
 assert.equal(score.scoreId,'GREGOBASE-'+id);
 assert.equal(score.gradualeRomanum1961Page,page);
 assert.ok(score.incipit.startsWith(incipit));
 assert.equal(score.reusedFromSelectionId,null);
 assert.equal(score.sourceArchivePath,
 'data/mass/chant-corpus/gr1961-proper-'+String(score.archiveBatch).padStart(3,'0')+'.json');
 assert.ok(!seenIds.has(id),'No repeated archival IDs within 15');
 assert.ok(!seenSelection.has(score.selectionId),'No repeated selections');
 seenIds.add(id);seenSelection.add(score.selectionId);
 assert.equal(existing.has(score.scoreId),false,'No redundant existing Proper score');
 assert.ok(Number.isInteger(score.sourceNoteheads)&&score.sourceNoteheads>0);
 assert.ok(Array.isArray(score.phraseNoteCounts)&&score.phraseNoteCounts.every(n=>Number.isInteger(n)&&n>0));
 assert.equal(score.phraseNoteCounts.reduce((n,x)=>n+x,0),score.sourceNoteheads);
 assert.equal(score.phraseNoteCounts.length,score.sourceDoubleBarTokens);
 assert.equal(score.exsurgeParityVerified,true);
 assert.equal(score.researchApproved,false);
 assert.equal(score.printedNeumesApproved,false);
 assert.equal(score.gregorianRhythmCertified,false);
 assert.equal(score.automatedMassAssignment,false);
 const data=archive(score.sourceArchivePath);
 assert.equal(data.sourceEditionId,2);
 const exact=data.items.filter(x=>x.id===score.scoreId);
 assert.equal(exact.length,1,'Exactly one archival score identity');
 const orig=exact[0];
 assert.equal(orig.gregobaseId,id);
 assert.equal(orig.officePart,score.officePart);
 assert.equal(orig.incipit,score.incipit);
 assert.equal(orig.gradualeRomanum1961Page,score.gradualeRomanum1961Page);
 assert.equal(orig.sourceUrl,score.sourceUrl);
 assert.equal(orig.releaseStatus,'RESEARCH_IMPORT_NOT_EDITORIALLY_APPROVED');
 assert.equal(orig.sha256,score.gabcSha256);
 assert.equal(sha(orig.gabc),score.gabcSha256);
 assert.equal(orig.gabc.length,score.sourceGabcLength);
 assert.equal(gabcResearchFingerprint(orig.gabc),score.sourceFingerprint);
 assert.equal((orig.gabc.match(/([a-m])vv/g)||[]).length,score.bivirgaMatches);
 assert.equal((orig.gabc.match(/\([^)]*::[^)]*\)/g)||[]).length,score.sourceDoubleBarTokens);
 const adapted=orig.gabc.replace(/([a-m])vv/g,(_,n)=>n+'v/'+n+'v');
 const header='name:'+score.incipit+';\noffice-part:'+score.officePart+';\n%%\n';
 assert.equal(gabcResearchFingerprint(header+adapted),score.rendererFingerprint);
}
assert.equal(seenIds.size,15);
assert.equal(seenSelection.size,15);
assert.equal(registry.researchExceptions.length,4);
assert.equal(registry.scores.reduce((n,s)=>n+s.sourceNoteheads,0),3404);
assert.equal(registry.exsurgeEvidence.workflowRunId,43471766717);
assert.equal(registry.exsurgeEvidence.original1961SourceDigitalNoteheads,3404);
assert.equal(registry.exsurgeEvidence.all15PhraseCountsLocked,true);
assert.equal(registry.exsurgeEvidence.tractSlots,3);
assert.equal(registry.exsurgeEvidence.alleluiaSlots,0);
assert.equal(registry.exsurgeEvidence.original1961PrintedNeumesComparedVisually,false);
assert.equal(registry.exsurgeEvidence.GregorianRhythmCertified,false);
assert.equal(registry.exsurgeEvidence.playerChanges,false);
assert.equal(registry.researchExceptions[0].role,'COMMUNION');
assert.equal(registry.researchExceptions[1].role,'TRACT');
for(const p of registry.researchExceptions)assert.equal(p.mustNotSubstitute,true);
for(const k of ['noPlayerChanges','noNewGabcPublished','noAutomaticMassAssignment',
 'noAutoPlay','tractNeverAlleluia','noGloriaInExcelsisOnTheseSundays',
 'retain65CardLIVE','noLowMassMelodyPreview','noMissalMelodyPreview',
 'noRequiemMelodyPreview','noPrintedNeumeCertification','noRhythmCertification',
 'noPaidServices','githubActionsAndPagesOnly','noVercel','noArchiveMutation',
 'noTransferToSeparateProductionRepo'])
 assert.equal(registry.restrictions[k],true,k);
console.log('PASS M68 SOURCE: 15 original 1961 scores for 2027 pre-Lent, three Tracts not Alleluias, no player or archive mutations');
