// Preliminary R49 venue snapshot. Source-affiliation groupings are editorial,
// never proof of a particular Canon's una-cum commemoration or active timetable.
export const PRELIMINARY_R49_URL=new URL("../../data/directory/preliminary-map-r49.v1.json",import.meta.url).href;
export const PRELIMINARY_R49_TOTAL=1876;
export const PRELIMINARY_R49_ROME=1019;
const COLS=["id","name","country","locality","affiliation","group","lat","lng","url","other_url","precision"];
const tidy=s=>String(s??"").trim();
const searchKey=s=>tidy(s).normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
function providerGroup(affiliation,group){
  if(group==="SSPX")return "SSPX";
  if(group==="UNKNOWN")return "OTHER";
  const x=tidy(affiliation).toUpperCase();
  if(x==="FSSP"||x==="ICKSP"||x==="IBP")return x;
  if(x.startsWith("DIOCESAN"))return "DIOCESAN";
  return "OTHER";
}
function linkList(raw,limit=5){
  return tidy(raw).split(/\s*;\s*/).filter(url=>/^https?:\/\/[^\s]+$/i.test(url)).slice(0,limit);
}
export function validateR49Snapshot(json){
  if(json?.schema!=="AO_PRELIMINARY_TLM_MAP_R49"||!Array.isArray(json.records)||
     JSON.stringify(json.columns)!==JSON.stringify(COLS)||json.records.length!==PRELIMINARY_R49_TOTAL){
    throw new Error("Invalid preliminary R49 directory snapshot");
  }
  const ids=new Set();let rome=0,sspx=0,unknown=0;
  for(const row of json.records){
    if(!Array.isArray(row)||row.length!==COLS.length)throw new Error("Malformed R49 row");
    const [id,name,country,, ,group,lat,lng,url]=row;
    if(!tidy(id)||!tidy(name)||!/^[A-Z]{2}$/.test(country)||ids.has(id)||
       !Number.isFinite(lat)||lat<-90||lat>90||!Number.isFinite(lng)||lng<-180||lng>180||
       !/^https?:\/\//.test(url)||!["ROME","SSPX","UNKNOWN"].includes(group))
      throw new Error("Invalid or duplicate R49 venue");
    ids.add(id);
    if(group==="ROME")rome++;else if(group==="SSPX")sspx++;else unknown++;
  }
  if(rome!==PRELIMINARY_R49_ROME||sspx!==732||unknown!==125)
    throw new Error("R49 grouping count mismatch");
  return json;
}
export function projectPreliminaryR49(json){
  const source=validateR49Snapshot(json);
  return Object.freeze(source.records.map(row=>{
    const [id,name,country,locality,affiliation,group,lat,lng,url,other_url,precision]=row;
    const community_id=providerGroup(affiliation,group);
    const sources=[...linkList(url),...linkList(other_url)].filter((v,i,a)=>v&&a.indexOf(v)===i);
    const provisional="Provisional venue pin. Presence of the traditional Mass, affiliation, precise entrance and times have not been verified.";
    const label=tidy(affiliation)||"Affiliation unverified";
    return Object.freeze({
      item_id:"tlm:r49:"+id,source_id:id,lens:"tlm",kind:"TLM_VENUE",
      community_id,preliminary_group:group,
      eyebrow:label,
      status:group==="ROME"?"SOURCE-REPORTED":group==="SSPX"?"SSPX · SEPARATE":"UNCLASSIFIED",
      title:name,
      subtitle:[locality,country].filter(Boolean).join(" · "),
      summary:provisional,
      address:{formatted:[locality,country].filter(Boolean).join(", ")},
      geo:{lat,lng,precision:tidy(precision)||"source_marker_unassessed",
        approximate:true,attribution:"© OpenStreetMap contributors · ODbL 1.0"},
      map_publishable:true,map_state:"PROVISIONAL",
      facts:Object.freeze([
        Object.freeze({label:"Affiliation",value:label}),
        Object.freeze({label:"Location",value:"Provisional source/geocoder map position"}),
        Object.freeze({label:"Mass times",value:"Not verified — consult the listed source"}),
      ]),
      sections:Object.freeze([]),
      source_links:Object.freeze(sources.map((sourceUrl,i)=>Object.freeze({
        id:id+"-source-"+i,title:i===0?"Venue source":"Additional source",
        issuer:"Directory source",url:sourceUrl,
      }))),
      actions:Object.freeze([]),
      note:"Affiliation is source-reported; canonical standing and whether the Pope is named in an individual Mass are not independently established. Check original sources before travelling.",
      search_text:searchKey([name,locality,country,affiliation,group].join(" ")),
    });
  }));
}
let cache=null;
export async function loadPreliminaryR49({fetchImpl=fetch}={}){
  if(cache)return cache;
  const response=await fetchImpl(PRELIMINARY_R49_URL,{headers:{accept:"application/json"}});
  if(!response?.ok)throw new Error("R49 directory snapshot unavailable: HTTP "+response?.status);
  const items=projectPreliminaryR49(await response.json());
  cache=items;
  return items;
}
export function filterPreliminaryR49(items,{query="",directoryGroup="ROME",affiliations=[]}={}){
  const q=searchKey(query),group=tidy(directoryGroup).toUpperCase();
  const allowed=["ALL","ROME","SSPX","UNKNOWN"].includes(group)?group:"ROME";
  const aff=new Set((Array.isArray(affiliations)?affiliations:[]).map(x=>tidy(x).toUpperCase()));
  return Object.freeze((Array.isArray(items)?items:[]).filter(item=>
    (allowed==="ALL"||item.preliminary_group===allowed)&&
    (!aff.size||aff.has(item.community_id))&&
    (!q||item.search_text.includes(q))
  ));
}
