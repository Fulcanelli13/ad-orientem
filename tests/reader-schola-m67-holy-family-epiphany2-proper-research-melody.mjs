// M67: opt-in source GABC testing for nine new 1961 Proper research scores.
// Holy Family Introit is held for Exsultet (Graduale) vs Exsultat (Missale).
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {PROPER_M67_RESEARCH_SOURCES,M67_HOLY_FAMILY_INTROIT_HOLD}
 from '../src/mass/reader-schola-holy-family-epiphany2-proper-sources.js';
import {PROPER_RESEARCH_SOURCES,properM59ResearchScore,
 compileProperM59ResearchMelody,eligibleProperM59ResearchSource}
 from '../src/mass/reader-schola-proper-research-melody.js';
import {gabcResearchFingerprint}
 from '../src/mass/reader-schola-exsurge-gabc-melody.js';
const load=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const audit=load('data/research/mass-music-m66-holy-family-epiphany2-proper-candidates.v1.json');
const sha=s=>createHash('sha256').update(s,'utf8').digest('hex');
const sandbox={};sandbox.globalThis=sandbox;
vm.runInNewContext(readFileSync(new URL('../assets/vendor/exsurge/exsurge.min.js',import.meta.url),'utf8'),sandbox,{timeout:10000});
const exsurge=sandbox.exsurge;
assert.ok(exsurge);
assert.equal(audit.scores.length,10);
assert.equal(audit.counts.sourceDigitalNoteheadsAllSlots,1711);
assert.equal(PROPER_M67_RESEARCH_SOURCES.length,9);
assert.equal(PROPER_RESEARCH_SOURCES.length,59);
assert.equal(new Set(PROPER_RESEARCH_SOURCES.map(x=>x.selectionId)).size,59);
assert.equal(new Set(PROPER_M67_RESEARCH_SOURCES.map(x=>x.scoreId)).size,9);
assert.equal(PROPER_RESEARCH_SOURCES.reduce((sum,x)=>sum+x.sourceNotes,0),10036);
assert.equal(PROPER_M67_RESEARCH_SOURCES.reduce((sum,x)=>sum+x.sourceNotes,0),1562);
assert.equal(PROPER_M67_RESEARCH_SOURCES.filter(x=>x.week==='HOLY_FAMILY').length,4);
assert.equal(PROPER_M67_RESEARCH_SOURCES.filter(x=>x.week==='EPIPHANY2').length,5);
assert.deepEqual(PROPER_M67_RESEARCH_SOURCES.map(x=>x.selectionId),
 audit.scores.filter(x=>x.selectionId!=='HOLY_FAMILY_INTROIT').map(x=>x.selectionId));
assert.equal(M67_HOLY_FAMILY_INTROIT_HOLD.selectionId,'HOLY_FAMILY_INTROIT');
assert.equal(M67_HOLY_FAMILY_INTROIT_HOLD.scoreId,'GREGOBASE-336');
assert.equal(M67_HOLY_FAMILY_INTROIT_HOLD.printed1961Opening,'Exsultet gaudio');
assert.equal(M67_HOLY_FAMILY_INTROIT_HOLD.printed1962Opening,'Exsultat gaudio');
assert.equal(M67_HOLY_FAMILY_INTROIT_HOLD.noResearchAudioUntilEditorialResolution,true);
assert.equal(PROPER_RESEARCH_SOURCES.some(x=>x.scoreId==='GREGOBASE-336'),false);
assert.equal(PROPER_RESEARCH_SOURCES.some(x=>x.selectionId==='HOLY_FAMILY_INTROIT'),false);
assert.equal(properM59ResearchScore('HOLY_FAMILY_INTROIT'),null);
assert.equal(compileProperM59ResearchMelody({selectionId:'HOLY_FAMILY_INTROIT',exsurge}),null);
assert.equal(eligibleProperM59ResearchSource({
 selectionId:'HOLY_FAMILY_INTROIT',form:'SOLEMN',mode:'LIVE'
}),false);
const pre=PROPER_RESEARCH_SOURCES.filter(x=>!x.selectionId.startsWith('HOLY_FAMILY_')&&
 !x.selectionId.startsWith('EPIPHANY2_'));
