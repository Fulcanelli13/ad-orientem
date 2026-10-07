import crypto from "node:crypto";

const STOP_MARKERS=[
  /\bCur[ée]\s*:/iu,
  /\bVicaire\s*:/iu,
  /\bChapelain\s*:/iu,
  /\bPr[êe]tres?\s*:/iu,
  /\bRecteur\s*:/iu,
  /\bContact\s*:/iu,
  /\bAutres lieux d['’]apostolat\b/iu,
  /\bPlease direct correspondence\b/iu,
  /\bMailing Address\s*:/iu,
  /\bMaison canonique\s*:/iu,
  /\bPr[êe]tre responsable\s*:/iu,
  /\bMesses?\s*:/iu,
  /\bConfessions?\s*:/iu,
  /©\s*20\d{2}/u,
  /\bShopping Basket\b/iu,
  /\bNous utilisons des cookies\b/iu,
];
const LOCALITY_TYPES=new Set(["city","town","village","hamlet","suburb","neighbourhood","quarter","municipality"]);
const STREET_TYPES=new Set(["road","street","pedestrian","residential","service"]);
const BUILDING_TYPES=new Set(["place_of_worship","church","chapel","cathedral","basilica","shrine","building","house","school","college","monastery","convent","oratory"]);

function ascii(value){
  return String(value??"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
}
function significantTokens(value){
  return ascii(value)
    .replace(/[^a-z0-9]+/g," ")
    .split(/\s+/)
    .filter(Boolean)
    .filter(token=>/^\d+$/.test(token)||token.length>=3)
    .filter(token=>!new Set(["the","and","for","des","les","une","eglise","church","chapel","oratory","parish","saint","sainte","st","sts"]).has(token));
}
function overlapRatio(source,target){
  const a=[...new Set(source)],b=new Set(target);
  if(!a.length)return 0;
  let matches=0;
  for(const token of a)if(b.has(token))matches+=1;
  return matches/a.length;
}
function firstStopIndex(value){
  let index=-1;
  for(const re of STOP_MARKERS){
    const m=value.match(re);
    if(m&&m.index!==undefined&&(index<0||m.index<index))index=m.index;
  }
  return index;
}
export function cleanDirectoryAddress(address){
  let value=String(address??"").replace(/\u00a0/g," ").replace(/\s+/g," ").trim();
  const stop=firstStopIndex(value);
  if(stop>=0)value=value.slice(0,stop).replace(/[\s,;:-]+$/g,"");
  value=value.replace(/\(\s*m[ée]tro\s*:[^)]+\)/giu," ");
  value=value.replace(/\bP\.?O\.?\s*Box\s+\d+\s*[-,]?\s*/giu," ");
  value=value.replace(/\bChurch Address\s*:\s*/giu," ");
  value=value.replace(/\bTemporary Chapel Address\s*,?\s*/giu," ");
  value=value.replace(/\b(?:Address|Adresse)\s*:\s*/giu," ");
  value=value.replace(/\b(?:F|D|B|CZ|I)-(?=\d{4,6}\b)/giu,"");
  value=value.replace(/\s+-\s+/g,", ").replace(/,{2,}/g,",").replace(/\s+,/g,",").replace(/,\s*$/,"");
  return value.replace(/\s+/g," ").trim();
}
export function buildDirectoryAddressOnlyQuery(venue){
  return cleanDirectoryAddress(venue?.address?.formatted??venue?.address?.line1??venue?.address?.city??"").slice(0,280);
}
export function buildDirectoryGeocodeQuery(venue){
  const name=String(venue?.name?.official??"").trim();
  const address=buildDirectoryAddressOnlyQuery(venue);
  return [name,address].filter(Boolean).join(", ").slice(0,280);
}
function normalizedComparable(value){
  return ascii(value).replace(/[^a-z0-9]+/g," ").replace(/\s+/g," ").trim();
}
function extractPostalCode(value,countryCode){
  const text=String(value??"");
  const cc=String(countryCode??"").toUpperCase();
  if(cc==="CA")return text.match(/\b[A-Z]\d[A-Z][ -]?\d[A-Z]\d\b/i)?.[0]?.toUpperCase()??null;
  if(cc==="US")return text.match(/\b\d{5}(?:-\d{4})?\b/g)?.at(-1)??null;
  if(cc==="GB")return text.match(/\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/i)?.[0]?.toUpperCase()??null;
  if(cc==="PL")return text.match(/\b\d{2}-\d{3}\b/g)?.at(-1)??null;
  if(cc==="BR")return text.match(/\b\d{5}-\d{3}\b/g)?.at(-1)??null;
  if(cc==="PT")return text.match(/\b\d{4}-\d{3}\b/g)?.at(-1)??null;
  return text.match(/\b\d{4,6}\b/g)?.at(-1)??null;
}
function escapeRegExp(value){
  return String(value??"").replace(/[-/\\^$*+?.()|[\]{}]/g,"\\$&");
}
function stripPostal(value,postal){
  if(!postal)return String(value??"").trim();
  const re=new RegExp(escapeRegExp(postal).replace(/\s+/g,"\\s*"),"i");
  return String(value??"").replace(re," ").replace(/\s+/g," ").trim();
}
function parseLocalitySegment(segment,countryCode,postal){
  let value=stripPostal(segment,postal).replace(/^[,;\s-]+|[,;\s-]+$/g,"").trim();
  const cc=String(countryCode??"").toUpperCase();
  let state=null;
  if(["US","CA","AU"].includes(cc)){
    const stateMatch=value.match(/\b([A-Z]{2,3})\b\s*$/);
    if(stateMatch){
      state=stateMatch[1].toUpperCase();
      value=value.slice(0,stateMatch.index).replace(/[,;\s-]+$/g,"").trim();
    }
  }
  return {city:value||null,state};
}
export function extractDirectoryAddressComponents(venue){
  const cleaned=buildDirectoryAddressOnlyQuery(venue);
  const countryCode=String(venue?.address?.country_code??"").toUpperCase();
  const postalcode=extractPostalCode(cleaned,countryCode);
  let segments=cleaned.split(/\s*,\s*/).map(x=>x.trim()).filter(Boolean);
  const countryName=String(venue?.address?.country??"").trim();
  if(countryName&&segments.length&&normalizedComparable(segments.at(-1))===normalizedComparable(countryName))segments.pop();
  const nameKey=normalizedComparable(venue?.name?.official??"");
  if(segments.length&&nameKey){
    const firstKey=normalizedComparable(segments[0]);
    if(firstKey===nameKey||firstKey.startsWith(nameKey+" ")||nameKey.startsWith(firstKey+" "))segments.shift();
  }
  let localitySegment=segments.at(-1)??"";
  if(postalcode&&!localitySegment.includes(postalcode)){
    const containing=[...segments].reverse().find(s=>s.includes(postalcode));
    if(containing)localitySegment=containing;
  }
  const {city,state}=parseLocalitySegment(localitySegment,countryCode,postalcode);
  let street=segments[0]??null;
  if(street===localitySegment&&segments.length>1)street=segments[segments.length-2];
  if(street&&city&&normalizedComparable(street)===normalizedComparable(city))street=null;
  return Object.freeze({
    street:street||null,
    city:city||venue?.address?.city||null,
    state:state||venue?.address?.region||null,
    postalcode:postalcode||venue?.address?.postal_code||null,
    countryCode,
  });
}
export function buildDirectoryStructuredAttempts(venue){
  const parts=extractDirectoryAddressComponents(venue);
  const attempts=[];
  if(parts.street&&(parts.city||parts.postalcode)){
    attempts.push(Object.freeze({
      kind:"STRUCTURED_STREET",
      params:Object.freeze({
        street:parts.street,
        city:parts.city,
        state:parts.state,
        postalcode:parts.postalcode,
      })
    }));
  }
  const amenity=String(venue?.name?.official??"").trim();
  if(amenity&&(parts.city||parts.postalcode)){
    attempts.push(Object.freeze({
      kind:"STRUCTURED_AMENITY",
      params:Object.freeze({
        amenity,
        city:parts.city,
        state:parts.state,
        postalcode:parts.postalcode,
      })
    }));
  }
  return attempts;
}
export function structuredGeocodeFingerprint(params){
  return Object.entries(params??{})
    .filter(([,value])=>value!==null&&value!==undefined&&String(value).trim())
    .sort(([a],[b])=>a.localeCompare(b))
    .map(([key,value])=>key+"="+String(value).trim())
    .join("&");
}
export function geocodeCacheKey({query,countryCode}){
  return crypto.createHash("sha256").update(String(countryCode??"").toUpperCase()+"\n"+String(query??"").trim()).digest("hex");
}
export function classifyNominatimPrecision(candidate){
  const type=String(candidate?.addresstype??candidate?.type??"").toLowerCase();
  const category=String(candidate?.category??candidate?.class??"").toLowerCase();
  if(BUILDING_TYPES.has(type))return "building";
  if(type==="house_number"||type==="address")return "address";
  if(STREET_TYPES.has(type))return "street";
  if(LOCALITY_TYPES.has(type))return "locality";
  if(["state","region","county"].includes(type))return "region";
  if(category==="amenity"&&candidate?.name)return "building";
  if(candidate?.address?.house_number&&candidate?.address?.road)return "address";
  if(candidate?.address?.road)return "street";
  if(candidate?.address?.city||candidate?.address?.town||candidate?.address?.village)return "locality";
  return "unknown";
}
function postalTokens(value){
  return significantTokens(value).filter(token=>/^\d{4,6}$/.test(token));
}
export function scoreNominatimCandidate(venue,candidate){
  const expectedCountry=String(venue?.address?.country_code??"").toLowerCase();
  const matchedCountry=String(candidate?.address?.country_code??"").toLowerCase();
  if(!expectedCountry||!matchedCountry||expectedCountry!==matchedCountry)return 0;
  const cleaned=cleanDirectoryAddress(venue?.address?.formatted??venue?.address?.city??"");
  const addressTokens=significantTokens(cleaned);
  const nameTokens=significantTokens(venue?.name?.official??"");
  const displayTokens=significantTokens(candidate?.display_name??"");
  const candidateNameSource=[
    candidate?.name,
    ...Object.values(candidate?.namedetails??{}),
    candidate?.display_name?.split(",")[0],
  ].filter(Boolean).join(" ");
  const candidateNameTokens=significantTokens(candidateNameSource);
  const addressOverlap=overlapRatio(addressTokens,displayTokens);
  const nameOverlap=overlapRatio(nameTokens,[...candidateNameTokens,...displayTokens]);
  const wantedPostals=postalTokens(cleaned);
  const actualPostcode=String(candidate?.address?.postcode??"");
  const postalBonus=wantedPostals.some(token=>actualPostcode.includes(token))?0.18:0;
  const precision=classifyNominatimPrecision(candidate);
  const precisionBonus={building:0.18,address:0.13,street:0.06,locality:0.01,region:0,unknown:0}[precision]??0;
  const localityAliasBonus=precision==="locality"&&addressLooksLocalityOnly(venue)&&nameOverlap>=0.75?0.30:0;
  return Math.max(0,Math.min(1,0.53*addressOverlap+0.24*nameOverlap+postalBonus+precisionBonus+localityAliasBonus));
}
export function addressLooksLocalityOnly(venue){
  const cleaned=cleanDirectoryAddress(venue?.address?.formatted??venue?.address?.city??"");
  const hasStreetNumber=/\b\d{1,4}[a-z]?\b/i.test(cleaned);
  const hasStreetWord=/\b(?:street|st\.?|road|rd\.?|avenue|ave\.?|boulevard|blvd\.?|rue|place|way|lane|ln\.?|drive|dr\.?|route|chemin|via|viale|piazza)\b/i.test(cleaned);
  return !hasStreetNumber&&!hasStreetWord;
}
export function selectNominatimCandidate(venue,candidates=[]){
  const ranked=(Array.isArray(candidates)?candidates:[])
    .map(candidate=>({candidate,precision:classifyNominatimPrecision(candidate),score:scoreNominatimCandidate(venue,candidate)}))
    .sort((a,b)=>b.score-a.score);
  for(const entry of ranked){
    const {precision,score}=entry;
    if(precision==="building"&&score>=0.42)return entry;
    if(precision==="address"&&score>=0.46)return entry;
    if(precision==="street"&&score>=0.52)return entry;
    if(precision==="locality"&&addressLooksLocalityOnly(venue)&&score>=0.48)return entry;
  }
  return null;
}
export function nominatimGeoFromSelection(selection,{geocodedAt=new Date().toISOString(),cacheKey=null}={}){
  if(!selection)return null;
  const c=selection.candidate;
  const lat=Number(c?.lat),lng=Number(c?.lon);
  if(!Number.isFinite(lat)||!Number.isFinite(lng))return null;
  const osmType=String(c?.osm_type??"unknown");
  const osmId=String(c?.osm_id??"unknown");
  return Object.freeze({
    lat,
    lng,
    precision:selection.precision,
    geocoding_source:"OSM_NOMINATIM",
    source_url:"https://nominatim.openstreetmap.org/",
    source_ref:"osm:"+osmType+":"+osmId,
    matched_country_code:String(c?.address?.country_code??"").toUpperCase(),
    geocoded_at:geocodedAt,
    attribution:"© OpenStreetMap contributors, ODbL 1.0",
    match_score:Number(selection.score.toFixed(4)),
    query_fingerprint:cacheKey,
  });
}
