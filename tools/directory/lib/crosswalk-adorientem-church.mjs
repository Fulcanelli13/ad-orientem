/** Attributed third-party directory crosswalk. All outputs are research-only; never publish automatically. */
const present=x=>String(x??"").trim();
const key=x=>present(x).normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const communityKey=x=>{
 const value=key(x);
 if(["society of st pius x","society of saint pius x","sspx","fsspx"].includes(value))return "SSPX";
 if(["priestly fraternity of saint peter","priestly fraternity of st peter","fssp"].includes(value))return "FSSP";
 if(["institute of christ the king sovereign priest","institute of christ the king","icksp","icrsp"].includes(value))return "ICKSP";
 if(["institute of the good shepherd","ibp"].includes(value))return "IBP";
 if(["diocesan","diocesan clergy","diocese"].includes(value))return "DIOCESAN";
 return present(x).toUpperCase()||"OTHER";
};
const allowedCommunities=new Set(["SSPX","FSSP","ICKSP","IBP","DIOCESAN","OTHER"]);
const isUrl=x=>{try{return ["https:","http:"].includes(new URL(x).protocol)}catch{return false}};
const streetReplacements={st:"street",rd:"road",ave:"avenue",av:"avenue",blvd:"boulevard",dr:"drive",ln:"lane",ct:"court",pl:"place",e:"east",w:"west",n:"north",s:"south"};
const streetSuffixes=new Set(["street","road","avenue","boulevard","drive","lane","court","place","way","highway","route","trail"]);
function streetKey(input){
 const raw=key(input).split(" ").filter(Boolean);
 const tokens=raw.map(t=>streetReplacements[t]||t);
 const start=tokens.findIndex((t,i)=>i<7&&/^\d{1,6}[a-z]?$/.test(t));
 if(start<0)return null;
 const last=Math.min(start+9,tokens.length),slice=tokens.slice(start,last);
 const suffix=slice.findIndex((t,i)=>i>0&&streetSuffixes.has(t));
 if(suffix<0)return null;
 // E.g. County Road 56: the number belongs to the street name, not to the locality.
 const keep=suffix+1+(slice[suffix]==="road"&&/^\d{1,4}$/.test(slice[suffix+1]||"")?1:0);
 return slice.slice(0,keep).join(" ");
}
const rowVenue=r=>r?.venue??r??{};
const rowCommunity=r=>communityKey(r?.ministries?.[0]?.community_id??rowVenue(r)?.community_id);
const rowCountry=r=>present(rowVenue(r)?.address?.country_code??rowVenue(r)?.country_code).toUpperCase();
const rowName=r=>present(rowVenue(r)?.name?.official??rowVenue(r)?.name);
const rowCity=r=>present(rowVenue(r)?.address?.city??rowVenue(r)?.city);
const rowAddress=r=>present(rowVenue(r)?.address?.formatted??rowVenue(r)?.address?.line1??rowVenue(r)?.address);
function identity(raw){
 const id=present(raw.id??raw.location_id??raw.slug);
 const name=present(raw.name??raw.title),cc=present(raw.country_code??raw.countryCode).toUpperCase();
 const community=communityKey(raw.community??raw.institute??"OTHER");
 const address=present(raw.address??raw.formatted_address),city=present(raw.city);
 const listingUrl=present(raw.url??raw.listing_url),sourceUrl=present(raw.source_url??raw.sourceUrl);
 const originalSource=sourceUrl&&isUrl(sourceUrl)?sourceUrl:null;
 const status=key(raw.status??raw.publication_status??"current");
 const planned=/(planned|announced|future)/.test(status),inactive=/(suspended|archived|cancelled|canceled|closed)/.test(status);
 return {id,name,cc,community,address,city,listingUrl,sourceUrl,originalSource,planned,inactive,status,
   street:streetKey(address),nameKey:key(name)};
}
function originalSourceClass(original){
 if(!original)return "DIRECTORY_LISTING_ONLY";
 let domain;
 try{domain=new URL(original).hostname.replace(/^www\./,"").toLowerCase()}catch{return "UNKNOWN_SOURCE"}
 if(domain==="viewer.mapme.com"||domain==="mapme.com"||domain==="adorientem.church")return "THIRD_PARTY_AGGREGATOR";
 return "ORIGINAL_SOURCE_LINK_UNVERIFIED";
}
function matchesFor(venues,entry){
 const same=venues.filter(v=>v.cc===entry.cc);
 const addressMatches=entry.street?same.filter(v=>v.street===entry.street):[];
 // A church may host several communities. Preserve that physical-site distinction for review.
 if(addressMatches.length)return {matches:addressMatches,method:"STREET_ADDRESS",crossCommunity:addressMatches.some(v=>v.community!==entry.community)};
 const names=entry.city&&entry.nameKey?same.filter(v=>v.community===entry.community&&v.nameKey===entry.nameKey&&v.cityKey===key(entry.city)):[];
 return {matches:names,method:"NAME_AND_LOCALITY_ONLY",crossCommunity:false};
}
export function crosswalkThirdPartyDirectory(incoming,existing,{snapshotUrl="https://adorientem.church/",observedAt=null}={}){
 if(!Array.isArray(incoming)||!Array.isArray(existing))throw new TypeError("Arrays required");
 const venues=existing.map(r=>{const v=rowVenue(r);return {record:r,id:v.venue_id,cc:rowCountry(r),community:rowCommunity(r),
  nameKey:key(rowName(r)),cityKey:key(rowCity(r)),street:streetKey(rowAddress(r))}}).filter(x=>x.cc);
 const result={matched:[],needsReview:[],rejected:[],duplicates:[],statistics:{}};
 const firstByStreet=new Map(),firstByExact=new Map();
 for(const raw of incoming){
  const e=identity(raw);
  if(!e.cc||!e.name||!allowedCommunities.has(e.community)||(!isUrl(e.sourceUrl)&&!isUrl(e.listingUrl))){
   result.rejected.push({id:e.id,name:e.name,reason:"MISSING_COUNTRY_NAME_SUPPORTED_COMMUNITY_OR_LINK"});continue;
  }
  const groupKey=e.cc+"|"+e.community+"|";
  const streetIdentity=e.street?groupKey+e.street:null;
  const exactIdentity=groupKey+e.nameKey+"|"+(e.street||key(e.address)+"|"+key(e.city));
  const prior=streetIdentity?firstByStreet.get(streetIdentity):firstByExact.get(exactIdentity);
  const metadata={id:e.id,name:e.name,country_code:e.cc,community:e.community,address:e.address,city:e.city,
   source_url:e.originalSource,listing_url:e.listingUrl||null,snapshot_url:snapshotUrl,observed_at:observedAt,
   source_class:originalSourceClass(e.originalSource),publication_status:e.status,
   attribution:"Ad Orientem (adorientem.church); original source retained when available",
   schedules:raw.schedules??null,verification:raw.verification??null,street_fingerprint:e.street};
  if(prior){
   result.duplicates.push({...metadata,duplicate_of:prior,classification:"LIKELY_SAME_PHYSICAL_SITE_REVIEW"});
   continue;
  }
  if(streetIdentity)firstByStreet.set(streetIdentity,e.id||e.listingUrl);
  else firstByExact.set(exactIdentity,e.id||e.listingUrl);
  const match=matchesFor(venues,e);
  const siteIds=[...new Set(match.matches.map(m=>m.id).filter(Boolean))];
  const status=e.planned?"PLANNED_NOT_ACTIVE":e.inactive?"INACTIVE_HISTORICAL":null;
  const matchCandidate=match.matches.length===1&&match.method==="STREET_ADDRESS";
  if(matchCandidate){
   result.matched.push({...metadata,matched_venue_id:siteIds[0],match_method:match.method,
    classification:"EXISTING_PHYSICAL_SITE_REVIEW",cross_community:match.crossCommunity});
  }else{
   result.needsReview.push({...metadata,matched_candidates:siteIds,match_method:match.method,
    classification:status||(match.matches.length?"AMBIGUOUS_OR_WEAK_MATCH":"POTENTIAL_MISSING_VENUE"),
    publication_eligible:false,
    next_step:status?"DO_NOT_COUNT_AS_CURRENT":e.originalSource?"VERIFY_ORIGINAL_MASS_EVIDENCE":"ACQUIRE_OFFICIAL_SOURCE"});
  }
 }
 result.statistics={input:incoming.length,matched:result.matched.length,needs_review:result.needsReview.length,
   rejected:result.rejected.length,duplicates:result.duplicates.length,published:0};
 return result;
}
