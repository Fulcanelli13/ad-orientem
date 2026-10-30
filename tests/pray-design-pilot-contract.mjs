import {PRAY_DOOR_ART_SLOTS_V1,prayerDoorArtSlot,hasReleasedDoorPainting} from "../src/pray/art-slot-map.v1.js";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 PRAYER_DESIGN_PILOT_SCHEMA,prayerPilotEnabled,prayerPilotAliases,resolvedPrayerPilotFamilies,
 renderPilotDiscovery,renderPilotAngelusEntry
} from "../src/pray/prayer-design-pilot.js";

assert.equal(PRAYER_DESIGN_PILOT_SCHEMA,"ao-prayer-discovery-angelus-pilot-v1");
assert.equal(prayerPilotEnabled({location:{search:""}}),true);
assert.equal(prayerPilotEnabled({location:{search:"?from=home"}}),true);
assert.equal(prayerPilotEnabled({location:{search:"?aoPrayerPilot=1"}}),true);
assert.equal(prayerPilotEnabled({location:{search:"?aoPrayerPilot=0"}}),false);

const L=(en,fr)=>en;
const esc=s=>String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");
const families={
 daily:{title:"Daily Prayer",assetId:"ao-rich-begin-end-day",items:[["own","pray.angelus_regina","Angelus","Hourly prayer"]]},
 chaplets:{title:"Rosary & Chaplets",assetId:"ao-rich-rosary",items:[["own","pray.rosary","Rosary","Bead reader"]]},
 eucharistic:{title:"Holy Eucharist",assetId:"ao-rich-adoration",items:[]},
 library:{title:"Prayer Library",assetId:"ao-rich-prayer-library",direct:"pray.library",items:[]}
};
const aliases=prayerPilotAliases(L);
assert.deepEqual(Object.keys(aliases).sort(),["intentions","marian","novenas","ourlord","saints"]);
const bridged=resolvedPrayerPilotFamilies(L,{
 ...families,
 penance:{items:[["own","pray.confession","Confession","Prepare"],["own","pray.penitential_psalms","Seven Penitential Psalms","Source prayer"]]},
 passion:{items:[["own","pray.stations","Stations","Fourteen"],["own","pray.tenebrae","Office of Tenebrae","Triduum"]]},
 devotions:{items:[["external","pray.novenas","Novenas","Source"],["external","pray.holy_name_litany","Holy Name","Litany"]]}
});
for(const [door,route] of [["intentions","pray.penitential_psalms"],["ourlord","pray.tenebrae"],["novenas","pray.holy_name_litany"]]){
 assert.ok(bridged[door].items.some(item=>item[1]===route),"Nine-door discovery buried original route "+route);
}
assert.equal(bridged.ourlord.items.filter(item=>item[1]==="pray.stations").length,1);
assert.equal(bridged.novenas.items.filter(item=>item[1]==="pray.novenas").length,1);
const actual=renderPilotDiscovery({
 head:title=>"<header>"+title+"</header>",L,esc,DATA:{prayers:{foundations_hail_mary:{title:"Hail Mary",titleFr:"Je vous salue Marie"}}},
 families,assetIcon:(_name,cls)=>"<span class='"+cls+"'></span>"
});
assert.equal((actual.match(/class="aoPrayPilotTile(?: aoPrayPilotLarge)?"/g)||[]).length,9,"nine live mosaic doors");
const placement=JSON.parse(readFileSync(new URL("../data/pray/art-placement-slots-20261030.v1.json",import.meta.url),"utf8"));
assert.equal(placement.schema,"AO_ART_MATCHING_MAP_NORMALIZED_V1");
assert.equal(placement.counts.slots,275);
assert.equal(placement.counts.subjects,101);
assert.equal(placement.counts.rotations,11);
assert.equal(placement.counts.calendar_contexts,39);
assert.equal(placement.counts.assigned_slot_rows,0);
assert.equal(placement.counts.eligible_live_paintings,0);
assert.equal(placement.slots.length,275);
assert.equal(new Set(placement.slots.map(x=>x.id)).size,275,"One durable identity per artwork position");
assert.equal(placement.slots.filter(x=>x.level==="Door cover").length,9);
assert.ok(placement.slots.every(x=>x.assigned_count===0&&x.painting_ids.length===0
 &&x.publication_status==="NO_ARTWORK_ASSIGNED"),"Illustrative examples must not turn into selected gallery files");
