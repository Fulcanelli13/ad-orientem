/**
 * Editorial-only artwork slot resolver for Ad Orientem Prayer.
 *
 * This module intentionally returns stable slot IDs, NOT image URLs.
 * Its output MUST NOT be treated as art publication approval: original-work
 * identity, photographic reproduction rights, native quality, frame-free
 * composition and prayer-card parity are independent release gates.
 *
 * User rule: one approved event painting can serve the same event across
 * Rosary, Stations, chaplets, novenas, and shared prayers; an omitted
 * approval checkbox is not a rejection. Preserve explicit ONLY/reject and
 * cover locks in the underlying registry.
 */
import { DAILY_GUIDED_STEPS } from './guided-daily-cards.js';

const pad=n=>String(n).padStart(2,'0');
const validNumber=(value,min,max)=>Number.isInteger(Number(value))&&Number(value)>=min&&Number(value)<=max?Number(value):null;
const groups=Object.freeze({
  benediction:['STG-pray.benediction-01','STG-pray.benediction-01','STG-pray.benediction-02','COV-pray.benediction','STG-pray.benediction-03','STG-pray.benediction-04','STG-pray.benediction-04'],
  fortyHours:['COV-pray.forty_hours','COV-pray.forty_hours','COV-pray.forty_hours','COV-pray.forty_hours','COV-pray.benediction','COV-pray.forty_hours'],
  adorationVisit:Array.from({length:7},()=> 'STG-pray.adoration-01'),
  adorationHoly:Array.from({length:8},(_,i)=>i===0?'STG-pray.rosary-07':'COV-pray.adoration'),
  adorationFour:Array.from({length:5},(_,i)=>i<4?'STG-pray.adoration.four_ends-'+pad(i+1):'COV-pray.adoration.four_ends'),
  nightlyExamen:['COV-daily.nightly_examen','COV-daily.nightly_examen','COV-daily.nightly_examen','COV-daily.nightly_examen','COV-sacrament_act_of_contrition']
});
const novenaIds=new Set(['holy_ghost','christmas','corpus_christi','sacred_heart',
  'immaculate_conception','annunciation','assumption','seven_sorrows',
  'st_joseph','holy_souls','perpetual_help','st_therese',
  'christ_the_king','immaculate_heart','st_michael','st_anthony_nine_tuesdays']);
const novenaDayPools=new Set(['holy_ghost','christmas','holy_souls','st_therese']);
const luminous=['baptism_of_christ','wedding_at_cana','proclamation_of_kingdom','transfiguration','institution_of_eucharist'];
const make=(slotId,{fidelity='STAGE_SUBJECT_REUSE',parity='STAGED_EDITORIAL_TARGET',exactImageBlocker=null}={})=>slotId
  ?Object.freeze({slotId,fidelity,parity,exactImageBlocker,publicationCleared:false,sourceImageUrl:null})
  :null;
