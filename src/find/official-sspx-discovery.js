/* First-party SSPX public API: mass-place discovery independent of third-party compilers.
 * This uses the read-only map.fsspx.org API, never copies Latin Mass Directory.
 * New listings are NOT certified schedules. Ambiguous physical identities stay held.
 */
const clean=x=>String(x??"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const safe=x=>String(x??"").trim();
const arr=x=>Array.isArray(x)?x:[];
const nameKeys=x=>new Set(clean(x).split(" ").filter(t=>t.length>2&&!["the","chapel","church","saint","st","eglise","kapelle","chapelle","mission","priory","prieure"].includes(t)));
function relatedNames(a,b){
 const x=clean(a),y=clean(b);
 if(!x||!y)return false;
 if(x===y)return true;
 const one=nameKeys(x),two=nameKeys(y);
 const common=[...one].filter(t=>two.has(t));
 return common.length>=2&&common.length>=Math.ceil(Math.min(one.size,two.size)*0.8);
}
function sameArea(a,b){
 if(!a||!b)return false;
 const x=clean(a),y=clean(b);
 return x===y||x.length>=5&&y.length>=5&&(x.startsWith(y+" ")||y.startsWith(x+" "));
}
const officialURL=item=>{
 const path=safe(item.url);
 if(/^\/(en|fr|de|it|es)\/places\/[a-z0-9-]+$/i.test(path))return "https://map.fsspx.org"+path;
 const slug=safe(item.slug);
 if(/^[a-z0-9-]+$/i.test(slug))return "https://map.fsspx.org/en/places/"+slug;
 return null;
};
const massPlace=p=>p?.relationship==="fsspx"&&p?.countryCode&&p?.name
  &&(p?.sundayMass===true||p?.weekdayMass===true)
  &&(p?.kind!=="school"||arr(p?.alsoKinds).includes("chapel"));
function existingSspx(records){
 return arr(records).filter(r=>r?.ministries?.some(m=>m.community_id==="SSPX")).map(r=>{
  const v=r.venue||{};
  return {venue:v,cc:safe(v.address?.country_code).toUpperCase(),city:v.address?.city||"",
   name:v.name?.official||"",upstream:v.upstream?.upstream_id||"",geo:v.geo||{}};
 });
}
const nearby=(a,b)=>{
 const la=Number(a?.lat),lo=Number(a?.lng),lb=Number(b?.lat),lob=Number(b?.lng);
 if(!Number.isFinite(la)||!Number.isFinite(lo)||!Number.isFinite(lb)||!Number.isFinite(lob))return false;
 if(a?.indicative_only||b?.indicative_only)return false;
 // Bounding approximation is used only as a duplicate HOLD, never to merge records.
 return Math.abs(la-lb)<0.002&&Math.abs(lo-lob)<0.003;
};
function makeRecord(p,href){
 const id=safe(p.crmId)||safe(p.slug);
 const key=clean(id).replace(/ /g,"-");
 const sourceId="src-sspx-official-map-"+key;
 const venueId="ao-sspx-official-map-"+key;
 const status="OFFICIAL_LISTED_MASS_TIMES_UNCONFIRMED";
 const cc=safe(p.countryCode).toUpperCase();
 const locality=safe(p.city);
 const venue={
  venue_id:venueId,
  name:{official:safe(p.name),alternate:[]},
  venue_type:arr(p.alsoKinds).includes("chapel")?"chapel":safe(p.kind)||"other",
  upstream:{provider:"FSSPX_PUBLIC_MAP",provider_id:"SSPX_MAP_API",upstream_id:id,
   official_mass_frequency:{sunday:Boolean(p.sundayMass),weekday:Boolean(p.weekdayMass)}},
  address:{line1:null,line2:null,city:locality||null,region:safe(p.region)||null,
   country_code:cc,country:null,postal_code:null,formatted:[locality,safe(p.region),cc].filter(Boolean).join(", ")},
  geo:{lat:null,lng:null,precision:"unknown",geocoding_source:null},
  diocese:{diocese_id:null,name:null,type:null},
  contact:{phone:[],email:[],website:[href],schedule_url:[href],bulletin_url:[],contact_form:[],official_social:[]},
  capabilities:{sunday_mass:p.sundayMass===true},
  status:"listed",publication_state:status,source_ids:[sourceId],
 };
 const ministry={ministry_id:"ao-ministry-sspx-map-"+key,venue_id:venueId,community_id:"SSPX",
  relationship:"served_by",affiliation_confidence:"DIRECT",community_profile_ref:"SSPX",
  liturgical_usage:{family:"ROMAN",books:"1962",mass_form:"TRADITIONAL_LATIN",evidence_source_ids:[sourceId]},
  active:true,source_ids:[sourceId],schedules:[]};
 const source={source_id:sourceId,source_type:"SSPX_OFFICIAL_PUBLIC_MAP",publisher:"Society of Saint Pius X",
  title:"Official Mass location · times not imported",url:href,authority:"PRIMARY",
  fields_supported:["venue","affiliation","mass_presence"]};
 return Object.freeze({venue,ministries:[ministry],sources:[source]});
}
export function expandOfficialSspxMassPlaces(officialPlaces,{existingRecords=[]}={}){
 const known=existingSspx(existingRecords);
 const seen=new Set(),seenLocalities=new Map(),newRecords=[];
 const report={official_rows:arr(officialPlaces).length,sspx_mass_locations:0,new_official_listings:0,
   already_in_directory:0,ambiguous_same_locality:0,invalid_or_nonmass:0,duplicate_source_ids:0};
 const held=[];
 for(const p of arr(officialPlaces)){
  if(!massPlace(p)){report.invalid_or_nonmass++;continue}
  report.sspx_mass_locations++;
  const officialId=safe(p.crmId)||safe(p.slug);
  const cc=safe(p.countryCode).toUpperCase(),city=safe(p.city),name=safe(p.name);
  const href=officialURL(p);
  if(!officialId||!href||!/^[A-Z]{2}$/.test(cc)||(!city&&!safe(p.region))){
   report.invalid_or_nonmass++;continue;
  }
  if(seen.has(officialId)){report.duplicate_source_ids++;continue}
  seen.add(officialId);
  const same=known.filter(e=>e.cc===cc);
  const exact=same.filter(e=>sameArea(city,e.city)&&relatedNames(name,e.name));
  if(exact.length||same.some(e=>e.upstream===officialId)){
   report.already_in_directory++;continue;
  }
  const sameCity=same.filter(e=>sameArea(city,e.city));
  const closeGeos=same.filter(e=>nearby({lat:p.lat,lng:p.lng},e.geo));
  // Do not claim a distinct additional chapel where we already know one or more
  // SSPX venues in the same locality but the names have drifted.
  const cityKey=cc+"|"+clean(city);
  const other=seenLocalities.get(cityKey)||[];
  if(sameCity.length||closeGeos.length||other.some(x=>relatedNames(x,name))){
   report.ambiguous_same_locality++;held.push({crmId:officialId,name,cc,city,href,
     reason:"EXISTING_OR_RECENT_SSPX_VENUE_SAME_LOCALITY_REVIEW"});continue;
  }
  seenLocalities.set(cityKey,[...other,name]);
  newRecords.push(makeRecord(p,href));report.new_official_listings++;
 }
 return Object.freeze({records:Object.freeze(newRecords),held:Object.freeze(held),summary:Object.freeze(report)});
}
