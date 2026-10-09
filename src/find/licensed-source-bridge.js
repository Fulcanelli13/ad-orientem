/** Optional licensed directory feed: publishing is disabled until a recorded reuse grant exists.
 * Third-party research snapshots are never read by this module.
 */
const compact=value=>String(value??"").trim();
const canonical=value=>compact(value).normalize("NFKD").replace(/[\u0300-\u036f]/g,"")
 .toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const slug=value=>canonical(value).replace(/\s+/g,"-").slice(0,130);
const url=value=>{try{const u=new URL(value);return ["https:","http:"].includes(u.protocol)?u.href:null}catch{return null}};
const list=value=>Array.isArray(value)?value:[];
function streetFingerprint(v){
 const country=compact(v?.address?.country_code).toUpperCase();
 const addr=canonical(v?.address?.line1??v?.address?.formatted);
 // Do not merge disparate properties on the basis of a name or city alone.
 return country&&/\d/.test(addr)&&addr.length>=12?country+"|"+addr:null;
}
function namePlaceFingerprint(v){
 const country=compact(v?.address?.country_code).toUpperCase();
 const city=canonical(v?.address?.city);
 const name=canonical(v?.name?.official);
 return country&&city&&name?country+"|"+city+"|"+name:null;
}
function licenseIsEffective(grant){
 return grant?.status==="GRANTED"
   &&grant?.granted_to==="AD_ORIENTEM_APP"
   &&compact(grant?.grant_reference).length>=6
   &&compact(grant?.attribution).length>=8
   &&url(grant?.grant_evidence_url)!==null;
}
/**
 * Convert an explicitly licensed JSON feed to discoverable, schedule-unverified Find records.
 * It cannot invent a Mass schedule, liturgical edition, minister or accurate pin.
 * Potential same-venue duplicates are held, not merged into existing canonical source records.
 */
export function expandLicensedDirectoryFeed(feed,{existingRecords=[]}={}){
 const summary={source_rows:list(feed?.records).length,listing_records:0,duplicate_holds:0,
  missing_identity_holds:0,invalid_url_holds:0,license_status:"NOT_GRANTED"};
 if(feed?.schema!=="AO_LICENSED_DIRECTORY_FEED_V1"||!licenseIsEffective(feed?.permission))
  return {records:[],summary};
 summary.license_status="GRANTED";
 const existingStreet=new Set(list(existingRecords).map(x=>streetFingerprint(x?.venue)).filter(Boolean));
 const existingNames=new Set(list(existingRecords).map(x=>namePlaceFingerprint(x?.venue)).filter(Boolean));
 const ids=new Set(),streets=new Set(),names=new Set(),records=[];
 for(const raw of feed.records){
  const id=compact(raw?.source_id),name=compact(raw?.name),cc=compact(raw?.country_code).toUpperCase();
  const city=compact(raw?.city),address=compact(raw?.address),listingUrl=url(raw?.listing_url);
  // Without a proper locality or physical address there is no searchable venue identity.
  if(!id||!name||!/^[A-Z]{2}$/.test(cc)||(!city&&!address)){
   summary.missing_identity_holds++;continue;
  }
  if(!listingUrl){summary.invalid_url_holds++;continue}
  const venue={
   venue_id:"ao-licensed-"+slug(feed.source_id)+"-"+slug(id),
   name:{official:name,alternate:[]},
   venue_type:"other",upstream:{provider:"AO_LICENSED_EXTERNAL",provider_id:feed.source_id,upstream_id:id},
   address:{line1:address||null,line2:null,city:city||null,region:null,postal_code:null,
    country_code:cc,country:null,formatted:address||([city,cc].filter(Boolean).join(", "))},
   geo:{lat:null,lng:null,precision:"unknown",geocoding_source:null},
   diocese:{diocese_id:null,name:null,type:null},
   contact:{phone:[],email:[],website:[],schedule_url:[listingUrl],bulletin_url:[],contact_form:[],official_social:[]},
   capabilities:{sunday_mass:false},
   status:"listed",publication_state:"DIRECTORY_LISTED_UNVERIFIED",
   source_ids:["src-licensed-"+slug(feed.source_id)+"-"+slug(id)],
  };
  const street=streetFingerprint(venue),key=namePlaceFingerprint(venue);
  if(ids.has(venue.venue_id)||(street&&(existingStreet.has(street)||streets.has(street)))
    ||(key&&(existingNames.has(key)||names.has(key)))){
   summary.duplicate_holds++;continue;
  }
  ids.add(venue.venue_id);if(street)streets.add(street);if(key)names.add(key);
  const source={source_id:venue.source_ids[0],source_type:"LICENSED_THIRD_PARTY_DIRECTORY",
   issuer:compact(feed.permission.attribution),title:"Directory listing · independent verification pending",
   url:listingUrl,authority:"SECONDARY",retrieved_at:compact(feed.generated_at)||null,
   fields_supported:["venue.name","venue.address","directory_listing"]};
  records.push({
   venue,ministries:[{
    ministry_id:"ao-listed-ministry-"+slug(feed.source_id)+"-"+slug(id),
    venue_id:venue.venue_id,community_id:"OTHER",relationship:"unverified",
    affiliation_confidence:"UNKNOWN",community_profile_ref:null,
    liturgical_usage:{family:"UNKNOWN",books:"UNKNOWN",mass_form:"UNKNOWN",evidence_source_ids:[]},
    active:false,source_ids:[source.source_id],schedules:[],
   }],
   sources:[source],
  });
  summary.listing_records++;
 }
 return {records,summary};
}
