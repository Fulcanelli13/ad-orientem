import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 BIBLE_REVIEW_DEFAULT,validateLineageReviewCorpus,lineageSequence,exactAtlasReferenceIndex,
 genesisGenerationRows,renderGenesisAncestryDiagram,apostolicProfile,renderLineageReview
} from "../src/find/bible-lineage-review.js";
import {buildBibleAtlas} from "../src/find/bible-atlas.js";
const data=JSON.parse(readFileSync(new URL("../data/explore/biblical-lineage-curated-review.v1.json",import.meta.url),"utf8"));
assert.equal(validateLineageReviewCorpus(data),true,"the reviewed donor status and expected counts are mandatory");
const compact=JSON.parse(readFileSync(new URL("../data/explore/bible-places-compact.v1.json",import.meta.url),"utf8"));
const atlasStops=buildBibleAtlas(compact.entries);
assert.equal(atlasStops.length,151);
const apostolicMatches=data.events.filter(e=>e.kind==="scripture"&&exactAtlasReferenceIndex(atlasStops,e.reference)!==null);
assert.equal(apostolicMatches.length,11,"only 11 unique exact-reference links are currently supported");
assert.equal(exactAtlasReferenceIndex(atlasStops,"Genesis 1:1–31"),0);
assert.equal(exactAtlasReferenceIndex(atlasStops,"John 19:25–27"),null,"passage-overlap must not imply an exact event link");
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
const apostolic=renderLineageReview(data,{language:"en",surface:"apostles",apostle:"mary",atlasStops});
const philip=renderLineageReview(data,{language:"en",surface:"apostles",apostle:"philip-evangelist"});
assert.match(genesis,/Generation 1/);assert.match(genesis,/data-bible-review-depth/);
assert.match(genesis,/data-bible-kin-diagram/,"reviewed Genesis data must have a real graphical network");
assert.match(genesis,/<svg[^>]+role="group"/,"real SVG family graph");
assert.match(genesis,/aoBibleKinEdge/,"source parentage connectors");
assert.match(genesis,/Accessible source relationship list/,"accessible original edge list remains available");
for(const root of ["adam","noah","abraham","jacob","joseph"]){
 const sourceRows=genesisGenerationRows(data,{root,depth:6});
 const graph=renderGenesisAncestryDiagram(sourceRows,{root,language:"fr"});
 assert.match(graph,/data-bible-kin-diagram/);
 assert.match(graph,/data-bible-kin-zoom="in"/);
 assert.match(graph,/data-bible-kin-zoom="out"/);
 assert.match(graph,/data-bible-kin-zoom="reset"/);
 assert.match(graph,/data-bible-kin-base-width="/);
 assert.match(graph,/data-bible-kin-zoom-value[^>]*>100%</);

 assert.equal((graph.match(/<path d=/g)||[]).length,sourceRows.length,
  "every source-backed family edge must have exactly one visual connector: "+root);
 assert.match(graph,/https:\/\/|https:&amp;/,"original source URLs remain present");
 assert.doesNotMatch(graph,/data-bible-map|lat=|lng=|<canvas/,"genealogy is not an ancient geographic map");
 assert.match(graph,/Généalogie sourcée/);
 const rootCard=graph.match(/<g class="aoBibleKinRoot"[^>]*><rect x="22" y="([0-9.]+)"/);
 assert.ok(rootCard,"the selected ancestor must be rendered as the first column");
 assert.ok(Number(rootCard[1])<=100,
  "the selected ancestor must remain within the initial viewport, not below all descendants");

}
assert.equal(renderGenesisAncestryDiagram([]),"","empty family evidence must not fabricate nodes");

assert.match(math,/legal\/putative/i);assert.match(math,/Joseph/);
assert.match(luc,/Luc 3/);assert.match(luc,/Joseph/);
assert.match(apostolic,/Research preview/);assert.match(apostolic,/Jerusalem Dormition/);assert.match(apostolic,/Competing Ephesus/);
assert.match(apostolic,/data-evidence-kind="later"/);assert.match(apostolic,/data-bible-review-jump="66"/);
assert.doesNotMatch(apostolic,/data-bible-review-jump="0"/);assert.match(apostolic,/data-ao-scripture-context="Luke 1:26/);
assert.match(philip,/Philip the Evangelist/);
for(const html of [genesis,math,luc,apostolic,philip]){
 assert.match(html,/data-bible-review-surface="timeline"/);
 assert.doesNotMatch(html,/data-bible-map|<canvas|data-bible-track/,"no fabricated geometry or alternative timeline");
 assert.match(html,/Research preview|Aperçu de recherche/,"all research views visibly retain publication hold");
}
const invalid=structuredClone(data);invalid.status="PUBLISHED";
assert.equal(validateLineageReviewCorpus(invalid),false,"no silent promotion to live");
assert.match(renderLineageReview(invalid),/evidence is unavailable/);
// Negative cases must not pass merely because all corpus record counts remain 90/41/76/20/55.
const noSource=structuredClone(data);noSource.genealogies.genesis.edges[0].url="javascript:location.href";
assert.equal(validateLineageReviewCorpus(noSource),false,"every rendered family link requires an original HTTPS source");
const circular=structuredClone(data);
circular.genealogies.genesis.edges[0].parentId="seth";
assert.equal(validateLineageReviewCorpus(circular),false,"an ancestor must not become the child of a descendant");
const wrongIdentity=structuredClone(data);
wrongIdentity.genealogies.genesis.edges[1].parent="Noah";
assert.equal(validateLineageReviewCorpus(wrongIdentity),false,
 "A stable Genesis person ID cannot acquire a different person's name");
const sameEdge=structuredClone(data);
sameEdge.genealogies.genesis.edges[1].id=sameEdge.genealogies.genesis.edges[0].id;
assert.equal(validateLineageReviewCorpus(sameEdge),false,"duplicated source-edge identities are refused");
const father=structuredClone(data);
father.genealogies.matthew.nodes.at(-2).type="textual-lineage";
assert.equal(validateLineageReviewCorpus(father),false,"Joseph cannot silently be promoted to a biological father");
const lineSwap=structuredClone(data);
lineSwap.genealogies.luke.nodes[0].reference="Matthew 1:1";
assert.equal(validateLineageReviewCorpus(lineSwap),false,"Gospel lineage source ownership cannot be silently merged");
const itineraries=structuredClone(data);
itineraries.locations[0].certified=true;
assert.equal(validateLineageReviewCorpus(itineraries),false,"research locations are not publication-certified pins");
const strayPerson=structuredClone(data);
strayPerson.events[0].person="philip-vendor-ambiguous";
assert.equal(validateLineageReviewCorpus(strayPerson),false,"every tradition requires an existing curated person identity");
console.log("PASS Biblical review: source, lineage, identity and route holds verified; Genesis 90 sourced edges, two distinct Gospel genealogies, 20 apostles, 55 cited entries, explicit holds, no GPS or publication promotion");
