// Browsable source-index records, not invented saint biographies or map pins.
// All person/group identifiers remain owned by their original Calendar or v43 archive.
const arr=x=>Array.isArray(x)?x:[];
const str=x=>String(x??"").trim();
const folded=x=>str(x).toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
const officialLink=url=>{
  try{
    const u=new URL(url);
    return u.protocol==="https:"&&u.hostname==="www.causesanti.va";
  }catch{return false;}
};
const item=(id,title,titleFr,subtitle,subtitleFr,summary,summaryFr,sourceLinks,meta)=>Object.freeze({
  item_id:id,lens:"saints",kind:"SAINT_SOURCE_INDEX_ENTRY",
  title,title_fr:titleFr||title,subtitle,subtitle_fr:subtitleFr||subtitle,
  eyebrow:"SAINTS · SOURCES",summary,summary_fr:summaryFr||summary,
  index_metadata:Object.freeze(meta),source_links:Object.freeze(sourceLinks),
  search_text:folded([title,titleFr,subtitle,subtitleFr,summary,summaryFr,meta?.source_id,meta?.date].join(" ")),
  map_publishable:false,geo:null,place_id:null,saints:Object.freeze([]),
  artwork_id:null,editorial_status:"SOURCE_REFERENCE_WITHOUT_BIOGRAPHY"
});
/**
 * Two deliberately distinct reference scopes. Historical components may be
 * collective/artwork demands, not individual persons; post-1960 persons may
 * lack life narratives, and canonization days do not establish feast dates.
 */
export function projectSaintSourceIndexItems(dataset={},scope="historical"){
  const index=dataset?.saintsOwnerIndex;
  if(index?.schema!=="ao.saints.read-only-owner-index-20261015.v1"||
    index?.status!=="READ_ONLY_DERIVED_CROSS_OWNER_SNAPSHOT_NOT_PRIMARY_IDENTITY_OR_LITURGICAL_OWNER")
    return Object.freeze([]);
  if(scope==="historical"){
    return Object.freeze(arr(index.historical_subjects).filter(x=>x.source_identity_id&&x.archive_name)
      .map(x=>{
        const days=arr(x.archived_nominal_dates);
        const dates=days.join(" · ");
        const caption="Archived sanctoral dates: "+dates;
        return item("saints:historic:"+x.source_identity_id,x.archive_name,x.archive_name,
          caption,"Dates historiques archivées : "+dates,
          "Historical archive subject, not a verified individual biography or an observed feast in the current calendar.",
          "Sujet des archives historiques, non une biographie individuelle vérifiée ni une fête observée du calendrier actuel.",
          [],{scope:"ARCHIVED_SOURCE_SUBJECT",source_id:x.source_identity_id,date:dates,
            precision:"ARCHIVED_NOMINAL_NOT_OBSERVED",record_type:x.record_type,
            representation_modes:x.representation_modes??[]});
      }));
  }
  if(scope==="later"){
    const named=arr(index.post1960_named_persons).filter(x=>x.calendar_person_id&&x.name)
      .map(x=>{
        const url=arr(x.source_urls).find(officialLink);
        const on=str(x.canonized_on);
        return item("saints:modern:"+x.calendar_person_id,x.name,x.name,
          "Canonized: "+on,"Canonisé(e) : "+on,
          "Named in the Dicastery's canonization index. A source-linked life profile has not yet been prepared in this index.",
          "Personne nommée dans l’index des canonisations du Dicastère. La biographie sourcée n’est pas encore intégrée à cet index.",
          url?[{url,issuer:"Dicastery for the Causes of Saints"}]:[],
          {scope:"OFFICIAL_NAMED_CANONIZATION",source_id:x.calendar_person_id,date:on,
            precision:"CANONIZATION_DATE_NOT_FEAST_DATE",record_type:x.record_type});
      });
    const groups=arr(index.post1960_collectives).filter(x=>x.source_group_id&&x.title?.en).map(x=>{
      const url=officialLink(x.source_url)?x.source_url:null;
      return item("saints:group:"+x.source_group_id,x.title.en,x.title.fr,
        "Collective canonization","Canonisation collective",
        [x.context?.en,x.why_honoured?.en].filter(Boolean).join(" "),
        [x.context?.fr,x.why_honoured?.fr].filter(Boolean).join(" "),
        url?[{url,issuer:"Dicastery for the Causes of Saints"}]:[],
        {scope:"COLLECTIVE_CANONIZATION",source_id:x.source_group_id,date:"",
          precision:"GROUP_NOT_INDIVIDUAL_PERSON",record_type:x.record_type,
          members:x.member_count,estimated_members:x.approximate_member_count});
    });
    return Object.freeze([...named,...groups].sort((a,b)=>a.title.localeCompare(b.title)));
  }
  return Object.freeze([]);
}
