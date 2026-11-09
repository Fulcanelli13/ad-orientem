import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {dykPublishedCandidates,dykPublishedPick,dykPublishedModel,dykPublishedMarkup,dykHistoricalCandidates,dykHistoricalModel,dykWeiser16Candidates,dykWeiser16Model,dykWeiserSecond16Candidates,dykWeiserSecond16Model,dykMixed24Candidates,dykMixed24Model,dyk125Candidates,dyk125Model,dyk150Candidates,dyk150Model,dyk175Candidates,dyk175Model,dyk200Candidates,dyk200Model,dyk225Candidates,dyk225Model,dykHomeRotationSlot,DYK_GLOSSARY_FALLBACK_IDS} from "../src/home/dyk-published-feed.js";
const original=JSON.parse(readFileSync(
 "data/research/did-you-know/dyk-r34-high-signal-24-editorial-selection.v1.json","utf8"));
import {HOME_DYK_GLOSSARY_IDS,HOME_DYK_GLOSSARY_FACTS,homeDidYouKnowSelect} from "../src/home/did-you-know-glossary.js";
const clone=x=>JSON.parse(JSON.stringify(x));

const history=JSON.parse(readFileSync(
 "data/did-you-know/weiser-historical-20-publication.v1.json","utf8"));
const histRows=dykHistoricalCandidates(history,"2026-11-08");
assert.equal(histRows.length,20,"All 20 historically scoped bilingual facts must pass release gates");
assert.equal(new Set(histRows.map(x=>x.id)).size,20);
assert.equal(new Set(histRows.map(x=>x.source_id)).size,20);
for(const row of histRows){
 assert.ok(row.pilot_home_copy.en.length>25&&row.pilot_home_copy.fr.length>25);
 assert.equal(row.historical_local_only,true);
 assert.equal(row.source.original_image_checked,true);
 assert.equal(row.semantic_novelty_reviewed,true);
 assert.equal(row.source.source_record_id,row.source_id);
 assert.ok(row.source.pdf_pages_1based.every(p=>Number.isInteger(p)&&p>0&&p<=384));
 const model=dykHistoricalModel(history,row.id,"2026-11-08","fr");
 assert.equal(model.fact,row.pilot_home_copy.fr);
 assert.ok(dykPublishedMarkup(model).includes("data-dyk-published"));
 assert.ok(dykPublishedMarkup(model).includes("#page="));
}
assert.deepEqual(dykHistoricalCandidates({...history,release_stage:"RESEARCH_ONLY"},"2026-11-08"),[]);
for(const property of ["editorial_approval","release_authorized","semantic_novelty_reviewed","historical_local_only"]){
 const tampered=clone(history);tampered.records[0][property]=false;
 assert.equal(dykHistoricalCandidates(tampered,"2026-11-08").length,19,
  "No publication when "+property+" is withheld");
}
for(const property of ["original_image_checked","deep_link_checked"]){
 const tampered=clone(history);tampered.records[0].source[property]=false;
 assert.equal(dykHistoricalCandidates(tampered,"2026-11-08").length,19,
  "No publication when "+property+" is withheld");
}
assert.equal(dykHistoricalCandidates(history,"2026-11-31").length,0);

const r50=JSON.parse(readFileSync(
 "data/did-you-know/weiser-r50-sixteen-publication.v1.json","utf8"));
const r50Rows=dykWeiser16Candidates(r50,"2026-11-08");
assert.equal(r50Rows.length,16,"All sixteen reviewed Weiser R50 facts must pass source gates");
assert.equal(new Set(r50Rows.map(x=>x.id)).size,16);
assert.equal(new Set(r50Rows.map(x=>x.source_id)).size,16);
assert.equal(new Set([...histRows,...r50Rows].map(x=>x.id)).size,36);
assert.equal(new Set([...histRows,...r50Rows].map(x=>x.source_id)).size,36,
 "No two released historical facts may claim the same original source record");
