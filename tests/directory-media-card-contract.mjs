import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {projectPreliminaryR49,projectPublishedProvisionalMassSites} from "../src/find/preliminary-directory-r49.js";
import {attachApprovedDirectoryMedia,eligibleDirectoryImage,eligibleVenueImage,eligibleRenderedDirectoryImage,renderDirectoryVenueCard,renderDirectoryGallery,loadDirectoryCardMedia,renderDirectoryIdentityFallback,DIRECTORY_CARD_STYLE} from "../src/find/directory-card.js";
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
      :url.endsWith("/approved-venue-media.v1.json")
        ?{schema:"AO_APPROVED_TLM_VENUE_MEDIA_V1",items:[]}
        :{schema:"AO_APPROVED_PLACE_GALLERY_V1",items:[]};
  return {ok:true,json:async()=>data};
}});
assert.equal(requests.length,4);
assert.equal(mediaData.venueApproved.length,0);
assert.equal(mediaData.approved.length,1);
assert.equal(mediaData.directoryPlaceLinks.length,1);
const offline=await loadDirectoryCardMedia({fetchImpl:async()=>{throw new Error("offline")}});
assert.deepEqual(offline,{directoryPlaceLinks:[],approved:[],gallery:[],venueApproved:[]});

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
assert.match(renderDirectoryVenueCard(unknown,"fr"),/Selon la source : Independent \/ unknown/);
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
const familyCodes=["BENEDICTINE","DOMINICAN","CISTERCIAN","ORATORIAN","NORBERTINE","PREMONSTRATENSIAN"];
const logoGroups=new Set(["FSSP","ICKSP","SSPX","IBP","AASJMV","CAPUCHINS_MORGON","MILITIA_TEMPLI",...familyCodes]);
const familyCount=fullMap.filter(venue=>familyCodes.includes(venue.community_id)).length;
const morgonCount=fullMap.filter(venue=>venue.community_id==="CAPUCHINS_MORGON").length;
const militiaCount=fullMap.filter(venue=>venue.community_id==="MILITIA_TEMPLI").length;
assert.equal(morgonCount,5,"Preserve exact identity for the five Morgon entries");
assert.equal(familyCount,7,"One source-labelled Benedictine, one Dominican and five Oratorian entries in the existing map");
const visualCount={emblem:0,named:0,neutral:0};
for(const venue of fullMap){
  const fallback=renderDirectoryIdentityFallback(venue,"en");
  const card=renderDirectoryVenueCard(venue,"en");
  assert.match(card,/aoTlmVenueVisual/,"Every listed venue must have its visual area");
  if(logoGroups.has(venue.community_id)){
    assert.match(fallback,/data-visual-kind="emblem"/);
    if(familyCodes.includes(venue.community_id))
      assert.match(fallback,/Order-wide symbol/,"Family symbol must not claim house identity");
    if(venue.community_id==="MILITIA_TEMPLI")
      assert.match(fallback,/Independent cross drawing/,
        "Independent geometry cannot be described as an official logo");
    visualCount.emblem++;
  }else if(fallback.includes('data-visual-kind="named"')){
    assert.match(fallback,/aoTlmVenueNamedMark/);
    assert.match(fallback,/Listed as: /,"Named monogram must disclose source-only affiliation");
    assert.doesNotMatch(fallback,/<img /,"Uncleared source labels must not acquire a logo");
    visualCount.named++;
  }else{
    assert.match(fallback,/data-visual-kind="neutral"/);
    assert.match(fallback,/aoTlmVenueGlyph/);
    visualCount.neutral++;
  }
}
assert.deepEqual(visualCount,{emblem:1188+familyCount+morgonCount+militiaCount,named:61-familyCount-morgonCount-militiaCount,neutral:633},
  "All 1,882 original R49 and approved additions have an honest emblem, source-named monogram or neutral church symbol");


