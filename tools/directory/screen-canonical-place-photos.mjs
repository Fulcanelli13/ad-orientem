import {readFileSync,writeFileSync} from "node:fs";
import {pathToFileURL} from "node:url";
// Read-only full R49 x canonical Place spatial screening. Never promote records.
export const buildScreen=function buildScreen(geo,r49,covers,gallery){
  const stop=new Set("the of st saint saints church chapel our lady notre dame de la le du des holy roman catholic parish sainte san santa and et marie maria sanctuaire sanctuary basilica basilique cathedral cattedrale iglesia eglise chiesa kirche capilla di dei della del da von all blessed virgin".split(" "));
  const words=s=>String(s??"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().match(/[a-z0-9]+/g)||[];
  const tokens=s=>new Set(words(s).filter(w=>w.length>=4&&!stop.has(w)));
  const sim=(a,b)=>{a=tokens(a);b=tokens(b);if(!a.size||!b.size)return 0;let n=0;for(let w of a)if(b.has(w))n++;return Math.round(n/Math.max(a.size,b.size)*1000)/1000};
  const meters=(a,b,c,d)=>{let rad=x=>x*Math.PI/180,x=rad(c-a),y=rad(d-b),q=Math.sin(x/2)**2+Math.cos(rad(a))*Math.cos(rad(c))*Math.sin(y/2)**2;return Math.round(12742000*Math.asin(Math.min(1,Math.sqrt(q)))*10)/10};
  if(geo.schema!=="EXPLORE_GEOGRAPHY_SEED_V1"||r49.schema!=="AO_PRELIMINARY_TLM_MAP_R49"||covers.schema!=="AO_APPROVED_PLACE_MEDIA_V1"||gallery.schema!=="AO_APPROVED_PLACE_GALLERY_V1")throw Error("Frozen source schemas only");
  const col=Object.fromEntries(r49.columns.map((x,i)=>[x,i]));const exact=new Map(geo.directoryPlaceLinks.filter(x=>x.confidence==="CONFIRMED"&&x.relationship==="LOCATED_AT").map(x=>[x.venue_id,x.place_id]));
  const hasPhoto=new Set([...covers.items,...gallery.items].filter(x=>x.status==="APPROVED").map(x=>x.place_id));
  const byCountry=new Map();for(const p of geo.places){if(!Number.isFinite(p.geo?.lat)||!Number.isFinite(p.geo?.lng))continue;const c=p.address?.country_code;if(!byCountry.has(c))byCountry.set(c,[]);byCountry.get(c).push(p)}
  const pairs=[],batches=[];let covered=0;
  for(let start=0;start<r49.records.length;start+=200){
    let seen=0,nearPhotos=0;
    for(let i=start;i<Math.min(start+200,r49.records.length);i++){
      const v=r49.records[i];if(!Number.isFinite(v[col.lat])||!Number.isFinite(v[col.lng]))continue;
      let within=false,photo=false;
      for(const p of byCountry.get(v[col.country])||[]){
        const distance_m=meters(v[col.lat],v[col.lng],p.geo.lat,p.geo.lng);if(distance_m>350)continue;
        within=true;photo||=hasPhoto.has(p.place_id);
        const name_overlap=Math.max(0,...[p.name?.official,...p.name?.aliases||[]].filter(Boolean).map(x=>sim(v[col.name],x)));
        const existing=exact.get(v[col.id]);
        pairs.push({directory_record_index:i,venue_id:v[col.id],venue_name:v[col.name],country:v[col.country],
          venue_source_url:v[col.url],venue_pin_precision:v[col.precision],place_id:p.place_id,place_name:p.name.official,
          place_source_url:p.geo.source_url,place_pin_precision:p.geo.precision,distance_m,name_overlap,
          place_has_approved_photo:hasPhoto.has(p.place_id),
          disposition:existing===p.place_id?"EXISTING_CONFIRMED_LINK":existing?"DIFFERENT_CONFIRMED_PLACE_HOLD":
            name_overlap===0?"DIFFERENT_OR_GENERIC_DEDICATION_HOLD":"EXACT_BUILDING_EVIDENCE_REQUIRED_HOLD",
          auto_publish:false});
      }
      if(within)seen++;if(photo)nearPhotos++;
    }
    batches.push({offset:start,limit:Math.min(200,r49.records.length-start),nearby_venues:seen,nearby_approved_photo_venues:nearPhotos});
    covered+=Math.min(200,r49.records.length-start);
  }
  pairs.sort((a,b)=>a.directory_record_index-b.directory_record_index||a.distance_m-b.distance_m||a.place_id.localeCompare(b.place_id));
  return {schema:"AO_DIRECTORY_PLACE_PHOTO_SCREEN_V1",version:"2026-10-29",state:"RESEARCH_ONLY_NEVER_APP_VISIBLE",
    provenance:{r49:"data/directory/preliminary-map-r49.v1.json",places:"data/geography/seed-registry.v1.json",approved_cover:"data/geography/approved-place-media.v1.json",approved_gallery:"data/geography/approved-place-gallery.v1.json"},
    policy:"Nearby coordinates or name overlaps never certify the same physical worship building. No link, source, image or calendar publication may be inferred.",
    counts:{venues_screened:covered,canonical_places:geo.places.length,confirmed_links:exact.size,
      approved_covers:covers.items.length,approved_gallery_images:gallery.items.length,
      within_350m_pairs:pairs.length,venues_near_place:new Set(pairs.map(x=>x.venue_id)).size,
      pairs_within_100m:pairs.filter(x=>x.distance_m<=100).length,
      high_name_geo_pairs:pairs.filter(x=>x.distance_m<=80&&x.name_overlap>=.65).length,
      nearby_approved_photo_pairs:pairs.filter(x=>x.place_has_approved_photo).length,
      exact_confirmed_photo_joins:[...exact.values()].filter(x=>hasPhoto.has(x)).length,
      published_new_links:0,published_new_photos:0},
    batches,candidate_pairs:pairs,photo_review_queue:pairs.filter(x=>x.place_has_approved_photo)
      .map(x=>({venue_id:x.venue_id,venue_name:x.venue_name,place_id:x.place_id,place_name:x.place_name,
        distance_m:x.distance_m,name_overlap:x.name_overlap,disposition:x.disposition,
        review:"HOLD_SEPARATE_BUILDING_AND_RIGHTS_VERIFICATION"})),
    limitations:"Frozen R49 physical venues only. Other Directory records/leads and street/address-only Places are not counted as verified matches."};
};
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const read=p=>JSON.parse(readFileSync(p,"utf8"));
 const out=buildScreen(read("data/geography/seed-registry.v1.json"),read("data/directory/preliminary-map-r49.v1.json"),read("data/geography/approved-place-media.v1.json"),read("data/geography/approved-place-gallery.v1.json"));
 if(process.argv.includes("--write")){
   const i=process.argv.indexOf("--write");const name=process.argv[i+1];
   if(!name||!name.startsWith("data/geography/research/"))throw Error("Research destination required");
   writeFileSync(name,JSON.stringify(out,null,2)+"\n");
 }else console.log(JSON.stringify(out.counts));
}
