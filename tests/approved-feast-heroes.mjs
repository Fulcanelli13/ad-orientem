import assert from "node:assert/strict";
import fs from "node:fs";
import {
  APPROVED_FEAST_HERO_DATES,
  APPROVED_FEAST_HERO_VERSION,
  approvedFeastHeroForResolvedDay,
  resolveApprovedFeastHero,
  renderApprovedFeastHero,
} from "../src/calendar/approved-feast-heroes.js";

assert.match(APPROVED_FEAST_HERO_VERSION, /oct19-feast-selection/);
assert.equal(APPROVED_FEAST_HERO_DATES.length, 10);
assert.equal(new Set(APPROVED_FEAST_HERO_DATES.map(x => x.date)).size, 10);
assert.ok(APPROVED_FEAST_HERO_DATES.every(x => x.curatorApproved));
assert.ok(APPROVED_FEAST_HERO_DATES.every(x => x.photoApprovedForRelease === false));

const expected = [
  ["2026-03-29","Anthony van Dyck","The Entry of Christ into Jerusalem"],
  ["2026-04-02","Ugolino da Siena","Last Supper"],
  ["2026-05-23","Juan Bautista Maíno","The Pentecost"],
  ["2026-05-24","Jean Restout","Pentecost"],
  ["2026-05-27","Philippe de Champaigne","La Petite Cène"],
  ["2026-06-12","Juan Patricio Morlete Ruiz","The Heart of Jesus"],
  ["2026-10-25","Ambrosius Benson","Salvator Mundi"],
  ["2026-11-01","Carlo Saraceni","Paradise"],
  ["2026-11-02","Ludovico Carracci","An Angel Frees the Souls of Purgatory"],
  ["2026-11-29","John Martin","The Great Day of His Wrath"],
];
for (const [date,artist,title] of expected) {
  const record = APPROVED_FEAST_HERO_DATES.find(x => x.date === date);
  assert.ok(record, date + " date mapping missing");
  assert.equal(record.artist, artist);
  assert.equal(record.title, title);
  assert.equal(approvedFeastHeroForResolvedDay(date,record.observedPrincipalId),record);
  assert.equal(approvedFeastHeroForResolvedDay(date,"sancti:wrong:1:w"),null);
  assert.equal(resolveApprovedFeastHero(date,record.observedPrincipalId,{}).status,"AWAITING_RELEASED_PHOTOGRAPH");
  assert.equal(renderApprovedFeastHero(resolveApprovedFeastHero(date,record.observedPrincipalId,{})),"");
}
assert.equal(approvedFeastHeroForResolvedDay("2027-04-02","tempora:Quad6-4r:1:w"),null);
assert.equal(approvedFeastHeroForResolvedDay("2026-04-03","tempora:Quad6-4r:1:w"),null);

// This is a TEST FIXTURE, not a licence / source photograph acquisition.
// A deliberately invented SHA and file must NEVER enter a production release ledger.
const choice=APPROVED_FEAST_HERO_DATES.find(x=>x.date==="2026-06-12");
const fakeReady={
  key:choice.key,
  artist:choice.artist,
  title:choice.title,
  artworkId:choice.artworkId,
  source:{
    objectUrl:"https://example.org/works/123",
    photoUrl:"https://example.org/image/123",
    exactOriginalVerified:true,
  },
  photo:{
    path:"assets/sacred-art/sacred-heart-test-fixture.webp",
    sha256:"a".repeat(64),
    width:900,
    height:1200,
    fullPaintedSurface:true,
    noGlare:true,
    phone320Pass:true,
    phone390Pass:true,
  },
  rights:{
    license:"CC0",
    evidenceUrl:"https://example.org/license",
    exactPhotoRightsVerified:true,
    appDistributionPermitted:true,
    attribution:"Example Museum",
  },
  release:{
    status:"APPROVED_FOR_RELEASE",
    home:true,
    calendar:true,
    humanVisualApproval:true,
    observedPrincipalId:choice.observedPrincipalId,
  }
};
const registry=work=>({artworks:[work]});
const good=resolveApprovedFeastHero(choice.date,choice.observedPrincipalId,registry(fakeReady),"home");
assert.equal(good.status,"RELEASED");
const html=renderApprovedFeastHero(good);
assert.match(html, /The Heart of Jesus/);
assert.match(html, /Juan Patricio Morlete Ruiz/);
assert.match(html, /object-fit:contain/);
assert.doesNotMatch(html, /https:\/\/example.org\/image\/123/); // never remote hotlink
assert.match(renderApprovedFeastHero(resolveApprovedFeastHero(
  choice.date,choice.observedPrincipalId,registry(fakeReady),"calendar"
),{calendar:true}),/loading="lazy"/);

