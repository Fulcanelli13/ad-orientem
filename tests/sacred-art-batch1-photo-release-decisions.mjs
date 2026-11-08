import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {validateBatch1PhotoDecisions as validate} from "../scripts/art/validate-batch1-photo-decisions.mjs";
const contract=JSON.parse(readFileSync(new URL("../data/artwork/batch1-photo-release-decision-contract.v1.json",import.meta.url),"utf8"));
const ready=JSON.parse(readFileSync(new URL("../data/artwork/batch1-nine-artwork-photo-readiness-v1.json",import.meta.url),"utf8"));
assert.equal(contract.totals.artworks,9);
assert.equal(contract.totals.existing_prayer_placements,41);
assert.equal(contract.totals.photo_editions,12);
assert.equal(contract.totals.photo_editions_eligible_for_publication_qa_request,3);
assert.equal(contract.totals.already_published_gallery_photos_unmodified,16);
assert.equal(contract.work_items.reduce((a,w)=>a+w.prayer_placements,0),41);
assert.equal(contract.work_items.reduce((a,w)=>a+w.options.length,0),12);
assert.equal(contract.work_items.flatMap(w=>w.options).filter(p=>p.eligible_for_publication_qa_request).length,3);
assert.equal(ready.totals.new_photo_publications,0);
const form={schema:contract.input_schema,no_automatic_app_publication:true,decisions:[]};
assert.equal(validate(form).eligible_qa_requests.length,0);
const f=(id,photo,decision="approve")=>{
 const w=contract.work_items.find(w=>w.artwork_id===id);
 const p=w.options.find(p=>p.photo_id===photo);
 return {artwork_id:id,artwork_title:"Reviewer-selected photo",prayer_placements:w.prayer_placements,
 photo_id:photo,photo_source_sha256:p.source_sha256,decision,
 credit_and_license_acknowledged:true,display_edition_acknowledged:true,
 technical_rights_gate:p.rights_state,publication_qa_requested:decision==="approve",
 actual_publication_authorized:false};
};
const two={...form,decisions:[
 f("artwork-pending:01","cma-official-fullframe"),
 f("artwork-pending:02","met-official-fullframe"),
 f("artwork-pending:07","ghent-yorck-project","select"),
 f("artwork-pending:09","lanfranco-sailko-frameless")
]};
const valid=validate(two);
assert.equal(valid.eligible_qa_requests.length,3);
assert.equal(valid.selections_not_release_ready.length,1);
assert.equal(valid.selections_not_release_ready[0].requires_rights_review,true);
assert.equal(valid.public_gallery_modifications,0);
assert.equal(valid.publication_authorized,false);
assert.throws(()=>validate({...form,decisions:[f("artwork-pending:06","crivelli-commons")]}),/rights\/quality-held photo/);
assert.throws(()=>validate({...form,decisions:[{...f("artwork-pending:01","cma-official-fullframe"),photo_source_sha256:"000"}]}),/SHA-256 mismatch/);
assert.throws(()=>validate({...form,decisions:[{...f("artwork-pending:01","cma-official-fullframe"),display_edition_acknowledged:false}]}),/explicitly acknowledged/);
assert.throws(()=>validate({...form,decisions:[{...f("artwork-pending:01","cma-official-fullframe"),actual_publication_authorized:true}]}),/cannot be authorized/);
assert.throws(()=>validate({...form,decisions:[f("artwork-pending:01","cma-official-fullframe"),f("artwork-pending:01","cma-official-fullframe")]}),/duplicate artwork/);
assert.throws(()=>validate({...form,no_automatic_app_publication:false}),/must be true/);
assert.throws(()=>validate({...form,decisions:[{...f("artwork-pending:09","lanfranco-wga-existing","hold"),publication_qa_requested:true}]}),/non-approved photo/);
console.log("PASS photo decision contract: nine paintings, 12 versions, three QA-eligible; forged, blocked and automatic-publication decisions rejected.");
