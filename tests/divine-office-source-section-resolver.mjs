import test from "node:test";
import assert from "node:assert/strict";
import {DIVINUM_OFFICIUM_PIN} from "../src/app/source-transport-compat.js";
import {createOfficeSectionResolver} from "../src/office/source-section-resolver.js";

const path="Tempora/Pent23-0";
const testDocuments={
  la:new Map([["Oratio",["Oratio","Dómine, exáudi oratiónem meam."]]]),
  en:new Map([["Oratio",["Collect","O Lord, hear my prayer."]]]),
  fr:new Map([["Oratio",["Oraison","Seigneur, écoutez ma prière."]]])
};
function harness({override=null}={}){
  const calls=[];
  const readSource=async(p,lang)=>{
    calls.push(p+"|"+lang);
    return override ? override(p,lang) : {
      sourceRevision:DIVINUM_OFFICIUM_PIN,sourcePath:p,language:lang,
      map:testDocuments[lang]
    };
  };
  return {calls,...createOfficeSectionResolver({readSource})};
}
const item=(language="la")=>({path,section:"Oratio",role:"COLLECT",language});

test("three languages project from the SAME exact source-owned section",async()=>{
  const resolver=harness();
  const value=await resolver.resolveParallel({path,section:"Oratio",role:"COLLECT"});
  assert.equal(value.status,"PARSED_UNVERIFIED");
  assert.equal(value.publishable,false);
  assert.equal(value.alignmentVerified,false);
  assert.deepEqual(Object.keys(value.texts),["la","en","fr"]);
  assert.match(value.texts.la,/Dómine/);
  assert.match(value.texts.en,/Lord/);
  assert.match(value.texts.fr,/Seigneur/);
  assert.deepEqual(resolver.calls,[path+"|la",path+"|en",path+"|fr"]);
});
test("in-flight and settled reads deduplicate exact path/language",async()=>{
  const resolver=harness();
  const [a,b]=await Promise.all([resolver.resolveSection(item()),resolver.resolveSection(item())]);
  assert.equal(a.text,b.text);
  assert.deepEqual(resolver.calls,[path+"|la"]);
  assert.equal(resolver.cachedSourceCount(),1);
  resolver.clearCache();
  await resolver.resolveSection(item());
  assert.equal(resolver.calls.length,2);
});
test("does not infer calendar, source Common, Office or variant",async()=>{
  const resolver=harness();
  const value=await resolver.resolveSection(item());
  assert.deepEqual(value.source,{
    revision:DIVINUM_OFFICIUM_PIN,path,section:"Oratio",language:"la"
  });
  assert.equal(value.officePrecedenceVerified,false);
  assert.equal(value.printedEditionCertified,false);
  assert.equal(value.rightsApproved,false);
  assert.equal(value.publishable,false);
});
test("missing exact section, wrong language, and path traversal fail closed",async()=>{
  const resolver=harness();
  await assert.rejects(resolver.resolveSection({...item(),section:"Nonexistent"}),
    /OFFICE_SOURCE_SECTION_EMPTY/);
  await assert.rejects(resolver.resolveSection({...item(),language:"it"}),
    /OFFICE_SOURCE_LANGUAGE_INVALID/);
  await assert.rejects(resolver.resolveSection({...item(),path:"Tempora/../Sancti/test"}),
    /OFFICE_SOURCE_PATH_INVALID/);
  assert.deepEqual(resolver.calls,[path+"|la"]);
});
test("source identity and original revision cannot be silently substituted",async()=>{
  for(const mutation of [{sourceRevision:"0000000000000000000000000000000000000000"},
    {sourcePath:"Commune/C1"},{language:"en"}]){
    const resolver=harness({override:(p,language)=>({
      sourceRevision:DIVINUM_OFFICIUM_PIN,sourcePath:p,language,
      map:testDocuments[language],...mutation
    })});
    await assert.rejects(resolver.resolveSection(item()),
      /OFFICE_PINNED_SOURCE_PROVENANCE_MISMATCH/);
  }
});
test("unexpanded macros are blocked instead of rendered or guessed",async()=>{
  for(const raw of ["@Commune/C1:Oratio","$Per Dominum","&Gloria",
    "(sed rubrica 1960)", "{omit}"]){
    const resolver=harness({override:(p,language)=>({
      sourceRevision:DIVINUM_OFFICIUM_PIN,sourcePath:p,language,
      map:new Map([["Oratio",[raw]]])
    })});
    await assert.rejects(resolver.resolveSection(item()),
      /OFFICE_SOURCE_DIRECTIVE_UNRESOLVED/);
  }
});
test("failure in one locale does not fall back to Latin or another translation",async()=>{
  const resolver=harness({override:(p,language)=>({
    sourceRevision:DIVINUM_OFFICIUM_PIN,sourcePath:p,language,
    map:language==="fr"?new Map():testDocuments[language]
  })});
  await assert.rejects(resolver.resolveParallel({path,section:"Oratio",role:"COLLECT"}),
    /OFFICE_SOURCE_SECTION_EMPTY/);
});
test("does not invent alignment from equally named source sections",async()=>{
  const resolver=harness({override:(p,language)=>({
    sourceRevision:DIVINUM_OFFICIUM_PIN,sourcePath:p,language,
    map:new Map([["Oratio",language==="en"?["English title only"]:["Latin text","Second paragraph"]]])
  })});
  const doc=await resolver.resolveParallel({path,section:"Oratio",role:"COLLECT"});
  assert.equal(doc.alignmentVerified,false);
  assert.equal(doc.sections.en.text,"English title only");
});
test("no HTML is assembled or permitted for publication",async()=>{
  const resolver=harness({override:(p,language)=>({
    sourceRevision:DIVINUM_OFFICIUM_PIN,sourcePath:p,language,
    map:new Map([["Oratio",["<script>alert('x')</script>"]]])
  })});
  const s=await resolver.resolveSection(item());
  assert.equal(s.text,"<script>alert('x')</script>");
  assert.equal(s.publishable,false);
  assert.equal("html" in s,false);
});
test("invalid cache settings fail before any input is read",()=>{
  assert.throws(()=>createOfficeSectionResolver({readSource:()=>{},maxDocuments:0}),
    /OFFICE_READER_CONFIGURATION_INVALID/);
});
