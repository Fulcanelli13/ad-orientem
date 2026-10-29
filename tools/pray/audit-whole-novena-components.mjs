#!/usr/bin/env node
/**
 * Whole-Novena phase 1: inventory what is actually in the 2026 reader.
 * This is a structural audit, NOT an assertion that the whole devotional
 * programme has been historically or bilingually verified.
 * No network, contact, copyright-dependent source copying, or source mutation.
 */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {NOVENA_CORPUS_V4} from '../../src/pray/novena-corpus-v4.js';
import {ICKSP_DIVINE_INFANT_KING_NOVENA_V1} from '../../src/pray/icksp-divine-infant-king-novena.v1.js';
import {ICKSP_IMMACULATE_CONCEPTION_NOVENA_V1} from '../../src/pray/icksp-immaculate-conception-novena.v1.js';
import {NOVENA_HOLY_FACE_1887_B25} from '../../src/pray/holy-face-janvier-1887-b25.js';
const specialised=[
 ICKSP_DIVINE_INFANT_KING_NOVENA_V1,
 ICKSP_IMMACULATE_CONCEPTION_NOVENA_V1,
 NOVENA_HOLY_FACE_1887_B25
];
const all=[...Object.values(NOVENA_CORPUS_V4),...specialised];
const has=v=>typeof v==='string'?v.trim().length>0:(v&&typeof v==='object'&&typeof v.en==='string'&&v.en.trim().length>0);
const lang=(v,k)=>v&&typeof v==='object'&&String(v[k]||'').trim().length>0;
const heading=(n)=>n.title?.en||n.id;
const english=(x)=>typeof x==='string'?x:(x?.en||'');
const keyset=new Set();
const runtime=readFileSync(new URL('../../src/pray/novena-runtime.js',import.meta.url),'utf8');
const testmode=process.argv.includes('--self-test');
function pattern(n){return n.pattern||(n.id==='immaculate_conception'?'OPENING_DAY_COMMON_CLOSE':'STANDARD')}
function keys(n){
 const p=pattern(n);
 if(p==='SOURCE_REPEAT_ONLY')return ['prepare','repeat','close'];
 if(p==='HAMMER_MARIAN')return ['prepare','opening','church','day','invocation','close'];
 if(p==='OPENING_DAY_COMMON_CLOSE')return ['prepare','opening','common','day','close'];
 if(p==='COMMON_BEFORE_REPEAT')return ['prepare','common','day','close'];
 return n.sharedClosingText?['prepare','day','common','shared','close']:['prepare','day','common','close'];
}
function sourceBlocks(n){return {
 opening:has(n.opening),churchPrayer:has(n.churchPrayer),ejaculation:has(n.ejaculation),
 sharedClosingText:has(n.sharedClosingText),closingCanonical:!!n.closingCanonical,
 loretoCanonical:!!n.loretoCanonical,
 repeatText:has(n.repeatText),daySpecificEnglish:n.days.filter(d=>has(d.text)).length
};}
const flags=[];
const register=[];
function flag(n,severity,code,evidence){
 const f={id:n.id,level:severity,code,evidence};
 flags.push(f);return f;
}
for(const n of all){
 assert.ok(n.id&&!keyset.has(n.id),'Non-unique programme ID '+n.id);keyset.add(n.id);
 assert.equal(n.days?.length,9,'Programme must have nine observable days: '+n.id);
 assert.ok(n.title?.en&&n.title?.fr,'Missing title: '+n.id);
 assert.ok(n.source?.url,'Missing source locator: '+n.id);
 const p=pattern(n),stages=keys(n),common=Array.isArray(n.commonPrayers)?n.commonPrayers:[];
 const special=specialised.some(x=>x.id===n.id);
 const body=n.form==='REPEAT_FORM'?Array.from({length:9},()=>n.repeatText):n.days.map(d=>d.text);
 const englishCount=body.filter(has).length;
 const frenchCount=body.filter(x=>lang(x,'fr')).length;
 const enChar=body.map(x=>english(x).length);
 const guideCount=n.days.filter(d=>lang(d.guide,'fr')&&lang(d.guide,'en')).length;
 const themeCount=n.days.filter(d=>lang(d.theme,'fr')&&lang(d.theme,'en')).length;
 const boxes=sourceBlocks(n);
 const direct={
  sourceBookStatus:String(n.source?.status||''),
  frenchTextStatus:String(n.frenchTextStatus||''),
  sourceWork:String(n.source?.work||''),
  edition:String(n.source?.edition||''),
  sourceUrl:n.source.url,
  calendarPrecision:String(n.calendar?.precision||''),
  startKind:n.startKind||null
 };
 const rec={
  id:n.id,title:heading(n),titleFr:n.title.fr,kind:special?'SPECIALIST':'CORE',
  form:n.form,pattern:p,days:9,guidedCardsPerDay:stages.length,
  guidedStageKeys:stages,simpleCardsPerDay:1,
  totalGuidedDayCards:stages.length*9,totalSimpleDayCards:9,
  bodyEnglishDays:englishCount,bodyFrenchDays:frenchCount,
  dayGuidesBilingual:guideCount,dayThemesBilingual:themeCount,
  englishBodyCharacters:{min:Math.min(...enChar),max:Math.max(...enChar)},
  sourceBlocks:boxes,commonPrayers:common.map(x=>({prayerId:x[0],repetitions:x[1]})),
  commonRecitationTotal:common.reduce((a,x)=>a+Number(x[1]||0),0),
  hasCommonNote:has(n.commonNote),
  explicitHistoricalSourceWitness:direct,
  independentHistoricalPrintEditionCertified:false,
  completeProgramSourceSequenceCertified:false,
  contemporaryIndulgenceGrantedAndConditionsCertified:false,
  editorialFindings:[]
 };
 if(englishCount!==9){const f=flag(n,'BLOCKER','EN_BODY_MISSING','Not all 9 prayer occasions have an English body');rec.editorialFindings.push(f.code);}
 if(frenchCount!==9){
  const code='BODY_FR_UNAVAILABLE_OR_INCOMPLETE';
  const f=flag(n,'LOCALE_HOLD',code,englishCount+'/9 English, '+frenchCount+'/9 French days; French UI must retain clear fallback and cannot be called fully bilingual');rec.editorialFindings.push(f.code);
 }
 if(themeCount<9||guideCount<9){const f=flag(n,'LOCALE_HOLD','DAY_GUIDE_OR_THEME_LANGUAGE_INCOMPLETE','Themes '+themeCount+'/9, day guides '+guideCount+'/9 with EN and FR');rec.editorialFindings.push(f.code);}
 if(stages.includes('common')&&common.length===0){
  const f=flag(n,'UX_REVIEW','EMPTY_COMMON_PRAYER_CARD','Guided navigation explicitly displays a Common prayers stage although the source has no listed canonical common prayer; stage renders only guidance');rec.editorialFindings.push(f.code);
 }
 if(p==='SOURCE_REPEAT_ONLY'&&common.length){
  const f=flag(n,'BLOCKER','GUIDED_COMMON_PRAYERS_SKIPPED','SOURCE_REPEAT_ONLY branch directly returns before common prayers; Simple renders them, Guided omits them');rec.editorialFindings.push(f.code);
 }
 if(p==='SOURCE_REPEAT_ONLY'&&(boxes.opening||boxes.sharedClosingText||boxes.closingCanonical)){
  const f=flag(n,'BLOCKER','GUIDED_SOURCE_COMPONENT_SKIPPED','SOURCE_REPEAT_ONLY guided mode only renders source prayer, not these additional source components');rec.editorialFindings.push(f.code);
 }
 if(n.id==='holy_face_1887'){
  const f=flag(n,'SOURCE_HOLD','ORIGINAL_1887_PRINT_NOT_VISUALLY_COLLATED','English 1887 historical digital transcription: scanned 1887 pages have not been compared');rec.editorialFindings.push(f.code);
  if(enChar.some(x=>x>=2500)){
   const g=flag(n,'UX_REVIEW','LONG_HOLY_FACE_ONE_CARD','Very long historical daily mediation, act, virtue and bouquet all presented in one prayer text/card with vertical scroll; consider source-owned section cards after confirming editorial boundaries');rec.editorialFindings.push(g.code);
  }
 }
 if(p==='HAMMER_MARIAN'){
  const f=flag(n,'CONTENT_REVIEW','HAMMER_MEDITATION_PRACTICE_ENGLISH_ONLY_IN_DISCLOSURE','Historical day meditation and practice are rendered in one expandable English-only details inside the day prayer card, not bilingual sequence steps; inspect source preservation and optional/required treatment');rec.editorialFindings.push(f.code);
 }
 if(common.some(x=>Number(x[1])>9)){
  const f=flag(n,'UX_REVIEW','LARGE_REPETITION_AS_ONE_CANONICAL_BLOCK','Runtime canonicalPrayer shows repetition as N× title and one text, not one navigable card per repetition; ensure user can follow and track '+common.map(x=>x[1]).join('/')+' recitations');rec.editorialFindings.push(f.code);
 }
 if(!['DAY_SPECIFIC','REPEAT_FORM'].includes(n.form)){const f=flag(n,'BLOCKER','UNKNOWN_PRAYER_FORM','Unsupported form '+n.form);rec.editorialFindings.push(f.code);}
 if(!['STANDARD','OPENING_DAY_COMMON_CLOSE','HAMMER_MARIAN','COMMON_BEFORE_REPEAT','SOURCE_REPEAT_ONLY'].includes(p)){const f=flag(n,'BLOCKER','UNKNOWN_STAGE_PATTERN','Reader pattern not mapped '+p);rec.editorialFindings.push(f.code);}
 if(p==='HAMMER_MARIAN'&&(!boxes.opening||!boxes.churchPrayer||!boxes.ejaculation)){
  const f=flag(n,'BLOCKER','REQUIRED_HAMMER_STAGE_HAS_NO_TEXT','One source-owned Hammer guided stage would have missing prayer text');rec.editorialFindings.push(f.code);
 }
 register.push(rec);
}
assert.equal(Object.keys(NOVENA_CORPUS_V4).length,16);
assert.equal(specialised.length,3);
assert.equal(register.length,19);
assert.equal(new Set(register.map(r=>r.id)).size,19);
assert.ok(runtime.includes("function stages(n)"));
assert.ok(runtime.includes("function stageContent(n,d)"));
assert.ok(runtime.includes("function hammerSourceDayDetails(n)"));
assert.ok(runtime.includes("function sourceWitness(text,label)"));
assert.ok(runtime.includes("function canonicalPrayer(id,count=1)"));
const distributions={};for(const r of register){const k=r.pattern;distributions[k]=(distributions[k]||0)+1;}
const cohort={
 programmes:register.length,coreProgrammes:16,specialistProgrammes:3,
 distinctDayOccasions:register.reduce((v,x)=>v+x.days,0),
 guidedCardInstancesAcrossNineDays:register.reduce((v,x)=>v+x.totalGuidedDayCards,0),
 simpleCardInstancesAcrossNineDays:register.reduce((v,x)=>v+x.totalSimpleDayCards,0),
 totalEnglishProperBodiesAvailable:register.reduce((v,x)=>v+x.bodyEnglishDays,0),
 totalFrenchProperBodiesAvailable:register.reduce((v,x)=>v+x.bodyFrenchDays,0),
 patternCounts:distributions,
 sourceComponentOccurrences:{
  opening:register.filter(x=>x.sourceBlocks.opening).length,
  churchPrayer:register.filter(x=>x.sourceBlocks.churchPrayer).length,
  ejaculation:register.filter(x=>x.sourceBlocks.ejaculation).length,
  sharedClosingText:register.filter(x=>x.sourceBlocks.sharedClosingText).length,
  closingCanonical:register.filter(x=>x.sourceBlocks.closingCanonical).length,
  loretoCanonical:register.filter(x=>x.sourceBlocks.loretoCanonical).length,
  commonPrayers:register.reduce((v,x)=>v+x.commonPrayers.length,0)
 },
 findings:{
  total:flags.length,
  blocker:flags.filter(x=>x.level==='BLOCKER').length,
  localeHolds:flags.filter(x=>x.level==='LOCALE_HOLD').length,
  contentReview:flags.filter(x=>x.level==='CONTENT_REVIEW').length,
  uxReview:flags.filter(x=>x.level==='UX_REVIEW').length,
  sourceHold:flags.filter(x=>x.level==='SOURCE_HOLD').length
 }
};
const result={
 schema:'ao.pray.whole-novena-19-runtime-component-audit.v1',
 date:'2026-10-29',sourceOfTruth:'Source modules imported directly into Node (no copied programme catalogue)',
 scope:'19 Novena programme records (16 canonical core + three specialist); this counts rendered source components and actual per-day guided/simple stage shells, not full historical print certification.',
 measure:'Runtime component/translation structural coverage ONLY. Full proper body printed-word verification for separate 8 historical day-specific programmes was previously established as 72/72; it must not be expanded to remaining eleven forms or their full component sets.',
 denominator:cohort,
 programmes:register,
 findings:flags,
 editorialControls:{
  sourceHistoricalEditionCertificates:0,
  wholeDevotionSequenceCertificates:0,
  independentlyVerifiedHistoricalFrenchWriters:0,
  modernIndulgenceGrantsCertified:0,
  knownExisting72BodyProofFile:'data/pray/original-print-72-body-visual-proof-20261029.v1.json',
  noHistoricWordTextModified:true,
  noCurrentIndulgencesInferred:true
 }
};
if(testmode){
 console.log('PASS structural novena census: '+JSON.stringify(cohort));
 console.log('PATTERNS '+JSON.stringify(register.map(r=>({id:r.id,form:r.form,pattern:r.pattern,cards:r.guidedCardsPerDay,fr:r.bodyFrenchDays,common:r.commonPrayers.map(x=>x.prayerId+'×'+x.repetitions),flags:r.editorialFindings}))));
}else{
 const out=resolve(process.argv.includes('--out')?process.argv[process.argv.indexOf('--out')+1]:'/tmp/pray-whole-novena-audit');
 mkdirSync(out,{recursive:true});
 writeFileSync(join(out,'19-novena-runtime-component-audit.json'),JSON.stringify(result,null,2)+'\n');
 const lines=register.map(r=>[r.id,r.kind,r.pattern,r.guidedCardsPerDay,r.bodyEnglishDays,r.bodyFrenchDays,r.commonRecitationTotal,r.editorialFindings.join(';')].join('\t'));
 writeFileSync(join(out,'19-novena-runtime-component-audit.tsv'),['ID\tScope\tPattern\tGuidedCards/Day\tENBodyDays\tFRBodyDays\tCommonRepetitions\tReviewFlags',...lines].join('\n')+'\n');
 console.log('SUMMARY '+JSON.stringify(cohort));
 console.log('FLAGS '+JSON.stringify(flags));
 console.log('OUTPUT '+out);
}
