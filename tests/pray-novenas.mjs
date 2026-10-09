import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { NOVENA_CORPUS_V3 } from "../src/pray/novena-corpus.js";
import { NOVENA_CORPUS_V4, NOVENA_CORPUS_V4_IDS, NOVENA_CORPUS_V4_VERSION, NOVENA_START_KIND } from "../src/pray/novena-corpus-v4.js";
import { NOVENA_FRENCH_GUIDE_PARITY_V1, NOVENA_FRENCH_GUIDE_PARITY_STATUS } from "../src/pray/novena-french-guide-parity.v1.js";
import { NOVENA_SOURCE_HOLDS, NOVENA_TARGET_IDS, NOVENA_TARGET_REGISTRY_V1 } from "../src/calendar/devotional-registry.js";
import { NOVENA_SOURCE_ACCESS_V1, novenaSourceAccess } from "../src/pray/novena-source-access.v1.js";
import { HAMMER_DAY_SECTIONS_V1, HAMMER_DAY_SOURCE_URL_V1, hammerHistoricalDayWitness } from "../src/pray/novena-hammer-day-witness.v1.js";
import { HAMMER_HISTORICAL_1909_V1, hammerHistoricalDayText } from "../src/pray/novena-hammer-original-texts.v1.js";

const donorExpected=[
  "holy_ghost","christmas","corpus_christi","sacred_heart",
  "immaculate_conception","annunciation","assumption","seven_sorrows",
  "st_joseph","holy_souls","perpetual_help","st_therese"
];
const completeExpected=[
  ...donorExpected,
  "st_anthony_nine_tuesdays","christ_the_king","immaculate_heart","st_michael"
];

assert.deepEqual(Object.keys(NOVENA_CORPUS_V3),donorExpected,"Frozen N3 English donor identity/order changed");
assert.equal(NOVENA_CORPUS_V4_VERSION,"bilingual-16-target-v1");
assert.deepEqual(NOVENA_CORPUS_V4_IDS,completeExpected,"Complete novena corpus identity/order changed");
assert.equal(NOVENA_TARGET_IDS.length,16,"Novena registry must remain 16 targets");
assert.equal(Object.keys(NOVENA_TARGET_REGISTRY_V1).length,16);
assert.deepEqual(Object.keys(NOVENA_SOURCE_HOLDS),[],"Completed novena corpus must have no unresolved source holds");
assert.ok(Object.values(NOVENA_TARGET_REGISTRY_V1).every(x=>x.playable===true&&x.availability==="PLAYABLE_BILINGUAL_SOURCE_LOCKED"),"All 16 novenas must be playable bilingual targets");
const traditionalStartIds=new Set(["holy_ghost","christmas","corpus_christi","sacred_heart","immaculate_conception","christ_the_king"]);
for(const [id,n] of Object.entries(NOVENA_CORPUS_V4)){
  assert.equal(
    n.startKind,
    traditionalStartIds.has(id)?NOVENA_START_KIND.TRADITIONAL:NOVENA_START_KIND.SUGGESTED,
    id+" start authority changed"
  );
}
assert.equal(NOVENA_CORPUS_V4.st_anthony_nine_tuesdays.startKind,NOVENA_START_KIND.SUGGESTED);
assert.equal(NOVENA_CORPUS_V4.immaculate_heart.startKind,NOVENA_START_KIND.SUGGESTED);
assert.equal(NOVENA_CORPUS_V4.st_michael.startKind,NOVENA_START_KIND.SUGGESTED);
assert.equal(NOVENA_CORPUS_V4.christ_the_king.startKind,NOVENA_START_KIND.TRADITIONAL);
assert.match(NOVENA_CORPUS_V4.st_michael.traditionalStart.en,/Suggested feast preparation/);
assert.match(NOVENA_CORPUS_V4.immaculate_heart.traditionalStart.en,/Suggested feast preparation/);
assert.match(NOVENA_CORPUS_V4.st_anthony_nine_tuesdays.traditionalStart.en,/Suggested feast preparation/);
assert.ok(NOVENA_CORPUS_V4.st_michael.historySources.some(x=>/Raccolta/.test(x.label)),"St Michael lost the Raccolta novena authority witness");
assert.ok(NOVENA_CORPUS_V4.christ_the_king.historySources.some(x=>/1955/.test(x.label)),"Christ the King lost the pre-conciliar feast-preparation witness");


