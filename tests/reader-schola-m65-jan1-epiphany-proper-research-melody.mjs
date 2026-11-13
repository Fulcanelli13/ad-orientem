// M65: source-locked January 1 and Epiphany Gregorian playback regression.
// This is provisional manual research listening, not printed neume or rhythm certification.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {PROPER_M65_RESEARCH_SOURCES} from '../src/mass/reader-schola-jan-epiphany-proper-sources.js';
import {PROPER_M62_RESEARCH_SOURCES} from '../src/mass/reader-schola-christmas-proper-sources.js';
import {
 PROPER_RESEARCH_SOURCES,properM59ResearchScore,
 compileProperM59ResearchMelody,eligibleProperM59ResearchSource
} from '../src/mass/reader-schola-proper-research-melody.js';
import {gabcResearchFingerprint} from '../src/mass/reader-schola-exsurge-gabc-melody.js';
const read=path=>JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const pinned=read('data/research/mass-music-m64-nativity-octave-epiphany-proper-candidates.v1.json');
const sha=s=>createHash('sha256').update(s,'utf8').digest('hex');
const sandbox={};sandbox.globalThis=sandbox;
vm.runInNewContext(readFileSync(new URL('../assets/vendor/exsurge/exsurge.min.js',import.meta.url),'utf8'),sandbox,{timeout:10000});
const exsurge=sandbox.exsurge;
assert.ok(exsurge);
assert.equal(PROPER_M65_RESEARCH_SOURCES.length,10);
assert.equal(PROPER_RESEARCH_SOURCES.length,74);
assert.equal(new Set(PROPER_RESEARCH_SOURCES.map(x=>x.selectionId)).size,74);
assert.equal(PROPER_M65_RESEARCH_SOURCES.filter(x=>x.week==='NATIVITY_OCTAVE').length,5);
assert.equal(PROPER_M65_RESEARCH_SOURCES.filter(x=>x.week==='EPIPHANY').length,5);
assert.deepEqual(PROPER_M65_RESEARCH_SOURCES.map(x=>x.selectionId),pinned.scores.map(x=>x.selectionId));
assert.equal(PROPER_M65_RESEARCH_SOURCES.reduce((s,x)=>s+x.sourceNotes,0),1663);
assert.equal(PROPER_RESEARCH_SOURCES.reduce((s,x)=>s+x.sourceNotes,0),13440);
const christmas=new Map(PROPER_M62_RESEARCH_SOURCES.map(x=>[x.selectionId,x]));
const archive=new Map();
let reused=0,newScores=0,newNotes=0;
for(const [i,source] of PROPER_M65_RESEARCH_SOURCES.entries()){
 const p=pinned.scores[i];
 for(const [k,v] of Object.entries({
  selectionId:p.selectionId,week:p.mass,role:p.role,scoreId:p.scoreId,
  officePart:p.officePart,title:p.incipit,printed1961Page:p.gradualeRomanum1961Page,
  sourceUrl:p.sourceUrl,sha256:p.gabcSha256,sourceFingerprint:p.sourceFingerprint,
  rendererFingerprint:p.rendererFingerprint,sourceNotes:p.sourceNoteheads,
  bivirgaCount:p.sourceBivirgaMatches,scoreApproved:false
 }))assert.equal(source[k],v,p.selectionId+' '+k);
 assert.deepEqual([...source.phraseNoteCounts],p.phraseNoteCounts);
 assert.equal(source.sourceGabc.length,p.rawGabcLength);
 assert.equal(sha(source.sourceGabc),p.gabcSha256);
 assert.equal(gabcResearchFingerprint(source.sourceGabc),p.sourceFingerprint);
 assert.equal(gabcResearchFingerprint('name:'+source.title+';\noffice-part:'+source.officePart+';\n%%\n'+
  source.sourceGabc.replace(/([a-m])vv/g,(_,n)=>n+'v/'+n+'v')),p.rendererFingerprint);
 if(!archive.has(p.sourceArchivePath))archive.set(p.sourceArchivePath,read(p.sourceArchivePath));
 const records=archive.get(p.sourceArchivePath).items.filter(x=>x.id===p.scoreId);
 assert.equal(records.length,1,'No fabricated or wrong source');
 assert.equal(records[0].gabc,source.sourceGabc,'Archive GABC must be byte-identical');
 assert.equal(records[0].releaseStatus,'RESEARCH_IMPORT_NOT_EDITORIALLY_APPROVED');
 const old=p.reuseExistingChristmasDaySelectionId;
 if(old){
   const existing=christmas.get(old);
   assert.ok(existing,'January reuse must have a Christmas source');
   assert.equal(source.reusedFromSelectionId,old);
   assert.strictEqual(source.sourceGabc,existing.sourceGabc,
    'Alias must hold same GABC reference, not a copied/transposed score');
   assert.equal(source.scoreId,existing.scoreId);
   reused++;
 }else{assert.equal(source.reusedFromSelectionId,undefined);newScores++;newNotes+=source.sourceNotes;}
 const selected=properM59ResearchScore(source.selectionId);
 assert.ok(selected);
 assert.equal(selected.gabc,source.sourceGabc);
 assert.equal(selected.scoreApproved,false);
 const compiled=compileProperM59ResearchMelody({selectionId:source.selectionId,exsurge});
 assert.ok(compiled,'Exact score must compile: '+source.selectionId);
 assert.equal(compiled.sourceNotes,p.sourceNoteheads);
 assert.equal(compiled.melody.performance.length,p.sourceNoteheads);
 assert.equal(compiled.timing.events.length,p.sourceNoteheads);
 assert.equal(compiled.timing.certifiedGregorianTiming,false);
 assert.equal(compiled.approved,false);
 assert.equal(compiled.certified,false);
 for(const form of ['MISSA_CANTATA_SIMPLE','MISSA_CANTATA_INCENSE','SOLEMN'])
   assert.equal(eligibleProperM59ResearchSource({selectionId:source.selectionId,form,mode:'LIVE'}),true);
 for(const scope of [
  {form:'LOW',mode:'LIVE'},{form:'SOLEMN',mode:'MISSAL'},
  {form:'SOLEMN',mode:'LIVE',isRequiem:true}
 ])assert.equal(eligibleProperM59ResearchSource({selectionId:source.selectionId,...scope}),false);
 for(const corrupted of [
  {...selected,gabc:selected.gabc+' '},{...selected,scoreApproved:true},
  {...selected,scoreId:'GREGOBASE-0'},{...selected,role:'WRONG'},
  {...selected,selectionId:'CHRISTMAS_WRONG'}
 ])assert.equal(compileProperM59ResearchMelody({
  selectionId:source.selectionId,source:corrupted,exsurge
 }),null,'Tampered or mislabelled score must fail closed');
 console.log('PASS M65 SCORE',source.selectionId,p.sourceNoteheads,old?'REUSED':'NEW');
}
assert.equal(reused,4);
assert.equal(newScores,6);
assert.equal(newNotes,1012);
const ep=PROPER_M65_RESEARCH_SOURCES.filter(x=>x.week==='EPIPHANY');
assert.notEqual(ep.find(x=>x.role==='ALLELUIA').scoreId,ep.find(x=>x.role==='COMMUNION').scoreId);
assert.notEqual(ep.find(x=>x.role==='ALLELUIA').sourceGabc,ep.find(x=>x.role==='COMMUNION').sourceGabc);
assert.equal(new Set(PROPER_M65_RESEARCH_SOURCES.map(x=>x.scoreId)).size,10,
 'M65 covers ten different archival identities, including four aliases of Christmas Day');
const prior=PROPER_RESEARCH_SOURCES.filter(x=>!x.selectionId.startsWith('NATIVITY_OCTAVE_')&&!x.selectionId.startsWith('EPIPHANY_'));
for(const fresh of PROPER_M65_RESEARCH_SOURCES.filter(x=>!x.reusedFromSelectionId))
 assert.ok(prior.every(x=>x.scoreId!==fresh.scoreId),'A new M65 score must not already be in the existing player');
console.log('PASS M65: 10 Jan Proper assignments, six new GABCs, four Christmas aliases; all fail-closed player gates');