for(const row of r50Rows){
 assert.ok(row.pilot_home_copy.en.length>25&&row.pilot_home_copy.fr.length>25);
 assert.equal(row.source.original_image_checked,true);
 assert.equal(row.source.source_record_id,row.source_id);
 assert.equal(row.historical_local_only,true);
 assert.equal(row.source.pdf_pages_1based.length,row.source.printed_pages.length);
 assert.ok(row.source.printed_pages.every((p,i)=>row.source.pdf_pages_1based[i]===p+18));
 const model=dykWeiser16Model(r50,row.id,"2026-11-08","fr");
 assert.equal(model.fact,row.pilot_home_copy.fr);
 assert.ok(dykPublishedMarkup(model).includes("data-dyk-published"));
 assert.ok(dykPublishedMarkup(model).includes("#page="));
}
assert.deepEqual(dykWeiser16Candidates({...r50,release_stage:"RESEARCH_ONLY"},"2026-11-08"),[]);
assert.deepEqual(dykWeiser16Candidates(r50,"2026-11-31"),[]);
for(const [group,key] of [
 ["row","editorial_approval"],["row","release_authorized"],
 ["row","semantic_novelty_reviewed"],["row","historical_local_only"],
 ["copy","final_english_signoff"],["copy","final_french_signoff"],
 ["source","original_image_checked"],["source","deep_link_checked"]]){
 const damaged=clone(r50),row=damaged.records[0];
 if(group==="row")row[key]=false;
 else if(group==="copy")row.pilot_home_copy[key]=false;
 else row.source[key]=false;
 assert.equal(dykWeiser16Candidates(damaged,"2026-11-08").length,15,
  "Unapproved R50 record must be excluded: "+group+"."+key);
}
const wrongPage=clone(r50);wrongPage.records[0].source.pdf_pages_1based[0]++;
assert.equal(dykWeiser16Candidates(wrongPage,"2026-11-08").length,15,
 "Wrong original printed-page to PDF-page mapping must fail closed");

const r50b=JSON.parse(readFileSync(
 "data/did-you-know/weiser-r50-second-sixteen-publication.v1.json","utf8"));
const r50bRows=dykWeiserSecond16Candidates(r50b,"2026-11-08");
assert.equal(r50bRows.length,16,"New second sixteen Weiser records must pass the explicit release gate");
assert.equal(new Set([...histRows,...r50Rows,...r50bRows].map(x=>x.id)).size,52);
assert.equal(new Set([...histRows,...r50Rows,...r50bRows].map(x=>x.source_id)).size,52,
 "All historical source identifiers must remain globally unique");
for(const row of r50bRows){
 assert.ok(row.pilot_home_copy.en.length>25&&row.pilot_home_copy.fr.length>25);
 assert.equal(row.historical_local_only,true);
 assert.equal(row.source.original_image_checked,true);
 assert.equal(row.source.deep_link_checked,true);
 assert.equal(row.source.source_record_id,row.source_id);
 assert.ok(row.source.printed_pages.every((pg,i)=>row.source.pdf_pages_1based[i]===pg+18));
 const model=dykWeiserSecond16Model(r50b,row.id,"2026-11-08","fr");
 assert.equal(model.fact,row.pilot_home_copy.fr);
 assert.ok(dykPublishedMarkup(model).includes("#page="));
}
assert.deepEqual(dykWeiserSecond16Candidates({...r50b,release_stage:"RESEARCH_ONLY"},"2026-11-08"),[]);
assert.deepEqual(dykWeiserSecond16Candidates(r50b,"2026-11-31"),[]);
for(const [group,key] of [
 ["row","editorial_approval"],["row","release_authorized"],
 ["row","semantic_novelty_reviewed"],["row","historical_local_only"],["row","published"],
 ["copy","final_english_signoff"],["copy","final_french_signoff"],
 ["source","original_image_checked"],["source","deep_link_checked"]]){
 const damaged=clone(r50b),row=damaged.records[0];
 if(group==="row")row[key]=false;
 else if(group==="copy")row.pilot_home_copy[key]=false;
 else row.source[key]=false;
 assert.equal(dykWeiserSecond16Candidates(damaged,"2026-11-08").length,15,
  "Unapproved R50B record must be excluded: "+group+"."+key);
}
const r50bWrongPage=clone(r50b);
r50bWrongPage.records[0].source.pdf_pages_1based[0]++;
assert.equal(dykWeiserSecond16Candidates(r50bWrongPage,"2026-11-08").length,15);

const h100=JSON.parse(readFileSync(
 "data/did-you-know/dyk-h100-pitre-ritus-24-publication.v1.json","utf8"));
