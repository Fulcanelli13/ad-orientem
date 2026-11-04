import {PRAY_DOOR_ART_SLOTS_V1,prayerDoorArtSlot,hasReleasedDoorPainting} from "../src/pray/art-slot-map.v1.js";
import {NOVENA_CORPUS_V4} from "../src/pray/novena-corpus-v4.js";
import {revealPrayerMosaicTile,clearPrayerMosaicReveal,restorePrayerMosaicReveal} from "../src/pray/prayer-mosaic-reveal.js";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 PRAYER_DESIGN_PILOT_SCHEMA,prayerPilotEnabled,prayerPilotAliases,resolvedPrayerPilotFamilies,
 PRAYER_DOOR_ORDER_V1,PRAYER_PRIMARY_DOOR_V1,PRAYER_SEARCH_ONLY_ROUTES_V1,
 renderPilotDiscovery,renderPilotAngelusEntry,collectPrayerNovenaSearchEntries
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
const primaryEntries=Object.entries(PRAYER_DOOR_ORDER_V1).flatMap(([door,ids])=>ids.map(id=>({door,id})));
assert.equal(Object.keys(PRAYER_DOOR_ORDER_V1).length,9,"Keep exactly nine approved doors");
assert.equal(new Set(primaryEntries.map(x=>x.id)).size,primaryEntries.length,
 "A devotion or canonical source prayer may appear on only ONE visible shelf");
assert.ok(primaryEntries.every(x=>PRAYER_PRIMARY_DOOR_V1[x.id]===x.door),"Canonical owner map must agree with ordered shelves");
assert.deepEqual(PRAYER_SEARCH_ONLY_ROUTES_V1,["pray.rosary_methods","pray.sacred_hymns"]);
assert.equal(PRAYER_PRIMARY_DOOR_V1["pray.rosary"],"chaplets");
assert.equal(PRAYER_PRIMARY_DOOR_V1["pray.angelus_regina"],"daily");
assert.equal(PRAYER_PRIMARY_DOOR_V1["pray.litany_saints"],"saints");
assert.equal(PRAYER_PRIMARY_DOOR_V1["pray.holy_name_litany"],"ourlord");
assert.equal(PRAYER_PRIMARY_DOOR_V1["pray.good_death"],"intentions");
const visible=[...["daily","chaplets","eucharistic","marian","novenas","ourlord","saints","intentions"]]
 .flatMap(door=>bridged[door].items.map(item=>({door,id:item[1]})));
assert.equal(new Set(visible.map(x=>x.id)).size,visible.length,"No duplicate devotional shelf rows across nine doors");
for(const [door,route] of [["intentions","pray.penitential_psalms"],["ourlord","pray.tenebrae"],
 ["ourlord","pray.holy_name_litany"],["novenas","pray.novenas"],["marian","litany_loreto_1962"],["saints","devotion_prayer_st_michael"]]){
 assert.ok(bridged[door].items.some(item=>item[1]===route),"Canonical reader or source prayer missing from "+door+": "+route);
}
assert.ok(!bridged.daily.items.some(x=>x[1]==="pray.rosary"),"The Rosary belongs on the Chaplets shelf only");
assert.ok(!bridged.marian.items.some(x=>x[1]==="pray.angelus_regina"),"Angelus is on Daily Prayer, not a second Marian shelf");
assert.ok(!bridged.novenas.items.some(x=>x[1]==="pray.holy_name_litany"),"Novenas must not inherit unrelated older devotions");
assert.equal(bridged.library.direct,"pray.library","Essential Prayers must continue using the canonical Prayer Library");
const actual=renderPilotDiscovery({
 head:title=>"<header>"+title+"</header>",L,esc,DATA:{prayers:{foundations_hail_mary:{title:"Hail Mary",titleFr:"Je vous salue Marie"}}},
 families,assetIcon:(_name,cls)=>"<span class='"+cls+"'></span>",novenaCorpus:NOVENA_CORPUS_V4
});
const indexedNovenas=collectPrayerNovenaSearchEntries(NOVENA_CORPUS_V4);
assert.equal(indexedNovenas.length,16,"Search must resolve all sixteen original bilingual novenas");
assert.equal(new Set(indexedNovenas.map(row=>row.id)).size,16,"Canonical novena IDs must not duplicate");
assert.deepEqual(indexedNovenas.find(row=>row.id==="christmas"),{
 id:"christmas",en:NOVENA_CORPUS_V4.christmas.title.en,fr:NOVENA_CORPUS_V4.christmas.title.fr
});
const searchableNovenaIds=[...actual.matchAll(/data-p435930-pilot-novena="([^"]+)"/g)].map(match=>match[1]);
assert.deepEqual(searchableNovenaIds,indexedNovenas.map(row=>row.id),
 "Prayer search rows must be exact source-owned Novena IDs, not duplicate prayer records");
