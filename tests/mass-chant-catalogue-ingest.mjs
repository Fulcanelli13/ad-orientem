import assert from "node:assert/strict";
import {ingest1961,makeShards,parseSqlInserts,SCHEMA} from "../tools/mass/ingest-gregobase-1961.mjs";

const chant=(id,incipit,office="in",version="Solesmes",gabc="(c4) Puer(f)"){
 const values=[id,"NULL","'"+version+"'","'"+incipit+"'","1","'"+office+"'","'7'","NULL","'Andrew Hinkley'","NULL",
  "'"+gabc+"'","NULL","NULL","NULL","0","NULL"];
 return "("+values.join(",")+")";
};
const fixture=[
"CREATE TABLE other (x varchar(100));",
"INSERT INTO gregobase_sources VALUES (2,1961,NULL,'Solesmes','Graduale Romanum','','','',''),(3,1974,NULL,'Solesmes','Graduale Romanum','','','','');",
"INSERT INTO gregobase_chants VALUES "+[
 chant(72,"Puer natus est nobis"),
 chant(1163,"Viderunt omnes","gr","Solesmes","(c4) Vi(gh)de(f)runt (;) an(g)gel(us)"),
 chant(2500,"Domine\\'s gift","in","Solesmes","(c4) no(ge)bis; C(ha)"),
 ].join(",")+";",
"INSERT INTO gregobase_chant_sources VALUES (72,2,'33',1,1),(1163,2,'33',2,1),(2500,2,'34',1,1),(72,3,'48',1,1);",
].join("\n");
const observed=[];
const parsed=parseSqlInserts(fixture,(table,row)=>observed.push([table,row]));
assert.equal(parsed.rows,9);
assert.equal(parsed.statements,3);
assert.equal(observed.find(x=>x[1].id==="2500")?.[1].incipit,"Domine's gift");
assert.match(observed.find(x=>x[1].id==="2500")?.[1].gabc,/no\(ge\)bis; C\(ha\)/);
const result=ingest1961(fixture);
assert.equal(result.records.length,3);
assert.equal(result.provenance.schema,SCHEMA);
assert.equal(result.provenance.edition.year,1961);
assert.equal(result.provenance.summary.total,3);
assert.equal(result.provenance.summary.byOfficePart.in,2);
assert.equal(result.provenance.summary.byOfficePart.gr,1);
assert.deepEqual(result.records.map(x=>x.gregobaseId),[72,1163,2500]);
assert.deepEqual(result.records[0].pages.map(x=>x.page),["33"]);
assert.equal(result.records[0].trackHint,"INTROIT");
assert.equal(result.records[1].trackHint,"GRADUAL");
assert.equal(result.records[2].incipit,"Domine's gift");
assert.equal(result.records[2].status,"HISTORICAL_SOURCE_METADATA_NOT_READER_APPROVED");
assert.ok(!Object.hasOwn(result.records[0],"gabc"),"Raw GABC must not be copied into unreviewed metadata");
assert.equal(makeShards(result,2).length,2);
assert.deepEqual(makeShards(result,2).map(x=>x.records.length),[2,1]);
assert.throws(()=>makeShards(result,1000),/Shard size/);
assert.throws(()=>ingest1961(fixture.replace("'Solesmes','Graduale Romanum'","'Elsewhere','Antiphonale'")),
  /Source ID 2/);
assert.throws(()=>ingest1961("INSERT INTO gregobase_chants VALUES (1,'truncated');"),
  /column mismatch/);
console.log("PASS GregoBase 1961 bulk discovery importer: source ID, SQL escaping, dedup, shards, deny-by-default");
