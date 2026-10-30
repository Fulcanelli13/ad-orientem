import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {PRAYER_MOSAIC_DOORS,PRAYER_MOSAIC_ART_MANIFEST,certifiedPrayerMosaicPhoto} from "../src/pray/prayer-mosaic-art-gates.js";
import {prayerDiscoveryRouteIndex,renderPilotDiscovery,prayerPilotAliases,resolvedPrayerPilotFamilies} from "../src/pray/prayer-design-pilot.js";

const load=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const evidence=load("data/pray/prayer-discovery-release-gates-20261030.v1.json");
const foundation=load("data/pray/prayer-corpus-ownership-foundation.v1.json");
const overlay=load("data/pray/prayer-corpus-current-release-overlay-b31.v1.json");
const audit=load("data/app/content-reachability-audit.v1.json");

assert.equal(evidence.schema,"ao.pray.discovery-release-gates.v1");
assert.equal(Object.keys(PRAY_CANONICAL_DATA_V435930.prayers).length,48,"Canonical prayer bank silently drifted");
assert.equal(evidence.coverage.canonicalPrayerBankRecords,Object.keys(PRAY_CANONICAL_DATA_V435930.prayers).length);
assert.equal(evidence.coverage.canonicalPrayerInventoryRecords,foundation.records.filter(x=>x.record_type==="CANONICAL_PRAYER").length);
assert.equal(evidence.coverage.ownershipLedgerRecords,foundation.records.length);
assert.equal(evidence.coverage.historicalAcquisitionRecords,overlay.records.length);
assert.deepEqual(evidence.coverage.acquisitionByStatus,overlay.summary.byStatus);
assert.deepEqual(evidence.coverage.historicCanonicalFamilyRouteIds,audit.routes.filter(x=>x.kind==="PRAY_FAMILY_ITEM").map(x=>x.id).sort());
assert.equal(new Set(overlay.records.map(x=>x.id)).size,97,"Historical acquisition identity must be preserved");
assert.equal(evidence.coverage.uniqueGlobalPrayers,"NOT_DEDUPLICATED");
assert.equal(evidence.coverage.distinctPublishedPrayerWorks,"NOT_ESTABLISHED");
assert.equal(evidence.art.appPhotoReleased,0);
assert.equal(evidence.art.nineDoorReadyPhotoAssignments,0);
assert.deepEqual(evidence.nineDoorIds,PRAYER_MOSAIC_DOORS);

for(const id of PRAYER_MOSAIC_DOORS){
 assert.equal(PRAYER_MOSAIC_ART_MANIFEST[id].status,"PHOTO_HOLD",id+" must not claim photo readiness");
 assert.equal(certifiedPrayerMosaicPhoto(id),null,id+" cannot accidentally render research art");
}
const eligible={
 status:"READY_FOR_PUBLICATION",artworkId:"exact-object-1",assetPath:"/assets/active/prayer-mosaic/verified.webp",
 sha256:"a".repeat(64),photoRights:"REUSE_CLEARED",alt:"Photograph of exact artwork",
 editorialDoorApproved:true,objectIdentityApproved:true,
 originalBytesVerified:true,framelessQualityApproved:true,cropApproved:true
};
assert.equal(certifiedPrayerMosaicPhoto("daily",{daily:eligible})?.src,eligible.assetPath);
for(const [label,patch] of [
 ["rights",{photoRights:"RIGHTS_UNKNOWN"}],["frame",{framelessQualityApproved:false}],
 ["crop",{cropApproved:false}],["bytes",{originalBytesVerified:false}],
 ["editorial",{editorialDoorApproved:false}],["original artwork identity",{objectIdentityApproved:false}],
 ["external image",{assetPath:"https://example.com/art.jpg"}],
 ["path traversal",{assetPath:"/assets/active/prayer-mosaic/../staged.jpg"}],
 ["preview image",{assetPath:"/assets/staged/unreviewed.jpg"}],
 ["missing SHA",{sha256:null}]
])assert.equal(certifiedPrayerMosaicPhoto("daily",{daily:{...eligible,...patch}}),null,label+" must block publication");

const english=(en,fr)=>en,french=(en,fr)=>fr;
const sample={
 chaplets:{title:"Rosary & Chaplets",assetId:"ao-rich-rosary",items:[["own","pray.rosary","Holy Rosary","Five decades"]]},
 daily:{title:"Daily prayer",assetId:"ao-rich-begin-end-day",items:[["external","pray.morning_evening","Morning & Evening Prayer","Daily sequence"]]},
 library:{title:"Prayer Library",assetId:"ao-rich-prayer-library",direct:"pray.library",items:[]},
 eucharistic:{title:"Holy Eucharist",assetId:"ao-rich-adoration",items:[]}
};
const frenchSample={
 ...sample,
 daily:{...sample.daily,items:[["external","pray.morning_evening","Prière du matin et du soir","Rituel quotidien"]]},
 chaplets:{...sample.chaplets,items:[["own","pray.rosary","Saint Rosaire","Cinq dizaines"]]}
};
const primary=resolvedPrayerPilotFamilies(english,sample);
const fr=resolvedPrayerPilotFamilies(french,frenchSample);
const rows=prayerDiscoveryRouteIndex(primary,{en:primary,fr});
assert.equal(rows.filter(r=>r.id==="pray.morning_evening").length,1,"Multiple discovery aliases duplicated source route");
assert.match(rows.find(r=>r.id==="pray.morning_evening").searchText,/Morning & Evening Prayer/);
assert.match(rows.find(r=>r.id==="pray.morning_evening").searchText,/Prière du matin et du soir/);
assert.match(rows.find(r=>r.id==="pray.rosary").searchText,/Saint Rosaire/);
const esc=s=>String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");
const html=renderPilotDiscovery({
 head:t=>"<header>"+t+"</header>",L:english,esc,DATA:PRAY_CANONICAL_DATA_V435930,
 families:sample,searchFamilies:{en:primary,fr},
 assetIcon:(name,cls)=>'<span class="'+cls+'" data-icon="'+name+'"></span>'
});
assert.equal((html.match(/data-p435930-pilot-prayer="/g)||[]).length,48,"Search must include all 48 canonical text IDs");
assert.equal((html.match(/class="aoPrayPilotTile(?: aoPrayPilotLarge)?"/g)||[]).length,9);
assert.match(html,/data-pilot-searchable="[^"]*Prière du matin et du soir/);
assert.match(html,/data-pilot-searchable="[^"]*Saint Rosaire/);
assert.doesNotMatch(html,/<img\b/,"No research or unapproved painting is authorized for production");
assert.doesNotMatch(html,/AO-AQ-\d{3}/,"Research acquisition IDs cannot appear as published searchable prayers");
assert.match(html,/data-p435930-my-customs/,"Personal prayer module is separate and reachable");

console.log("PASS nine-door source-first search: 48 canonical bank records, 23 frozen family routes, 94 ownership rows, 97 overlapping acquisition records, bilingual labels, blocked unapproved art, no fabricated publication");
