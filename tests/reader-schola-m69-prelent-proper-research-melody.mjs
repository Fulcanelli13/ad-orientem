// M69: exact fifteen 1961 pre-Lent Proper sources in the shared manual Exsurge audition.
// Original digital archives and 3,404 source noteheads locked by merged M68.
// No print-neume / syllabic-underlay editorial approval or certified Gregorian rhythm.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {PROPER_M69_RESEARCH_SOURCES}
 from '../src/mass/reader-schola-prelent-proper-sources.js';
import {PROPER_RESEARCH_SOURCES,properM59ResearchScore,
 compileProperM59ResearchMelody,eligibleProperM59ResearchSource}
 from '../src/mass/reader-schola-proper-research-melody.js';
import {gabcResearchFingerprint}
 from '../src/mass/reader-schola-exsurge-gabc-melody.js';
const read=path=>JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const sha=s=>createHash('sha256').update(s,'utf8').digest('hex');
const registry=read('data/research/mass-music-m68-prelent-three-sundays-proper-candidates.v1.json');
const sandbox={};sandbox.globalThis=sandbox;
vm.runInNewContext(readFileSync(new URL('../assets/vendor/exsurge/exsurge.min.js',import.meta.url),'utf8'),sandbox,{timeout:10000});
const exsurge=sandbox.exsurge;
assert.ok(exsurge);
assert.equal(registry.counts.sourceDigitalNoteheads,3404);
assert.equal(registry.scores.length,15);
assert.equal(PROPER_M69_RESEARCH_SOURCES.length,15);
assert.equal(PROPER_M69_RESEARCH_SOURCES.reduce((n,x)=>n+x.sourceNotes,0),3404);
assert.equal(PROPER_RESEARCH_SOURCES.length,74);
assert.equal(new Set(PROPER_RESEARCH_SOURCES.map(x=>x.selectionId)).size,74);
assert.equal(PROPER_RESEARCH_SOURCES.reduce((n,x)=>n+x.sourceNotes,0),13440);
assert.deepEqual(PROPER_M69_RESEARCH_SOURCES.map(s=>s.selectionId),registry.scores.map(s=>s.selectionId));
assert.equal(new Set(PROPER_M69_RESEARCH_SOURCES.map(s=>s.scoreId)).size,15);
assert.equal(PROPER_M69_RESEARCH_SOURCES.filter(s=>s.role==='TRACT').length,3);
assert.equal(PROPER_M69_RESEARCH_SOURCES.filter(s=>s.role==='ALLELUIA').length,0);
const weekdays={
 SEPTUAGESIMA:'2027-01-24',
 SEXAGESIMA:'2027-01-31',
 QUINQUAGESIMA:'2027-02-07'
};
const pre=PROPER_RESEARCH_SOURCES.filter(s=>
 !['SEPTUAGESIMA_','SEXAGESIMA_','QUINQUAGESIMA_'].some(p=>s.selectionId.startsWith(p)));
