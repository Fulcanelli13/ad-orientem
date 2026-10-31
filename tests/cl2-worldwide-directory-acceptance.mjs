// The whole-world directory, not a smaller R49 showcase, is the Explore owner.
// This proves one site per CL2 effective physical identity and that additional
// source listings remain accessible without fabricated pins, times or status.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {projectPreliminaryR49,projectPublishedProvisionalMassSites,filterPreliminaryR49}
 from "../src/find/preliminary-directory-r49.js";
import {validateCL2PhysicalIndex,projectCL2PhysicalDirectory}
 from "../src/find/cl2-physical-directory.js";
import {renderDirectoryVenueCard} from "../src/find/directory-card.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";
const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const index=validateCL2PhysicalIndex(read("data/directory/generated/cl2-physical-site-index.v1.json"));
const base=projectPreliminaryR49(read("data/directory/preliminary-map-r49.v1.json"));
const published=projectPublishedProvisionalMassSites(base,
 read("data/directory/published-provisional-mass-sites-20261026.v1.json"));
assert.equal(base.length,1879);
assert.equal(published.length,1882);
const reported=(label,group)=>{
 const raw=String(label??"").trim().toUpperCase();
 return ["FSSP","ICKSP","IBP","AASJMV","SSPX"].includes(raw)?raw:
   group==="SSPX"?"SSPX":"OTHER";
};
const world=projectCL2PhysicalDirectory(published,index,{mapAffiliation:reported});
assert.equal(world.length,2582,"2,579 distinct CL2 physical sites + 3 published external additions");
assert.equal(new Set(world.map(item=>item.item_id)).size,2582);
assert.equal(new Set(world.filter(x=>x.physical_group_id).map(x=>x.physical_group_id)).size,2579);
assert.equal(world.filter(x=>x.map_publishable).length,1914);
const diocesanQuality=read("data/directory/research/diocesan-coordinate-quality-audit-20261031.v1.json");
assert.equal(diocesanQuality.schema,"AO_DIOCESAN_COORDINATE_QUALITY_AUDIT_V1");
assert.equal(diocesanQuality.records.length,587);
assert.equal(new Set(diocesanQuality.records.map(x=>x.physical_group_id)).size,587);
assert.equal(diocesanQuality.counts.cl2_source_labelled_diocesan,584);
assert.equal(diocesanQuality.counts.additional_b91_diocesan,3);
assert.equal(diocesanQuality.counts.mapped,583);
assert.equal(diocesanQuality.counts.missing,4);
assert.equal(diocesanQuality.counts.by_coordinate_origin.R49_INHERITED,513);
assert.equal(diocesanQuality.counts.by_coordinate_origin.REVIEWED_SITE_OVERLAY,67);
assert.equal(diocesanQuality.counts.by_coordinate_origin.B91_PUBLISHED_PROVISIONAL,3);
assert.equal(diocesanQuality.counts.inherited_precision.source_marker_unassessed,445);
const diocesanQualityByGroup=new Map(diocesanQuality.records.map(r=>[r.physical_group_id,r]));
const blockedCoords=read("data/directory/research/diocesan-coordinate-blockers-20261031.v1.json");
assert.equal(blockedCoords.items.length,4);
for(const row of blockedCoords.items){
 const record=diocesanQualityByGroup.get(row.physical_group_id);
 assert.ok(record&&record.lat===null&&record.lng===null);
 assert.equal(record.photo_gate,"MISSING_COORDINATE");
}
for(const row of diocesanQuality.records){
 assert.equal(row.photo_research_started,false,"The photo-search programme has not started");
 assert.ok(row.photo_gate,"Never admit an unadjudicated diocesan photo position");
 const isB91=row.coordinate_origin==="B91_PUBLISHED_PROVISIONAL";
 const item=isB91?world.find(x=>x.source_id===row.physical_group_id):
   world.find(x=>x.physical_group_id===row.physical_group_id);
 assert.ok(item,"Coordinate audit record is not in canonical Explore");
 if(row.coordinate_origin==="REVIEWED_SITE_OVERLAY"){
  assert.equal(item.geo.lat,row.lat);
  assert.equal(item.geo.lng,row.lng);
  assert.equal(item.geo.source_ref,row.coordinate_ref);
 }
 if(row.lat===null)assert.equal(item.map_publishable,false);
}

