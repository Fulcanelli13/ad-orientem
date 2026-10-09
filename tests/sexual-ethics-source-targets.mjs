import assert from "node:assert/strict";
import { CSE_QUESTIONS, CSE_SOURCE_MAP } from "../src/learn/sexual-ethics-data/index.js";
import { cseSourceTargets } from "../src/learn/sexual-ethics-data/source-targets.js";

const scriptureRows=CSE_QUESTIONS.flatMap(item=>item.refs
  .filter(([id])=>id==="SCR").map(([,locator])=>({question:item.id,locator})));
assert.equal(scriptureRows.length,15,"Unexpected change to the 150-question Scripture-citation inventory");

let chapterCount=0;
for(const row of scriptureRows){
  for(const french of [false,true]){
    const targets=cseSourceTargets("SCR",row.locator,CSE_SOURCE_MAP.SCR,{french});
    const parts=row.locator.split(";").map(s=>s.trim());
    assert.equal(targets.length,parts.length,row.question+" lost a Scripture passage");
    assert.deepEqual(targets.map(target=>target.locator),parts,row.question+" reordered a citation");
    for(const target of targets){
      assert.equal(target.scope,"chapter",row.question+" must link to real chapter text");
      assert.match(target.url,/^https:\/\/www\.newadvent\.org\/bible\/(?:mat|mar|luk|rom|1co|1th|exo|gen)\d{3}\.htm$/);
      assert.equal(target.url.includes("nova-vulgata_index_lt"),false,"Index-only link leaked");
      assert.match(target.witness,/Latin and English/);
      chapterCount++;
    }
  }
}
assert.deepEqual(cseSourceTargets("SCR","Mt 5:27–28; 1 Cor 6:18–20",CSE_SOURCE_MAP.SCR)
  .map(target=>target.url),[
    "https://www.newadvent.org/bible/mat005.htm",
    "https://www.newadvent.org/bible/1co006.htm"
  ]);
const source=CSE_SOURCE_MAP.TRENT6;
assert.equal(cseSourceTargets("TRENT6","Part III",source)[0].url,source.canonical_url,
  "Other document URLs must not be fabricated or rewritten");
// Bibliographic metadata and book previews must not masquerade as the
// original passages of modern dissenting authors.
const books=["FARLEY2008","CURRAN2006","CURRAN1978","CURRAN1992","FLETCHER1966","SINGER2011","LBM"];
for(const id of books){
  const target=cseSourceTargets(id,"p. 42",CSE_SOURCE_MAP[id])[0];
  assert.equal(target.scope,"catalogue",id+" must disclose metadata/preview-only access");
  assert.match(target.url,/^https:\/\/books\.google\.com\//);
  assert.match(target.witness,/not verified/);
}
assert.equal(cseSourceTargets("FARLEY_QUOTED2012","p. 295",CSE_SOURCE_MAP.FARLEY_QUOTED2012)[0].scope,
  "document","Official CDF quotation of Farley is a real document, not a book catalogue");
assert.equal(cseSourceTargets("CURRAN1987","full primary article",CSE_SOURCE_MAP.CURRAN1987)[0].scope,
  "document","Complete primary-author essay must remain identified as document text");
assert.equal(cseSourceTargets("FLETCHER1966","p. 1",{canonical_url:"javascript:alert(1)"})[0].scope,
  "unverified","Unsafe original-text source must fail closed");
for(const bad of ["Mt 29:1","Mk 17:1","Lk 25:1","Rom 17:1","1 Cor 17:1","1 Thess 6:1","Ex 41:1","Gen 51:1"]){
  const target=cseSourceTargets("SCR",bad,CSE_SOURCE_MAP.SCR)[0];
  assert.equal(target.scope,"index",bad+" must not manufacture a nonexistent chapter");
}
const runtime=await import("node:fs").then(m=>m.readFileSync("src/learn/sexual-ethics.js","utf8"));
assert.match(runtime,/catalogue \/ preview only/,"Bibliographic disclosure is not visible in English");
assert.match(runtime,/notice \/ aperçu seulement/,"Bibliographic disclosure is not visible in French");
assert.match(runtime,/not a verified original passage/,"Complete source bibliography omits the catalog-only warning");

// Fletcher source separates the 1966 book record from the examined original
// scan; neither a 1997 reprint nor a critical review is primary evidence.
const fletcher=CSE_SOURCE_MAP.FLETCHER1966;
assert.equal(new URL(fletcher.canonical_url).searchParams.get("id"),"E2JqAAAAMAAJ");
const fletcherChapter=cseSourceTargets("FLETCHER1966","1966 original, pp.120–123: proposition 5",fletcher)[0];
assert.equal(fletcherChapter.url,fletcher.original_digitized_text_url);
assert.equal(fletcherChapter.scope,"digitized-original");
assert.match(fletcherChapter.witness,/third-party digitization/);
assert.equal(cseSourceTargets("FLETCHER1966","Bibliographic overview",fletcher)[0].scope,"catalogue");
const cseRuntime=(await import("node:fs")).readFileSync("src/learn/sexual-ethics.js","utf8");
assert.match(cseRuntime,/1966 scan · uncollated/);
assert.match(cseRuntime,/numérisation de 1966 · non collationnée/);

const unsupported=cseSourceTargets("SCR","Unverified 12:34",CSE_SOURCE_MAP.SCR);
assert.equal(unsupported[0].scope,"index","Unknown biblical abbreviations must fail closed");
assert.equal(unsupported[0].url,CSE_SOURCE_MAP.SCR.canonical_url);
assert.equal(Object.isFrozen(unsupported),true);
console.log("PASS Sexual Ethics source destinations: "+scriptureRows.length+
  " Scripture citation rows, "+chapterCount/2+" chapter links per language; honest unresolved fallback");