const h100Rows=dykMixed24Candidates(h100,"2026-11-08");
assert.equal(h100Rows.length,24,"100-fact release requires all 12 Pitrè and all 12 Ritus records");
assert.equal(h100Rows.filter(row=>row.source_family==="PITRE_1900").length,12);
assert.equal(h100Rows.filter(row=>row.source_family==="ROMAN_MASS_1962").length,12);
const releasedAll=[...histRows,...r50Rows,...r50bRows,...h100Rows];
assert.equal(releasedAll.length,76);
assert.equal(new Set(releasedAll.map(row=>row.id)).size,76);
assert.equal(new Set(releasedAll.map(row=>row.source_id)).size,76);
for(const row of h100Rows){
 const model=dykMixed24Model(h100,row.id,"2026-11-08","fr");
 assert.equal(model.fact,row.pilot_home_copy.fr);
 assert.ok(dykPublishedMarkup(model).includes("#page="+row.source.pdf_pages_1based[0]));
 assert.equal(row.source.original_image_checked,true);
 assert.equal(row.source.source_record_id,row.source_id);
 assert.ok(row.pilot_home_copy.en.length>30&&row.pilot_home_copy.fr.length>30);
 if(row.source_family==="PITRE_1900"){
  assert.equal(row.historical_local_only,true);
  assert.ok(row.source.original_italian_anchor.length>4);
  assert.ok(row.source.pdf_pages_1based[0]!==row.source.printed_pages[0],
   "Pitrè uses reconciled original print/scan offsets");
 }else{
  assert.equal(row.liturgical_rubric_1962,true);
  assert.ok(row.source.printed_pages.every((p,i)=>row.source.pdf_pages_1based[i]===p));
 }
}
assert.deepEqual(dykMixed24Candidates({...h100,release_stage:"RESEARCH_ONLY"},"2026-11-08"),[]);
assert.deepEqual(dykMixed24Candidates(h100,"2026-11-31"),[]);
for(const [group,key] of [
 ["row","editorial_approval"],["row","release_authorized"],
 ["row","semantic_novelty_reviewed"],["row","published"],
 ["copy","final_english_signoff"],["copy","final_french_signoff"],
 ["source","original_image_checked"],["source","deep_link_checked"]]){
 const damaged=clone(h100);const row=damaged.records[0];
 if(group==="row")row[key]=false;
 else if(group==="copy")row.pilot_home_copy[key]=false;
 else row.source[key]=false;
 assert.equal(dykMixed24Candidates(damaged,"2026-11-08").length,23,
  "Private or unsigned H100 fact must not publish: "+group+"."+key);
}
const malformedPitre=clone(h100);
malformedPitre.records[0].source.url="https://invalid.example/other.pdf";
assert.equal(dykMixed24Candidates(malformedPitre,"2026-11-08").length,23);
const malformedRitus=clone(h100);
malformedRitus.records[12].source.pdf_pages_1based[0]=99;
assert.equal(dykMixed24Candidates(malformedRitus,"2026-11-08").length,23);
const changedFamily=clone(h100);
changedFamily.records[12].source_family="PITRE_1900";
assert.equal(dykMixed24Candidates(changedFamily,"2026-11-08").length,23);

const h125=JSON.parse(readFileSync(
 "data/did-you-know/dyk-h125-multisource-25-publication.v1.json","utf8"));
