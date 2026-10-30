import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {projectPreliminaryR49,projectPublishedProvisionalMassSites} from "../src/find/preliminary-directory-r49.js";
import {attachApprovedDirectoryMedia,eligibleDirectoryImage,renderDirectoryVenueCard,renderDirectoryGallery,loadDirectoryCardMedia,renderDirectoryIdentityFallback,DIRECTORY_CARD_STYLE} from "../src/find/directory-card.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";
const hash="a".repeat(64);
const photo={
  place_id:"place:FR:test",status:"APPROVED",asset_path:"assets/approved/place-media/FR-test.webp",
  credit:"Example photographer",license:"CC-BY-SA-4.0",
  license_url:"https://creativecommons.org/licenses/by-sa/4.0/",
  source_url:"https://commons.wikimedia.org/wiki/File:Example.jpg",
  derivative_sha256:hash,rights_verified:true,subject_verified:true,crop_reviewed:true,
  alt_en:"The correct church",alt_fr:"La bonne église",
};
const item={
  item_id:"tlm:public-venue-1",source_id:"public-venue-1",kind:"TLM_VENUE",lens:"tlm",
  title:"St Test Church",subtitle:"Paris · FR",eyebrow:"FSSP",community_id:"FSSP",
  source_links:[{url:"https://example.org/official"}],map_state:"ADDRESS_ONLY",
  sections:[],status:"SCHEDULE UNVERIFIED"
};
const exact=[{venue_id:item.source_id,place_id:photo.place_id,confidence:"CONFIRMED",relationship:"LOCATED_AT"}];

const requests=[];
const mediaData=await loadDirectoryCardMedia({fetchImpl:async url=>{
  requests.push(url);
  const data=url.endsWith("/seed-registry.v1.json")
    ?{schema:"EXPLORE_GEOGRAPHY_SEED_V1",directoryPlaceLinks:[{venue_id:"public-venue-1",place_id:"place:FR:test",confidence:"CONFIRMED",relationship:"LOCATED_AT"}]}
    :url.endsWith("/approved-place-media.v1.json")
      ?{schema:"AO_APPROVED_PLACE_MEDIA_V1",items:[photo]}
      :{schema:"AO_APPROVED_PLACE_GALLERY_V1",items:[]};
  return {ok:true,json:async()=>data};
}});
assert.equal(requests.length,3);
assert.equal(mediaData.approved.length,1);
assert.equal(mediaData.directoryPlaceLinks.length,1);
const offline=await loadDirectoryCardMedia({fetchImpl:async()=>{throw new Error("offline")}});
assert.deepEqual(offline,{directoryPlaceLinks:[],approved:[],gallery:[]});

const args={directoryPlaceLinks:exact,approved:[photo],gallery:[]};
const [linked]=attachApprovedDirectoryMedia([item],args);
assert.equal(linked.place_id,photo.place_id);
assert.equal(linked.cover_media.asset_path,photo.asset_path);
assert.equal(linked.gallery_media.length,0);

const nave={...photo,asset_path:"assets/approved/place-gallery/FR-test-nave.webp",
  media_role:"INTERIOR",label_en:"The nave",label_fr:"La nef",alt_en:"The church nave",alt_fr:"La nef de l'église"};
const details={...linked,gallery_media:[nave,photo,{...nave,asset_path:"assets/approved/place-gallery/FR-test-nave.webp"}]};
const galleryHtml=renderDirectoryGallery(details,"en");
assert.match(galleryHtml,/aoTlmPhotoGallery/);
assert.match(galleryHtml,/FR-test-nave\.webp/);
assert.match(galleryHtml,/Interior/);
assert.match(galleryHtml,/Example photographer/);
assert.match(galleryHtml,/commons\.wikimedia\.org/);
assert.match(galleryHtml,/href="https:\/\/creativecommons\.org\/licenses\/by-sa\/4\.0\/"/);
assert.match(renderDirectoryGallery(details,"fr"),/creativecommons\.org\/licenses\/by-sa\/4\.0/);
assert.doesNotMatch(galleryHtml,/FR-test\.webp/);
assert.equal((galleryHtml.match(/<figure>/g)||[]).length,1);
assert.match(renderDirectoryGallery(details,"fr"),/Intérieur/);
assert.equal(renderDirectoryGallery({...details,place_id:"place:FR:unrelated"}),"");

