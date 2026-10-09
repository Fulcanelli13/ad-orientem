import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
/** Curated first-party factual Mass updates; third-party compilation dumps are NOT an eligible input.
 * The importer never visits a site or claims to verify a web page. The evidence must first
 * be checked by an editor and backed by explicit original URL + liturgical assertion.
 */
const asText=x=>String(x??"").trim();
const canonical=x=>asText(x).normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
function safeUrl(s){try{const u=new URL(s);return u.protocol==="https:"&&!!u.hostname}catch{return false}}
const permittedKinds=new Set(["PARISH_OFFICIAL","DIOCESE_OFFICIAL","ORATORY_OFFICIAL","COMMUNITY_OFFICIAL","CATHEDRAL_OFFICIAL","SHRINE_OFFICIAL","LOCAL_TRADITIONAL_MASS_ASSOCIATION"]);
function fingerprint(r){return asText(r.cc).toUpperCase()+"|"+canonical(r.l)+"|"+canonical(r.n)}
function street(r){
 const a=canonical(r.a);
 return /^\d/.test(a)&&a.length>=14?asText(r.cc).toUpperCase()+"|"+a:null;
}
export function stageFirstPartyMassBatch(snapshot,manifest,{additionalExisting=[]}={}){
 if(!Array.isArray(snapshot?.records)||!Array.isArray(manifest?.records))throw Error("Expected research snapshot and array of candidate records");
 const current=snapshot.records.concat(additionalExisting.flatMap(x=>x.records??[]));
 const byId=new Set(current.map(r=>asText(r.u)).filter(Boolean));
 const names=new Set(current.map(fingerprint).filter(Boolean));
 const streets=new Set(current.map(street).filter(Boolean));
 const accepted=[],holds=[];const newlySeen=new Set();
 for(const row of manifest.records){
  const id=asText(row?.u),name=asText(row?.n),cc=asText(row?.cc).toUpperCase();
  const sourcesOk=safeUrl(row?.su)&&safeUrl(row?.eu);
  const mass=asText(row?.sr);
  const reason=asText(row?.editorial_liturgical_evidence);
  let why=null;
  if(!id||!name||!/^[A-Z]{2}$/.test(cc)||!asText(row?.l)||!mass)why="MISSING_MASS_IDENTITY";
  else if(!sourcesOk||!permittedKinds.has(asText(row?.st)))why="NOT_ORIGINAL_OR_APPROVED_DIRECT_ORGANISER_EVIDENCE";
  else if(!/^\d{4}-\d{2}-\d{2}$/.test(asText(row?.vv))||reason.length<24)why="MISSING_CURRENT_EDITORIAL_FORM_REVIEW";
  else if(byId.has(id)||newlySeen.has(id))why="EXISTING_SOURCE_ID";
  else if(names.has(fingerprint(row))||(street(row)&&streets.has(street(row))))why="POTENTIAL_EXISTING_PHYSICAL_VENUE";
  if(why){holds.push({u:id,name,cc,reason:why});continue}
  const clean={...row};delete clean.editorial_liturgical_evidence;
  accepted.push(clean);
  newlySeen.add(id);names.add(fingerprint(row));if(street(row))streets.add(street(row));
 }
 return {accepted,holds,summary:{input:manifest.records.length,accepted:accepted.length,held:holds.length,unchanged_existing:snapshot.records.length}};
}
export function mergeStagedFirstPartyMasses(snapshot,staged){
 return {...snapshot,records:[...snapshot.records,...staged.accepted]};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [snapshotFile,manifestFile,outputFile,...flags]=process.argv.slice(2);
 if(!snapshotFile||!manifestFile)throw Error("Usage: node tools/directory/ingest-firstparty-mass-batch.mjs SNAPSHOT.json MANIFEST.json [OUTPUT.json] [--write]");
 const snapshot=JSON.parse(fs.readFileSync(snapshotFile,"utf8"));
 const manifest=JSON.parse(fs.readFileSync(manifestFile,"utf8"));
 const staged=stageFirstPartyMassBatch(snapshot,manifest);
 console.log(JSON.stringify({...staged.summary,holds:staged.holds},null,2));
 if(flags.includes("--write")){
  if(!outputFile)throw Error("--write requires an output path");
  fs.mkdirSync(path.dirname(outputFile),{recursive:true});
  fs.writeFileSync(outputFile,JSON.stringify(mergeStagedFirstPartyMasses(snapshot,staged),null,2)+"\n");
 }
}
