import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import { sacredArt2026Curation } from "../src/calendar/sacred-art-2026-curation.js";
import { renderHomeToString } from "../src/home/presentation.js";
import {
  selectReleasedHomeArtwork, selectReleasedCalendarArtwork, renderReleasedLiturgicalArtwork
} from "../src/calendar/sacred-art-liturgical-bridge.js";

const json=path=>JSON.parse(readFileSync(path,"utf8"));
const user=json("data/calendar/sacred-art-user-235-subject-decisions-20261012.v1.json");
const legacy=json("data/calendar/sacred-art-curator-decisions-20261011.v1.json");
const occasion=json("data/calendar/sacred-art-home-masterpiece-occasions-2026.v1.json");
const reconciliation=json("data/calendar/sacred-art-liturgical-reuse-legacy-salvage-20261012.v1.json");
const selectIds=new Set(user.decisions.filter(x=>x.decision==="selected").map(x=>x.subject_id));
const records=new Map(user.decisions.map(x=>[x.subject_id,x]));

assert.equal(user.counts.subjects_total,235);
assert.equal(user.counts.selected,101);
assert.equal(user.counts.research,134);
assert.equal(legacy.summary.subjectSelections,44);
assert.equal(legacy.summary.approvedDistinctOriginals,35);
assert.equal(sacredArt2026Curation.status,"EDITORIAL_SELECTIONS_ONLY_NOT_ARTWORK_RELEASE");
assert.equal(sacredArt2026Curation.occasions.length,99);
assert.equal(sacredArt2026Curation.occasions.filter(x=>x.group==="observedClassI").length,53);
assert.equal(new Set(sacredArt2026Curation.occasions.map(x=>x.date)).size,98);
assert.equal(reconciliation.sunday2026.allSundayCivilDates,52);
assert.equal(reconciliation.sunday2026.sundayIndex.length,52);
assert.equal(reconciliation.sunday2026.observedClassIPrincipalSundays,16);
assert.equal(reconciliation.sunday2026.otherSundaysRequiringNormalDayResolver,36);
assert.equal(occasion.classI.length,53);
assert.deepEqual(
  sacredArt2026Curation.occasions.filter(x=>x.group==="observedClassI")
    .map(x=>[x.date,x.principalId]),
  occasion.classI.map(x=>[x.date,x.principalId])
);
for(const [id,s] of Object.entries(sacredArt2026Curation.selections)){
  assert.ok(selectIds.has(id),id+" may only be populated by the human's selected decision");
  assert.equal(records.get(id).selected_artwork_id,s.artworkId);
  assert.equal(records.get(id).selected_artwork.title,s.title);
}
for(const row of sacredArt2026Curation.occasions){
  for(const id of [...row.selectedSubjects,...row.relatedSubjects])
    assert.ok(selectIds.has(id),row.date+" cannot promote a research decision: "+id);
  if(row.group==="observedClassI")assert.ok(row.principalId);
  else assert.equal(row.principalId,null,
    "Other dates have no certified observed principal and cannot be published from this index");
}

// Real-source identity is a separate gate from editorial selection and dated
// association. Empty gallery is the correct result for the current research-only registry.
const researchLibrary=json("data/calendar/sacred-art-candidates.v1.json").artworks;
assert.equal(selectReleasedCalendarArtwork({
  date:"2026-03-25",observedId:"sancti:03-25:1:w",works:researchLibrary
}),null);
assert.equal(selectReleasedHomeArtwork({
  date:"2026-03-25",observedId:"sancti:03-25:1:w",works:researchLibrary
}),null);
assert.equal(selectReleasedHomeArtwork({
  date:"2026-03-25",observedId:"sancti:03-25:1:w",works:[]
}),null);

