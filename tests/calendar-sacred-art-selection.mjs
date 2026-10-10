import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  eligibleSacredArtwork, selectDailySacredArt, selectTimedDevotionalSacredArt
} from "../src/calendar/sacred-art-selection.js";

const registry = JSON.parse(readFileSync("data/calendar/sacred-art-candidates.v1.json", "utf8"));
assert.equal(registry.schema, "AO_SACRED_ART_CANDIDATES_V1");
assert.equal(registry.ownerIssue, 885);
assert.equal(registry.artworks.length, 29);
assert.equal(new Set(registry.artworks.map(a => a.id)).size, 29);
for (const candidate of registry.artworks) {
  assert.match(candidate.id, /^met-\d+$/);
  assert.equal(candidate.medium, "painting");
  assert.equal(candidate.source.rights, "CC0");
  assert.match(candidate.source.objectUrl, /^https:\/\/www\.metmuseum\.org\/art\/collection\/search\/\d+$/);
  assert.equal(candidate.review.status, "CANDIDATE");
  assert.equal(candidate.image, null);
  assert.equal(eligibleSacredArtwork(candidate), false, "Museum page alone is never production image approval");
}
assert.equal(selectDailySacredArt({date:"2026-10-10",seasonId:"after-pentecost"},registry.artworks),null);

const mock = (id,subjectKeys=[],seasonIds=[],observedIds=[]) => ({
  id:"met-"+id,title:id,artist:"Test painting",medium:"painting",
  source:{rights:"CC0",objectUrl:"https://www.metmuseum.org/art/collection/search/"+id},
  association:{subjectKeys,seasonIds,observedIds},
  review:{source:"OBJECT_PAGE_CHECKED",rights:"OBJECT_PAGE_CHECKED",artistic:"APPROVED",
    image:"PASS",crop:"PASS",status:"APPROVED"},
  image:{path:"assets/sacred-art/met-"+id+".webp",width:3000,height:4000,
    sha256:"a".repeat(64),colour:true,museumOriginal:true,frameFree:true,glareFree:true}
});
const works = [
  mock("1",["annunciation","angelus"],["advent"],["sancti:03-25:1:w"]),
  mock("2",["resurrection","regina-caeli"],["easter"]),
  mock("3",["woman-at-well"],["lent"]),
  mock("4",["scripture-epistle"],[]),
  mock("5",["christ","universal"],["after-pentecost"])
];
const ctx = {date:"2026-03-25",observedId:"sancti:03-25:1:w",observedSubjectKeys:["annunciation"],gospelSubjectKeys:["woman-at-well"],epistleSubjectKeys:["scripture-epistle"],seasonId:"lent"};
assert.equal(selectDailySacredArt(ctx,works).basis,"OBSERVED_ID");
assert.equal(selectDailySacredArt(ctx,works).artwork.id,"met-1");
assert.equal(selectDailySacredArt({...ctx,observedId:"unrelated"},works).basis,"OBSERVED_MYSTERY");
assert.equal(selectDailySacredArt({...ctx,observedId:null,observedSubjectKeys:[]},works).basis,"APPOINTED_GOSPEL");
assert.equal(selectDailySacredArt({...ctx,observedId:null,observedSubjectKeys:[],gospelSubjectKeys:[]},works).basis,"APPOINTED_OTHER_SCRIPTURE");
assert.equal(selectDailySacredArt({...ctx,observedId:null,observedSubjectKeys:[],gospelSubjectKeys:[],epistleSubjectKeys:[]},works).basis,"1962_SEASON");
assert.equal(selectDailySacredArt({date:"2026-03-25",devotionalContextKeys:["resurrection"]},works).basis,"DEVOTIONAL_ASSOCIATION");
assert.equal(selectDailySacredArt({date:"2026-03-25"},works).basis,"UNIVERSAL_SACRED_PAINTING");
assert.equal(selectDailySacredArt({date:"2026-03-25",observedTitle:"Annunciation"},[works[0]]),null,"Never infer observed identity from title alone");
assert.equal(selectDailySacredArt({date:"2026-03-25",observedId:"sancti:03-25:1:w"},[works[2]]),null,"Never give the impeded/irrelevant painting simply from its date");

for (const changes of [
  {review:{...works[0].review,status:"CANDIDATE"}},
  {review:{...works[0].review,artistic:"PENDING_HUMAN_CURATOR"}},
  {image:{...works[0].image,width:320,height:400}},
  {image:{...works[0].image,glareFree:false}},
  {image:{...works[0].image,colour:false}},
  {image:{...works[0].image,museumOriginal:false}},
  {image:{...works[0].image,path:"https://some-cdn.com/picture.jpg"}},
  {source:{...works[0].source,rights:"CC BY-NC"}},
]) assert.equal(eligibleSacredArtwork({...works[0],...changes}),false,"QA blocker must fail closed");

const angelus={date:"2026-10-10",localTime:"12:00",seasonId:"after-pentecost"};
assert.equal(selectTimedDevotionalSacredArt(angelus,works),null,"Devotional rotation must be opt-in");
assert.equal(selectTimedDevotionalSacredArt(angelus,works,{enabled:true}).artwork.id,"met-1");
assert.equal(selectTimedDevotionalSacredArt(angelus,works,{enabled:true}).devotion,"angelus");
assert.equal(selectTimedDevotionalSacredArt({...angelus,localTime:"12:20"},works,{enabled:true}),null);
assert.equal(selectTimedDevotionalSacredArt({...angelus,localTime:"17:59"},works,{enabled:true}),null);
assert.equal(selectTimedDevotionalSacredArt({...angelus,localTime:"18:00"},works,{enabled:true}).slot,"evening");
assert.equal(selectTimedDevotionalSacredArt({...angelus,date:"2027-04-05",seasonId:"easter"},works,{enabled:true}).devotion,"regina-caeli");
assert.equal(selectTimedDevotionalSacredArt({...angelus,seasonId:"ascension"},works,{enabled:true}).devotion,"regina-caeli");
assert.equal(selectTimedDevotionalSacredArt({...angelus,seasonId:"pentecost"},works,{enabled:true}).devotion,"regina-caeli");

// Algorithmic totality under an approved universal painting DOES NOT imply
// that the live library already has 366 vetted reproductions.
for (const year of [2026,2028]){
  const days=year===2028?366:365;
  for(let i=0;i<days;i++){
    const dt=new Date(Date.UTC(year,0,1+i));
    const date=dt.toISOString().slice(0,10);
    assert.equal(selectDailySacredArt({date},works).artwork.id,"met-5");
  }
}
console.log("PASS 29 museum objects source-listed as candidates; fail-closed QA, observed 1962 precedence, Scripture/season fallback, local-time Angelus and 365/366 algorithmic safety");