const permittedSubjects=new Set(placement.subject_vocabulary.map(x=>x.Code));
for(const row of placement.slots){
 for(const code of row.eligible_subjects)
  assert.ok(permittedSubjects.has(code),"Undefined controlled art subject "+code+" in "+row.id);
}
const expectedSlots={
  daily:"DOOR-D1",library:"DOOR-D2",chaplets:"DOOR-D3",novenas:"DOOR-D4",
  eucharistic:"DOOR-D5",ourlord:"DOOR-D6",marian:"DOOR-D7",
  saints:"DOOR-D8",intentions:"DOOR-D9"
};
assert.deepEqual(Object.keys(PRAY_DOOR_ART_SLOTS_V1).sort(),Object.keys(expectedSlots).sort());
for(const [id,slotId] of Object.entries(expectedSlots)){
 const slot=prayerDoorArtSlot(id);
 assert.equal(slot.slotId,slotId,"Workbook art slot does not match live editorial tile "+id);
 const sourceSlot=placement.slots.find(x=>x.id===slotId);
 assert.ok(sourceSlot,"Missing canonical spreadsheet art slot "+slotId);
 assert.deepEqual(slot.subjectCodes,sourceSlot.eligible_subjects,
  "Runtime mapping must derive from supplied 275-slot subject blueprint");
 assert.equal(slot.rotation,sourceSlot.rotation);
 assert.equal(slot.poolMin,sourceSlot.pool_min);
 assert.equal(slot.poolIdeal,sourceSlot.pool_ideal);
 assert.equal(slot.publicationState,"UNASSIGNED");
 assert.equal(slot.poolMin,4);assert.equal(slot.poolIdeal,12);
 assert.equal(slot.priority,"A");
 assert.ok(slot.subjectCodes.length>=2,"No source-approved subject vocabulary for "+id);
 assert.match(actual,new RegExp('data-ao-art-slot-id="'+slotId+'"'));
}
assert.equal((actual.match(/data-ao-art-binding="unassigned"/g)||[]).length,9);
assert.equal(hasReleasedDoorPainting(null),false);
assert.equal(hasReleasedDoorPainting({publicationState:"READY_FOR_PUBLICATION",editorialApproved:true}),false);
assert.equal(hasReleasedDoorPainting({publicationState:"READY_FOR_PUBLICATION",editorialApproved:true,
 releaseEvidence:{sourceOriginalSha256:"0".repeat(64),rightsForActualFileCleared:true}}),false);
assert.ok(!actual.includes("http://")&&!actual.includes("https://"),
 "Slot map may not ship unapproved painting URLs");
assert.match(actual,/data-p435930-my-customs/,"personal Prayer destination remains reachable");
for(const id of ["chaplets","marian","daily","novenas","eucharistic","ourlord","saints","intentions"])
 assert.match(actual,new RegExp('data-p435930-family="'+id+'"'));
