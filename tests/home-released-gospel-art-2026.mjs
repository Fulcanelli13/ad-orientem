import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {releasedDateGospelHero2026,RELEASED_2026_GOSPEL_HERO_DATES}
  from "../src/home/released-date-gospel-heroes-2026.js";
import {RELEASED_MODULE_PAINTINGS} from "../src/art/released-module-paintings.v1.js";

assert.deepEqual(Object.keys(RELEASED_2026_GOSPEL_HERO_DATES),["2026-03-25","2026-12-16"]);
const angel=RELEASED_MODULE_PAINTINGS.angelus;
assert.equal(angel.source,"https://www.metmuseum.org/art/collection/search/438724");
assert.ok(angel.photographRights.includes("CC0"));
assert.ok(existsSync(new URL("../"+angel.image,import.meta.url)));
assert.ok(existsSync(new URL("../"+angel.original,import.meta.url)));
const provider={properPath:state=>state.resolution.proper.sourcePath};
const build=(date,id,path,gospel="Luke 1:26–38")=>({
 selectedDate:date,
 resolution:{date,status:"ready",day:{main:{id,title:"Observed celebration"}},
   proper:{status:"ready",sourcePath:path,
     data:{sourcePath:path,gospel:{
       lat:"Missus est Angelus Gabriel a Deo in civitatem Galilaeae",
       reference:gospel}}}}
});
for(const [date,rule] of Object.entries(RELEASED_2026_GOSPEL_HERO_DATES)){
 const state=build(date,rule.principalId,rule.properPath);
 const found=releasedDateGospelHero2026(state,provider);
 assert.ok(found,"Gospel verified released painting missing for "+date);
 assert.equal(found.artworkId,"met-438724");
 assert.equal(found.gospelReference,"Luke 1:26–38");
 assert.equal(found.image,"/"+angel.image);
 assert.equal(found.sourceReuse,"PREVIOUSLY_RELEASED_MET_PHOTOGRAPH");
 assert.equal(releasedDateGospelHero2026(build(date,"sancti:wrong:1:w",rule.properPath),provider),null,
   "Wrong principal must not inherit painting");
 assert.equal(releasedDateGospelHero2026(build(date,rule.principalId,"Sancti/other"),provider),null,
   "Wrong Proper must not inherit painting");
 assert.equal(releasedDateGospelHero2026(build(date,rule.principalId,rule.properPath,"Luke 18:9–14"),provider),null,
   "Wrong Gospel must not inherit painting");
 const pending=build(date,rule.principalId,rule.properPath);
 pending.resolution.proper.status="loading";
 assert.equal(releasedDateGospelHero2026(pending,provider),null);
}
assert.equal(releasedDateGospelHero2026(build("2026-10-07","sancti:10-07:2:w",
 "Sancti/10-07"),provider),null,
 "Rosary feast secondary Gospel-only research may not override primary feast art");
assert.equal(releasedDateGospelHero2026(build("2026-11-01","sancti:11-01:1:w",
 "Sancti/11-01"),provider),null,"Existing Class I date locks preserved");
const source=readFileSync(new URL("../src/home/c3-gallery.js",import.meta.url),"utf8");
assert.ok(source.includes("releasedDateGospelHero2026(state,p)"));
assert.ok(source.includes("img.dataset.aoReleasedGospelDate=gospelHero.date"));
assert.ok(source.includes("mainInfo.__c3Artwork={title:gospelHero.title"));
assert.ok(source.includes('img.className="aoC3DatedImage"'));
assert.ok(source.includes('img.addEventListener("error"'));
console.log("Two exact date+Gospel Met original reuses; Rosary/held feast exclusions PASS");
