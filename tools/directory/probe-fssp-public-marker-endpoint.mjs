const source="https://www.fssp.org/en/find-us/where-are-we/";
const result={schema:"AO_FSSP_PUBLIC_MARKER_ENDPOINT_RESEARCH_V1",publication_approved:false,
 source,reported_at:"2026-11-12",checks:[]};
async function request(url){
 const response=await fetch(url,{redirect:"follow",headers:{"Accept":"application/json, text/html","User-Agent":"AdOrientemFSSPPublicDirectoryResearch/1.0"},signal:AbortSignal.timeout(28000)});
 const type=response.headers.get("content-type")||"";
 const body=await response.text();
 if(body.length>12_000_000)throw Error("response exceeds 12MB guard");
 let parsed;
 if(/application\/json/.test(type)||/^[\s]*[\[{]/.test(body)){try{parsed=JSON.parse(body)}catch{}}
 const desc={status:response.status,url:response.url,host:new URL(response.url).hostname,
  content_type:type.slice(0,95),bytes:body.length,parsed_json:parsed!==undefined,
  body_has_map_plugin:body.includes("wpgmza"),body_has_site_title:body.includes("Where are we?"),
  body_has_reference_row:body.includes("Maternal Heart of Mary Parish")};
 if(parsed!==undefined){
  desc.json_type=Array.isArray(parsed)?"array":typeof parsed;
  desc.json_count=Array.isArray(parsed)?parsed.length:null;
  desc.json_keys=parsed&&typeof parsed==="object"&&!Array.isArray(parsed)?Object.keys(parsed).slice(0,30):null;
  const row=Array.isArray(parsed)?parsed[0]:Array.isArray(parsed?.data)?parsed.data[0]:null;
  if(row&&typeof row==="object")desc.first_record_keys=Object.keys(row).slice(0,30);
 }
 return desc;
}
try{
 const home=await request(source);result.checks.push({target:"official_page",...home});
 const host=new URL(home.url).hostname;
 // Never send source probes to non-FSSP domains.
 if(host==="fssp.org"||host.endsWith(".fssp.org")){
  const origin=new URL(home.url).origin;
  for(const [name,url] of [
   ["wp_go_maps_rest_v1",origin+"/wp-json/wpgmza/v1/markers"],
   ["wp_go_maps_rest_route_fallback",origin+"/?rest_route=%2Fwpgmza%2Fv1%2Fmarkers"]]){
    try{result.checks.push({target:name,...await request(url)});}
    catch(e){result.checks.push({target:name,error:String(e).slice(0,220)});}
  }
 }else{
  result.external_host_hold=host;
 }
}catch(e){result.source_error=String(e).slice(0,250);}

try {
 const url="https://www.fssp.org/wp-json/wpgmza/v1/markers";
 const response=await fetch(url,{headers:{"Accept":"application/json","User-Agent":"AdOrientemFSSPMarkerSchemaResearch/1.0"},signal:AbortSignal.timeout(28000)});
 const entries=await response.json();
 if (!response.ok || !Array.isArray(entries)) throw Error("Invalid marker response");
 const mapCounts={};
 for (const e of entries) mapCounts[String(e.map_id??"unknown")]=(mapCounts[String(e.map_id??"unknown")]||0)+1;
 const first=entries.slice(0,4).map(e=>({
   id:e.id,map_id:e.map_id,title:String(e.title??"").slice(0,150),
   address:String(e.address??"").slice(0,180),
   description:String(e.description??"").slice(0,420),
   link:String(e.link??"").slice(0,180),
   lat_present:Boolean(e.lat),lng_present:Boolean(e.lng),
   category:e.category,approved:e.approved,type:e.type
 }));
 console.log("FSSP_MARKER_SCHEMA_EXAMPLES",JSON.stringify({
   status:response.status,count:entries.length,mapCounts,
   title_nonempty:entries.filter(e=>String(e.title??"").trim()).length,
   address_nonempty:entries.filter(e=>String(e.address??"").trim()).length,
   description_nonempty:entries.filter(e=>String(e.description??"").trim()).length,
   distinct_id_count:new Set(entries.map(e=>String(e.id))).size,examples:first
 },null,2));
} catch(error){console.log("FSSP_MARKER_SCHEMA_PROBE_ERROR",String(error).slice(0,250));}

result.publication_approved=false;
console.log("FSSP_RESEARCH_SOURCE_ORIGIN_AND_OFFICIAL_MARKER_ENDPOINTS",JSON.stringify(result,null,2));
