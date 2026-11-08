// Owner-approved Tarare CL2 physical site, approximate map marker, exact Mass dates.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {projectCL2PhysicalDirectory} from "../src/find/cl2-physical-directory.js";
import {projectPreliminaryR49,projectPublishedProvisionalMassSites} from "../src/find/preliminary-directory-r49.js";
import {attachPublishedTarareDatedMassProgramme,upcomingPrintedMasses} from "../src/find/tlm-dated-mass-programme.js";
import {renderTlmChurchProfile} from "../src/find/tlm-church-profile.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const index=read("data/directory/generated/cl2-physical-site-index.v1.json");
assert.equal(index.records.length,2580);
assert.equal(index.counts.effective_physical_sites,2580);
const exact=index.records.filter(r=>r[0]==="RG-874DCE028C98");
assert.equal(exact.length,1);
assert.deepEqual(exact[0][1],["AO-CL2-FR-TARARE-BEL-AIR-20261108"]);
assert.equal(exact[0][3],"FR");
assert.equal(exact[0][4],"1620 chemin de Bel Air, 69170 Tarare, France");
const baseline=projectPublishedProvisionalMassSites(
 projectPreliminaryR49(read("data/directory/preliminary-map-r49.v1.json")),
 read("data/directory/published-provisional-mass-sites-20261026.v1.json"));
const items=projectCL2PhysicalDirectory(baseline,index,{mapAffiliation:(v)=>v==="Capucins de Morgon"?"CAPUCHINS_MORGON":"OTHER"});
assert.equal(items.length,2583);
const chapel=items.find(i=>i.physical_group_id==="RG-874DCE028C98");
assert.ok(chapel);
assert.equal(chapel.map_publishable,true);
assert.equal(chapel.geo.precision,"locality");
assert.equal(chapel.geo.approximate,true);
assert.equal(chapel.geo.lat,45.90129);
assert.equal(chapel.geo.lng,4.42378);
assert.ok(chapel.actions.some(a=>a.label==="Search location"));
const programme=read("data/directory/cl27-dated-mass-programme-tarare-20261108.v1.json");
const published=attachPublishedTarareDatedMassProgramme(items,programme);
assert.equal(published.length,2583);
const site=published.find(i=>i.physical_group_id==="RG-874DCE028C98");
assert.equal(site.dated_mass_programme.events.length,9);
const expected=["2026-10-11","2026-11-15","2026-12-13","2027-01-24","2027-02-28","2027-03-21","2027-04-18","2027-05-23","2027-06-20"];
assert.deepEqual(site.dated_mass_programme.events.map(e=>e.local_date),expected);
assert.equal(upcomingPrintedMasses(site.dated_mass_programme,{asOf:"2026-11-08"}).length,8);
assert.equal(upcomingPrintedMasses(site.dated_mass_programme,{asOf:"2027-06-21"}).length,0);
for(const e of site.dated_mass_programme.events){
 assert.equal(e.local_time,"10:30");
 assert.equal(e.mass_type,"UNKNOWN");
 assert.equal(new Date(e.local_date+"T00:00:00Z").getUTCDay(),0);
 for(const denied of ["rrule","weekly","recurrence","una_cum","missal_edition","canonical_status"])
  assert.ok(!Object.hasOwn(e,denied));
}
const english=renderTlmChurchProfile(site,"en",{asOf:"2026-11-08"});
const french=renderTlmChurchProfile(site,"fr",{asOf:"2026-11-08"});
assert.equal((english.match(/data-cl27-dated-mass="/g)||[]).length,8);
assert.equal((french.match(/data-cl27-dated-mass="/g)||[]).length,8);
assert.ok(english.includes("Mass · type unspecified"));
assert.ok(french.includes("Messe · type non précisé"));
assert.ok(english.includes("2026–27"));
assert.ok(english.includes('data-cl27-dated-mass="2026-11-15"'));
assert.ok(!english.includes('data-cl27-dated-mass="2026-10-11"'));
assert.equal((renderTlmChurchProfile(site,"en",{asOf:"2027-06-21"}).match(/data-cl27-dated-mass="/g)||[]).length,0);
const paita=read("data/directory/cl27-dated-mass-programme-paita-20261108.v1.json");
assert.equal(paita.sites[0].events.length,2);
assert.equal(paita.sites[0].cl2_anchor,"RG-51BC2B17C91F");
console.log("PASS Tarare approved CL2, illustrative map pin, eight upcoming printed Masses, bilingual profile, no recurrence");
