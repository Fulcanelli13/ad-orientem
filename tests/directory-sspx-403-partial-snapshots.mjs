import assert from "node:assert/strict";
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import path from "node:path";
import {recordSspx403Hold} from "../tools/directory/import-sspx.mjs";
import {validateRuntimeSnapshots} from "../tools/directory/validate-runtime-snapshots.mjs";

const root=mkdtempSync(path.join(tmpdir(),"ao-directory-source-hold-"));
const logs=[];
const logger={log:s=>logs.push(s),warn:s=>logs.push(s),error:s=>logs.push(s)};
function write(provider,file,data){
  const folder=path.join(root,provider);
  mkdirSync(folder,{recursive:true});
  writeFileSync(path.join(folder,file),JSON.stringify(data,null,2)+"\n");
}
function seed(provider,minimum){
  const records=Array.from({length:minimum},(_,i)=>({
    venue_id:provider+"-"+i,address:{country_code:"FR"},
    name:{official:provider+" Site "+i},
  }));
  write(provider,"import-report.v1.json",{venue_count:records.length});
  write(provider,"validation-issues.v1.json",{issues:[]});
  write(provider,"venues.v1.json",{records});
}
try{
  for(const [provider,minimum] of Object.entries({fssp:400,icksp:25,ibp:34}))seed(provider,minimum);
  const first=await recordSspx403Hold({out:path.join(root,"sspx")});
  assert.equal(first.schema,"AO_DIRECTORY_SOURCE_AVAILABILITY_HOLD_V1");
  assert.equal(first.status,"UNAVAILABLE_UPSTREAM_403");
  assert.equal(first.publishable,false);
  assert.equal(first.acquired_records,0);
  assert.deepEqual(first.attempted_paths,["DIRECT_OFFICIAL_API","OFFICIAL_SITE_BROWSER_SESSION"]);
  const partial=validateRuntimeSnapshots({generatedRoot:root,logger});
  assert.equal(partial.ok,true);
  assert.equal(partial.partial,true);
  assert.equal(partial.outcomes.sspx,"HELD_403");
  assert.ok(logs.some(x=>x.includes("PARTIAL")));
  assert.ok(logs.some(x=>x.includes("Zero SSPX records published")));

  // Contradictory / forged 403 metadata cannot conceal a broken source.
  const holdPath=path.join(root,"sspx","source-unavailable.v1.json");
  write("sspx","source-unavailable.v1.json",{...first,upstream_status:500});
  assert.equal(validateRuntimeSnapshots({generatedRoot:root,logger}).ok,false);
  write("sspx","source-unavailable.v1.json",first);
  seed("sspx",120);
  assert.equal(validateRuntimeSnapshots({generatedRoot:root,logger}).ok,false,
    "A stale SSPX snapshot alongside a 403 marker must fail closed");
  await assert.rejects(recordSspx403Hold({out:path.join(root,"sspx")}),
    /STALE_PUBLISHED_SNAPSHOT/);

  // Complete four-source quality is still the preferred state.
  rmSync(holdPath);
  const complete=validateRuntimeSnapshots({generatedRoot:root,logger});
  assert.equal(complete.ok,true);
  assert.equal(complete.partial,false);
  assert.equal(complete.outcomes.sspx,"PASS");

  // SSPX absence with no exact hold must fail, never become a zero-record PASS.
  rmSync(path.join(root,"sspx","import-report.v1.json"));
  assert.equal(validateRuntimeSnapshots({generatedRoot:root,logger}).ok,false);
  // Other providers never qualify for this SSPX-specific exception.
  write("fssp","validation-issues.v1.json",{issues:[{code:"UNKNOWN_LOCATION"}]});
  assert.equal(validateRuntimeSnapshots({generatedRoot:root,logger}).ok,false);
  console.log("PASS Directory SSPX 403: explicit nonpublishable hold, strict other-source quality, stale-snapshot and malformed-marker rejection");
}finally{
  rmSync(root,{recursive:true,force:true});
}
