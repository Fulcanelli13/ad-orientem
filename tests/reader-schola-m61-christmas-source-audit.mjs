// M61 — fail-closed archival identity and 1962 rubric audit for Christmas Proper candidates.
// Research metadata only; this test never makes a score playable or certifies music.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const load=path=>JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const registry=load('data/research/mass-music-m61-christmas-four-masses-proper-candidates.v1.json');
assert.equal(registry.schema,'ao-schola-m61-christmas-proper-source-candidates-v1');
assert.equal(registry.status,'ARCHIVE_IDENTITY_AUDIT_NOT_EXSURGE_APPROVED');
assert.equal(registry.sourceEditionId,2);
assert.equal(registry.expectedLiturgicalSlots,20);
assert.equal(registry.archivedCandidateCount,19);
assert.equal(registry.scores.length,19);
assert.equal(registry.holds.length,1);
assert.equal(registry.holds[0].selectionId,'CHRISTMAS_DAWN_COMMUNION');
assert.equal(registry.holds[0].status,'SOURCE_MISSING_NO_AUDIO');
assert.equal(registry.holds[0].archiveExceptionId,1125);
assert.equal(registry.holds[0].recoveryCandidateScoreId,'GREGOBASE-1125');
assert.equal(registry.holds[0].recoveryCandidatePath,'data/research/mass-music-m61-dawn-communion-gregobase-1125-recovery.v1.json');
const archiveIndex=load('data/mass/chant-corpus/gr1961-proper-index.json');
const exception=archiveIndex.exceptions.find(x=>x.gregobaseId===1125);
assert.ok(exception,'The 2024 archive exclusion must be documented');
assert.equal(exception.officePart,'co');
assert.equal(exception.page,'32');
assert.equal(exception.reason,'No usable structured GABC transcription');
const recovery=load('data/research/mass-music-m61-dawn-communion-gregobase-1125-recovery.v1.json');
assert.equal(recovery.stage,'SEPARATE_SOURCE_CANDIDATE_NOT_ARCHIVE_REWRITE');
assert.equal(recovery.scoreId,'GREGOBASE-1125');
assert.equal(recovery.sourceGabc.length,300);
assert.equal(createHash('sha256').update(recovery.sourceGabc,'utf8').digest('hex'),
 '0cd4782be4bc8a2d41e934c5863de2ad2392857f0df9c48d6bff5b23a0112ccc');
assert.equal(recovery.approved,false);
assert.equal(recovery.playerEnabled,false);
assert.equal(recovery.autoAssign,false);