const h125Rows=dyk125Candidates(h125,"2026-11-08");
assert.equal(h125Rows.length,25,"All 25 new source-scoped discoveries must be authorized");
assert.equal(h125Rows.filter(x=>x.source_family==="PITRE_1900").length,12);
assert.equal(h125Rows.filter(x=>x.source_family==="ROMAN_MASS_1962").length,8);
assert.equal(h125Rows.filter(x=>!["PITRE_1900","ROMAN_MASS_1962"].includes(x.source_family)).length,5);
const all125=[...releasedAll,...h125Rows];
assert.equal(all125.length,101,"101 released discoveries plus 24 Glossary = 125");
assert.equal(new Set(all125.map(x=>x.id)).size,101);
assert.equal(new Set(all125.map(x=>x.source_id)).size,101,"Every source record remains unique");
for(const row of h125Rows){
 for(const lang of ["en","fr"]){
  const model=dyk125Model(h125,row.id,"2026-11-08",lang);
  assert.equal(model.fact,row.pilot_home_copy[lang]);
  assert.ok(dykPublishedMarkup(model).includes("data-dyk-published"));
  if(row.source.type==="pdf"){
   assert.ok(model.links.every(x=>Number.isInteger(x.page)&&x.url.includes("#page=")));
   assert.ok(dykPublishedMarkup(model).includes("PDF p. ")||
       dykPublishedMarkup(model).includes("PDF p. "));
  }else{
   assert.equal(model.links.length,1);
   assert.equal(model.links[0].page,null);
   assert.equal(model.links[0].url,model.sourceUrl);
   assert.ok(dykPublishedMarkup(model).includes(lang==="fr"?"Ouvrir la section":"Open cited source"));
  }
 }
 assert.equal(row.source.source_record_id,row.source_id);
 assert.equal(row.release_authorized,true);
}
assert.deepEqual(dyk125Candidates({...h125,release_stage:"RESEARCH_ONLY"},"2026-11-08"),[]);
assert.deepEqual(dyk125Candidates(h125,"2026-11-31"),[]);
for(const [group,key] of [["row","editorial_approval"],["row","release_authorized"],
 ["row","semantic_novelty_reviewed"],["row","published"],
 ["copy","final_english_signoff"],["copy","final_french_signoff"],
 ["source","deep_link_checked"]]){
 const damaged=clone(h125),row=damaged.records[0];
 if(group==="row")row[key]=false;
 else if(group==="copy")row.pilot_home_copy[key]=false;
 else row.source[key]=false;
 assert.equal(dyk125Candidates(damaged,"2026-11-08").length,24,
  "An unsigned source cannot enter the live rotation: "+group+"."+key);
}
for(const [index,key,value] of [
 [0,"original_italian_anchor",""],[12,"primary_locator","Ritus servandus ?"],
 [20,"url","https://example.invalid/forged"],[24,"original_text_checked",false]]){
 const damaged=clone(h125);damaged.records[index].source[key]=value;
 assert.equal(dyk125Candidates(damaged,"2026-11-08").length,24,
   "Wrong original witness must fail closed");
}
const htmlModel=dyk125Model(h125,"DYK-H125-X-001","2026-11-08","en");
assert.ok(dykPublishedMarkup(htmlModel).includes("Open cited source section"));
const fakeHtml=clone(htmlModel);fakeHtml.links=[{page:null,url:"https://example.invalid",label:"Click"}];
assert.equal(dykPublishedMarkup(fakeHtml),"","Never substitute an arbitrary URL for exact source");

const h150=JSON.parse(readFileSync(
 "data/did-you-know/dyk-h150-originals-25-publication.v1.json","utf8"));
const h150Rows=dyk150Candidates(h150,"2026-11-08");
assert.equal(h150Rows.length,25,"All 25 H150 facts must satisfy publication gates");
for(const [family,n] of [
 ["PITRE_1900",8],["ROMAN_MASS_1962",8],
 ["RURAL_LIFE_PRAYERBOOK_1956",7],["ROMAN_GENERAL_RUBRICS_1962",2]]){
 assert.equal(h150Rows.filter(x=>x.source_family===family).length,n);
}
const all150=[...all125,...h150Rows];
assert.equal(all150.length,126,"150 facts: 24 Glossary + 126 released historical/rubrical");
assert.equal(new Set(all150.map(x=>x.id)).size,126);
assert.equal(new Set(all150.map(x=>x.source_id)).size,126);
for(const row of h150Rows){
 for(const lang of ["en","fr"]){
  const model=dyk150Model(h150,row.id,"2026-11-08",lang);
  assert.equal(model.fact,row.pilot_home_copy[lang]);
  const html=dykPublishedMarkup(model);
  assert.ok(html.includes("data-dyk-published"),"Source dialog should render");
  if(row.source.type==="pdf"){
   assert.ok(model.links.every(x=>Number.isInteger(x.page)&&x.url.endsWith("#page="+x.page)));
  }else{
   assert.equal(model.links.length,1);
   assert.equal(model.links[0].page,null);
   assert.equal(model.links[0].url,row.source.url);
   assert.ok(html.includes(lang==="fr"?"Consulter la section originale":"Read original source section"));
  }
 }
 assert.equal(row.source.source_record_id,row.source_id);
}
assert.deepEqual(dyk150Candidates({...h150,release_stage:"RESEARCH_ONLY"},"2026-11-08"),[]);
assert.deepEqual(dyk150Candidates(h150,"2026-11-31"),[]);
for(const [group,key] of [
 ["row","editorial_approval"],["row","release_authorized"],
 ["row","semantic_novelty_reviewed"],["row","published"],
 ["copy","final_english_signoff"],["copy","final_french_signoff"],
 ["source","deep_link_checked"]]){
 const damaged=clone(h150),row=damaged.records[0];
 if(group==="row")row[key]=false;
 else if(group==="copy")row.pilot_home_copy[key]=false;
 else row.source[key]=false;
 assert.equal(dyk150Candidates(damaged,"2026-11-08").length,24,
   "H150 private/unsigned source must be excluded: "+group+"."+key);
}
const badPitre=clone(h150);badPitre.records[0].source.pdf_pages_1based=[1];
assert.equal(dyk150Candidates(badPitre,"2026-11-08").length,24);
const badRitus=clone(h150);badRitus.records[8].source.pdf_pages_1based=[92];
assert.equal(dyk150Candidates(badRitus,"2026-11-08").length,24);
const badBook=clone(h150);badBook.records[16].source.url="https://invalid.example/foo";
assert.equal(dyk150Candidates(badBook,"2026-11-08").length,24);
const badCalendar=clone(h150);badCalendar.records[23].source.pdf_pages_1based=[90];
assert.equal(dyk150Candidates(badCalendar,"2026-11-08").length,24);