assert.equal(pre.length,59,'M69 must not change the 59 original Proper study selections');
const cache=new Map();
for(const [week,date] of Object.entries(weekdays)){
 const mass=registry.programmeMasses.find(x=>x.id===week);
 assert.equal(mass.date,date);
 assert.equal(mass.replacesAlleluiaWithTract,true);
 assert.equal(mass.noGloriaInExcelsis,true);
 assert.deepEqual(PROPER_M69_RESEARCH_SOURCES.filter(x=>x.week===week).map(x=>x.role),
  ['INTROIT','GRADUAL','TRACT','OFFERTORY','COMMUNION']);
}
for(const spec of PROPER_M69_RESEARCH_SOURCES){
 const p=registry.scores.find(x=>x.selectionId===spec.selectionId);
 assert.ok(p,'No synthesized source without M68 archive');
 for(const [key,val] of Object.entries({
  selectionId:p.selectionId,week:p.massId,role:p.role,title:p.incipit,
  scoreId:p.scoreId,officePart:p.officePart,printed1961Page:p.gradualeRomanum1961Page,
  sourceUrl:p.sourceUrl,sha256:p.gabcSha256,
  sourceFingerprint:p.sourceFingerprint,rendererFingerprint:p.rendererFingerprint,
  sourceNotes:p.sourceNoteheads,bivirgaCount:p.bivirgaMatches,
  scoreApproved:false,provisionalResearch:true,automaticMassAssignment:false
 }))assert.equal(spec[key],val,spec.selectionId+' '+key);
 assert.deepEqual([...spec.phraseNoteCounts],p.phraseNoteCounts);
 assert.equal(spec.sourceGabc.length,p.sourceGabcLength);
 assert.equal(sha(spec.sourceGabc),p.gabcSha256);
 assert.equal(gabcResearchFingerprint(spec.sourceGabc),p.sourceFingerprint);
 assert.equal(gabcResearchFingerprint('name:'+spec.title+';\noffice-part:'+
  spec.officePart+';\n%%\n'+spec.sourceGabc.replace(/([a-m])vv/g,(_,n)=>n+'v/'+n+'v')),
  p.rendererFingerprint);
 if(!cache.has(p.sourceArchivePath))cache.set(p.sourceArchivePath,read(p.sourceArchivePath));
 const originals=cache.get(p.sourceArchivePath).items.filter(x=>x.id===spec.scoreId);
 assert.equal(originals.length,1);
 assert.equal(originals[0].releaseStatus,'RESEARCH_IMPORT_NOT_EDITORIALLY_APPROVED');
 assert.equal(originals[0].gabc,spec.sourceGabc);
 assert.ok(pre.every(x=>x.scoreId!==spec.scoreId),'New sources must not repeat player scores');
 const request=properM59ResearchScore(spec.selectionId);
 assert.ok(request);
 assert.equal(request.gabc,spec.sourceGabc);
 assert.equal(request.scoreApproved,false);
 const compiled=compileProperM59ResearchMelody({selectionId:spec.selectionId,exsurge});
 assert.ok(compiled,'M69 exact source compilation must succeed: '+spec.selectionId);
 assert.equal(compiled.sourceNotes,p.sourceNoteheads);
 assert.equal(compiled.melody.performance.length,p.sourceNoteheads);
 assert.equal(compiled.timing.events.length,p.sourceNoteheads);
 assert.equal(compiled.melody.phraseCount,p.phraseNoteCounts.length);
 assert.equal(compiled.approved,false);
 assert.equal(compiled.certified,false);
 assert.equal(compiled.timing.certifiedGregorianTiming,false);
 for(const form of ['MISSA_CANTATA_SIMPLE','MISSA_CANTATA_INCENSE','SOLEMN'])
  assert.equal(eligibleProperM59ResearchSource({selectionId:spec.selectionId,form,mode:'LIVE'}),true);
 for(const ctx of [
  {form:'LOW',mode:'LIVE'},{form:'SOLEMN',mode:'MISSAL'},
  {form:'SOLEMN',mode:'LIVE',isRequiem:true}
 ])assert.equal(eligibleProperM59ResearchSource({selectionId:spec.selectionId,...ctx}),false);
 for(const altered of [
  {...request,gabc:request.gabc+' '},
  {...request,scoreId:'GREGOBASE-0'},
  {...request,selectionId:'NOT_A_PROPER'},
  {...request,scoreApproved:true},
  {...request,role:'ALLELUIA'}
 ])assert.equal(compileProperM59ResearchMelody({
  selectionId:spec.selectionId,source:altered,exsurge
 }),null,'Altered original or attempted Tract-to-Alleluia role must not play');
 console.log('PASS M69 SCORE',spec.selectionId,spec.sourceNotes,p.phraseNoteCounts.length);
}
console.log('PASS M69: 15 full archival sources, three Tracts, 3,404 digital notes; manual LIVE Sung/Solemn only, no alternate audio engine');