assert.equal(registry.masses.length,4);
assert.equal(registry.masses[0].vigilAlleluia,'ONLY_IF_SUNDAY');
assert.equal(new Date('2026-12-24T12:00:00Z').getUTCDay(),4);
assert.equal(new Date('2028-12-24T12:00:00Z').getUTCDay(),0);
for(const [key,required] of Object.entries({
 noAutoAssignment:true,noAutoplay:true,existingPlayerOnly:true,
 noLowMass:true,noMissalMode:true,noRequiem:true,noPaidAudioServices:true,
 githubPagesOnly:true,preserveOriginalSourceGabc:true,
 editorialMusicApproval:false,printedNotationVerified:false,
 noteheadEquivalenceVerified:false,readersUnchanged:true
})) assert.equal(registry.restrictions[key],required,'restriction drift: '+key);
const expectedIds={
  "CHRISTMAS_VIGIL_INTROIT": "GREGOBASE-150",
  "CHRISTMAS_VIGIL_GRADUAL": "GREGOBASE-202",
  "CHRISTMAS_VIGIL_ALLELUIA": "GREGOBASE-167",
  "CHRISTMAS_VIGIL_OFFERTORY": "GREGOBASE-171",
  "CHRISTMAS_VIGIL_COMMUNION": "GREGOBASE-367",
  "CHRISTMAS_MIDNIGHT_INTROIT": "GREGOBASE-1175",
  "CHRISTMAS_MIDNIGHT_GRADUAL": "GREGOBASE-518",
  "CHRISTMAS_MIDNIGHT_ALLELUIA": "GREGOBASE-890",
  "CHRISTMAS_MIDNIGHT_OFFERTORY": "GREGOBASE-811",
  "CHRISTMAS_MIDNIGHT_COMMUNION": "GREGOBASE-117",
  "CHRISTMAS_DAWN_INTROIT": "GREGOBASE-917",
  "CHRISTMAS_DAWN_GRADUAL": "GREGOBASE-217",
  "CHRISTMAS_DAWN_ALLELUIA": "GREGOBASE-714",
  "CHRISTMAS_DAWN_OFFERTORY": "GREGOBASE-979",
  "CHRISTMAS_DAY_INTROIT": "GREGOBASE-72",
  "CHRISTMAS_DAY_GRADUAL": "GREGOBASE-1163",
  "CHRISTMAS_DAY_ALLELUIA": "GREGOBASE-324",
  "CHRISTMAS_DAY_OFFERTORY": "GREGOBASE-1274",
  "CHRISTMAS_DAY_COMMUNION": "GREGOBASE-1139"
};
const codes={INTROIT:'in',GRADUAL:'gr',ALLELUIA:'al',OFFERTORY:'of',COMMUNION:'co'};
const cache=new Map();
const findBatch=(path)=>{if(!cache.has(path))cache.set(path,load(path));return cache.get(path)};
const sha=s=>createHash('sha256').update(s,'utf8').digest('hex');
const actualSlots=new Set();
for(const record of registry.scores){
 assert.equal(record.selectionId,'CHRISTMAS_'+record.mass+'_'+record.role);
 assert.equal(record.scoreId,expectedIds[record.selectionId],'wrong Christmas score assignment');
 assert.equal(record.officePart,codes[record.role]);
 assert.equal(record.sourceApproval,false);
 assert.equal(record.exsurgeSourceParityVerified,false);
 assert.equal(record.gabcSha256.length,64);
 assert.ok(!actualSlots.has(record.selectionId));
 actualSlots.add(record.selectionId);
 const batch=findBatch(record.sourceArchivePath);
 assert.equal(batch.sourceEditionId,2);
 const matched=batch.items.filter(x=>x.id===record.scoreId);
 assert.equal(matched.length,1,'archive ID must be unique');
 const source=matched[0];
 for(const key of ['gregobaseId','officePart','incipit','sourceUrl','gradualeRomanum1961Page'])
  assert.equal(source[key],record[key],record.selectionId+' '+key);
 assert.equal(source.releaseStatus,'RESEARCH_IMPORT_NOT_EDITORIALLY_APPROVED');
 assert.equal(source.sha256,record.gabcSha256);
 assert.equal(sha(source.gabc),record.gabcSha256,'archival GABC byte drift');
 assert.equal(source.gabc.length,record.rawGabcLength);
 assert.equal((source.gabc.match(/\(::\)/g)||[]).length,record.sourceGabcSections);
 assert.equal((source.gabc.match(/[a-m]vv/g)||[]).length,record.sourceBivirgaMatches);
 if(record.mass==='VIGIL'&&record.role==='ALLELUIA')
   assert.equal(record.rubricalCondition,'ONLY_WHEN_VIGIL_FALLS_ON_SUNDAY');
 else assert.equal(record.rubricalCondition,undefined);
}
assert.equal(Object.keys(expectedIds).length,19);
assert.deepEqual([...actualSlots].sort(),Object.keys(expectedIds).sort());
assert.notEqual(expectedIds.CHRISTMAS_MIDNIGHT_INTROIT,expectedIds.CHRISTMAS_MIDNIGHT_ALLELUIA);
assert.notEqual(expectedIds.CHRISTMAS_DAY_GRADUAL,expectedIds.CHRISTMAS_DAY_COMMUNION);
assert.notEqual(expectedIds.CHRISTMAS_VIGIL_INTROIT,expectedIds.CHRISTMAS_VIGIL_GRADUAL);
const held=registry.holds[0];
assert.ok(!actualSlots.has(held.selectionId));
const allCommunions=[
 ...['001','002','003','004','005','006'].flatMap(i=>
 findBatch('data/mass/chant-corpus/gr1961-proper-'+i+'.json')
  .items.filter(x=>x.officePart==='co'))];
assert.equal(allCommunions.filter(x=>/exsult?a\s+filia|exulta\s+filia/i.test(x.incipit)).length,0,
 'Dawn Communion requires separate exact-source review; do not silently substitute');
console.log('PASS M61 Christmas source identity:',registry.scores.length,
 'pinned candidate scores; one Dawn Communion hold; Vigil Alleluia Sunday-only; no player changed');