const h175=JSON.parse(readFileSync(
 "data/did-you-know/dyk-h175-multisource-25-publication.v1.json","utf8"));
const h175Rows=dyk175Candidates(h175,"2026-11-08");
assert.equal(h175Rows.length,25,"Every H175 source and bilingual release gate must pass");
for(const [family,count] of [
 ["PITRE_1900",3],["RURAL_LIFE_PRAYERBOOK_1956",14],["ROMAN_MASS_1962",8]]){
 assert.equal(h175Rows.filter(x=>x.source_family===family).length,count);
}
const all175=[...all150,...h175Rows];
assert.equal(all175.length,151,"175 facts: 24 Glossary and 151 individually released");
assert.equal(new Set(all175.map(x=>x.id)).size,151);
assert.equal(new Set(all175.map(x=>x.source_id)).size,151,
 "Do not reissue a source ID from a prior release");
for(const row of h175Rows){
 for(const lang of ["en","fr"]){
  const model=dyk175Model(h175,row.id,"2026-11-08",lang);
  assert.equal(model.fact,row.pilot_home_copy[lang]);
  const html=dykPublishedMarkup(model);
  assert.ok(html.includes("data-dyk-published"));
  if(row.source.type==="pdf"){
   assert.ok(model.links.every(x=>Number.isInteger(x.page)&&x.url.endsWith("#page="+x.page)));
  }else{
   assert.equal(model.links[0].page,null);
   assert.equal(model.links[0].url,row.source.url);
   assert.ok(html.includes(lang==="fr"?"Lire la bénédiction originale":"Read original blessing"));
  }
 }
 assert.equal(row.source.source_record_id,row.source_id);
}
assert.deepEqual(dyk175Candidates({...h175,release_stage:"RESEARCH_ONLY"},"2026-11-08"),[]);
assert.deepEqual(dyk175Candidates(h175,"2026-11-31"),[]);
for(const [group,key] of [["row","editorial_approval"],["row","release_authorized"],
 ["row","semantic_novelty_reviewed"],["row","published"],
 ["copy","final_english_signoff"],["copy","final_french_signoff"],
 ["source","deep_link_checked"]]){
 const broken=clone(h175),row=broken.records[0];
 if(group==="row")row[key]=false;
 else if(group==="copy")row.pilot_home_copy[key]=false;
 else row.source[key]=false;
 assert.equal(dyk175Candidates(broken,"2026-11-08").length,24,
  "No unsigned/research item should reach the public Home: "+key);
}
const badPitre175=clone(h175);badPitre175.records[0].source.pdf_pages_1based=[1];
assert.equal(dyk175Candidates(badPitre175,"2026-11-08").length,24);
const badRural175=clone(h175);badRural175.records[3].source.url="https://example.invalid/blessing";
assert.equal(dyk175Candidates(badRural175,"2026-11-08").length,24);
const badRitus175=clone(h175);badRitus175.records[17].source.pdf_pages_1based=[90];
assert.equal(dyk175Candidates(badRitus175,"2026-11-08").length,24);








const h200=JSON.parse(readFileSync(
 "data/did-you-know/dyk-h200-three-sources-25-publication.v1.json","utf8"));