let bodyCount=0;
for(const id of completeExpected){
  const n=NOVENA_CORPUS_V4[id];
  assert.equal(n.id,id,id+" identity changed");
  assert.equal(n.days.length,9,id+" no longer has exactly nine prayer occasions");
  assert.ok(n.title?.en&&n.title?.fr,id+" lost bilingual title");
  assert.ok(n.history?.en&&n.history?.fr,id+" lost bilingual history");
  assert.ok(n.meaning?.en&&n.meaning?.fr,id+" lost bilingual meaning");
  assert.ok(n.how?.en&&n.how?.fr,id+" lost bilingual how-to-pray guidance");
  assert.ok(n.calendar?.precision,id+" lost calendar authority metadata");
  assert.ok(n.source?.work&&n.source?.url,id+" lost source provenance");
  assert.ok(n.frenchTextStatus&&!/MISSING/i.test(n.frenchTextStatus),id+" has no declared French prayer-body provenance");

  const bodies=[];
  for(const key of ["repeatText","opening","churchPrayer","ejaculation","sharedClosingText"]){
    if(n[key])bodies.push([key,n[key]]);
  }
  n.days.forEach((d,i)=>{if(d.text)bodies.push([`days[${i}].text`,d.text]);});
  assert.ok(bodies.length>=1,id+" has no source prayer body");
  for(const [path,body] of bodies){
    bodyCount+=1;
    assert.equal(typeof body,"object",id+" "+path+" is not bilingual");
    assert.ok(String(body.en||"").trim().length>20,id+" "+path+" lost English source text");
    assert.ok(String(body.fr||"").trim().length>20,id+" "+path+" lost French prayer text");
    assert.notEqual(body.fr,body.en,id+" "+path+" French body silently equals English");
    assert.doesNotMatch(body.fr,/French source text is not yet source-locked|texte source français n’est pas encore verrouillé/i,id+" "+path+" retained placeholder French");
  }
}
assert.equal(bodyCount,91,"Frozen V4 corpus source-body unit count changed");

assert.match(NOVENA_CORPUS_V4.st_anthony_nine_tuesdays.history.en,/burial of St Anthony on the Tuesday following his death/);
assert.match(NOVENA_CORPUS_V4.st_anthony_nine_tuesdays.history.fr,/inhumation solennelle de saint Antoine le mardi/);
assert.ok(!/died on a Tuesday|mourut un mardi/.test(NOVENA_CORPUS_V4.st_anthony_nine_tuesdays.history.en+" "+NOVENA_CORPUS_V4.st_anthony_nine_tuesdays.history.fr));
assert.ok(NOVENA_CORPUS_V4.st_anthony_nine_tuesdays.historySources.some(x=>x.url==="https://www.messagerdesaintantoine.com/node/5972"));
assert.ok(NOVENA_CORPUS_V4.christ_the_king.historySources.some(x=>x.url==="https://www.spiritualite-chretienne.com/s_coeur/priere_a.html"));
assert.equal(NOVENA_CORPUS_V4.st_anthony_nine_tuesdays.calendar.type,"NINE_TUESDAYS_BEFORE_FIXED_FEAST");
assert.equal(NOVENA_CORPUS_V4.christ_the_king.calendar.type,"LAST_SUNDAY_RELATIVE");
assert.equal(NOVENA_CORPUS_V4.immaculate_heart.calendar.startDay,13);
assert.equal(NOVENA_CORPUS_V4.st_michael.calendar.startDay,20);
assert.match(NOVENA_CORPUS_V4.christ_the_king.frenchTextStatus,/SOURCE_LOCKED/);
assert.match(NOVENA_CORPUS_V4.st_michael.frenchTextStatus,/SOURCE_LOCKED/);
assert.match(NOVENA_CORPUS_V4.immaculate_heart.frenchTextStatus,/TRADITIONAL_FRENCH_WITNESS/);
assert.match(NOVENA_CORPUS_V4.st_anthony_nine_tuesdays.frenchTextStatus,/EDITORIAL_TRANSLATION/);

