// M70 — ten 1961 source-owned Ash Wednesday and First Sunday Lent Proper scores.
// Four pre-Mass ash ceremony chants explicitly segregated as unresolved source gaps.
// Research only: no new player, no 1962 reader or local programme modification.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gabcResearchFingerprint}
 from '../src/mass/reader-schola-exsurge-gabc-melody.js';
import {PROPER_RESEARCH_SOURCES}
 from '../src/mass/reader-schola-proper-research-melody.js';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const sha=s=>createHash('sha256').update(s,'utf8').digest('hex');
const registry=read('data/research/mass-music-m70-ash-wednesday-lent1-proper-candidates.v1.json');
const index=read('data/mass/chant-corpus/gr1961-proper-index.json');
const expected={
 ASH_WEDNESDAY:[
  ['INTROIT','in',533,'87','Misereris omnium'],
  ['GRADUAL','gr',754,'88','Miserere mei Deus'],
  ['TRACT','tr',425,'89','Domine non secundum'],
  ['OFFERTORY','of',648,'90','Exaltabo te'],
  ['COMMUNION','co',582,'90','Qui meditabitur']],
 LENT1:[
  ['INTROIT','in',327,'93','Invocabit me'],
  ['GRADUAL','gr',834,'94','Angelis suis'],
  ['TRACT','tr',889,'95','Qui habitat'],
  ['OFFERTORY','of',294,'98','Scapulis suis'],
  ['COMMUNION','co',1100,'99','Scapulis suis']]
};
assert.equal(registry.schema,'ao-schola-m70-ash-wednesday-lent1-gr1961-source-audit-v1');
assert.equal(registry.stage,'DIGITAL_EXSURGE_NOTEHEADS_LOCKED_PRINT_RITE_AND_ASH_AUDIO_HOLDS_NO_PLAYER_CHANGE');
assert.equal(registry.archive,'data/mass/chant-corpus/gr1961-proper-index.json');
assert.equal(registry.editionId,2);
assert.equal(registry.editionId,index.sourceEditionId);
assert.equal(registry.originalArchiveSnapshot,index.snapshotDate);
assert.equal(index.screening.validStaged,1195);
assert.deepEqual(registry.programmeMasses.map(p=>[
 p.id,p.date,p.weekday,p.rank,p.colour
]),[
 ['ASH_WEDNESDAY','2027-02-10',3,'I','VIOLET'],
 ['LENT1','2027-02-14',0,'I','VIOLET']]);
