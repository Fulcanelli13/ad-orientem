#!/usr/bin/env node
/**
 * Materialize a research-only Historia manuscript directly from the existing
 * P3 source owner and existing Catholic witness files. Never overwrite those
 * sources or promote held passages by generating a reading.
 *
 * node scripts/historia-build-annotated-reading.mjs dr-challoner
 * node scripts/historia-build-annotated-reading.mjs crampon-1923 /tmp/historia-fr.md
 */
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {resolve,dirname} from "node:path";
import {assembleHistoriaReading,historiaAssemblyMarkdown,HISTORIA_EDITIONS} from "../src/scripture/historia-assembled-reading.js";

const edition=process.argv[2]||"dr-challoner";
if(!HISTORIA_EDITIONS.includes(edition)){
  process.stderr.write("Expected one of: "+HISTORIA_EDITIONS.join(", ")+"\n");
  process.exit(2);
}
const root=new URL("../",import.meta.url);
const read=path=>JSON.parse(readFileSync(new URL(path,root),"utf8"));
const proof=read("data/research/historia-salutis-v18-continuous-reading-proof.v1.json");
const assembly=assembleHistoriaReading(proof,edition,book=>read("data/scripture/witness/"+edition+"/"+book+".json"));
const target=resolve(process.argv[3]||("data/research/historia-salutis-p3-assembled-"+edition+".v1.md"));
mkdirSync(dirname(target),{recursive:true});
writeFileSync(target,historiaAssemblyMarkdown(assembly),"utf8");
process.stdout.write("Wrote "+target+"; "+JSON.stringify(assembly.totals)+"; all source and editorial statuses remain unapproved.\n");
