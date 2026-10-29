import test from "node:test";
import assert from "node:assert/strict";
import {DIVINUM_OFFICIUM_PIN} from "../src/app/source-transport-compat.js";
import {collateAllSaintsVespersTranslation,VESPERS_TRANSLATION_PILOTS}
 from "../src/office/vespers-translation-collation.js";
const make=(date,language,text)=>({
  schema:"ao.office.source-cells.v1",date,hour:"VESPERS",
  language,sourceRevision:DIVINUM_OFFICIUM_PIN,
  status:"STRUCTURED_UNVERIFIED",publishable:false,
  sections:[{index:9,sourceIndex:9,sourceCellId:"Vespera9",
    semantic:{role:"PRAYER"},text}]
});
test("EN and FR dated source incipits are distinguished and confined to the commemoration",()=>{
  for(const [date,locales] of Object.entries(VESPERS_TRANSLATION_PILOTS))
    for(const [language,phrases] of Object.entries(locales)){
      const text=["Oratio Omnium Sanctorum.","Commemoration of Sunday",
        phrases.antiphon+".", "℣. A Vespers verse.", "℟. Its response.",
        "Oremus.",phrases.collect+"."].join("\n");
      const r=collateAllSaintsVespersTranslation(make(date,language,text));
      assert.equal(r.boundedSectionLocated,true);
      assert.equal(r.antiphonSourceIncipitMatched,true);
      assert.equal(r.sundayCollectSourceIncipitMatched,true);
      assert.equal(r.componentOrderMatched,true);
      assert.equal(r.verseAndResponseVernacularCollated,false);
      assert.equal(r.translationPublicationAuthorized,false);
      assert.equal(r.independentPrintedTranslationCertified,false);
      assert.equal(r.published,0);
    }
});
test("missing or multiple headings, previous-feast incipits, wrong order fail closed",()=>{
  const date="2026-10-31",language="fr",p=VESPERS_TRANSLATION_PILOTS[date][language];
  const cases=[
    ["No heading\n"+p.antiphon+"\n"+p.collect,false,false],
    ["Commemoration du dimanche\nNo matching text.",false,false],
    [p.antiphon+"\n"+p.collect+"\nCommemoration du dimanche\nOther.",false,false],
    ["Commemoration du dimanche\n"+p.collect+"\n"+p.antiphon,true,false],
    ["Commemoration\n"+p.antiphon+"\n"+p.collect+"\nCommemoration\nrepeat",false,false],
  ];
  for(const [body,antMatched,ordered] of cases){
    const r=collateAllSaintsVespersTranslation(make(date,language,body));
    assert.equal(r.antiphonSourceIncipitMatched,antMatched,body);
    assert.equal(r.componentOrderMatched,ordered,body);
    assert.equal(r.translationPublicationAuthorized,false);
  }
  assert.throws(()=>collateAllSaintsVespersTranslation({
    ...make(date,language,"Commemoration\n"+p.antiphon),publishable:true
  }),/PIN_OR_CONTEXT_INVALID/);
  assert.throws(()=>collateAllSaintsVespersTranslation(make("2028-11-01",language,p.antiphon)),
    /PIN_OR_CONTEXT_INVALID/);
});
