// Primary-source visual navigation for the twelve original 1961 Graduale scores.
// Coordinates describe the first printed staff *in original 480px source PNGs*.
// Finding a staff is NOT independent verification of pitch, neumes, rhythm or
// syllable underlay. Do not use this module to certify or publish scores.
import {FIRST12_1961_FACSIMILES} from "./reader-proper-first12-1961-facsimile-locators.js";

export const PRINTED_1961_FIRST12_STAFF_FOCUS_SCHEMA =
 "ao-schola-first12-1961-first-staff-facsimile-focus-v1";

// id, source2 image, original image height, first-staff top, bottom,
// exact visible printed opening phrase. Heights/positions inspected on the
// archived CMAA/GregoBase source-2 PNGs captured in PR #2408.
const observed=Object.freeze([
 ["GREGOBASE-782",404,754,627,719,"Panis quem ego dedero, caro"],
 ["GREGOBASE-918",85,751,394,480,"Vidimus stellam ejus in Oriente"],
 ["GREGOBASE-403",83,748,271,391,"Ecce advenit dominator Dominus"],
 ["GREGOBASE-1147",85,751,77,172,"Reges Tharsis et insulae"],
 ["GREGOBASE-265",105,750,556,654,"Perfice gressus meos"],
 ["GREGOBASE-464",428,750,207,305,"Ego clamavi, quoniam exaudisti me"],
 ["GREGOBASE-95",307,758,354,458,"Ego sum pastor bonus, alleluia"],
 ["GREGOBASE-1136",378,752,357,461,"Omnes gentes plaudite manibus"],
 ["GREGOBASE-1165",402,756,90,203,"Inclina Domine aurem tuam ad me"],
 ["GREGOBASE-1271",425,751,546,664,"Si iniquitates observaveris Domine"],
 ["GREGOBASE-475",434,758,427,544,"Mihi autem nimis honorati sunt"],
 ["GREGOBASE-182",404,754,231,344,"Exspectans exspectavi Dominum"]
]);
const shaByImage=Object.freeze({
 404:"2cc979eeaa29369648684ed3c3aceaf98aa8b6dcf302cc402b43c815e45d6686",
 85:"961e788dc4c19ee01a80b37df1e7342f865e3a385a1f1c7c8726dabf776b4d9c",
 83:"8905a16073e044ea43ea24367fb73f74825cd8d0994592a782075dc6e5d59bad",
 105:"bdc4dde8258c401011eb4cce85e47510c29466afd9394a6b2bb97fa834c1285a",
 428:"8bb7800a7e47a57be0e3c7d4ba91d82597ee430c785764cb0794c210c53a74f4",
 307:"1ecbfcd0cba10ed347f563d934a149daaf9ad4e9133b6d0a5d633dddaf75f4f2",
 378:"d6afe7e6b977df31877c7a6056e4eb64cda65617f4a7ced2fcddcea1a5570b80",
 402:"d0947036b48457f85aafc4d285d7394dd90f86a3d38cf7c6a91b1b08c5f5876b",
 425:"17d48f9a16039bce9896f02fe6394dc47a164c6ad603c5b9f240a8f0744b7e76",
 434:"d70b50e436335068f74c5e1ca5ce39ff5c867ac0b9aa06cd2ad3ce33b61d9079"
});
const byId=new Map(FIRST12_1961_FACSIMILES.map(item=>[item.scoreId,item]));
export const FIRST12_1961_PRINTED_STAFF_FOCI=Object.freeze(observed.map(
 ([scoreId,imageNumber,imageHeight,top,bottom,visiblePrintedOpening])=>{
  const loc=byId.get(scoreId);
  if(!loc||loc.imageNumber!==imageNumber||!(top>0&&top<bottom&&
    bottom<imageHeight)||!shaByImage[imageNumber])
   throw Error("SCHOLA_1961_FIRST_STAFF_SOURCE_DRIFT_"+scoreId);
  return Object.freeze({
   scoreId,
   edition:"Graduale Romanum, Solesmes 1961",
   originalFolio:loc.folio,
   originalImageUrl:loc.scanned1961PageUrl,
   originalImageSha256:shaByImage[imageNumber],
   originalImageWidth:480,originalImageHeight:imageHeight,
   firstStaffBoundingBox:Object.freeze({xMin:20,yMin:top,xMax:465,yMax:bottom}),
   visiblePrintedOpening,
   continuationFolio:loc.scannedFolios[1]?.folio??null,
   originalScoreSourceUrl:loc.sourceUrl,
   observation:"PRINTED_STAFF_LOCATED_NOT_NOTE_FOR_NOTE_VERIFIED",
   pitchParityCertified:false,neumeParityCertified:false,
   rhythmParityCertified:false,syllableUnderlayCertified:false,
   allSystemsCollated:false,scoreApproved:false,publicScore:false
  });
 }));
const lookup=new Map(FIRST12_1961_PRINTED_STAFF_FOCI.map(x=>[x.scoreId,x]));
export function first12PrintedStaffFocus(scoreId){
 return lookup.get(String(scoreId??""))??null;
}