assert.equal(eligibleDirectoryImage(photo,photo.place_id),true);
assert.equal(eligibleDirectoryImage({...photo,license_url:"https://example.org/unrelated"},photo.place_id),false);
assert.equal(eligibleDirectoryImage({...photo,license:"CC0-1.0"},photo.place_id),false);
assert.equal(eligibleDirectoryImage({...photo,license_url:"https://creativecommons.org/licenses/by/3.0/"},photo.place_id),false);
assert.equal(eligibleDirectoryImage({...photo,license:"CC-BY-3.0",license_url:"https://creativecommons.org/licenses/by/3.0/"},photo.place_id),true);
assert.equal(eligibleDirectoryImage({...photo,license:"PUBLIC_DOMAIN",license_url:"https://creativecommons.org/publicdomain/mark/1.0/"},photo.place_id),true);
assert.equal(eligibleDirectoryImage({...photo,license:"CC0-1.0",license_url:"https://creativecommons.org/publicdomain/zero/1.0/"},photo.place_id),true);
assert.equal(eligibleDirectoryImage(photo,"place:FR:another"),false);
for(const invalid of [
  {...photo,status:"CANDIDATE"},
  {...photo,rights_verified:false},
  {...photo,subject_verified:false},
  {...photo,asset_path:"https://upload.wikimedia.org/test.png"},
  {...photo,license:"ALL_RIGHTS_RESERVED"},
  {...photo,derivative_sha256:"incomplete"},
]){
  assert.equal(eligibleDirectoryImage(invalid,photo.place_id),false);
  assert.equal(attachApprovedDirectoryMedia([item],{...args,approved:[invalid]})[0].cover_media,undefined);
}
assert.equal(attachApprovedDirectoryMedia([item],{...args,directoryPlaceLinks:[{...exact[0],confidence:"UNVERIFIED"}]})[0].cover_media,undefined);
assert.equal(attachApprovedDirectoryMedia([{...item,source_id:"r49:unlinked"}],args)[0].cover_media,undefined);
assert.equal(attachApprovedDirectoryMedia([item],{...args,directoryPlaceLinks:[...exact,{...exact[0],place_id:"place:FR:other"}]})[0].cover_media,undefined);
let html=renderDirectoryVenueCard(linked,"en");
assert.match(html,/aoTlmVenueCard/);
assert.match(html,/FR-test\.webp/);
assert.match(html,/Mass times not independently verified/);
assert.match(html,/data-explore-item="tlm:public-venue-1"/);
assert.match(html,/FSSP_emblem/);
assert.match(renderDirectoryVenueCard(linked,"fr"),/Horaires non vérifiés indépendamment/);
assert.doesNotMatch(renderDirectoryVenueCard(item,"en"),/FR-test\.webp/);
const institutionalCard=renderDirectoryVenueCard(item,"en");
assert.match(institutionalCard,/data-visual-kind="emblem"/);
assert.match(institutionalCard,/aoTlmVenueIdentity--card/);
assert.match(institutionalCard,/FSSP_emblem/);
assert.doesNotMatch(institutionalCard,/Emblem_Holy_See/);
const diocesan={...item,community_id:"DIOCESAN",eyebrow:"Diocesan"};
const diocesanCard=renderDirectoryVenueCard(diocesan,"en");
assert.match(diocesanCard,/data-visual-kind="neutral"/);
assert.match(diocesanCard,/aoTlmVenueGlyph/);
assert.match(diocesanCard,/Diocesan church/);
assert.doesNotMatch(diocesanCard,/Emblem_Holy_See/);
const unknown={...item,community_id:"OTHER",eyebrow:"Independent / unknown"};
assert.match(renderDirectoryVenueCard(unknown,"fr"),/Église \/ chapelle/);
assert.doesNotMatch(renderDirectoryVenueCard(unknown,"fr"),/FSSP_emblem/);
const cmriSource={...item,community_id:"OTHER",eyebrow:"CMRI directory / affiliated clergy"};
const cmriCard=renderDirectoryVenueCard(cmriSource,"en");
assert.match(cmriCard,/Listed as: CMRI directory \/ affiliated clergy/);
assert.doesNotMatch(cmriCard,/FSSP_emblem|Society_of_Saint_Pius_X_logo/);
const unsafeSource={...item,community_id:"OTHER",eyebrow:'<img src=x onerror="alert(1)">'};
assert.match(renderDirectoryVenueCard(unsafeSource,"en"),/&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;/);
assert.doesNotMatch(renderDirectoryVenueCard(unsafeSource,"en"),/<img src=x/);
assert.match(renderDirectoryVenueCard(linked,"en"),/data-visual-kind="photo"/);
assert.doesNotMatch(renderDirectoryVenueCard(linked,"en"),/aoTlmVenueIdentity--card/);
assert.match(DIRECTORY_CARD_STYLE,/aoTlmPreviewPhoto/);
assert.match(DIRECTORY_CARD_STYLE,/aoTlmDetailPhoto/);
assert.match(DIRECTORY_CARD_STYLE,/aoTlmVenueIdentity--preview/);
const malicious={...item,title:'<img src=x onerror="alert(1)">'};
assert.doesNotMatch(renderDirectoryVenueCard(malicious),/<img src=x/);
assert.match(renderDirectoryVenueCard(malicious),/onerror=&quot;alert\(1\)&quot;/);
assert.match(renderDirectoryVenueCard(malicious),/&lt;img/);
const vm=buildExploreViewModel({language:"en",lens:"tlm",items:[linked],view:"list",filters:{directoryGroup:"ALL"}});
assert.match(renderExploreToString(vm),/aoTlmVenueCard/);
const vm2=buildExploreViewModel({language:"fr",lens:"tlm",items:[linked],view:"map",selectedId:item.item_id,filters:{directoryGroup:"ALL"}});
assert.match(renderExploreToString(vm2),/aoTlmPreviewPhoto/);
const noPhotoMap=buildExploreViewModel({language:"en",lens:"tlm",items:[item],view:"map",selectedId:item.item_id,filters:{directoryGroup:"ALL"}});
assert.match(renderExploreToString(noPhotoMap),/aoTlmVenueIdentity--preview/);
assert.match(renderExploreToString(noPhotoMap),/FSSP_emblem/);
const diocesanMap=buildExploreViewModel({language:"fr",lens:"tlm",items:[diocesan],view:"map",selectedId:item.item_id,filters:{directoryGroup:"ALL"}});
assert.match(renderExploreToString(diocesanMap),/Église diocésaine/);

