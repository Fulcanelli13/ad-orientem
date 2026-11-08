/**
 * 2013 Coalition in Support of Ecclesia Dei booklet:
 * section-by-section accountability, NOT a claim of exhaustive text collation.
 * The Mass Ordinary's separate 256-cue baseline remains authoritative.
 */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PRAY_CANONICAL_DATA_V435930 as DATA} from "../src/pray/canonical-data.js";
import {COMMUNION_TREASURY_V383} from "../src/pray/traditional-pray-data.js";
import {prayerAcquisitionCandidates} from "../src/pray/prayer-acquisition-historical-witnesses.v1.js";
import {RED_BOOKLET_COMMUNION_LIBRARY_LINKS_V1,redBookletCommunionLibraryLinksForSubject,redBookletCommunionLibraryLink} from "../src/pray/red-booklet-communion-library-links.v1.js";
import {RED_BOOKLET_SUSCIPE_LIBRARY_LINK_V1,redBookletSuscipeLibraryLinksForSubject} from "../src/pray/red-booklet-suscipe-library-link.v1.js";
import {personalDailyDirectPlan,defaultPersonalDailyPrefs} from "../src/pray/daily-personal-rule.js";
import {RED_BOOKLET_PRIVATE_HISTORICAL_WORKS_V1,redBookletPrivateHistoricalWork,
 redBookletPrivateHistoricalSource,redBookletPrivateHistoricalWorksForSubject} from "../src/pray/red-booklet-private-historical-works.v1.js";
import {RED_BOOKLET_2013_VARIANT_WITNESSES_V1 as BOOKLET_VARIANTS} from "../src/pray/red-booklet-2013-variant-witnesses.v1.js";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const registry=JSON.parse(read("data/pray/red-booklet-2013-completeness.v1.json"));
const mass=JSON.parse(read("data/research/mass-ordo-red-missal-2013-editorial.v1.json"));
assert.equal(registry.schema,"ao.pray.red-booklet-2013-completeness.v1");
assert.equal(registry.source.pdfPages,71);
assert.equal(registry.source.printedPageToPdfPageOffset,1);
assert.equal(registry.works.length,37,"Booklet private prayer inventory unexpectedly changed without source-page accounting");
assert.equal(new Set(registry.works.map(x=>x.id)).size,registry.works.length);
assert.equal(mass.canonicalCuesExpected,256,"Existing 2013 Red Missal Mass baseline must not regress");
assert.equal(mass.approvedCues.length,32);
assert.equal((mass.reviewedWithoutTextChange||[]).length,209);
assert.equal((mass.ceremonialOutOfEnglishScope||[]).length,15);
assert.ok(!registry.works.some(x=>["mass_canon","mass_proper","mass_confiteor"].includes(x.id)),"Mass forms belong to existing 1962 source owner, not a second devotional corpus");
const byStatus={reader_present:[],variant_requires_comparison:[],unresolved:[]};
const collatedShortForms=new Set(["conf_angel","communion_heart_aspirations"]);
const indexedCommunion=new Set(["pre_thomas","pre_ambrose","communion_thanks","communion_heart","holy_spirit_augustine","our_lady_65","communion_dying","communion_heart_intercession","communion_thomas","communion_bonaventure","crucifix"]);
const indexedAll=new Set([...indexedCommunion,"ignatius_suscipe",...RED_BOOKLET_PRIVATE_HISTORICAL_WORKS_V1.map(x=>x.id)]);
const requiredGroups=["before_mass","before_communion","after_low_mass","benediction","confession","after_communion","devotional","marian"];
for(const w of registry.works){
 assert.equal(w.pdfPage,w.printedPage+1,"Wrong PDF page reference "+w.id);
 assert.ok(w.pdfPage>=4&&w.pdfPage<=68,"Outside booklet scanned text "+w.id);
 assert.ok(requiredGroups.includes(w.section),"Unknown booklet group "+w.id);
 assert.ok(w.title.length>5);
 assert.equal(w.wordingCollatedAgainst2013,collatedShortForms.has(w.id),"Only two printed short source faces have exact 2013 edition evidence: "+w.id);
 assert.equal(w.discoverableAsIndividualLibraryWork,indexedAll.has(w.id),"Only exact, clickable source-owner links may claim Library discoverability: "+w.id);
 if(indexedAll.has(w.id)){
  assert.equal(w.discoverabilityProof?.sourceId,w.owner?.symbol,"Library must lead to the original text identity: "+w.id);
  assert.equal(w.discoverabilityProof?.route,w.owner.route);
 }
 assert.ok(Object.hasOwn(byStatus,w.status),"Unknown status "+w.id);
 byStatus[w.status].push(w.id);
 if(w.owner){
  assert.notEqual(w.status,"unresolved","An unresolved work must not masquerade as an identified reader "+w.id);
  const source=read(w.owner.path);
  assert.ok(source.includes(w.owner.symbol),"Reader owner cannot be located: "+w.id+" / "+w.owner.symbol);
  assert.match(w.owner.route,/^(pray|mass)\./);
  if(w.owner.path.endsWith("canonical-data.js"))assert.ok(DATA.prayers[w.owner.symbol],"Canonical record missing for "+w.id);
  if(w.owner.path.endsWith("traditional-pray-data.js"))assert.ok(COMMUNION_TREASURY_V383[w.owner.symbol],"Communion source key missing for "+w.id);
 }else assert.equal(w.status,"unresolved","Non-published or variant entry requires an exact owner before any published claim "+w.id);
}
assert.deepEqual(Object.fromEntries(Object.entries(byStatus).map(([k,v])=>[k,v.length])),{
 reader_present:36,variant_requires_comparison:1,unresolved:0
});
for(const required of ["pre_thomas","pre_ambrose","communion_thanks","communion_heart","holy_spirit_augustine","our_lady_65","communion_dying","communion_heart_intercession","communion_thomas","communion_bonaventure","crucifix","ben_tantum","ben_praises","leonine","angelus","regina","rosary","ignatius_suscipe","before_mass","conf_exam_prayer","conf_thanksgiving","conf_joseph"])assert.ok(byStatus.reader_present.includes(required),required);
assert.deepEqual(byStatus.unresolved,[],"No source-owner gaps remain; one Rosary bead variant stays held");
assert.deepEqual(byStatus.variant_requires_comparison,["fatima"],"Do not silently certify the existing Rosary bead text without an exact player comparison");
// User-supplied 2013 Red Booklet: the page 59 Guardian Angel prayer is a
// short private Confession invocation, NOT the full canonical Angele Dei.
const angel=BOOKLET_VARIANTS.guardianAngelConfession;
assert.equal(angel.english,"My Guardian Angel, help me to make a good confession.");
assert.equal(angel.printedPage,59);
assert.equal(DATA.prayers.foundations_guardian_angel.en.startsWith("Angel of God"),true,
 "Canonical Guardian Angel prayer must not be overwritten");
