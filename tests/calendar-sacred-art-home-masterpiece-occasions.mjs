import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=p=>JSON.parse(readFileSync(p,"utf8"));
const p=read("data/calendar/sacred-art-home-masterpiece-occasions-2026.v1.json");
const source=read("data/calendar/sacred-art-first-class-2026-research-crosswalk.v1.json");
const checks=read("data/calendar/1962-year-independent-checks-2026.v1.json");
const fixture=new Map(checks.checks.map(d=>[d.date,d]));
const byDate=new Map(source.days.map(d=>[d.date,d]));
assert.equal(p.schema,"AO_HOME_MASTERPIECE_LITURGICAL_LIST_V1");
assert.equal(p.year,2026);
assert.equal(p.classI.length,53);
assert.equal(p.optionalSpotlights.length,17);
assert.equal(p.counts.totalListedDates,93);
assert.equal(p.apostolicMysticAngelicSpotlights.length,29);
assert.equal(p.counts.additionalObservedAsPrincipal,23);
assert.equal(p.counts.additionalCommemoratedOrSuperseded,6);
assert.equal(p.counts.totalPotentialSpotlightCivilDates,98);
const iconThemes=p.masterpieceAcquisitionBrief.initialArtSubjectSlots;
assert.ok(iconThemes.some(x=>x.id==="apostles-and-evangelists"));
assert.ok(iconThemes.some(x=>x.id==="mystics-and-spiritual-doctors"));
assert.ok(iconThemes.some(x=>x.id==="saint-michael"));
const heads=p.apostolicMysticAngelicSpotlights;
for(const family of ["apostles-evangelists","mystics-and-spiritual-doctors","angels"]){
 assert.ok(heads.some(x=>x.family===family),"Missing iconographic subject family "+family);
}
const nominees=new Set(),nonPrincipals=new Set();
for(const d of heads){
 assert.match(d.date,/^2026-\d{2}-\d{2}$/);
 assert.ok([2,3].includes(d.rank));
 assert.ok(!nominees.has(d.date),"Repeated supplemental date "+d.date);
 nominees.add(d.date);
 assert.equal(d.mustSwitchArtwork,false);
 assert.equal(d.observedDayTitleMustRemainIndependent,true);
 assert.ok(d.heroSubjectKey);
 assert.equal(d.sourceReference,"https://gcatholic.org/calendar/2026/Extraordinary-en");
 if(d.observance2026!=="OBSERVED_PRINCIPAL"){
  assert.ok(["COMMEMORATED_NOT_PRINCIPAL","NOMINAL_DATE_SUPERSEDED"].includes(d.observance2026));
  nonPrincipals.add(d.date);
  assert.ok(/principal|commemoration|commemorated/i.test(d.notes));
 }
}
assert.deepEqual([...nonPrincipals].sort(),
 ["2026-01-25","2026-02-22","2026-03-24","2026-10-04","2026-10-18","2026-12-27"].sort());
assert.equal(heads.filter(x=>x.observance2026==="OBSERVED_PRINCIPAL").length,23);
assert.ok(p.classI.some(x=>x.date==="2026-09-29"&&/Michael/.test(x.title)),
 "Saint Michael is already Class I; do not add it as a new optional date");
assert.ok(p.classI.some(x=>x.date==="2026-06-29"&&/Peter/.test(x.title)),
 "Saints Peter and Paul already Class I");
for(const id of ["mark","matthew","luke","john-evangelist","teresa-avila","john-cross","margaret-mary-alacoque"]){
 assert.ok(heads.some(x=>x.heroSubjectKey===id),"Missing major Christian iconography "+id);
}
assert.ok(heads.find(x=>x.heroSubjectKey==="john-cross").notes.includes("November 24"),
 "Use the 1962 feast rather than the modern John-of-the-Cross date");
assert.equal(p.masterpieceAcquisitionBrief.initialArtSubjectSlots.length,26);
assert.ok(p.masterpieceAcquisitionBrief.firstWaveMaximumArtworks<=25);
assert.deepEqual(p.masterpieceAcquisitionBrief.initialArtSubjectSlots.map(x=>x.selectedArtworkId),Array(26).fill(null));
assert.equal(p.rules.calendarAndHeroDecoupled,true);
assert.equal(p.rules.noPlaceholderAndNoUglyFallback,true);
assert.equal(p.rules.homepageArtNotSaintOfTheDay,true);
const seen=new Set();
for(const d of p.classI){
 assert.match(d.date,/^2026-\d\d-\d\d$/);
 assert.equal(d.rank,1);
 assert.ok(!seen.has(d.date),"Duplicate class I "+d.date);
 seen.add(d.date);
 const actual=byDate.get(d.date);
 assert.ok(actual,"Invented Class I day "+d.date);
 assert.equal(d.principalId,actual.observedPrincipalId);
 assert.equal(d.title,actual.observedTitle);
 assert.equal(d.relationshipToArtwork,actual.associationTier);
 assert.ok(d.heroSubjectKey);
 assert.equal(d.mustSwitchArtwork,false);
}
assert.equal(seen.size,byDate.size,"Every observed Class I date must be included");
for(const d of p.optionalSpotlights){
 assert.ok(!seen.has(d.date),"Optional is already Class I: "+d.date);
 assert.ok(!seen.has("o:"+d.date),"Duplicate extra "+d.date);
 seen.add("o:"+d.date);
 assert.ok([2,3].includes(d.rank));
 assert.equal(d.mustSwitchArtwork,false);
 assert.ok(d.heroSubjectKey);
 const v=fixture.get(d.date);
 if(d.sourceReference==="1962-year-independent-checks-2026"){
  assert.ok(v,"Missing independent 2026 witness "+d.date);
  assert.equal(d.rank,v.rank,"Witness rank mismatch for "+d.date);
 }else assert.ok(["extraordinaryform-2026-ordo","ordo-fsspx-2026"].includes(d.sourceReference));
}
for(const x of ["2026-04-06","2026-04-07","2026-04-08","2026-04-09","2026-04-10","2026-04-11","2026-05-25","2026-05-26","2026-05-27","2026-05-28","2026-05-29","2026-05-30"])assert.ok(byDate.has(x),"Whole first class octave must be listed: "+x);
const group=key=>p.classI.filter(x=>x.heroSubjectKey===key);
assert.equal(group("resurrection").length,8,"One Resurrection may span Easter octave and Low Sunday");
assert.equal(group("pentecost").length,7,"One Pentecost masterpiece may span 7 class-I days");
assert.equal(group("advent").length,4,"Advent class-I Sundays share a small masterpiece pool");
assert.equal(p.masterpieceAcquisitionBrief.initialArtSubjectSlots.every(x=>x.mandatorySeparateImage===false),true);
assert.ok(!JSON.stringify(p).includes('"publishedArtwork"'),"Planning must not publish images");
console.log("PASS: 53 universal Class I 2026 dates + 17 distinct curated non-I spotlights; 24 optional art subjects; no forced daily image swaps");