// Complete visual identity is independent from photograph availability.
// Cover every one of the actual lightweight map records, not a small showcase subset.
const readRegistry=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const baseMap=projectPreliminaryR49(readRegistry("data/directory/preliminary-map-r49.v1.json"));
const fullMap=projectPublishedProvisionalMassSites(
  baseMap,readRegistry("data/directory/published-provisional-mass-sites-20261026.v1.json"));
assert.equal(fullMap.length,1882,"The map's 1,879 + 3 known visual slots must be accounted for");
const logoGroups=new Set(["FSSP","ICKSP","SSPX","IBP"]);
const visualCount={emblem:0,neutral:0};
for(const venue of fullMap){
  const fallback=renderDirectoryIdentityFallback(venue,"en");
  const card=renderDirectoryVenueCard(venue,"en");
  assert.match(card,/aoTlmVenueVisual/,"Every listed venue must have its visual area");
  if(logoGroups.has(venue.community_id)){
    assert.match(fallback,/data-visual-kind="emblem"/);
    visualCount.emblem++;
  }else{
    assert.match(fallback,/data-visual-kind="neutral"/);
    assert.match(fallback,/aoTlmVenueGlyph/);
    visualCount.neutral++;
  }
}
assert.deepEqual(visualCount,{emblem:1186,neutral:696});
console.log("PASS Directory photo-ready card: exact identity, rights, bilingual UI, complete 1882-site fallback coverage");
