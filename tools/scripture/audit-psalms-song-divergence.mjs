#!/usr/bin/env node
import {readFile,writeFile} from "node:fs/promises";
import {resolve,join} from "node:path";
const WATCH=["Psalms","SongOfSongs"];
function cpdv(master){
 return new Map(master.verses.map(x=>[x.chapter+":"+x.verse,x.text]));
}
function douay(data,book){
 const source=data.books.find(x=>x.id===book);
 if(!source)throw Error("Missing Catholic book "+book);
 return new Map(source.chapters.flatMap(c=>c.verses.map(x=>[c.number+":"+x.number,x.text])));
}
function byChapter(entries){
 const m=new Map();
 for(const id of entries.keys()){
  const chapter=Number(id.split(":")[0]);
  m.set(chapter,(m.get(chapter)||0)+1);
 }
 return m;
}
export function auditUnalignedBooks(cp,douayCorpus){
 const audits=[];
 for(const book of WATCH){
  const master=cp[book];
  if(master?.editionId!=="cpdv-2009"||master.book!==book)throw Error("Wrong original CPDV "+book);
  const c=cpdv(master),d=douay(douayCorpus,book);
  const cpCount=byChapter(c),drCount=byChapter(d);
  const cpOnly=[...c.keys()].filter(k=>!d.has(k));
  const drOnly=[...d.keys()].filter(k=>!c.has(k));
  const changedChapterLengths=[...new Set([...cpCount.keys(),...drCount.keys()])]
   .filter(ch=>cpCount.get(ch)!==drCount.get(ch))
   .map(ch=>({chapter:ch,cpdvVerses:cpCount.get(ch)||0,douayVerses:drCount.get(ch)||0}));
  audits.push({
   book,cpdvSourceUrl:master.sourceUrl,cpdvPageSha256:master.sourceSha256,
   cpdvVerses:c.size,douayVerses:d.size,
   coordinatesOnlyInCpdv:cpOnly,coordinatesOnlyInDouay:drOnly,
   changedChapterLengths,
   status:"NO_AUTO_PARALLEL_UNTIL_PASSAGE_SOURCE_MAPPING_IS_SIGNED_OFF"
  });
 }
 return {
  schemaVersion:1,completeEstherExcludedBecauseItsCrosswalkIsSourceCollated:true,
  books:audits,verifiedParallelMaps:0,
  assessment:"Book-specific coordinate-gap inventory, not semantic verse equivalence"
 };
}
if(process.argv[2]){
 const root=resolve(process.argv[2]);
 const [douayCorpus,ps,song]=await Promise.all([
  readFile(join(root,"DRC-canonical-candidate.json"),"utf8").then(JSON.parse),
  readFile(join(root,"cpdv-author-master-books/Psalms.json"),"utf8").then(JSON.parse),
  readFile(join(root,"cpdv-author-master-books/SongOfSongs.json"),"utf8").then(JSON.parse)
 ]);
 const report=auditUnalignedBooks({Psalms:ps,SongOfSongs:song},douayCorpus);
 await writeFile(join(root,"Psalms-Song-Catholic-verse-divergence.json"),JSON.stringify(report,null,2)+"\n");
 console.log("Unmapped source verses quantified: "+report.books.map(b=>
  b.book+" CP="+b.cpdvVerses+" DR="+b.douayVerses+
  " CP-only="+b.coordinatesOnlyInCpdv.length+" DR-only="+b.coordinatesOnlyInDouay.length+
  " changed chapters="+b.changedChapterLengths.length).join("; "));
}
