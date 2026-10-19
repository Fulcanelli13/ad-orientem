import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildHolyThursdayPsalmRows,HOLY_THURSDAY_PSALM_SOURCE}
  from "../src/mass/reader-holy-thursday-psalm.js";
import {buildHolyThursdayPostPayload,createHolyThursdayPostReaderController}
  from "../src/mass/reader-holy-thursday-post.js";
import {projectSpecialRiteReadingPages,createSpecialRiteMissalPageCursor,specialRiteVernacular}
  from "../src/mass/reader-special-missal-pages.js";
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const g=load("../data/mass/special-days-extension.v1.3.json").graphs.HT_POST;
const payload=load("../data/presentation/reader-holy-thursday-post.v1.json");
const donor=payload.stripping;
assert.equal(HOLY_THURSDAY_PSALM_SOURCE.verseGroups,13);
assert.match(HOLY_THURSDAY_PSALM_SOURCE.romanRubric,/Clerici, si adsunt/);
assert.match(HOLY_THURSDAY_PSALM_SOURCE.romanRubric,/primum tantum versum/);
const refs=buildHolyThursdayPsalmRows(donor);
assert.equal(refs.performance,"CLERICS_UNRESOLVED_FULL_PSALM_REFERENCE_ONLY");
assert.equal(refs.rows.length,15,"Full Psalm reference dropped a Latin verse group or antiphon");
assert.equal(refs.referenceRows.length,15);
assert.equal(refs.completedRecitation,false,"Source reference is not a claim of completed audible recitation");
assert.deepEqual(refs.rows.map(r=>r.latin),[
  donor.antiphon,...donor.psalm21Pian,donor.repeatAntiphon],
  "Canonical 1962/Pian source Latin changed in bilingual projection");
assert.deepEqual(refs.rows.map(r=>r.id),[
  "HT-R05-A1",...Array.from({length:13},(_,i)=>"HT-R05-P"+(i+1)),"HT-R05-A2"]);
assert.ok(refs.rows.every(row=>
  specialRiteVernacular(row,{language:"en"})?.trim()&&
  specialRiteVernacular(row,{language:"fr"})?.trim()&&
  row.sourceRecordId==="HT-STRIP-010"&&
  row.sourceStatus===HOLY_THURSDAY_PSALM_SOURCE.translation),
  "A Pian Psalm or antiphon line lacks source-owned EN/FR editorial text");
assert.equal(refs.rows[0].french,refs.rows.at(-1).french,
  "The repeated antiphon must not acquire different French wording");
assert.equal(refs.rows[0].english,refs.rows.at(-1).english);
const choir=buildHolyThursdayPsalmRows(donor,{clericsPresent:true});
assert.equal(choir.performance,"CLERICS_RECITE_UNTIL_STRIPPING_COMPLETE");
assert.equal(choir.rows.length,15);
assert.equal(choir.completedRecitation,false,
  "Psalm recitation ends when the altars are stripped, not at its final verse");
const noChoir=buildHolyThursdayPsalmRows(donor,{clericsPresent:false});
assert.equal(noChoir.performance,"CELEBRANT_FIRST_VERSE_ONLY_NO_CLERICS");
assert.equal(noChoir.rows.length,3);
assert.deepEqual(noChoir.rows.map(r=>r.id),[
  "HT-R05-A1","HT-R05-P1-FIRSTVERSE","HT-R05-A2"]);
assert.equal(noChoir.rows[1].latin,
  "Deus meus, Deus meus, quare me dereliquísti? Longe abes a précibus, a verbis clamóris mei.");
assert.ok(donor.psalm21Pian[0].startsWith(noChoir.rows[1].latin),
  "First verse of grouped Pian source must be exact, not a paraphrase");
assert.equal(noChoir.rows[1].latin.includes("clamo per diem"),false,
  "The no-clerics route leaked the SECOND verse into celebrant's first");
assert.ok(noChoir.rows[1].french.includes("Pourquoi m'avez-vous abandonné"),
  "First-verse-only branch has missing French text");
assert.deepEqual(noChoir.referenceRows,refs.referenceRows,
  "Performance branch must not delete the fully sourced Psalm reference");
const shortBuilt=buildHolyThursdayPostPayload({graph:g,payload,clericsPresent:false});
assert.equal(shortBuilt.cards.length,6);
assert.equal(shortBuilt.cards[4].paragraphs.length,3);
assert.equal(shortBuilt.cards[4].psalmReferenceRows.length,15);
assert.equal(shortBuilt.cards[5].handoff,"POST_MASS_LIFECYCLE");
assert.equal(shortBuilt.cards[4].actorScope,"ALL_FAITHFUL");
const shortPages=projectSpecialRiteReadingPages("HT-R05",shortBuilt.cards[4].paragraphs);
assert.equal(shortPages.length,1);
assert.deepEqual(shortPages[0].rows,shortBuilt.cards[4].paragraphs);
const fullPages=projectSpecialRiteReadingPages("HT-R05",refs.rows);
assert.deepEqual(fullPages.map(p=>p.rows.length),[4,4,4,3]);
assert.deepEqual(fullPages.flatMap(p=>p.rows),refs.rows);
assert.equal(projectSpecialRiteReadingPages("HT-R05",refs.rows,{mode:"LIVE"}).length,1);
const cursor=createSpecialRiteMissalPageCursor();
assert.equal(cursor.project("HT-R05",refs.rows).totalPages,4);
cursor.turn("next");cursor.turn("next");
assert.equal(cursor.project("HT-R05",refs.rows).pageIndex,2);
assert.equal(cursor.project("HT-R05",noChoir.rows).totalPages,1,
  "Clerics branch update did not rebuild the current stage page projection");
const ctl=createHolyThursdayPostReaderController({graph:g,payload});
ctl.goTo("HT-R05");
assert.equal(ctl.project().card.paragraphs.length,15);
assert.equal(ctl.project().clericsPresent,null);
ctl.setClericsPresent(false);
assert.equal(ctl.project().card.id,"HT-R05",
  "Choosing no clerics moved the ceremonial cursor");
assert.equal(ctl.project().card.paragraphs.length,3);
assert.equal(ctl.project().clericsPresent,false);
ctl.setClericsPresent(true);
assert.equal(ctl.project().card.paragraphs.length,15);
assert.equal(ctl.project().psalmPerformance,"CLERICS_RECITE_UNTIL_STRIPPING_COMPLETE");
ctl.setClericsPresent(null);
assert.equal(ctl.project().psalmPerformance,"CLERICS_UNRESOLVED_FULL_PSALM_REFERENCE_ONLY");
assert.throws(()=>ctl.setClericsPresent("false"),
  /HOLY_THURSDAY_CLERICS_FLAG_MUST_BE_EXPLICIT_BOOLEAN_OR_UNKNOWN/);
const broken=structuredClone(donor);broken.psalm21Pian[0]="Deus meus";
assert.throws(()=>buildHolyThursdayPsalmRows(broken),/HOLY_THURSDAY_PSALM_WITNESS_CHANGED/);
const lacking=structuredClone(donor);lacking.psalm21Pian.pop();
assert.throws(()=>buildHolyThursdayPsalmRows(lacking),/HOLY_THURSDAY_PSALM_WITNESS_CHANGED/);
console.log("Holy Thursday Psalm 21: PASS 15 complete bilingual rows; first verse only without clerics; 1962 source performance, stable stage and Missal cursor.");
