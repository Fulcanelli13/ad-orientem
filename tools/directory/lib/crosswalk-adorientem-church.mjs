/** Crosswalk of attributed third-party records: research intake, never automatic publication. */
const key=x=>String(x??"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const present=x=>String(x??"").trim();
const normalizeCountry=x=>present(x).toUpperCase();
const allowedInstitutes=new Set(["SSPX","FSSP","ICKSP","IBP","DIOCESAN","OTHER"]);
const isUrl=x=>{try{return ["http:","https:"].includes(new URL(x).protocol)}catch{return false}};
export function crosswalkThirdPartyDirectory(incoming,existing,{snapshotUrl="https://adorientem.church/",observedAt=null}={}){
 if(!Array.isArray(incoming)||!Array.isArray(existing))throw new TypeError("Arrays required");
 const existingIds=new Map(),existingLocations=new Map();
 for(const record of existing){
  const v=record.venue??record;
  const cc=normalizeCountry(v.address?.country_code??v.country_code);
  const name=key(v.name?.official??v.name);
  const address=key(v.address?.formatted??v.address);
  const city=key(v.address?.city??v.city);
  const community=key(record.ministries?.[0]?.community_id??v.community_id);
  if(!cc)continue;
  const id=present(v.upstream?.upstream_id??v.venue_id??v.id);
  if(id)existingIds.set(key(id),record);
  for(const matchKey of [
    cc+"|"+community+"|"+name+"|"+address,
    cc+"|"+community+"|"+name+"|"+city
  ]){
    if(!existingLocations.has(matchKey))existingLocations.set(matchKey,[]);
    existingLocations.get(matchKey).push(record);
  }
 }
 const result={matched:[],needsReview:[],rejected:[],duplicates:[],statistics:{}};
 const seen=new Set();
 for(const raw of incoming){
  const id=present(raw.id??raw.location_id??raw.slug);
  const name=present(raw.name??raw.title);
  const country=normalizeCountry(raw.country_code??raw.countryCode);
  const community=normalizeCountry(raw.community??raw.institute??"OTHER");
  const address=present(raw.address??raw.formatted_address);
  const city=present(raw.city);
  const sourceUrl=present(raw.source_url??raw.sourceUrl);
  const listingUrl=present(raw.url??raw.listing_url);
  const unique=[country,community,key(name),key(address||city)].join("|");
  if(!country||!name||!allowedInstitutes.has(community)||(!isUrl(sourceUrl)&&!isUrl(listingUrl))){
   result.rejected.push({id,reason:"MISSING_IDENTITY_COMMUNITY_OR_SOURCE"});continue;
  }
  if(seen.has(unique)){result.duplicates.push({id,reason:"DUPLICATE_THIRD_PARTY_IDENTITY"});continue}
  seen.add(unique);
  const links=[sourceUrl,listingUrl].filter(isUrl);
  const matches=[...new Set([
    ...(existingLocations.get(country+"|"+key(community)+"|"+key(name)+"|"+key(address))??[]),
    ...(existingLocations.get(country+"|"+key(community)+"|"+key(name)+"|"+key(city))??[])
  ])];
  const metadata={id,name,country_code:country,community,address,city,source_url:sourceUrl||null,
    listing_url:listingUrl||null,snapshot_url:snapshotUrl,observed_at:observedAt,
    attribution:"Ad Orientem (adorientem.church); original source retained when available",
    schedules:raw.schedules??null,verification:raw.verification??null};
  if(matches.length===1){result.matched.push({...metadata,matched_venue_id:matches[0].venue?.venue_id??matches[0].venue_id,classification:"EXISTING_MATCH_REVIEW"});}
  else result.needsReview.push({...metadata,classification:matches.length>1?"AMBIGUOUS_MATCH":"POTENTIAL_MISSING_VENUE",original_links:links});
 }
 result.statistics={input:incoming.length,matched:result.matched.length,needs_review:result.needsReview.length,
  rejected:result.rejected.length,duplicates:result.duplicates.length,published:0};
 return result;
}
