/**
 * Prayer Church R7: a deterministic, read-only export of the EXISTING novena
 * sources for an offline Church review build. Not a second prayer corpus.
 *
 * Usage: node tools/pray/export-church-novena-review.mjs --output /tmp/church-novenas.json
 * Never write generated output into src/pray or data/pray; production continues
 * to use novena-runtime.js and its source/calendar/language rules.
 */
import {mkdir, writeFile} from "node:fs/promises";
import {dirname, resolve} from "node:path";
import {pathToFileURL} from "node:url";
import {CHURCH_NOVENA_IDS} from "../../src/pray/church-novena-ids.v1.js";
export {CHURCH_NOVENA_IDS};
import {NOVENA_CORPUS_V4} from "../../src/pray/novena-corpus-v4.js";
import {ICKSP_DIVINE_INFANT_KING_NOVENA_V1} from "../../src/pray/icksp-divine-infant-king-novena.v1.js";
import {ICKSP_IMMACULATE_CONCEPTION_NOVENA_V1} from "../../src/pray/icksp-immaculate-conception-novena.v1.js";
import {NOVENA_HOLY_FACE_1887_B25} from "../../src/pray/holy-face-janvier-1887-b25.js";


const SPECIAL=Object.freeze({
  [ICKSP_DIVINE_INFANT_KING_NOVENA_V1.id]:ICKSP_DIVINE_INFANT_KING_NOVENA_V1,
  [ICKSP_IMMACULATE_CONCEPTION_NOVENA_V1.id]:ICKSP_IMMACULATE_CONCEPTION_NOVENA_V1,
  [NOVENA_HOLY_FACE_1887_B25.id]:NOVENA_HOLY_FACE_1887_B25
});

function sourceOwner(id){
  if(id==="divine_infant_king")return "src/pray/icksp-divine-infant-king-novena.v1.js";
  if(id==="icksp_immaculate_conception")return "src/pray/icksp-immaculate-conception-novena.v1.js";
  if(id==="holy_face_1887")return "src/pray/holy-face-janvier-1887-b25.js";
  return "src/pray/novena-corpus-v4.js";
}

/** Return JSON-native values only; do not alter, translate, or normalize prayers. */
export function buildChurchNovenaReviewExport(){
  if(Object.keys(NOVENA_CORPUS_V4).length!==16)
    throw new Error("Frozen V4 novena census changed: review the source owner");
  const originals={...NOVENA_CORPUS_V4,...SPECIAL};
  if(Object.keys(originals).length!==19)
    throw new Error("Expected exactly 16 V4 plus 3 specialist novenas");
  const programmes=CHURCH_NOVENA_IDS.map(id=>{
    const source=originals[id];
    if(!source||source.id!==id||!Array.isArray(source.days)||source.days.length!==9)
      throw new Error("Missing/invalid original novena programme: "+id);
    const sourceObject=JSON.parse(JSON.stringify(source));
    if(sourceObject.days.length!==9)throw new Error("Lost day records: "+id);
    return {
      canonicalId:id,prayerChurchId:"novena:"+id,sourceOwner:sourceOwner(id),
      programme:sourceObject
    };
  });
  return {
    version:"CHURCH_NOVENA_REVIEW_R7",
    purpose:"Read-only review export: never treat it as the live source of truth",
    productionOwner:"src/pray/novena-runtime.js",
    calendarOwner:"Calendar Intelligence",
    sourceStatus:"Runtime presence is not equivalent to complete original-print certification",
    languagePolicy:"Retain historical vs editorial French provenance as supplied; do not infer native French from a translated label",
    devotionalRules:[
      "St Anthony: nine Tuesdays, not nine consecutive days",
      "Repeated-prayer forms retain the same source prayer instead of fabricated daily themes",
      "No streak, intention history, or completion scoring",
      "Canonical Our Father, Hail Mary, Glory Be and 1962 Loreto are references, not substitute generated text",
      "Source-specific feast start dates are governed by Calendar Intelligence"
    ],
    count:programmes.length,
    occasions:programmes.reduce((sum,p)=>sum+p.programme.days.length,0),
    programmes
  };
}

export async function writeChurchNovenaReviewExport(output){
  if(!output||!String(output).trim())throw new Error("Supply --output <path>");
  const path=resolve(String(output));
  const payload=buildChurchNovenaReviewExport();
  await mkdir(dirname(path),{recursive:true});
  await writeFile(path,JSON.stringify(payload,null,2)+"\n","utf8");
  return {path,count:payload.count,occasions:payload.occasions};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  const at=process.argv.indexOf("--output");
  if(at<0||!process.argv[at+1]){
    console.error("Usage: node tools/pray/export-church-novena-review.mjs --output <path>");
    process.exitCode=2;
  }else{
    writeChurchNovenaReviewExport(process.argv[at+1])
      .then(x=>console.log(`Wrote ${x.count} source-owned novena programmes / ${x.occasions} occasions to ${x.path}`))
      .catch(err=>{console.error(err);process.exitCode=1});
  }
}