// P107 exact Jihlava asset release. Original and derivative are already SHA-
// pinned and editorially reviewed; the approved file must be byte-identical
// to the staged original and attached only to the CONFIRMED exact venue.
const jPlace="place:CZ:st-ignatius-jihlava";
const approvedMedia=JSON.parse(readFileSync(new URL("../data/geography/approved-place-media.v1.json",import.meta.url),"utf8"));
const geo=JSON.parse(readFileSync(new URL("../data/geography/seed-registry.v1.json",import.meta.url),"utf8"));
const p107=JSON.parse(readFileSync(new URL("../data/directory/research/p107-four-webp-stage-audit.v1.json",import.meta.url),"utf8"));
const finalQa=JSON.parse(readFileSync(new URL("../data/directory/research/p107-jihlava-final-image-editorial-qa.v1.json",import.meta.url),"utf8"));
const jMedia=approvedMedia.items.filter(x=>x.place_id===jPlace);
assert.equal(jMedia.length,1,"Jihlava may have only one approved exact cover");
assert.equal(finalQa.status,"PRIMARY_EDITORIAL_ACCEPTED_RELEASE_IN_SEPARATE_PR");
assert.equal(finalQa.site,jPlace);
const jStage=p107.records.find(x=>x.place_id===jPlace);
assert.ok(jStage?.no_crop&&jStage.native_jpeg_decode);
assert.equal(jMedia[0].source_url,jStage.source_url);
assert.equal(jMedia[0].credit,jStage.photographer);
assert.equal(jMedia[0].source_sha1,jStage.original_sha1_verified);
assert.equal(jMedia[0].derivative_sha256,jStage.staged_sha256);
assert.equal(jMedia[0].asset_path,"assets/approved/place-media/CZ-st-ignatius-jihlava.webp");
assert.equal(eligibleDirectoryImage(jMedia[0],jPlace),true);
const stagedJ=readFileSync(new URL("../"+jStage.staged_path,import.meta.url));
const approvedJ=readFileSync(new URL("../"+jMedia[0].asset_path,import.meta.url));
const digestJ=x=>createHash("sha256").update(x).digest("hex");
assert.equal(stagedJ.length,154206);
assert.equal(approvedJ.length,stagedJ.length);
assert.equal(digestJ(stagedJ),jStage.staged_sha256);
assert.equal(digestJ(approvedJ),jStage.staged_sha256,"Approved WebP must preserve the staged exact bytes");
assert.ok(approvedJ.toString("ascii",0,4)==="RIFF"&&approvedJ.toString("ascii",8,12)==="WEBP");
const jLinks=geo.directoryPlaceLinks.filter(x=>x.place_id===jPlace&&x.confidence==="CONFIRMED"&&x.relationship==="LOCATED_AT");
assert.equal(jLinks.length,1,"Jihlava should have one original exact church-to-venue link");
const jVenue={kind:"TLM_VENUE",source_id:jLinks[0].venue_id,item_id:"tlm:jihlava-exact",title:"Church of St Ignatius, Jihlava",community_id:"OTHER",eyebrow:"Listed source",source_links:[],sections:[]};
const [jAttached,jUnlinked]=attachApprovedDirectoryMedia([jVenue,{...jVenue,source_id:"same-church-name-but-different-site",item_id:"tlm:wrong"}],{directoryPlaceLinks:geo.directoryPlaceLinks,approved:approvedMedia.items,gallery:[]});
assert.equal(jAttached.place_id,jPlace);
assert.equal(jAttached.cover_media?.asset_path,jMedia[0].asset_path);
assert.ok(renderDirectoryVenueCard(jAttached,"en").includes('src="'+jMedia[0].asset_path+'"'));
assert.ok(renderDirectoryVenueCard(jAttached,"fr").includes('src="'+jMedia[0].asset_path+'"'));
assert.equal(jUnlinked.cover_media,undefined,"No approximate-name fallback may acquire this church photo");
for(const held of ["place:DE:friedhofskirche-st-michael-altoetting","place:FR:basilique-saint-bernard-fontaine-les-dijon","place:FR:saint-louis-de-gonzague-pau"]){
 assert.ok(!approvedMedia.items.some(x=>x.place_id===held),"Other P107 alternatives remain unpublished");
}

