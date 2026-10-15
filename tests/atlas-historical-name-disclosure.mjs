import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildBibleAtlas,atlasDetail,renderBibleAtlasToString,ATLAS_GEO,ATLAS_SETTLEMENT_LABELS} from "../src/find/bible-atlas.js";
import {ATLAS_HISTORY_REVIEW_NOTES,atlasHistoricalNameReview} from "../src/find/bible-atlas-history-review.js";
const load=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const corpus=JSON.parse(load("data/explore/bible-places-compact.v1.json"));
const proposals=JSON.parse(load("data/explore/biblical-atlas-contextual-name-proposals.research.v1.json"));
const stops=buildBibleAtlas(corpus.entries);
const sources=proposals.records.filter(x=>x.decision==="PROPOSE_CONTEXT_NOTE_NOT_MAP_RELABEL");
assert.equal(stops.length,151);
assert.equal(Object.keys(ATLAS_SETTLEMENT_LABELS).length,22);
assert.equal(sources.length,11);
assert.equal(ATLAS_HISTORY_REVIEW_NOTES.length,11);
assert.equal(new Set(ATLAS_HISTORY_REVIEW_NOTES.map(x=>x.key)).size,11);
assert.deepEqual(new Set(sources.map(x=>x.anchorKey)),new Set(ATLAS_HISTORY_REVIEW_NOTES.map(x=>x.key)));
for(const source of sources){
 const note=ATLAS_HISTORY_REVIEW_NOTES.find(x=>x.key===source.anchorKey);
 assert.ok(note);
 assert.equal(note.era,source.narrativeEra);
 assert.equal(note.en,source.contextNote.en);
 assert.equal(note.fr,source.contextNote.fr);
 assert.equal(note.pleiades,source.secondaryNameSourceURI);
 assert.deepEqual(note.sources,source.independentEvidenceURLs.slice(0,2));
 assert.equal(source.editorialState,"HOLD_REVIEW_ONLY");
 const eligible=stops.find(s=>s.geo?.key===note.key&&s.era===note.era);
 assert.ok(eligible,"No matching canonical 151-event scope for "+note.key+"/"+note.era);
 const english=atlasDetail(eligible,"en",{historicalPreview:true});
 const french=atlasDetail(eligible,"fr",{historicalPreview:true});
 assert.match(english,new RegExp('data-bible-history-note="'+note.key+'"'));
 assert.match(french,new RegExp('data-bible-history-note="'+note.key+'"'));
 assert.ok(english.includes(note.en.replace(/&/g,"&amp;").replace(/</g,"&lt;")));
 assert.ok(french.includes(note.fr.replace(/&/g,"&amp;").replace(/</g,"&lt;")));
 assert.ok(english.includes("Historical name"));
 assert.ok(french.includes("Nom historique"));
 assert.ok(english.includes('data-ao-scripture-context="'+eligible.reference+'"'));
 assert.ok(english.includes('rel="noopener noreferrer"'));
 assert.ok(english.includes('href="'+note.pleiades+'"'));
 assert.doesNotMatch(atlasDetail(eligible,"en"),/data-bible-history-note/);
 const cinema=renderBibleAtlasToString({atlasStops:stops,atlasIndex:eligible.index,language:"fr",cinematicPreview:true,historicalPreview:true,cinemaSheetExpanded:true});
 assert.match(cinema,/data-bible-history-note/);
 assert.equal((cinema.match(/ data-bible-step="/g)||[]).length,151);
 assert.equal((cinema.match(/data-bible-map/g)||[]).length,1);
 assert.doesNotMatch(renderBibleAtlasToString({atlasStops:stops,atlasIndex:eligible.index,language:"en",cinematicPreview:true,historicalPreview:false}),/data-bible-history-note/);
 assert.doesNotMatch(renderBibleAtlasToString({atlasStops:stops,atlasIndex:eligible.index,language:"en",historicalPreview:true}),/data-bible-history-note/);
}
for(const proposal of proposals.records.filter(x=>x.decision==="SUPPRESS_REDUNDANT_NOTE")){
 for(const s of stops.filter(x=>x.geo?.key===proposal.anchorKey))assert.equal(atlasHistoricalNameReview(s,"en"),"");
}
for(const s of stops){
 assert.ok(s.eventKey);
 const note=atlasHistoricalNameReview(s,"en");
 if(note)assert.ok(sources.some(x=>x.anchorKey===s.geo?.key&&x.narrativeEra===s.era));
}
const exception=stops.find(s=>s.era==="ORIGINS");
assert.equal(atlasHistoricalNameReview(exception,"fr"),"");
assert.ok(stops.every(s=>!s.geo||Object.values(ATLAS_GEO).some(g=>g.key===s.geo.key&&g.lat===s.geo.lat&&g.lng===s.geo.lng)));
const precise={
 joppa:{en:"Latin Vulgate reads Ioppe",fr:"Vulgate latine écrit Ioppe",url:"https://jerihna.sourceschretiennes.org/en/bible-names/forms/17205"},
 nineveh:{en:"as Ninua",fr:"en Ninua",url:"https://oracc.museum.upenn.edu/atae/cbd/qpn/x000001080.html"},
 babylon:{en:"Bābili is an attested",fr:"Bābili est une forme",url:"https://oracc.museum.upenn.edu/cmawro/cmawr3/cbd/qpn/x000000100.html"},
 philippi:{en:"in 356 BC",fr:"en 356 av. J.-C.",url:"https://whc.unesco.org/en/list/1517"}
};
for(const [key,expect] of Object.entries(precise)){
 const source=proposals.records.find(x=>x.anchorKey===key);
 const note=ATLAS_HISTORY_REVIEW_NOTES.find(x=>x.key===key);
 assert.ok(source&&note);
 assert.equal(source.claimSourceReview?.doesNotAssignEventDate,true);
 assert.equal(source.claimSourceReview?.noPublicationApproval,true);
 assert.ok(note.en.includes(expect.en),"Exact historical wording missing: "+key);
 assert.ok(note.fr.includes(expect.fr),"Exact French wording missing: "+key);
 assert.ok(note.sources.includes(expect.url),"Original source citation must match source review: "+key);
}
assert.equal(proposals.reviewUpdate?.userVisibleMapChanges,0);
assert.equal(proposals.reviewUpdate?.editorialHoldStillRequired,true);
console.log("PASS 11 source-exact EN/FR historical notes, 11 suppressed, 151 canonical events, unchanged default & cinematic-only");
