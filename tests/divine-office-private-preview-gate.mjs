import test from "node:test";
import assert from "node:assert/strict";
import {officePrivateSourceReviewAllowed} from "../src/office/office-private-preview-gate.js";
const local=(hostname,search="?aoOfficeReview=1",protocol="http:")=>({hostname,search,protocol});
test("explicit local-only source preview opens only on loopback with opt-in",()=>{
 for(const host of ["127.0.0.1","localhost","[::1]"])
  assert.equal(officePrivateSourceReviewAllowed(local(host)),true);
 for(const host of ["fulcanelli13.github.io","ad-orientem.vercel.app",
   "github.io","0.0.0.0","localhost.evil.com","127.0.0.1.evil.com"])
  assert.equal(officePrivateSourceReviewAllowed(local(host)),false);
 for(const search of ["","?aoOfficeReview=true","?aoOfficeReview=0",
  "?office=1","?aoOfficeReview=0&aoOfficeReview=1"])
  assert.equal(officePrivateSourceReviewAllowed(local("127.0.0.1",search)),false);
 assert.equal(officePrivateSourceReviewAllowed(local("127.0.0.1","?aoOfficeReview=1","file:")),false);
 assert.equal(officePrivateSourceReviewAllowed(null),false);
});
test("Office research remains unpublished and a bare route never bypasses source gates",async()=>{
 const {officeRouteState}=await import("../src/office/office-route-state.js");
 for(const hour of ["VESPERS","COMPLINE"]){
  const r=officeRouteState({date:"2026-11-28",hour});
  assert.equal(r.readingEnabled,false);
  assert.equal(r.published,false);
 }
});
