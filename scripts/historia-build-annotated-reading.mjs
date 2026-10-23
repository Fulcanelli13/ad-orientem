#!/usr/bin/env node
/**
 * Materialize a research-only Historia manuscript directly from the existing
 * P3 source owner and existing Catholic witness files. Never overwrite those
 * sources or promote held passages by generating a reading.
 *
 * node scripts/historia-build-annotated-reading.mjs dr-challoner
 * node scripts/historia-build-annotated-reading.mjs crampon-1923 /tmp/historia-fr.md
 * node scripts/historia-build-annotated-reading.mjs --reading dr-challoner
 *
 * The reading output is a derived, unapproved view — not a new source registry.
 */
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {resolve,dirname} from "node:path";
import {assembleHistoriaReading,historiaAssemblyMarkdown,historiaReadableMarkdown,HISTORIA_EDITIONS} from "../src/scripture/historia-assembled-reading.js";

const isReading=process.argv[2]==="--reading";
const edition=(isReading?process.argv[3]:process.argv[2])||"dr-challoner";
if(!HISTORIA_EDITIONS.includes(edition)){
  process.stderr.write("Expected one of: "+HISTORIA_EDITIONS.join(", ")+"\n");
  process.exit(2);
}
const root=new URL("../",import.meta.url);
const read=path=>JSON.parse(readFileSync(new URL(path,root),"utf8"));
const proof=read("data/research/historia-salutis-v18-continuous-reading-proof.v1.json");
const assembly=assembleHistoriaReading(proof,edition,book=>read("data/scripture/witness/"+edition+"/"+book+".json"));
const targetArg=isReading?process.argv[4]:process.argv[3];
const defaultPath=isReading?
  "data/research/historia-salutis-p3-continuous-research-reading-"+edition+".v1.md":
  "data/research/historia-salutis-p3-assembled-"+edition+".v1.md";
const target=resolve(targetArg||defaultPath);
mkdirSync(dirname(target),{recursive:true});
writeFileSync(target,isReading?historiaReadableMarkdown(assembly):historiaAssemblyMarkdown(assembly),"utf8");
process.stdout.write("Wrote "+target+"; "+JSON.stringify(assembly.totals)+"; all source and editorial statuses remain unapproved.\n");