const good=(overrides={})=>({
  id:"met-438724",title:"The Annunciation",artist:"Philippe de Champaigne",medium:"painting",
  source:{rights:"CC0",objectUrl:"https://www.metmuseum.org/art/collection/search/438724"},
  association:{subjectKeys:["annunciation"],observedIds:["sancti:03-25:1:w"]},
  editorial:{subjectIds:["ROS-01"],selectedArtworkId:"old-id-does-not-override-official-source"},
  review:{source:"MUSEUM_API_CC0_VERIFIED",rights:"MUSEUM_API_CC0_VERIFIED",
    artistic:"APPROVED",image:"PASS",crop:"PASS",status:"APPROVED"},
  image:{path:"assets/sacred-art/met-438724.webp",width:3000,height:3500,
    sha256:"a".repeat(64),colour:true,museumOriginal:true,frameFree:true,glareFree:true},
  release:{home:true,homepageMasterpiece:true,calendar:true},
  ...overrides
});
const exact={date:"2026-03-25",observedId:"sancti:03-25:1:w"};
const art=good();
let cal=selectReleasedCalendarArtwork({...exact,works:[art]});
assert.equal(cal.subjectId,"ROS-01");
assert.equal(cal.held,false);
assert.equal(cal.relation,"OBSERVED_PRINCIPAL_SUBJECT");
assert.equal(cal.artwork.id,"met-438724");
assert.equal(selectReleasedCalendarArtwork({...exact,observedId:"not-the-observed-principal",works:[art]}),null);
assert.equal(selectReleasedCalendarArtwork({date:"2026-03-26",observedId:"some-other-principal",works:[art]}),null);
assert.equal(selectReleasedCalendarArtwork({date:"2027-03-25",observedId:exact.observedId,works:[art]}),null);

// Hold exactly the last cleared masterpiece. No random/day-based rotation.
let home=selectReleasedHomeArtwork({...exact,works:[art]});
assert.equal(home.held,false);
assert.equal(home.anchorDate,"2026-03-25");
home=selectReleasedHomeArtwork({date:"2026-03-26",observedId:"source-confirmed-day",
  works:[art]});
assert.equal(home?.artwork.id,"met-438724");
assert.equal(home?.held,true);
assert.equal(home?.anchorDate,"2026-03-25");
assert.equal(selectReleasedHomeArtwork({
  date:"2026-03-25",observedId:"imposter",works:[art]
})?.anchorDate??null,null);
assert.equal(selectReleasedHomeArtwork({
  date:"2026-02-01",observedId:"source-confirmed-day",works:[art]
}),null);
assert.equal(selectReleasedHomeArtwork({
  date:"2027-03-26",observedId:"source-confirmed-day",works:[art]
}),null);

const rendered=renderReleasedLiturgicalArtwork(home);
assert.match(rendered,/Philippe de Champaigne/);
assert.match(rendered,/Annunciation/);
assert.match(rendered,/\.\/assets\/sacred-art\/met-438724\.webp/);
assert.ok(!rendered.includes("2026-03-26"),"Never label held art as this day's feast");
assert.equal(renderReleasedLiturgicalArtwork(null),"");

// The calendar/hero approvals must be independent. Research alone, legal
// source rights alone, or a user-selected subject alone are never enough.
for(const bad of [
  good({release:{home:false,homepageMasterpiece:false,calendar:false}}),
  good({release:{home:true,homepageMasterpiece:false,calendar:true}}),
  good({review:{...art.review,artistic:"PENDING_HUMAN_CURATOR"}}),
  good({image:{...art.image,path:"https://example.com/art.png"}}),
  good({image:{...art.image,crop:"PASS",width:640,height:960}}),
  good({editorial:{subjectIds:["ROS-15"],selectedArtworkId:art.editorial.selectedArtworkId}}),
  good({editorial:{subjectIds:["ROS-01"],selectedArtworkId:"wrong"},
    source:{rights:"CC0",objectUrl:"https://www.metmuseum.org/art/collection/search/12000"}})
]){
  assert.equal(selectReleasedHomeArtwork({...exact,works:[bad]}),null,
    "Home must not auto-release a research option or incomplete asset");
}
assert.equal(selectReleasedCalendarArtwork({...exact,works:[good({
  release:{home:false,homepageMasterpiece:false,calendar:false}
})]}),null);
assert.equal(selectReleasedHomeArtwork({...exact,works:[good({
  release:{home:false,homepageMasterpiece:true,calendar:true}
})]}),null);
assert.equal(selectReleasedCalendarArtwork({
  date:"2026-03-19",observedId:"sancti:03-19:1:w",
  works:[good({editorial:{subjectIds:["BIB-G02"],
      selectedArtworkId:sacredArt2026Curation.selections["BIB-G02"].artworkId},
    release:{home:true,homepageMasterpiece:true,calendar:true}})]
}),null,"A related Joseph narrative is not automatically an exact Joseph feast painting");

