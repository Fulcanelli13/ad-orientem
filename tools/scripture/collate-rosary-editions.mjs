#!/usr/bin/env node
/**
 * Deterministic, non-publication Rosary source collation.
 * Usage:
 *   node tools/scripture/collate-rosary-editions.mjs <DRC.json> <FreCrampon.json> <output.json>
 * Inputs MUST be pinned historical copies of Catholic editions; do not run
 * Bible quotation strings through the app as a result of this report.
 */
import fs from "node:fs";
import crypto from "node:crypto";

const [, , englishFile, frenchFile, outputFile] = process.argv;
if (!englishFile || !frenchFile || !outputFile) throw Error("Usage: collate-rosary-editions.mjs DRC.json FreCrampon.json result.json");
const donor = JSON.parse(fs.readFileSync("data/pray/rosary-scripture-editorial-inventory.v1.json", "utf8"));
const archive = JSON.parse(fs.readFileSync("data/pray/rosary-primary-edition-review.v1.json", "utf8"));
const english = JSON.parse(fs.readFileSync(englishFile, "utf8"));
const french = JSON.parse(fs.readFileSync(frenchFile, "utf8"));

const signature = f => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
const digest = str => crypto.createHash("sha256").update(str).digest("hex");

function normalize(s) {
  return String(s || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘]/g, "'").toLowerCase()
    .replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}
