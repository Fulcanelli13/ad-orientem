import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {projectPreliminaryR49} from "../src/find/preliminary-directory-r49.js";
import {
  MASS_EMBLEM_GROUPS,MASS_INSTITUTION_EMBLEMS,massInstitutionEmblem,
  massInstitutionImageId,registerMassInstitutionImages,
} from "../src/find/institution-emblems.js";
import { exploreMapFeatures, MASS_MAP_GROUP_COLORS } from "../src/find/map-runtime.js";
import {renderDirectoryIdentityFallback,hideUnavailableDirectoryEmblem} from "../src/find/directory-card.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";

assert.deepEqual([...MASS_EMBLEM_GROUPS].sort(),
  ["FSSP","IBP","ICKSP","SSPX","AASJMV","CAPUCHINS_MORGON","MILITIA_TEMPLI",
    "BENEDICTINE","DOMINICAN","CISTERCIAN","ORATORIAN","NORBERTINE","PREMONSTRATENSIAN"].sort(),
  "Only source-qualified institute and order-family symbols may render");
assert.equal(massInstitutionEmblem("diocesan"),null,
  "A diocesan venue is not the Holy See and must use a neutral identity");
assert.equal(massInstitutionImageId("DIOCESAN"),null,
  "Neutral diocesan pins must not register the Holy See arms");
assert.equal(massInstitutionEmblem("OTHER"),null,
  "Never invent a logo for unspecified providers");
