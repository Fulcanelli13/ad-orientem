/**
 * Research-only Prayer identity-registry contract.
 * No runtime imports, no text migration and no publishing decisions.
 * Run: node tests/pray-work-identity-registry-20261106.mjs
 */
import assert from "node:assert/strict";
import {readFileSync, existsSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname, join, resolve} from "node:path";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {NOVENA_CORPUS_V4_IDS} from "../src/pray/novena-corpus-v4.js";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const registry=JSON.parse(readFileSync(join(root,"data/pray/prayer-work-identity-registry-20261106.v1.json"),"utf8"));
const fail=[],warn=[];
const check=(condition,message)=>{if(!condition)fail.push(message);};
const items=registry.works, ids=new Map(items.map(x=>[x.id,x]));
const A=(id)=>ids.get(id);
const count=(rows,key)=>Object.fromEntries([...new Set(rows.map(x=>x[key]))].sort().map(v=>[v,rows.filter(x=>x[key]===v).length]));
const fams=Object.keys(registry.families);
const catalogueRows=items.flatMap(w=>w.legacyRows);
const componentRows=items.flatMap(w=>w.components||[]).map(c=>c.legacyRow);
check(registry.schema==="ao.pray.work-identity.v1","Registry schema mismatch");
check(items.length===133,"Expected 133 distinct proposed catalogue works");
check(ids.size===items.length,"Work IDs must be globally unique");
check(fams.join(",")==="I,II,III,IV,V,VI,VII,VIII,IX","Nine family identifiers required");
check(catalogueRows.length===136,"Expected 136 source table rows in 133 works");
check(componentRows.length===2,"Fatima Prayer and Rosary collect are two programme-owned components");
const sourceRows=[...catalogueRows,...componentRows];
check(sourceRows.length===138,"Must cover all 138 original table numbers, including component rows");
check(new Set(sourceRows).size===138,"Masterplan source rows must have one and only one owner");
check(sourceRows.every(n=>Number.isInteger(n)&&n>=1&&n<=138),"Source row outside 1–138");
for(let n=1;n<=138;n++)check(sourceRows.includes(n),"Missing source row "+n);

const canonicalSource=PRAY_CANONICAL_DATA_V435930.prayers;
const originalCanonicalIds=Object.keys(canonicalSource);
const preservedCanonicalIds=items.flatMap(w=>w.legacyCanonicalIds);
check(originalCanonicalIds.length===48,"Underlying canonical corpus unexpectedly changed");
check(preservedCanonicalIds.length===48,"Expected 48 canonical source record references");
check(new Set(preservedCanonicalIds).size===48,"Duplicate canonical source owner reference");
check(originalCanonicalIds.every(x=>preservedCanonicalIds.includes(x)),"Canonical corpus has lost a legacy ID");
check(items.filter(w=>w.legacyCanonicalIds.length>0).length===46,"48 canonical forms must group into 46 independent works");

const audited=items.filter(w=>w.sourceBodyEvidence);
check(audited.length===36,"Stage 3 needs evidence for all 36 works");
check(registry.counts.sourceBodyAudited===36,"Audited work count drifted");
const ownerAudited=items.filter(w=>w.sourceOwnerEvidence);
check(ownerAudited.length===48,"Remaining 48 works need Stage 4 source-owner evidence");
check(new Set([...audited,...ownerAudited].map(w=>w.id)).size===84,"84 route-unverified works must have distinct Stage 3 or Stage 4 evidence");
check(registry.counts.supplementalSourceOwnerAudited===84,"Supplementary audited source-owner count drifted");
check(registry.counts.remaining48Audited===48,"Stage 4 count drifted");
check(items.filter(w=>w.availability==="route-unverified").length===84,"Do not silently change route availability from source evidence");