const aspirations=BOOKLET_VARIANTS.heartAspirations;
assert.equal(aspirations.printedPage,64);
assert.deepEqual(aspirations.englishLines,[
 "Heart of Jesus, burning with love for us, set our hearts on fire with love of Thee.",
 "Heart of Jesus, I put my trust in Thee.",
 "Sweet Heart of Jesus, grant that I may love Thee more and more."
]);
assert.ok(DATA.prayers.sacred_heart_aspiration_trust.en.startsWith("Most Sacred Heart"),
 "Original independent Sacred Heart trust prayer must remain untouched");
const fatima=BOOKLET_VARIANTS.fatimaDecade;
assert.equal(fatima.printedPage,67);
assert.match(fatima.english,/forgive us our sins[.] Save us from the fires of hell[.]/);
assert.equal(fatima.donorWordingCertified,false,"Fatima's optional original Rosary donor cannot be silently declared collated");
for(const id of collatedShortForms){
 const w=registry.works.find(x=>x.id===id);
 assert.equal(w.bookletPageReviewed,true);
 assert.equal(w.sourceWitness.wordingCollatedAgainst2013,true);
 assert.equal(w.relatedOriginalCanonicalPrayer.replaced,false);
}
assert.equal(registry.works.find(w=>w.id==="fatima").sourceVariantComparator.donorTextNotYetCompared,true);