assert.equal(massInstitutionImageId("UNKNOWN"),null);
for(const group of MASS_EMBLEM_GROUPS){
  const item=MASS_INSTITUTION_EMBLEMS[group];
  assert.ok(item.source.startsWith("https://commons.wikimedia.org/wiki/File:"));
  assert.ok(item.image.startsWith("https://"));
  assert.ok(item.rights.length>12);
  assert.match(item.licenseUrl,/^https:\/\/creativecommons\.org\/(?:licenses\/by-sa\/[34]\.0|publicdomain\/(?:zero|mark)\/1\.0)\/$/,group+" needs a usable licence hyperlink");
  assert.equal(item.reviewBeforeCommercialRelease,true);
  assert.match(MASS_MAP_GROUP_COLORS[group],/^#[0-9a-fA-F]{6}$/);
}

// Source-reported affiliation, not ecclesial proof. All current R49 records
// get either their exact-source provider emblem or the neutral church fallback.
const r49=JSON.parse(readFileSync(new URL("../data/directory/preliminary-map-r49.v1.json",import.meta.url),"utf8"));
const provisionalSites=projectPreliminaryR49(r49);
const pictured=provisionalSites.filter(item=>massInstitutionEmblem(item.community_id));
const neutral=provisionalSites.filter(item=>!massInstitutionEmblem(item.community_id));
assert.equal(provisionalSites.length,1879);
const familyCodes=["BENEDICTINE","DOMINICAN","CISTERCIAN","ORATORIAN","NORBERTINE","PREMONSTRATENSIAN"];
const familySites=provisionalSites.filter(item=>familyCodes.includes(item.community_id));
const morgonSites=provisionalSites.filter(item=>item.community_id==="CAPUCHINS_MORGON");
assert.equal(morgonSites.length,5,"Keep all five explicitly sourced Capuchins of Morgon labels");
assert.equal(pictured.length,1188+familySites.length+morgonSites.length,
  "Source-matched family arms and exact Morgon emblem must not change institute identities");
assert.equal(neutral.length,691-familySites.length-morgonSites.length,
  "Do not invent logos or reuse SSPX insignia for sisters");
assert.equal(provisionalSites.filter(x=>x.community_id==="SSPX").length,729);
assert.equal(provisionalSites.filter(x=>x.community_id==="SSPX_SISTERS").length,3,
  "Three source-named sister-community venues must remain separate from SSPX priestly houses");
assert.ok(provisionalSites.filter(x=>x.community_id==="SSPX_SISTERS").every(x=>
  x.preliminary_group==="SSPX"&&massInstitutionEmblem(x.community_id)===null),
  "Do not infer sister-community insignia from source-group classification");
assert.equal(provisionalSites.filter(x=>x.community_id==="FSSP").length,307);
assert.equal(provisionalSites.filter(x=>x.community_id==="ICKSP").length,128);
assert.equal(provisionalSites.filter(x=>x.community_id==="IBP").length,19);
assert.equal(provisionalSites.filter(x=>x.community_id==="AASJMV").length,5);

// Preserve distinct named source affiliates even without an exact emblem.
// R49 source group UNKNOWN stays UNKNOWN; the name-only mapping is never a
// classification of ecclesial position or individual Masses.
const sourceNamedGroups=new Map([
 ["Canons of St John Cantius",["CANONS_ST_JOHN_CANTIUS",2]],
 ["Capucins de Morgon",["CAPUCHINS_MORGON",5]],
 ["Fraternité de la Transfiguration",["TRANSFIGURATION",5]],
 ["Oratorians",["ORATORIAN",5]],
 ["Carmélites",["CARMELITE",4]],
 ["Bénédictines",["BENEDICTINE",1]],
 ["Dominicains",["DOMINICAN",1]],
]);
for(const [sourceLabel,[code,expected]] of sourceNamedGroups){
 const items=provisionalSites.filter(x=>x.eyebrow===sourceLabel);
 assert.equal(items.length,expected,sourceLabel+" source count");
 assert.equal(items.filter(x=>x.community_id===code).length,expected,sourceLabel+" group code");
 for(const item of items){
  assert.equal(item.affiliation_scope,"SOURCE_LABEL_ONLY");
  const emblem=massInstitutionEmblem(item.community_id);
  const fallback=renderDirectoryIdentityFallback(item,"en","preview");
  if(code==="CAPUCHINS_MORGON"){
    assert.equal(emblem?.officialIdentitySource,"https://capucins-morgon.fr/histoire/ordre-capucin");
    assert.match(fallback,/data-visual-kind="emblem"/);
    assert.match(fallback,/Capuchins of Morgon/);
  }else if(familyCodes.includes(code)){
    assert.equal(emblem?.symbolScope,"ORDER_FAMILY");
    assert.match(fallback,/data-visual-kind="emblem"/);
    assert.match(fallback,/Order-wide symbol/);
    assert.match(fallback,/data-tlm-emblem-image/);
  }else{
    assert.equal(emblem,null,"Uncleared house-specific heraldry must not be published");
    assert.match(fallback,/data-visual-kind="named"/);
    assert.ok(fallback.includes(sourceLabel),"Preserve the original source's community name");
    assert.doesNotMatch(fallback,/<img /,"No unrelated heraldic substitute");
  }
 }
}
const noInventedLogo=renderDirectoryIdentityFallback({
  community_id:"CMRI",eyebrow:"CMRI directory / affiliated clergy"
},"en","card");
assert.match(noInventedLogo,/data-visual-kind="named"/);
assert.doesNotMatch(noInventedLogo,/CMRI_emblem\.(png|svg)/);
assert.match(renderDirectoryIdentityFallback({community_id:"DIOCESAN",eyebrow:"Diocesan"}),/data-visual-kind="neutral"/);
// R03: known source-labelled institutes display their correct readable short
// names when exact crest rights are held. These are text-only monograms, never
// a copied coat of arms, and never inferred from a generic source label.
for(const [code,label,mark] of [
  ["CANONS_ST_JOHN_CANTIUS","Canons of St John Cantius","SJC"],
  ["SJM","Servi Jesu et Mariae","SJM"],
  ["CMRI","Congregation of Mary Immaculate Queen","CMRI"],
  ["FSVF","Fraternity of Saint Vincent Ferrer","FSVF"],
  ["SSPX_SISTERS","Sœurs de la Fraternité Saint Pie X","SFSPX"],
  ["TRANSFIGURATION","Fraternité de la Transfiguration","FT"],
  ["DOMINICAINES_FANJEAUX","Dominicaines de Fanjeaux","DEF"],
  ["DOMINICANS_AVRILLE","Dominicains d'Avrillé","DAV"],
  ["BENEDICTINES_BELLAIGUE","Bénédictins de Bellaigue","BELL"],
  ["INSTITUTE_ST_PHILIP_NERI","Institute of Saint Philip Neri","ISPN"],
  ["IMBC","Istituto Mater Boni Consilii","IMBC"],
  ["SMMD","Society of the Missionaries of Divine Mercy","SMMD"],
  ["SSPV","Society of Saint Pius V","SSPV"],
  ["CSPV","Congregation of Saint Pius V","CSPV"],
  ["RCI","Roman Catholic Institute","RCI"],
  ["SOCIEDAD_TRENTO","Sociedad Sacerdotal Trento","SST"],
  ["MOSTEIRO_SANTA_CRUZ","Mosteiro da Santa Cruz","MSC"],
]){
  assert.equal(massInstitutionEmblem(code),null,"Uncleared original insignia must not be rendered for "+code);
  for(const language of ["en","fr"]){
    for(const variant of ["card","preview","detail"]){
      const html=renderDirectoryIdentityFallback({community_id:code,eyebrow:label},language,variant);
      assert.match(html,/data-visual-kind="named"/);
      assert.ok(html.includes('data-mark-length="'+String(mark.length)+'"'));
      assert.ok(html.includes('>'+mark+'</span>'),"Correct source-monogram for "+code);
      assert.doesNotMatch(html,/<img\b/,"Never disguise uncleared original artwork as a permitted logo");
      assert.ok(html.includes(label),"Original named source must stay visible");
    }
  }
}
assert.equal(massInstitutionEmblem("SSPX_SISTERS"),null,
 "Do not assign the priests' SSPX emblem to their distinct sisters");
assert.equal(massInstitutionEmblem("TRANSFIGURATION"),null,
 "Wikipedia's generic Orthodox cross is not an authenticated fraternity emblem");
for(const {community_id,eyebrow} of [
  {community_id:"DIOCESAN",eyebrow:"Diocesan"},
  {community_id:"UNKNOWN",eyebrow:"Unknown"},
  {community_id:"SSPX_RESISTANCE",eyebrow:"Unclassified"},
]){
 const html=renderDirectoryIdentityFallback({community_id,eyebrow},"en","card");
 assert.doesNotMatch(html,/<img\b/,"Neither an umbrella label nor unknown affiliation can inherit an image");
}
assert.match(renderDirectoryIdentityFallback({community_id:"OTHER",eyebrow:"Canons of St John Cantius"}),/>CJ<\/span>/,
 "Without exact source ownership, retain generic source-derived initials");
// A cross-origin emblem failure must replace the large graphic with its actual
// named institute initials, not leave a broken image or invent a new crest.
const fsspFallback=renderDirectoryIdentityFallback({community_id:"FSSP",eyebrow:"FSSP"},"en","card");
assert.match(fsspFallback,/data-visual-kind="emblem"/);
assert.match(fsspFallback,/class="aoTlmVenueEmblemBackstop"[^>]*>FSSP</);
assert.match(fsspFallback,/data-tlm-emblem-image/);
const emblemFrame={dataset:{}};
const emblemImage={
  matches:selector=>selector==="img[data-tlm-emblem-image]",
  closest:selector=>selector===".aoTlmVenueEmblemFrame"?emblemFrame:null,
  hidden:false
};
assert.equal(hideUnavailableDirectoryEmblem({target:emblemImage}),true);
assert.equal(emblemFrame.dataset.emblemState,"unavailable");
assert.equal(emblemImage.hidden,false,"Visible textual emblem fallback replaces graphic");
// Small secondary logo images have an adjacent textual institute label.
const smallImage={...emblemImage,hidden:false,closest:()=>null};
assert.equal(hideUnavailableDirectoryEmblem({target:smallImage}),true);
assert.equal(smallImage.hidden,true);
assert.equal(hideUnavailableDirectoryEmblem({target:{matches:()=>false}}),false);
const researchQueue=JSON.parse(readFileSync(new URL("../data/directory/research/tlm-emblem-acquisition-queue-20261030.v1.json",import.meta.url),"utf8"));
const r06=JSON.parse(readFileSync(new URL("../data/directory/research/tlm-emblem-release-crosswalk-r06.v1.json",import.meta.url),"utf8"));
assert.equal(r06.schema,"AO_TLM_EMBLEM_RELEASE_CROSSWALK_R06_V1");
assert.equal(r06.records.length,41);
assert.equal(r06.summary.image_group_mappings,13);
assert.equal(r06.summary.distinct_image_urls,12);
assert.equal(r06.summary.exact_source_text_fallbacks,17);
assert.equal(r06.summary.no_single_group_emblem_by_design,9);
assert.deepEqual(r06.records.map(x=>x.group_code).sort(),
  researchQueue.groups.map(x=>x.group_code).sort(),"No original research group or explicit hold may be dropped");
for(const row of r06.records){
  assert.equal(row.image_reuse_final_approved,false,"No user final approval was invented for "+row.group_code);
  assert.equal(row.no_automatic_affiliation_inference,true);
  assert.equal(row.no_venue_publication_from_emblem,true);
  if(row.visual_release==="RESEARCH_LICENSED_EMBLEM_RENDERED"){
    assert.ok(massInstitutionEmblem(row.group_code),"Published emblem groups must be an exact subset");
  }else assert.equal(massInstitutionEmblem(row.group_code),null,
    "Uncleared or merely source-labelled groups must never acquire logos: "+row.group_code);
}
for(const code of ["TRANSFIGURATION","DOMINICAINES_FANJEAUX","DOMINICANS_AVRILLE","SSPX_SISTERS",
                    "BENEDICTINES_BELLAIGUE","CARMELITE","CMRI","FSVF"]){
  assert.ok(r06.records.find(x=>x.group_code===code).false_match_warning,
    "Known attribution traps must remain explicitly quarantined");
}
assert.equal(researchQueue.schema,"AO_TLM_EMBLEM_ACQUISITION_QUEUE_V1");
assert.equal(researchQueue.groups.length,41);
assert.equal(researchQueue.cl2_source_affiliation_audit.distinct_source_labels,138);
assert.equal(researchQueue.cl2_source_affiliation_audit.venue_source_rows,2687);
assert.equal(researchQueue.cl2_source_affiliation_audit.labels.reduce((n,x)=>n+x.venue_source_rows,0),2687);
assert.equal(researchQueue.groups.filter(x=>x.state==="EXACT_CANDIDATE_IN_DRAFT").length,5);
assert.equal(researchQueue.groups.find(x=>x.group_code==="CMRI").rights,"THIRD_PARTY_IMAGE_RIGHTS_NOT_CLEARED");
for(const code of familyCodes){
  assert.equal(massInstitutionEmblem(code)?.symbolScope,"ORDER_FAMILY");
  assert.equal(researchQueue.groups.find(x=>x.group_code===code)?.type,"ORDER_FAMILY");
}
const militia=massInstitutionEmblem("MILITIA_TEMPLI");
assert.equal(militia?.symbolScope,"INDEPENDENT_INSIGNIA_RENDERING");
assert.equal(militia.officialIdentitySource,"https://www.ordo-militiae-templi.org/militia/en/habit-and-insignia/");
assert.equal(militia.source,"https://commons.wikimedia.org/wiki/File:Maltese_Cross_variant_red.svg");
assert.match(militia.rights,/Public-domain geometry/);
for(const lang of ["en","fr"]){
  const id=renderDirectoryIdentityFallback({community_id:"MILITIA_TEMPLI",eyebrow:"Militia Templi"},lang,"card");
  assert.match(id,/data-visual-kind="emblem"/);
  assert.match(id,lang==="fr"?/Dessin indépendant de la croix/:/Independent cross drawing/);
  assert.doesNotMatch(id,/Militia_Templi_COA.svg/,
    "Do not substitute unauthorised blue shield or generic medieval Templar heraldry");
}
const oratorian=massInstitutionEmblem("ORATORIAN");
assert.equal(oratorian.symbolScope,"ORDER_FAMILY");
assert.match(oratorian.source,/Congregazione_oratorio_di_San_Filippo_Neri-Stemma/);
for(const code of ["INSTITUTE_ST_PHILIP_NERI","ORATORIAN_PHILADELPHIA"]){
  assert.equal(massInstitutionEmblem(code),null,"Confederation heraldry must not impersonate "+code);
  assert.doesNotMatch(renderDirectoryIdentityFallback({community_id:code,eyebrow:code},"en","card"),/data-visual-kind="emblem"/);
}
assert.equal(massInstitutionEmblem("NORBERTINE").image,massInstitutionEmblem("PREMONSTRATENSIAN").image,
  "Norbertine and Premonstratensian share the same order-wide heraldry");
for(const code of ["BENEDICTINES_BELLAIGUE","DOMINICANS_AVRILLE","DOMINICAINES_FANJEAUX","FSVF","SSPX_SISTERS"]){
  assert.equal(massInstitutionEmblem(code),null,"Generic arms must not impersonate "+code);
  assert.doesNotMatch(renderDirectoryIdentityFallback({community_id:code,eyebrow:code},"en","card"),/data-visual-kind="emblem"/);
}

const mapped=exploreMapFeatures([
  {item_id:"tlm:r49:diocese",lens:"tlm",community_id:"DIOCESAN",
    map_publishable:true,geo:{lat:-20.2,lng:57.5,approximate:true}},
  {item_id:"tlm:r49:fssp",lens:"tlm",community_id:"FSSP",
    map_publishable:true,geo:{lat:48.8,lng:2.3,approximate:true}},
  {item_id:"tlm:r49:uncertain",lens:"tlm",community_id:"UNKNOWN",
    map_publishable:true,geo:{lat:12,lng:13,approximate:true}},
]);
assert.deepEqual(mapped.map(x=>x.properties.provider_group),
  ["DIOCESAN","FSSP","OTHER"]);
assert.equal(mapped.every(x=>x.properties.approximate),true,
  "A logo must never upgrade geographical precision");

// Source-owned independent community groups remain selectable without a visual emblem.
for(const view of ["list","map"]){
  const samples=["CMRI","SSPV","RCI","AASJMV","OTHER"].map((id,index)=>({
    kind:"TLM_VENUE",item_id:"tlm:source:"+id,source_id:"src:"+id,
    lens:"tlm",title:id+" listed venue",subtitle:"Source city",community_id:id,
    map_publishable:view==="map",geo:{lat:10+index,lng:20+index},source_links:[],
  }));
  const html=renderExploreToString(buildExploreViewModel({
    lens:"tlm",items:samples,view,filters:{affiliations:[],directoryGroup:"ALL"},language:"en"
  }));
  for(const group of ["CMRI","SSPV","RCI","AASJMV","OTHER"])
    assert.match(html,new RegExp('data-find-affiliation="'+group+'"'),group+" must remain available without logo");
  assert.doesNotMatch(html,/data-find-affiliation="IMBC"/,"Do not promote a research-only classification into published venue filters");
}

// Institute filter stays compact for a 320px phone; community names are
// legible while stable source group codes are retained for search/filtering.
for(const lang of ["en","fr"]){
 const items=["FSSP","CANONS_ST_JOHN_CANTIUS","BENEDICTINE","SSPX_SISTERS"].map((id,j)=>({
  kind:"TLM_VENUE",item_id:"test:"+j,source_id:"test:"+j,lens:"tlm",
  title:"Test venue "+j,community_id:id,preliminary_group:"ROME",
  search_text:"test",geo:null,map_publishable:false,source_links:[],
 }));
 const html=renderExploreToString(buildExploreViewModel({
  lens:"tlm",items,view:"list",filters:{affiliations:[],directoryGroup:"ALL"},language:lang,
 }));
 assert.match(html,/class="aoTlmMoreInstitutes"/);
 assert.match(html,/data-find-affiliation="CANONS_ST_JOHN_CANTIUS"/);
 assert.match(html,/data-find-affiliation="BENEDICTINE"/);
 assert.match(html,/data-find-affiliation="SSPX_SISTERS"/);
 assert.doesNotMatch(html,/>CANONS_ST_JOHN_CANTIUS</);
 assert.doesNotMatch(html,/>SSPX_SISTERS</);
 assert.match(html,lang==="fr"?/Autres communautés/:/Other communities/);
 assert.match(html,lang==="fr"?/Bénédictins/:/Benedictines/);
 assert.match(html,lang==="fr"?/Chanoines de Saint-Jean-de-Cantius/:/Canons of St John Cantius/);
}
// Image load and cross-origin failures must not prevent clicking original markers.
const loaded=new Map();
class GoodImage{
  constructor(){this.naturalWidth=80;this.naturalHeight=100}
  set src(value){this._src=value;queueMicrotask(()=>this.onload?.())}
}
const document={createElement(tag){
  assert.equal(tag,"canvas");
  return {width:0,height:0,getContext(){return {
    drawImage(){},getImageData(){return {width:72,height:72,data:new Uint8ClampedArray(72*72*4)}},
  }}};
}};
const map={
  hasImage(id){return loaded.has(id)},
  addImage(id,image,opts){loaded.set(id,{image,opts})},
};
const registered=[];
const success=await registerMassInstitutionImages(map,{win:{Image:GoodImage,document},
  onRegistered:group=>registered.push(group)});
assert.deepEqual([...registered].sort(),[...MASS_EMBLEM_GROUPS].sort(),
  "Fast emblems should be revealed individually as soon as each image loads");
assert.deepEqual(success.sort(),[...MASS_EMBLEM_GROUPS].sort());
for(const group of success){
  assert.ok(loaded.has(massInstitutionImageId(group)));
  assert.equal(loaded.get(massInstitutionImageId(group)).opts.pixelRatio,2);
}
class FailedImage{set src(_value){queueMicrotask(()=>this.onerror?.())}}
assert.deepEqual(await registerMassInstitutionImages(map,{win:{Image:FailedImage,document}}),[],
  "Network failures must leave circle markers available");

class HangingImage{set src(_value){/* network request never resolves */}}
const timers=[];
assert.deepEqual(await registerMassInstitutionImages(map,{win:{
  Image:HangingImage,document,
  setTimeout(fn){timers.push(fn);queueMicrotask(fn);return timers.length},
  clearTimeout(){},
},timeoutMs:500}),[],
  "An indefinitely stalled emblem must not hold the map hostage");
assert.equal(timers.length,MASS_EMBLEM_GROUPS.length);
console.log("Explore institutional emblems contract: pass");