const browserBodyEvidence=JSON.parse(readFileSync(join(root,"data/pray/prayer-work-body-stage-browser-acceptance-20261107.v1.json"),"utf8"));
check(browserBodyEvidence.run.conclusion==="success","Source body evidence must refer to completed CI");
const nineBrowserIds=browserBodyEvidence.bodyParity.sourceWorks.map(w=>w.id);
check(nineBrowserIds.length===9 && new Set(nineBrowserIds).size===9,"Stage 6 has nine distinct directly compared work IDs");
const stage7=JSON.parse(readFileSync(join(root,"data/pray/prayer-work-stage7-rendered-source-acceptance-20261107.v1.json"),"utf8"));
check(stage7.run.conclusion==="success" && stage7.renderedExactBodyChecks===68 && stage7.failedChecks===0,"Stage 7 rendered witnesses require 68 passing checks");
check(stage7.coverage.reduce((n,row)=>n+row.checks,0)===68,"Stage 7 per-source checks must sum to 68");
check(stage7.coverage.filter(row=>row.embeddedOnly).map(row=>row.workId).join(",")==="pray.holy_name_litany","Embedded Holy Name test does not certify its independent reader");
const stage7WorkIds=stage7.coverage.filter(row=>!row.embeddedOnly).map(row=>row.workId);
check(stage7WorkIds.length===7 && new Set(stage7WorkIds).size===7,"Stage 7 requires seven independently evidenced source identities");
check(nineBrowserIds.every(id=>!stage7WorkIds.includes(id)),"Stage 7 evidence must not duplicate Stage 6 source identities");
const stage8=JSON.parse(readFileSync(join(root,"data/pray/prayer-work-stage8-four-chaplets-acceptance-20261107.v1.json"),"utf8"));
check(stage8.run.conclusion==="success" && stage8.exactRenderedSourceChecks===612 && stage8.failedChecks===0,"Stage 8 needs 612 exact source DOM comparisons");
check(stage8.workCoverage.reduce((n,x)=>n+x.checks,0)===612,"Stage 8 per-chaplet body comparisons must total 612");
const stage8WorkIds=stage8.workCoverage.map(x=>x.workId);
check(stage8WorkIds.length===4 && new Set(stage8WorkIds).size===4,"Stage 8 needs four distinct chaplet route identities");
check(stage8WorkIds.every(id=>id.startsWith("pray.")&&!nineBrowserIds.includes(id)&&!stage7WorkIds.includes(id)),"Stage 8 must not reuse previously certified source IDs");
const stabatCandidate=JSON.parse(readFileSync(join(root,"data/pray/prayer-work-stabat-1962-20-tercet-candidate-20261107.v1.json"),"utf8"));
check(PRAY_CANONICAL_DATA_V435930.stabat.length===13,"The canonical 13-tercet Stabat source cannot be silently extended");
check(stabatCandidate.source.septemberSequenceTercets===20 && stabatCandidate.missingFromCanonical.length===7 &&
 stabatCandidate.missingFromCanonical.every((row,i)=>row.position===i+14),"Research-only Stabat must isolate seven missing September tercets");
check(stabatCandidate.qualityGates.full20SequenceAdmittedToCanonical===false &&
 stabatCandidate.qualityGates.fullStanzaSetPrintImageCollated===false &&
 stabatCandidate.existingCanonical.modified===false,"Stabat critical-edition hold must not be claimed completed");
check(stabatCandidate.missingFromCanonical[5].latin.startsWith("Christe, cum sit hinc exire"),"1962 September stanza 19 may not be replaced with a different recension");
const stage9=JSON.parse(readFileSync(join(root,"data/pray/prayer-work-stage9-source-owner-acceptance-20261107.v1.json"),"utf8"));
check(stage9.run.conclusion==="success" && stage9.failedAssertions===0,"Stage 9 source-owner browser gate must pass");
check(stage9.verified.historicalSevenWords.renderedExactBodyChecks===36 &&
 stage9.verified.penitential.referencePositionChecks===28 &&
 stage9.verified.litany.offlineUnavailableFailureChecks===4 &&
 stage9.verified.lasance.historicalLanguageWitnesses===6,"Stage 9 evidence matrix changed");