const ignatius=registry.works.find(w=>w.id==="ignatius_suscipe");
assert.equal(ignatius.owner.route,"pray.morning_evening");
assert.ok(prayerAcquisitionCandidates("self_offering",{language:"en"}).some(x=>x.id==="ignatius_suscipe_lasance_1908_en"),"Existing EN Suscipe source prayer must remain available");
assert.ok(prayerAcquisitionCandidates("self_offering",{language:"la"}).some(x=>x.id==="ignatius_suscipe_lasance_1908_la"),"Existing Latin Suscipe source prayer must remain available");
assert.equal(prayerAcquisitionCandidates("self_offering",{language:"fr"}).length,0,"Do not invent French Ignatius Suscipe");
assert.equal(RED_BOOKLET_COMMUNION_LIBRARY_LINKS_V1.length,11);
assert.deepEqual(new Set(RED_BOOKLET_COMMUNION_LIBRARY_LINKS_V1.map(x=>x.id)),indexedCommunion);
assert.equal(redBookletCommunionLibraryLinksForSubject("III").length,11,"The Eucharistic subject must list all eleven private Communion prayers");
assert.equal(redBookletCommunionLibraryLinksForSubject("all").length,0,"Unfiltered All must not overwhelm canonical Library");
assert.equal(redBookletCommunionLibraryLinksForSubject("all","Bonaventure").length,1);
assert.equal(redBookletCommunionLibraryLinksForSubject("IX","Bonaventure").length,0);
assert.equal(redBookletCommunionLibraryLink("bogus"),null,"No guess-based prayer redirects");
for(const link of RED_BOOKLET_COMMUNION_LIBRARY_LINKS_V1){
 const source=COMMUNION_TREASURY_V383[link.sourceId];
 const work=registry.works.find(x=>x.id===link.id);
 assert.equal(link.sourceId,work.owner.symbol);
 assert.equal(link.printedPage,work.printedPage);
 assert.equal(link.route,work.owner.route);
 assert.equal(link.wordingCollatedAgainst2013,false);
 assert.equal(link.en,source.title);
 assert.equal(link.fr,source.titleFr);
 assert.deepEqual(link.languages,["en","fr","la"].filter(k=>!!source[k]));
 if(["communion_thanks","communion_heart","holy_spirit_augustine","our_lady_65","communion_dying","communion_heart_intercession"].includes(link.id)){
  assert.deepEqual(link.languages,["en"],"Do not invent French or Latin witnesses for new prayers");
  assert.equal(source.wordingCollatedAgainst2013,false);
  assert.equal(registry.works.find(w=>w.id===link.id).sourceWitness.edition,source.sourceYear);
 }
 assert.ok(link.languages.includes("en"),"Source-owned English prayer absent: "+link.id);
}
const suscipe=RED_BOOKLET_SUSCIPE_LIBRARY_LINK_V1;
assert.equal(suscipe.id,"ignatius_suscipe");
assert.equal(suscipe.printedPage,ignatius.printedPage);
assert.equal(suscipe.route,ignatius.owner.route);
assert.equal(suscipe.sourceIds.en,ignatius.owner.symbol);
assert.deepEqual(suscipe.languages,["en","la"]);
assert.equal(suscipe.wordingCollatedAgainst2013,false);
assert.equal(redBookletSuscipeLibraryLinksForSubject("III").length,1);
assert.equal(redBookletSuscipeLibraryLinksForSubject("all").length,0);
assert.equal(redBookletSuscipeLibraryLinksForSubject("all","Suscipe").length,1);
assert.equal(redBookletSuscipeLibraryLinksForSubject("IV","Suscipe").length,0);
for(const lang of suscipe.languages){
 const source=prayerAcquisitionCandidates("self_offering",{language:lang}).find(x=>x.id===suscipe.sourceIds[lang]);
 assert.ok(source&&source.release.exact_print_verified&&source.release.allowed_in_prayer_hub);
 assert.equal(source.source.page,"227");
 const prefs={...defaultPersonalDailyPrefs(lang),language:lang};
 const direct=personalDailyDirectPlan({daypart:"morning",prefs,sourceId:source.id});
 assert.equal(direct?.rows?.[0]?.text,source.text,"Link must select the exact source-owned complete text");
 assert.equal(direct?.rows?.[0]?.language,lang);
}
assert.equal(personalDailyDirectPlan({daypart:"evening",prefs:defaultPersonalDailyPrefs("en"),sourceId:suscipe.sourceIds.en}),null);
assert.equal(RED_BOOKLET_PRIVATE_HISTORICAL_WORKS_V1.length,4);
assert.equal(redBookletPrivateHistoricalWorksForSubject("all").length,0);
assert.equal(redBookletPrivateHistoricalWorksForSubject("III").length,1);
assert.equal(redBookletPrivateHistoricalWorksForSubject("I").length,2);
assert.equal(redBookletPrivateHistoricalWorksForSubject("VI").length,1);
assert.equal(redBookletPrivateHistoricalWorksForSubject("all","confession").length,1);
assert.equal(redBookletPrivateHistoricalWork("missing"),null);
assert.equal(redBookletPrivateHistoricalSource("missing"),null);
for(const source of RED_BOOKLET_PRIVATE_HISTORICAL_WORKS_V1){
 const row=registry.works.find(x=>x.id===source.id);
 assert.equal(row.owner.symbol,source.sourceId);
 assert.equal(row.owner.route,source.route);
 assert.equal(row.printedPage,source.printedPage);
 assert.equal(row.wordingCollatedAgainst2013,false);
 assert.equal(source.wordingCollatedAgainst2013,false);
 assert.deepEqual(source.languages,["en"]);
 assert.ok(source.text.length>100,"All four added historical prayer bodies must be complete "+source.id);
 assert.match(source.sourceUrl,/^https:\/\//);
 assert.equal(row.sourceWitness?.sourceUrl,source.sourceUrl);
}
const ui=read("src/pray/presentation-runtime.js"),treasury=read("src/pray/traditional-pray-runtime.js");
assert.match(ui,/data-p435930-red-historical/,"Library must expose source-backed Before Mass and Confession prayers");
assert.match(ui,/data-ao-booklet-guardian-confession/,"Confession stage zero must offer the short optional Guardian Angel form");
assert.match(ui,/BOOKLET_VARIANTS\.guardianAngelConfession\.english/,"Confession must display the source-owned short invocation, not Angele Dei");
assert.match(treasury,/data-ao-booklet-sacred-heart-aspirations/,"After Communion must present optional distinct aspirations");
assert.match(treasury,/BOOKLET_VARIANTS\.heartAspirations\.englishLines\.map/,"All three independent aspirations must be shown");
assert.match(treasury,/\$\{tabs\}\$\{direct\}\$\{card\}\$\{bookletAspirations\}\$\{options\}/,"Short aspirations are supplemental, not extra Communion cards");
assert.match(treasury,/MASS_THANKSGIVING_SOURCE_IDS/,"The fixed four-card After Mass folio remains independent");
assert.match(ui,/redBookletPrivateHistoricalWorksForSubject\(LIB.subject,q\)/,"Historical private prayer search must work");
assert.match(ui,/CONF\.historicalPrayer=work\.sourceId/,"Confession Library link must preserve and select the exact source ID in-place");
assert.match(ui,/CONF\.returnPrayerSnapshot=receipt/,"Confession Library deep link must retain return context");
assert.match(ui,/CONF\.stage===2&&CONF\.path&&!CONF\.historicalPrayer&&confessionRiteCards\(CONF\.path\)/,
 "Standalone historical Confession prayers must not invoke the sacramental rite side rail without a selected path");
assert.match(ui,/massPrayer:work.sourceId/,"Before Mass Library link must preserve the exact source ID");
assert.match(ui,/data-p435930-conf-historical-back/,"Confession must keep historical prayer distinct from sacramental flow");
assert.match(ui,/data-ao-confession-source-language-fallback/,"No unverified French translation");
assert.match(treasury,/opts.massPrayer!==undefined/,"Before Mass original source deep links must be validated");
assert.match(treasury,/massFourEndsDeclaration1904/,"Before Mass source must be in complete traditional folio");
assert.match(ui,/data-p435930-red-communion/,"Library list must expose source-owned links");
assert.match(ui,/redBookletCommunionLibraryLinksForSubject\(LIB.subject,q\)/,"Library search must include indexed Communion prayers");
assert.match(ui,/communionPrayer:work.sourceId/,"Library must hand off the exact source ID");
assert.match(ui,/redBookletCommunionLibraryLinksForSubject\(subject.id\).length/,"Eucharistic subject count must include Communion links");
assert.match(ui,/redBookletSuscipeLibraryLinksForSubject\(LIB.subject,q\)/,"Source-only Suscipe must be searchable");
assert.match(ui,/dailySourcePrayer:work.sourceIds.en/,"Library must navigate to Suscipe by its exact cleared source ID");
assert.match(ui,/redBookletSuscipeLibraryLinksForSubject\(subject.id\).length/,"Eucharistic subject count must include Suscipe");
assert.match(treasury,/communionDeepLinkTarget\(opts.communionPrayer\)/,"Communion reader must validate deep-link targets");
assert.match(treasury,/opts.communionPrayer!==undefined&&!communionTarget\)return false/,"Unknown prayer deep links must fail closed");
assert.match(treasury,/communionStep:communionTarget\?\.index\?\?0/,"Selected work must be its own reader card, not a generic start");
assert.match(treasury,/opts.dailySourcePrayer!==undefined&&!requestedDailySource\)return false/,"Suscipe deep link must reject unrecognized source IDs");
assert.match(treasury,/data-tp381-suscipe-lang/,"Suscipe must offer only the attested EN/LA source-language choices");
assert.match(treasury,/dailyDirectLanguage:requestedDailySource\?\.\[0\]/,"Source language must not be borrowed from saved preferences");
console.log("PASS booklet scan: 37 source works; 36 live source owners, 1 held Rosary bead wording, 2 short printed forms exactly compared; sixteen individual Library works; no invention of French/Latin, no change to canonical Mass or Rosary");