// Wave A: already-approved Guadalupe Shrine artwork must reach only its exact
// CL2/R28 TLM venue, never a similarly named chapel or an address-only guess.
// Shrine owner: https://guadalupeshrine.org/hours-locations/
// 5250 Justin Road, La Crosse, WI 54601 (also in the frozen CL2 source).
const guadPlace="place:US:guadalupe-shrine-la-crosse";
const guadVenueId="AO-AMER-R28-US-23-05";
const guadApproved=approvedMedia.items.filter(m=>m.place_id===guadPlace);
assert.equal(guadApproved.length,1,"Guadalupe should retain its one independently approved photo");
assert.equal(guadApproved[0].rights_verified,true);
assert.equal(guadApproved[0].subject_verified,true);
assert.equal(guadApproved[0].crop_reviewed,true);
const guadCanonical=geo.places.find(p=>p.place_id===guadPlace);
assert.equal(guadCanonical?.address?.line1,"5250 Justin Road");
assert.equal(guadCanonical?.address?.postal_code,"54601");
const guadLinks=geo.directoryPlaceLinks.filter(l=>l.place_id===guadPlace||l.venue_id===guadVenueId);
assert.equal(guadLinks.length,1,"Exactly one verified Guadalupe venue/Place mapping must exist");
assert.equal(guadLinks[0].venue_id,guadVenueId);
assert.equal(guadLinks[0].place_id,guadPlace);
assert.equal(guadLinks[0].confidence,"CONFIRMED");
assert.equal(guadLinks[0].relationship,"LOCATED_AT");
const guadVenue={kind:"TLM_VENUE",source_id:guadVenueId,item_id:"tlm:guadalupe-shrine-exact",
  title:"Shrine of Our Lady of Guadalupe",community_id:"DIOCESAN",
  eyebrow:"Official source",source_links:[],sections:[]};
const [guadAttached,guadDifferent]=attachApprovedDirectoryMedia(
  [guadVenue,{...guadVenue,source_id:"different-guadalupe-church-not-linked",item_id:"tlm:guadalupe-different"}],
  {directoryPlaceLinks:geo.directoryPlaceLinks,approved:approvedMedia.items,gallery:[]});
assert.equal(guadAttached.place_id,guadPlace);
assert.equal(guadAttached.cover_media?.asset_path,guadApproved[0].asset_path);
assert.equal(eligibleDirectoryImage(guadAttached.cover_media,guadPlace),true);
for(const lang of ["en","fr"]){
 assert.ok(renderDirectoryVenueCard(guadAttached,lang).includes('src="'+guadApproved[0].asset_path+'"'),
  "Real Guadalupe picture missing from "+lang+" TLM card");
}
assert.equal(guadDifferent.cover_media,undefined,
 "Unlinked same-name shrine/church must not receive the Guadalupe photograph");
assert.equal(guadDifferent.place_id,undefined,
 "Unlinked venue must not acquire a Place identity by name similarity");


// Venue-only photos must never require a made-up Sacred Place, nor leak to an
// unrelated church with a similar dedication, postcode, provisional pin or owner.
const directVenue={
  ...photo,place_id:undefined,venue_id:"AO-EXACT-TLM-SOURCE-1",
  license:"CC0-1.0",license_url:"https://creativecommons.org/publicdomain/zero/1.0/",
  asset_path:"assets/approved/directory-media/AO-exact-tlm-source-1.webp",
};
const noPlace={...item,item_id:"tlm:direct-venue-photo",source_id:directVenue.venue_id};
assert.equal(eligibleVenueImage(directVenue,noPlace.source_id),true);
assert.equal(eligibleRenderedDirectoryImage(directVenue,noPlace),true);
assert.equal(eligibleDirectoryImage(directVenue,"place:FR:test"),false);
const noPlaceAttached=attachApprovedDirectoryMedia([noPlace],{venueApproved:[directVenue]})[0];
assert.equal(noPlaceAttached.place_id,undefined);
assert.equal(noPlaceAttached.cover_media.asset_path,directVenue.asset_path);
for(const lang of ["en","fr"]){
 const card=renderDirectoryVenueCard(noPlaceAttached,lang);
 assert.match(card,/data-visual-kind="photo"/);
 assert.ok(card.includes('src="'+directVenue.asset_path+'"'));
}
const unrelated=attachApprovedDirectoryMedia(
 [{...noPlace,source_id:"AO-EXACT-TLM-SOURCE-OTHER",title:noPlace.title}],
 {venueApproved:[directVenue]})[0];