function bad(modify) {
  const art=structuredClone(fakeReady);
  modify(art);
  return resolveApprovedFeastHero(choice.date,choice.observedPrincipalId,registry(art)).status;
}
assert.equal(bad(w=>{w.title="Another painting"}),"PHOTO_IDENTITY_RIGHTS_OR_MOBILE_HOLD");
assert.equal(bad(w=>{w.artworkId="fake-other-painting"}),"PHOTO_IDENTITY_RIGHTS_OR_MOBILE_HOLD");
assert.equal(bad(w=>{w.source.exactOriginalVerified=false}),"PHOTO_IDENTITY_RIGHTS_OR_MOBILE_HOLD");
assert.equal(bad(w=>{w.photo.fullPaintedSurface=false}),"PHOTO_IDENTITY_RIGHTS_OR_MOBILE_HOLD");
assert.equal(bad(w=>{w.photo.phone320Pass=false}),"PHOTO_IDENTITY_RIGHTS_OR_MOBILE_HOLD");
assert.equal(bad(w=>{w.photo.phone390Pass=false}),"PHOTO_IDENTITY_RIGHTS_OR_MOBILE_HOLD");
assert.equal(bad(w=>{w.photo.path="https://example.org/other.jpg"}),"PHOTO_IDENTITY_RIGHTS_OR_MOBILE_HOLD");
assert.equal(bad(w=>{w.photo.path="assets/other/image.webp"}),"PHOTO_IDENTITY_RIGHTS_OR_MOBILE_HOLD");
assert.equal(bad(w=>{w.photo.sha256="abc"}),"PHOTO_IDENTITY_RIGHTS_OR_MOBILE_HOLD");
assert.equal(bad(w=>{w.rights.exactPhotoRightsVerified=false}),"PHOTO_IDENTITY_RIGHTS_OR_MOBILE_HOLD");
assert.equal(bad(w=>{w.rights.appDistributionPermitted=false}),"PHOTO_IDENTITY_RIGHTS_OR_MOBILE_HOLD");
assert.equal(bad(w=>{w.rights.license="ALL_RIGHTS_RESERVED"}),"PHOTO_IDENTITY_RIGHTS_OR_MOBILE_HOLD");
assert.equal(bad(w=>{w.release.home=false}),"PHOTO_IDENTITY_RIGHTS_OR_MOBILE_HOLD");
assert.equal(bad(w=>{w.release.humanVisualApproval=false}),"PHOTO_IDENTITY_RIGHTS_OR_MOBILE_HOLD");
assert.equal(bad(w=>{w.release.observedPrincipalId="sancti:other"}),"PHOTO_IDENTITY_RIGHTS_OR_MOBILE_HOLD");
assert.equal(resolveApprovedFeastHero(choice.date,choice.observedPrincipalId,registry({
  ...fakeReady,release:{...fakeReady.release,calendar:false}
}),"calendar").status,"PHOTO_IDENTITY_RIGHTS_OR_MOBILE_HOLD");

// Current-main integration tests: do NOT overlay the older research presentation.
const home=fs.readFileSync(new URL("../src/home/presentation.js",import.meta.url),"utf8");
const calendar=fs.readFileSync(new URL("../src/calendar/calendar-runtime.js",import.meta.url),"utf8");
const styles=fs.readFileSync(new URL("../src/home/today-v2-styles.js",import.meta.url),"utf8");
assert.match(home,/approvedFeastHeroForResolvedDay\(state\.selectedDate,observed\)/);
assert.match(home,/resolveApprovedFeastHero\(/);
assert.match(home,/AO_PHASE1_ART\?\.homeMarkup/); // historical illustration preserved for other dates
assert.match(home,/else if\(!editorialChoice\)/);  // no substitution where a user selection is waiting
assert.match(calendar,/renderApprovedFeastHero\(resolveApprovedFeastHero\(/);
assert.match(styles,/\.aoTodayV2Art \.aoApprovedFeastHero>img\{[^}]*object-fit:contain!important/);

console.log("Approved feast heroes: 10/10 date and artist choices; fail-closed rights, crop, source, principal and render checks PASS");
