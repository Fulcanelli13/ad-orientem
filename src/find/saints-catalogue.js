// List-only Saints reading catalogue. This is an editorial branch preview,
// not a new Saint identity owner, calendar, artwork register or map gazetteer.
// The existing physical-site Saints lens is still the sole publisher of pins.
import {projectSaintPlaceItems} from "./saints-lens.js";

const arr=x=>Array.isArray(x)?x:[];
const tidy=x=>String(x??"").trim();
const fold=x=>tidy(x).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
const trusted=url=>{
  try{
    const u=new URL(url);
    return u.protocol==="https:" && (
      u.hostname==="www.vatican.va"||u.hostname==="press.vatican.va"||
      u.hostname==="www.auschwitz.org"||u.hostname==="salesians.org"||
      u.hostname==="www.newadvent.org"||u.hostname==="www.vaticanstate.va"
    );
  }catch{return false;}
};
const ROLES=Object.freeze({
 POPE:["Pope","Pape"],PASTOR:["Pastor","Pasteur"],SPIRITUAL_WRITER:["Spiritual writer","Auteur spirituel"],
 CHARITY_TO_POOR:["Charitable service","Service des pauvres"],BISHOP:["Bishop","Évêque"],
 PRIEST:["Priest","Prêtre"],THEOLOGIAN:["Theologian","Théologien"],MYSTIC:["Mystic","Mystique"],
 REFORMER:["Reformer","Réformateur"],SPIRITUAL_DIRECTOR:["Spiritual director","Directeur spirituel"],
 FOUNDER:["Founder","Fondateur"],CONTEMPLATIVE_RELIGIOUS:["Contemplative","Contemplatif"],
 MARTYR:["Martyr","Martyr"],MISSIONARY:["Missionary","Missionnaire"],TEACHER:["Teacher","Enseignant"],
 VIRGIN:["Virgin","Vierge"],RELIGIOUS:["Religious","Religieux"],
 PASTORAL_CARITY:["Pastoral charity","Charité pastorale"],
 VISIONARY_WITNESS:["Visionary witness","Témoignage de visions"]
});
const role=c=>({code:c,en:(ROLES[c]??[c,c])[0],fr:(ROLES[c]??[c,c])[1]});
const readLinks=urls=>Object.freeze([...new Set(arr(urls).filter(trusted))]
  .map((url,i)=>Object.freeze({id:"BIO-"+i,title:new URL(url).hostname.replace(/^www\./,"")+" · "+(i+1),url})));
// Cross-links are UI references only. Resolve by exact owner IDs, never
// normalized names, feast-day coincidence, archive art subjects or likely aliases.
const exactOwnerLinks=(person,index)=>{
  if(index?.schema!=="ao.saints.read-only-owner-index-20261015.v1"||
     index?.status!=="READ_ONLY_DERIVED_CROSS_OWNER_SNAPSHOT_NOT_PRIMARY_IDENTITY_OR_LITURGICAL_OWNER")return Object.freeze([]);
  const id=tidy(person.saint_id);
  if(!/^saint:[a-z0-9-]+$/.test(id))return Object.freeze([]);
  const owner="saint."+id.slice(6),links=[];
  if(arr(index.historical_subjects).some(x=>x.source_identity_id===owner))
    links.push(Object.freeze({scope:"historical",item_id:"saints:historic:"+owner,
      label_en:"Historical sanctoral source",label_fr:"Source du sanctoral historique",identity_policy:"EXACT_SOURCE_ID_ONLY"}));
  if(arr(index.post1960_named_persons).some(x=>x.calendar_person_id===owner))
    links.push(Object.freeze({scope:"later",item_id:"saints:modern:"+owner,
      label_en:"Official canonization record",label_fr:"Référence officielle de canonisation",identity_policy:"EXACT_SOURCE_ID_ONLY"}));
  return Object.freeze(links);
};
const vocabulary=person=>[person.name_en,person.name_fr,person.why_en,person.why_fr,
  ...arr(person.classification?.roles).flatMap(r=>[r.en,r.fr]),
  ...arr(person.classification?.honours).flatMap(r=>[r.en,r.fr])].join(" ");
