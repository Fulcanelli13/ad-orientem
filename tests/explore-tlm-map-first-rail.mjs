// Source-owned map-first TLM rail: published CL2 physical-site scope only.
// A viewport is a geographic condition, never evidence of a Mass schedule.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {projectPreliminaryR49,projectPublishedProvisionalMassSites} from "../src/find/preliminary-directory-r49.js";
import {projectCL2PhysicalDirectory} from "../src/find/cl2-physical-directory.js";
import {discoverItemsWithinMapBounds} from "../src/find/mapcn-discover-rail.js";
import {tlmMapRailItems,renderTlmMapResultRail} from "../src/find/tlm-map-result-rail.js";
import {attachApprovedDirectoryMedia} from "../src/find/directory-card.js";
const load=p=>JSON.parse(readFileSync(p,"utf8"));
const r49=projectPreliminaryR49(load("data/directory/preliminary-map-r49.v1.json"));
const ext=projectPublishedProvisionalMassSites(r49,load("data/directory/published-provisional-mass-sites-20261026.v1.json"));
const all=projectCL2PhysicalDirectory(ext,load("data/directory/generated/cl2-physical-site-index.v1.json"));
assert.equal(all.length,2582);
const nearChicago={
 contains:([lng,lat])=>lng>=-88&&lng<=-87&&lat>=41&&lat<=43,
};
const selected=discoverItemsWithinMapBounds(all,nearChicago);
assert.ok(selected.length>0&&selected.length<all.length);
const entries=tlmMapRailItems(selected,{lat:41.89,lng:-87.65});
assert.ok(entries.length>0&&entries.length<=12);
assert.ok(entries.every(x=>x.map_publishable&&x.kind==="TLM_VENUE"));
assert.ok(entries.every(x=>selected.some(row=>row.item_id===x.item_id)));
const html=renderTlmMapResultRail({items:selected,selectedId:entries[0].item_id,
 center:{lat:41.89,lng:-87.65}});
assert.match(html,/Churches in this view/);
assert.match(html,/data-tlm-map-rail/);
assert.match(html,/aria-current="true"/);
assert.match(html,/Open full directory/);
assert.match(html,/data-tlm-map-open-directory/);
assert.doesNotMatch(html,/data-find-filter="view"/);
assert.doesNotMatch(html,/Verified current Mass times/);
const fr=renderTlmMapResultRail({items:selected,language:"fr"});
assert.match(fr,/Églises dans cette vue/);
assert.match(fr,/Ouvrir l’annuaire complet/);
assert.match(renderTlmMapResultRail({items:[],language:"en"}),/No published map pin in this area/);
assert.match(renderTlmMapResultRail({loading:true}),/Reading current map view/);
const photo=load("data/directory/approved-venue-media.v1.json").items[0];
const base=all.find(x=>x.source_ids?.includes(photo.venue_id));
assert.ok(base,"Groombridge CL2 venue source join must be present");
const withMedia=attachApprovedDirectoryMedia([base],{venueApproved:[photo]})[0];
assert.equal(withMedia.cover_media?.venue_id,photo.venue_id);
assert.match(renderTlmMapResultRail({items:[withMedia]}),/GB-groombridge-st-pius-v.webp/);
assert.doesNotMatch(renderTlmMapResultRail({items:[{...withMedia,source_id:"mismatch",cover_media:{...photo,venue_id:"another"}}]}),
 /GB-groombridge-st-pius-v.webp/);
const poison=[{...withMedia,title:'<img src=x onerror=alert(1)>',subtitle:'<script>bad</script>'}];
const safe=renderTlmMapResultRail({items:poison});
assert.doesNotMatch(safe,/<script>|<img src=x/);
assert.match(safe,/&lt;script&gt;/);
const presentation=readFileSync("src/find/explore-presentation.js","utf8");
const runtime=readFileSync("src/find/browser-entry.js","utf8");
assert.match(presentation,/renderTlmMapResultRail/);
assert.match(runtime,/discoverItemsWithinMapBounds\(lastExploreViewModel\.items,bounds\)/);
assert.match(runtime,/\[data-tlm-map-rail\] \[data-explore-item\]/);
console.log("PASS map-first TLM rail: exact CL2 viewport, source-approved media, bilingual desktop, unchanged MapLibre");