check(stage9.perWorkNewVisibleBodyEvidence.length===1 &&
 stage9.perWorkNewVisibleBodyEvidence[0]==="pray.seven_words","Only Seven Words has new source-exact browser body evidence");
check(stage9.verified.penitential.fullPsalmBodiesCertified===0 &&
 stage9.verified.litany.fullLitanyBodiesCertified===0 &&
 stage9.verified.lasance.liveReaderBodiesCertified===0,"Do not elevate source/absence checks to complete verse/prayer proof");
check(stage9.perWorkUnchanged.every(id=>!A(id)?.readerBodyEvidence),"Stage 9 source-only works must not receive reader-body certificate");
const visibleBodyWorks=items.filter(w=>w.readerBodyEvidence);
check(visibleBodyWorks.length===21,"Stage 6 nine + Stage 7 seven + Stage 8 four + Stage 9 one identity require browser body evidence");
check(browserBodyEvidence.bodyParity.supplementalSourceWorks===8,"Stage 6 eight supplemental works have sampled visible-body checks");
check(browserBodyEvidence.bodyParity.canonicalSourceReuse===1,"One canonical St Joseph prayer must remain shared");
check(registry.counts.visibleBodyComparedWorks===21 && registry.counts.visibleBodyComparedSupplementalWorks===20 &&
 registry.counts.visibleBodyCanonicalReuseWorks===1,"Stage 8 cumulative reader-body evidence counts drifted");
check(registry.counts.visibleBodyStage6Works===9 && registry.counts.visibleBodyStage7Works===7 &&
 registry.counts.visibleBodyStage8Works===4 && registry.counts.visibleBodyStage9Works===1,"Stage-specific reader-body counts drifted");
for(const w of visibleBodyWorks){
 const isStage6=nineBrowserIds.includes(w.id);
 const isStage7=stage7WorkIds.includes(w.id);
 const isStage8=stage8WorkIds.includes(w.id);
 const isStage9=w.id==="pray.seven_words";
 check(Number(isStage6)+Number(isStage7)+Number(isStage8)+Number(isStage9)===1,"Registry identity has zero/multiple browser owners: "+w.id);
 const evidencePath=isStage6
  ?"data/pray/prayer-work-body-stage-browser-acceptance-20261107.v1.json#"+w.id
  :isStage7
   ?"data/pray/prayer-work-stage7-rendered-source-acceptance-20261107.v1.json#"+w.id
   :isStage8
    ?"data/pray/prayer-work-stage8-four-chaplets-acceptance-20261107.v1.json#"+w.id
    :"data/pray/prayer-work-stage9-source-owner-acceptance-20261107.v1.json#"+w.id;
 check(w.readerBodyEvidence.auditRef===evidencePath,"Wrong browser-body evidence pointer "+w.id);
 if(isStage7)check(w.readerBodyEvidence.route===stage7.coverage.find(row=>row.workId===w.id)?.route,"Stage 7 reader owner mismatch "+w.id);
 if(isStage8)check(w.readerBodyEvidence.route===stage8.workCoverage.find(row=>row.workId===w.id)?.route,"Stage 8 reader owner mismatch "+w.id);
 if(isStage9)check(w.readerBodyEvidence.route===stage9.verified.historicalSevenWords.route,"Stage 9 original Seven Words reader owner mismatch "+w.id);
 check(w.readerBodyEvidence.historicalSourcePrintCertified===false && w.readerBodyEvidence.sourceReaderCompleteCertified===false,
  "Source-visible checks cannot certify original print or all offline variants "+w.id);
}
check(stage7.registryImportedToRuntime===false&&stage7.publicationChanges===false&&stage7.prayerTextChanges===false,"Stage 7 must remain research-only with no text/publication changes");
check(stage8.registryImportedToRuntime===false&&stage8.publicationChanges===false&&stage8.prayerTextChanges===false,"Stage 8 must remain research-only with no text/publication changes");
check(stage9.registryImportedToRuntime===false || (stage9.publicationChanges===false&&stage9.prayerTextChanges===false), "Stage 9 must not publish or mutate source text");
check(browserBodyEvidence.availabilityPolicy?.registryImportedToRuntime===false,"Draft registry must not be treated as a production import");
check(registry.counts.routeUIVerified===0,"Targeted body tests are not complete 84-work browser route certificates");
const expectedAvailable=["published","route-unverified","external-link","source-only"];
check(Object.keys(registry.counts.byAvailability).every(x=>expectedAvailable.includes(x)),"Unexpected availability term");
check(registry.counts.catalogueWorks===items.length,"Embedded catalogue count is stale");
check(JSON.stringify(registry.counts.byFamily)===JSON.stringify(Object.fromEntries(fams.map(f=>[f,items.filter(x=>x.family===f).length]))),"Embedded family counts disagree");
const available=count(items,"availability");
check(JSON.stringify(available)===JSON.stringify(Object.fromEntries(Object.entries(registry.counts.byAvailability).sort())),"Availability counts disagree");
check(registry.policy.availabilitySeparateFromVerification===true,"Availability must not mean source verification");
check(registry.policy.doNotRegressExistingReaders===true,"Readers must be preserved");
check(registry.policy.noLearnToPrayModule===true,"Learning programme was rejected");
check(registry.policy.routeAvailabilityUnverifiedIsNotAnUnpublishInstruction===true,"Unverified route must not remove public content");

