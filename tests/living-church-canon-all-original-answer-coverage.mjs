import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>JSON.parse(readFileSync(path,"utf8"));
const cross=read("data/learn/formation-historical-answer-crosswalk-20261013.v1.json");
const next=read("data/learn/research/formation-new-15-indexed-answer-adequacy-20261014.v1.json");
const cache=new Map();
function doc(path){
 if(!cache.has(path))cache.set(path,read(path));
 return cache.get(path);
}
const errors=[],refs={unresolved:[],notHttps:[],empty:[]},sets={};
function validate(path,id){
 const pack=doc(path);
 const entries=[...(pack.records||[]),...(pack.drafts||[]),...(pack.dossiers||[])];
 const matches=entries.filter(e=>(e.id||e.historical_id)===id);
 if(matches.length!==1){errors.push({id,path,error:"not_exactly_one_record",count:matches.length});return;}
 const item=matches[0],paragraphs=item.paragraphs||item.sections||[];
 if(!Array.isArray(paragraphs)||!paragraphs.length){errors.push({id,path,error:"no_paragraphs"});return;}
 const registry=new Map((pack.source_registry||[]).map(x=>[x.id,x]));
 for(const [i,p] of paragraphs.entries()){
  if(!p.text?.en?.trim()||!p.text?.fr?.trim())errors.push({id,path,index:i,error:"missing_bilingual_paragraph"});
  const ids=p.source_ids||[];
  if(!ids.length)refs.empty.push({id,path,index:i});
  for(const sourceId of ids){
   const l=registry.get(sourceId)||(p.source_links||[]).find(x=>x.id===sourceId);
   if(!l){refs.unresolved.push({id,path,index:i,sourceId});continue;}
   if(!l.url?.startsWith("https://"))refs.notHttps.push({id,path,index:i,sourceId,url:l.url});
  }
 }
 sets[id]={path,paragraphs:paragraphs.length};
}
for(const row of cross.records.filter(r=>r.answer_supplement_file))validate(row.answer_supplement_file,row.historical_id);
const deltaPath="data/learn/research/formation-new-15-indexed-answer-adequacy-20261014.v1.json";
for(const row of next.rows.filter(r=>r.answer_supplement_id))validate(deltaPath,row.answer_supplement_id);
const all=[...cross.records.map(x=>x.historical_id),...next.rows.map(x=>x.historical_id)];
assert.equal(new Set(all).size,534);
assert.equal(Object.keys(sets).length,417,"Not all existing bilingual source supplements resolved");
assert.equal(cross.records.filter(x=>x.answer_supplement_file).length,404);
assert.equal(next.rows.filter(x=>x.answer_supplement_id).length,13);
assert.deepEqual(errors,[],"Existing original question/source record mismatch");
assert.deepEqual(refs.unresolved,[],"Source ID references must resolve within original owner pack");
assert.deepEqual(refs.notHttps,[],"Source hyperlinks must use HTTPS");
const summary={
 indexedQuestions:534,
 originalBilingualResearchRecords:Object.keys(sets).length,
 originalSourcePackCount:cache.size,
 unresolvedSourceIds:refs.unresolved.length,
 nonHttpsSourceLinks:refs.notHttps.length,
 unreferencedSourceParagraphs:refs.empty.length,
 certifiedForPublicUse:0
};
console.log("CANON_SOURCE_COMPLETENESS",JSON.stringify(summary));
console.log("PASS: all original 417 bilingual research supplement records exist and cited source IDs resolve; publication remains held");