// New approved artwork can supersede an older released one; its selected
// source must be the user's artwork, not a previously archived alternative.
const easterRow=sacredArt2026Curation.occasions.find(x=>x.date==="2026-04-05"&&x.group==="observedClassI");
assert.ok(easterRow?.selectedSubjects.includes("ROS-11"));
const newer=good({
  id:"met-888888",title:"The Resurrection of Christ",artist:"Peter Paul Rubens",
  source:{rights:"CC0",objectUrl:"https://www.metmuseum.org/art/collection/search/888888"},
  editorial:{subjectIds:["ROS-11"],selectedArtworkId:sacredArt2026Curation.selections["ROS-11"].artworkId},
  image:{...art.image,path:"assets/sacred-art/met-888888.webp"}
});
home=selectReleasedHomeArtwork({
  date:"2026-04-05",observedId:easterRow.principalId,works:[art,newer]
});
assert.equal(home?.subjectId,"ROS-11");
assert.equal(home?.held,false);
assert.equal(home?.artworkTitle,sacredArt2026Curation.selections["ROS-11"].title);
assert.ok(!renderReleasedLiturgicalArtwork(home).includes("Saint Joseph"));

// A Class II major feast can acquire artwork only after the separate release
// explicitly verifies that date's observed principal. Nominal dates never
// activate images from a title match alone.
const presentation=sacredArt2026Curation.occasions.find(x=>
  x.date==="2026-02-02" && x.group==="otherHighlights");
assert.ok(presentation?.selectedSubjects.includes("ROS-04"));
const presentationWork=good({
  id:"met-777777",
  source:{rights:"CC0",objectUrl:"https://www.metmuseum.org/art/collection/search/777777"},
  editorial:{subjectIds:["ROS-04"],
    selectedArtworkId:sacredArt2026Curation.selections["ROS-04"].artworkId},
  image:{...art.image,path:"assets/sacred-art/met-777777.webp"}
});
const candlemas={date:"2026-02-02",observedId:"certified-purification-principal"};
assert.equal(selectReleasedCalendarArtwork({...candlemas,works:[presentationWork]}),null);
const verifiedPresentation={
 ...presentationWork,
 release:{...presentationWork.release,verifiedOccasions:[{
   date:candlemas.date,subjectId:"ROS-04",
   observedPrincipalId:candlemas.observedId,
   relationship:"EXACT_FEAST_SUBJECT",
   liturgicalWitnessUrl:"https://example.test/ordo/02-02",
   iconographyWitnessUrl:"https://example.test/art/presentation"
 }]}
};
assert.equal(selectReleasedCalendarArtwork({
 ...candlemas,works:[verifiedPresentation]
})?.subjectId,"ROS-04");
assert.equal(selectReleasedCalendarArtwork({
 ...candlemas,observedId:"wrong-mass",works:[verifiedPresentation]
}),null);
assert.equal(selectReleasedHomeArtwork({
 date:"2026-02-03",observedId:"resolved-next-day",works:[verifiedPresentation]
})?.anchorDate,"2026-02-02");

// Even an exact editorial ID cannot override a known different museum object.
assert.equal(selectReleasedCalendarArtwork({...exact,works:[good({
 source:{rights:"CC0",objectUrl:"https://www.metmuseum.org/art/collection/search/123456"},
 editorial:{subjectIds:["ROS-01"],
   selectedArtworkId:sacredArt2026Curation.selections["ROS-01"].artworkId}
})]}),null,"Known museum source is a hard identity check");

// Ordinary Sundays may be illustrated by a separately certified appointed
// Gospel. No Sunday title or Gospel is guessed from a civil date. The witness
// URLs and Principal ID below are synthetic release-contract test fixtures.
const sunday="2026-11-08";
assert.ok(reconciliation.sunday2026.sundayIndex.some(x=>x.date===sunday
  && !x.sourcePrincipalIfClassI));