assert.match(actual,/data-pilot-form="novena"[^>]*data-p435930-pilot-novena="christmas"/,
 "Search Novenas need the existing Novenas facet and a canonical child action");
assert.ok(actual.includes(esc(NOVENA_CORPUS_V4.christmas.title.fr)),
 "French titles must remain searchable even in English UI");
const frenchDiscovery=renderPilotDiscovery({
 head:title=>"<header>"+title+"</header>",L:(_en,fr)=>fr,esc,
 DATA:{prayers:{}},families,assetIcon:(_name,cls)=>"<span class='"+cls+"'></span>",novenaCorpus:NOVENA_CORPUS_V4
});
assert.ok(frenchDiscovery.includes("<b>"+esc(NOVENA_CORPUS_V4.christmas.title.fr)+"</b>"),
 "French Pray search must display the attested canonical French novena title");
assert.equal([...frenchDiscovery.matchAll(/data-p435930-pilot-novena="/g)].length,16,
 "French search must not create additional Novena identities");
assert.equal((actual.match(/class="aoPrayPilotTile(?: aoPrayPilotLarge)?"/g)||[]).length,9,"nine live mosaic doors");
assert.equal((actual.match(/data-ao-pray-pilot-tile="/g)||[]).length,9,"Every door must have a disclosure identity");
assert.equal((actual.match(/aria-expanded="false"/g)||[]).length,9,"Mosaic doors start unrevealed");
assert.match(actual,/Select to reveal, select again to open/,"Reader navigation needs the approved two-step affordance");
// Isolated interaction contract: never invoke navigation on the first activation,
// never disclose two paintings simultaneously, and let the second activation
// fall through to existing source-owned route handling.
const tiles=[];
const mosaic={
 querySelectorAll(selector){
  return selector.includes('[aria-expanded="true"]')
   ?tiles.filter(t=>t.getAttribute('aria-expanded')==='true'):tiles;
 }
};
const fakeTile=id=>{
 const attrs=new Map([['aria-expanded','false']]);
 return {
  dataset:{aoPrayPilotTile:id},
  matches:s=>s==='[data-ao-pray-pilot-tile]',
  closest:s=>s==='[data-ao-pray-pilot-mosaic]'?mosaic:null,
  getAttribute:name=>attrs.get(name),
  setAttribute:(name,value)=>attrs.set(name,String(value))
 };
};
tiles.push(fakeTile('daily'),fakeTile('eucharistic'));
assert.equal(revealPrayerMosaicTile(tiles[0]),true,"First activation is reveal only");
assert.equal(tiles[0].getAttribute('aria-expanded'),'true');
assert.equal(revealPrayerMosaicTile(tiles[1]),true,"Another painting replaces the current reveal");
assert.equal(tiles[0].getAttribute('aria-expanded'),'false');
assert.equal(tiles[1].getAttribute('aria-expanded'),'true');
assert.equal(revealPrayerMosaicTile(tiles[1]),false,"Second activation delegates to canonical owner");
assert.equal(tiles[1].getAttribute('aria-expanded'),'false');
assert.equal(revealPrayerMosaicTile(tiles[0]),true);
assert.equal(tiles[0].getAttribute('aria-expanded'),'true');
const oldTile=tiles[0];
// A source-owned render can replace the entire DOM between genuine taps.
// Restoration must preserve the disclosure, and the next tap must navigate,
// not demand a third physical activation.
tiles.splice(0,tiles.length,fakeTile('daily'),fakeTile('eucharistic'));
assert.notEqual(tiles[0],oldTile);
assert.equal(restorePrayerMosaicReveal(mosaic),true);
assert.equal(tiles[0].getAttribute('aria-expanded'),'true');
assert.equal(revealPrayerMosaicTile(tiles[0]),false,
 "Second tap on remounted selected tile must delegate to canonical route");
assert.equal(tiles[0].getAttribute('aria-expanded'),'false');
assert.equal(revealPrayerMosaicTile(tiles[1]),true);
assert.equal(clearPrayerMosaicReveal(mosaic),true);
assert.equal(clearPrayerMosaicReveal(mosaic),false);
assert.equal(restorePrayerMosaicReveal(mosaic),false,
 "Fresh hub or outside dismissal must not auto-select previous artwork");
assert.match(actual,/>Prayer<\/h2>/,"R1.1 approved quiet Prayer heading must be shown");
assert.doesNotMatch(actual,/Enter into prayer|Choose a door or search|Find a prayer or devotion/,
 "Rejected instructional heading, helper copy and redundant subtitle must stay absent");
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
 assert.equal(slot.editorialAssigned,true,"Nine Prayer doors must resolve their established 267-slot editorial master");
 assert.notEqual(slot.publicationState,"UNASSIGNED","Do not use pre-reconciliation workbook state for production");
 assert.equal(slot.poolMin,4);assert.equal(slot.poolIdeal,12);
 assert.equal(slot.priority,"A");
 assert.ok(slot.subjectCodes.length>=2,"No source-approved subject vocabulary for "+id);
 assert.match(actual,new RegExp('data-ao-art-slot-id="'+slotId+'"'));
}
assert.equal((actual.match(/data-ao-art-binding="editorial-pending"/g)||[]).length,8);
assert.equal((actual.match(/data-ao-art-binding="released"/g)||[]).length,1);
assert.ok(actual.includes("adoration-frameless.webp"),"The one released Eucharistic door uses exactly the approved Met photograph");
assert.equal((actual.match(/data-ao-editorial-state="/g)||[]).length,9,
 "Every actual Prayer door must carry an authoritative editorial state");
assert.ok(hasReleasedDoorPainting(prayerDoorArtSlot("eucharistic")),
 "The exact released Ingres painting is source-checked against the editor-approved D5 slot");

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

const early=renderPilotAngelusEntry({head:()=>"",L,esc,form:"angelus",hour:6,moduleIcon:()=>"<i></i>"});
const midday=renderPilotAngelusEntry({head:()=>"",L,esc,form:"angelus",hour:12,moduleIcon:()=>"<i></i>"});
const dusk=renderPilotAngelusEntry({head:()=>"",L,esc,form:"angelus",hour:18,moduleIcon:()=>"<i></i>"});
assert.match(early,/Dawn · 06:00/);
assert.match(midday,/Midday · 12:00/);
assert.match(dusk,/Dusk · 18:00/);
assert.match(angelus,/The bell calls us to remember the Incarnation/);
assert.match(angelus,/data-ao-art-publication="released"/,"The Angelus opening now uses the exact released Met photograph");
assert.match(angelus,/angelus-frameless.webp/);
assert.equal((midday.match(/class="aoPrayPilotBellGroup"/g)||[]).length,4,"Use 3·3·3·9 grouped visual bells");
assert.equal((midday.match(/class="aoPrayPilotBellDot"/g)||[]).length,18);
assert.ok(midday.indexOf("aoPrayPilotBellMoments")<midday.indexOf("data-p435930-pilot-angelus-begin"),
 "Bell moments precede Begin");
assert.ok(midday.indexOf("data-p435930-pilot-angelus-begin")<midday.indexOf("data-p435930-pilot-angelus-recitation"),
 "Begin precedes the small Alone/With others control");
assert.doesNotMatch(angelus,/A pause for prayer|The Angel of the Lord declared unto Mary\./,
 "Retired generic Angelus cover copy must not replace the approved opening");

assert.match(regina,/Regina Cæli/);
assert.match(regina,/regina-whole-original.jpg/,"Seasonal Regina must have the exact approved Rubens original");
assert.match(regina,/data-ao-art-publication="released"/);
assert.doesNotMatch(regina,/angelus-frameless.webp/,"Champaigne's Annunciation must not appear for Regina Caeli");
assert.doesNotMatch(angelus,/The existing named cards|Kneel · ordinary days|aoPrayPilotEntryMeta/,
 "Angelus opening must not show engineering copy or posture before the prayer begins");
assert.doesNotMatch(regina,/The existing named cards|Eastertide · stand according to local custom|aoPrayPilotEntryMeta/,
 "Regina opening must not show engineering copy or stage-posture metadata");
assert.doesNotMatch(angelus,/data-ao-incarnation/,"the presentation does not invent canonical prayer units");

const runtime=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
assert.match(runtime,/if\(PRAYER_PILOT_ENABLED\)return renderPilotDiscovery/);
assert.match(runtime,/if\(PRAYER_PILOT_ENABLED&&ANGELUS_PILOT_ENTRY\)/);
assert.match(runtime,/ANGELUS_PILOT_ENTRY=false;render\(\);/,
 "Pilot Angelus hands off to the actual Claude Horarium reader");
assert.match(runtime,/if\(mount\(\)\)mount\(\)\.scrollTop=0;/,
 "Entering Horarium resets the previous screen scroll synchronously");
assert.match(runtime,/queueMicrotask\(\(\)=>\{if\(view==='angelus'&&mount\(\)\)mount\(\)\.scrollTop=0\}\);/,
 "The delayed focus/render handoff must not scroll away from the opening clock");
assert.match(runtime,/function angelusExactPosture\(\)/,"the real posture owner remains");
assert.match(runtime,/data-ao-prayer-shelf/,"Nine-door interiors use the compact unique shelf renderer");
const mosaicCss=readFileSync(new URL("../src/pray/prayer-door-mosaic-execution-styles.js",import.meta.url),"utf8");
assert.match(runtime,/data-ao-pray-essential-landing="true"/,
 "Essential Prayers door must open its own 32-prayer mosaic, not All Library");
assert.match(runtime,/LIB\.cat=PRAYER_PILOT_ENABLED&&entryView==='home'\?'essentials':'all'/,
 "Homepage Essential Prayers route must select the canonical Essentials collection");
assert.match(runtime,/LIB\.open=null;LIB\.language=null;PILOT_LORETO_GROUP=false;LIB\.q='';/,
 "Opening the Essentials door must never return to the previously read prayer");
assert.match(runtime,/data-p435930-lib-all/,
 "The full Prayer Library must remain directly accessible from Essential Prayers");
assert.match(runtime,/aoPrayDoorShelfList aoPrayDoorMosaic/,
 "Each non-library family interior must use the single mosaic grid");
assert.match(runtime,/visible\.map\(\(item,i\)=>prayDoorShelfEntry\(item,i===0,family\.assetId,i\)\)/,
 "The full canonical ordered door inventory must render with stable study-list ordinals");
assert.match(runtime,/data-ao-pray-door-entry data-ao-pray-door-facet/,
 "Existing filters must retain their canonical card target");
assert.match(runtime,/assetIcon\(familyAssetId/,"Every unassigned artwork tile must retain a real family icon");
assert.match(runtime,/prayerEditorialArtworkMarkup\(artSlotId/,
 "Mosaic artwork must pass through editorial publication checks");
assert.match(runtime,/releasedPrayerCardArtUrl\(route\)/,
 "Canonical prayer source photos must use the released inventory");
assert.doesNotMatch(runtime,/aoPrayDoorShelfRow|aoPrayDoorFeatured/,
 "Retired text rows and oversized featured list must not return");
assert.match(mosaicCss,/\.aoPrayDoorMosaicCard\[hidden\]\{display:none!important\}/,
 "Filtered mosaic tiles must actually disappear from the grid");
const f01Css=readFileSync(new URL("../src/pray/claude-holy-card-styles.js",import.meta.url),"utf8");
assert.match(f01Css,/\.aoClaudeHolyFan\{/,"F01 uses the approved case-of-cards owner");
assert.match(f01Css,/grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/,
 "The original three-column Claude Holy Card fan must remain canonical");
assert.doesNotMatch(mosaicCss,/\.aoEssentialMosaicLanding \.aoClaudeHolyFan/,
 "New generic Prayer mosaics must not overwrite the approved F01 fan geometry");
assert.match(mosaicCss,/prefers-reduced-motion:reduce/,
 "Prayer mosaics must respect reduced motion preferences");
assert.match(runtime,/data-p435930-door-prayer/,"Single-text prayer cards hand off to the existing canonical Library");
assert.match(runtime,/if\(navStack\.at\(-1\)==='family'\)/,"Library prayer Back returns to its owning door");
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

// Exercise research / visual-approval queues with a complete browser export.

const {mkdtempSync,writeFileSync,rmSync}=await import("node:fs");
const {tmpdir}=await import("node:os");
const {join:joinReview}=await import("node:path");
const {spawnSync:runReviewImporter}=await import("node:child_process");
const tempNineDoorReviewDir=mkdtempSync(joinReview(tmpdir(),"ao-pray-nine-door-"));
const importerPath=new URL("../scripts/art/import-pray-nine-door-visual-decisions-20261030.mjs",import.meta.url).pathname;
try{
 const fixture={schema:"AO_PRAY_NINE_DOOR_VISUAL_DECISIONS_V1",
  decisions:doorReviewRows.map(row=>({slotId:row.slot,artworkId:row.id,decision:"RESEARCH",
   imageShown:false,distinct:false,chosenAt:null,productionApproved:false,
   rightsFinalCleared:false,photoQualityFinalCleared:false}))};
 const input=joinReview(tempNineDoorReviewDir,"choices.json");
 const invoke=()=>runReviewImporter(process.execPath,[importerPath,input],{encoding:"utf8"});
 writeFileSync(input,JSON.stringify(fixture));
 let tested=invoke();
 assert.equal(tested.status,0,tested.stderr);
 let queues=JSON.parse(tested.stdout);
 assert.equal(queues.counts.research,25);
 assert.equal(queues.counts.publicationReady,0);
 fixture.decisions[0].decision="VISUAL_APPROVED";fixture.decisions[0].imageShown=true;
 writeFileSync(input,JSON.stringify(fixture));
 tested=invoke();
 assert.equal(tested.status,0,tested.stderr);
 queues=JSON.parse(tested.stdout);
 assert.equal(queues.counts.visualApproved,1);
 assert.equal(queues.counts.research,24);
 assert.equal(queues.queues.ready_for_publication.length,0);
 assert.equal(queues.queues.visually_approved_pending_exact_rights_photo_qa_and_crop.length,1);
 fixture.decisions[0].rightsFinalCleared=true;
 writeFileSync(input,JSON.stringify(fixture));
 tested=invoke();
 assert.notEqual(tested.status,0,"Browser export cannot certify file-specific rights");
}finally{rmSync(tempNineDoorReviewDir,{recursive:true,force:true})}
