import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildTlmChurchProfile,renderTlmChurchProfile,TLM_CHURCH_PROFILE_STYLE} from "../src/find/tlm-church-profile.js";
import {projectDirectoryItems} from "../src/find/explore-projection.js";

const source={url:"https://example.org/church",title:"Official community page"};
const church={venue_id:"test:church",name:{official:"St Cantius & Parish"},address:{city:"Chicago",country_code:"US",formatted:"Chicago, IL"},
 diocese:{name:"Archdiocese of Chicago"},contact:{website:[source.url],schedule_url:["https://example.org/mass"]},
 publication_state:"CURRENT_PUBLIC_MASS"};
const frMinistry={ministry_id:"m-fssp",community_id:"FSSP",relationship:"served_by",
 liturgical_usage:{family:"ROMAN",books:"1962",evidence_source_ids:["official-charism"]},
 communityProfile:{communionProfile:{position_family:"ROMAN_PONTIFF_RECOGNISED",recognises_current_pontiff:"YES",
 pope_named_in_canon:"UNKNOWN",certainty:"OFFICIAL_POLICY"},statusAssertions:[]},
 schedules:[{schedule_id:"sch-a",service_type:"MASS",mass_type:"SUNG",
 payload:{raw:"Sunday 12:30 PM Sung Mass"},verification:{state:"OFFICIAL_VERIFIED",checked_at:"2026-10-29T12:00:00Z"}}]};
const otherMinistry={ministry_id:"m-guest",community_id:"GUEST",relationship:"visiting_celebrant",
 upstream:{una_cum_status_raw:"NO"},liturgical_usage:{family:"DOMINICAN",books:"PRE_1955",rubrical_basis:"PRE_1955",
 evidence_source_ids:["guest-missal"]},
 schedules:[{schedule_id:"sch-b",service_type:"MASS",mass_type:"LOW",
 payload:{raw:"Friday 7:00 AM"},verification:{state:"RECENTLY_VERIFIED",checked_at:"2026-10-28T10:00:00Z"}}]};
const record={venue:church,ministries:[frMinistry,otherMinistry],sources:[{source_id:"official",title:"Official community page",url:source.url}]};
const [item]=projectDirectoryItems([record],{communities:[{id:"FSSP",abbreviation:"FSSP"}]});
assert.equal(item.kind,"TLM_VENUE");
let model=buildTlmChurchProfile(item);
assert.equal(model.ministries.length,2);
assert.equal(model.ministries[0].missal,"1962");
assert.equal(model.ministries[0].unaCum,"Not established"); // Recognising Pope is not proof of this celebration
assert.equal(model.ministries[0].position,"Recognises the Roman Pontiff");
assert.equal(model.ministries[1].unaCum,"No");
assert.equal(model.ministries[1].rite,"Dominican");
assert.equal(model.ministries[1].missal,"Pre-1955");
assert.equal(model.ministries[1].rubrics,"PRE 1955");
let html=renderTlmChurchProfile(item,"en");
for(const text of ["St Cantius &amp; Parish","Liturgical rite","Pope named in Canon","Una cum","Missal / books",
 "Rubrical basis","Mass programme","Sunday 12:30 PM Sung Mass","Friday 7:00 AM","Directions","Original sources"])
 assert.ok(html.includes(text),text);
assert.match(html,/data-explore-collapse-detail/);
assert.match(html,/data-tlm-church-profile="test:church"/);
assert.match(html,/Recognises the Roman Pontiff/);
assert.match(html,/Not established/);
assert.match(html,/2026-10-29/);
assert.match(html,/source/);
assert.match(html,/FSSP_emblem/);
assert.doesNotMatch(html,/No currently publishable Mass times/);
assert.ok(!html.includes("https://bad.example/"));
assert.match(TLM_CHURCH_PROFILE_STYLE,/aoTlmProfileIdentityGrid/);
assert.match(TLM_CHURCH_PROFILE_STYLE,/@media\(max-width:560px\)/);

const fr=renderTlmChurchProfile(item,"fr");
for(const phrase of ["Position ecclésiale","Non établi","Programme des messes","Retour à l’aperçu"])
 assert.ok(fr.includes(phrase),phrase);

const preliminary={...item,status:"SCHEDULE UNVERIFIED",
 raw:{...record,venue:{...church,publication_state:"DIRECTORY_LISTED_UNVERIFIED"}}};
model=buildTlmChurchProfile(preliminary);
assert.equal(model.unverified,true);
assert.equal(model.ministries[0].schedules.length,0);
html=renderTlmChurchProfile(preliminary);
assert.doesNotMatch(html,/Sunday 12:30 PM Sung Mass/);
assert.match(html,/No currently publishable Mass times/);
assert.match(html,/Official community page/);

const unknown={...item,community_id:"OTHER",
 raw:{venue:church,ministries:[{community_id:"OTHER",schedules:[]}]},source_links:[source]};
html=renderTlmChurchProfile(unknown);
assert.match(html,/Not established/);
assert.doesNotMatch(html,/FSSP_emblem/);
assert.doesNotMatch(html,/Emblem_Holy_See/);
assert.doesNotMatch(html,/1962/);

const hostile={...item,title:'<img src=x onerror=alert(1)>',subtitle:'<script>alert(1)</script>',
 raw:{venue:{...church,name:{official:"<test>"},contact:{website:["javascript:alert(1)"]}},ministries:[]},
 source_links:[{url:"javascript:alert(1)",title:"unsafe"}]};
html=renderTlmChurchProfile(hostile);
assert.doesNotMatch(html,/<script>|<img src=x|href="javascript:/);
assert.match(html,/&lt;script&gt;/);

const presentation=readFileSync(new URL("../src/find/explore-presentation.js",import.meta.url),"utf8");
const runtime=readFileSync(new URL("../src/find/browser-entry.js",import.meta.url),"utf8");
assert.match(presentation,/if\(item.kind==="TLM_VENUE"\)return renderTlmChurchProfile/);
assert.match(runtime,/DIRECTORY_CARD_STYLE\+TLM_CHURCH_PROFILE_STYLE/);
console.log("Expanded TLM church-profile contract: passed");
