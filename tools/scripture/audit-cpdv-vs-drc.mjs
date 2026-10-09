#!/usr/bin/env node
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { CATHOLIC_BOOK_IDS } from "../../src/scripture/canon.js";

/** High-stakes comparison triage, not endorsement or theological certification. */
export const CPDV_EDITORIAL_CHECKLIST = Object.freeze([
  ["Genesis",3,15,"Protoevangelium: the woman and her seed","doctrinal"],
  ["Isaiah",7,14,"The virgin and the Emmanuel prophecy","doctrinal"],
  ["Matthew",1,23,"Virgin birth of Christ","doctrinal"],
  ["Luke",1,28,"Hail, full of grace","marian"],
  ["Luke",1,42,"Blessed among women","marian"],
  ["Luke",1,43,"Mother of my Lord","marian"],
  ["Luke",1,46,"Magnificat: Marian praise","marian"],
  ["John",1,1,"Word and God; distinguish Persons without denying divinity","christology"],
  ["John",1,14,"Incarnation of the Word","christology"],
  ["John",6,51,"Bread of life and Christ's flesh","eucharist"],
  ["John",6,54,"Eucharistic eating and life","eucharist"],
  ["Matthew",26,26,"Institution: This is my body","eucharist"],
  ["Luke",22,19,"Institution: do this in memory of me","eucharist"],
  ["1Corinthians",11,27,"Unworthy Communion","eucharist"],
  ["1Corinthians",11,29,"Discerning the body","eucharist"],
  ["Matthew",16,18,"Peter and the Church","ecclesiology"],
  ["Matthew",16,19,"Keys and binding/loosing","ecclesiology"],
  ["John",20,23,"Forgiveness and retention of sins","sacraments"],
  ["Matthew",28,19,"Trinitarian baptism","trinity"],
  ["1Timothy",3,15,"Church as pillar of truth","ecclesiology"],
  ["2Thessalonians",2,14,"Holding traditions; original Catholic numbering differs from common numbering","tradition"],
  ["James",2,24,"Justification and works","soteriology"],
  ["Romans",8,28,"Providence and cooperation with grace","soteriology"],
  ["Matthew",5,28,"Lust and adultery","morality"],
  ["1Corinthians",13,4,"Charity vocabulary and readable syntax","readability"],
  ["Acts",2,42,"Teaching, fellowship and breaking of bread","readability"],
  ["Proverbs",3,5,"Trust and prudence","readability"],
  ["Psalms",22,1,"Vulgate Psalm 22 vs modern 23","versification"],
  ["Sirach",24,1,"Deuterocanonical wisdom, Marian traditional application","deuterocanon"],
  ["Tobit",12,9,"Almsgiving and sin","deuterocanon"],
  ["2Maccabees",12,46,"Prayer for the dead; confirm printed Vulgate verse references","deuterocanon"],
  ["Wisdom",2,12,"Suffering of the just","deuterocanon"],
  ["Baruch",3,36,"Wisdom, revelation and Christological reading","deuterocanon"],
  ["Revelation",12,1,"Woman clothed with the sun","marian"]
].map(([book,chapter,verse,issue,domain])=>
  Object.freeze({book,chapter,verse,issue,domain})));

function indexCorpus(doc){
  if(!Array.isArray(doc?.books))throw new Error("Corpus books missing");
  const index=new Map();
  for(const book of doc.books){
    if(!CATHOLIC_BOOK_IDS.includes(book.id))throw new Error("Noncanonical book "+book.id);
    for(const chapter of book.chapters){
      for(const verse of chapter.verses){
        const id=`${book.id}:${chapter.number}:${verse.number}`;
        if(index.has(id))throw new Error("Repeated verse "+id);
        index.set(id,typeof verse.text==="string"?verse.text:"");
      }
    }
  }
  return index;
}
export function buildCpdvEditorialComparison(douay,cpdv){
  if(douay?.editionId!=="dr-challoner"||cpdv?.editionId!=="cpdv-2009")
    throw new Error("Wrong Bible witnesses for comparison");
  const old=indexCorpus(douay),newer=indexCorpus(cpdv);
  const rows=CPDV_EDITORIAL_CHECKLIST.map(item=>{
    const reference=`${item.book} ${item.chapter}:${item.verse}`;
    const key=`${item.book}:${item.chapter}:${item.verse}`;
    const dr=old.get(key)??null,cp=newer.get(key)??null;
    const anomalies=[];
    if(dr===null||cp===null)anomalies.push("missing-reference");
    if(dr!==null&&!dr.trim())anomalies.push("empty-douay-slot");
    if(cp!==null&&!cp.trim())anomalies.push("empty-cpdv-slot");
    if(["Psalms","Baruch","Tobit","Sirach","2Maccabees"].includes(item.book))
      anomalies.push("edition-versification-must-be-confirmed");
    return {
      ...item,reference,
      douayRheims:dr,cpdv:cp,automatedFlags:anomalies,
      wordingReview:"pending",doctrinalReview:"pending",readabilityReview:"pending",
      reviewer:null,reviewDate:null,sourcePageUrl:null,
      approvedForPublication:false
    };
  });
  return {
    schemaVersion:1,decision:"cpdv-selected-as-free-alternative-pending-verification",
    witnesses:{douay:"dr-challoner",alternative:"cpdv-2009"},
    totalReviewItems:rows.length,
    coordinateAvailable:rows.filter(r=>r.douayRheims?.trim()&&r.cpdv?.trim()).length,
    automatedFlagged:rows.filter(r=>r.automatedFlags.length).length,
    doctrinallyCertified:0,verseCollationCertified:0,
    note:"Side-by-side text triage only; a machine cannot approve biblical theology, Catholic fidelity or precise edition-specific versification.",
    items:rows
  };
}
async function main(){
  const base=process.argv[2]||"artifacts/scripture-candidates";
  const [a,b]=await Promise.all(["DRC","CPDV"].map(x=>readFile(resolve(base,x+"-canonical-candidate.json"),"utf8").then(JSON.parse)));
  const report=buildCpdvEditorialComparison(a,b);
  await mkdir(resolve(base),{recursive:true});
  await writeFile(resolve(base,"CPDV-vs-Douay-theological-review.json"),JSON.stringify(report,null,2)+"\n");
  console.log(JSON.stringify({
    comparisonItems:report.totalReviewItems,coordinateAvailable:report.coordinateAvailable,
    automaticallyFlagged:report.automatedFlagged,doctrinallyCertified:0,
    verseCollationCertified:0,status:"AWAITING HUMAN CATHOLIC EDITORIAL VERIFICATION"
  }));
}
if(process.argv[1] && import.meta.url===pathToFileURL(resolve(process.argv[1])).href)await main();
