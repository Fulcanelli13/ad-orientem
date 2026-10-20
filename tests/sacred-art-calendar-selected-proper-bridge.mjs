import assert from "node:assert/strict";
import {selectedCalendarArtProper,certifiedSacredArtForCalendar,certifiedSacredArtMarkup} from "../src/calendar/sacred-art-selected-proper-bridge.js";

const resolution={
  status:"ready",date:"2026-01-06",
  day:{main:{id:"sancti:01-06:1:w",title:"Epiphany"}},
  proper:{status:"ready",sourcePath:"Sancti/01-06",data:{sourcePath:"Sancti/01-06"}}
};
const selectedDate="2026-01-06";
const scriptureContexts=[{slot:"GOSPEL",reference:"Matthew 2:1–12",sourceReference:"Mt 2:1–12",provenance:{sourcePath:"Sancti/01-06"}}];
const key=selectedCalendarArtProper({selectedDate,resolution,scriptureContexts});
assert.deepEqual(key,{status:"ready",source:"CANONICAL_1962_PROPER",gospelVerified:true,
 date:selectedDate,principalId:"sancti:01-06:1:w",gospelRef:"Matthew 2:1–12"});
for(const bad of [
  {selectedDate:"2026-01-07"},
  {resolution:{...resolution,date:"2026-01-07"}},
  {resolution:{...resolution,proper:{...resolution.proper,status:"missing"}}},
  {resolution:{...resolution,day:{main:{title:"Epiphany"}}}},
  {resolution:{...resolution,proper:{status:"ready",data:{}}}},
  {scriptureContexts:[]},
  {scriptureContexts:[{...scriptureContexts[0],sourceReference:""}]},
  {scriptureContexts:[scriptureContexts[0],scriptureContexts[0]]}
]){
 const actual=selectedCalendarArtProper({selectedDate,resolution,scriptureContexts,...bad});
 assert.equal(actual,null,"Unverified or stale Proper must not select art");
}
const media={exactOriginalVerified:true,publicReuseRightsVerified:true,nonPradoSourceVerified:true,
  photoFileRightsVerified:true,cropVerified:true,phoneVisualQaVerified:true,
  localFilePresent:true,path:"assets/approved/sacred-art/epiphany.webp",
  sha256:"a".repeat(64),attribution:"Museum original, open access",
  sourceUrl:"https://example.org/art",rightsEvidenceUrl:"https://example.org/rights",
  rightsBasis:"PUBLIC_DOMAIN"};
const painting={artworkId:"TEST-INDEPENDENT-OPEN-ACCESS-ART",status:"PRODUCTION_CERTIFIED",media,
 placements:[{status:"CERTIFIED_EXACT_PLACEMENT",date:selectedDate,
  principalId:"sancti:01-06:1:w",role:"GOSPEL_SCENE",match:"GOSPEL_EXACT",
  gospelRef:"Matthew 2:1–12",priority:1}]};
const select=o=>certifiedSacredArtForCalendar({selectedDate,resolution,scriptureContexts,
 releaseRecords:[painting],approved:[painting.artworkId],rejected:[],...o});
assert.equal(select({releaseRecords:[]}),null);
assert.equal(select({rejected:[painting.artworkId]}),null);
assert.equal(select({releaseRecords:[{...painting,media:{...media,phoneVisualQaVerified:false}}]}),null);
assert.equal(select({releaseRecords:[{...painting,artworkId:"ART-eter-aul-ubens-doration-of-the-agi"}],approved:["ART-eter-aul-ubens-doration-of-the-agi"]}),null,"Prado original must not be selected even via a third-party mirror");
assert.equal(select({releaseRecords:[{...painting,placements:[{...painting.placements[0],gospelRef:"Luke 2:1–14"}]}]}),null);
const picked=select();
assert.equal(picked?.artworkId,painting.artworkId);
assert.equal(picked?.isLiteralGospelScene,true);
assert.match(certifiedSacredArtMarkup(picked),/Gospel scene/);
assert.equal(certifiedSacredArtMarkup(null),"");
assert(!certifiedSacredArtMarkup(picked).includes("https://example.org/art"),
 "Image source must stay local");
console.log("Sacred Art: canonical Calendar Proper and image release gate PASS");
