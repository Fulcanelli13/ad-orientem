import assert from "node:assert/strict";
import {mkdtempSync,readFileSync,rmSync,existsSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {
  parseDiciIndexPage,acquireDiciDevelopmentIndex,DICI_DEV_ORIGIN,
} from "../tools/directory/acquire-sspx-dici-dev.mjs";
const id=n=>"00000000-0000-4000-8000-"+String(n).padStart(12,"0");
const row=n=>({
  href:DICI_DEV_ORIGIN+"/operations/"+id(n),
  name:"Official listing "+n,context:"Chapel District of Africa",
});
const sample=(n)=>({
  text:"Operations — 25 of 27 operations — Page "+n+" of 2",
  links:(n===1?Array.from({length:25},(_,i)=>row(i+1)):[row(26),row(27)]).concat([
    {href:"https://example.invalid/operations/"+id(200),name:"External mirror"},
    {href:DICI_DEV_ORIGIN+"/not-a-place/"+id(300),name:"Not a listing"},
  ]),
});
const p=parseDiciIndexPage({...sample(1),pageNumber:1,pageUrl:DICI_DEV_ORIGIN+"/directory?page=1"});
assert.equal(p.total,27);
assert.equal(p.records.length,25);
assert.equal(p.records[0].provenance_tier,"RESEARCH_ONLY_NOT_PUBLISHABLE");
assert.throws(()=>parseDiciIndexPage({...sample(1),links:[row(1)],
  pageNumber:1,pageUrl:"page-1"}),/page 1 incomplete/);
assert.throws(()=>parseDiciIndexPage({...sample(1),pageNumber:2,pageUrl:"page-2"}),/wrong page/);
const out=mkdtempSync(join(tmpdir(),"dici-dev-discovery-"));
try{
  const result=await acquireDiciDevelopmentIndex({
    out,fetchPage:async(_url,n)=>sample(n),
  });
  assert.equal(result.source_records,27);
  assert.equal(result.reported_total,27);
  assert.equal(result.expected_pages,2);
  assert.equal(result.release_eligible,false);
  assert.equal(result.confirmed_current_public_mass_venues,0);
  const saved=JSON.parse(readFileSync(join(out,"dici-dev-discovery.v1.json"),"utf8"));
  assert.equal(saved.records.length,27);
  assert.equal(saved.release_eligible,false);
  assert.equal(existsSync(join(out,"venues.v1.json")),false);
  assert.equal(existsSync(join(out,"schedules.v1.json")),false);
  await assert.rejects(
    acquireDiciDevelopmentIndex({out:join(out,"conflicting"),fetchPage:async(_url,n)=>
      n===1?sample(1):{...sample(2),links:[row(1),row(27)]}}),
    /duplicate operation across pages/,
  );
  await assert.rejects(
    acquireDiciDevelopmentIndex({out:join(out,"drifting"),fetchPage:async(_url,n)=>
      n===1?sample(1):{...sample(2),text:"25 of 28 operations — Page 2 of 2"}}),
    /count changed|page 2 incomplete/,
    // The page-local incomplete count is sufficient evidence to fail closed
    // before the later cross-page total comparison.

  );
}finally{rmSync(out,{recursive:true,force:true});}
console.log("SSPX DICI development source discovery: PASS");
