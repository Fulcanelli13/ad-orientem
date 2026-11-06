// Research-only 1961 GABC source-phrase equality. NOT facsimile collation.
// Source records checked against downloadable GregoBase GABC 2026-11-06.
import {createHash} from "node:crypto";
import {mkdir,readFile,writeFile} from "node:fs/promises";
import {dirname} from "node:path";
import {fileURLToPath} from "node:url";
import {PARTICIPATION_REFERENCE_SCORES} from "../../src/mass/reader-participation-reference-scores.js";
import {GOSPEL_1961_REFERENCE_WITNESSES} from "../../src/mass/reader-gospel-response-reference-scores.js";
import {DISMISSAL_VARIANT_ORIGINAL_WITNESSES} from "../../src/mass/reader-dismissal-variant-reference-scores.js";
import {CANON_PAX_1961_WITNESSES} from "../../src/mass/reader-canon-pax-response-reference-scores.js";
import {printedPlatesForParticipationScore,PARTICIPATION_1961_PRINTED_PLATES}
 from "../../src/mass/reader-participation-printed-plates.js";

export const SOURCE_PHRASE_AUDIT_SCHEMA="ao-mass-1961-24-source-gabc-phrase-equality-v1";
// Independent verbatim opening-phrase snapshots downloaded from the
// #961/#749 full Gregorian transcription; their other verses are not
// necessary for this narrowly scoped first-phrase check.
const ORDINARY_FIRST_PHRASES=Object.freeze({
 961:"name:Gloria VIII;\n%%\n(c3) GLó(h')ri(h)a(f') in(e) ex(d)cél(e')sis(f) De(e.)o.(d.) (::)",
 749:"name:Credo III;\n%%\n(c3) CRe(h)do(f) in(d) u(gxg)num(f) De(fvED)um,(d.) (::)"
});
const sourceUrl=id=>"https://gregobase.selapa.net/download.php?elem=1&format=gabc&id="+id;
const digest=x=>createHash("sha256").update(x,"utf8").digest("hex");
const body=gabc=>{
 if(typeof gabc!=="string"||!gabc.includes("%%"))
  throw Error("MISSING_ORIGINAL_GABC_BODY");
 return gabc.slice(gabc.indexOf("%%")+2).trim();
};
const phrases=gabc=>body(gabc).split("(::)").map(x=>x.trim()).filter(Boolean);
const clef=gabc=>body(gabc).match(/^\(([cf][1-4])\)/)?.[1]??null;
/** Strip only layout separators; never alter a pitch, rhythmic sign,
 * quilisma, cadence, lyric, accent or neume group. */
