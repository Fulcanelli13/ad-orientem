// Read-only join over the Shrines & Pilgrimages SOT. Calendar exclusively owns dates.
const arr=value=>Array.isArray(value)?value:[];

export function pilgrimagePlacesForCalendarKeys(keys,corpus={}){
  const wanted=new Set(arr(keys).filter(key=>typeof key==="string"&&key));
  if(!wanted.size)return Object.freeze([]);
  const shrines=new Map(arr(corpus.shrines).map(row=>[row.shrine_id,row]));
  const relevantLinks=new Map(arr(corpus.temporalLinks)
    .filter(link=>link.binding_state==="BOUND_TO_CALENDAR"&&wanted.has(link.calendar_semantic_key))
    .map(link=>[link.temporal_link_id,link]));
  const places=new Map();
  for(const pilgrimage of arr(corpus.pilgrimages)){
    const shrine=shrines.get(pilgrimage.destination_shrine_id);
    if(!shrine?.place_id)continue;
    for(const id of arr(pilgrimage.temporal_link_ids)){
      const link=relevantLinks.get(id);
      if(!link)continue;
      const key=link.calendar_semantic_key+"|"+shrine.place_id;
      const old=places.get(key);
      if(old){old.pilgrimage_ids.push(pilgrimage.pilgrimage_id);continue;}
      places.set(key,{
        semantic_key:link.calendar_semantic_key,
        place_id:shrine.place_id,
        shrine_id:shrine.shrine_id,
        shrine_name:shrine.name,
        saints:arr(shrine.associated_saints),
        source_event_label:link.source_event_label,
        source_ids:arr(link.source_ids),
        pilgrimage_ids:[pilgrimage.pilgrimage_id],
      });
    }
  }
  return Object.freeze([...places.values()].sort((a,b)=>a.shrine_name.localeCompare(b.shrine_name))
    .map(row=>Object.freeze({...row,saints:Object.freeze([...row.saints]),source_ids:Object.freeze([...row.source_ids]),pilgrimage_ids:Object.freeze([...row.pilgrimage_ids])})));
}
