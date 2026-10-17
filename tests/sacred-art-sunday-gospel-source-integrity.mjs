// Source-level acquisition invariants; no screenshot, browser, remote server or rating round.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=p=>JSON.parse(readFileSync(p,"utf8"));
const first=load("data/calendar/sacred-art-sunday-gospel-paintings-open-sources-20261017.v1.json");
const second=load("data/calendar/sacred-art-sunday-gospel-open-paintings-phase2-20261017.v1.json");
assert.equal(first.schema,"AO_SACRED_ART_OPEN_SUNDAY_GOSPEL_CANDIDATES_2026_V1");
assert.equal(second.schema,"AO_SACRED_ART_SUNDAY_GOSPEL_SECOND_SOURCE_PASS_2026_V1");
assert.equal(first.leads.length,17);
assert.equal(second.leads.length,9);
const all=[...first.leads,...second.leads];
assert.equal(all.length,26);
const keys=new Set();
const files=new Set();
for(const [i,a] of all.entries()){
 const page=a.sourceFilePage||a.commonsFile,preview=a.mobilePreview||a.reviewPreview;
 const id=a.id||a.title;
 assert.ok(/^\d{4}-\d\d-\d\d$/.test(a.date2026),"Invalid date "+id);
 assert.ok(typeof a.appointedGospel==="string"&&/^(?:Matthew|Mark|Luke|John) \d+/.test(a.appointedGospel),"Missing actual Gospel "+id);
 assert.ok(/https:\/\/commons\.wikimedia\.org\/wiki\/File:/i.test(page),"Not exact Commons file description "+id);
 assert.ok(/https:\/\/commons\.wikimedia\.org\/wiki\/Special:FilePath\//.test(preview)&&/[?&]width=500$/.test(preview),"Not bounded mobile image "+id);
 assert.ok(a.rightsClaim==="PUBLIC_DOMAIN_PD_ART_PDM"||a.rightsClaim==="CC_BY_SA_4_0"||a.rightsClaim==="CC0","Unrecognised rights "+id);
 assert.ok(a.editorialRating===null||a.rating===null,"Ratings must remain deferred "+id);
 assert.notEqual(a.published,true,"Research lead cannot be marked published "+id);
 assert.notEqual(a.alreadyApproved,true,"Human approval not granted "+id);
 assert.ok(/oil|paint|gouache|watercolor|manuscript|tempera/.test(a.medium.toLowerCase()),"Not a painting "+id);
 assert.ok(!/fra angelico|el greco/i.test(a.artist),"Rejected source painter "+id);
 const unique=a.date2026+"|"+page.toLowerCase();
 assert.ok(!keys.has(unique),"Duplicate image on same Gospel date "+unique);keys.add(unique);
 assert.ok(!files.has(page),"Repeated same physical Commons image masquerading as a new original "+page);files.add(page);
}
const firstDays=new Set(first.leads.map(x=>x.date2026));
assert.equal(firstDays.size,15,"First batch should cover 15/16 original scene gaps");
assert.deepEqual(first.unresolved.map(x=>x.date2026),["2026-07-05"]);
assert.ok(!all.some(x=>x.date2026==="2026-07-05"&&x.exactRelation==="DEPICTS_APPOINTED_GOSPEL_SCENE"),
 "Five-thousand paintings must never be relabelled as four-thousand episode");
const reused=first.leads.filter(x=>x.alreadyInUnifiedGallery);
assert.equal(reused.length,1);
assert.equal(reused[0].alreadyInUnifiedGallery.workId,"W07-014","Use preexisting historically scored Caravaggio, never duplicate it");
assert.equal(second.leads.filter(x=>x.associationType==="BIBLICAL_PERSON_CONTEXT_NOT_VERSE_EXACT").length,1,
 "Baptist preaching must not masquerade as John's interrogation by Jewish envoys");
assert.equal(second.leads.filter(x=>x.associationType==="EXACT_APPOINTED_GOSPEL_EPISODE").length,8);
assert.ok(all.some(x=>x.artist==="Philippe de Champaigne"&&x.appointedGospel==="Mark 7:31–37"),"Mark 7 deaf mute missing");
assert.ok(all.some(x=>x.artist==="James Tissot"&&x.appointedGospel==="Luke 11:14–28"),"Luke 11 possessed mute missing");
assert.ok(all.some(x=>x.rightsClaim==="CC_BY_SA_4_0"&&x.artist==="Andrei Mironov"),"Modern painting attribution/share-alike lost");
assert.ok(all.some(x=>x.rightsClaim==="CC0"&&/Nobleman/.test(x.title)),"Cleveland exact-source CC0 lead missing");
console.log("SACRED_ART_SUNDAY_DISCOVERY_SOURCE_GATE="+JSON.stringify({
 paintingLeads:all.length,originalSceneGapDatesResolved:firstDays.size,
 secondPassAdditionalDays:new Set(second.leads.map(x=>x.date2026)).size,
 sourceFiles:files.size,legacyPaintingsReused:reused.length,
 knownSceneUnillustrated:["2026-07-05"],historicalRatingsChanged:0}));