const itemFor=(person,siteNames=[],placeId=null,ownerIndex=null)=>{
  const phrase=[vocabulary(person),...siteNames].join(" ");
  return Object.freeze({
    item_id:"saints:person:"+person.saint_id,lens:"saints",kind:"SAINT_CATALOGUE_PROFILE",
    saint_id:person.saint_id,
    title:person.name_en,title_fr:person.name_fr,
    eyebrow:"SAINTS · CATALOGUE",subtitle:siteNames.join(" · "),
    summary:person.why_en,summary_fr:person.why_fr,
    // A person without an independently documented associated site gets NO map pin.
    map_publishable:false,geo:null,place_id:placeId,
    saints:Object.freeze([person]),
    source_index_links:exactOwnerLinks(person,ownerIndex),
    search_text:fold(phrase)+" "+tidy(phrase).toLowerCase(),
    editorial_status:"RESEARCH_PREVIEW_NOT_RELEASE_APPROVAL"
  });
};
/**
 * Exactly one list card per person. Six pilot people may also be on the existing
 * nine Place records; their person and Place cards never create extra map pins.
 * The two optional additional datasets retain their research-only status.
 */
export function projectSaintCatalogueItems(dataset={}){
  const pilotPlaces=projectSaintPlaceItems(dataset);
  const people=new Map(), sites=new Map();
  for(const place of pilotPlaces)for(const person of arr(place.saints)){
    people.set(person.saint_id,person);
    const links=sites.get(person.saint_id)??[];
    links.push({place_id:place.place_id,name:place.subtitle});
    sites.set(person.saint_id,links);
  }
  const packs=[
    {data:dataset.saintsDoctors,schema:"ao.saints.holiness-first-eight-doctors-research-batch.v1",n:8},
    {data:dataset.saintsVocations,schema:"ao.saints.holiness-first-sixteen-cross-vocation-research.v1",n:16}
  ];
  for(const {data,schema,n} of packs){
    if(!data||data.schema!==schema||arr(data.people).length!==n)continue;
    for(const p of arr(data.people)){
      if(!["NOT_APP_VISIBLE","RESEARCH_ONLY_NOT_APP_VISIBLE"].includes(p.publication)||
        !p.reader_biography?.en||!p.reader_biography?.fr||
        p.reader_biography.editorial_status!=="SOURCE_CHECKED_READER_DRAFT_NOT_SECOND_EDITOR_APPROVED")continue;
      const raw=p.calendar_person_id??p.person_id;
      if(!/^saint\.[a-z0-9-]+$/.test(raw))continue;
      const id=raw.replace(/^saint\./,"saint:");
      if(people.has(id))continue; // Never overwrite a native pilot identity.
      const roles=arr((p.classifications??p.classification)?.roles).map(x=>role(x.code));
      const honours=arr((p.classifications??p.classification)?.formal_honours)
        .filter(x=>x.code==="DOCTOR_OF_CHURCH").map(x=>({code:x.code,en:"Doctor of the Church",fr:"Docteur de l’Église"}));
      const extraordinary=arr(p.extraordinary_accounts).filter(x=>tidy(x.en)&&tidy(x.fr)).map(x=>({
        id:x.id??x.event_id,kind:x.kind,en:x.en,fr:x.fr
      }));
      const life=p.life_events_review;
      if(!life?.birth?.date_label?.en||!life?.death?.date_label?.en)continue;
      people.set(id,Object.freeze({
        saint_id:id,recognition_status:"CANONIZED_SAINT",
        name_en:tidy(p.name?.en),name_fr:tidy(p.name?.fr),
        why_en:tidy(p.reader_biography.en),why_fr:tidy(p.reader_biography.fr),
        biography_facts:Object.freeze([]),// Facts remain in research records, not rendered twice.
        classification:Object.freeze({roles:Object.freeze(roles),honours:Object.freeze(honours),
          extraordinary:Object.freeze(extraordinary)}),
        life:Object.freeze({birth:life.birth,death:life.death,celebration:null}),
        sources:readLinks(p.reader_biography.source_urls??p.source_urls),
        calendar_context:null,calendar_candidate:p.nominal_1962_date??p.historical_311_nominal_month_day??null,
        artwork_id:null,
        editorial_status:"RESEARCH_READER_PREVIEW_ONLY"
      }));
    }
  }
  return Object.freeze([...people.values()].map(person=>{
    const s=sites.get(person.saint_id)??[];
    return itemFor(person,s.map(x=>x.name),s[0]?.place_id??null,dataset.saintsOwnerIndex);
  }).sort((a,b)=>a.title.localeCompare(b.title)));
}