for(const w of items){
 check(typeof w.id==="string"&&w.id.length>0,"Empty work ID");
 check(fams.includes(w.family),"Invalid/missing family for "+w.id);
 check(typeof w.subcategory==="string"&&w.subcategory.length>0,"No subcategory for "+w.id);
 check(typeof w.kind==="string"&&w.kind.length>0,"No kind for "+w.id);
 check(typeof w.owner_module==="string"&&existsSync(join(root,w.owner_module)),"Source owner path missing: "+w.id+" "+w.owner_module);
 check(typeof w.source_key==="string"&&w.source_key.length>0,"Missing source key: "+w.id);
 check(Array.isArray(w.legacyRows)&&w.legacyRows.length>0,"Missing masterplan source row: "+w.id);
 check(Array.isArray(w.editions)&&w.editions.length>0,"No source edition identity: "+w.id);
 check(Array.isArray(w.refs),"Missing refs array: "+w.id);
 check(Array.isArray(w.relations),"Missing relationships: "+w.id);
 check(Array.isArray(w.review),"Missing review queue: "+w.id);
 check(["R1","R2","R3","R4","R5"].includes(w.classificationRule),"Missing classification rule: "+w.id);
 check(w.verification!==w.availability,"Publication and verification collapsed: "+w.id);
 check(w.parent===null||ids.has(w.parent),"Component has missing parent: "+w.id);
 if(w.parent)check(w.classificationRule==="R1"&&w.libraryListing==="programme-component-only","Programme component must not be a standalone library item: "+w.id);
 check(w.lang&&["la","en","fr"].every(k=>["full","partial","none","unassessed"].includes(w.lang[k])),"Missing language coverage assessment: "+w.id);
 check(!("text" in w)&&!("en" in w)&&!("fr" in w)&&!("la" in w)&&!("body" in w),"Registry must not copy prayer bodies: "+w.id);
 if(w.availability==="published"){
   check(w.lang.la!=="unassessed"&&w.lang.en!=="unassessed"&&w.lang.fr!=="unassessed","Canonical published language coverage unassessed: "+w.id);
   for(const language of ["la","en","fr"])if(w.lang[language]==="full"){
    check(typeof w.witnesses?.[language]?.sourceRef==="string","Published full language without evidence pointer: "+w.id+"/"+language);
   }
 }
 if(w.availability==="external-link"){
   check(typeof w.externalUrl==="string"&&w.externalUrl.startsWith("https://"),"External-link needs actual URL: "+w.id);
   check(Object.values(w.lang).every(x=>x==="none"),"External link must not claim imported prayer text: "+w.id);
 }
 if(w.availability==="route-unverified")warn.push(w.id);
 for(const ref of w.refs){
   check(ids.has(ref),"Dangling reference: "+w.id+" -> "+ref);
   if(w.availability==="published")check(A(ref)?.availability==="published","Published container refers to unverified/unavailable work: "+w.id+" -> "+ref);
 }
 for(const link of w.relations)if(link.target)check(ids.has(link.target),"Dangling related work: "+w.id+" -> "+link.target);
 for(const edition of w.editions)check(edition.sourceRef&&typeof edition.sourceRef==="string","Edition lacks sourceRef: "+w.id);
}

