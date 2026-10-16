import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {exactCalendarPrincipalSaintProfile,loadCalendarSaintProfileBridge} from "../src/calendar/calendar-saint-explore-handoff.js";
import {applySaintsReleaseBoundary} from "../src/find/saints-release-policy.js";
import {projectSaintCatalogueItems} from "../src/find/saints-catalogue.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const bridge=read("data/saints/parallel-owner-identity-bridge-20261015.v1.json");
const saints=read("data/saints/holiness-first-editorial-pilot-20261015.v1.json");
const dataset=applySaintsReleaseBoundary({
 saints,saintsCalendarBridge:bridge,
 geography:{places:read("data/geography/seed-registry.v1.json").places},
 shrines:{shrines:read("data/shrines/shrines-pilgrimages-seed.v1.json").shrines}
});
assert.equal(dataset.saintsRelease.channel,"PILOT_SIX");
const probe={date:"2026-10-03",principalId:"sancti:10-03:3:w",bridge};
const link=exactCalendarPrincipalSaintProfile(probe);
assert.equal(link.saintsId,"saint:therese-of-lisieux");
assert.equal(link.calendarPersonId,"saint.therese-lisieux");
assert.equal(link.massSelectionAuthority,"NONE");
assert.equal(link.readOnly,true);
assert.equal(exactCalendarPrincipalSaintProfile({...probe,date:"2032-10-03"}).saintsId,link.saintsId,
  "No arbitrary 2026-only cutoff; require exact observed source for future years");
const pilot=projectSaintCatalogueItems(dataset);
assert.equal(pilot.length,6);
const exact=pilot.filter(x=>x.saint_id===link.saintsId);
assert.equal(exact.length,1);
assert.equal(exact[0].item_id,"saints:person:saint:therese-of-lisieux");
for(const wrong of [
 {...probe,date:"2026-10-01"},
 {...probe,principalId:"sancti:10-15:3:w"},
 {...probe,principalId:"sancti:10-03:4:w"},
 {...probe,principalId:"tempora:10-03:3:w"},
 {...probe,date:"2026-02-30"},
 {...probe,date:"2026-10-03<script>"},
 {...probe,bridge:{...bridge,status:"UNREVIEWED"}},
 {...probe,bridge:{...bridge,identity_links:[...bridge.identity_links,bridge.identity_links[0]]}},
 {...probe,bridge:{...bridge,nonlinks:[...bridge.nonlinks,{saints_id:"saint:therese-of-lisieux",relation:"DISTINCT_PERSON_DO_NOT_MERGE"}]}}
]){
 assert.equal(exactCalendarPrincipalSaintProfile(wrong),null,JSON.stringify(wrong).slice(0,200));
}
assert.equal(exactCalendarPrincipalSaintProfile({date:"2026-10-17",principalId:"sancti:10-17:3:w",bridge}),null,
  "Margaret Mary exact Calendar alias remains unverified");
assert.equal(exactCalendarPrincipalSaintProfile({date:"2026-09-09",principalId:"sancti:09-09:3:w",bridge}),null,
  "Never conflate Blessed Jacques-Désiré Laval with St François de Montmorency-Laval");
for(const language of ["en","fr"]){
 const vm=buildExploreViewModel({language,items:pilot,view:"list",lens:"saints",
   filters:{saintScope:"profiles",saintCategory:"ALL"},saintsRelease:dataset.saintsRelease,
   selectedId:exact[0].item_id});
 const html=renderExploreToString(vm);
 assert(html.includes('data-saint-id="saint:therese-of-lisieux"'),"Existing native Saints profile must render");
 assert(html.includes("data-explore-calendar-date=\"2026-10-03\""));
}
let fetched=0;
const loaded=await loadCalendarSaintProfileBridge(async()=>{fetched++;return {ok:true,json:async()=>bridge}});
assert.equal(loaded?.identity_links?.length,2);
const second=await loadCalendarSaintProfileBridge(async()=>{throw Error("Cached bridge must not refetch")});
assert.equal(second,loaded);
assert.equal(fetched,1);
const calendar=readFileSync(new URL("../src/calendar/calendar-runtime.js",import.meta.url),"utf8");
const find=readFileSync(new URL("../src/find/browser-entry.js",import.meta.url),"utf8");
assert(calendar.includes("exactCalendarPrincipalSaintProfile({date:target,principalId:observed,bridge})"));
assert(calendar.includes("owner?.openSaintProfile?.(exact.saintsId)"));
assert(calendar.includes('globalThis.AO_MODULES?.open?.("today.saint"'),
  "Existing saint panel must remain the fallback on unmapped identities");
assert(find.includes("async function verifiedSaintProfileItem(saintsId)"));
assert(find.includes('row?.saint_id===saintsId'));
assert(find.includes('state.saintScope="profiles"'));
assert(find.includes("openSaintProfile,"));
assert(!find.includes('saintProfileId)&&state.query'),
  "Do not deep-link by title or fuzzy search");
console.log("Calendar -> Saints exact profile PASS: canonical 1962 identity, native profile, future-year source, rejection of collisions and safe fallback; no Mass selection.");
