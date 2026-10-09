#!/usr/bin/env node
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve,join } from "node:path";
import { createHash } from "node:crypto";
import { validateScriptureImport } from "../../src/scripture/import-contract.js";
/** Offline-only import. Requires an already vetted, normalised Catholic corpus. */
const [sourcePath,outputDir]=process.argv.slice(2);
if(!sourcePath||!outputDir){
 console.error("Usage: node tools/scripture/compile-books.mjs verified-input.json output-directory");
 process.exit(2);
}
const data=JSON.parse(await readFile(resolve(sourcePath),"utf8"));
const checked=validateScriptureImport(data);
if(!checked.valid)throw new Error("Scripture import refused: "+checked.failures.join("; "));
const out=resolve(outputDir);
await mkdir(out,{recursive:true});
const all=checked.records;
const books=[...new Set(all.map(v=>v.book))];
const manifest={schemaVersion:1,editionId:data.editionId,
 provenance:data.provenance,bookCount:checked.bookCount,verseCount:checked.verseCount,books:[]};
for(const book of books){
 const records=all.filter(x=>x.book===book);
 const bytes=JSON.stringify(records);
 const checksum=createHash("sha256").update(bytes).digest("hex");
 const file=book+".json";
 await writeFile(join(out,file),bytes+"\n");
 manifest.books.push({id:book,file,verseCount:records.length,sha256:checksum});
}
await writeFile(join(out,"manifest.json"),JSON.stringify(manifest,null,2)+"\n");
console.log("Verified Scripture pack compiled: "+checked.bookCount+" books, "+checked.verseCount+" verses.");
