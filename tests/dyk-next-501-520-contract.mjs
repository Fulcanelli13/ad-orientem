// Research-only next-tranche contract, not H7 publication.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const p="data/research/did-you-know/";
const batch=JSON.parse(readFileSync(p+"dyk-next-501-520-bilingual-source-checked-drafts.v1.json","utf8"));
const previous=JSON.parse(readFileSync(p+"dyk-500-composed-research-master-index.v1.json","utf8"));
assert.equal(batch.facts.length,20);
assert.equal(batch.sequence_from,501);
assert.equal(batch.sequence_to,520);
assert.equal(previous.rows.length,500);
assert.equal(batch.status,"RESEARCH_ONLY_NOT_MERGED_INTO_500_MASTER");
const oldSources=new Set(previous.rows.flatMap(x=>x.source_ids));
const ids=new Set(),sources=new Set(),en=new Set(),fr=new Set();
const norm=s=>s.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
for(const [i,x] of batch.facts.entries()){
 assert.equal(x.id,"DYK-G520-W-"+String(i+1).padStart(3,"0"));
 assert.ok(!ids.has(x.id));ids.add(x.id);
 assert.ok(!sources.has(x.source_id)&&!oldSources.has(x.source_id));sources.add(x.source_id);
 assert.ok(x.statement.en.length>60&&x.statement.fr.length>60);
 assert.ok(!en.has(norm(x.statement.en))&&!fr.has(norm(x.statement.fr)));
 en.add(norm(x.statement.en));fr.add(norm(x.statement.fr));
 assert.ok(x.source.original_folio_image_visually_screened===true);
 assert.ok(x.source.printed_pages.length>0);
 for(const page of x.source.printed_pages)assert.ok(Number.isInteger(page)&&page>0);
 assert.equal(x.source.witness,"https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf");
 assert.equal(x.scope.never_universal_1962_rite_by_inference,true);
 assert.equal(x.review.publication_authorized,false);
 assert.equal(x.review.english_editorial_final,false);
 assert.equal(x.review.french_editorial_final,false);
}
assert.equal(sources.size,20);
assert.equal(batch.quality.release_authorized,false);
assert.equal(batch.crossbank_screen.exact_id_or_source_english_french_collisions,0);
assert.equal(batch.crossbank_screen.token_similarity_jaccard_at_least_0_25,0);
assert.equal(batch.crossbank_screen.internal_20_token_similarity_at_least_0_25,0);
assert.equal(batch.crossbank_screen.publication_authorized,false);
console.log("PASS DYK 501-520 source-checked research: 20 EN/FR facts, original folios, zero exact/25% lexical overlaps, no publication");
