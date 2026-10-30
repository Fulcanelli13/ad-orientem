#!/usr/bin/env node
/**
 * One-Sunday research audit of a pinned GABC corpus. Scores are NOT published,
 * redistributed, or wired into the reader. Rights and exact-text collation
 * remain separately required; this inventories sources only.
 */
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {resolve,join,dirname} from "node:path";
import {execFileSync} from "node:child_process";
import {createHash} from "node:crypto";

export const SOURCE_REPOSITORY="asbloomf/gabc-chants";
export const SOURCE_COMMIT="5787df436f5cd432dd95bcacdc911b3488dc3a8a";
export const PILOT_SUNDAY="2026-11-29";
export const PILOT_PART="SECOND";
export const SOURCES=Object.freeze([
  ["opening","DeusInAdjutorium.gabc"],
  ["antiphon-1","Advent1/Ant1-InIllaDie.gabc"],
  ["antiphon-2","Advent1/Ant2-Jucundare.gabc"],
  ["antiphon-3","Advent1/Ant3-EcceDominusVeniet.gabc"],
  ["antiphon-4","Advent1/Ant4-Omnes.gabc"],
  ["antiphon-5","Advent1/Ant5-EcceVeniet.gabc"],
  ["hymn","Advent/hymn-CreatorAlmeSiderum.gabc"],
  ["versicle","Advent/vr.gabc"],
  ["magnificat-antiphon","Advent1/MagnificatAntiphon.gabc"],
  ["dismissal","BenedicamusDomino/BenedicamusDomino_SundaysOfAdventAndLent.gabc"],
]);
const sha256=text=>createHash("sha256").update(text).digest("hex");
function header(body,name){
  const match=body.match(new RegExp("^"+name+":\\s*([^;\\n]+);","im"));
  return match?.[1]?.trim()??null;
}
export function inspectCandidateGabc({id,path,content}={}){
  if(typeof id!=="string"||typeof path!=="string"||typeof content!=="string")throw Error("CHANT_SOURCE_REQUIRED");
  const separator=content.indexOf("\n%%\n");
  if(separator<0)throw Error("CHANT_GABC_HEADER_DELIMITER_MISSING:"+path);
  const score=content.slice(separator+4);
  if(score.trim().length<25||!/\([c-f][1-4][^)]*\)/i.test(score))throw Error("CHANT_GABC_SCORE_NOT_DETECTED:"+path);
  const suspectedMacros=[...new Set([
    ...score.matchAll(/\\(?:gre[a-zA-Z]+|TeX[a-zA-Z]+|char\b)/g),
  ].map(x=>x[0]))];
  // GregorioTeX macros inside GABC cannot be presumed to render in Exsurge.
  const requiresAdaptation=suspectedMacros.length>0||/\[ev:\s*%/.test(score);
  return {
    id,path,sha256:sha256(content),bytes:Buffer.byteLength(content),
    incipit:header(content.slice(0,separator),"name"),
    mode:header(content.slice(0,separator),"mode"),
    transcriber:header(content.slice(0,separator),"transcriber"),
    officePart:header(content.slice(0,separator),"office-part"),
    requiresGabcAdaptation:requiresAdaptation,
    unsupportedMacroCandidates:suspectedMacros,
    scoreRights:"UNREVIEWED",liturgicalTextMatched:false,
    usableInApp:false,
  };
}
export function inspectAdventPsalmTemplate(tex){
  if(typeof tex!=="string")throw Error("CHANT_TEMPLATE_MISSING");
  const matches=[...tex.matchAll(/\\definepsalm\{([1-5])\}\{(\d+)\}\{(\d+)\}\{([^}]+)\}/g)];
  const psalms=matches.map(([,position,psalm,tone,ending])=>({
    position:Number(position),psalm:Number(psalm),tone:Number(tone),ending,
    scoreStatus:"TONE_METADATA_ONLY",scoreVerified:false,
  }));
  if(psalms.length!==5||psalms.some((x,i)=>x.position!==i+1))
    throw Error("CHANT_PSALM_TONES_INCOMPLETE");
  const magn=tex.match(/\\definemag\{(\d+)\}\{([^}]+)\}/);
  if(!magn)throw Error("CHANT_MAGNIFICAT_TONE_MISSING");
  return {psalms,magnificat:{tone:Number(magn[1]),ending:magn[2],
    scoreStatus:"TONE_METADATA_ONLY",scoreVerified:false}};
}
export function auditPinnedChantSource(root){
  const head=execFileSync("git",["-C",root,"rev-parse","HEAD"],{encoding:"utf8"}).trim();
  if(head!==SOURCE_COMMIT)throw Error("CHANT_SOURCE_PIN_MISMATCH");
  const candidates=SOURCES.map(([id,path])=>
    inspectCandidateGabc({id,path,content:readFileSync(join(root,path),"utf8")}));
  const tex=readFileSync(join(root,"Advent1/Advent1-Vespers2.tex"),"utf8");
  const tones=inspectAdventPsalmTemplate(tex);
  const needsAdaptation=candidates.filter(x=>x.requiresGabcAdaptation).map(x=>x.id);
  return {
    schema:"ao.office.native-sunday-chant-research.v1",
    sundayDate:PILOT_SUNDAY,part:PILOT_PART,
    sourceRepository:SOURCE_REPOSITORY,sourceRevision:SOURCE_COMMIT,
    composerTemplate:"Advent1/Advent1-Vespers2.tex",
    candidateCount:candidates.length,
    musicalRolesWithSourceCandidates:candidates.map(x=>x.id),
    candidates,tones,needsAdaptation,
    copyrightStatus:"UNRESOLVED_PER_FILE",
    liturgicalTextVerified:false,exsurgeRenderVerified:false,
    fullSundayVespersCertified:false,chantButtonEnabled:false,
    publishedScores:0,
  };
}
function cli(){
  const args=process.argv.slice(2);
  if(args.length!==4||args[0]!=="--upstream"||args[2]!=="--out")
    throw Error("USAGE: --upstream path --out path");
  const root=resolve(args[1]),output=resolve(args[3]);
  const report=auditPinnedChantSource(root);
  mkdirSync(dirname(output),{recursive:true});
  writeFileSync(output,JSON.stringify(report,null,2)+"\n","utf8");
  console.log("OFFICE_NATIVE_CHANT_CANDIDATES",JSON.stringify({
    sundayDate:report.sundayDate,candidates:report.candidateCount,
    psalmTones:report.tones.psalms.map(x=>x.tone+""+x.ending),
    magnificatTone:report.tones.magnificat.tone+""+report.tones.magnificat.ending,
    needsAdaptation:report.needsAdaptation,
    rights:report.copyrightStatus,published:report.publishedScores,
    buttonEnabled:report.chantButtonEnabled,
  }));
}
if(process.argv[1]&&new URL("file://"+resolve(process.argv[1])).href===import.meta.url){
  try{cli()}catch(error){console.error(String(error?.stack??error));process.exitCode=1}
}
