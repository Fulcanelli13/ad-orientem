// Draft editorial audit. This validates runtime-state -> art-slot lookup,
// never image quality, rights clearance, actual DOM rendering or publication.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { NOVENA_CORPUS_V4 } from '../src/pray/novena-corpus-v4.js';
import { DAILY_GUIDED_STEPS, NIGHTLY_EXAMEN_CARDS } from '../src/pray/guided-daily-cards.js';
import { ROSARY_MYSTERY_CONTEXT_V1 } from '../src/pray/rosary-mystery-context.v1.js';
import { resolveArtworkRuntimeIdentity } from '../src/pray/artwork-runtime-identity.v1.js';

const directory='data/prayer/artwork-editorial-20261030/';
const read=name=>JSON.parse(readFileSync(directory+name,'utf8'));
const manifest=read('runtime-card-parity-20261030.v1.json');
const approved=read('missing-art-approved-only-20261030.v1.json');
const canonicalBridge=read('balanced-reuse-20261030-live-prayer-48-bridge.v1.json');
const overlay=read('cross-prayer-inheritance-20261030.v1.json');
const ledger=read('balanced-reuse-20261030-assignments.v2.json');
const slots=new Map(ledger.slots.map(s=>[s.slot_id,s]));
const presentation=readFileSync('src/pray/presentation-runtime.js','utf8');
const line=prefix=>presentation.split('\n').find(v=>v.startsWith(prefix))||'';
const countPattern=(re,text)=>[...text.matchAll(re)].length;
const countFunction=name=>{
  const start=presentation.indexOf('function '+name+'(){return [');
  assert.ok(start>=0,'Missing step function '+name);
  const end=presentation.indexOf('\n]}',start);
  assert.ok(end>start,'Could not delimit '+name);
  return countPattern(/\{title:L\(/g,presentation.slice(start,end));
};
const numberOf=(name,regex)=>{
  const start=presentation.indexOf('const '+name+'=[');
  assert.ok(start>=0,'Missing source '+name);
  const end=presentation.indexOf('];',start);
  assert.ok(end>start,'Could not parse '+name);
  return countPattern(regex,presentation.slice(start,end));
};
const stationsLine=line('const STATION_DATA=');
assert.ok(stationsLine.endsWith(';'),'Stations JSON source format changed');
const stationData=JSON.parse(stationsLine.slice('const STATION_DATA='.length,-1));
assert.equal(stationData.stationTitles.en.length,14);
assert.equal(manifest.runtime_stage_to_editorial_slot.stations.length,14);
assert.equal(numberOf('BEN_STAGES',/\['/g),7);
assert.equal(numberOf('PEN_PSALMS',/\{trad:/g),7);
assert.equal(numberOf('WORD_REFS',/'[^']+'/g),7);
assert.equal(numberOf('FORTY_STAGES',/\['/g),6);
assert.equal(countFunction('visitSteps'),7);
assert.equal(countFunction('holySteps'),8);
assert.equal(countFunction('fourSteps'),5);
for(const [key,n] of Object.entries({
  benediction:7,penitential_psalms:7,seven_words:7,forty_hours:6,
  adoration_visit:7,adoration_holy_hour:8,adoration_four_ends:5,
  morning_daily:11,evening_daily:13,nightly_examen:5,
  first_friday:5,first_saturday:6,confession_macro:4
})){assert.equal(manifest.runtime_stage_to_editorial_slot[key]?.length,n,'Runtime mapping cardinality '+key)}
assert.deepEqual(
  manifest.runtime_stage_to_editorial_slot.morning_daily.map(x=>x.prayer_id),
  DAILY_GUIDED_STEPS.morning.map(x=>x.id)
);
assert.deepEqual(
  manifest.runtime_stage_to_editorial_slot.evening_daily.map(x=>x.prayer_id),
  DAILY_GUIDED_STEPS.evening.map(x=>x.id)
);
assert.deepEqual(
  manifest.runtime_stage_to_editorial_slot.nightly_examen.map(x=>x.logical_stage),
  NIGHTLY_EXAMEN_CARDS.map(x=>x.id)
);
assert.deepEqual(
  Object.keys(NOVENA_CORPUS_V4).sort(),
  manifest.novena_guided.map(x=>x.novena_id).sort()
);
const stages=n=>{
  const p=n.pattern||(n.id==='immaculate_conception'?'OPENING_DAY_COMMON_CLOSE':'STANDARD');
  return p==='HAMMER_MARIAN'?6:p==='OPENING_DAY_COMMON_CLOSE'?5:p==='COMMON_BEFORE_REPEAT'?4:(n.sharedClosingText?5:4);
};
let dayScreens=0,guideStates=0;
for(const map of manifest.novena_guided){
  const n=NOVENA_CORPUS_V4[map.novena_id];
  assert.ok(n,'Missing novena runtime '+map.novena_id);
  const actualDays=n.days.length,actualStages=stages(n);
  assert.equal(actualDays,9,'Unexpected days '+n.id);
  assert.equal(map.days,actualDays,'Stage map out of sync '+n.id);
  assert.equal(map.per_day_guided_stages,actualStages,'Guided stage count changed '+n.id);
  dayScreens+=actualDays;
  guideStates+=actualDays*actualStages;
  assert.ok(slots.has(map.cover_slot),'No cover slot '+n.id);
  if(map.preferred_day_slot)assert.ok(slots.has(map.preferred_day_slot),'Missing preferred day slot '+n.id);
  // Every guided stage has the same inherited prayer-level image pool unless
  // an exact day-scene override is deliberately approved. Reuse, do not invent.
  for(let day=1;day<=actualDays;day++)for(let stage=0;stage<actualStages;stage++){
    const mapped=slots.get(map.preferred_day_slot||map.cover_slot);
    assert.ok(mapped?.works.some(w=>w.eligible),'No editorial image candidate '+n.id+' '+day+'/'+stage);
  }
}
assert.equal(dayScreens,144);
assert.equal(guideStates,648);
const rosaryKeys=Object.keys(ROSARY_MYSTERY_CONTEXT_V1).sort();
assert.equal(rosaryKeys.length,20);

const bundle=readFileSync('ao-packed-04392ad5e156c05227d9.js','utf8');
const beginning=bundle.indexOf('function labRosarySteps(set)');
const ending=bundle.indexOf('function labRosaryDevotionalStep(',beginning);
assert.ok(beginning>=0&&ending>beginning,'Actual Rosary step generator missing from bundle');
const donor=bundle.slice(beginning,ending);
for(const token of [
  "const ids=labRosaryIds(set),steps=[]",
  "steps.push({kind:'mystery',id,mi,phase:'decade'})",
  "for(let bead=1;bead<=10;bead++)",
  "S.rosaryFatima!==false",
  "if(S.rosaryForm==='devotional')",
  "steps.push({kind:'conclusion',phase:'conclusion'})",
  "prayer('sign','conclusion',{finalCross:true})"
])assert.ok(donor.includes(token),'Rosary donor step generator drifted: '+token);
const rosaryDonorScenarios=[
  {form:'standard',fatima:true,opening:7,closing:1},
  {form:'standard',fatima:false,opening:7,closing:1},
  {form:'devotional',fatima:true,opening:3,closing:8},
  {form:'devotional',fatima:false,opening:3,closing:8}
];
for(const check of rosaryDonorScenarios){
  const perDecade=1+1+10+1+(check.fatima?1:0);
  const total=check.opening+5*perDecade+check.closing;
  const row=manifest.rosary_donor_runtime.five_decade_stage_totals.find(x=>x.form===check.form&&x.fatima===check.fatima);
  assert.ok(row,'Missing generated Rosary scenario '+check.form);
  assert.equal(total,row.total,'Donor-derived Rosary step length mismatch');
  assert.equal(perDecade,row.per_decade);
  for(const set of ['joyful','sorrowful','glorious','luminous']){
    // Every decade step carries mi and inherits that mystery image. All
    // opening and concluding prayers inherit the Rosary cover candidate.
    assert.equal(presentationResolve('rosary',0,{set,mystery:null}).slot,'COV-pray.rosary');
    for(let mi=0;mi<5;mi++){
      assert.ok(presentationResolve('rosary',0,{set,mystery:mi}).slot,
        'Rosary decade image stage missing '+set+' / '+mi);
    }
  }
}

assert.deepEqual(manifest.rosary_mystery_context.map(x=>x.context_key).sort(),rosaryKeys);
for(const x of manifest.rosary_mystery_context){
  if(x.context_key.startsWith('lum')){
    assert.ok(x.editorial_slot.startsWith('SEM-rosary.'));
  }else assert.ok(slots.has(x.editorial_slot),'Traditional mystery art slot missing '+x.context_key);
}
assert.equal(overlay.optional_luminous_mysteries.with_approved_art,5);
assert.equal(approved.approved.length,25);
for(const [family,stages] of Object.entries(manifest.runtime_stage_to_editorial_slot)){
  for(const stage of stages){
    assert.ok(slots.get(stage.editorial_slot)?.works.some(w=>w.eligible),'No editable painting pool: '+family+' '+stage.editorial_slot);
  }
}
assert.equal(manifest.summary.direct_editorial_slot_lookup_gaps,0);
assert.equal(manifest.summary.production_artwork_runtime_wiring_verified,false);
assert.equal(manifest.summary.reader_ui_image_coverage_certified,false);
assert.ok(manifest.unmapped_or_undercounted_runtime_surfaces.length>=10,
  'Do not silently declare all Prayer card-stage routes audited');
for(const file of ['src/pray/presentation-runtime.js','src/pray/novena-runtime.js','src/pray/traditional-pray-runtime.js']){
  const source=readFileSync(file,'utf8');
  assert.ok(!source.includes('runtime-card-parity-20261030.v1.json'),
    'Reader route art manifest activation requires separate human-approved visual QA');
}

const presentationResolve=(view,step,extra={})=>resolveArtworkRuntimeIdentity({owner:'presentation',view,step,...extra});
const traditionalResolve=(route,extra={})=>resolveArtworkRuntimeIdentity({owner:'traditional',route,...extra});
for(const [group,view] of [
  ['benediction','benediction'],['stations','stations'],
  ['penitential_psalms','penitential'],['seven_words','sevenWords'],
  ['forty_hours','fortyHours']
]){
  for(const row of manifest.runtime_stage_to_editorial_slot[group]){
    const idx=row.runtime_index??manifest.runtime_stage_to_editorial_slot[group].indexOf(row);
    const actual=presentationResolve(view,idx);
    assert.equal(actual.slot,row.editorial_slot,'Nonvisual runtime artwork ID mismatch '+group+' step '+idx);
    assert.equal(actual.publicationReady,false);
  }
}
for(const [group,mode] of [
  ['adoration_visit','visit'],['adoration_holy_hour','holy'],['adoration_four_ends','four']
]){
  for(const row of manifest.runtime_stage_to_editorial_slot[group]){
    const actual=presentationResolve('adoration',row.runtime_index,{mode});
    assert.equal(actual.slot,row.editorial_slot,'Adoration runtime artwork ID mismatch '+mode+' '+row.runtime_index);
  }
}
for(const [group,view] of [['first_friday','firstFriday'],['first_saturday','firstSaturday'],['confession_macro','confession']]){
  for(const row of manifest.runtime_stage_to_editorial_slot[group]){
    const actual=presentationResolve(view,row.runtime_index);
    assert.equal(actual.slot,row.editorial_slot,'Macro art slot mismatch '+group+' '+row.runtime_index);
  }
}
assert.equal(canonicalBridge.prayers.length,48);
assert.equal(canonicalBridge.summary.with_candidate,48);
for(const prayer of canonicalBridge.prayers){
  const actual=presentationResolve('prayerOnly',0,{prayerId:prayer.prayer_id});
  const expected=prayer.prayer_id==='litany_loreto_current'?'COV-litany_loreto_1962':prayer.cover_slot;
  assert.equal(actual.slot,expected,'Canonical direct/shared prayer artwork mismatch '+prayer.prayer_id);
  assert.ok(prayer.paintings?.length>0,'Canonical prayer has no painting pool '+prayer.prayer_id);
}
for(const row of manifest.runtime_stage_to_editorial_slot.nightly_examen){
  const actual=traditionalResolve('pray.nightly_examen',{examenStep:row.runtime_index});
  assert.equal(actual.slot,row.editorial_slot,'Examen art slot mismatch '+row.runtime_index);
}
for(const [group,part] of [['morning_daily','morning'],['evening_daily','evening']]){
  for(const row of manifest.runtime_stage_to_editorial_slot[group]){
    const actual=traditionalResolve('pray.morning_evening',{
      daypart:part,dailyStep:row.runtime_index,stepPrayerId:row.prayer_id
    });
    assert.equal(actual.slot,row.editorial_slot,'Canonical shared prayer mismatch '+part+' '+row.runtime_index);
  }
}
for(const row of manifest.novena_guided){
  const n=NOVENA_CORPUS_V4[row.novena_id],nSteps=stages(n);
  const expected=row.preferred_day_slot||row.cover_slot;
  for(let day=1;day<=9;day++)for(let stage=0;stage<nSteps;stage++){
    const actual=resolveArtworkRuntimeIdentity({
      owner:'novena',id:row.novena_id,screen:'day',day,stage,mode:'guided'
    });
    assert.equal(actual.slot,expected,'Novena runtime art mismatch '+row.novena_id+' '+day+'/'+stage);
    assert.equal(actual.publicationReady,false);
  }
}
const sets={joy:'joyful',sor:'sorrowful',glo:'glorious',lum:'luminous'};
for(const row of manifest.rosary_mystery_context){
  const context=row.context_key,set=sets[context.slice(0,3)],mystery=Number(context.slice(3))-1;
  const actual=presentationResolve('rosary',0,{set,mystery});
  assert.equal(actual.slot,row.editorial_slot,'Rosary scene reuse mismatch '+context);
  assert.equal(actual.publicationReady,false);
}
assert.equal(traditionalResolve('pray.holy_name_litany').slot,null,
  'Holy Name Litany lacks a specific image-bearing blueprint slot; update audit if remedied');
for(const f of ['src/pray/presentation-runtime.js','src/pray/novena-runtime.js','src/pray/traditional-pray-runtime.js']){
  const source=readFileSync(f,'utf8');
  assert.ok(source.includes('stampArtworkRuntimeIdentity'),
    'Nonvisual runtime marker missing in '+f);
}

console.log(JSON.stringify({
  gate:'EDITORIAL_RUNTIME_SLOT_LOOKUP_ONLY',
  novena_families:16,
  novena_day_screens:dayScreens,
  novena_guided_day_stage_states:guideStates,
  traditional_rosary_mystery_contexts:15,
  optional_luminous_contexts:5,
  dynamic_donor_routes_pending:manifest.unmapped_or_undercounted_runtime_surfaces.length,
  publish_ready:false,actual_dom_image_coverage_certified:false
},null,2));
