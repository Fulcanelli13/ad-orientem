import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {calendarCustomArticle,CALENDAR_CUSTOM_ARTICLE_IDS} from "../src/calendar/customs-read-model.js";
const seed=JSON.parse(readFileSync(new URL("../data/customs/customs-atlas-seed.v1.json",import.meta.url),"utf8"));
const folios=JSON.parse(readFileSync(new URL("../data/customs/customs-historical-folios.v1.json",import.meta.url),"utf8"));
const published=seed.customs.filter(c=>c.publication_state==="PUBLISHED");
assert.equal(published.length,37);
assert.equal(CALENDAR_CUSTOM_ARTICLE_IDS.length,37);
assert.deepEqual(new Set(CALENDAR_CUSTOM_ARTICLE_IDS),new Set(published.map(c=>c.custom_id)));
for(const id of CALENDAR_CUSTOM_ARTICLE_IDS){
  const card=calendarCustomArticle(id);
  for(const field of ["title","description","history","meaning","practice","caution","scope","occasion"]){
    assert.ok(card[field]?.en?.trim()&&card[field]?.fr?.trim(),id+" needs substantive bilingual "+field);
  }
  assert.ok(card.sources.length,id+" requires source citation");
}
const card=id=>calendarCustomArticle(id);
assert.doesNotMatch(card("XMAS-001").description.fr,/hostie de pain/);
assert.match(card("XMAS-001").description.fr,/pain azyme non consacré/);
assert.match(card("XMAS-001").scope.fr,/à l'étranger/);
assert.match(card("XMAS-001").practice.en,/prayer of thanksgiving/);
assert.match(card("BLSS-002").scope.fr,/germanophone/);
assert.match(card("BLSS-003").scope.fr,/selon les paroisses/);
assert.match(card("BLSS-004").scope.fr,/régionales/);
assert.match(card("BLSS-001").scope.fr,/ancien Rituel romain/);
for(const id of ["BLSS-001","BLSS-002","BLSS-003","BLSS-004"])
  assert.doesNotMatch(card(id).scope.en,/^International devotional practice$/);
assert.match(card("SJOS-001").scope.fr,/origine sicilienne/);
assert.match(card("NDAY-001").scope.fr,/sans être réservée aux États-Unis/);
assert.match(card("DEAD-003").scope.fr,/calendrier liturgique romain/);
assert.match(card("DOM-003").scope.fr,/nord-américain/);
assert.match(card("DOM-011").caution.fr,/auprès des défunts/);
assert.match(card("SCHR-001").description.fr,/19 juillet/);
assert.match(card("SNIC-001").history.fr,/2024/);
assert.match(card("SNIC-001").scope.fr,/Alsace et Lorraine/);
assert.match(card("SNIC-001").caution.fr,/mises en scène effrayantes/);
assert.match(card("SNIC-001").supporting_sources[0].url,/metz\.catholique\.fr/);
assert.match(card("PATR-001").history.fr,/dimanche suivant l'Ascension/);
assert.match(card("PATR-001").history.en,/procession carrying relics/);
const f=folios.entries.find(x=>x.custom_id==="PATR-001");
assert.equal(f.history_en,card("PATR-001").history.en);
assert.equal(f.history_fr,card("PATR-001").history.fr);
assert.equal(seed.customs.filter(c=>c.publication_state==="CONTEXT_ONLY").length,3);
const acceptedFrench=JSON.parse(readFileSync(new URL("../data/customs/customs-fr-canonical-copy.v1.json",import.meta.url),"utf8"));
assert.equal(acceptedFrench.entries.length,27);
assert.deepEqual(new Set(acceptedFrench.entries.filter(x=>!CALENDAR_CUSTOM_ARTICLE_IDS.includes(x.custom_id)).map(x=>x.custom_id)),new Set(["DEV-007","BELL-004","FOOD-001"]));
const equivalent=(card,path)=>path.split(".").reduce((obj,key)=>obj?.[key],card);
for(const row of acceptedFrench.entries){
  const article=calendarCustomArticle(row.custom_id);
  if(!article)continue; // Three context-only historical identities remain intentionally unpublished.
  for(const [field,path] of [["title_fr","title.fr"],["description_fr","description.fr"],["caution_fr","caution.fr"]])
    assert.equal(row[field],equivalent(article,path),row.custom_id+" French canonical owner drift in "+field);
}
let guidanceTotal=0;
for(const path of ["data/customs/customs-p0-guidance-en-fr.v1.json","data/customs/customs-p1-guidance-en-fr.v1.json"]){
  const guidance=JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
  for(const row of guidance.entries){
    guidanceTotal++;
    const article=calendarCustomArticle(row.custom_id);
    assert.ok(article,row.custom_id+" missing published Calendar article");
    assert.equal(row.review_status,"CANONICAL_ID_PUBLISHED_IN_MAIN");
    for(const [field,destination] of [
      ["title_en","title.en"],["title_fr","title.fr"],
      ["description_en","description.en"],["description_fr","description.fr"],
      ["meaning_en","meaning.en"],["meaning_fr","meaning.fr"],
      ["how_en","practice.en"],["how_fr","practice.fr"],
      ["caution_fr","caution.fr"],["scope_en","scope.en"],["scope_fr","scope.fr"]
    ]) if(row[field]!=null)
      assert.equal(row[field],equivalent(article,destination),row.custom_id+" obsolete supporting copy "+field);
  }
}
assert.equal(guidanceTotal,11);
assert.equal(card("XMAS-001").description.fr.includes("hostie de pain"),false);
console.log("PASS: 35 approved customs retain bilingual copy; regional and sacramental claims have precise scope, Chantelle historical copy is synchronized");
