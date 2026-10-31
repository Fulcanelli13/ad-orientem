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
 "Rubrical basis","Mass programme","Sunday 12:30 PM Sung Mass","Friday 7:00 AM","Directions","Sources &amp; verification"])
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

assert.match(html,/aoTlmProfileSpotlight/);
assert.match(html,/aoTlmProfileAffiliation/);
assert.match(html,/aoTlmProfileSourceDisclosure/);
assert.match(html,/data-explore-collapse-detail/);
assert.match(TLM_CHURCH_PROFILE_STYLE,/aoTlmProfileSpotlight\{display:grid/);
assert.match(TLM_CHURCH_PROFILE_STYLE,/grid-template-columns:minmax\(0,41fr\)/);
assert.match(TLM_CHURCH_PROFILE_STYLE,/aoTlmProfileSourceDisclosure summary/);
// A photograph belongs to the exact canonical Place; the ministry emblem is
// separate from that photograph and carries no building-wide ecclesial claim.
const approvedCover={place_id:"p-cantius",status:"APPROVED",
 asset_path:"assets/approved/place-media/st-cantius.webp",
 license:"CC0-1.0",license_url:"https://creativecommons.org/publicdomain/zero/1.0/",
 source_url:"https://commons.wikimedia.org/wiki/File:St_Cantius.jpg",
 rights_verified:true,subject_verified:true,crop_reviewed:true,
 derivative_sha256:"a".repeat(64),credit:"Source photographer",alt_en:"Exterior facade",
 alt_fr:"Façade extérieure"};
const withCover={...item,place_id:"p-cantius",cover_media:approvedCover};
const photoHtml=renderTlmChurchProfile(withCover,"en");
assert.match(photoHtml,/aoTlmProfileHero/);
assert.match(photoHtml,/aoTlmProfileCredits/);
assert.match(photoHtml,/aoTlmProfileAffiliation/);
assert.match(photoHtml,/FSSP_emblem/);
assert.match(photoHtml,/Photograph &amp; credit/);
assert.match(photoHtml,/src="assets\/approved\/place-media\/st-cantius.webp"/);
// Do not show a photograph for the same building without an exact Place join.
const mismatched=renderTlmChurchProfile({...withCover,place_id:"different-place"},"en");
assert.doesNotMatch(mismatched,/src="assets\/approved\/place-media\/st-cantius.webp"/);
assert.match(mismatched,/data-visual-kind="emblem"/);


const fr=renderTlmChurchProfile(item,"fr");
for(const phrase of ["Position ecclésiale","Non établi","Programme des messes","Retour à l’aperçu"])
 assert.ok(fr.includes(phrase),phrase);

const exceptionRecord=structuredClone(record);
exceptionRecord.ministries[0].schedules.push({
 schedule_id:"sch-exception",service_type:"MASS",mass_type:"SUNG",
 payload:{raw:"First Sunday 1 PM",liturgical_usage:{family:"ROMAN",books:"2002"}},
 verification:{state:"OFFICIAL_VERIFIED",checked_at:"2026-10-28T10:00:00Z"}
});
const [exceptionItem]=projectDirectoryItems([exceptionRecord],{communities:[{id:"FSSP",abbreviation:"FSSP"}]});
const exceptionalHtml=renderTlmChurchProfile(exceptionItem);
assert.match(exceptionalHtml,/Roman · 2002 · specific celebration/);
assert.match(exceptionalHtml,/First Sunday 1 PM/);
assert.equal(buildTlmChurchProfile(exceptionItem).ministries[0].missal,"1962"); // ministry policy unchanged

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

const previewSource=readFileSync(new URL("../src/find/explore-presentation.js",import.meta.url),"utf8");
const directoryCardSource=readFileSync(new URL("../src/find/directory-card.js",import.meta.url),"utf8");
assert.match(previewSource,/aoTlmPreviewPhotographic/);
assert.match(previewSource,/aoTlmPreviewEmblem/);
assert.match(previewSource,/aoTlmPreviewPhotoCredit/);
assert.match(directoryCardSource,/DIRECTORY_PREVIEW_EDITORIAL_STYLE/);
assert.match(directoryCardSource,/DIRECTORY_VISUAL_FALLBACK_STYLE\+DIRECTORY_PREVIEW_EDITORIAL_STYLE/);

console.log("Expanded TLM church-profile contract: passed");