const h200Rows=dyk200Candidates(h200,"2026-11-08");
assert.equal(h200Rows.length,25,"Every H200 source, language and publication gate must pass");
for(const [family,count] of [["CATHOLIC_ENCYCLOPEDIA_HISTORICAL",8],
 ["RURAL_LIFE_PRAYERBOOK_1956",10],["ROMAN_MASS_1962",7]]){
 assert.equal(h200Rows.filter(x=>x.source_family===family).length,count);
}
const all200=[...all175,...h200Rows];
assert.equal(all200.length,176,"200 facts = 24 Glossary + 176 individually released");
assert.equal(new Set(all200.map(x=>x.id)).size,176);
assert.equal(new Set(all200.map(x=>x.source_id)).size,176,"H200 source IDs must not repeat earlier releases");
const previouslyPublishedEnglish=new Set(all175.map(x=>x.pilot_home_copy.en.trim().toLowerCase()));
for(const row of h200Rows){
 assert.ok(!previouslyPublishedEnglish.has(row.pilot_home_copy.en.trim().toLowerCase()));
 for(const language of ["en","fr"]){
  const model=dyk200Model(h200,row.id,"2026-11-08",language);
  assert.equal(model.fact,row.pilot_home_copy[language]);
  const html=dykPublishedMarkup(model);
  assert.ok(html.includes("data-dyk-published"));
  assert.equal(model.links.length,1);
  if(row.source.type==="pdf"){
   assert.equal(model.links[0].url,row.source.url+"#page="+row.source.pdf_pages_1based[0]);
  }else{
   assert.equal(model.links[0].page,null);
   assert.equal(model.links[0].url,row.source.url);
   assert.equal(model.links[0].label,language==="fr"?"Consulter l'article ou la section":"Read original article or section");
   assert.ok(html.includes(language==="fr"?"Consulter l&#39;article ou la section":"Read original article or section"),"Source dialog escapes the French apostrophe");
  }
 }
 assert.equal(row.source.source_record_id,row.source_id);
}
assert.deepEqual(dyk200Candidates({...h200,release_stage:"RESEARCH_ONLY"},"2026-11-08"),[]);
assert.deepEqual(dyk200Candidates(h200,"2026-11-31"),[]);
assert.deepEqual(dyk200Candidates(h200,"2026-99-99"),[]);
for(const [group,key] of [["row","editorial_approval"],["row","release_authorized"],
 ["row","semantic_novelty_reviewed"],["row","published"],
 ["copy","final_english_signoff"],["copy","final_french_signoff"],
 ["source","deep_link_checked"]]){
 const broken=clone(h200),row=broken.records[0];
 if(group==="row")row[key]=false;
 else if(group==="copy")row.pilot_home_copy[key]=false;
 else row.source[key]=false;
 assert.equal(dyk200Candidates(broken,"2026-11-08").length,24,
  "Unapproved H200 record must never publish: "+group+"."+key);
}
for(const [index,key,value] of [
 [0,"url","https://invalid.example/fake"],[8,"original_text_checked",false],
 [18,"pdf_pages_1based",[90]],[18,"supporting_event_ids",[]]]){
 const broken=clone(h200);broken.records[index].source[key]=value;
 assert.equal(dyk200Candidates(broken,"2026-11-08").length,24,
  "Misattributed H200 source or unsupported 1962 rubric must fail closed: "+key);
}


// H225: historical local rites across eight geographically distinct traditions.
// No contemporary Roman-1962 rubric can be inferred from these period descriptions.
const h225=JSON.parse(readFileSync(
 "data/did-you-know/dyk-h225-world-liturgies-25-publication.v1.json","utf8"));
