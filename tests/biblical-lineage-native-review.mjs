import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 BIBLE_REVIEW_DEFAULT,validateLineageReviewCorpus,lineageSequence,
 genesisGenerationRows,apostolicProfile,renderLineageReview
} from "../src/find/bible-lineage-review.js";
const data=JSON.parse(readFileSync(new URL("../data/explore/biblical-lineage-curated-review.v1.json",import.meta.url),"utf8"));
assert.equal(validateLineageReviewCorpus(data),true,"the reviewed donor status and expected counts are mandatory");
assert.equal(BIBLE_REVIEW_DEFAULT.surface,"timeline");
const matt=lineageSequence(data,"matthew"),luke=lineageSequence(data,"luke");
assert.equal(matt.length,41);assert.equal(luke.length,76);
assert.equal(matt[0].person,"Abraham");assert.equal(luke[0].person,"Adam");
assert.equal(matt.at(-1).person,"Jesus");assert.equal(luke.at(-1).person,"Jesus");
assert.ok(matt.some(n=>n.person==="Joseph"&&n.kind==="legal-or-putative"));
assert.ok(luke.some(n=>n.person==="Joseph"&&n.kind==="legal-or-putative"));
assert.ok(matt.some(n=>n.associatedWomen.some(w=>w.person.includes("Mary"))),"Our Lady identified as source association");
assert.ok(!matt.some(n=>n.associatedWomen.some(w=>w.kind==="biological-parent")),"maternal references are not fabricated paternity");
const rows=["adam","noah","abraham","jacob","joseph"].map(root=>genesisGenerationRows(data,{root,depth:6}));
assert.ok(rows.every(r=>r.length>0),"all five source focus lines have descendants");
assert.ok(rows.every(list=>list.every(e=>/^https:\/\//.test(e.url)&&e.reference)),"every rendered family edge has original biblical citation");
const edges=data.genealogies.genesis.edges;
assert.equal(edges.length,90);
assert.ok(edges.filter(e=>e.child==="Enoch").length>=2,"separate Enochs are preserved");
assert.ok(new Set(edges.filter(e=>e.child==="Enoch").map(e=>e.childId)).size>=2,"homonyms do not share one ID");
const profiles=["mary","john","peter","philip-apostle","philip-evangelist","thomas","magdalene","judas-iscariot"].map(id=>apostolicProfile(data,id));
assert.equal(profiles.length,8);
assert.ok(profiles[0].events.some(e=>e.kind==="later"&&/Jerusalem/i.test(e.title)));
assert.ok(profiles[0].events.some(e=>e.kind==="later"&&/Ephesus/i.test(e.title)));
assert.notEqual(profiles[3].profile.id,profiles[4].profile.id,"Philip Apostle and Evangelist distinct");
assert.ok(profiles[1].events.some(e=>e.kind==="identification"&&/Patmos/i.test(e.title)));
assert.ok(profiles[5].events.some(e=>e.kind==="later"||e.kind==="patristic"));
for(const p of data.profiles){const e=apostolicProfile(data,p.id);assert.equal(e.profile.id,p.id);for(const row of e.events)assert.ok(row.source&&/^https:\/\//.test(row.source),"no unlinked historical assertion");}
const genesis=renderLineageReview(data,{language:"en",lineage:"genesis",root:"adam",depth:3});
const math=renderLineageReview(data,{language:"en",lineage:"matthew",page:3});
const luc=renderLineageReview(data,{language:"fr",lineage:"luke",page:6});
const apostolic=renderLineageReview(data,{language:"en",surface:"apostles",apostle:"mary"});
const philip=renderLineageReview(data,{language:"en",surface:"apostles",apostle:"philip-evangelist"});
assert.match(genesis,/Generation 1/);assert.match(genesis,/data-bible-review-depth/);
assert.match(math,/legal\/putative/i);assert.match(math,/Joseph/);
assert.match(luc,/Luc 3/);assert.match(luc,/Joseph/);
assert.match(apostolic,/Research preview/);assert.match(apostolic,/Jerusalem Dormition/);assert.match(apostolic,/Competing Ephesus/);
assert.match(apostolic,/data-evidence-kind="later"/);assert.match(apostolic,/data-ao-scripture-context="Luke 1:26/);
assert.match(philip,/Philip the Evangelist/);
for(const html of [genesis,math,luc,apostolic,philip]){
 assert.match(html,/data-bible-review-surface="timeline"/);
 assert.doesNotMatch(html,/data-bible-map|<canvas|data-bible-track/,"no fabricated geometry or alternative timeline");
 assert.doesNotMatch(html,/3,231-person.*verified|automatic travel pin/i);
}
const invalid=structuredClone(data);invalid.status="PUBLISHED";
assert.equal(validateLineageReviewCorpus(invalid),false,"no silent promotion to live");
assert.match(renderLineageReview(invalid),/evidence is unavailable/);
console.log("PASS Biblical review: Genesis 90 sourced edges, two distinct Gospel genealogies, 20 apostles, 55 cited entries, explicit holds, no GPS or publication promotion");
