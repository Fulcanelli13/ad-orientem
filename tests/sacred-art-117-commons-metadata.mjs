import assert from "node:assert/strict";
import {classifyEvidence,countBatch} from "../tools/calendar/verify-sacred-art-117-commons-metadata.mjs";
const candidate={commonsTitle:"File:Test Painting.jpg",
 filePage:"https://commons.wikimedia.org/wiki/File:Test_Painting.jpg",
 provenanceSha1:"f".repeat(40),licenseClaim:"CC BY-SA 4.0"};
const image={title:"File:Test Painting.jpg",imageinfo:[{url:"https://upload.wikimedia.org/wikipedia/commons/a/aa/Test_Painting.jpg",
 sha1:"f".repeat(40),width:3100,height:2200,mime:"image/jpeg",
 extmetadata:{LicenseShortName:{value:"CC BY-SA 4.0"},
 Source:{value:"Sample institutional collection"},Artist:{value:"Painter"}}}]};
const good=classifyEvidence(candidate,image);
assert.equal(good.status,"METADATA_COHERENT_ONLY");
assert.equal(good.productionEligible,false);
assert.equal(good.originalPhysicalIdentityVerified,false);
assert.equal(good.photoRightsIndependentlyVerified,false);
const prado=classifyEvidence(candidate,{...image,imageinfo:[{...image.imageinfo[0],
 extmetadata:{...image.imageinfo[0].extmetadata,
  Credit:{value:'Museo del Prado image via Commons'}}}]});
assert(prado.issues.includes("PRADO_PROVENANCE_EMBARGO"));
const mismatch=classifyEvidence(candidate,{...image,imageinfo:[{...image.imageinfo[0],
 sha1:"a".repeat(40)}]});
assert(mismatch.issues.includes("COMMONS_SHA1_CHANGED_FROM_DISCOVERY"));
const changedRights=classifyEvidence(candidate,{...image,imageinfo:[{...image.imageinfo[0],
 extmetadata:{LicenseShortName:{value:"CC BY-NC-ND 4.0"}}}]});
assert(changedRights.issues.includes("FILE_LICENSE_NOT_IN_ALLOWED_METADATA_LIST"));
const copy=classifyEvidence(candidate,{...image,imageinfo:[{...image.imageinfo[0],
 extmetadata:{LicenseShortName:{value:"CC BY-SA 4.0"},
  ImageDescription:{value:"engraving after original painting"}}}]});
assert(copy.issues.includes("PRINT_COPY_OR_DIFFERENT_MEDIUM_HOLD"));
assert.equal(classifyEvidence(candidate,null).status,"HOLD_FILE_NOT_RETURNED");
assert.deepEqual(countBatch([{evidence:good},{evidence:prado}]),
 {"METADATA_COHERENT_ONLY":1,"HOLD_METADATA_EXCEPTION":1});
console.log("PASS: 117 Commons candidate metadata screen preserves Prado, provenance, rights and non-promotion gates");
