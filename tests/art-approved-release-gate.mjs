import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {APPROVED_SACRED_ARTWORKS,isApprovedSacredArt,selectApprovedSacredArt,renderApprovedSacredArt} from "../src/art/approved-sacred-art.js";
assert.deepEqual(APPROVED_SACRED_ARTWORKS,[],"No artwork may auto-ship from source research");
const id="sancti:03-25:1:w";
const valid={id:"met-438724",title:"The Annunciation",artist:"Philippe de Champaigne",
 observedPrincipalIds:[id],assetPath:"assets/sacred-art/met-438724.webp",
 originalSha256:"a".repeat(64),publishedSha256:"b".repeat(64),
 approvedForProduction:true,curatorApproved:true,mobileCropApproved:true,
 rightsCleared:true,sourceRights:"CC0",focalX:50,focalY:38,
 association:"EXACT_SUBJECT",width:720,height:960};
assert.equal(selectApprovedSacredArt(id),null,"Empty shipping catalogue must have no painted hero");
assert.equal(renderApprovedSacredArt({observedId:id}),"","Never render unapproved source assets");
assert.equal(isApprovedSacredArt(valid),true);
assert.equal(selectApprovedSacredArt(id,[valid]),valid);
const html=renderApprovedSacredArt({observedId:id,works:[valid]});
assert.match(html,/assets\/sacred-art\/met-438724\.webp/);
assert.match(html,/data-ao-approved-art="met-438724"/);
assert.match(html,/alt="The Annunciation"/);
assert.equal(renderApprovedSacredArt({observedId:"sancti:04-01:3:w",works:[valid]}),"","Observed ID must match exactly");
for(const bad of [
 {approvedForProduction:false},{curatorApproved:false},{mobileCropApproved:false},
 {rightsCleared:false},{sourceRights:"PUBLIC_DOMAIN_PD_ART_PDM"},
 {assetPath:"https://attacker.example/picture.jpg"},{assetPath:"assets/sacred-art/../x.webp"},
 {originalSha256:"bad"},{publishedSha256:""},{focalX:101},
 {observedPrincipalIds:["sancti:04-01:3:w"],association:"WRONG"}]){
 const mutated={...valid,...bad};
 assert.equal(isApprovedSacredArt(mutated),false,JSON.stringify(bad));
}
const malicious={...valid,title:'<img src=x onerror="alert(1)">',artist:"<script>alert(2)</script>"};
const safe=renderApprovedSacredArt({observedId:id,works:[malicious]});
assert.ok(!safe.includes('<script>')&&!safe.includes('onerror="alert(1)"'));
const home=readFileSync("src/home/presentation.js","utf8");
const cal=readFileSync("src/calendar/calendar-runtime.js","utf8");
assert.ok(home.includes("renderApprovedSacredArt({observedId:state.resolution?.day?.main?.id"));
assert.ok(cal.includes("renderApprovedSacredArt({observedId:r?.day?.main?.id"));
console.log("Approved art release gate: PASS (research-only artworks remain excluded)");
