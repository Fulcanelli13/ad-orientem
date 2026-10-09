#!/usr/bin/env node
import {readFile,writeFile} from "node:fs/promises";
import {resolve,join} from "node:path";
import {SONG_CROSSWALK_ENDS,songParallelVerse,songCrosswalkCoverage} from "../../src/scripture/song-catholic-crosswalk.js";
import {PSALTER_SOURCE_REGIONS,psalterParallelVerse,PSALTER_EXCEPTION_STATUS} from "../../src/scripture/psalter-exception-crosswalk.js";
const STOP=new Set("and the for but was who his her all that with when had they are were this him you she from them its unto thee thy thou thine have to it of my in will shall has at is he be as or by so our we upon out up into do their on yet not a an i".split(" "));
const words=text=>new Set((String(text).toLowerCase().match(/[a-z]{2,}/g)||[]).filter(w=>!STOP.has(w)));
function lexicalMatch(a,b){
 const x=words(a),y=words(b);
 return (x.size+y.size)?2*[...x].filter(w=>y.has(w)).length/(x.size+y.size):0;
}
function sourceMap(data,book){
 const source=data.books.find(x=>x.id===book);
 if(!source)throw Error("Missing Douay "+book);
 const result=new Map();
 for(const chapter of source.chapters)for(const verse of chapter.verses){
  const key=chapter.number+":"+verse.number;
  if(result.has(key))throw Error("Duplicate Douay "+book+" "+key);
  if(verse.text?.trim())result.set(key,verse.text);
 }
 return result;
}
function masterMap(data,book){
 if(data?.editionId!=="cpdv-2009"||data.book!==book)throw Error("Wrong original CPDV "+book);
 return new Map(data.verses.map(x=>[x.chapter+":"+x.verse,x.text]));
}
export function auditSongOfSongs(author,douayCorpus){
 const cp=masterMap(author,"SongOfSongs"),dr=sourceMap(douayCorpus,"SongOfSongs");
 const cpUsed=new Set(),drUsed=new Set(),findings=[];
 for(const [chText,ends] of Object.entries(SONG_CROSSWALK_ENDS)){
  const chapter=Number(chText);
  let previous=0;
  for(let i=0;i<ends.length;i++){
   const drVerse=i+1,cpStart=previous+1,cpEnd=ends[i],drKey=chapter+":"+drVerse;
   const douayText=dr.get(drKey);
   if(!douayText)throw Error("Missing Catholic Song Douay verse "+drKey);
   const sourceParts=[];
   for(let v=cpStart;v<=cpEnd;v++){
    const key=chapter+":"+v,text=cp.get(key);
    if(!text?.trim()||cpUsed.has(key))throw Error("Unmapped/duplicate Catholic Song CPDV "+key);
    cpUsed.add(key);sourceParts.push(text);
    const inverse=songParallelVerse({book:"SongOfSongs",chapter,verseStart:v,verseEnd:v},"cpdv-2009","dr-challoner");
    if(inverse?.chapter!==chapter||inverse?.verseStart!==drVerse)throw Error("Nonreversible Catholic Song "+key);
   }
   drUsed.add(drKey);
   const forward=songParallelVerse({book:"SongOfSongs",chapter,verseStart:drVerse,verseEnd:drVerse},"dr-challoner","cpdv-2009");
   if(forward?.verseStart!==cpStart||forward?.verseEnd!==cpEnd)throw Error("Invalid Song source span "+drKey);
   const ratio=lexicalMatch(sourceParts.join(" "),douayText);
   if(ratio<.16)throw Error("Questionable Catholic Song wording alignment "+drKey+": "+ratio);
   findings.push({douay:drKey,cpdvStart:chapter+":"+cpStart,cpdvEnd:chapter+":"+cpEnd,
     sourceOverlap:Math.round(ratio*1000)/1000,
     differentVerseDivision:cpStart!==cpEnd,
     sourceReview:"PASS-LEXICAL-ORDER",doctrinalReview:"NOT_ATTESTED"});
   previous=cpEnd;
  }
 }
 if(cpUsed.size!==127||drUsed.size!==116||cp.size!==127||dr.size!==116||
  songCrosswalkCoverage().cpdv!==127)throw Error("Incomplete Catholic Song verse coverage");
 return {
  provenance:{cpdvUrl:author.sourceUrl,cpdvSha256:author.sourceSha256,
   drEdition:"Pinned Douay–Rheims Challoner"},
  counted:{cpdv:cpUsed.size,douay:drUsed.size,splitDivisions:127-116},
  status:"SOURCE-ORDER-ALIGNED-NOT-THEOLOGICALLY-CERTIFIED",findings
 };
}
export function auditPsalterExceptions(author,douayCorpus){
 const cp=masterMap(author,"Psalms"),dr=sourceMap(douayCorpus,"Psalms");
 const checked=[],exceptions=[];
 for(const rule of PSALTER_SOURCE_REGIONS){
  const key=rule.chapter+":"+rule.cpdvVerse;
  const text=cp.get(key);
  if(!text)throw Error("Missing original Psalm "+key);
  const verses=[];
  for(let n=rule.douayStart;n<=rule.douayEnd;n++){
   const target=dr.get(rule.chapter+":"+n);
   if(!target)throw Error("No Douay Psalm verse "+rule.chapter+":"+n);
   verses.push(target);
  }
  const ratio=lexicalMatch(text,verses.join(" "));
  if(ratio<.12)throw Error("Unverified Psalm source alignment "+key+" ratio="+ratio);
  const mapped=psalterParallelVerse({book:"Psalms",chapter:rule.chapter,verseStart:rule.cpdvVerse,verseEnd:rule.cpdvVerse},"cpdv-2009","dr-challoner");
  if(!mapped||mapped.verseStart!==rule.douayStart||mapped.verseEnd!==rule.douayEnd)
   throw Error("Psalm source mapping mismatch "+key);
  checked.push({source:key,to:rule.chapter+":"+rule.douayStart+"-"+rule.douayEnd,
   lexicalOverlap:Math.round(1000*ratio)/1000});
 }
 if(cp.has("92:1"))exceptions.push({reference:"Psalms 92:1",kind:"author-superscription-unmatched"});
 if(!dr.has("150:6"))exceptions.push({reference:"Psalms 150:6",kind:"blank-douay-digital-placeholder"});
 if(exceptions.length!==2)throw Error("Psalter unmatched source claims have changed");
 return {
  provenance:{cpdvUrl:author.sourceUrl,cpdvSha256:author.sourceSha256},
  mappedSourceVerses:checked.length,explicitUnmatched:exceptions,
  mappedChapters:PSALTER_EXCEPTION_STATUS.chapters,
  otherChapters:"PENDING-INDIVIDUAL-REFERENCE-CERTIFICATION",
  status:"PARTIAL-SOURCE-ALIGNED",checked
 };
}
if(process.argv[2]){
 const root=resolve(process.argv[2]);
 const [douay,cpSong,cpPsalm]=await Promise.all([
  readFile(join(root,"DRC-canonical-candidate.json"),"utf8").then(JSON.parse),
  readFile(join(root,"cpdv-author-master-books/SongOfSongs.json"),"utf8").then(JSON.parse),
  readFile(join(root,"cpdv-author-master-books/Psalms.json"),"utf8").then(JSON.parse)
 ]);
 const song=auditSongOfSongs(cpSong,douay),psalms=auditPsalterExceptions(cpPsalm,douay);
 await writeFile(join(root,"Song-Catholic-complete-source-crosswalk.json"),JSON.stringify(song,null,2)+"\n");
 await writeFile(join(root,"Psalms-exception-source-alignment.json"),JSON.stringify(psalms,null,2)+"\n");
 console.log("Song source-aligned "+song.counted.douay+" Douay ↔ "+song.counted.cpdv+
 " CPDV with "+song.counted.splitDivisions+" subdivided verse units; Psalms "+
 psalms.mappedSourceVerses+" exceptional CPDV source verse entries aligned, 2 unmatched noted.");
}
