import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { loadReaderPresentationData, READER_PRESENTATION_FILES } from "../src/mass/reader-data.js";

const files=Object.fromEntries(Object.values(READER_PRESENTATION_FILES).map(file=>[
  file,
  JSON.parse(readFileSync(new URL("../data/presentation/"+file,import.meta.url),"utf8"))
]));
const requested=[];
const fetchImpl=async url=>{
  const file=String(url).split("/").pop();
  requested.push(file);
  return files[file]
    ? {ok:true,status:200,json:async()=>files[file]}
    : {ok:false,status:404,json:async()=>({})};
};
const data=await loadReaderPresentationData({
  fetchImpl,
  baseUrl:"https://example.test/src/mass/reader-data.js"
});
assert.equal(data.sectionMap.contract,"AO_MASS_READER_V2_SECTION_MAP");
assert.equal(data.lowCorpus.form,"LOW");
assert.equal(data.sungCorpus.form,"SUNG");
assert.equal(data.canonSourceMap.status,"CERTIFIED_SOURCE_FIRST");
assert.deepEqual(new Set(requested),new Set(Object.values(READER_PRESENTATION_FILES)));
assert.ok(data.urls.lowCorpus.endsWith("/data/presentation/reader-text-low.v1.json"));

let failed=false;
try{
  await loadReaderPresentationData({
    fetchImpl:async()=>({ok:false,status:404,json:async()=>({})}),
    baseUrl:"https://example.test/src/mass/reader-data.js"
  });
}catch(error){failed=/Unable to load/.test(String(error.message))}
assert.equal(failed,true,"missing reader data did not fail closed");

console.log("reader presentation data loader: PASS — section/text/Canon sources load together and fail closed.");
