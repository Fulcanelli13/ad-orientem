#!/usr/bin/env node
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {SACRED_ART_CURATED_WORKS_V1} from "../src/art/sacred-art-taxonomy-v1.js";
import {SACRED_ART_CROSSMODULE_INDEX_V1,sacredArtCrossModuleLinks,sacredArtMatchesForTarget} from "../src/art/sacred-art-crossmodule-links-v1.js";
import {ROSARY_MYSTERY_CONTEXT_V1} from "../src/pray/rosary-mystery-context.v1.js";
import {APPROVED_CLASS_I_2026} from "../src/calendar/approved-class-i-heroes-2026.js";

const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const massIds=new Set([1,2,3,4,5,6].flatMap(n=>read("data/mass/mc-events-0"+n+".v1.json").events.map(e=>e.id)));
const atlas=readFileSync(new URL("../src/find/bible-atlas.js",import.meta.url),"utf8");
const approvedDates=new Map(APPROVED_CLASS_I_2026.map(x=>[x.date,x]));
assert.equal(SACRED_ART_CURATED_WORKS_V1.length,25);
assert.equal(SACRED_ART_CROSSMODULE_INDEX_V1.length,25);
assert.equal(new Set(SACRED_ART_CROSSMODULE_INDEX_V1.map(r=>r.workId)).size,25);
assert.equal(sacredArtCrossModuleLinks("absent"),null);
assert.deepEqual(sacredArtMatchesForTarget("unknown","joy1"),[]);
let rosaryCount=0,atlasCount=0,massCount=0,prayerCount=0,calendarCount=0;
for(const row of SACRED_ART_CROSSMODULE_INDEX_V1){
 const art=SACRED_ART_CURATED_WORKS_V1.find(a=>a.id===row.workId);
 assert.equal(row.publicationAuthorizedByLinks,false);
 assert.equal(row.currentlyPublicPhoto,!!art.photoModuleId);
 for(const r of row.rosary){
   assert.ok(ROSARY_MYSTERY_CONTEXT_V1[r.id],"Unknown canonical Rosary ID: "+r.id);
   assert.equal(r.relation,"DEPICTED_MYSTERY_NOT_BEAD_REPLACEMENT");
   rosaryCount++;
 }
 for(const r of row.bibleAtlas){
   assert.ok(atlas.includes('"'+r.id+'"'),"Unknown Bible Atlas event ID: "+r.id);
   assert.equal(r.relation,"SAME_NARRATIVE_EVENT_NOT_GEOGRAPHIC_PROOF");
   atlasCount++;
 }
 for(const r of row.mass){
   assert.ok(massIds.has(r.id),"Unknown canonical Mass event ID: "+r.id);
   assert.equal(r.relation,"THEOLOGICAL_THEME_NOT_LITURGICAL_DEPICTION");
   massCount++;
 }
 for(const r of row.calendar){
   const day=approvedDates.get(r.date);
   assert.ok(day&&day.principalId===r.principalId,"Unknown owner-selected Calendar identity");
   assert.equal(r.photoReuseApprovedHere,false);
   assert.equal(day.title.normalize("NFKC").trim().toLowerCase(),art.title.normalize("NFKC").trim().toLowerCase());
   assert.equal(day.artist.normalize("NFKC").trim().toLowerCase(),art.artist.normalize("NFKC").trim().toLowerCase());
   calendarCount++;
 }
 for(const r of row.scripture){
   assert.equal(r.editionTextSupplied,false);
   assert.ok(art.scriptureAnchors.includes(r.reference));
 }
 assert.deepEqual(row.prayer,art.existingMatching.existingPrayerSlots);
 prayerCount+=row.prayer.length;
 if(!art.photoModuleId)assert.equal(row.currentlyPublicPhoto,false);
}
assert.equal(rosaryCount,10);
assert.equal(atlasCount,11);
assert.equal(massCount,5);
assert.equal(prayerCount,41);
assert.ok(calendarCount>=2);
assert.deepEqual(sacredArtMatchesForTarget("rosary","joy1").map(r=>r.workId).sort(),["released-photo:angelus","released-photo:bouts"]);
assert.equal(sacredArtMatchesForTarget("prayer","COV-novena.st_michael").length,1);
assert.equal(sacredArtMatchesForTarget("mass","MC-CNS-040").length,2);
console.log(JSON.stringify({curatedWorks:25,rosaryEventMatches:rosaryCount,bibleAtlasEventMatches:atlasCount,massThematicMatches:massCount,existingPrayerMatches:prayerCount,calendarExistingDateIdentityMatches:calendarCount,publicationNewPhotos:0}));