const h225Rows=dyk225Candidates(h225,"2026-11-09");
assert.equal(h225Rows.length,25,"H225 25 historical source/locale approval gates");
for(const [tradition,count] of [["AMBROSIAN",4],["MOZARABIC",4],
 ["DOMINICAN",4],["CARTHUSIAN",3],["MARONITE",3],
 ["EAST_SYRIAN",2],["ARMENIAN",3],["CELTIC",2]]){
 assert.equal(h225Rows.filter(r=>r.tradition===tradition).length,count);
}
const all225=[...all200,...h225Rows];
assert.equal(all225.length,201,"225 facts = 24 source-owned Glossary + 201 individual releases");
assert.equal(new Set(all225.map(r=>r.id)).size,201);
assert.equal(new Set(all225.map(r=>r.source_id)).size,201);
const oldFactTexts=new Set(all200.map(r=>r.pilot_home_copy.en.trim().toLowerCase()));
for(const row of h225Rows){
 assert.ok(!oldFactTexts.has(row.pilot_home_copy.en.trim().toLowerCase()),"Duplicate published copy");
 assert.equal(row.liturgical_rubric_1962,false);
 assert.equal(row.source.source_record_id,row.source_id);
 assert.match(row.region_scope,/1962/);
 for(const language of ["en","fr"]){
  const model=dyk225Model(h225,row.id,"2026-11-09",language);
  assert.equal(model.fact,row.pilot_home_copy[language]);
  assert.equal(model.links.length,1);
  assert.equal(model.links[0].page,null);
  assert.equal(model.links[0].url,row.source.url);
  assert.ok(dykPublishedMarkup(model).includes("data-dyk-published"));
  assert.ok(dykPublishedMarkup(model).includes(language==="fr"?
   "Consulter l&#39;article historique":"Read historical source article"));
 }
}
assert.deepEqual(dyk225Candidates({...h225,release_stage:"RESEARCH_ONLY"},"2026-11-09"),[]);
assert.deepEqual(dyk225Candidates(h225,"2026-11-31"),[]);
assert.deepEqual(dyk225Candidates(h225,"2026-99-99"),[]);
for(const [category,key] of [["row","editorial_approval"],["row","release_authorized"],
 ["row","semantic_novelty_reviewed"],["row","published"],
 ["copy","final_english_signoff"],["copy","final_french_signoff"],
 ["source","original_text_checked"],["source","deep_link_checked"]]){
 const bad=clone(h225),row=bad.records[0];
 if(category==="row")row[key]=false;
 else if(category==="copy")row.pilot_home_copy[key]=false;
 else row.source[key]=false;
 assert.equal(dyk225Candidates(bad,"2026-11-09").length,24,
  "Unapproved or unsupported H225 record must fail closed: "+category+"."+key);
}
for(const [index,field,value] of [
 [0,"url","https://invalid.example/fake"],
 [5,"primary_locator","Catholic Encyclopedia: Wrong history"],
 [8,"source_record_id","CE1912.H225.TAMPERED"],
 [24,"pdf_pages_1based",[2]]
]){
 const bad=clone(h225);bad.records[index].source[field]=value;
 assert.equal(dyk225Candidates(bad,"2026-11-09").length,24,"H225 source falsification blocked");
}
for(const [field,value] of [["historical_local_only",false],
 ["liturgical_rubric_1962",true],["source_family","ROMAN_MASS_1962"]]){
 const bad=clone(h225);bad.records[0][field]=value;
 assert.equal(dyk225Candidates(bad,"2026-11-09").length,24,
  "Historic observation cannot be reclassified as a Roman rubric");
}

// Every new public teaser must resolve to an existing source-backed bilingual
// Glossary entry and must never silently expose draft research as public copy.
const gloss=JSON.parse(readFileSync("data/glossary/concepts-151-300.v1.json","utf8"));
assert.equal(HOME_DYK_GLOSSARY_IDS.length,24);
assert.equal(new Set(HOME_DYK_GLOSSARY_IDS).size,24);
assert.deepEqual(new Set(Object.keys(HOME_DYK_GLOSSARY_FACTS)),new Set(HOME_DYK_GLOSSARY_IDS));
for(const id of HOME_DYK_GLOSSARY_IDS){
 const source=gloss.entries.find(row=>row.id===id);
 assert.ok(source,"Missing canonical source "+id);
 assert.equal(source.status,"SOURCE_OWNER_LOCKED");
 assert.equal(source.definition_status,"SOURCE_BACKED");
 assert.ok(source.source_ids.length>0);
 assert.ok(HOME_DYK_GLOSSARY_FACTS[id].en.length>25);
 assert.ok(HOME_DYK_GLOSSARY_FACTS[id].fr.length>25);
 assert.equal(homeDidYouKnowSelect(gloss.entries,"2026-11-08",id)?.id,id);
}

for(const date of ["2026-11-01","2026-11-02","2026-12-25","2027-04-04"]){
 assert.deepEqual(dykPublishedCandidates(original,date),[],"Unapproved R34 must never publish");
 assert.equal(dykPublishedPick(original,date),null);
}
assert.deepEqual(dykPublishedCandidates({}, "2026-11-02"),[]);
assert.deepEqual(dykPublishedCandidates(original, "2026-11-31"),[]);
const data=clone(original),row=data.records.find(x=>x.id==="DYK-UM02-014");
data.publication_stage="APPROVED_PARTIAL_LIVE";
row.publication_days=["2026-11-02"];
row.editorial_approval=true;row.release_authorized=true;
row.pilot_home_copy.final_english_signoff=true;
row.pilot_home_copy.final_french_signoff=true;
row.priority_lexical_screen.manual_semantic_novelty_approved=true;
row.pilot_destination_audit.publishable_deep_link=true;
row.pilot_destination_audit.exact_in_app_route_verified=true;
row.pilot_source_folio.link_browser_verified=true;
assert.equal(dykPublishedCandidates(data,"2026-11-02").length,1,
  "All gates together, including exact date, can publish one fact");
assert.equal(dykPublishedCandidates(data,"2026-11-01").length,0,
  "A November 2-only custom must not be treated as an undated rotation");
