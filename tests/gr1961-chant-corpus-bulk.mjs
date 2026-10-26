import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {fileURLToPath} from "node:url";
import {mysqlField,screenGraduale1961Sql,renderGraduale1961Archive,
  GR1961_SOURCE_BLOB_SHA,GR1961_CATEGORIES} from "../tools/mass/import-gregobase-graduale1961.mjs";

const text=path=>readFileSync(fileURLToPath(new URL("../"+path,import.meta.url)),"utf8");
const sha256=s=>createHash("sha256").update(s).digest("hex");
const index=JSON.parse(text("data/mass/chant-corpus/gr1961-proper-index.json"));
assert.equal(index.schema,"ao-gregobase-graduale1961-research-index-v1");
assert.equal(index.sourceFileBlobSha,GR1961_SOURCE_BLOB_SHA);
assert.equal(index.snapshotDate,"2024-01-05");
assert.equal(index.edition.year,1961);
assert.equal(index.edition.editor,"Solesmes");
assert.equal(index.status,"RESEARCH_ONLY_NOT_MASS_READER");
assert.match(index.releaseRule,/Do not import this data in native Schola/);
assert.deepEqual(index.screening,{
  sourceMatchedCoreRows:1254,copyrightExcluded:0,duplicateExcluded:1,
  validStaged:1195,transcriptionExceptions:58,
  byOfficePart:{al:284,in:229,of:185,co:225,gr:189,tr:83},
});
assert.equal(index.batches.length,6);
assert.deepEqual(index.batches.map(batch=>batch.count),[200,200,200,200,200,195]);
assert.equal(index.exceptions.length,58);
const ids=new Set(),byHash=new Map(),sameTitle=new Map(),records=[];
for(let i=0;i<index.batches.length;i++){
  const spec=index.batches[i];
  const body=text(spec.path);
  assert.equal(sha256(body),spec.contentSha256,"Corrupt archived batch: "+spec.path);
  assert.equal(Buffer.byteLength(body),spec.bytes,"Wrong byte count: "+spec.path);
  const batch=JSON.parse(body);
  assert.equal(batch.schema,"ao-gregobase-graduale1961-research-batch-v1");
  assert.equal(batch.status,"STAGED_UNRELEASED");
  assert.equal(batch.snapshotDate,index.snapshotDate);
  assert.equal(batch.sourceEditionId,2);
  assert.equal(batch.batch,i+1);
  assert.equal(batch.items.length,spec.count);
  assert.equal(batch.items[0].gregobaseId,spec.firstId);
  assert.equal(batch.items.at(-1).gregobaseId,spec.lastId);
  for(const item of batch.items){
    assert.ok(!ids.has(item.id),"Duplicate GBase identity: "+item.id);
    ids.add(item.id);records.push(item);
    assert.equal(item.id,"GREGOBASE-"+item.gregobaseId);
    assert.equal(item.trackCategory,GR1961_CATEGORIES[item.officePart]);
    assert.equal(item.sourceEditionId,2);
    assert.ok(item.gradualeRomanum1961Page);
    assert.equal(item.sourceUrl,"https://gregobase.selapa.net/chant.php?id="+item.gregobaseId);
    assert.equal(item.releaseStatus,"RESEARCH_IMPORT_NOT_EDITORIALLY_APPROVED");
    assert.equal(item.sha256,sha256(item.gabc),"GABC bytes changed for "+item.id);
    assert.ok(item.gabc.includes("("));
    assert.match(item.gabc,/^\s*\((?:c[1-4]|f[1-4])\)/i,
      "A staged Gregorian staff must begin with an explicit clef: "+item.id);
    assert.ok(item.gabc.includes("(::)"),"Missing final double bar: "+item.id);
    const hashes=byHash.get(item.sha256)??[];
    hashes.push(item.id);byHash.set(item.sha256,hashes);
    const key=item.officePart+":"+item.incipit.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
    const title=sameTitle.get(key)??[];
    title.push(item);sameTitle.set(key,title);
  }
}
assert.equal(records.length,1195);
assert.deepEqual([...ids].filter(id=>["GREGOBASE-72","GREGOBASE-1163","GREGOBASE-324","GREGOBASE-1274","GREGOBASE-1139"].includes(id)).sort(),
  index.identityFindings.existingFiveChristmasPilotIds.slice().sort());
assert.deepEqual([...byHash.values()].filter(group=>group.length>1)
  .map(ids=>({ids,decision:"PRESERVE_BOTH_PENDING_SOURCE_REVIEW"})),
  index.identityFindings.exactGabcDuplicateGroups);
assert.deepEqual([...sameTitle.values()].filter(group=>group.length>1&&
  new Set(group.map(record=>record.sha256)).size>1)
  .map(group=>({ids:group.map(row=>row.id),decision:"PRESERVE_AS_VARIANTS"})),
  index.identityFindings.samePartAndIncipitDistinctMelodies);
for(const item of index.exceptions)
  assert.ok(!ids.has("GREGOBASE-"+item.gregobaseId),"Quarantined row leaked to research batch");
for(const path of ["src/mass/reader-chant-score-pilot.js","src/mass/reader-proper-chant-crosswalk.js",
  "src/mass/reader-dom.js","src/mass/mass-chant-programme.js"]){
  assert.doesNotMatch(text(path),/chant-corpus\/gr1961-proper/,
    "Unapproved bulk catalogue connected to live Mass in "+path);
}

// Exercise MySQL escape handling and source mapping without network or a 17 MB fixture.
assert.equal(mysqlField("'d\\\\n'"),"d\\n");
assert.equal(mysqlField("NULL"),null);
const gabcJson=JSON.stringify([["gabc","(c4) A(g)men(d) sem(f)per(g) sa(h)e(i)cu(g)la(f) (::)",{}]]);
const escapeSql=value=>"'"+value.replace(/\\/g,"\\\\").replace(/'/g,"\\'")+"'";
const sql=[
"INSERT INTO "+String.fromCharCode(96)+"gregobase_chant_sources"+String.fromCharCode(96)+" (a,b,c,d,e) VALUES",
"(9, 2, '33', 1, 1);",
"INSERT INTO "+String.fromCharCode(96)+"gregobase_chants"+String.fromCharCode(96)+" (a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q) VALUES",
"(9,NULL,'Solesmes','Amen',1,'in','1',NULL,'Archivist','',NULL,"+
  escapeSql(gabcJson)+",NULL,NULL,NULL,0,NULL);",
].join("\n");
const synthetic=screenGraduale1961Sql(sql);
assert.equal(synthetic.accepted.length,1);
assert.equal(synthetic.accepted[0].gabc,"(c4) A(g)men(d) sem(f)per(g) sa(h)e(i)cu(g)la(f) (::)");
assert.equal(synthetic.accepted[0].gradualeRomanum1961Page,"33");
assert.equal(synthetic.exceptions.length,0);
const rendered=renderGraduale1961Archive(synthetic);
assert.equal(rendered.batches.length,1);
assert.equal(rendered.index.screening.validStaged,1);
assert.equal(rendered.index.identityFindings.exactGabcDuplicateGroups.length,0);
console.log("PASS 1195 research GABC SHA-256, edition/page/ID ownership, 58 quarantined, no reader leak");
