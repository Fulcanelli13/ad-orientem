// P65: Assemble editorial copy only from existing canonical owners.
// The guide, Saint, Custom and Sacred Phenomena corpora retain ownership;
// this module creates no new Place, Person, relic, liturgical feast or photo.
export const PLACE_EDITORIAL_REUSE_VERSION="ao.place-editorial-reuse.v1";
const rows=x=>Array.isArray(x)?x:[];
const nonempty=x=>typeof x==="string"&&x.trim().length>0;
const url=x=>typeof x==="string"&&/^https:\/\/[^\s]+$/.test(x);
const fixed=x=>Object.freeze(x);
const uniq=x=>[...new Set(x)];

export function publishedPlaceIntro(placeId,guideCorpora=[]){
  const guides=rows(guideCorpora).flatMap(c=>rows(c?.guides));
  const matches=guides.filter(g=>g?.place_id===placeId&&g.publication==="PUBLISHED"&&
    url(g.official_url)&&nonempty(g.subtitle_en)&&nonempty(g.subtitle_fr));
  // Ambiguous duplicate publication ownership is an editorial conflict, not
  // permission to choose whichever file was loaded first.
  if(matches.length!==1)return null;
  const guide=matches[0];
  const first=rows(guide.sections).flatMap(section=>rows(section?.paragraphs))
    .find(p=>nonempty(p?.en)&&nonempty(p?.fr)&&url(p?.source_url));
  if(!first)return null;
  return fixed({
    place_id:placeId,ownership:"EXISTING_PUBLISHED_ILLUSTRATED_GUIDE",
    title:fixed({en:guide.subtitle_en,fr:guide.subtitle_fr}),
    introduction:fixed({en:first.en,fr:first.fr}),
    source_url:first.source_url,official_url:guide.official_url,
    // The full story stays in the original guide, not a second biography.
    full_guide_available:true,
  });
}

export function existingSaintBiographyPreview(saintId,saintsCorpus={}){
  if(!/^(saint|blessed):[a-z0-9-]+$/.test(saintId||"")||
     saintsCorpus.schema!=="ao.saints.holiness-first-editorial-pilot.v1")return null;
  const people=rows(saintsCorpus.people).filter(p=>p?.saint_id===saintId);
  if(people.length!==1)return null;
  const person=people[0];
  // Do not misrepresent editorial pilot prose as production-approved Saints text.
  if(person.publication!=="EDITORIAL_REVIEW_ONLY"||
     !nonempty(person.display_name?.en)||!nonempty(person.display_name?.fr)||
     !nonempty(person.why_honoured?.en)||!nonempty(person.why_honoured?.fr))return null;
  const facts=rows(person.biography_facts).filter(f=>nonempty(f?.en)&&nonempty(f?.fr)&&
    rows(f.source_ids).length>0);
  const cited=uniq([...rows(person.why_honoured?.source_ids),...facts.flatMap(f=>rows(f.source_ids))]);
  const sources=cited.map(id=>saintsCorpus.sources?.[id]).filter(s=>url(s?.url));
  if(!facts.length||!sources.length)return null;
  return fixed({
    saint_id:saintId,publication:"EDITORIAL_REVIEW_ONLY",
    display_name:fixed({en:person.display_name.en,fr:person.display_name.fr}),
    short_bio:fixed({en:person.why_honoured.en,fr:person.why_honoured.fr}),
    // The Saints owner owns all biography facts. A Place never owns them.
    further_facts:fixed(facts.map(f=>fixed({en:f.en,fr:f.fr,source_ids:fixed([...f.source_ids])}))),
    source_urls:fixed(uniq(sources.map(s=>s.url))),
    calendar1962:null,
  });
}

export function existingPlaceEditorialConnections(placeId,owners={}){
  const placeExists=rows(owners.geography?.places).some(p=>p.place_id===placeId);
  if(!placeExists)return fixed({place_id:placeId,introduction:null,sacred_objects:fixed([]),
    customs:fixed([]),editorial_saints:fixed([])});
  const introduction=publishedPlaceIntro(placeId,owners.guideCorpora);
  const sacred_objects=rows(owners.phenomena?.relics)
    .filter(r=>r.place_id===placeId&&r.source_claim==="LOCATION_AND_VENERATION_ATTESTED"&&
      r.authentication==="NOT_INDEPENDENTLY_CERTIFIED_BY_APP"&&url(r.source_url))
    .map(r=>fixed({
      id:r.id,title:fixed({en:r.title_en,fr:r.title_fr}),
      description:fixed({en:r.summary_en,fr:r.summary_fr}),
      source_url:r.source_url,authenticity:"NOT_INDEPENDENTLY_CERTIFIED",
      access:"NOT_ASSERTED",
    }));
  const customMap=new Map(rows(owners.customs?.customs)
    .filter(c=>c.publication_state==="PUBLISHED").map(c=>[c.custom_id,c]));
  const customs=rows(owners.customs?.attestations)
    .filter(a=>a.place_id===placeId&&a.map_policy==="PLACE"&&a.geographic_precision==="PLACE"&&
      a.strength==="STRONG"&&rows(a.source_ids).length&&customMap.has(a.custom_id))
    .map(a=>fixed({id:a.custom_id,attestation_id:a.attestation_id,
      name:customMap.get(a.custom_id).name,
      source_ids:fixed([...a.source_ids]),
      local_scope:true,not_a_calendar_observance:true,
    }));
  const editorial_saints=rows(owners.saints?.people)
    .filter(p=>rows(p.place_links).some(link=>link.place_id===placeId&&
      link.relation_kind==="SHRINE_ASSOCIATION_ONLY"&&rows(link.source_ids).length))
    .map(p=>existingSaintBiographyPreview(p.saint_id,owners.saints)).filter(Boolean);
  return fixed({place_id:placeId,introduction,
    sacred_objects:fixed(sacred_objects),
    customs:fixed(customs),
    editorial_saints:fixed(editorial_saints)});
}
