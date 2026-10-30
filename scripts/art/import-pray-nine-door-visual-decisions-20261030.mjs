#!/usr/bin/env node
/** Import user visual choices. This script NEVER promotes photographs to publication. */
import {readFileSync,writeFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname,resolve} from "node:path";
import assert from "node:assert/strict";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"../..");
const html=readFileSync(resolve(root,"assets/editorial/prayer-nine-door-artwork-one-click-20261030.html"),"utf8");
const match=html.match(/const data=(\[[^\n]+\]);\nconst groups=/);
assert.ok(match,"Missing pinned twenty-five-card review dataset");
const cards=JSON.parse(match[1]),index=new Map(cards.map(x=>[x.slot+"::"+x.id,x]));
assert.equal(index.size,25);
if(!process.argv[2]){console.error("Usage: node scripts/art/import-pray-nine-door-visual-decisions-20261030.mjs input.json [output.json]");process.exit(2)}
const submitted=JSON.parse(readFileSync(resolve(process.argv[2]),"utf8"));
assert.equal(submitted.schema,"AO_PRAY_NINE_DOOR_VISUAL_DECISIONS_V1");
assert.ok(Array.isArray(submitted.decisions));
assert.equal(submitted.decisions.length,25,"Complete 25-card export required");
const result={
 schema:"AO_PRAY_NINE_DOOR_RECONCILED_QUEUES_V1",
 generatedAt:new Date().toISOString(),source:"PR #2067 · 2026-10-30",
 productionMutation:false,counts:{total:25,visualApproved:0,research:0,publicationReady:0},
 queues:{ready_for_publication:[],visually_approved_pending_exact_rights_photo_qa_and_crop:[],further_artwork_or_photograph_research:[]}
};
const seen=new Set();
for(const row of submitted.decisions){
 const key=row.slotId+"::"+row.artworkId,c=index.get(key);
 assert.ok(c,"Unknown candidate "+key);
 assert.ok(!seen.has(key),"Duplicate candidate "+key);seen.add(key);
 assert.ok(["RESEARCH","VISUAL_APPROVED"].includes(row.decision),"Invalid action "+key);
 assert.equal(row.productionApproved,false,"Browser export cannot certify production");
 assert.equal(row.rightsFinalCleared,false,"Browser export cannot certify rights");
 assert.equal(row.photoQualityFinalCleared,false,"Browser export cannot certify native photo");
 if(row.decision==="VISUAL_APPROVED")assert.equal(row.imageShown,true,"Cannot approve broken/unseen picture "+key);
 const record={slotId:c.slot,artworkId:c.id,title:c.title,artist:c.artist,
  visualChoice:row.decision,confirmedDistinct:row.distinct===true,reviewedAt:row.chosenAt||null,
  previewImage:c.image,archivedOriginal:c.archived,originalSha256:c.sha,sourcePage:c.source,
  rightsEvidence:c.photoRights,photoVisualEvidence:c.photoQA,
  remainingReleaseGates:["EXACT_OBJECT_AND_IMAGE_IDENTITY","ACTUAL_FILE_RIGHTS","NATIVE_IMAGE_PRISTINE",
    "NO_FRAME_OR_GALLERY_SURROUND","PAINTING_BOUNDS","RESPONSIVE_CROP_AND_APP_RENDER"],
  publicationApproved:false};
 if(row.decision==="VISUAL_APPROVED"){
  result.queues.visually_approved_pending_exact_rights_photo_qa_and_crop.push(record);result.counts.visualApproved++;
 }else{
  result.queues.further_artwork_or_photograph_research.push(record);result.counts.research++;
 }
}
assert.equal(seen.size,25);
assert.equal(result.counts.visualApproved+result.counts.research,25);
assert.equal(result.queues.ready_for_publication.length,0);
const json=JSON.stringify(result,null,2)+"\n";
if(process.argv[3]){writeFileSync(resolve(process.argv[3]),json);console.log(JSON.stringify(result.counts))}
else process.stdout.write(json);