for(const m of registry.programmeMasses){
 assert.equal(new Date(m.date+'T12:00:00Z').getUTCDay(),m.weekday);
 assert.equal(m.replacesAlleluiaWithTract,true);
 assert.equal(m.noGloriaInExcelsis,true);
 assert.deepEqual(m.roles,['INTROIT','GRADUAL','TRACT','OFFERTORY','COMMUNION']);
}
assert.deepEqual(registry.counts,{
 days:2,massProperSlots:10,ashRiteRitualChantsStagedWithoutArchive:4,
 introit:2,gradual:2,tract:2,offertory:2,communion:2,alleluia:0,
 newArchiveIdentities:10,duplicateArchiveIdsWithinBatch:0,
 duplicateIdsInExisting90MelodyPlayer:0,existingProperSelectionsBeforeAudit:74,
 sourceDigitalNoteheads:3083,sourceDigitalNoteheadsCertifiedForResearch:true,
 unmodifiedCompilerCompatibleSources:9,compilerBlockedValidGabcFusionSources:1,
 ashRiteAudioSourcesInProperArchive:0
});
assert.equal(PROPER_RESEARCH_SOURCES.length,74);
assert.equal(new Set(PROPER_RESEARCH_SOURCES.map(s=>s.selectionId)).size,74);
assert.equal(PROPER_RESEARCH_SOURCES.reduce((n,s)=>n+s.sourceNotes,0),13440);
const existing=new Set(PROPER_RESEARCH_SOURCES.map(s=>s.scoreId));
const expectedAshRites=[
 ['BEFORE_BLESSING_OF_ASHES','ANTIPHON','Exaudi nos Domine',['84','85']],
 ['AFTER_BLESSING_DURING_ASH_DISTRIBUTION','ANTIPHON','Immutemur habitu',['85']],
 ['AFTER_BLESSING_DURING_ASH_DISTRIBUTION','ANTIPHON','Juxta vestibulum',['85','86']],
 ['AFTER_BLESSING_DURING_ASH_DISTRIBUTION','RESPONSORY','Emendemus in melius',['86','87']]
];
assert.equal(registry.ashRiteChants.length,4);
for(const [i,ritual] of registry.ashRiteChants.entries()){
 const [stage,role,title,pages]=expectedAshRites[i];
 assert.equal(ritual.sequence,i+1);
 assert.equal(ritual.stage,stage);
 assert.equal(ritual.role,role);
 assert.equal(ritual.title,title);
 assert.deepEqual(ritual.printed1961Pages,pages);
 assert.equal(ritual.scoreId,null);
 assert.equal(ritual.sourceArchiveStatus,'NOT_IN_1195_PROPER_ONLY_CORPUS');
 assert.ok(!registry.scores.some(s=>s.incipit===title),
  'Ash rite must never occupy one of ten Mass Proper slots');
}
assert.equal(registry.scores.length,10);
const cache=new Map(),seen=new Set();
const archive=p=>{if(!cache.has(p))cache.set(p,read(p));return cache.get(p)};
for(const spec of registry.scores){
 const items=expected[spec.massId];
 assert.ok(items);
 const row=items.find(x=>x[0]===spec.role);
 assert.ok(row);
 const [role,office,id,page,opening]=row;
 assert.equal(spec.selectionId,spec.massId+'_'+role);
 assert.equal(spec.officePart,office);
 assert.equal(spec.scoreId,'GREGOBASE-'+id);
 assert.equal(spec.gregobaseId,id);
 assert.equal(spec.gradualeRomanum1961Page,page);
 assert.ok(spec.incipit.startsWith(opening));
 assert.equal(spec.sourceArchivePath,
  'data/mass/chant-corpus/gr1961-proper-'+String(spec.archiveBatch).padStart(3,'0')+'.json');
 assert.ok(!seen.has(id));
 seen.add(id);
 assert.equal(existing.has(spec.scoreId),false,
  'No duplicate of existing 90 source melody identities');
 assert.ok(Number.isInteger(spec.sourceNoteheads)&&spec.sourceNoteheads>0);
 assert.ok(Array.isArray(spec.phraseNoteCounts)&&spec.phraseNoteCounts.every(n=>Number.isInteger(n)&&n>0));
 assert.equal(spec.phraseNoteCounts.length,spec.sourceDoubleBarTokens);
 assert.equal(spec.phraseNoteCounts.reduce((n,x)=>n+x,0),spec.sourceNoteheads);
 assert.equal(spec.exsurgeParityVerified,true);
 assert.equal(spec.audioCompilerCompatibility,spec.selectionId==='ASH_WEDNESDAY_INTROIT'?
 'HOLD_VALID_AT_FUSION_MISSING_EXSURGE_SOURCE_NOTE':
 'PASSES_EXISTING_OFFLINE_SOURCE_COMPILER_RESEARCH_ONLY');
 assert.equal(spec.researchApproved,false);
 assert.equal(spec.printedNeumesApproved,false);
 assert.equal(spec.gregorianRhythmCertified,false);
 assert.equal(spec.automatedMassAssignment,false);
 assert.equal(spec.reusedFromSelectionId,null);
 const ar=archive(spec.sourceArchivePath);
 assert.equal(ar.sourceEditionId,2);
 const entries=ar.items.filter(x=>x.id===spec.scoreId);
 assert.equal(entries.length,1);
 const x=entries[0];
 assert.equal(x.gregobaseId,id);
 assert.equal(x.officePart,office);
 assert.equal(x.incipit,spec.incipit);
 assert.equal(x.gradualeRomanum1961Page,spec.gradualeRomanum1961Page);
 assert.equal(x.sourceUrl,spec.sourceUrl);
 assert.equal(x.releaseStatus,'RESEARCH_IMPORT_NOT_EDITORIALLY_APPROVED');
 assert.equal(x.sha256,spec.gabcSha256);
 assert.equal(sha(x.gabc),spec.gabcSha256);
 assert.equal(x.gabc.length,spec.sourceGabcLength);
 assert.equal(gabcResearchFingerprint(x.gabc),spec.sourceFingerprint);
 assert.equal((x.gabc.match(/[a-m]vv/g)||[]).length,spec.bivirgaMatches);
 assert.equal((x.gabc.match(/\([^)]*::[^)]*\)/g)||[]).length,spec.sourceDoubleBarTokens);
 const expanded=x.gabc.replace(/([a-m])vv/g,(_,n)=>n+'v/'+n+'v');
 const header='name:'+spec.incipit+';\noffice-part:'+spec.officePart+';\n%%\n';
 assert.equal(gabcResearchFingerprint(header+expanded),spec.rendererFingerprint);
}
assert.equal(seen.size,10);
const longTract=registry.scores.find(s=>s.selectionId==='LENT1_TRACT');
assert.equal(longTract.sourceDoubleBarTokens,13,'Psalm 90 must retain all thirteen source sections');
assert.equal(longTract.gregobaseId,889);
assert.ok(longTract.sourceGabcLength>4000,'Lent I Tract cannot be reduced to short Alleluia');
const scapOf=registry.scores.find(s=>s.selectionId==='LENT1_OFFERTORY');
const scapCo=registry.scores.find(s=>s.selectionId==='LENT1_COMMUNION');
assert.equal(scapOf.incipit,scapCo.incipit);
assert.notEqual(scapOf.scoreId,scapCo.scoreId,'Two independent Scapulis chant identities');
assert.notEqual(scapOf.gabcSha256,scapCo.gabcSha256,'Distinct Offertory and Communion GABC');
assert.equal(registry.researchExceptions.length,7);
assert.equal(registry.scores.reduce((n,s)=>n+s.sourceNoteheads,0),3083);
assert.equal(registry.scores.filter(s=>s.audioCompilerCompatibility.startsWith('HOLD')).length,1);
assert.equal(registry.exsurgeEvidence.workflowRunId,43491275405);
assert.equal(registry.exsurgeEvidence.original1961SourceDigitalNoteheads,3083);
assert.equal(registry.exsurgeEvidence.allTenExactPhraseArraysLocked,true);
assert.equal(registry.exsurgeEvidence.lent1QuiHabitatNoteheads,1333);
assert.equal(registry.exsurgeEvidence.lent1QuiHabitatPhraseCount,13);
assert.equal(registry.exsurgeEvidence.ashWednesdayOriginalFusionToken,'@h!');
assert.equal(registry.exsurgeEvidence.ashWednesdayIntroitAudioCompilerStatus,'HOLD_MISSING_EXSURGE_SOURCE_NOTE');
assert.equal(registry.exsurgeEvidence.printedNeumesComparedVisually,false);
assert.equal(registry.exsurgeEvidence.syllabicUnderlayCertified,false);
assert.equal(registry.exsurgeEvidence.playerChanges,false);
for(const ex of registry.researchExceptions)assert.equal(ex.mustNotSubstitute,true);
for(const field of [
 'noPlayerChanges','noNewGabcPublished','noAutomaticMassAssignment',
 'noAutoPlay','tractNeverAlleluia','noGloriaInExcelsis',
 'keepAshRitesSeparateFromMass','noInventedAshRiteAudio',
 'doNotTruncateLent1Tract','doNotDeduplicateDistinctScapulisScores',
 'retain65CardLIVE','noLowMassMelodyPreview','noMissalMelodyPreview',
 'noRequiemMelodyPreview','noPrintedNeumeCertification','noRhythmCertification',
 'noPaidServices','githubActionsAndPagesOnly','noVercel',
 'noAshIntroitFusionAudioUntilSourceFaithfulAdapter',
 'noArchiveMutation','noTransferToSeparateProductionRepo'
])assert.equal(registry.restrictions[field],true);
console.log('PASS M70 SOURCE: 10 real archived Mass Propers, Lent I 13-section Tract, four distinct held ash rite chants, no 1962 calendar/player changes');
