export const DIRECTORY_GEO_PRECISIONS=Object.freeze([
  "building",
  "address",
  "street",
  "locality",
  "region",
  "unknown",
]);

export const DIRECTORY_GEO_SOURCES=Object.freeze([
  "OFFICIAL_SOURCE",
  "OSM_NOMINATIM",
  "MANUAL",
  "OTHER",
]);

const precisionSet=new Set(DIRECTORY_GEO_PRECISIONS);
const sourceSet=new Set(DIRECTORY_GEO_SOURCES);
const mappablePrecisionSet=new Set(["building","address","street","locality"]);

function issue(code,path,message){return Object.freeze({code,path,message})}
function nonEmpty(value){return typeof value==="string"&&value.trim().length>0}

export function hasDirectoryCoordinates(geo){
  if(!geo||typeof geo!=="object")return false;
  if([geo.lat,geo.lng].some(value=>value===null||value===undefined||value===""))return false;
  const lat=Number(geo.lat),lng=Number(geo.lng);
  return Number.isFinite(lat)&&lat>=-90&&lat<=90&&Number.isFinite(lng)&&lng>=-180&&lng<=180;
}

export function auditDirectoryGeo(geo,{countryCode=null,path="geo"}={}){
  const issues=[];
  if(!geo||typeof geo!=="object")return issues;

  const hasLat=geo.lat!==null&&geo.lat!==undefined&&geo.lat!=="";
  const hasLng=geo.lng!==null&&geo.lng!==undefined&&geo.lng!=="";
  if(hasLat!==hasLng){
    issues.push(issue("INCOMPLETE_GEO_POINT",path,"Latitude and longitude must be supplied together."));
    return issues;
  }
  if(!hasLat&&!hasLng)return issues;

  const lat=Number(geo.lat),lng=Number(geo.lng);
  if(!Number.isFinite(lat)||lat<-90||lat>90)issues.push(issue("INVALID_LATITUDE",path+".lat","Latitude must be between -90 and 90."));
  if(!Number.isFinite(lng)||lng<-180||lng>180)issues.push(issue("INVALID_LONGITUDE",path+".lng","Longitude must be between -180 and 180."));

  const precision=String(geo.precision??"unknown").toLowerCase();
  if(!precisionSet.has(precision))issues.push(issue("INVALID_GEO_PRECISION",path+".precision","Unsupported coordinate precision: "+precision));
  else if(precision==="unknown")issues.push(issue("UNKNOWN_GEO_PRECISION",path+".precision","Published coordinates require a non-unknown precision."));

  const source=String(geo.geocoding_source??"").trim();
  if(!sourceSet.has(source))issues.push(issue("INVALID_GEO_SOURCE",path+".geocoding_source","Published coordinates require a supported provenance source."));
  if(!nonEmpty(geo.source_ref))issues.push(issue("MISSING_GEO_SOURCE_REF",path+".source_ref","Published coordinates require a stable source reference."));
  if(["OSM_NOMINATIM","OFFICIAL_SOURCE"].includes(source)&&!nonEmpty(geo.source_url)){
    issues.push(issue("MISSING_GEO_SOURCE_URL",path+".source_url","External coordinate sources require a source URL."));
  }

  if(source==="OFFICIAL_SOURCE"){
    // First-party map data may still be misattached to a source entity;
    // whenever the country is provided, fail closed on contradictions.
    const matched=String(geo.matched_country_code??"").toUpperCase();
    const expected=String(countryCode??"").toUpperCase();
    if(matched&&expected&&matched!==expected)
      issues.push(issue("GEO_COUNTRY_MISMATCH",path+".matched_country_code",
        "Official source coordinates belong to "+matched+", not "+expected+"."));
  }
  if(source==="OSM_NOMINATIM"){
    if(!nonEmpty(geo.attribution))issues.push(issue("MISSING_GEO_ATTRIBUTION",path+".attribution","Nominatim/OSM coordinates require attribution text."));
    const matched=String(geo.matched_country_code??"").toUpperCase();
    const expected=String(countryCode??"").toUpperCase();
    if(!matched)issues.push(issue("MISSING_GEO_COUNTRY_MATCH",path+".matched_country_code","Geocoded coordinates require the matched country code."));
    else if(expected&&matched!==expected)issues.push(issue("GEO_COUNTRY_MISMATCH",path+".matched_country_code","Matched country "+matched+" does not equal venue country "+expected+"."));
    const score=Number(geo.match_score);
    if(!Number.isFinite(score)||score<0||score>1)issues.push(issue("INVALID_GEO_MATCH_SCORE",path+".match_score","Geocoder match_score must be between 0 and 1."));
  }

  return issues;
}

export function isMapPublishableGeo(geo,countryCode=null){
  return hasDirectoryCoordinates(geo)
    && mappablePrecisionSet.has(String(geo?.precision??"").toLowerCase())
    && auditDirectoryGeo(geo,{countryCode}).length===0;
}

export function isApproximateDirectoryGeo(geo){
  return new Set(["street","locality"]).has(String(geo?.precision??"").toLowerCase());
}

export function directoryGeoLabel(geo,{language="en"}={}){
  const precision=String(geo?.precision??"unknown").toLowerCase();
  const fr=language==="fr";
  const labels={
    building:fr?"Bâtiment cartographié":"Mapped building",
    address:fr?"Adresse cartographiée":"Mapped address",
    street:fr?"Position approximative · rue":"Approximate · street",
    locality:fr?"Position approximative · localité":"Approximate · locality",
    region:fr?"Position régionale":"Regional position",
    unknown:fr?"Position non vérifiée":"Unverified location",
  };
  return labels[precision]??labels.unknown;
}
