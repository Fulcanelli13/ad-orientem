/**
 * Deterministic all-Gospel lexical concordance built ONLY from the 23 pinned
 * Catena chapter packs. Run with --check in CI; no generated commentary.
 */
import {readFileSync,writeFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {catenaSearchTerms} from "../../src/scripture/catena-messenger.js";

const root=new URL("../../data/scripture/catena/chunks/",import.meta.url);
const manifest=JSON.parse(readFileSync(new URL("manifest.v1.json",root),"utf8"));
if(manifest.schema!=="ao.catena-aurea.chapter-packs-manifest.v1"||
   manifest.chunks?.length!==23||manifest.totals?.pericopes!==814||
   manifest.totals?.fragments!==12692)throw Error("Untrusted Catena manifest");
const paragraphs=[],terms=new Map();
let fragmentCount=0;
const books=["matthew","mark","luke","john"];
for(const book of books){
 const chunks=manifest.chunks.filter(x=>x.gospel===book).sort((a,b)=>a.firstChapter-b.firstChapter);
 for(const chunk of chunks){
  const raw=readFileSync(new URL(chunk.file,root),"utf8");
  const hash=createHash("sha1").update("blob "+Buffer.byteLength(raw)+"\0").update(raw).digest("hex");
  if(hash!==chunk.blobSha||Buffer.byteLength(raw)!==chunk.bytes)
   throw Error("Catena original pack hash mismatch: "+chunk.file);
  const pack=JSON.parse(raw);
  if(pack.gospel!==book||pack.pericopes?.length!==chunk.pericopes)
   throw Error("Catena pack source mismatch");
  for(const p of pack.pericopes){
   const key=p.verse_keys?.[0]?.split("/");
   if(!key||key.length!==3||key[0]!==book||
      !Array.isArray(p.segments)||typeof p.id!=="string"||
      p.id!==("catena."+book+"."+p.citation.split(", "+book[0].toUpperCase()+book.slice(1)+" ")[1]?.replace(":",".").replaceAll("–","-")))
    { // Pericope IDs are source-owned; validate shape, not reconstructed citation spelling.
     if(!/^catena\.(matthew|mark|luke|john)\.\d+\./.test(p.id))throw Error("Catena pericope ID invalid");
    }
   const index=paragraphs.length;
   paragraphs.push([p.id,book,Number(key[1]),Number(key[2])]);
   fragmentCount+=p.segments.length;
   const vocab=new Set();
   for(const seg of p.segments){
    if(typeof seg.text!=="string"||!seg.text||typeof seg.father!=="string"||!seg.father)
      throw Error("Unattributed or empty Catena excerpt");
    for(const term of catenaSearchTerms(seg.text))vocab.add(term);
   }
   for(const word of vocab){
    if(!terms.has(word))terms.set(word,[]);
    terms.get(word).push(index);
   }
  }
 }
}
if(paragraphs.length!==814||fragmentCount!==12692||
   new Set(paragraphs.map(p=>p[0])).size!==814)
 throw Error("Catena global census mismatch");
const lexicon=Object.fromEntries([...terms.entries()].sort(([a],[b])=>a.localeCompare(b,"en"))
 .map(([term,ids])=>[term,ids.map(n=>n.toString(36)).join(".")]));
const index={
 schema:"ao.catena.global-lexicon.v1",
 sourceCommit:manifest.sourceCommit,edition:"Oxford/Newman 1841–45",
 pericopeCount:paragraphs.length,fragmentCount,
 // An entry identifies an original pericope and its first exact verse key.
 // Returned text must STILL be loaded through the integrity-checked pack loader.
 pericopes:paragraphs,lexicon
};
const out=JSON.stringify(index)+"\n",path=new URL("../../data/scripture/catena/global-lexicon.v1.json",import.meta.url);
if(process.argv.includes("--check")){
 const before=readFileSync(path,"utf8");
 if(before!==out)throw Error("Global Catena lexicon is not reproducible from source");
}else writeFileSync(path,out);
console.log("PASS Catena lexical concordance: "+paragraphs.length+" pericopes, "+fragmentCount+" excerpts, "+terms.size+" terms, "+Buffer.byteLength(out)+" bytes");
