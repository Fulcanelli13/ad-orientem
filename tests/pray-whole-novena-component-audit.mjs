import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {NOVENA_CORPUS_V4} from '../src/pray/novena-corpus-v4.js';
import {ICKSP_DIVINE_INFANT_KING_NOVENA_V1} from '../src/pray/icksp-divine-infant-king-novena.v1.js';
import {ICKSP_IMMACULATE_CONCEPTION_NOVENA_V1} from '../src/pray/icksp-immaculate-conception-novena.v1.js';
import {NOVENA_HOLY_FACE_1887_B25} from '../src/pray/holy-face-janvier-1887-b25.js';
import {novenaStageChapters} from '../src/pray/devotional-sequence-adapter.js';
const lib=[...Object.values(NOVENA_CORPUS_V4),ICKSP_DIVINE_INFANT_KING_NOVENA_V1,ICKSP_IMMACULATE_CONCEPTION_NOVENA_V1,NOVENA_HOLY_FACE_1887_B25];
assert.equal(Object.keys(NOVENA_CORPUS_V4).length,16);
assert.equal(lib.length,19);
assert.equal(new Set(lib.map(x=>x.id)).size,19);
const noopCommon=['corpus_christi','sacred_heart','christ_the_king','immaculate_heart','st_michael'];
let cards=0,simple=0,english=0,french=0,sourceRepeats=0,hammers=0;
const perProgram={};
for(const n of lib){
 assert.equal(n.days.length,9);
 const pattern=n.pattern||(n.id==='immaculate_conception'?'OPENING_DAY_COMMON_CLOSE':'STANDARD');
 const emptyStandard=pattern==='STANDARD'&&!n.commonPrayers?.length&&!n.sharedClosingText;
 if(emptyStandard)assert.ok(noopCommon.includes(n.id),'Unexpected empty Common prayers source: '+n.id);
 if(noopCommon.includes(n.id)){
  assert.ok(emptyStandard);
  assert.deepEqual(novenaStageChapters({pattern,sharedClosing:false,commonRequired:false},{french:false}).map(x=>x.id),['prepare','day','close']);
  assert.deepEqual(novenaStageChapters({pattern,sharedClosing:false,commonRequired:false},{french:true}).map(x=>x.id),['prepare','day','close']);
 }
 const keys=pattern==='SOURCE_REPEAT_ONLY'?['prepare','repeat','close']:novenaStageChapters({pattern,sharedClosing:!!n.sharedClosingText,commonRequired:!emptyStandard},{french:false}).map(x=>x.id);
 assert.ok(keys.length>=3&&keys.length<=6);
 perProgram[n.id]=keys;
 cards+=keys.length*9;simple+=9;
 for(const day of n.days){
  const b=n.form==='REPEAT_FORM'?n.repeatText:day.text;
  const en=typeof b==='string'?b:b?.en;
  const fr=typeof b==='object'?b?.fr:null;
  if(en?.trim())english++;
  if(fr?.trim())french++;
 }
 if(pattern==='SOURCE_REPEAT_ONLY')sourceRepeats++;
 if(pattern==='HAMMER_MARIAN')hammers++;
}
assert.equal(noopCommon.length,5);
assert.equal(cards,684,'Five unsupported common stages must remove 45 redundant cards from 729');
assert.equal(simple,171);
assert.equal(english,171);
assert.equal(french,162,'Holy Face remains explicit English-only historical witness, not invented French');
assert.equal(sourceRepeats,3);
assert.equal(hammers,3);
assert.deepEqual(perProgram.holy_souls,['prepare','day','common','shared','close']);
assert.deepEqual(perProgram.immaculate_conception,['prepare','opening','common','day','close']);
for(const x of ['annunciation','assumption','seven_sorrows'])
 assert.deepEqual(perProgram[x],['prepare','opening','church','day','invocation','close']);
for(const x of noopCommon)assert.deepEqual(perProgram[x],['prepare','day','close']);
assert.deepEqual(perProgram.divine_infant_king,['prepare','repeat','close']);
assert.deepEqual(perProgram.icksp_immaculate_conception,['prepare','repeat','close']);
assert.deepEqual(perProgram.holy_face_1887,['prepare','repeat','close']);
const runtime=readFileSync(new URL('../src/pray/novena-runtime.js',import.meta.url),'utf8');
assert.match(runtime,/function novenaHasCommonStage\(n\)/);
assert.match(runtime,/commonRequired:novenaHasCommonStage\(n\)/);
assert.match(runtime,/function stages\(n\)\{return novenaChapters\(n\).length\}/);
assert.match(runtime,/const commonStage=hasCommon\|\|p!=='STANDARD'\?2:null/);
assert.match(runtime,/if\(commonStage!==null&&N.stage===commonStage\)/);
assert.match(runtime,/const closeStage=p==='OPENING_DAY_COMMON_CLOSE'\?4:\(n.sharedClosingText\?4:\(hasCommon\?3:2\)\)/);
assert.match(runtime,/function hammerSourceDayDetails\(n\)/);
assert.match(runtime,/const total=stages\(n\)/);
console.log('PASS: 19 actual Novenas, 171 day occasions, 684 guided cards (45 redundant removed) and 171 simple cards. Five empty common stages absent; Hammer six-stage, Holy Souls five-stage and two ICKSP + Holy Face three-stage source patterns preserved. 171 English bodies; 162 French bodies; missing Holy Face French not invented.');