assert.equal(unrelated.cover_media,undefined,"Similar church name must never inherit a source-ID photo");
assert.equal(unrelated.place_id,undefined);
for(const invalid of [
 {...directVenue,status:"CANDIDATE"},
 {...directVenue,rights_verified:false},
 {...directVenue,subject_verified:false},
 {...directVenue,crop_reviewed:false},
 {...directVenue,license_url:"https://example.org/unknown"},
 {...directVenue,source_url:"http://commons.wikimedia.org/wiki/File:bad.jpg"},
 {...directVenue,asset_path:"assets/approved/place-media/incorrect.webp"},
 {...directVenue,venue_id:"AO-EXACT-TLM-SOURCE-OTHER"},
 {...directVenue,place_id:"place:FR:unverified"},
]){
 assert.equal(eligibleVenueImage(invalid,noPlace.source_id),false);
 assert.equal(attachApprovedDirectoryMedia([noPlace],{venueApproved:[invalid]})[0].cover_media,
  undefined,"Unapproved exact-venue candidate must not be shown");
}
assert.equal(attachApprovedDirectoryMedia([noPlace],{venueApproved:[directVenue,directVenue]})[0].cover_media,undefined,
 "Competing approved direct-venue photographs must fail closed");
const placeWins=attachApprovedDirectoryMedia([item],{
 directoryPlaceLinks:exact,approved:[photo],venueApproved:[{...directVenue,venue_id:item.source_id}],
})[0];
assert.equal(placeWins.cover_media.asset_path,photo.asset_path,
 "Existing verified Place media takes priority over exact direct-venue image");
const venueRegistry=JSON.parse(readFileSync(new URL("../data/directory/approved-venue-media.v1.json",import.meta.url),"utf8"));
assert.equal(venueRegistry.schema,"AO_APPROVED_TLM_VENUE_MEDIA_V1");
// Do not freeze the empty v1 registry forever: subsequent source-cleared
// photo releases must be able to add records without rewriting historical
// tests. Instead require *every* approved record to have a real exact TLM
// venue and a local binary with its pinned hash, plus the rights/subject gates.
const cl2Index=JSON.parse(readFileSync(new URL("../data/directory/generated/cl2-physical-site-index.v1.json",import.meta.url),"utf8"));
const auditedVenueAssets=new Set();
for(const image of venueRegistry.items){
 assert.ok(eligibleVenueImage(image,image.venue_id),"Direct venue registry includes unapproved media");
 assert.ok(cl2Index.records.some(row=>Array.isArray(row[1])&&row[1].includes(image.venue_id)),
  "Approved venue media must point to an actual indexed TLM venue");
 assert.ok(!auditedVenueAssets.has(image.venue_id),"Only one exact photo cover per venue");
 auditedVenueAssets.add(image.venue_id);
 const localBytes=readFileSync(new URL("../"+image.asset_path,import.meta.url));
 assert.equal(createHash("sha256").update(localBytes).digest("hex"),image.derivative_sha256,
  "Approved venue image binary must exist at exact checksum");
}
assert.ok(Array.isArray(venueRegistry.items),"Venue-media owner must remain an explicit audited registry");

console.log("PASS Directory photo-ready card: exact identity, rights, bilingual UI, complete 1882-site fallback coverage");