function value(obj, keys) { for (const k of keys) if (obj?.[k] != null) return obj[k]; return undefined; }
function sampleShape(root) {
  const arr = Array.isArray(root) ? root : value(root, ["books", "Books", "data", "verses"]);
  return {rootKeys:Object.keys(root).slice(0,12), first:JSON.stringify(arr?.[0]??root).slice(0,900)};
}
function flatten(root) {
  const books = Array.isArray(root) ? root : value(root, ["books","Books","data"]);
  if (!Array.isArray(books)) throw Error("Unexpected source JSON root: "+JSON.stringify(sampleShape(root)));
  const out = new Map();
  function store(name, chapter, verse, text) {
    if(!name || !Number.isInteger(+chapter) || !Number.isInteger(+verse) || !text) return;
    const key=normalize(name)+"|"+Number(chapter)+"|"+Number(verse);
    if(out.has(key)) throw Error("Duplicate biblical verse "+key);
    out.set(key,String(text));
  }
  for(const book of books){
    const name=typeof book==="string" ? book : value(book,["name","book","book_name","title","bookName"]);
    const chapters=value(book,["chapters","Chapters"]);
    if(Array.isArray(chapters)) {
      for(const [ci,chap] of chapters.entries()){
        const ch=Number(value(chap,["chapter","number","c"])||ci+1);
        let verses=value(chap,["verses","Verses"]);
        if(verses && !Array.isArray(verses) && typeof verses==="object") verses=Object.entries(verses).map(([verse,text])=>({verse,text}));
        if(!Array.isArray(verses))continue;
        for(const [vi,v] of verses.entries()) store(name,ch,value(v,["verse","number","v"])??vi+1,value(v,["text","t","verseText"]));
      }
    }else if(Array.isArray(value(book,["verses","Verses"]))){
      for(const v of value(book,["verses","Verses"]))store(name,value(v,["chapter","c"]),value(v,["verse","v"]),value(v,["text","t"]));
    }else if(value(book,["chapter","c"])&&value(book,["verse","v"])){
      store(name,value(book,["chapter","c"]),value(book,["verse","v"]),value(book,["text","t"]));
    }
  }
  if(out.size<3000)throw Error("Parsed too few verses: "+out.size+"; "+JSON.stringify(sampleShape(root)));
  return out;
}
const en=flatten(english),fr=flatten(french);
console.log("COLLATION_BOOK_NAMES "+JSON.stringify({en:english.books.map(x=>x.name),fr:french.books.map(x=>x.name)}));
const aliases={
  "luke":{en:["luke"],fr:["luc","evangile selon saint luc"]},
  "matthew":{en:["matthew"],fr:["matthieu","evangile selon saint matthieu"]},
  "john":{en:["john","gospel of john"],fr:["jean","evangile selon saint jean"]},
  "mark":{en:["mark"],fr:["marc","evangile selon saint marc"]},
  "acts":{en:["acts","acts of the apostles"],fr:["actes","actes des apotres"]},
  "1 corinthians":{en:["1 corinthians","i corinthians","1st corinthians"],fr:["1 corinthiens","premiere epitre aux corinthiens"]},
  "isaias":{en:["isaias","isaiah"],fr:["isaie","isaie"]},
  "psalm":{en:["psalm","psalms"],fr:["psaumes","psaume"]},
  "canticles":{en:["canticles","song of songs","song of solomon"],fr:["cantique des cantiques","cantique"]},
  "apocalypse":{en:["apocalypse","revelation","revelation of john"],fr:["apocalypse","apocalypse de saint jean"]},
  "judith":{en:["judith"],fr:["judith"]}
};
const byId=Object.fromEntries(archive.rows.map(x=>[x.id,x]));
function passage(map, book, language, chapter, start, end) {
  const names=aliases[normalize(book)]?.[language]||[book];
  let foundName, texts=[], count=0;
  for(const name of names) {
    const values=[];let present=0;
    for(let i=start;i<=end;i++) {
      const verse=map.get(normalize(name)+"|"+chapter+"|"+i);
      if(verse) {values.push(verse);present++;}
    }
    if(present>count){count=present;texts=values;foundName=name;}
    if(count===end-start+1)break;
  }
  return {passage:texts.join(" "),foundVerses:count,requestedVerses:end-start+1,bookName:foundName||null};
}
function compare(donor, passage){
  const a=normalize(donor),b=normalize(passage);
  if(!a||!b)return {status:"NO_COMPARABLE_TEXT",matchRatio:0};
  const aw=a.split(" "),bw=b.split(" ");
  const comparable=aw.length,matching=aw.filter(t=>bw.includes(t)).length;
  const matchRatio=Number((matching/comparable).toFixed(3));
  if(a===b)return{status:"NORMALIZED_FULL_PASSAGE_MATCH",matchRatio:1};
  if(b.includes(a))return{status:"CONTIGUOUS_EXCERPT_MATCH",matchRatio:1};
  let at=0;for(const token of bw)if(token===aw[at])at++;
  if(at===aw.length)return{status:"ORDERED_WITH_OMISSIONS",matchRatio:1};
  // Negative outcome is an algorithmic triage finding, never a scholarly conclusion.
  return{status:matchRatio>=0.85?"SIMILAR_WORDING_REVIEW_REQUIRED":"LOW_OVERLAP_REVIEW_REQUIRED",matchRatio};
}
const results=[];
for(const r of donor.rows){
  const audit=byId[r.id];
  if(!audit)throw Error("Unmatched donor "+r.id);
  const p=audit.passage;
  const e=passage(en,p.sourceBook,"en",p.chapter,p.verseStart,p.verseEnd);
  const f=passage(fr,p.sourceBook,"fr",p.chapter,p.verseStart,p.verseEnd);
  const hold=!!p.partialVerse || r.flags.some(x=>["OPEN_SENTENCE","VERSE_SPLIT","EDITORIAL_ELLIPSIS","UNFINISHED_CLAUSE"].includes(x));
  const mismatchMap=["Psalm","Judith","Canticles"].includes(p.sourceBook);
  const provisional=e.foundVerses===e.requestedVerses && !mismatchMap?compare(r.legacyEnglishExcerpt,e.passage):{status:"EDITION_OR_REFERENCE_UNRESOLVED",matchRatio:null};
  results.push({
    id:r.id,mysteryId:r.mysteryId,citation:r.sourceReference,
    enVersesLocated:e.foundVerses,enVersesExpected:e.requestedVerses,
    enBookKey:e.bookName,enPassageSha256:e.passage?digest(e.passage):null,
    enAutomaticResult:provisional.status,enTokenOverlap:provisional.matchRatio,
    frVersesLocated:f.foundVerses,frVersesExpected:f.requestedVerses,
    frBookKey:f.bookName,frPassageSha256:f.passage?digest(f.passage):null,
    frenchQuotationsChecked:0,
    excerptHold:hold,typologyOrVersificationHold:mismatchMap || r.flags.includes("TRADITIONAL_TYPOLOGICAL_APPLICATION"),
    editorialApproved:false,permissionToRepublish:false
  });
}
const tally={};for(const r of results)tally[r.enAutomaticResult]=(tally[r.enAutomaticResult]||0)+1;
const output={
 schema:"ao-rosary-drc-crampon-automated-collation-v1",
 editionInput:{en:"Douay–Rheims Bible (Challoner revision), Scrollmapper DRC",fr:"La Bible Augustin Crampon 1923, Scrollmapper FreCrampon",sourceRepo:"scrollmapper/bible_databases",sourceCommit:"e1b254cef86d0e65b1a5d1a94b8b112d0f296a2c",sha256:{en:signature(englishFile),fr:signature(frenchFile)}},
 disclaimer:"Reproducible automatic comparison to secondary digital transcriptions. Not primary-facsimile or French-quote human verification; no verses are reproduced; never remove live display holds from this report.",
 counts:{donorRows:200,matchedToArchive:results.length,englishAutomaticResults:tally,englishFoundAllSourceVerses:results.filter(x=>x.enVersesLocated===x.enVersesExpected).length,frenchFoundAllSourceVerses:results.filter(x=>x.frVersesLocated===x.frVersesExpected).length,englishEditorialApproved:0,frenchQuotationCollated:0,permittedPublication:0},
 rows:results
};
fs.writeFileSync(outputFile,JSON.stringify(output,null,2)+"\n");
console.log("COLLATION_COUNTS "+JSON.stringify(output.counts));
console.log("COLLATION_SHAPES "+JSON.stringify({english:sampleShape(english),french:sampleShape(french)}).slice(0,950));
console.log("COLLATION_RESULT_B64 "+Buffer.from(JSON.stringify(output)).toString("base64"));