const at=(arr,step,fallback)=>{
  if(step===undefined||step===null)return fallback;
  const i=validNumber(step,0,arr.length-1);
  return i===null?null:arr[i];
};
const stageSeries=(prefix,size,step,cover)=>{
  if(step===undefined||step===null)return make(cover);
  const n=validNumber(step,0,size-1);
  return n===null?null:make(prefix+pad(n+1));
};
export const PRAYER_ARTWORK_EDITORIAL_ROUTE_VERSION='20261030-runtime-parity-v1';
export function resolvePrayerArtworkEditorialTarget({
  route='',view='',stage,mode='',set='',mi,novenaId='',day=1,daypart='morning',prayerId='',form=''
}={}){
  const key=String(route||view||'').trim();
  if(key==='pray.novenas'||key==='novenas'){
    if(!novenaIds.has(novenaId)||validNumber(day,1,9)===null)return null;
    const slot=novenaDayPools.has(novenaId)?'STG-novena.'+novenaId+'-01':'COV-novena.'+novenaId;
    return make(slot,{fidelity:'NOVENA_DAY_REUSES_PRAYER_FAMILY_ART',
      parity:'DAYS_1_TO_9_RESOLVED_GUIDED_MICROSTAGES_INHERIT',
      exactImageBlocker:novenaId==='st_therese'?'SAINT_THERESE_EXACT_IMAGE_RIGHTS_AND_FIT_NOT_CLEARED':null});
  }
  if(key==='pray.benediction'||key==='benediction'){
    const i=validNumber(stage??0,0,6);
    if(i===null)return null;
    return make(groups.benediction[i],{fidelity:i===4?'CONTEXTUAL_COVER_ONLY_NOT_EXACT_RITE':'STAGED_RITE_EVENT',
      exactImageBlocker:i===4?'BENEDICTION_ACTUAL_BLESSING_PAINTING_MISSING':null});
  }
  if(key==='pray.stations'||key==='stations')return stageSeries('STG-pray.stations-',14,stage,'COV-pray.stations');
  if(key==='pray.seven_words'||key==='sevenWords')return stageSeries('STG-pray.seven_words-',7,stage,'COV-pray.seven_words');
  if(key==='pray.penitential_psalms'||key==='penitential')return stageSeries('STG-pray.penitential_psalms-',7,stage,'COV-pray.penitential_psalms');
  if(key==='pray.forty_hours'||key==='fortyHours')return make(at(groups.fortyHours,stage,'COV-pray.forty_hours'),{fidelity:'DEVOTION_COVER_CARRYOVER'});
  if(key==='pray.adoration'||key==='adoration'||key==='pray.visit_blessed_sacrament'){
    const kind=key==='pray.visit_blessed_sacrament'?'visit':String(mode);
    const collection=kind==='visit'?groups.adorationVisit:kind==='holy'?groups.adorationHoly:kind==='four'?groups.adorationFour:null;
    return collection?make(at(collection,stage,'COV-pray.adoration'),{fidelity:'ADORATION_CONTEXT_CARRYOVER'}):make('COV-pray.adoration');
  }
  if(key==='pray.adoration.night')return stageSeries('STG-pray.adoration.night-',6,stage,'COV-pray.adoration.night');
  if(key==='pray.nightly_examen'||key==='nightly_examen')return make(at(groups.nightlyExamen,stage,'COV-daily.nightly_examen'),{fidelity:'EXAMEN_CONTEXT_CARRYOVER'});
  if(key==='pray.morning_evening'||key==='morning_evening'){
    const which=daypart==='evening'?'evening':'morning',steps=DAILY_GUIDED_STEPS[which]||[];
    const idx=validNumber(stage??0,0,steps.length-1);
    if(idx===null)return null;
    const id=steps[idx]?.id;
    return make(id==='pray.nightly_examen'?'COV-daily.nightly_examen':'COV-'+id,{fidelity:'SHARED_CANONICAL_PRAYER'});
  }
  if(key==='pray.rosary'||key==='rosary'){
    const n=validNumber(mi,0,4);
    if(n===null)return make('COV-pray.rosary',{parity:'MYSTERY_BEAD_DONOR_JOIN_PENDING'});
    const formId=String(set).toLowerCase();
    const offset={joyful:2,sorrowful:7,glorious:12};
    if(formId==='luminous')return make('SEM-rosary.'+luminous[n],
      {parity:'SEMANTIC_EDITORIAL_ONLY_NO_STABLE_RUNTIME_CARD_JOIN',exactImageBlocker:'LUMINOUS_RUNTIME_ID_AND_PHOTO_QA_PENDING'});
    return Object.prototype.hasOwnProperty.call(offset,formId)
      ?make('STG-pray.rosary-'+pad(offset[formId]+n),{parity:'MYSTERY_CONTEXT_MAPPED_BEAD_DONOR_UNVERIFIED'})
      :null;
  }
  if(key==='pray.angelus'||key==='angelus'||key==='pray.angelus_regina'){
    return make(key==='pray.angelus_regina'||form==='regina'||form==='regina_caeli'
      ?'COV-pray.angelus_regina':'COV-pray.angelus',
      {fidelity:'SEASONAL_FORM_COVER',parity:'ANGELUS_SUBSTEP_JOIN_PENDING'});
  }
  if(key==='pray.confession'||key==='confession')return stageSeries('STG-pray.confession-',4,stage,'COV-pray.confession');
  if(key==='pray.litany_saints'||key==='litany')return make('COV-pray.litany_saints',{parity:'LITANY_SECTION_IDS_PENDING'});
  const chaplets={
    'pray.divine_mercy':{cover:'COV-pray.divine_mercy',stem:'STG-pray.divine_mercy-',count:1},
    'pray.five_wounds':{cover:'COV-pray.five_wounds',stem:'STG-pray.five_wounds-',count:5},
    'pray.precious_blood':{cover:'COV-pray.precious_blood',stem:'STG-pray.precious_blood-',count:7},
    'pray.little_crown':{cover:'COV-pray.little_crown',stem:'STG-pray.little_crown-',count:1},
    'prayer.seven_sorrows_chaplet':{cover:'COV-prayer.seven_sorrows_chaplet',stem:'STG-prayer.seven_sorrows_chaplet-',count:7}
  };
  if(chaplets[key]){
    const g=chaplets[key],row=stageSeries(g.stem,g.count,stage,g.cover);
    return row?make(row.slotId,{parity:'CHAPLET_DONOR_CARD_IDS_NOT_YET_JOINED',fidelity:'SCENE_CANDIDATE_ONLY'}):null;
  }
  const simple={
    'pray.sacred_hymns':'COV-prayer.hymns',
    'pray.sacred_heart':'COV-prayer.sacred_heart',
    'pray.meal_prayers':'COV-foundations_grace_before_meals',
    'pray.communion_treasury':'COV-prayer.communion',
    'pray.good_death':'COV-prayer.good_death',
    'pray.dying_companion':'COV-prayer.good_death',
    'programme.first_friday':'COV-programme.first_friday',
    'programme.first_saturday':'COV-programme.first_saturday'
  };
  if(simple[key])return make(simple[key],{parity:'SUBSTEP_RUNTIME_PARITY_NOT_YET_VERIFIED',fidelity:'PARENT_DEVOTION_COVER'});
  if(key==='prayerOnly'||key==='prayerOnly:canonical')
    return prayerId?make('COV-'+prayerId,{parity:'CANONICAL_PRAYER_ID_REQUIRES_REGISTRY_CHECK'}):null;
  return null; // Never invent an artwork ID for an unrecognised route.
}
