// M62 — nineteen Christmas Proper research previews, exact archival source guards.
// No recorded singers, no calendar assignments and no Gregorian rhythm certification.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {PROPER_M62_RESEARCH_SOURCES} from '../src/mass/reader-schola-christmas-proper-sources.js';
import {
 PROPER_M59_RESEARCH_SOURCES,PROPER_RESEARCH_SOURCES,
 eligibleProperM59ResearchSource,properM59ResearchScore,
 compileProperM59ResearchMelody
} from '../src/mass/reader-schola-proper-research-melody.js';
const read=path=>JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const pinned=read('data/research/mass-music-m62-christmas-playback-candidates.v1.json');
const m61=read('data/research/mass-music-m61-christmas-four-masses-proper-candidates.v1.json');
const sha=s=>createHash('sha256').update(s,'utf8').digest('hex');
const bundle=readFileSync(new URL('../assets/vendor/exsurge/exsurge.min.js',import.meta.url),'utf8');
const sandbox={};sandbox.globalThis=sandbox;
vm.runInNewContext(bundle,sandbox,{timeout:10000});
const exsurge=sandbox.exsurge;
assert.ok(exsurge);
assert.equal(pinned.schema,'ao-schola-m62-christmas-proper-preview-candidates-v1');
assert.equal(pinned.status,'EXSURGE_SOURCE_PARITY_PINNED_RESEARCH_ONLY');
assert.equal(pinned.publicPreviewCandidateCount,19);
assert.equal(pinned.totalPinnedDigitalNoteheads,3185);
assert.equal(PROPER_M62_RESEARCH_SOURCES.length,19);
assert.equal(PROPER_M59_RESEARCH_SOURCES.length,5);
assert.equal(PROPER_RESEARCH_SOURCES.length,74);
assert.equal(new Set(PROPER_RESEARCH_SOURCES.map(x=>x.selectionId)).size,74);
assert.equal(PROPER_RESEARCH_SOURCES.filter(x=>x.selectionId.startsWith('ADVENT')).length,20);
assert.equal(pinned.holds.length,1);
assert.equal(pinned.holds[0].selectionId,'CHRISTMAS_DAWN_COMMUNION');
assert.equal(pinned.holds[0].scoreId,'GREGOBASE-1125');
assert.equal(pinned.holds[0].status,'RECOVERED_SOURCE_EDITORIAL_HOLD_NO_PUBLIC_PREVIEW');
// M62's historical hold stays recorded; M63 separately promotes it as
// provisional manual research playback, without retroactively changing M62.
assert.equal(properM59ResearchScore('CHRISTMAS_DAWN_COMMUNION')?.scoreApproved,false);
assert.equal(compileProperM59ResearchMelody({selectionId:'CHRISTMAS_DAWN_COMMUNION',exsurge})?.certified,false);
assert.equal(pinned.restrictions.noAutomaticMassAssignment,true);
assert.equal(pinned.restrictions.oneExistingPlayer,true);
assert.equal(pinned.restrictions.noPaidServices,true);
assert.equal(pinned.restrictions.githubPagesOnly,true);
assert.equal(pinned.restrictions.vigilAlleluia,'SUNDAY_VIGIL_ONLY_NOT_2026');
const bySlot=new Map(pinned.scores.map(s=>[s.selectionId,s]));
const m61BySlot=new Map(m61.scores.map(s=>[s.selectionId,s]));
const byMass=new Map();
for(const spec of PROPER_M62_RESEARCH_SOURCES){
 assert.ok(spec.selectionId.startsWith(spec.week+'_'));
 assert.equal(spec.scoreApproved,false);
 const p=bySlot.get(spec.selectionId),q=m61BySlot.get(spec.selectionId);
 assert.ok(p&&q,'Missing pinned original source witness '+spec.selectionId);
 for(const key of ['scoreId','role','officePart','sourceUrl','sourceFingerprint',
  'rendererFingerprint','sourceNotes','bivirgaCount','sha256'])
  assert.equal(spec[key],p[key],spec.selectionId+' '+key);
 assert.equal(spec.sha256,q.gabcSha256);
 assert.equal(spec.printed1961Page,q.gradualeRomanum1961Page);
 assert.deepEqual(spec.phraseNoteCounts,p.phraseNoteCounts);
 assert.equal(spec.sourceGabc.length,p.sourceGabcLength);
 const archive=read(q.sourceArchivePath);
 const source=archive.items.filter(x=>x.id===spec.scoreId);
 assert.equal(source.length,1,'No archive substitution or duplicate ID');
 assert.equal(source[0].releaseStatus,'RESEARCH_IMPORT_NOT_EDITORIALLY_APPROVED');
 assert.equal(source[0].gabc,spec.sourceGabc);
 assert.equal(source[0].sourceUrl,spec.sourceUrl);
 assert.equal(sha(spec.sourceGabc),spec.sha256);
 assert.equal(spec.phraseNoteCounts.reduce((n,x)=>n+x,0),spec.sourceNotes);
 const preview=properM59ResearchScore(spec.selectionId);
 assert.ok(preview);
 assert.equal(preview.scoreApproved,false);
 assert.equal(preview.gabc,spec.sourceGabc);
 const prepared=compileProperM59ResearchMelody({selectionId:spec.selectionId,exsurge});
 assert.ok(prepared,'Christmas source must compile via existing player '+spec.selectionId);
 assert.equal(prepared.sourceNotes,spec.sourceNotes);
 assert.equal(prepared.melody.performance.length,spec.sourceNotes);
 assert.equal(prepared.timing.events.length,spec.sourceNotes);
 assert.equal(prepared.timing.certifiedGregorianTiming,false);
 assert.equal(prepared.renderScore.canonicalGabc,spec.sourceGabc);
 assert.equal(prepared.renderScore.scoreApproved,false);
 assert.equal(prepared.approved,false);
 assert.equal(prepared.certified,false);
 for(const form of ['MISSA_CANTATA_SIMPLE','MISSA_CANTATA_INCENSE','SOLEMN'])
  assert.equal(eligibleProperM59ResearchSource({form,mode:'LIVE',selectionId:spec.selectionId}),true);
 for(const context of [{form:'LOW',mode:'LIVE'},{form:'SOLEMN',mode:'MISSAL'},
  {form:'SOLEMN',mode:'LIVE',isRequiem:true}])
  assert.equal(eligibleProperM59ResearchSource({...context,selectionId:spec.selectionId}),false);
 for(const altered of [{...preview,gabc:preview.gabc+' '},{...preview,scoreApproved:true},
  {...preview,scoreId:'GREGOBASE-0'},{...preview,role:'WRONG'},
  {...preview,selectionId:'CHRISTMAS_WRONG'}])
  assert.equal(compileProperM59ResearchMelody({selectionId:spec.selectionId,
   source:altered,exsurge}),null,'Changed source must fail closed');
 assert.equal(compileProperM59ResearchMelody({selectionId:spec.selectionId,exsurge:null}),null);
 const count=byMass.get(spec.week)??{scores:0,notes:0};
 count.scores++;count.notes+=spec.sourceNotes;byMass.set(spec.week,count);
 console.log('PASS M62 PROPER',JSON.stringify({id:spec.selectionId,scoreId:spec.scoreId,
  notes:spec.sourceNotes,sections:spec.phraseNoteCounts.length}));
}
assert.deepEqual(Object.fromEntries(byMass),{
 CHRISTMAS_VIGIL:{scores:5,notes:803},
 CHRISTMAS_MIDNIGHT:{scores:5,notes:831},
 CHRISTMAS_DAWN:{scores:4,notes:727},
 CHRISTMAS_DAY:{scores:5,notes:824}
});
assert.equal(PROPER_M62_RESEARCH_SOURCES.reduce((n,x)=>n+x.sourceNotes,0),3185);
assert.equal(PROPER_RESEARCH_SOURCES.reduce((n,x)=>n+x.sourceNotes,0),13440);
assert.notEqual(properM59ResearchScore('CHRISTMAS_MIDNIGHT_INTROIT').scoreId,
 properM59ResearchScore('CHRISTMAS_MIDNIGHT_ALLELUIA').scoreId);
assert.notEqual(properM59ResearchScore('CHRISTMAS_DAY_GRADUAL').scoreId,
 properM59ResearchScore('CHRISTMAS_DAY_COMMUNION').scoreId);
for(const invalid of ['CHRISTMAS_DAWN_TRACT','CHRISTMAS_VIGIL_TRACT',
 'CHRISTMAS_WRONG','CHRISTMAS_DAY_WRONG','']){
 assert.equal(properM59ResearchScore(invalid),null);
 assert.equal(compileProperM59ResearchMelody({selectionId:invalid,exsurge}),null);
}
console.log('PASS M62 historical 19 archival Christmas sources preserved; M63 recovered Dawn score separately provisional');