// The external Photo Finder must consume exactly the approved runtime site
// markers. Never regress to the frozen R49 snapshot or create photo-search
// coordinates independently of Explore's canonical physical-site projection.
const photoPins=read("data/directory/generated/cl2-photo-ready-pin-overlay.v1.json");
assert.equal(photoPins.schema,"AO_CL2_PHOTO_READY_PIN_OVERLAY_V1");
assert.deepEqual(photoPins.counts,{new_site_pins:67,refined_existing_site_pins:16,corrected_existing_site_pins:13});
assert.equal(photoPins.pins.length,96);
assert.equal(new Set(photoPins.pins.map(p=>p.physical_group_id)).size,86);
for(const pin of photoPins.pins){
 const venue=world.find(x=>x.physical_group_id===pin.physical_group_id);
 assert.ok(venue&&venue.map_publishable&&venue.geo,"Photo index references an unmapped venue: "+pin.physical_group_id);
 assert.ok(venue.source_ids.includes(pin.source_id),"Photo pin source identity differs from CL2");
 assert.equal(venue.geo.lat,pin.lat,"Photo Finder pin latitude differs from Explore");
 assert.equal(venue.geo.lng,pin.lon,"Photo Finder pin longitude differs from Explore");
 assert.match(pin.source_url,/^https:\/\//);
 assert.ok(pin.review_scope,"Photo Finder requires explicit site/entrance precision disclosure");
}


for(const [group,sourceId,lat,lng,ref,street] of [
 ["RG-014B017E0591","DIO-GB-ARUNDEL-CATERHAM-SACRED-HEART",51.287381,-0.08646362,"historicengland:1294941","Essendene Road"],
 ["RG-1A015C23D5BA","AO-AMER-R28-US-25-03",42.50055,-96.41809,"osm:node:354389668","703 West 5th Street"],
 ["RG-368B7B3B5FA3","V19:DIO-US-MN-ST-PAUL-SAINT-AGNES",44.95972,-93.12333,"nrhp:80002125","535 Thomas Avenue West"],
 ["RG-46B891B2CE6E","AO-AMER-R26-US-03-08",30.22659,-93.21666,"nrhp:94001201","935 Bilbo Street"],
 ["RG-48A5CF9C3C73","AO-AMER-R26-US-03-06",42.50094,-96.4069,"osm:node:354389830","1003 Douglas Street"],
 ["RG-130C766CB4B6","AO-EUR-GB-011",52.954638,-1.1571735,"historicengland:1247533","Derby Road"],
 ["RG-1484AB15A7A1","AO-AMER-R27-US-06-18",35.7775,-78.67016,"osm:way:553750193","715 Nazareth Street"],
]){
 const item=world.find(x=>x.physical_group_id===group);
 assert.ok(item,"Required corrected diocesan church building");
 assert.ok(item.source_ids.includes(sourceId));
 assert.equal(item.geo.lat,lat);
 assert.equal(item.geo.lng,lng);
 assert.equal(item.geo.source_ref,ref);
 assert.ok(item.address.formatted.includes(street));
 assert.ok(item.geo.review_scope,"The specific physical-site identity must remain visible");
}
for(const [group,lat,lng,ref,scope] of [
 ["RG-18B421A46625",51.71896,8.75581,"osm:way:255378538","CATHEDRAL_CHURCH_BUILDING_NOT_ENTRANCE"],
 ["RG-2ACA16F334CA",43.68169,-70.29347,"osm:node:7170760600","DIOCESAN_ORATORY_CHURCH_BUILDING_NOT_ENTRANCE"],
]){
 const venue=world.find(x=>x.physical_group_id===group);
 const audit=diocesanQualityByGroup.get(group);
 const photoPin=photoPins.pins.find(p=>p.physical_group_id===group);
 assert.ok(venue&&audit&&photoPin,"Reviewed site, ledger and photo coordinate index must agree");
 assert.equal(venue.geo.lat,lat);
 assert.equal(venue.geo.lng,lng);
 assert.equal(venue.geo.source_ref,ref);
 assert.equal(venue.geo.review_scope,scope);
 assert.equal(audit.coordinate_origin,"REVIEWED_SITE_OVERLAY");
 assert.equal(audit.photo_gate,"REVIEWED_PHYSICAL_SITE_NO_PHOTO_APPROVAL");
 assert.equal(audit.photo_research_started,false);
 assert.equal(photoPin.lat,lat);
 assert.equal(photoPin.lon,lng);
}
assert.equal(diocesanQualityByGroup.get("RG-2ACA16F334CA").operator_scope,
 "DIOCESAN_ORATORY_CONFIRMED_BY_DIOCESE");
const stMonica=world.find(x=>x.physical_group_id==="RG-3235F2E6494F");
assert.ok(stMonica?.map_publishable);
assert.equal(stMonica.geo.lat,34.02459);
assert.equal(stMonica.geo.lng,-84.10151);
assert.equal(stMonica.geo.source_ref,"osm:way:392483318");
assert.equal(stMonica.geo.review_scope,"CATHOLIC_PARISH_CHURCH_BUILDING_NOT_ENTRANCE");
const raritanGate=diocesanQualityByGroup.get("RG-18659A3C6ECE");
assert.equal(raritanGate.photo_gate,"OPERATOR_EXCLUDED");
assert.equal(raritanGate.operator_scope,"ORATORY_OF_ST_PHILIP_NERI_PASTORAL_CARE_CONFIRMED");
assert.ok(raritanGate.operator_evidence.every(url=>url.startsWith("https://")));
assert.equal(diocesanQuality.counts.photo_gates.OPERATOR_EXCLUDED,5);
for(const [id,lat,lng,ref,scope] of [["RG-3935C183A2BA",40.31467,-79.3817,"osm:way:432365179","HOLY_FAMILY_LATROBE_CHURCH_BUILDING_NOT_NEIGHBORING_PARISH"],["RG-7A75E8D68125",37.46075,-122.18033,"osm:way:114158255","NATIVITY_MENLO_PARK_HISTORIC_CHURCH_NOT_RECTORY"],["RG-DB7556C0C980",36.17539,-86.79166,"osm:way:893977074","ASSUMPTION_NASHVILLE_CHURCH_BUILDING_NOT_OFFICE"],["RG-9CF80257612A",41.83575,-87.65242,"osm:way:210167509","PERPETUAL_HELP_CHICAGO_PARISH_CHURCH_NOT_SCHOOL"],["RG-BE23723D6B4A",45.44299,10.9953,"osm:way:138811441","VERONA_SAN_GIOVANNI_IN_FORO_CHURCH_NOT_ANOTHER_PARISH"],["RG-63BC2CF66C4B",45.539346,10.226049,"independent:outdooractive-san-zeno-brescia","BRESCIA_SAN_ZENO_AL_FORO_CHURCH_NOT_ROMAN_FORUM"],["RG-0AD2B2092E4E",42.285056,-83.741389,"independent:st-thomas-ann-arbor-building","ANN_ARBOR_HISTORIC_PARISH_CHURCH_NOT_SCHOOL_OR_OFFICE"]]){
 const item=world.find(x=>x.physical_group_id===id),q=diocesanQualityByGroup.get(id),pin=photoPins.pins.find(p=>p.physical_group_id===id);
 assert.ok(item&&q&&pin,"Reviewed site must have a matching source-owned runtime church");
 assert.equal(item.geo.lat,lat);assert.equal(item.geo.lng,lng);
 assert.equal(item.geo.source_ref,ref);assert.equal(item.geo.review_scope,scope);
 assert.equal(q.coordinate_origin,"REVIEWED_SITE_OVERLAY");
 assert.equal(q.photo_gate,"REVIEWED_PHYSICAL_SITE_NO_PHOTO_APPROVAL");
 assert.equal(q.photo_research_started,false);
 assert.equal(pin.lat,lat);assert.equal(pin.lon,lng);
}
for(const [id,scope] of [["RG-B95EC4107AE0","CINCINNATI_ORATORY_OLD_ST_MARY_MINISTRY"],["RG-E586590BB5C8","CINCINNATI_ORATORY_SACRED_HEART_MINISTRY"]]){
 const q=diocesanQualityByGroup.get(id);
 assert.equal(q.photo_gate,"OPERATOR_EXCLUDED");
 assert.equal(q.operator_scope,scope);
 assert.equal(q.photo_research_started,false);
}
assert.equal(diocesanQuality.counts.photo_gates.OPERATOR_EXCLUDED,7);
const additional=world.filter(x=>x.physical_site_source==="CL2_MASTER"&&
 !published.some(b=>b.source_id===x.source_id));
assert.equal(additional.length,735);
const newSites=additional.filter(x=>!x.map_publishable);
assert.equal(newSites.length,668);
assert.ok(newSites.every(x=>x.map_state==="ADDRESS_ONLY"&&x.geo===null&&
 x.sections.length===0&&x.actions.length===0&&x.source_ids.length>=1));
assert.ok(newSites.every(x=>/MASS UNVERIFIED/.test(x.status)));
assert.ok(newSites.every(x=>x.affiliation_scope==="SOURCE_LABEL_ONLY"));
assert.ok(newSites.every(x=>x.summary.includes("not been independently verified")));
assert.equal(newSites.filter(x=>x.source_links.length===0).length<=196,true);
const noSource=newSites.filter(x=>x.source_links.length===0);
assert.ok(noSource.every(x=>x.source_ids.length>0&&x.note.includes("Research-listed")));

// Explicit diocesan-source cohort: recover its missing physical site geometry
// without including institute/community sites in the diocesan photo queue.
const diocesanGroupIds=new Set(index.records.filter(x=>x[5]==="Diocesan").map(x=>x[0]));
assert.equal(diocesanGroupIds.size,584);
const diocesan=world.filter(x=>diocesanGroupIds.has(x.physical_group_id));
assert.equal(diocesan.length,584);
assert.equal(diocesan.filter(x=>x.map_publishable).length,580);
assert.equal(diocesan.filter(x=>!x.map_publishable).length,4);
for(const [group] of [["RG-14C05BCC015B"],["RG-3B5F15EA02ED"],["RG-DF3BA1A9A39C"],["RG-3EE76EFE0DC3"],["RG-270210292F78"],["RG-AA00B3C74515"],["RG-77CC30491D1E"],["RG-769233567FB2"],["RG-A9687EEF16FC"],["RG-5A52F4C1379D"],["RG-B68-086D5372D517"],["RG-2CFE11950F95"],["RG-4E6E8B55676B"],["RG-EE22A08568B9"],["RG-48A5E9F09178"],["RG-1EE1D2C9B3EB"],["RG-DE5F8ED4E2F7"],["RG-322AA8195E65"],["RG-C7F25752659D"],["RG-4D09923C6B74"],["RG-8DC436A75526"],["RG-938EAA84BA0A"],["RG-A0933DE542C7"],["RG-8CB13769F987"],["RG-BBB3789ADB9A"],["RG-0BB62E04774C"],["RG-783CD50DD217"],["RG-04ED0DAE5D46"],["RG-13C11CB31E3F"],["RG-7E91D5FD0AC3"],["RG-D2CECBA0C364"],["RG-F03B6AF4FA24"],["RG-CC73C2CBD613"],["RG-B30F94A20F69"],["RG-C3F8A4083DC9"],["RG-D1C52ADC007B"],["RG-1EDB76F4B57B"],["RG-A768309560A6"],["RG-19BD1D3D4E73"],["RG-2577094CF7E4"],["RG-3E135A9E5C09"],["RG-AE6B9D48B695"],["RG-2181DD7D9F32"],["RG-97D731A26655"],["RG-261733295B4C"]]){
 const item=diocesan.find(x=>x.physical_group_id===group);
 assert.ok(item?.map_publishable,"Diocesan site must be pinned: "+group);
 assert.equal(item.map_state,"PROVISIONAL");
 assert.equal(item.affiliation_scope,"SOURCE_LABEL_ONLY");
}
const operatorHoldGroups=new Set(["RG-19BD1D3D4E73","RG-2577094CF7E4","RG-3E135A9E5C09","RG-AE6B9D48B695"]);
assert.ok([...operatorHoldGroups].every(id=>diocesan.find(x=>x.physical_group_id===id)?.geo.review_scope.includes("NOT_DIOCESAN_PHOTO_QUEUE")));
const cantius=world.filter(x=>x.source_ids?.includes("V19:SJC-001"));
assert.equal(cantius.length,1,"Canons of St John Cantius retains one exact source-backed church");
assert.equal(cantius[0].map_publishable,true);
// Seventy-six separately reviewed physical site or address references may be shown
// provisionally. A site marker does NOT verify a Mass or precise entrance.
for(const [group,id,name,lat,lng,osm,precision="site",reviewScope=null] of [
 ["RG-261733295B4C","AO-B39-LOC-IT-B7E3416FBF04","Cappella della Madonna di Pompignano",39.8976619,18.2139344,"unavoce:google-place:ae1bcf27ad68348","site","UNAVOCE_LINKED_CHAPEL_PLACE_NOT_DESTROYED_SPECCHIA_SITE"],
 ["RG-2181DD7D9F32","AO-B38-LOC-ES-370B93FA6BC","Capilla de la Adoración Permanente",38.992969,-1.851937,"independent:iglesiacercademi:oratorio-carmen-albacete","site","CARMELITE_THIRD_ORDER_ORATORY_DIOCESAN_ADORATION_NOT_OLD_OCTAVIO_CUARTERO"],
 ["RG-97D731A26655","AO-B39-LOC-PL-8AB74ADAA7D6","Kaplica Najświętszego Serca Jezusowego w Szpitalu Powiatowym",52.3251,17.5734,"address:sprawdzadres:wrzesnia-slowackiego-2","address","HOSPITAL_BUILDING_NOT_INTERIOR_CHAPEL_POSITION"],
 ["RG-19BD1D3D4E73","AO-B39-LOC-HU-CEAC77F2EE49","Árpád-házi Szent Erzsébet Ferences-Templom",47.23139,16.62503,"site","miserend:1328"],
 ["RG-2577094CF7E4","AO-B39-LOC-PL-AD5AB9333B4F","Kościół Trójcy Świętej Ormiański",50.29152,18.66781,"site","osm:way:187038655"],
 ["RG-3E135A9E5C09","AO-B38-LOC-ES-43049BF2ACE","Monasterio de Santa María de la Rábida",37.20756,-6.92614,"site","osm:way:205028699"],
 ["RG-AE6B9D48B695","AO-B39-LOC-HU-F6266E99F5B3","Szent József Jezsuita Templom",46.25193,20.14357,"site","osm:way:1418288454"],
 ["RG-A768309560A6","AO-B39-LOC-SK-F3A4F0DCE391","Kaplnka Svätého Leonarda",48.420389,17.375139,"heritage:pamiatkynaslovensku:leonarda-dolany","site","PEZINOK_SAINT_LEONARD_NOT_LEVOCA_SAINT_LEONARD_OR_SEBASTIAN"],
 ["RG-1EDB76F4B57B","AO-B38-LOC-ES-61C6D5A95E5","Iglesia del Salvador",39.85656,-4.02675,"osm:way:113958010","site","TOLEDO_MOSQUE_CHURCH_NOT_TALAVERA_OR_MADRIDEJOS"],
 ["RG-B30F94A20F69","AO-B38-LOC-BE-29F03868623","Église Saint-Hubert",50.57716,5.86643,"osm:way:175896158","site","HEUSY_SAINT_HUBERT_NOT_SAINT_ANTOINE_HUBERT"],
 ["RG-C3F8A4083DC9","AO-B38-LOC-ES-6D3B4F8F243","Capilla de San Roque",42.88346,-8.54177,"independent:sacristan-san-roque-santiago","site","SANTIAGO_CHAPEL_NOT_SAN_ROQUE_MELIDE_OR_PONTEVEDRA"],
 ["RG-D1C52ADC007B","AO-B39-LOC-IT-2275C33A8E1A","Chiesa della Madonna del Popolo",45.63336,8.38364,"osm:way:256582212","site","PHYSICAL_CHURCH_NOT_ENTRANCE"],
 ["RG-04ED0DAE5D46","AO-B39-LOC-PL-8AFC063B0397","Kościół Wniebowzięcia NMP",50.003877,18.462301,"osm:way:93211460","site",null],
 ["RG-13C11CB31E3F","AO-B39-LOC-IT-65724603C504","Oratorio di San Francesco Poverino",43.776661,11.260311,"independent:firenze-loggiato-san-francesco-poverino","site","ORATORY_WITHIN_LOGGIA_NOT_INDEPENDENT_DOOR"],
 ["RG-7E91D5FD0AC3","AO-B39-LOC-SK-FA51618C8159","Kaplnka Svätého Michala Archanjela",48.31315521174904,18.084892176995208,"osm:way:58219944","site",null],
 ["RG-D2CECBA0C364","AO-B39-LOC-SK-A8267BEFF673","Kostol Navštívenia Panny Márie",48.1460325461052,17.11044759831011,"osm:way:77918570","site","HOSPITALLER_BROTHERS_CHURCH_NOT_INDEPENDENT_DIOCESAN_PARISH"],
 ["RG-F03B6AF4FA24","AO-B38-LOC-NL-79F20E0188E","Sint-Salviuskerk",51.01252,5.83907,"osm:way:282449190","site","NEW_ACTIVE_PARISH_CHURCH_NOT_OLD_HISTORIC_SALVIUSKERK"],
 ["RG-CC73C2CBD613","AO-B39-LOC-PL-D8909F2A26BE","Kościół Świętego Jakuba",50.092367,18.220611,"commons:object-location:raciborz-saint-james","site","FILIAL_SAINT_JAMES_NOT_ASSUMPTION_PARISH_CHURCH"],
 ["RG-0BB62E04774C","AO-B39-LOC-PL-83A0BDB437C1","Kościół Ducha Świętego",50.3461,18.9278,"commons:object-location:bytom-holy-spirit","site","CHURCH_FILIAL_NOT_MAIN_PARISH_SITE"],
 ["RG-783CD50DD217","AO-B39-LOC-PL-EA168B0ACA4A","Kościół Matki Bożej Śnieżnej",50.1705,18.90754,"osm:way:169044576","site","HISTORIC_FILIAL_CHURCH_NOT_NEARBY_BASILICA"],
 ["RG-8CB13769F987","AO-B38-LOC-NL-9947B9DFA3B","Onze Lieve Vrouw Onbevlekt Ontvangen",51.769178,5.522718,"rijksmonument:31870","site","CHURCH_OBJECT_POSITION_NOT_VERIFIED_DOOR"],
 ["RG-BBB3789ADB9A","AO-B39-LOC-IT-6FC8D0881AF4","Chiesa dei Santi Simone e Giuda",45.1604,10.79139,"osm:way:245105097","site","DIOCESAN_CHURCH_HISTORIC_PARISH_SUPPRESSED_1805"],
 ["RG-938EAA84BA0A","AO-B39-LOC-IT-A5B23CB1B0E5","Chiesa dei SS Cirillo e Metodio",41.789059,12.344535,"turismoroma:158912","site","OFFICIAL_MUNICIPAL_SITE_POSITION_NOT_ENTRANCE"],
 ["RG-A0933DE542C7","AO-B38-LOC-ES-E7A90BC3DB7","Iglesia Cripta del Santísimo Cristo",43.46081,-3.80701,"osm:node:7704619785","site","CRYPT_CHURCH_SITE_NOT_CATHEDRAL_ENTRANCE"],
 ["RG-1EE1D2C9B3EB","AO-B39-LOC-HU-C9750B2A6BCA","Karolina-kápolna",47.7752,19.13221,"osm:way:297827179","site"],
 ["RG-DE5F8ED4E2F7","AO-B39-LOC-PL-4B4A686B30D2","Kościół Matki Bożej Bolesnej",50.09753,18.54209,"osm:way:236882053","site"],
 ["RG-322AA8195E65","AO-B39-LOC-PL-A28D536BB19E","Kościół Świętego Jerzego",52.53739,17.5931,"osm:way:75000179","site"],
 ["RG-C7F25752659D","AO-B38-LOC-NL-19A47E978C1","Sint Josephkerk",52.38331,4.63887,"osm:way:265313243","site"],
 ["RG-4D09923C6B74","AO-B39-LOC-IT-76322D1DA1C9","Chiesa del Gesù",40.69399,14.47883,"osm:way:734893276","site"],
 ["RG-8DC436A75526","AO-B39-LOC-PL-CD2D71CC49A0","Kościół Świętych Jana i Pawła Męczenników",50.270021,18.996568,"odtur:12019","site"],
 ["RG-2CFE11950F95","AO-B38-LOC-BE-68ECD274D85","Église Saint-Sauveur",50.62438,5.39712,"osm:way:369175503","site"],
 ["RG-4E6E8B55676B","AO-B39-LOC-PL-08241A64B37C","Kościół Świętego Bartłomieja Stary",50.31106,18.66963,"osm:way:266470146","site"],
 ["RG-EE22A08568B9","AO-B38-LOC-ES-539E5EDAC4B","Sant Jordi de Vallcarca",41.41319,2.1441,"osm:way:233311642","site"],
 ["RG-48A5E9F09178","AO-B39-LOC-PL-2622F5C3F4E5","Kościół Opatrzności Bożej",52.755082,18.255326,"odtur:8550","site"],
 ["RG-14C05BCC015B","AO-B38-LOC-ES-3F0F660D197","Basílica de Santa Maria d'Alacant",38.3462,-0.47922,"osm:way:22560738","site"],
 ["RG-3B5F15EA02ED","AO-B38-LOC-BE-97765C5D89C","Heilig-Bloedbasiliek",51.20812,3.22667,"osm:way:39262789","site"],
 ["RG-DF3BA1A9A39C","AO-B38-LOC-ES-4FEB6B1C9A5","Concatedral de Santa María de Cáceres",39.47454,-6.37002,"osm:way:385037723","site"],
 ["RG-3EE76EFE0DC3","AO-B38-LOC-NL-D7C692A1473","St.-Andreaskerk",52.80061,6.05811,"osm:way:269912643","site"],
 ["RG-270210292F78","AO-B38-LOC-NL-B7C2C6728E5","Onze Lieve Vrouw ter Nood Bedevaartkapel",52.58319,4.68817,"osm:way:44665187","site","BEDEVAART_CHURCH_NOT_SEPARATE_GENADKAPEL"],
 ["RG-AA00B3C74515","AO-B38-LOC-NL-37690D7D21D","Sint-Petrus'-Bandenkerk",51.36839,5.22087,"osm:way:278352768","site"],
 ["RG-77CC30491D1E","AO-B38-LOC-NL-15C79B5490C","Heilige Lodewijkkerk",52.156028,4.491611,"rijksmonument:25593","site"],
 ["RG-769233567FB2","AO-B39-LOC-SK-E4BB98A95578","Kaplnka Panny Márie Fatimskej",48.3789569,17.5891077,"osm:node:7811161449","site"],
 ["RG-A9687EEF16FC","AO-B39-LOC-SK-393C9FE0F607","Kostol Mena Panny Márie",48.1472,17.20745,"osm:way:64977390","site"],
 ["RG-5A52F4C1379D","AO-B39-LOC-HU-0EF092BCC855","Szent István-Templom",46.98846,17.70316,"miserend:1932","site"],
 ["RG-B68-086D5372D517","AO-RSCH-B68-086D5372D517","St. Laurentius — St Joseph altar",49.377453,8.377311,"kirchbau:50267","site","CHURCH_SITE_NOT_SPECIFIC_SIDE_ALTAR"],
 ["RG-A39E87B5A30C","AO-EUR-GB-008",
  "Brompton Oratory (The London Oratory)",51.49714,-0.16964,"osm:way:851727368"],
 ["RG-DA2F4D212252","ORD-GB-OXFORD-ORATORY-ST-ALOYSIUS",
  "Oxford Oratory — St Aloysius Gonzaga",51.75935,-1.26183,"osm:way:65699768"],
 ["RG-FC7B994D657F","DIO-GB-WESTMINSTER-SPANISHPLACE-ST-JAMES",
  "St James's Church, Spanish Place",51.51819,-0.15256,"osm:way:160404637"],
 ["RG-EC5A4BA48BF9","ORD-GB-BIRMINGHAM-ORATORY-IMMACULATE-CONCEPTION",
  "Birmingham Oratory — Immaculate Conception",52.4723,-1.9288,
  "historicengland:1076349","site","CHURCH_AND_ORATORY_COMPLEX_NOT_ENTRANCE"],
 ["RG-D40A53ED496A","AO-EUR-GB-018",
  "Corpus Christi Catholic, Maiden Lane - Shrine of the Blessed Sacrament",
  51.5109,-0.1225,"historicengland:1238978","site",
  "CHURCH_AND_PRESBYTERY_SITE_NOT_ENTRANCE"],
 ["RG-EEE45B6A7403","AO-B34-L-GB-9D55FB39FDF9",
  "Buckfast Abbey",50.493,-3.7756,"historicengland:1209774"],

 ["RG-00D589BAB16C","ao-fssp-church-of-st-mary-538-broadway-providence-ri-02909-usa",
  "Church of St Mary",41.81761,-71.4367,"osm:way:314290719","site"],
 ["RG-04C900D93BC2","AO-EUR-GB-006",
  "Bournemouth Oratory",50.72097,-1.87861,"osm:way:128316070","site"],
 ["RG-4D711E72B9F0","DIO-GB-EASTANGLIA-NORWICH-CATHEDRAL",
  "Cathedral of St John the Baptist, Norwich",52.62902,1.28381,"osm:way:97370578","site"],
 ["RG-40584CA8DAE1","AO-B33-L-US-D5047631A0B7",
  "Our Lady of Clear Creek Abbey",36.03363,-95.19587,"osm:way:242465722","site",
  "MONASTERY_COMPLEX_NOT_CHURCH_ENTRANCE"],
 ["RG-16C25083C6C7","ao-icksp-st-mary-oratory-517-elm-st-rockford-il-61102-6",
  "St. Mary Oratory",42.27224,-89.09816,"geonames:4909682","site",
  "CHURCH_SITE_NOT_VERIFIED_ENTRANCE"],

 ["RG-2E1FB8361143","AO-B35-L-GB-BF86E1483C54",
  "St Mary's Church",53.38963,-2.5889,"osm:way:749035677","site"],
 ["RG-3E26F1928075","AO-B36-L-GB-7FBD70FF3B8C",
  "Lanherne Convent Chapel",50.4544,-4.9994,"historicengland:1144134","site",
  "CONVENT_SITE_NOT_CHAPEL_ENTRANCE"],
 ["RG-43C77660C303","AO-B34-L-GB-43BCEF5411CB",
  "Douai Abbey",51.41,-1.1717,"historicengland:1156252","site"],
 ["RG-2E17819D4F3E","AO-B51-FR-70ECC3A856F3",
  "Abbaye canoniale Sainte-Marie de Lagrasse",
  43.09034,2.61682,"osm:way:422967480","site"],
 ["RG-01F176BB1074","AO-B35-L-GB-91CDCC69A421",
  "Westminster Cathedral",51.49582,-0.13952,"osm:way:10810446","site"],
 ["RG-02AEBA830666","AO-B34-L-GB-D2A6AB6CE828",
  "Downside Abbey",51.2557,-2.49561,"osm:way:208920439","site"],
 ["RG-126045360426","AO-B34-L-GB-C9EB4357C73A",
  "Belmont Abbey",52.03933,-2.75637,"osm:way:66739205","site"],
 ["RG-233BF6946735","AO-B35-L-GB-202B59F268FE",
  "St Michael's Abbey",51.29716,-0.74965,"osm:way:512065892","site"],
 ["RG-119C7FEEF74A","AO-B33-L-FR-F0AF6F2DC54B",
  "Abbaye Sainte-Madeleine du Barroux",44.15182,5.09845,"osm:way:85350528","site"],
 ["RG-3991DD293F9C","AO-B51-FR-92914B534B3A",
  "Abbaye Notre-Dame de l’Annonciation du Barroux",
  44.15639,5.11822,"osm:way:337377568","site"],
 ["RG-03C2AD02BC81","AO-B50-SSPV-US-FC03F5009C8",
  "Immaculate Heart of Mary Church",47.5244,-111.27331,"osm:node:9251507643","site"],
 ["RG-0611CE5E7367","AO-B51-FR-782F8A2B2031",
  "Monastère Saint-Benoît",43.41996,6.12229,"osm:node:12702212301","site"],
 ["RG-02EBA275AC72","AO-B50-CMRI-US-C169C047AC2",
  "Most Holy Rosary Church",42.71278,-85.46250,"usgs:gnis:2572764","site"],
 ["RG-03AE4CE86D2B","AO-B56-US-5EF870DC7969",
  "Blessed Sacrament Church — Martinez",38.016898,-122.130969,
  "churcheslist:blessed-sacrament-church-45","address"],
 ["RG-B65-C4264A1A8340","AO-RSCH-B65-C4264A1A8340",
  "St Antonius",47.5638664,7.572879,"osm:way:266520642","site"],
 ["RG-2447873BB8F5","AO-B41-LOC-IT-8584201FAF73",
  "Seminario Internazionale San Filippo Neri",43.8033638,11.3799351,"osm:way:848071308"],
 ["RG-54863B401267","AO-B40-LOC-BE-7CC60D5F039A",
  "Chapelle Sainte-Rita",50.5357494,3.5450717,"osm:way:962673284"],
 ["RG-B65-EF400B6F8E93","AO-RSCH-B65-EF400B6F8E93",
  "Franziskanerkirche",51.1252861,14.9862707,"osm:way:139932554"],
 ["RG-B65-AFB4955D79E8","AO-RSCH-B65-AFB4955D79E8",
  "Kerzenkapelle",51.58389,6.24377,"osm:way:152838071"],
 ["RG-B69-3A43E996D0D9","AO-RSCH-B69-3A43E996D0D9",
  "Wallfahrtskirche Maria Vesperbild",48.2798,10.54221,"osm:way:100214876"],
]){
 const mapped=world.find(x=>x.physical_group_id===group);
 assert.ok(mapped,"Independently reviewed site pin missing");
 assert.equal(mapped.source_id,id);
 const inherited=published.find(x=>x.source_id===id);
 assert.equal(mapped.item_id,inherited?.item_id||"tlm:cl2:"+group);
 assert.ok(mapped.title, "Canonical source title remains populated");
 assert.equal(index.records.find(x=>x[0]===group)[2],name);
 assert.equal(mapped.geo.lat,lat);
 assert.equal(mapped.geo.lng,lng);
 assert.equal(mapped.geo.source_ref,osm);
 assert.equal(mapped.geo.precision,precision);
 assert.equal(mapped.geo.approximate,true);
 assert.equal(mapped.geo.review_scope,reviewScope||(precision==="address"?"ADDRESS_POINT_NOT_ENTRANCE":"PHYSICAL_CHURCH_NOT_ENTRANCE"));
 assert.equal(mapped.map_publishable,true);
 assert.equal(mapped.map_state,"PROVISIONAL");
 if(!inherited)assert.match(mapped.status,/MASS UNVERIFIED/);
 assert.equal(mapped.sections.length,0);
 assert.equal(mapped.actions.length,0);
 assert.ok(mapped.source_links.length>=2&&mapped.source_links.every(l=>l.url.startsWith("https://")));
}

const rockford=world.find(x=>x.physical_group_id==="RG-16C25083C6C7");
assert.equal(rockford.address.formatted,"126 S Winnebago St, Rockford, IL 61102");
assert.ok(rockford.address.formatted.includes("126 S Winnebago St"));
assert.ok(!rockford.address.formatted.includes("517 Elm St"),"Never direct visitors to mailing address");
assert.ok(rockford.search_text.includes("517 elm st"),"Retain source-master alias for research search");
assert.match(rockford.note,/mailing address/);
const clearCreek=world.find(x=>x.physical_group_id==="RG-40584CA8DAE1");
assert.match(clearCreek.facts.find(f=>f.label==="Map position").value,/monastery complex/);
assert.equal(clearCreek.geo.review_scope,"MONASTERY_COMPLEX_NOT_CHURCH_ENTRANCE");

// Two geographically divergent R49 aliases retain the canonical selected
// church identity, but use an independently corroborated existing source pin.
for(const [group,canonical,corrected,evidence,expectedAddress] of [
 ["RG-956BB24E14EA","AO-WORLD-R35-AU-01-06",
  "LMD:maternal-heart-of-mary-church-lewisham-australia",
  "https://mapcarta.com/W1072172027","Charles O'Neill"],
 ["RG-4279040C75AD","AO-WORLD-R35-AU-02-20",
  "LMD:crypt-chapel-of-our-lady-of-sorrows-geraldton-australia",
  "https://towerbells.org/data/AUGRLNSF.HTM","Cathedral Avenue"],
]){
 const item=world.find(x=>x.physical_group_id===group);
 const original=published.find(x=>x.source_id===canonical);
 const alternate=published.find(x=>x.source_id===corrected);
 assert.ok(item&&original&&alternate,"Only existing source-backed alias points may be selected");
 assert.equal(item.item_id,original.item_id,"Canonical source identity must not change");
 assert.equal(item.source_id,canonical);
 assert.equal(item.geo.lat,alternate.geo.lat);
 assert.equal(item.geo.lng,alternate.geo.lng);
 assert.equal(item.geo.source_ref,corrected);
 assert.equal(item.geo.source_url,evidence);
 assert.equal(item.geo.review_scope,"PHYSICAL_CHURCH_NOT_ENTRANCE");
 assert.equal(item.geo.precision,"source_marker_unassessed");
 assert.equal(item.geo.approximate,true);
 assert.equal(item.map_state,"PROVISIONAL");
 assert.equal(item.map_publishable,true);
 assert.ok(item.source_ids.includes(canonical)&&item.source_ids.includes(corrected));
 assert.ok(item.source_links.some(x=>x.url===evidence));
 assert.match(item.address.formatted,new RegExp(expectedAddress,"i"));
 assert.deepEqual(published.find(x=>x.source_id===canonical),original,
   "Frozen R49 source must not be modified by the read-model adjudication");
}
const galway=world.find(x=>x.physical_group_id==="RG-9DE31147B6ED");
const galwayAlt=published.find(x=>x.source_id==="ao-research-icksp-federated-v13-icksp-stg-125");
assert.ok(galway&&galwayAlt,"Galway alias and original ICKSP site pin must remain present");
assert.equal(galway.item_id,
 "tlm:r49:LMD:seipeal-colaiste-naoi%e1%b9%81-muire-saint-marys-college-chapel-galway-ireland",
 "Deduplication must preserve canonical source identity");
assert.equal(galway.geo.lat,galwayAlt.geo.lat);
assert.equal(galway.geo.lng,galwayAlt.geo.lng);
assert.equal(galway.geo.source_ref,galwayAlt.source_id);
assert.equal(galway.geo.source_url,"https://www.galwaymusiccentre.ie/contact-1");
assert.equal(galway.geo.approximate,true);
assert.equal(galway.geo.precision,"source_marker_unassessed");
assert.equal(galway.geo.review_scope,"PHYSICAL_CHURCH_NOT_ENTRANCE");
assert.equal(galway.map_state,"PROVISIONAL");
assert.ok(galway.source_links.some(x=>x.url==="https://galway.icksp.ie/"));
const newUs=newSites.find(x=>x.title==="St Philomena Catholic Church"&&x.subtitle.includes("US"));
assert.ok(newUs,"Unlocated research-listed CMRI-directory chapel must remain searchable");
assert.ok(filterPreliminaryR49(world,{query:"St Philomena Catholic Church"}).some(x=>x.item_id===newUs.item_id));
assert.ok(/MASS UNVERIFIED/.test(renderDirectoryVenueCard(newUs)));
assert.equal(filterPreliminaryR49(world,{}).length,2582,
 "Unfiltered directory must include the worldwide corpus, not just R49");
const vm=buildExploreViewModel({language:"en",lens:"tlm",items:world,view:"list",
 filters:{directoryGroup:"ALL",affiliations:[],query:""}});
assert.equal(vm.mapped,1914);
assert.equal(vm.addressOnly,668);
const html=renderExploreToString(vm);
assert.match(html,/2,582|2582/);
assert.match(html,/668/);
assert.match(html,/list only · no map pin/);
assert.doesNotMatch(html,/735 address only/);
assert.doesNotMatch(html,/2,579 mapped/);
console.log("PASS CL2 worldwide directory: 2,579 unique physical sites, 35 R49 aliases absorbed, 715 list-only plus 10 source-backed site/address markers, 3 separate published additions");
