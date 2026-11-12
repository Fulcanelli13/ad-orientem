// Research-only melody audition: never promotes provisional music into LIVE Schola.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {offlineKyrialeResearchScore} from '../src/mass/reader-kyriale-research-gabc.js';
import {compileKyrieXviAudition,kyrieXviAuditionEligible} from '../src/mass/reader-schola-kyrie-research-audition.js';
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
const dom=readFileSync(new URL('../src/mass/reader-dom.js',import.meta.url),'utf8');
assert.ok(dom.includes('createKyrieXviResearchAudition'), 'Research audition not connected to existing reader adapter');
assert.ok(dom.includes('kyrieResearchAudition?.sync()'), 'Schola selection changes must refresh preview gate');
assert.ok(dom.includes('kyrieResearchAudition?.stop()'), 'New Mass session must stop prior audio');
assert.ok(dom.includes('kyrieResearchAudition?.destroy()'), 'Reader teardown must release audio and DOM');
console.log('PASS Kyrie XVI: 40 printed notes, 27 source groups, 81 sounded notes, ninefold repetitions, fail-closed form and source selection');