assert.match(actual,/data-p435930-own="pray.library"/);
assert.match(actual,/data-p435930-pilot-prayer="foundations_hail_mary"/);
assert.match(actual,/data-p435930-pilot-search/);
assert.equal((actual.match(/data-p435930-pilot-facet="/g)||[]).length,5,"R1.1 has four form filters plus Latin availability");
assert.match(actual,/data-pilot-form="prayer"/);
assert.match(actual,/data-pilot-latin="false"/);
assert.doesNotMatch(actual,/Pilot: approved paintings/,"public Prayer hub must not display prototype implementation notes");

const angelus=renderPilotAngelusEntry({
 head:title=>"<header>"+title+"</header>",L,esc,form:"angelus",posture:"Kneel · ordinary days",moduleIcon:()=>"<i></i>"
});
const regina=renderPilotAngelusEntry({
 head:title=>"<header>"+title+"</header>",L,esc,form:"regina",posture:"Stand · Eastertide",moduleIcon:()=>"<i></i>"
});
assert.match(angelus,/data-p435930-pilot-angelus-begin/);
for(const mode of ["individual","group"])assert.match(angelus,new RegExp('data-p435930-pilot-angelus-recitation="'+mode+'"'));
assert.match(angelus,/aria-pressed="true">Alone/,"Individual is the default presentation");
assert.match(angelus,/Angelus/);
assert.match(regina,/Regina Cæli/);
assert.doesNotMatch(angelus,/data-ao-incarnation/,"the presentation does not invent canonical prayer units");

const runtime=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
assert.match(runtime,/if\(PRAYER_PILOT_ENABLED\)return renderPilotDiscovery/);
assert.match(runtime,/if\(PRAYER_PILOT_ENABLED&&ANGELUS_PILOT_ENTRY\)/);
assert.match(runtime,/ANGELUS_PILOT_ENTRY=false;\s*return render\(\)/);
assert.match(runtime,/function angelusExactPosture\(\)/,"the real posture owner remains");
assert.match(runtime,/installAngelusCardDeck\(/,"the real five\/four-card engine remains");
assert.match(runtime,/if\(PRAYER_PILOT_ENABLED&&x.matches\('\[data-p435930-pilot-search\]'\)\)/);
console.log("Prayer presentation pilot source contract: passed");

// Research-only Sacred Art candidate joins; no implied rights or release.

const heroJoin=JSON.parse(readFileSync(new URL("../data/pray/artwork-candidate-join-20261030.v1.json",import.meta.url),"utf8"));
const galleryDelta=JSON.parse(readFileSync(new URL("../data/pray/artwork-candidate-gallery-delta-20261030.v1.json",import.meta.url),"utf8"));
assert.equal(heroJoin.statistics.slots_total,275);
assert.equal(heroJoin.statistics.artworks_user_approved_identity,22);
assert.equal(heroJoin.statistics.slots_with_proposals,147);
assert.equal(heroJoin.statistics.candidate_links,207);
assert.equal(galleryDelta.statistics.total_gallery_records,383);
assert.equal(galleryDelta.statistics.newly_classified_gallery_identities,35);
assert.equal(galleryDelta.statistics.candidate_links_added,262);
assert.equal(galleryDelta.statistics.combined_slots_with_candidates,228);
assert.equal(galleryDelta.statistics.combined_candidate_links,469);
assert.equal(galleryDelta.statistics.combined_doors_with_candidates,9);
const idSource=new Map([...heroJoin.artwork_identity_index.map(a=>[a.artwork_id,a]),...galleryDelta.artwork_candidate_index.map(a=>[a.artwork_id,a])]);
assert.equal(idSource.size,57,"Artwork references must deduplicate primary and gallery identities");
const sourceSlots=new Map(placement.slots.map(s=>[s.id,s]));
for(const joined of [heroJoin,galleryDelta]){
 assert.equal(joined.slot_proposals.length,275);
 assert.deepEqual(joined.slot_proposals.map(s=>s.slot_id),placement.slots.map(s=>s.id));
 for(const slot of joined.slot_proposals){
  const source=sourceSlots.get(slot.slot_id);
  assert.ok(source);
  for(const proposal of slot.proposals){
   assert.ok(idSource.has(proposal.artwork_id),"Unknown proposed artwork");
   assert.ok(proposal.matched_subject_codes.length>0,"Empty title/subject cue");
   assert.ok(proposal.matched_subject_codes.every(code=>source.eligible_subjects.includes(code)),"Invalid controlled subject for "+slot.slot_id);
   assert.equal(proposal.slot_placement_editorially_approved,false);
   assert.equal(proposal.release_eligible,false);
  }
 }
}
assert.ok(heroJoin.artwork_identity_index.every(x=>x.publication_eligible===false));
assert.ok(galleryDelta.artwork_candidate_index.every(x=>x.release_eligible===false));
assert.equal(heroJoin.statistics.production_ready,0);
assert.equal(galleryDelta.statistics.production_ready,0);

// Nine-door static editorial shortlist, fail-closed photograph gates.

const doorReviewHtml=readFileSync(new URL("../assets/editorial/prayer-nine-door-artwork-one-click-20261030.html",import.meta.url),"utf8");
const doorReviewDataMatch=doorReviewHtml.match(/const data=(\[[^\n]+\]);\nconst groups=/);
assert.ok(doorReviewDataMatch,"Nine-door review has embedded pinned data");
const doorReviewRows=JSON.parse(doorReviewDataMatch[1]);
assert.equal(doorReviewRows.length,25,"One visible candidate card per real slot × painting pair");
assert.equal(new Set(doorReviewRows.map(x=>x.slot)).size,9,"All nine doors need an inspectable candidate");
assert.equal(new Set(doorReviewRows.map(x=>x.slot+"::"+x.id)).size,25,"No duplicate candidate cards for the same slot");
assert.ok(doorReviewRows.every(x=>x.image?.startsWith("https://")),"Never place an invented or missing preview on a card");
assert.ok(doorReviewRows.every(x=>x.source?.startsWith("https://")),"Each card has a verifiable source page");
assert.ok(doorReviewRows.every(x=>x.sha===null||/^[a-f0-9]{64}$/i.test(x.sha)),"Pinned original checksums must be valid or absent");
assert.equal(doorReviewRows.filter(x=>x.archived).length,15,"Archived originals used for primary gallery proof");
assert.ok(doorReviewHtml.includes('localStorage.setItem(KEY'),"Selections must persist locally");
assert.ok(doorReviewHtml.includes('SCHEMA="AO_PRAY_NINE_DOOR_VISUAL_DECISIONS_V1"'),"Review export schema frozen");
assert.ok(doorReviewHtml.includes('rightsFinalCleared:false,photoQualityFinalCleared:false,productionApproved:false'),"Never promote visual choices to publication automatically");
assert.ok(doorReviewHtml.includes('if(state==="VISUAL_APPROVED"&&!ok.has(pair(x)))'),"Do not approve a failed image load");
assert.ok(doorReviewHtml.includes('not a duplicate'),"Distinct painting adjudication remains available");
