/**
 * One-time acquisition of two complete, distinct PUBLIC-DOMAIN historical
 * private Litany of the Saints source witnesses, pinned to Wikisource revisions.
 *
 * This script writes source text ONLY after the same original reader's
 * structural extraction succeeds. It does not modernize, silently emend,
 * translate, or merge French and English editions; it does not certify 1962.
 * Release runtime reads the resulting checked-in JSON, not the live site.
 *
 * Run once using the GitHub-only acquisition workflow.
 */
import {chromium} from "@playwright/test";
import {writeFile,mkdir} from "node:fs/promises";
import {createHash} from "node:crypto";
import {resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";
import {
 extractLitanyProper,paginateLitanyProper,reviewLitanyTranscription
} from "../../src/pray/litany-source.js";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"../..");
const witnesses=[
 {language:"en",edition:"Patrick F. Moran, Catholic Prayer Book and Manual of Meditations (1883)",
  oldid:12282621,
  url:"https://en.wikisource.org/w/index.php?title=The_Catholic_Prayer_Book_and_Manual_of_Meditations/The_Litany_of_the_Saints&oldid=12282621",
  file:"data/pray/private-litany-of-saints-1883-en.v1.json",opening:"Lord, have mercy on us.",ending:"Christ, have mercy on us."},
 {language:"fr",edition:"Pierre Corneille, Oeuvres, ed. Ch. Marty-Laveaux, vol. IX (1862)",
  oldid:14794744,
  url:"https://fr.wikisource.org/w/index.php?title=Œuvres_de_P._Corneille_(Marty-Laveaux)/Tome_9/Les_sept_psaumes_pénitentiaux&oldid=14794744",
  file:"data/pray/private-litany-of-saints-1862-fr.v1.json",opening:"Seigneur, ayez pitié de nous.",ending:"Seigneur, ayez pitié de nous."}
];
const browser=await chromium.launch({headless:true});
try{
 for(const w of witnesses){
  const page=await browser.newPage({locale:w.language==="fr"?"fr-FR":"en-GB",serviceWorkers:"block"});
  try{
   const response=await page.goto(w.url,{waitUntil:"domcontentloaded",timeout:60000});
   if(!response?.ok())throw Error(w.language+": historical Wikisource revision HTTP "+response?.status());
   const text=await page.locator(".mw-parser-output").first().innerText({timeout:30000});
   if(text.length<5000)throw Error(w.language+": original page unexpectedly short");
   const proper=extractLitanyProper(text,w.language);
   const lines=proper.split(/\n+/).map(s=>s.trim()).filter(Boolean);
   const parts=paginateLitanyProper(proper,w.language);
   if(lines.length<80 || parts.length<4 || !proper.includes(w.opening) || !proper.includes(w.ending))
    throw Error(w.language+": incomplete litany body, refusing source admission: "+lines.length+" lines");
   if(w.language==="fr"&&!proper.includes("Saint Jean, riez pour nous."))
    throw Error("1862 French witness anomaly missing: no silent normalization permitted");
   const review=reviewLitanyTranscription(proper,w.language);
   if(review.canCertify1962||review.safeToSilentlyEmend)
    throw Error("Source-witness review incorrectly elevated to 1962 certified");
   const sha256=createHash("sha256").update(proper,"utf8").digest("hex");
   const artifact={
    schema:"ao.pray.private-litany.local-source.v1",
    language:w.language,
    historicalEdition:w.edition,
    sourceUrl:w.url,
    sourceRevisionId:w.oldid,
    sourceStatus:"HISTORICAL_TRANSCRIPTION_UNCOLLATED",
    liturgical1962Certified:false,
    sourceScope:"PRIVATE_LITANY_PROPER_ONLY__OMITS_APPENDED_PSALM_AND_COLLECTS",
    lineCount:lines.length,
    pages:parts.length,
    sha256,
    text:proper
   };
   const path=resolve(root,w.file);
   await mkdir(dirname(path),{recursive:true});
   await writeFile(path,JSON.stringify(artifact,null,2)+"\n","utf8");
   console.log("LITANY_LOCAL_WITNESS_CAPTURED",JSON.stringify({edition:w.edition,source:w.url,language:w.language,lines:lines.length,pages:parts.length,bytes:proper.length,sha256,hold:artifact.sourceStatus}));
  }finally{await page.close()}
 }
}finally{await browser.close()}
