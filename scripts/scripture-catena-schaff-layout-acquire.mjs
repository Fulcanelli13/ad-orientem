#!/usr/bin/env node
/*
 * Download the original 1888 scan's page-level OCR coordinate XML and
 * optional printed-leaf metadata. Research-only, no Father attribution.
 */
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {join,resolve} from "node:path";
import {createHash} from "node:crypto";
const opt=(key,def)=>{const i=process.argv.indexOf(key);return i<0?def:process.argv[i+1]};
const edition=opt("--edition","NPNF1-10"),dir=resolve(opt("--output-dir","dist/schaff-layout-1888"));
const manifest=JSON.parse(readFileSync("data/scripture/catena/research/full-corpus-pass-20261021/schaff-ocr-source-manifest.v1.json","utf8"));
const e=manifest.editions.find(x=>x.editionId===edition);
if(!e)throw Error("UNPINNED_EDITION");
const sha=buffer=>createHash("sha256").update(buffer).digest("hex");
const max=140_000_000;
async function obtain(kind,required=true){
 const address="https://archive.org/download/"+e.archiveId+"/"+e.archiveId+"_"+kind;
 for(let retry=0;retry<2;retry++){
  try{
   const r=await fetch(address,{
    signal:AbortSignal.timeout(130000),
    headers:{"user-agent":"AdOrientem-Research/1.0 (1888 public-domain scholarly source OCR)",
      accept:"application/xml,text/xml,*/*;q=0.1"}
   });
   if(!r.ok)throw Error("HTTP_"+r.status);
   const size=Number(r.headers.get("content-length")||0);
   if(size>max)throw Error("LAYOUT_XML_TOO_LARGE");
   const body=Buffer.from(await r.arrayBuffer());
   if(body.length>max)throw Error("LAYOUT_XML_TOO_LARGE");
   const text=body.toString("utf8");
   if(!text.startsWith("<?xml")&&!/^\s*<(?:DjVuXML|book|scandata)/i.test(text))
    throw Error("NOT_ARCHIVED_XML");
   return {body,sourceURL:address,sha256:sha(body),size:body.length};
  }catch(ex){
   process.stderr.write("Historical layout fetch "+kind+" attempt "+(retry+1)+": "+ex.message+"\n");
   if(retry===1){if(required)throw ex;return null}
  }
 }
}
const djvu=await obtain("djvu.xml");
const scandata=await obtain("scandata.xml",false);
mkdirSync(dir,{recursive:true});
writeFileSync(join(dir,edition+".djvu.xml"),djvu.body);
if(scandata)writeFileSync(join(dir,edition+".scandata.xml"),scandata.body);
const sample=djvu.body.toString("utf8");
const object=(sample.match(/<OBJECT\b[^>]*>[\s\S]*?<\/OBJECT\s*>/i)||[])[0]||"";
const pageCount=(sample.match(/<OBJECT\b/gi)||[]).length;
const paragraphCount=(sample.match(/<PARAGRAPH\b/gi)||[]).length;
const lineCount=(sample.match(/<LINE\b/gi)||[]).length;
const wordCount=(sample.match(/<WORD\b/gi)||[]).length;
if(!pageCount||!wordCount||!object)throw Error("NO_PAGE_COORDINATE_OCR_IN_HISTORICAL_SCAN");
const summary={
 schema:"ao.catena.schaff-1888-page-layout-acquisition.v1",
 editionId:edition,printedEdition:e.sourceEdition,
 originalScan:e.archiveDetailUrl,
 originalPlainOCRScanId:e.archiveId,
 djvuXMLURL:djvu.sourceURL,djvuXMLBytes:djvu.size,djvuXMLSHA256:djvu.sha256,
 pageObjects:pageCount,ocrParagraphs:paragraphCount,
 ocrLines:lineCount,ocrWords:wordCount,
 scandataAvailable:!!scandata,
 scandataXMLURL:scandata?.sourceURL||null,
 scandataXMLBytes:scandata?.size||null,
 scandataXMLSHA256:scandata?.sha256||null,
 firstPageObjectOriginalPrefix:object.slice(0,1500),
 originalWordsOrCoordinatesModified:false,
 originalSpeakerOrParagraphBoundaryAuthenticated:false,
 productionReaderEligible:false,publicationApprovals:0
};
writeFileSync(join(dir,"acquisition-summary.v1.json"),JSON.stringify(summary,null,2)+"\n");
console.log(JSON.stringify({...summary,firstPageObjectOriginalPrefix:summary.firstPageObjectOriginalPrefix.slice(0,550)}));
