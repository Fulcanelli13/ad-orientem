import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {compactHeritagePlaceSheet} from "../src/find/heritage-presentation.js";

const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const previewCss=read("src/find/explore-map-first-v2-style.js");
const atlasCss=read("src/find/explore-atlas-layout-style.js");
const geography=JSON.parse(read("data/geography/seed-registry.v1.json"));
const approved=JSON.parse(read("data/geography/approved-place-media.v1.json")).items;
const lorem="Source-backed shrine explanation without borrowing another Place's history.";
const noPhoto={
  place_id:"place:TEST:long-title",
  name:"Sanctuaire Notre-Dame de l'Espérance et de la Miséricorde",
  place_type:"shrine",
  address:{city:"Village",country:"FR"},
  source_ids:["fixture"],
  media:null,
  counts:{shrines:1},
  shrines:[{summary:lorem,summary_fr:"Présentation sourcée du sanctuaire."}],
  geo:{precision:"complex_anchor",indicative_only:true},
  related_places:[],calendar:[],novenas:[],saints:[],tlm:[],
  directions_url:null,
};
const vm=(p,language="en")=>({
  language,selectedPlace:p,filters:{heritageCategories:["shrines"]},
  placeJourneys:[],journeyOpen:false,
});
const missingEN=compactHeritagePlaceSheet(vm(noPhoto));
const missingFR=compactHeritagePlaceSheet(vm(noPhoto,"fr"));
assert.match(missingEN,/data-approved-place-photo="no"/);
assert.match(missingFR,/data-approved-place-photo="no"/);
assert(!missingEN.includes("aoHeritagePlaceThumb"),"No approved image means no empty image element");
assert(missingEN.includes(noPhoto.name),"Do not replace a full sacred Place name with abbreviated text");
assert(!missingEN.includes("<img"),"No image means no speculative sacred image");
assert(missingEN.includes('data-explore-expand-place'),"Same action opens the full Place sheet");
const approvedCover=approved.find(x=>x.status==="APPROVED"&&x.rights_verified===true
  &&x.asset_path&&x.place_id);
assert(approvedCover,"Existing approved Place media must be available for the exact-Place fixture");
assert(geography.places.some(x=>x.place_id===approvedCover.place_id),"Approved cover owner remains canonical");
const withPhoto={
  ...noPhoto,place_id:approvedCover.place_id,
  media:{asset_path:approvedCover.asset_path,orientation:approvedCover.orientation,
    alt_en:approvedCover.alt_en,alt_fr:approvedCover.alt_fr,
    credit:approvedCover.credit,license:approvedCover.license},
};
const photoHtml=compactHeritagePlaceSheet(vm(withPhoto));
assert.match(photoHtml,/data-approved-place-photo="yes"/);
assert(photoHtml.includes(approvedCover.asset_path),"The exact approved photo is still displayed");
assert(!photoHtml.includes("data-sacred-object-photo"),"No invented relic subject binding");
assert(previewCss.includes('[data-approved-place-photo="no"]'),"Photo-free mobile grid variant missing");
assert(previewCss.includes("grid-template-columns:minmax(0,1fr)"),"No-photo card must have one content column");
assert(previewCss.includes("object-fit:contain"),"Approved preview imagery must be shown without crop");
assert(previewCss.includes("-webkit-line-clamp:unset"),"Long sacred place titles must not be clipped");
assert(previewCss.includes("@media(max-width:360px)"),"320px actions must have a narrow-phone fallback");
assert(atlasCss.includes("grid-template-columns:110px minmax(0,1fr)"),"Approved photo card retains its established image slot");
console.log("Explore P0 mobile preview markup and responsive source contract PASS (screen-capture QA still outstanding)");
