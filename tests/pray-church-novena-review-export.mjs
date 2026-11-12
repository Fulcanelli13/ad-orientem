import assert from "node:assert/strict";
import {mkdtemp,readFile,rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {
  buildChurchNovenaReviewExport,writeChurchNovenaReviewExport,
  CHURCH_NOVENA_IDS
} from "../tools/pray/export-church-novena-review.mjs";
import {NOVENA_CORPUS_V4} from "../src/pray/novena-corpus-v4.js";
import {ICKSP_DIVINE_INFANT_KING_NOVENA_V1} from "../src/pray/icksp-divine-infant-king-novena.v1.js";
import {ICKSP_IMMACULATE_CONCEPTION_NOVENA_V1} from "../src/pray/icksp-immaculate-conception-novena.v1.js";
import {NOVENA_HOLY_FACE_1887_B25} from "../src/pray/holy-face-janvier-1887-b25.js";

const payload=buildChurchNovenaReviewExport();
const actual=new Map(payload.programmes.map(p=>[p.canonicalId,p]));
const sources={
  ...NOVENA_CORPUS_V4,
  [ICKSP_DIVINE_INFANT_KING_NOVENA_V1.id]:ICKSP_DIVINE_INFANT_KING_NOVENA_V1,
  [ICKSP_IMMACULATE_CONCEPTION_NOVENA_V1.id]:ICKSP_IMMACULATE_CONCEPTION_NOVENA_V1,
  [NOVENA_HOLY_FACE_1887_B25.id]:NOVENA_HOLY_FACE_1887_B25
};

assert.equal(payload.count,19);
assert.equal(payload.occasions,171);
assert.equal(actual.size,19);
assert.equal(new Set(CHURCH_NOVENA_IDS).size,19);
assert.deepEqual([...actual.keys()],CHURCH_NOVENA_IDS);
assert.equal(Object.keys(NOVENA_CORPUS_V4).length,16);
assert.equal(Object.keys(sources).length,19);
for(const id of CHURCH_NOVENA_IDS){
  const rec=actual.get(id);
  assert.equal(rec.prayerChurchId,"novena:"+id);
  assert.ok(rec.sourceOwner.startsWith("src/pray/"));
  assert.equal(rec.programme.days.length,9);
  assert.deepEqual(rec.programme,JSON.parse(JSON.stringify(sources[id])),
    "Source words, language variants, cadence or provenance changed: "+id);
}
assert.ok(actual.get("st_anthony_nine_tuesdays"),
  "Weekly Nine Tuesdays must remain a distinct ID");
assert.notEqual(
  actual.get("immaculate_conception").sourceOwner,
  actual.get("icksp_immaculate_conception").sourceOwner,
  "Moran and Institute witnesses must not be flattened");

const temp=await mkdtemp(join(tmpdir(),"ao-novena-r7-"));
try{
  const path=join(temp,"review.json");
  const written=await writeChurchNovenaReviewExport(path);
  assert.equal(written.count,19);
  const raw=await readFile(path,"utf8");
  assert.deepEqual(JSON.parse(raw),payload);
  await writeChurchNovenaReviewExport(path);
  assert.equal(await readFile(path,"utf8"),raw,"Export is not deterministic");
}finally{await rm(temp,{recursive:true,force:true})}
console.log("Church novena R7: 19 exact source records, 171 occasions, stable export; no parallel authored prayer corpus.");
