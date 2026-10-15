// Native Explore Saints pilot. The shared Place registry owns coordinates;
// the shrine registry owns saint/place source edges; saints data owns brief lives.
// This module adds no liturgical observances or new physical Place identities.
import { isMapPublishablePlaceGeo } from "./geography-contracts.js";

const arr=value=>Array.isArray(value)?value:[];
const txt=value=>String(value??"").trim();
const norm=value=>txt(value).toLocaleLowerCase();
const validLink=url=>{
  try{
    const parsed=new URL(url);
    return parsed.protocol==="https:"&&parsed.hostname==="www.vatican.va";
  }catch{return false;}
};
const addr=place=>place?.address?.formatted||[place?.address?.city,place?.address?.country].filter(Boolean).join(", ");
const validProfile=person=>
  person?.publication==="EDITORIAL_REVIEW_ONLY"&&
  /^((saint|blessed):)/.test(txt(person?.saint_id))&&
  person?.recognition_status===((String(person.saint_id).startsWith("blessed:"))?"BEATIFIED_NOT_CANONIZED":"CANONIZED_SAINT")&&
  txt(person?.why_honoured?.en)&&txt(person?.why_honoured?.fr)&&
  arr(person?.biography_facts).length>=3&&arr(person?.biography_facts).length<=5&&
  arr(person.biography_facts).every(f=>txt(f?.en)&&txt(f?.fr)&&arr(f?.source_ids).length);

function sourceLinks(person,sources){
  const ids=[...new Set(arr(person?.further_reading_source_ids))];
  return Object.freeze(ids.map(id=>{
    const record=sources?.[id];
    return record&&validLink(record.url)?Object.freeze({id,title:txt(record.title)||id,url:record.url}):null;
  }).filter(Boolean));
}

/**
 * A Saints lens pin represents ONE existing physical Place, not a saint's
 * invented "location." Multiple source-backed people can share a shrine.
 * Provisional/locality coordinate records remain accessible in List only.
 */
export function projectSaintPlaceItems(dataset={}){
  const pilot=dataset?.saints??{};
  if(pilot.schema!=="ao.saints.holiness-first-editorial-pilot.v1"||
     pilot.publication!=="RESEARCH_ONLY_NOT_APP_VISIBLE")return Object.freeze([]);
  const places=new Map(arr(dataset?.geography?.places).map(x=>[x?.place_id,x]).filter(([id])=>id));
  const shrines=new Map(arr(dataset?.shrines?.shrines).map(x=>[x?.shrine_id,x]).filter(([id])=>id));
  const records=new Map();
  for(const person of arr(pilot.people)){
    if(!validProfile(person))continue;
    const named=Object.freeze({
      saint_id:person.saint_id,
      recognition_status:person.recognition_status,
      name_en:txt(person.display_name?.en),
      name_fr:txt(person.display_name?.fr),
      why_en:txt(person.why_honoured.en),
      why_fr:txt(person.why_honoured.fr),
      biography_facts:Object.freeze(arr(person.biography_facts).map(f=>Object.freeze({
        kind:f.kind,en:txt(f.en),fr:txt(f.fr),
      }))),
      sources:sourceLinks(person,pilot.sources),
      artwork_id:null, // Do not promote candidate paintings or shrine photos.
    });
    if(!named.name_en||!named.name_fr)continue;
    for(const link of arr(person.place_links)){
      const site=places.get(link?.place_id),shrine=shrines.get(link?.shrine_id);
      // Do not allow a stale pilot edge to inherit some unrelated Place pin.
      if(!site||!shrine||shrine.place_id!==site.place_id||
        !arr(shrine.associated_saints).includes(person.legacy_source_name)||
        !arr(link?.source_ids).every(id=>arr(shrine.source_ids).includes(id)))continue;
      const key=site.place_id;
      if(!records.has(key))records.set(key,{place:site,saints:new Map(),shrine_ids:new Set()});
      const row=records.get(key);
      row.saints.set(person.saint_id,named);
      row.shrine_ids.add(shrine.shrine_id);
    }
  }
  return Object.freeze([...records.entries()].map(([placeId,row])=>{
    const p=row.place,people=Object.freeze([...row.saints.values()]);
    const display=people.map(x=>x.name_en).join(" · ");
    const displayFr=people.map(x=>x.name_fr).join(" · ");
    const geo=p.geo??null;
    const mapPublishable=Boolean(geo&&!geo.indicative_only&&
      ["site","complex_anchor"].includes(geo.precision)&&
      isMapPublishablePlaceGeo(geo,p.address?.country_code));
    return Object.freeze({
      item_id:"saints:place:"+placeId,
      lens:"saints",
      kind:"SAINTS_AT_PHYSICAL_PLACE",
      place_id:placeId,
      eyebrow:"SAINTS · PILOT",
      title:display,
      title_fr:displayFr,
      subtitle:txt(p.name?.official)||addr(p),
      summary:people[0]?.why_en??"",
      summary_fr:people[0]?.why_fr??"",
      address:p.address??null,
      geo:mapPublishable?geo:null,
      map_publishable:mapPublishable,
      map_state:mapPublishable?"MAPPED":"LIST_ONLY_GEO_HOLD",
      saints:people,
      associated_shrine_ids:Object.freeze([...row.shrine_ids]),
      search_text:norm([display,displayFr,p.name?.official,addr(p),...people.flatMap(s=>[
        s.why_en,s.why_fr,...s.biography_facts.map(b=>b.en),...s.biography_facts.map(b=>b.fr),
      ])].join(" ")),
      editorial_status:"SMALL_SOURCE_BOUND_PILOT_NO_APPROVED_ART",
    });
  }).sort((a,b)=>a.title.localeCompare(b.title)));
}
