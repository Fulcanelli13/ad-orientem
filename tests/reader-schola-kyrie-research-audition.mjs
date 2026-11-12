// Research-only melody audition: never promotes provisional music into LIVE Schola.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {offlineKyrialeResearchScore} from '../src/mass/reader-kyriale-research-gabc.js';
import {compileKyrieXviAudition,compileKyrieXviiiAudition,kyrieXviAuditionEligible,kyrieResearchAuditionEligible} from '../src/mass/reader-schola-kyrie-research-audition.js';
const score=offlineKyrialeResearchScore('KYRIE','MASS_16');
assert.equal(score?.scoreId,'GREGOBASE-545');
const compiled=compileKyrieXviAudition(score.gabc);
assert.ok(compiled,'Kyrie XVI source changed: research audition must fail closed');
assert.equal(compiled.sourceNoteCount,40);
assert.equal(compiled.sourceGroupCount,27);
assert.equal(compiled.invocations,9);
assert.equal(compiled.performance.length,81);
assert.deepEqual(compiled.performance.filter(n=>n.phraseEnd).map(n=>n.invocation),[1,2,3,4,5,6,7,8,9]);
assert.deepEqual(compiled.performance.filter(n=>n.phraseEnd).map(n=>n.sourceNoteOrdinal),[9,9,9,16,16,16,25,25,40]);
assert.deepEqual(compiled.performance.filter(n=>n.mora).map(n=>n.invocation),[1,2,3,4,5,6,7,8,9]);
assert.equal(compiled.performance.at(-1).sourceNoteOrdinal,40);
assert.equal(compiled.performance.at(-1).phraseEnd,true);
assert.equal(compileKyrieXviAudition('not a GABC'),null);
for(const form of ['MISSA_CANTATA_SIMPLE','MISSA_CANTATA_INCENSE','SOLEMN']){
 assert.equal(kyrieXviAuditionEligible({form,settingId:'MASS_16'}),true);
 assert.equal(kyrieXviAuditionEligible({form,settingId:'CUSTOM'}),false);
 assert.equal(kyrieXviAuditionEligible({form,settingId:'MASS_16',isRequiem:true}),false);
}
assert.equal(kyrieXviAuditionEligible({form:'LOW',settingId:'MASS_16'}),false);
assert.equal(kyrieXviAuditionEligible({
 form:'SOLEMN',settingId:'MASS_16',mode:'MISSAL'
}),false,'Missal must not expose live Schola research audio');
assert.equal(kyrieXviAuditionEligible({
 form:'SOLEMN',settingId:'MASS_16',mode:'LIVE'
}),true);
// A second, separately named research preview is allowed only after an
// explicitly selected Kyrie XVIII and only when its exact GABC is unchanged.
const scoreXVIII=offlineKyrialeResearchScore('KYRIE','MASS_18');
assert.equal(scoreXVIII?.scoreId,'GREGOBASE-2522');
assert.equal(scoreXVIII.scoreApproved,false);
const compiledXVIII=compileKyrieXviiiAudition(scoreXVIII.gabc);
assert.ok(compiledXVIII,'Kyrie XVIII source changed: audition must fail closed');
assert.equal(compiledXVIII.sourceNoteCount,44);
assert.equal(compiledXVIII.sourceGroupCount,27);
assert.equal(compiledXVIII.phraseCount,4);
assert.equal(compiledXVIII.invocations,9);
assert.equal(compiledXVIII.performance.length,90);
assert.deepEqual(compiledXVIII.performance.filter(n=>n.phraseEnd).map(n=>n.sourceNoteOrdinal),
 [10,10,10,18,18,18,28,28,44]);
assert.equal(compileKyrieXviiiAudition(scoreXVIII.gabc.replace('(hhg)','(hig)')),null);
assert.equal(compileKyrieXviiiAudition('not GABC'),null);
for(const form of ['MISSA_CANTATA_SIMPLE','MISSA_CANTATA_INCENSE','SOLEMN']){
 assert.equal(kyrieResearchAuditionEligible({form,settingId:'MASS_18'}),true);
 assert.equal(kyrieResearchAuditionEligible({form,settingId:'MASS_16'}),true);
 assert.equal(kyrieResearchAuditionEligible({form,settingId:'MASS_18',mode:'MISSAL'}),false);
 assert.equal(kyrieResearchAuditionEligible({form,settingId:'MASS_18',isRequiem:true}),false);
 assert.equal(kyrieResearchAuditionEligible({form,settingId:'CUSTOM'}),false);
}
assert.equal(kyrieResearchAuditionEligible({form:'LOW',settingId:'MASS_18'}),false);
assert.equal(kyrieXviAuditionEligible({form:'SOLEMN',settingId:'MASS_18'}),false);
const dom=readFileSync(new URL('../src/mass/reader-dom.js',import.meta.url),'utf8');
assert.ok(dom.includes('createKyrieXviResearchAudition'), 'Research audition not connected to existing reader adapter');
assert.ok(dom.includes('kyrieResearchAudition?.sync()'), 'Schola selection changes must refresh preview gate');
assert.ok(dom.includes('kyrieResearchAudition?.stop()'), 'New Mass session must stop prior audio');
assert.ok(dom.includes('kyrieResearchAudition?.destroy()'), 'Reader teardown must release audio and DOM');
console.log('PASS Kyrie research: XVI 40/81 and XVIII 44/90 source notes/events, exact-source gating, ninefold repeat and no automatic Schola approval');