const canonicalData=readFileSync("src/pray/canonical-data.js","utf8");
for(const id of ["foundations_our_father","foundations_hail_mary","foundations_glory_be","litany_loreto_1962"]){
  const start=canonicalData.indexOf(`"id":"${id}"`);
  assert.ok(start>=0,id+" canonical prayer disappeared");
  const slice=canonicalData.slice(start,start+14000);
  const fr=slice.match(/"fr":"((?:\\.|[^"])*)"/);
  assert.ok(fr&&fr[1].length>40,id+" lost its French canonical prayer body");
}
const sot=JSON.parse(readFileSync("data/pray/novena-sot.v1.json","utf8"));
assert.equal(sot.version,"NOVENA_SOT_V1");
assert.equal(sot.status,"FROZEN");
assert.equal(sot.target_count,16);
assert.equal(sot.playable_count,16);
assert.equal(sot.french_body_parity,"16/16");
assert.equal(sot.source_holds,0);
assert.equal(sot.recovered_targets.st_anthony_nine_tuesdays.french_world_witness,"https://www.messagerdesaintantoine.com/node/5972");
assert.equal(sot.recovered_targets.st_anthony_nine_tuesdays.original_prayer_witness_date,1966);
assert.ok(sot.global_rules.some(x=>/TRADITIONAL_START or SUGGESTED_START/.test(x)),"SOT lost start-authority rule");
for(const row of sot.novenas){
  assert.equal(row.start_kind,traditionalStartIds.has(row.id)?"TRADITIONAL_START":"SUGGESTED_START",row.id+" SOT start_kind diverged");
}
assert.equal(sot.recovered_targets.christ_the_king.start_kind,"TRADITIONAL_START");
assert.equal(sot.recovered_targets.st_anthony_nine_tuesdays.start_kind,"SUGGESTED_START");
assert.equal(sot.recovered_targets.immaculate_heart.start_kind,"SUGGESTED_START");
assert.equal(sot.recovered_targets.st_michael.start_kind,"SUGGESTED_START");
assert.deepEqual(sot.novenas.map(x=>x.id),completeExpected,"NOVENA_SOT_V1 target order diverged from production corpus");
assert.ok(sot.novenas.every(x=>x.playable===true&&x.french_text_status&&!/MISSING/i.test(x.french_text_status)),"NOVENA_SOT_V1 lost playable/French parity");
assert.match(readFileSync("docs/NOVENA-SOT-V1.md","utf8"),/French parity means the \*\*actual prayer body\*\*/,"Novena freeze doc lost prayer-body French parity rule");
assert.match(readFileSync("docs/NOVENA-SOT-V1.md","utf8"),/A seventeenth novena is \*\*not\*\* appended casually/,"Novena freeze doc lost sixteen-target boundary");

const runtime=readFileSync("src/pray/novena-runtime.js","utf8");
const styles=readFileSync("src/pray/novena-styles.js","utf8");
const browser=readFileSync("src/pray/browser-entry.js","utf8");
const assets=readFileSync("src/assets/asset-registry.js","utf8");

assert.match(runtime,/44\.0-bilingual-novenas-v1/);
assert.doesNotMatch(runtime,/CURATED CORE · V4|NOYAU SÉLECTIONNÉ · V4|V4 is deliberately frozen|source-of-truth version|V4 · \$\{items\.length\}/,"Novenas leaked internal versioning/governance language into the UI");
assert.match(runtime,/TRADITIONAL NOVENAS/,"Novenas overview lost its user-facing collection label");
assert.match(runtime,/bilingual sourced novenas/,"Novenas overview lost sourced bilingual summary");
assert.match(runtime,/NOVENA_CORPUS_V4 as CORPUS/,"Novenas runtime is not consuming completed V4 corpus");
assert.match(runtime,/pray\.novenas/,"Novenas route is not registered");
assert.doesNotMatch(runtime,/function injectHome|aoN1InsertedSection|MutationObserver/,"Novenas regained DOM-based PRAY hub injection");
assert.match(runtime,/OPEN_OPTS\.returnFamily/,"Novenas no longer return to their owning PRAY family");
assert.match(runtime,/openFamily\?\.\(OPEN_OPTS\.returnFamily\)/,"Novenas family return is not delegated to the canonical PRAY owner");

