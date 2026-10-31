import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const base="data/research/did-you-know/";
const read=name=>JSON.parse(readFileSync(base+name,"utf8"));
const selection=read("dyk-r34-high-signal-24-editorial-selection.v1.json");
const original=read("dyk-r21-168-integrated-bilingual-review.v1.json");
const added=read("dyk-r22-21-added-review-cards.v1.json");
const recovered=read("dyk-r33-recover-existing-49-pitre-witnesses-and-close-false-research-queue.v1.json");
const cards=new Map([...original.cards,...added.cards].map(x=>[x.id,x]));
const witnesses=new Map(recovered.records.map(x=>[x.id,x]));
const ids=selection.records.map(x=>x.id);
assert.equal(selection.schema,"AO_DYK_R34_HIGH_SIGNAL_24_REVIEW_SELECTION_V1");
assert.equal(selection.status,"EDITORIAL_SELECTION_NOT_LIVE");
assert.equal(selection.records.length,24);
assert.equal(new Set(ids).size,24,"Distinct review selections only");
assert.equal(selection.counts.all_souls_pilot,7);
assert.equal(selection.counts.published_from_selection,0);
assert.equal(selection.counts.independently_signed_off,0);
assert.equal(selection.counts.original_189_review_count,189);
assert.equal(cards.size,189);
assert.equal(selection.records.filter(x=>x.lane==="all-souls-november-2").length,7);
assert.equal(selection.counts.all_souls_bilingual_pilot_rewrites,7);
assert.equal(selection.pilot_destination_readiness.total,7);
assert.equal(selection.pilot_destination_readiness.without_candidate_in_app_destination,4);
assert.equal(selection.pilot_destination_readiness.declared_research_route_needing_browser_validation,3);
assert.equal(selection.pilot_destination_readiness.exact_in_app_browser_approved,0);

assert.equal(selection.pilot_existing_612_preview_comparison.legacy_preview_count,612);
assert.equal(selection.pilot_existing_612_preview_comparison.final_semantic_editorial_approval,false);
for(const entry of selection.records.filter(x=>x.lane==="all-souls-november-2")){
  const copy=entry.pilot_home_copy;
  const destination=entry.pilot_destination_audit;
  assert.ok(destination,"Missing route audit: "+entry.id);
  assert.equal(destination.exact_in_app_route_verified,false);
  assert.equal(destination.publishable_deep_link,false);
  assert.equal(destination.source_url_browser_verified,false);
  assert.ok(destination.source_level_url?.startsWith("https://"));

  const canon=cards.get(entry.id);
  assert.ok(copy,"Missing hand-edited All Souls copy: "+entry.id);
  for(const lang of ["en","fr"]){
    assert.ok(copy[lang].length>=85&&copy[lang].length<=190,"Fact-length violation: "+entry.id+" "+lang);
    assert.notEqual(copy[lang],canon.statement[lang],"Pilot teaser must be a distinct curiosity rewrite");
  }
  assert.equal(copy.review_status,"PROPOSED_SOURCE_BOUNDED_EDITORIAL_COPY");
  assert.ok(copy.prior_source_review_locator,"Source locator absent: "+entry.id);
  assert.equal(copy.final_english_signoff,false);
  assert.equal(copy.final_french_signoff,false);
  assert.equal(copy.novelty_against_private_612_approved,false);
  assert.equal(copy.exact_destination_browser_verified,false);
  assert.equal(copy.private_preview_exact_collisions,0);
  assert.equal(copy.private_preview_source_id_collisions,0);
  assert.ok(copy.nearest_original_612_token_jaccard<=0.125);
  assert.equal(copy.semantic_novelty_status,"SCREENED_NO_OBVIOUS_DUPLICATE_NOT_INDEPENDENTLY_APPROVED");
}
const candle=selection.records.find(x=>x.id==="DYK-H04-W-B-133")?.pilot_home_copy;
assert.ok(candle?.en.includes("All Saints’ evening")&&candle?.fr.includes("Le soir de la Toussaint"),"Candlemas-candle dusk is on All Saints evening, not dated automatically to Nov 2");
const nights=selection.records.find(x=>x.id==="DYK-UM03-009")?.pilot_home_copy;
assert.match(nights.en,/no official liturgical octave/i,"Folk Soul Nights may not become an official octave");

assert.equal(selection.records.filter(x=>x.source_family==="WEISER_1958").length,15);
assert.equal(selection.records.filter(x=>x.source_family==="PITRE_1900").length,5);
assert.equal(selection.records.filter(x=>x.source_family==="ROMAN_MASS_1962").length,4);
assert.deepEqual(selection.lanes.map(x=>x.selected),[7,6,3,5,3]);
assert.ok(selection.review_gates.some(x=>/semantic novelty/i.test(x)));
assert.ok(selection.review_gates.some(x=>/French/i.test(x)));
for(const selected of selection.records){
  const card=cards.get(selected.id);
  assert.ok(card,"Selection not in original bilingual review: "+selected.id);
  assert.ok(card.statement?.en?.trim()&&card.statement?.fr?.trim(),"Missing bilingual statement: "+selected.id);
  assert.equal(selected.source_id,card.source?.source_id||card.source_id,"Source drift: "+selected.id);
  assert.equal(selected.editorial_approval,false);
  assert.equal(selected.release_authorized,false);
  assert.equal(selected.gate,"SOURCE_BOUND_EDITORIAL_REVIEW_ONLY");
  assert.notEqual(card.gates?.publication_authorized,true,"Unauthorized publication: "+selected.id);
  assert.notEqual(card.approval?.final,true,"Unintended independently approved claim: "+selected.id);
  assert.ok(selected.original_review_pack==="dyk-r21-168-integrated-bilingual-review.v1.json"||
            selected.original_review_pack==="dyk-r22-21-added-review-cards.v1.json");
  if(selected.source_family==="WEISER_1958"){
    assert.equal(card.category,"WEISER_1958");
    assert.equal(card.source?.source_visual_checked,true,"Original source review missing: "+selected.id);
  }else if(selected.source_family==="PITRE_1900"){
    assert.equal(card.category,"PITRE_1900");
    const witness=witnesses.get(selected.id);
    assert.ok(witness,"Original Pitre evidence not recovered: "+selected.id);
    assert.equal(witness.evidence_tier,"PRIOR_1900_FACSIMILE_IMAGE_AND_ITALIAN_ANCHOR_CHECKED");
    assert.equal(witness.final_editorial_approval,false);
  }else{
    assert.ok(["1962_ROMAN_CANON_CEREMONIAL","mass_liturgy"].includes(card.category));
    assert.ok(selected.source_id.startsWith("AO.CANON.R62."),"Roman Canon source action missing: "+selected.id);
  }
}
assert.ok(!ids.includes("DYK-H04-W-B-160"),"The unsupported ship-mast claim must remain excluded");
console.log("PASS R34: 24 distinct source-backed EN/FR discoveries, 7 All Souls priorities, existing research reused, 0 published");
