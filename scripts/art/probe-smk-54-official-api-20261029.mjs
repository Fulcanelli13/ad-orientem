/**
 * Read-only official SMK Open API schema and accession identity diagnostic.
 * Three fixed frozen source IDs from KMS/KMSSP/KMSST series.
 */
import {readFileSync,writeFileSync} from "node:fs";
import {createHash} from "node:crypto";
const source=JSON.parse(readFileSync("data/calendar/sacred-art-phase1-museum-479-accession-audit-20261029.v1.json","utf8"));
const keys=["smk:KMS1168","smk:KMSSP405","smk:KMSST602"];
const res=[];
for(const id of keys){
 const row=source.rows.find(r=>r.sourceId===id);
 if(!row)throw Error("Absent frozen source ID "+id);
 const url="https://api.smk.dk/api/v1/art/?object_number="+encodeURIComponent(row.sourceAccession)+"&lang=en";
 let metadata=null;
 try{
  const r=await fetch(url,{signal:AbortSignal.timeout(26000),headers:{Accept:"application/json","User-Agent":"AdOrientem-SacredArt-Research/1.0"}});
  const txt=await r.text();
  let payload=null;try{payload=JSON.parse(txt)}catch{}
  const object=Array.isArray(payload)?payload[0]:payload;
  metadata={status:r.status,contentType:r.headers.get("content-type"),resolvedUrl:r.url,
   sha256:createHash("sha256").update(txt).digest("hex"),bytes:txt.length,
   topLevelKeys:payload&&typeof payload==="object"?Object.keys(payload).slice(0,65):null,
   array: Array.isArray(payload),accession:object?.object_number,
   title:object?.titles??object?.title??object?.title_en??null,
   creator:object?.production??object?.artist??object?.creator??null,
   objectType:object?.object_names??object?.object_type??null,
   rights:{public_domain:object?.public_domain,has_image:object?.has_image,
     image_rights:object?.image_rights,license:object?.license},
   firstText:txt.slice(0,850)};
 }catch(e){metadata={error:String(e).slice(0,300)}}
 res.push({id,accession:row.sourceAccession,reviewedTitle:row.title,metadata,verified:false});
}
const result={schema:"AO_SMK_54_OFFICIAL_API_SCHEMA_PROBE_V1",at:new Date().toISOString(),sampleSize:3,
 sourceRecords:54,confirmedByProbe:0,noImageAccess:true,reviewDecisionsChanged:false,
 productionMutation:false,records:res};
writeFileSync("data/calendar/sacred-art-phase1-smk-api-probe-20261029.v1.json",JSON.stringify(result,null,2)+"\n",{flag:"wx"});
console.log(JSON.stringify(res.map(x=>({id:x.id,status:x.metadata.status,keys:x.metadata.topLevelKeys,
 accession:x.metadata.accession,title:x.metadata.title,type:x.metadata.objectType,error:x.metadata.error})),null,2));
