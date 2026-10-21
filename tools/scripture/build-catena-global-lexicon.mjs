/**
 * Rebuild the four source-faithful Gospel concordances from the exact,
 * source-pinned Catena packs. --check guards against stale search data.
 * The index contains no Father-attributed quotations, only lexical locators.
 */
import {readFileSync,writeFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {catenaSearchTerms} from "../../src/scripture/catena-messenger.js";

const root=new URL("../../data/scripture/catena/chunks/",import.meta.url);
const manifest=JSON.parse(readFileSync(new URL("manifest.v1.json",root),"utf8"));
if(manifest.schema!=="ao.catena-aurea.chapter-packs-manifest.v1"||
   manifest.chunks?.length!==23||manifest.totals?.pericopes!==814||
   manifest.totals?.fragments!==12692)throw Error("Catena source manifest mismatch");
const counts={matthew:[278,4825],mark:[104,1451],luke:[245,3660],john:[187,2756]};
let totalPericopes=0,totalFragments=0;
for(const [gospel,[wantP,wantF]] of Object.entries(counts)){
 const paragraphs=[],terms=new Map();let fragments=0;
 const chunks=manifest.chunks.filter(x=>x.gospel===gospel)
  .sort((a,b)=>a.firstChapter-b.firstChapter);
 for(const chunk of chunks){
  const raw=readFileSync(new URL(chunk.file,root),"utf8");
  const hash=createHash("sha1").update("blob "+Buffer.byteLength(raw)+"\0").update(raw).digest("hex");
  if(hash!==chunk.blobSha||Buffer.byteLength(raw)!==chunk.bytes)
   throw Error("Original Catena pack hash mismatch: "+chunk.file);
  const pack=JSON.parse(raw);
  if(pack.gospel!==gospel||pack.pericopes?.length!==chunk.pericopes)
   throw Error("Chapter-pack census failure");
  for(const p of pack.pericopes){
   const key=p.verse_keys?.[0]?.split("/");
   if(!key||key.length!==3||key[0]!==gospel||
      !/^catena\.(matthew|mark|luke|john)\.\d+\./.test(p.id)||
      !Array.isArray(p.segments)||!p.segments.length)
    throw Error("Invalid original pericope coordinates");
   const index=paragraphs.length;
   paragraphs.push([p.id,Number(key[1]),Number(key[2])]);
   fragments+=p.segments.length;
   const vocabulary=new Set();
   for(const seg of p.segments){
    if(typeof seg.text!=="string"||!seg.text.trim()||
       typeof seg.father!=="string"||!seg.father.trim())
     throw Error("Unattributed commentary fragment");
    for(const term of catenaSearchTerms(seg.text))vocabulary.add(term);
   }
   for(const term of vocabulary){
    if(!terms.has(term))terms.set(term,[]);
    terms.get(term).push(index);
   }
  }
 }
 if(paragraphs.length!==wantP||fragments!==wantF||
    new Set(paragraphs.map(p=>p[0])).size!==wantP)
  throw Error("Full Gospel fragment census differs from source manifest");
 const lexicon=Object.fromEntries([...terms.entries()].sort(([a],[b])=>
  a<b?-1:a>b?1:0).map(([term,ids])=>[term,ids.map(n=>n.toString(36)).join(".")]));
 const index={schema:"ao.catena.gospel-lexicon.v1",sourceCommit:manifest.sourceCommit,
  gospel,pericopeCount:wantP,fragmentCount:wantF,
  pericopes:paragraphs,lexicon};
 const out=JSON.stringify(index)+"\n";
 const file=new URL("../../data/scripture/catena/lexicon/"+gospel+".v1.json",import.meta.url);
 if(process.argv.includes("--check")){
  if(readFileSync(file,"utf8")!==out)throw Error("Stale indexed Catena "+gospel);
 }else writeFileSync(file,out);
 totalPericopes+=paragraphs.length;totalFragments+=fragments;
 console.log("PASS "+gospel+" Catena concordance: "+paragraphs.length+
  " source pericopes, "+fragments+" excerpts, "+terms.size+
  " lexical terms, "+Buffer.byteLength(out)+" bytes");
}
if(totalPericopes!==814||totalFragments!==12692)throw Error("Global Catena lexicon census");