const blind=sacredArt2026Curation.selections["BIB-G27"];
assert.ok(blind,"All 101 selected artwork subjects, not just the major feasts, are indexed");
const sundayWork=good({
  id:"met-777779",
  source:{rights:"CC0",objectUrl:"https://www.metmuseum.org/art/collection/search/777779"},
  editorial:{subjectIds:["BIB-G27"],selectedArtworkId:blind.artworkId},
  image:{...art.image,path:"assets/sacred-art/met-777779.webp"},
  release:{home:true,homepageMasterpiece:true,calendar:true,verifiedOccasions:[{
    date:sunday,subjectId:"BIB-G27",observedPrincipalId:"resolved-principal-sunday",
    relationship:"APPOINTED_GOSPEL",
    liturgicalWitnessUrl:"https://example.test/1962-proper/sunday",
    iconographyWitnessUrl:"https://example.test/paintings/healing-blind",
    homeSpotlight:true
  }]}
});
assert.equal(selectReleasedCalendarArtwork({
  date:sunday,observedId:"resolved-principal-sunday",works:[sundayWork]
})?.relation,"APPOINTED_GOSPEL");
assert.equal(selectReleasedCalendarArtwork({
  date:sunday,observedId:"different-day",works:[sundayWork]
}),null);
assert.equal(selectReleasedHomeArtwork({
  date:"2026-11-09",observedId:"resolved-monday",
  works:[art,sundayWork]
})?.anchorDate,sunday,"New source-cleared Sunday hero replaces earlier held art");
const noWitness=good({...sundayWork,release:{
  ...sundayWork.release,verifiedOccasions:[{
    ...sundayWork.release.verifiedOccasions[0],liturgicalWitnessUrl:null
  }]
}});
assert.equal(selectReleasedCalendarArtwork({
  date:sunday,observedId:"resolved-principal-sunday",works:[noWitness]
}),null,"No publication on merely asserted Sunday association");

// Exercise the actual Home string renderer, not only the art helper. In the
// production app the old artist card must not appear beside a cleared new hero.
const homeState={
  route:"home",selectedDate:"2026-03-25",language:"en",resolving:false,
  resolution:{
    date:"2026-03-25",status:"ready",
    day:{main:{id:exact.observedId,title:"Annunciation of the Blessed Virgin Mary",
      rank:1,color:"White"}},
    proper:{status:"idle"}
  }
};
const newHome=renderHomeToString(homeState,{
  AO_SACRED_ART_RELEASE_V1:{artworks:[art]},
  AO_PHASE1_ART:{homeMarkup:()=>'<div data-legacy-art="yes">legacy art</div>'}
});
assert.match(newHome,/class="aoLitArtReleased"/);
assert.doesNotMatch(newHome,/data-legacy-art="yes"/,
  "Only one Home artwork owner may render");
const oldHome=renderHomeToString(homeState,{
  AO_PHASE1_ART:{homeMarkup:()=>'<div data-legacy-art="yes">legacy art</div>'}
});
assert.match(oldHome,/data-legacy-art="yes"/,
  "Prior Home must remain usable without a production-eligible artwork");
assert.doesNotMatch(oldHome,/class="aoLitArtReleased"/);

// Wiring into the currently owned Home and Calendar surfaces, not a parallel
// UI. Actual live image deployment awaits the release registry and packaged art.
const homeSource=readFileSync("src/home/presentation.js","utf8");
const calSource=readFileSync("src/calendar/calendar-runtime.js","utf8");
assert.match(homeSource,/selectReleasedHomeArtwork/);
assert.match(homeSource,/AO_PHASE1_ART\?\.homeMarkup/);
assert.match(calSource,/selectReleasedCalendarArtwork/);
assert.ok(!/import .*sacred-art.* from .*traditional-year/.test(homeSource));
console.log("PASS: 235 reviewed/101 selections, 44 legacy placements preserved, all 52 Sundays indexed, 53 Class I dates source-bound, Home hold/caption and Calendar exact-principal release gates");
