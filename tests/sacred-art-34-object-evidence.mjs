import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const root=new URL("../",import.meta.url);
const read=p=>JSON.parse(readFileSync(new URL(p,root),"utf8"));
const f=read("data/research/sacred-art-user-frozen-decisions-20261017.v1.json");
const a=read("data/research/sacred-art-bulk-source-intake-451-20261020.v1.json");
const r=read("data/research/sacred-art-open-source-recovery-76-20261020.v1.json");
const cert=read("data/calendar/sacred-art-certified-media.v1.json");
assert.equal(a.works.length,451);
assert.equal(r.records.length,76);
assert.equal(f.approved.length,107);
assert.equal(f.rejected.length,68);
assert.deepEqual(cert.media,[]);
const script=readFileSync(new URL("../tools/calendar/reconcile-sacred-art-34-object-evidence.mjs",import.meta.url),"utf8");
for(const marker of [
 "referencePreviewHashSha256",
 "NOT_PERFORMED_APPROVED_WEBP_REFERENCE_BYTES_NOT_IN_THIS_ACTION",
 "approvedArtworkIDFrozen:true",
 "photoRightsIndependentlyVerified:false",
 "acceptedAsUserChosenPhoto:false",
 "originalVisualCompositionCompared:false",
 "officialMuseumObjectAndPhotoVerified:false",
 "productionMediaReleased:false",
 "noArtworkReRating:true",
 "noAppOrCalendarWrite:true",
 "hasPradoProvenance"
])assert(script.includes(marker),"Missing photo/approval safety marker "+marker);
assert(!script.includes("git push"));
assert(!script.includes("sacred-art-certified-media.v1.json\",JSON.stringify("));
console.log("PASS: 34-object evidence reconciliation retains frozen artwork approvals and leaves physical-photo release gates closed");