check(A("litany_loreto_1962")?.editions.length===2,"Loreto recensions should share one work");
check(A("foundations_eternal_rest")?.editions.length===2,"Singular/plural Requiem must be variants");
check(A("ad_regias_agni_dapes")?.editions.length===2,"Easter hymn must preserve two recensions");
check(A("immaculate_conception")?.id!=="icksp_immaculate_conception","Do not merge Immaculate novena programmes");
check(A("immaculate_conception")?.relations.some(r=>r.target==="icksp_immaculate_conception"),"Distinct Immaculate programmes need a relationship");
check(A("benediction_tantum_ergo")?.relations.some(r=>r.type==="excerpt-of"&&r.plannedWork?.includes("Pange lingua")),"Tantum Ergo is an excerpt, not a second edition");
check(A("dead_de_profundis")?.family==="VIII","De profundis belongs to Scriptural Prayer");
check(A("foundations_morning_offering")?.family==="II","Morning Offering principally invokes the Sacred Heart");
check(A("pray.rosary")?.components?.length===2,"Rosary components must stay within the Rosary");
check(!items.some(w=>w.id==="rosary.fatima-prayer"||w.id==="rosary.concluding-collect"),"Rosary components must not become separate library works");
check(A("icksp_us_therese_for_missionaries")?.availability==="external-link","Missionary prayer remains external");
check(A("icksp_us_therese_perpetual_novena")?.availability==="external-link","Perpetual Institute novena remains external");
check(A("st_therese")?.kind==="novena","Twenty-four Glory Bes remains its own novena");
check(A("pray.holy_name_litany")?.relations.some(r=>r.target==="pray.montfort_consecration"),"Montfort must reference the shared Holy Name litany");
check(A("pray.montfort_consecration")?.legacyRows[0]===123,"The existing Montfort route must refer to its 33-day programme");
check(A("montfort_consecration_act_1863")?.parent==="pray.montfort_consecration","The concluding act must be a child of Montfort preparation, not a competing route");

const expectedNovenas=NOVENA_CORPUS_V4_IDS;
check(expectedNovenas.length===16,"Original 16-novena corpus must remain present");
for(const id of expectedNovenas)check(ids.has(id),"Missing principal novena identity: "+id);

const details={
 schema:registry.schema, works:items.length, legacySourceRows:sourceRows.length, originalCanonicalTextRecords:preservedCanonicalIds.length,
 canonicalIndependentWorks:items.filter(w=>w.legacyCanonicalIds.length>0).length,
 novenas:expectedNovenas.length,byFamily:Object.fromEntries(fams.map(f=>[f,items.filter(w=>w.family===f).length])),
 availability:available,routeVisibilityStillUnverified:warn.length,
 requiresEditorialReview:items.filter(w=>w.review.length).map(w=>w.id),errors:fail
};
console.log(JSON.stringify(details,null,2));
if(fail.length){console.error("Prayer registry validation FAILED: "+fail.length+" error(s)");process.exitCode=1}
else console.log("Prayer registry structural checks PASS (source certification and reader routes remain separate audits).");