export function stripSourceLayout(raw,sourceId,index){
 let v=String(raw??"").trim();
 if(v.startsWith("(Z-)"))v=v.slice(4).trim();
 else if(v.startsWith("(Z)"))v=v.slice(3).trim();
 if(v.startsWith("~")){
  if(!(sourceId===2901&&index===1))
   throw Error("UNEXPECTED_SOURCE_LAYOUT_TILDE_"+sourceId);
  v=v.replace(/^~+/,"").trim();
 }
 return v.replace(/^\([cf][1-4]\)\s*/,"").trim();
}
const exact=x=>String(x??"").replace(/\s+/g,"");
export function compareExactArchivedPhrase(score,sourceGabc){
 const originalClef=clef(sourceGabc),actualClef=clef(score?.gabc);
 const fragment=phrases(sourceGabc)[score?.sourcePhraseIndex];
 if(!originalClef||!actualClef||!fragment)
  return Object.freeze({match:false,reason:"MISSING_CLEF_OR_SOURCE_PHRASE"});
 const original=exact(stripSourceLayout(fragment,score.sourceId,score.sourcePhraseIndex));
 const excerpt=exact(stripSourceLayout(
  body(score.gabc).replace(/\(::\)\s*$/,""),score.sourceId,score.sourcePhraseIndex));
 const match=originalClef===actualClef&&original===excerpt;
 return Object.freeze({
  match,
  reason:originalClef!==actualClef?"SOURCE_CLEF_MISMATCH":
   original!==excerpt?"SOURCE_GABC_NOTE_OR_TEXT_MISMATCH":"SOURCE_GABC_PHRASE_EXACT",
  originalSha256:digest(original),excerptSha256:digest(excerpt),
  originalClef,excerptClef:actualClef
 });
}
export async function build24PhraseSourceAudit(){
 const m05=JSON.parse(await readFile(new URL(
  "../../data/research/mass-music-m05-cc0-gabc-seven-20261031.v1.json",import.meta.url),"utf8"));
 if(m05.schema!=="ao-mass-music-m05-cc0-gabc-research-v1")
  throw Error("M05_GABC_RESEARCH_SCHEMA_CHANGED");
 const sources=new Map();
 const add=(id,gabc,scope,document)=>{
  const key=Number(id),present=sources.get(key);
  if(present){
   if(exact(body(present.gabc))!==exact(body(gabc)))
    throw Error("CONFLICTING_ARCHIVED_SOURCE_"+id);
   return;
  }
  sources.set(key,{gabc,scope,document,download:sourceUrl(key)});
 };
 for(const x of m05.scores.filter(x=>[4449,4450,4487,7282].includes(x.sourceId)))
  add(x.sourceId,x.gabc,"FULL_SOURCE","data/research/mass-music-m05-cc0-gabc-seven-20261031.v1.json");
 for(const x of GOSPEL_1961_REFERENCE_WITNESSES)
  add(x.sourceId,x.gabc,"FULL_SOURCE","src/mass/reader-gospel-response-reference-scores.js");
 for(const x of DISMISSAL_VARIANT_ORIGINAL_WITNESSES)
  add(x.sourceId,x.fullSourceGabc,"FULL_SOURCE","src/mass/reader-dismissal-variant-reference-scores.js");
 for(const x of CANON_PAX_1961_WITNESSES)
  add(x.sourceId,x.fullSourceGabc,"FULL_SOURCE","src/mass/reader-canon-pax-response-reference-scores.js");
 for(const [id,gabc] of Object.entries(ORDINARY_FIRST_PHRASES))
  add(id,gabc,"INDEPENDENT_DOWNLOAD_FIRST_PHRASE_ONLY_2026_11_06",
   "https://gregobase.selapa.net/chant.php?id="+id);
 if(sources.size!==11||PARTICIPATION_1961_PRINTED_PLATES.length!==11)
  throw Error("EXPECTED_11_ORIGINAL_GABC_SOURCES");
 if(PARTICIPATION_REFERENCE_SCORES.length!==24)
  throw Error("EXPECTED_ALL_24_RESEARCH_EXCERPTS");
 const rows=PARTICIPATION_REFERENCE_SCORES.map(s=>{
  const origin=sources.get(s.sourceId),plates=printedPlatesForParticipationScore(s.sourceId);
  if(!origin||!plates||s.publicScoreApproved!==false||plates.publicScoreApproved!==false||
    s.sourceUrl!=="https://gregobase.selapa.net/chant.php?id="+s.sourceId)
   throw Error("INVALID_ARCHIVE_OR_PRINTED_WITNESS_"+s.id);
  const comparison=compareExactArchivedPhrase(s,origin.gabc);
  return {
   scoreId:s.id,sourceId:s.sourceId,sourcePhraseIndex:s.sourcePhraseIndex,
   cueIds:[...s.sourceCueIds],sourceDownload:origin.download,
   sourceGabcSnapshot:origin.document,sourceScope:origin.scope,
   originalPrinted1961Plates:plates.plates.map(p=>p.url),
   gabcPhraseEquality:comparison.reason,
   sourceClef:comparison.originalClef??null,excerptClef:comparison.excerptClef??null,
   sourcePhraseSha256:comparison.originalSha256??null,
   excerptPhraseSha256:comparison.excerptSha256??null,
   facsimileMusicalNoteParity:"PENDING_NOTE_BY_NOTE_REVIEW",
   liturgicalContextReview:"UNCHANGED",
   publicScoreApproved:false
  };
 });
 const exactMatches=rows.filter(x=>x.gabcPhraseEquality==="SOURCE_GABC_PHRASE_EXACT").length;
 return {schema:SOURCE_PHRASE_AUDIT_SCHEMA,sourceCheckedDate:"2026-11-06",
  boundary:"Original GABC phrase consistency only; NOT independent 1961 printed-neume comparison or approved public score.",
  counts:{originalSourceRecords:sources.size,archivedExcerpts:rows.length,
   identicalSourcePhrases:exactMatches,sourceDrift:rows.length-exactMatches,
   printedNeumeCollationsApproved:0,newPublicApprovals:0},rows};
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
 const audit=await build24PhraseSourceAudit();
 const dest=fileURLToPath(new URL("../../.tmp/mass-participation-24-review/source-gabc-phrase-equality.json",import.meta.url));
 await mkdir(dirname(dest),{recursive:true});
 await writeFile(dest,JSON.stringify(audit,null,2)+"\n","utf8");
 if(audit.counts.identicalSourcePhrases!==24||audit.counts.sourceDrift!==0)
  throw Error("1961_ARCHIVED_GABC_SOURCE_PHRASE_DRIFT");
 console.log("PASS 24/24 source-exact GABC excerpts; 11 sources; 0 public approvals",dest);
}
