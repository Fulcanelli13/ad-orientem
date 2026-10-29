/**
 * Three-object public Rijksmuseum Linked Data API diagnostic (research-only).
 * No image bytes, user approvals, or physical-artwork promotions.
 */
import {readFileSync,writeFileSync} from "node:fs";
import {createHash} from "node:crypto";
const audit=JSON.parse(readFileSync("data/calendar/sacred-art-phase1-museum-479-accession-audit-20261029.v1.json","utf8"));
const ids=["rijks:200107945","rijks:200108285","rijks:20025870"];
const rows=[];
const sha=x=>createHash("sha256").update(x).digest("hex");
for(const id of ids){
 const s=audit.rows.find(r=>r.sourceId===id);
 if(!s||s.museum!=="rijks")throw Error("source id missing "+id);
 const url="https://data.rijksmuseum.nl/"+s.sourceObjectId+"?_profile=la-framed";
 let response=null;
 try{
  const r=await fetch(url,{signal:AbortSignal.timeout(22000),headers:{"Accept":"application/ld+json,application/json;q=0.9","User-Agent":"AdOrientem-ArtCatalog-Research/1.0"}});
  const body=await r.text();
  let j=null;try{j=JSON.parse(body)}catch{}
  const root=j?.["@graph"]??j;
  response={httpStatus:r.status,returnedUrl:r.url,mime:r.headers.get("content-type"),bytes:body.length,sha256:sha(body),
   jsonParsable:!!j,rootKeys:Object.keys(j??{}).slice(0,35),rootArray:Array.isArray(root),
   id:root?.id,objectType:root?.type,label:root?._label,
   identifiedBy:root?.identified_by?.slice?.(0,15),classifiedAs:root?.classified_as?.slice?.(0,8),
   producedBy:root?.produced_by?.slice?.(0,3)??root?.produced_by,rootSnippet:body.slice(0,700)};
 }catch(e){response={error:String(e).slice(0,300)}}
 rows.push({sourceId:id,originalAccession:s.sourceAccession,reviewedTitle:s.title,sourceUrl:s.sourceObjectUrl,apiUrl:url,response,identityVerifiedByThisProbe:false,photoCertified:false});
}
const output={schema:"AO_RIJKS_LINKED_DATA_THREE_OBJECT_DIAGNOSTIC_V1",at:new Date().toISOString(),rows,
 researchOnly:true,officialMuseumsVerifiedByThisProbe:0,productionMutation:false};
writeFileSync("data/calendar/sacred-art-phase1-rijks-api-probe-20261029.v1.json",JSON.stringify(output,null,2)+"\n",{flag:"wx"});
console.log(JSON.stringify(rows.map(x=>({id:x.sourceId,status:x.response.httpStatus,keys:x.response.rootKeys,type:x.response.objectType,ids:x.response.identifiedBy,error:x.response.error})),null,2));
