#!/usr/bin/env node
// Read-only B38 object-identity/rights lead validation. No image fetch, no publication.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const j=JSON.parse(fs.readFileSync('data/research/sacred-art-b38-27-gap-identity-rights-leads.json','utf8'));
assert.equal(j.schema,'AO_B38_27_GAP_EARLY_OBJECT_IDENTITY_SOURCE_EVIDENCE_V1');
assert.equal(j.active_artworks,383);
assert.equal(j.B37_some_source,357);
assert.equal(j.B37_complete_object_source,356);
assert.equal(j.remaining_complete_object_gaps,27);
assert.equal(j.B38_cases_screened_against_earlier_master,27);
assert.equal(j.cases.length,27);
assert.equal(new Set(j.cases.map(r=>r.artwork_id)).size,27);
assert.equal(j.cases.filter(r=>r.B38_new_evidence).length,9);
assert.equal(j.cases.filter(r=>r.B37_state==='UNDERLYING_ARTIST_RIGHTS_HOLD').length,2);
assert.equal(j.B38_source_files_downloaded,1);
assert.equal(j.B38_original_bytes_archived,56200164);
assert.equal(j.B38_source_files_with_remote_SHA_archive,1);
assert.equal(j.B38_verified_archive_run_id,40082818225);

assert.equal(j.publication_approvals,0);
assert.equal(j.editorial_approvals,0);
assert.equal(j.master_mutated,false);
assert.equal(j.financial_policy,'STRICTLY_ZERO_EURO');
for(const r of j.cases){
 assert.equal(r.B38_preserved_image_binary,r.artwork_id==='ART-eter-aul-ubens-he-oly-rinity',r.artwork_id);
 assert.equal(r.B38_remote_sha256_verified,r.artwork_id==='ART-eter-aul-ubens-he-oly-rinity',r.artwork_id);
 assert.equal(r.B38_complete_object_coverage_promoted,false,r.artwork_id);
 assert.equal(r.B38_editorial_approved,false,r.artwork_id);
 assert.equal(r.B38_publication_rights_approved,false,r.artwork_id);
}
const trinity=j.cases.find(r=>r.artwork_id==='ART-eter-aul-ubens-he-oly-rinity');
assert.equal(trinity.B38_new_evidence.candidate.inventory,'314');
assert.equal(trinity.B38_new_evidence.candidate.downloaded,true);
assert.equal(trinity.B38_new_evidence.candidate.sha256,'cd3477e583cf55ca2bd651aad191b916ec84a4af73b3ed36dc7e4e48b9c0ef38');
const correa=j.cases.find(r=>r.artwork_id.startsWith('ART-uan-orrea'));
assert.equal(correa.B38_new_evidence.candidate.missing_face,'San Hilario ermitaño');
const family=j.cases.find(r=>r.artwork_id==='ART-eter-aul-ubens-oly-amily-with-aint-nne');
assert.equal(family.B38_new_evidence.candidates.length,2);
console.log('B38_EVIDENCE_PASS 27 stable gap IDs, 9 external identity findings, one remote-SHA-preserved source candidate and zero curatorial, copyright, editorial, security or publication promotions');
