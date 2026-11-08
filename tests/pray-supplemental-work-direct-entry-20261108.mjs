/**
 * Implementation gate: 8 individually source-exact B19/B20/B21 work entries.
 * No text duplication, historical facsimile certification or new reader.
 */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PRAY_CANONICAL_DATA_V435930 as DATA} from "../src/pray/canonical-data.js";
import {PRIESTLY_INTERCESSIONS_B19,priestlyIntercessionFor} from "../src/pray/priestly-intercessions-b19.js";
import {OCCASIONAL_INTERCESSIONS_B20,occasionalIntercessionFor} from "../src/pray/occasional-intercessions-b20.js";
import {OCCASIONAL_INTERCESSIONS_B21,occasionalIntercessionB21For} from "../src/pray/occasional-intercessions-b21.js";
import {PRAYER_SUBJECTS_V1,PRAYER_CANONICAL_SUBJECT_IDS_V1} from "../src/pray/prayer-subject-index.v1.js";
import {PRAYER_SUPPLEMENTAL_LIVE_WORK_LINKS_V1 as LINKS,
 prayerSupplementalLiveWork,prayerSupplementalLiveWorksForSubject
} from "../src/pray/prayer-supplemental-live-works.v1.js";
import {INTERNAL_PRAYER_VIEWS} from "../src/pray/internal-route-owner.js";

assert.equal(LINKS.length,8);
assert.equal(new Set(LINKS.map(x=>x.id)).size,8,"Individual historical source identity duplication");
assert.equal(prayerSupplementalLiveWorksForSubject("II").length,1);
assert.equal(prayerSupplementalLiveWorksForSubject("VII").length,7);
for(const family of PRAYER_SUBJECTS_V1){
 assert.equal(prayerSupplementalLiveWorksForSubject(family.id).length,
  family.id==="II"?1:family.id==="VII"?7:0);
}
const originals=new Map([...PRIESTLY_INTERCESSIONS_B19,...OCCASIONAL_INTERCESSIONS_B20,...OCCASIONAL_INTERCESSIONS_B21].map(x=>[x.id,x]));
assert.equal(originals.size,8);
for(const work of LINKS){
 assert.equal(prayerSupplementalLiveWork(work.id),work);
 assert.equal(work.en,originals.get(work.id).titleEn,"Work title must come from historical source owner");
 assert.equal(work.fr,originals.get(work.id).titleFr,"French UI title must match historical owner, not translated prayer body");
 assert.equal(work.purpose,originals.get(work.id).purpose);
 assert.equal(work.printImageCertified,false);
 assert.ok(INTERNAL_PRAYER_VIEWS[work.route],"Actual original reader route missing "+work.id);
 assert.ok(!(work.id in PRAYER_CANONICAL_SUBJECT_IDS_V1),"May not duplicate 48-card canonical bank: "+work.id);
 assert.equal(DATA.prayers[work.id],undefined,"No second prayer record may be added to canonical data");
 for(const ui of ["en","fr"]){
  const p=work.owner==="B19"
   ?priestlyIntercessionFor(work.purpose,ui,false)
   :work.owner==="B20"?occasionalIntercessionFor(work.purpose,ui,false,DATA.prayers.devotion_ad_te_beate_ioseph)
   :occasionalIntercessionB21For(work.purpose,ui,false,DATA.prayers.devotion_ad_te_beate_ioseph);
  assert.ok(p&&p.text.trim().length>50,"Historical reader not carrying full source body "+work.id+"/"+ui);
  assert.equal(p.id,work.id,"Purpose resolved to WRONG individual historical work "+work.id+"/"+ui);
  assert.equal(p.title,ui==="fr"?work.fr:work.en);
  assert.ok(["en","la"].includes(p.language),"Fabricated French historical translation: "+work.id);
 }
 const matching=prayerSupplementalLiveWorksForSubject(work.subject,work.en.split(" ")[0]);
 assert.ok(matching.some(x=>x.id===work.id));
}
assert.equal(prayerSupplementalLiveWork("unverified_or_missing_prayer"),null);
assert.deepEqual(prayerSupplementalLiveWorksForSubject("all"),[]);
const ui=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
for(const signal of [
 'PRAYER_SUPPLEMENTAL_LIVE_WORK_LINKS_V1',
 'prayerSupplementalLiveWorksForSubject(LIB.subject,q)',
 'data-p435930-subject-work',
 'prayerSupplementalLiveWork(b.dataset.p435930SubjectWork)',
 'routeOwn(work.route,{purpose:work.purpose})',
 "PRIESTLY_INTERCESSION_PURPOSES_B19.includes(opts.purpose)",
 "OCCASIONAL_PURPOSES_ALL_B21.includes(opts.purpose)",
 'if(b.dataset.p435930Own)',
 'renderLibraryEntryRows(rows,q)',
 'function renderConfession()',
 'function renderRosary()',
 'function renderAdoration()',
 'function renderBenediction()'
])assert.ok(ui.includes(signal),"Missing protected work/reader contract: "+signal);
console.log("PASS eight historical work records, all 16 EN/FR original-reader source resolutions, II/VII classification, no duplicate canonical text, no invented French");