const model=dykPublishedModel(data,row.id,"2026-11-02","fr");
assert.equal(model.fact,row.pilot_home_copy.fr);
assert.equal(model.links[0].page,331);
assert.ok(dykPublishedMarkup(model).includes("data-dyk-published"));
assert.ok(dykPublishedMarkup(model).includes("#page=331"));
assert.equal(dykPublishedMarkup({...model,sourceUrl:"javascript:alert(1)"}),"");
for(const path of [
 ["publication_stage","MISSING"],["editorial_approval",false],
 ["release_authorized",false],["pilot_home_copy.final_english_signoff",false],
 ["pilot_home_copy.final_french_signoff",false],
 ["priority_lexical_screen.manual_semantic_novelty_approved",false],
 ["pilot_destination_audit.publishable_deep_link",false],
 ["pilot_destination_audit.exact_in_app_route_verified",false],
 ["pilot_source_folio.link_browser_verified",false],
 ["publication_days",[]]]){
 const broken=clone(data);let target=broken;
 const key=path[0].split(".");
 if(path[0]!=="publication_stage")target=broken.records.find(x=>x.id===row.id);
 for(const part of key.slice(0,-1))target=target[part];
 target[key.at(-1)]=path[1];
 assert.equal(dykPublishedCandidates(broken,"2026-11-02").length,0,
   "Must fail closed when "+path[0]+" is missing or false");
}
const tampered=clone(data);
tampered.records.find(x=>x.id===row.id).pilot_source_folio.url="javascript:alert(1)";
assert.deepEqual(dykPublishedCandidates(tampered,"2026-11-02"),[]);
const item=clone(original);
assert.equal(item.records.filter(x=>x.release_authorized===true).length,0,
 "Read-only source master must not be silently promoted by the selector");

// With no new approved facts the fallback itself receives a fair, non-repeating
// daily shuffle. The mixed pool must rotate once through every entry per cycle.
function alignedDates(size,cycles=1){
 const today=Math.floor(Date.UTC(2026,10,8)/86400000);
 const start=today-(today%size);
 return Array.from({length:size*cycles},(_,i)=>
   new Date((start+i)*86400000).toISOString().slice(0,10));
}
for(const [published,poolSize] of [
 [[],DYK_GLOSSARY_FALLBACK_IDS.length],
 [histRows.map(x=>x.id),DYK_GLOSSARY_FALLBACK_IDS.length+20],
 [[...histRows,...r50Rows].map(x=>x.id),DYK_GLOSSARY_FALLBACK_IDS.length+36],
 [[...histRows,...r50Rows,...r50bRows].map(x=>x.id),DYK_GLOSSARY_FALLBACK_IDS.length+52],
 [releasedAll.map(x=>x.id),100],
 [all125.map(x=>x.id),125],
 [all150.map(x=>x.id),150],
 [all175.map(x=>x.id),175],
  [all200.map(x=>x.id),200],
 [all225.map(x=>x.id),225],
 [["DYK-M04-CANON-021","DYK-M04-CANON-022","DYK-M04-CANON-047","DYK-M04-CANON-058"],DYK_GLOSSARY_FALLBACK_IDS.length+4]
]){
 const cycle=alignedDates(poolSize);
 const results=cycle.map(date=>dykHomeRotationSlot(date,published));
 assert.equal(new Set(results).size,poolSize,"No repeat before all eligible slots shown");
 assert.deepEqual(new Set(results),new Set([...published,...DYK_GLOSSARY_FALLBACK_IDS]));
 const nextCycle=alignedDates(poolSize,2).slice(poolSize).map(date=>dykHomeRotationSlot(date,published));
 assert.equal(new Set(nextCycle).size,poolSize,"Every slot gets one turn in each complete cycle");
 assert.notEqual(results.at(-1),nextCycle[0],"No immediate cycle-boundary repeat");
}
assert.equal(dykHomeRotationSlot("2026-11-31",[]),null);
assert.equal(dykHomeRotationSlot("2026-11-08",[],[]),null);
// The compiled 24-item R34 review selection is not a permanent six/24-item
// release ceiling. Adding staged *unapproved* rows cannot affect publication.
const expanded=clone(data);
expanded.records.push({id:"DYK-UNRELEASED-PLACEHOLDER",editorial_approval:false,release_authorized:false});
assert.equal(dykPublishedCandidates(expanded,"2026-11-02").length,1);

console.log("PASS H7 225-fact Discovery: 24 Glossary plus 201 approved EN/FR historical, cultural and rubrical facts, original R34 held, bilingual original-page links and nonrepeating rotation");