const archive=new Map();
for(const s of PROPER_M67_RESEARCH_SOURCES){
 const a=audit.scores.find(x=>x.selectionId===s.selectionId);
 assert.ok(a);
 for(const [k,v] of Object.entries({
  selectionId:a.selectionId,week:a.mass,role:a.role,title:a.incipit,
  scoreId:a.scoreId,officePart:a.officePart,printed1961Page:a.gradualeRomanum1961Page,
  sourceUrl:a.sourceUrl,sha256:a.gabcSha256,
  sourceFingerprint:a.sourceFingerprint,rendererFingerprint:a.rendererFingerprint,
  sourceNotes:a.sourceNoteheads,bivirgaCount:a.sourceBivirgaMatches,
  scoreApproved:false
 }))assert.equal(s[k],v,s.selectionId+' '+k);
 assert.deepEqual([...s.phraseNoteCounts],a.phraseNoteCounts);
 assert.equal(s.sourceGabc.length,a.rawGabcLength);
 assert.equal(sha(s.sourceGabc),a.gabcSha256);
 assert.equal(gabcResearchFingerprint(s.sourceGabc),a.sourceFingerprint);
 assert.equal(gabcResearchFingerprint('name:'+s.title+';\noffice-part:'+s.officePart+';\n%%\n'+
  s.sourceGabc.replace(/([a-m])vv/g,(_,n)=>n+'v/'+n+'v')),a.rendererFingerprint);
 if(!archive.has(a.sourceArchivePath))archive.set(a.sourceArchivePath,load(a.sourceArchivePath));
 const same=archive.get(a.sourceArchivePath).items.filter(x=>x.id===s.scoreId);
 assert.equal(same.length,1);
 assert.equal(same[0].releaseStatus,'RESEARCH_IMPORT_NOT_EDITORIALLY_APPROVED');
 assert.equal(same[0].gabc,s.sourceGabc,'Source must be byte-identical to 1961 archive');
 assert.ok(pre.every(x=>x.scoreId!==s.scoreId),'No duplicates of original 66 research melodies');
 const src=properM59ResearchScore(s.selectionId);
 assert.ok(src);
 assert.equal(src.gabc,s.sourceGabc);
 assert.equal(src.scoreApproved,false);
 const compiled=compileProperM59ResearchMelody({selectionId:s.selectionId,exsurge});
 assert.ok(compiled,'Exact M66 GABC must be manually compilable: '+s.selectionId);
 assert.equal(compiled.sourceNotes,a.sourceNoteheads);
 assert.equal(compiled.melody.performance.length,a.sourceNoteheads);
 assert.equal(compiled.timing.events.length,a.sourceNoteheads);
 assert.equal(compiled.timing.certifiedGregorianTiming,false);
 assert.equal(compiled.melody.phraseCount,a.phraseNoteCounts.length);
 assert.equal(compiled.approved,false);
 assert.equal(compiled.certified,false);
 for(const form of ['MISSA_CANTATA_SIMPLE','MISSA_CANTATA_INCENSE','SOLEMN'])
  assert.equal(eligibleProperM59ResearchSource({
   selectionId:s.selectionId,form,mode:'LIVE'
  }),true);
 for(const scope of [
   {form:'LOW',mode:'LIVE'},{form:'SOLEMN',mode:'MISSAL'},
   {form:'SOLEMN',mode:'LIVE',isRequiem:true}
 ])assert.equal(eligibleProperM59ResearchSource({selectionId:s.selectionId,...scope}),false);
 for(const corrupted of [
  {...src,gabc:src.gabc+' '},{...src,scoreApproved:true},
  {...src,scoreId:'GREGOBASE-0'},{...src,role:'WRONG'},
  {...src,selectionId:'EPIPHANY_WRONG'}
 ])assert.equal(compileProperM59ResearchMelody({
  selectionId:s.selectionId,source:corrupted,exsurge
 }),null,'Tampered source must fail closed');
 console.log('PASS M67 SCORE',s.selectionId,a.sourceNoteheads,'sections',a.phraseNoteCounts.length);
}
assert.equal(PROPER_RESEARCH_SOURCES.filter(x=>x.week==='HOLY_FAMILY').length,4);
assert.equal(PROPER_RESEARCH_SOURCES.filter(x=>x.week==='EPIPHANY2').length,5);
console.log('PASS M67: nine manual Gregorian sources, 1,562 digital noteheads, 1961/1962 Holy Family Introit remains withheld');