assert.match(runtime,/data-n1-mode/,"Guided\/Simple control disappeared");
assert.match(runtime,/class="aoP435930Back" data-n1-back/,"Novena header lost donor Back control");
assert.match(runtime,/class="aoP435930Home" data-n1-home/,"Novena header lost explicit global Home control");
assert.doesNotMatch(runtime,/data-n1-close/,"Novena header regressed to ambiguous Close control");
// The live artwork is resolved through n1UiIcon(id), so the literal asset attribute
// is generated at render time rather than embedded verbatim in head().
assert.match(runtime,/resolveCanonicalAssetUrl\(id\)/,"Novena header lost canonical asset resolution");
assert.match(runtime,/n1UiIcon\('ao-ui-back'\)/,"Novena header lost canonical Back utility artwork");
assert.match(runtime,/n1UiIcon\('ao-nav-home'\)/,"Novena header lost canonical Home utility artwork");
assert.match(runtime,/function goHome\(\)/,"Novena global Home action is missing");
assert.match(runtime,/if\(N\.screen===\'day\'\).*N\.screen=\'detail\'/,"Novena Back no longer returns Day to Novena detail");
assert.match(runtime,/if\(N\.screen===\'detail\'\).*N\.screen=\'overview\'/,"Novena Back no longer returns detail to Novena overview");
assert.match(runtime,/noCompletionTracking:true/,"Novenas privacy rule for completion tracking changed");
assert.match(runtime,/noIntentStorage:true/,"Novenas privacy rule for intentions changed");
assert.match(runtime,/TRADUCTION FRANÇAISE · ALIGNÉE SUR LA SOURCE/,"French editorial translation provenance label disappeared");
assert.match(runtime,/TEXTE FRANÇAIS TRADITIONNEL/,"Traditional French witness label disappeared");
assert.match(runtime,/Revenir au français/,"French\/English prayer witness toggle lost return path");
assert.match(runtime,/calendarStatus/,"calendar-aware Novena status disappeared");
assert.match(runtime,/Traditional start/,"Novena detail lost Traditional start label");
assert.match(runtime,/Suggested start/,"Novena detail lost Suggested start label");
assert.match(runtime,/NOVENA_START_KIND/,"Novena runtime stopped consuming start authority metadata");
assert.match(runtime,/novenaStatusFor/,"Novenas stopped consuming shared Calendar intelligence date semantics");
assert.doesNotMatch(runtime,/function easter\(/,"Novenas reintroduced a private Easter calculator");
assert.doesNotMatch(runtime,/function windowFor\(/,"Novenas reintroduced private novena date-window logic");
assert.match(runtime,/canonicalReuse:\{ourFather:true,hailMary:true,gloryBe:true,loreto1962:true\}/,"canonical prayer reuse contract changed");
assert.match(styles,/aoN1Hero/);
assert.match(styles,/aoN1StageRail/);
assert.match(browser,/await import\("\.\/novena-runtime\.js"\)/,"PRAY browser owner must load canonical Novenas on first Prayer entry");
assert.doesNotMatch(browser,/^import "\.\/novena-runtime\.js";/m,"Novenas should not load during Home startup");
assert.match(assets,/"pray\.novenas"\s*:\s*"ao-rich-novenas"/,"Novenas lost canonical V4 asset identity");

console.log("PASS complete 16-target bilingual Novenas corpus with French prayer-body parity");

// Prayer-stage copy should address the person praying, not describe app telemetry.
assert.doesNotMatch(runtime,/Ad Orientem|devotional streak|completion score/i,"Novena reader reverted to self-referential interface narration");
assert.match(runtime,/Choose a novena/);
assert.match(runtime,/Choisissez une neuvaine/);


// The V3 source prayers are immutable, but inherited English-only day headings
// and guide labels must not leak into V4's French devotional screen.
assert.match(NOVENA_FRENCH_GUIDE_PARITY_STATUS,/EDITORIAL_TRANSLATIONS/);
const overlayIds=Object.keys(NOVENA_FRENCH_GUIDE_PARITY_V1);
assert.deepEqual(overlayIds,["christmas","corpus_christi","annunciation","assumption","seven_sorrows"]);
let translatedTitles=0,translatedGuides=0;
for(const [id,original] of Object.entries(NOVENA_CORPUS_V3)){
 const live=NOVENA_CORPUS_V4[id];
 assert.ok(live,"Historical novena lost in V4: "+id);
 for(let i=0;i<9;i++){
  const before=original.days[i],after=live.days[i],overlay=NOVENA_FRENCH_GUIDE_PARITY_V1[id]?.[i];
  // Only the French editorial guide fields may be corrected in this batch.
  assert.equal(after.theme.en,before.theme.en,id+" "+i+" English heading changed");
  assert.equal(after.guide.en,before.guide.en,id+" "+i+" English guide changed");
  if(overlay?.theme){
   translatedTitles++;
   assert.equal(after.theme.fr,overlay.theme);
   assert.notEqual(after.theme.fr,before.theme.en,"English title leaked into French: "+id+" day "+(i+1));
  }else assert.equal(after.theme.fr,before.theme.fr,"Unintended French title edit: "+id+" day "+(i+1));
  if(overlay?.guide){
   translatedGuides++;
   assert.equal(after.guide.fr,overlay.guide);
   assert.notEqual(after.guide.fr,before.guide.en,"English guide leaked into French: "+id+" day "+(i+1));
  }else assert.equal(after.guide.fr,before.guide.fr,"Unintended French guide edit: "+id+" day "+(i+1));
  // None of the text-owner body/translation fields may be modified.
  assert.equal(after.text?.en||"",before.text||"","Historical prayer changed: "+id+" day "+(i+1));
 }
}
assert.equal(translatedTitles,45,"All 45 genuinely untranslated heading instances must be covered");
assert.equal(translatedGuides,27,"All 27 untranslated Marian guide sentences must be covered");
assert.equal(NOVENA_CORPUS_V4.sacred_heart.days[0].theme.fr,"Adoration","Identical and valid French words must not be spuriously changed");

// Original-text primary links must actually be presented to the faithful.
// Secondary historical links alone do not establish a witness to the prayer.
const litSource=readFileSync("src/pray/novena-runtime.js","utf8");
assert.match(litSource,/class="aoN1SourcePrimary"/,"Novenas primary citation must be rendered as clickable link");
assert.match(litSource,/href="\$\{esc\(url\)\}"/,"Actual source URL is not wired to clickable href");
assert.match(litSource,/novenaSourceAccess\(n\.id\)/,"Novena source drawer no longer resolves editorial section identity");
assert.match(litSource,/rel="noopener noreferrer"/,"External novena witness lacks safe rel");
assert.equal(Object.keys(NOVENA_SOURCE_ACCESS_V1).length,10);
for(const [id,section] of Object.entries(NOVENA_SOURCE_ACCESS_V1)){
 assert.ok(NOVENA_CORPUS_V4[id]?.source?.url,"Unknown source identity "+id);
 assert.ok(section.heading.en.length>10&&section.heading.fr.length>10,id+" source section must be bilingual");
 assert.ok(section.note.en.length>45&&section.note.fr.length>45,id+" witness limitation not adequately disclosed");
 assert.equal(novenaSourceAccess(id),section);
}
assert.equal(novenaSourceAccess("sacred_heart"),null,"Do not make up an edition qualifier without evidence");

const anthony=NOVENA_CORPUS_V4.st_anthony_nine_tuesdays;
assert.deepEqual(anthony.commonPrayers,[["foundations_our_father",1],["foundations_hail_mary",1],["foundations_glory_be",1]],
 "Franciscan 1966 witness prescribes the traditional three prayers after the novena invocation");
assert.equal(anthony.closingCanonical,"devotion_st_anthony_lost_items",
 "The customary Si quaeris responsory must reuse its canonical three-language Prayer owner");
assert.match(anthony.commonNote.en,/no single.*obligatory/i,
 "Nine Tuesdays customary prayers must not be presented as universal obligation");
assert.match(anthony.commonNote.fr,/n.*obligatoire/i,
 "French Nine Tuesdays rubric must distinguish a proposed custom from requirement");
assert.match(litSource,/n\.closingCanonical\?canonicalPrayer\(n\.closingCanonical,1\)/,
 "Both guided and simple Novenas must render the source's canonical closing responsory");
assert.equal(NOVENA_CORPUS_V4.perpetual_help.source.url,"https://en.wikisource.org/wiki/Page:Withgodbookofpra00las.djvu/699",
 "Retain actual unproofread scan witness rather than inventing a certified edition");


// The 1925 prayer book prints Christmas and Pentecost as distinct sections;
// the 1883 Moran prayer book prints St Joseph's nine day-specific prayers.
// Textual correspondence to their digitizations is not a printed facsimile
// collation and does not certify editorial French translations.
const historicalNovenaReview=JSON.parse(readFileSync("data/pray/novena-source-review.v2.json","utf8"));

const latestNovenaReview=JSON.parse(readFileSync("data/pray/novena-source-review.v3.json","utf8"));
assert.equal(latestNovenaReview.schema,"ao.prayer.novena-source-review.v3");
assert.equal(latestNovenaReview.records.length,16);
assert.equal(latestNovenaReview.counts.sourceDayBodyReviews,72);
assert.equal(latestNovenaReview.counts.uniqueDayPrayerBodies,72);
assert.equal(latestNovenaReview.counts.sourceDayBodyReviewsThisPass,36);
assert.equal(latestNovenaReview.counts.repeatFormAnchorReviewsThisPass,2);
assert.equal(latestNovenaReview.counts.fullEnglishDigitalLineByLineCertificates,0);
assert.equal(latestNovenaReview.counts.completePrintEditionCertificates,0);
assert.equal(latestNovenaReview.counts.independentOriginalFrenchPrintCertificates,0);
assert.equal(latestNovenaReview.counts.omittedHammerMeditationPracticeDayPairs,27);

const latestSourceReviews=Object.fromEntries(latestNovenaReview.records.map(x=>[x.id,x]));
let verifiedDigitalAnchors=0;
for(const id of ["christmas","holy_ghost","st_joseph","holy_souls","immaculate_conception","annunciation","seven_sorrows","assumption"]){
 const record=latestSourceReviews[id],live=NOVENA_CORPUS_V4[id];
 assert.equal(record.dayBodySourceReview.length,9,id+" must have nine original-language review entries");
 for(let i=0;i<9;i++){
  const a=record.dayBodySourceReview[i],text=live.days[i].text.en;
  assert.equal(a.day,i+1);
  assert.ok(text.startsWith(a.sourceIncipit),id+" day "+(i+1)+" original-text opening drifted");
  assert.ok(text.endsWith(a.sourceExplicit),id+" day "+(i+1)+" original-text ending drifted");
  assert.match(a.completePrintEditionCertification,/NOT_CERTIFIED/);
  assert.ok(a.sourceUrl||record.url);
  verifiedDigitalAnchors++;
 }
}
assert.equal(verifiedDigitalAnchors,72);
assert.equal(Object.keys(HAMMER_DAY_SECTIONS_V1).length,3);
assert.equal(HAMMER_DAY_SOURCE_URL_V1,"https://www.gutenberg.org/files/33671/33671-h/33671-h.htm");
for(const id of ["annunciation","seven_sorrows","assumption"]){
 const historical=latestSourceReviews[id].omittedHistoricalMaterial.originalDaySections;
 assert.equal(historical.length,9);
 assert.equal(HAMMER_DAY_SECTIONS_V1[id].length,9);
 for(let i=0;i<9;i++){
  const witness=hammerHistoricalDayWitness(id,i+1);
  assert.equal(witness.title,historical[i].originalEnglishTitle,id+" original day "+(i+1)+" title drifted");
  assert.equal(witness.url,historical[i].originalUrl);
  assert.equal(witness.day,i+1);
  assert.equal(witness.language,"en");
  assert.equal(witness.meditation,"PRESENT_IN_ORIGINAL_NOT_EMBEDDED");
  assert.equal(witness.practice,"PRESENT_IN_ORIGINAL_NOT_EMBEDDED");
 }
}

let completeHistoricalPairs=0;
for(const id of ["annunciation","seven_sorrows","assumption"]){
 for(let day=1;day<=9;day++){
  const row=hammerHistoricalDayText(id,day),w=hammerHistoricalDayWitness(id,day);
  assert.equal(row.day,day);
  assert.equal(row.heading.toLowerCase().replace(/[^a-z]/g,""),w.title.toLowerCase().replace(/[^a-z]/g,""),id+" day heading mismatch");
  assert.ok(row.meditation.length>=400,id+" day "+day+" meditation appears truncated");
  assert.ok(row.practice.length>=350,id+" day "+day+" practice appears truncated");
  assert.equal(row.language,"en");
  assert.equal(row.originalUrl,w.url);
  assert.ok(!/PRAYER OF THE CHURCH|Litany of Loreto/i.test(row.meditation+" "+row.practice),id+" day source boundary spill");
  completeHistoricalPairs++;
 }
}
assert.equal(completeHistoricalPairs,27);
assert.equal(HAMMER_HISTORICAL_1909_V1.source.originalPrintFacsimileCollated,false);
assert.equal(hammerHistoricalDayText("immaculate_conception",1),null);
const runtimeWithMeditations=readFileSync("src/pray/novena-runtime.js","utf8");
assert.match(runtimeWithMeditations,/import \{ hammerHistoricalDayText \}/);
assert.match(runtimeWithMeditations,/nl\(historical\.meditation\)/);
assert.match(runtimeWithMeditations,/nl\(historical\.practice\)/);
assert.match(runtimeWithMeditations,/lang="en"/);

assert.equal(hammerHistoricalDayWitness("holy_souls",1),null);
assert.equal(hammerHistoricalDayWitness("annunciation",10),null);
for(const id of ["corpus_christi","sacred_heart"]){
 const row=latestSourceReviews[id].repeatBodySourceReview,body=NOVENA_CORPUS_V4[id].repeatText.en;
 assert.ok(body.startsWith(row.sourceIncipit));
 assert.ok(body.endsWith(row.sourceExplicit));
 assert.equal(row.directPrintedFacsimileComparison,"PENDING");
}
const latestRuntime=readFileSync("src/pray/novena-runtime.js","utf8");
assert.match(latestRuntime,/function hammerSourceDayDetails\(n\)/,"Missing discreet per-day original-source expander");
assert.match(latestRuntime,/data-n1-hammer-source-day/);
assert.match(latestRuntime,/sourceWitness\(daySource\(n,d\),L\('Proper prayer of the day','Prière propre du jour'\)\)\+hammerSourceDayDetails\(n\)/,"Guided Hammer day must offer the full original meditation and practice");
assert.match(latestRuntime,/\$\{hammerSourceDayDetails\(n\)\}\$\{hammerTailStage\(n\)\}/,"Simple Hammer day must offer the original meditations and practices");
assert.match(latestRuntime,/target="_blank" rel="noopener noreferrer"/,"Historical source access lost secure external link");

assert.equal(historicalNovenaReview.records.length,16);
assert.equal(historicalNovenaReview.counts.sourceDayBodyReviews,36,"Historical text review must include nine Holy Souls day-prayers");
assert.equal(historicalNovenaReview.counts.frenchEditorialTranslationReviews,27,"Uncompared editorial French meanings must not count as reviewed");
const souls=NOVENA_CORPUS_V4.holy_souls;
assert.equal(souls.days.length,9);
assert.equal(souls.commonPrayers[0][0],"foundations_our_father");
assert.equal(souls.commonPrayers[1][0],"foundations_hail_mary");
assert.ok(souls.sharedClosingText.en.startsWith("On Thy spouses have compassion,\n"),"Daily Holy Souls verse lost");
assert.ok(souls.sharedClosingText.en.includes("On these suffering children Thine;"));
assert.ok(souls.sharedClosingText.en.indexOf("On Thy spouses")<souls.sharedClosingText.en.indexOf("O most sweet Jesus"),"The hymn must precede the historical intercessions");
assert.ok(souls.sharedClosingText.fr.startsWith("Ayez pitié de vos épouses,\n"),"Editorial French daily verse missing");
assert.match(souls.source.status,/MODERN_DIGITAL_TRANSCRIPTION.*PRINT_EDITION_NOT_COLLATED/,"Do not claim a modern reproduction is the printed original");
assert.match(NOVENA_SOURCE_ACCESS_V1.holy_souls.note.en,/prayer108.*prayer116/);
assert.match(NOVENA_SOURCE_ACCESS_V1.immaculate_conception.note.en,/Litany.*OR.*Tota pulchra/);
assert.equal(historicalNovenaReview.records.find(x=>x.id==="holy_souls").dayBodySourceReview.length,9);
assert.match(readFileSync("src/pray/novena-runtime.js","utf8"),/Moran directs the Litany of Loreto or the Tota pulchra hymn/);
assert.match(litSource,/const prayerStage=p==='OPENING_DAY_COMMON_CLOSE'\?3:1;/,
 "Guided Immaculate Conception day prayer must follow common Hail Marys and Glory Be");
assert.match(litSource,/const commonStage=2;/,
 "Guided Immaculate Conception canonical prayers must precede the day prayer");
assert.match(litSource,/sourceWitness\(n\.opening,L\('Common opening','Ouverture commune'\)\)\+commonPrayers\(n\)/,
 "Simple Immaculate Conception must show the canonical prayers immediately after the opening");
assert.match(litSource,/p==='OPENING_DAY_COMMON_CLOSE'\?'':commonPrayers\(n\)/,
 "Simple Immaculate Conception must not repeat the nine Hail Marys after the day prayer");
assert.deepEqual(NOVENA_CORPUS_V4.immaculate_conception.commonPrayers,
 [["foundations_hail_mary",9],["foundations_glory_be",1]],
 "The 1883 nine Aves and single Gloria sequence changed");


assert.equal(historicalNovenaReview.counts.daySpecificNovenas,8);
assert.equal(historicalNovenaReview.counts.uniqueDayPrayerBodies,72);
assert.equal(historicalNovenaReview.counts.sourceDayBodyReviews,36);
assert.equal(historicalNovenaReview.counts.frenchEditorialTranslationReviews,27);
assert.equal(historicalNovenaReview.counts.completePrintEditionCertificates,0);
assert.equal(historicalNovenaReview.counts.omittedHammerMeditationPracticeDayPairs,27);
assert.equal(historicalNovenaReview.counts.namedOriginalHistoricalMeditationSections,27);
assert.match(historicalNovenaReview.reviewLimit,/not yet certified against printed facsimiles/i);
const reviews=Object.fromEntries(historicalNovenaReview.records.map(x=>[x.id,x]));
for(const id of ["christmas","holy_ghost","st_joseph"]){
 const historical=reviews[id],current=NOVENA_CORPUS_V4[id];
 assert.equal(historical.dayBodySourceReview.length,9);
 assert.equal(current.days.length,9);
 for(let i=0;i<9;i++){
  const row=historical.dayBodySourceReview[i],text=current.days[i].text.en;
  assert.equal(row.day,i+1);
  assert.ok(row.sourceIncipit.length>=25 && row.sourceExplicit.length>=30);
  assert.ok(text.startsWith(row.sourceIncipit),id+" day "+(i+1)+" lost historically compared opening");
  assert.ok(text.endsWith(row.sourceExplicit),id+" day "+(i+1)+" lost historically compared ending");
  assert.match(row.enTextComparison,/NORMALIZED_CAPITALIZATION_AND_PUNCTUATION/);
  assert.match(row.frTextComparison,/EDITORIAL_TRANSLATION/);
  assert.equal(row.completePrintEditionCertification,"NOT_CERTIFIED");
  assert.equal(typeof current.days[i].text.fr,"string");
  assert.ok(current.days[i].text.fr.length>30);
 }
 assert.deepEqual(current.commonPrayers,id==="st_joseph"?[["foundations_our_father",3],["foundations_hail_mary",3]]:[["foundations_our_father",1],["foundations_hail_mary",1],["foundations_glory_be",1]],id+" lost common prayers as printed");
}
assert.match(historicalNovenaReview.records.find(x=>x.id==="st_joseph").dayBodySourceReview[6].witnessTranscriptionIssue,/as 1 ought/);
const missingHistorical=["annunciation","seven_sorrows","assumption"];
for(const id of missingHistorical){
 const g=reviews[id].omittedHistoricalMaterial;
 assert.equal(g.status,"27_HISTORICAL_MEDITATIONS_AND_PRACTICES_NOT_REPRODUCED");
 assert.deepEqual(g.missingPerDay,["full MEDITATION prose","full PRACTICE/resolution prose"]);
 assert.equal(NOVENA_CORPUS_V4[id].days.length,9);
 assert.equal(g.originalDaySections.length,9,"The complete historical daily section heading inventory is missing: "+id);
 for(let i=0;i<9;i++){
  assert.equal(g.originalDaySections[i].day,i+1);
  assert.ok(g.originalDaySections[i].originalEnglishTitle.length>10);
  assert.match(g.originalDaySections[i].originalUrl,/gutenberg\.org/);
  assert.equal(g.originalDaySections[i].historicalMeditationStatus,"PRESENT_IN_1909_SOURCE_NOT_REPRODUCED_IN_APP");
  assert.equal(g.originalDaySections[i].historicalPracticeStatus,"PRESENT_IN_1909_SOURCE_NOT_REPRODUCED_IN_APP");
 }
 const source=novenaSourceAccess(id);
 assert.match(source.note.en,/MEDITATION and PRACTICE/);
 assert.match(source.note.fr,/MÉDITATIONS? et (une )?PRATIQUES?/);
 assert.match(source.note.en,/editorial/);
 assert.match(source.note.fr,/rédactionnel/);
}
assert.ok(!historicalNovenaReview.records.some(x=>x.dayBodySourceReview?.some(d=>d.completePrintEditionCertification!=="NOT_CERTIFIED")),"Premature original facsimile certification");
