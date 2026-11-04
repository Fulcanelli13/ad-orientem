import assert from "node:assert/strict";
import {renderEssentialFlowReader,ESSENTIAL_FLOW_READER_SCHEMA,essentialFlowReaderEnabled} from "../src/pray/essential-flow-reader.js";

import {test} from "node:test";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {ESSENTIAL_HOLY_CARD_IDS_V1,essentialHolyCardParts}
 from "../src/pray/essential-holy-card-parts.js";

const five=Object.freeze({
 foundations_sign_of_cross:1,
 foundations_our_father:6,
 foundations_hail_mary:3,
 foundations_glory_be:2,
 foundations_apostles_creed:9
});

test("Continuous reader requires explicit opt-in; original F01 remains default",()=>{
 assert.equal(essentialFlowReaderEnabled({location:{search:""}}),false);
 assert.equal(essentialFlowReaderEnabled({location:{search:"?aoPrayerPilot=1"}}),false);
 assert.equal(essentialFlowReaderEnabled({location:{search:"?aoEssentialFlow=0"}}),false);
 assert.equal(essentialFlowReaderEnabled({location:{search:"?aoEssentialFlow=1"}}),true);
 assert.equal(essentialFlowReaderEnabled({location:{search:"?aoEssentialFlow=1&aoPrayerPilot=0"}}),true);
 assert.equal(essentialFlowReaderEnabled({location:{search:"?aoEssentialFlow=unexpected"}}),false);
});

test("F01 entire 32-text corpus: exact EN/FR/LA faces, no fabricated translations",()=>{
 assert.equal(ESSENTIAL_HOLY_CARD_IDS_V1.length,32);
 assert.equal(new Set(ESSENTIAL_HOLY_CARD_IDS_V1).size,32);
 let faceCount=0,paragraphCount=0;
 for(const id of ESSENTIAL_HOLY_CARD_IDS_V1){
  const record=PRAY_CANONICAL_DATA_V435930.prayers[id];
  assert.ok(record,id+" missing canonical source");
  for(const language of ["en","fr","la"]){
   const original=record[language];
   if(!original){
    assert.equal(id,"marian_consecration_immaculate_heart",
     id+" unexpectedly lacks "+language+" (needs separate source audit)");
    assert.equal(essentialHolyCardParts(id,language,original),null);
    continue;
   }
   faceCount++;
   const parts=essentialHolyCardParts(id,language,original);
   assert.ok(parts&&parts.length,id+" "+language+" missing segmentation");
   paragraphCount+=parts.length;
   assert.equal(parts.map(part=>part.text).join(""),original,
    id+" "+language+" fails byte-exact reconstruction");
   assert.ok(parts.every(part=>part.text.trim().length>0&&!part.uncertified),
    id+" "+language+" has empty or uncertified focus segment");
   if(five[id])assert.equal(parts.length,five[id],
    id+" "+language+" original editorial clause map changed");
   if(original.length>220)assert.ok(parts.length>1,
    id+" "+language+" long source must not become a single text wall");
   if(id==="foundations_hail_mary"){
    assert.deepEqual(parts.map(x=>x.collective),[false,false,true]);
   }else assert.ok(parts.every(x=>!x.collective),
    id+" "+language+" invents collective roles");
  }
 }
 assert.equal(faceCount,94,"31 trilingual records + one source-only EN");
 assert.ok(paragraphCount>180,"All canonical prayers must have independently focusable sections");
});

test("F01 source change fails closed; unknown prayer IDs cannot activate Holy Card",()=>{
 const old="Unrecognised alternative complete witness.";
 const p=essentialHolyCardParts("foundations_hail_mary","en",old);
 assert.equal(p.length,1);
 assert.equal(p[0].text,old);
 assert.equal(p[0].uncertified,true);
 assert.equal(essentialHolyCardParts("not-a-card","en",old),null);
});

test("F01 exceptions: true V/R retained and source-only English not translated",()=>{
 for(const id of ["benediction_versicles","church_prayer_for_pope","sacrament_come_holy_spirit"]){
  const record=PRAY_CANONICAL_DATA_V435930.prayers[id];
  for(const language of ["en","fr","la"]){
   const text=record[language],parts=essentialHolyCardParts(id,language,text);
   assert.equal(parts.map(p=>p.text).join(""),text);
   assert.equal((parts.map(p=>p.text).join("").match(/℣/g)||[]).length,
    (text.match(/℣/g)||[]).length,"Source ℣ must remain authentic");
   assert.equal((parts.map(p=>p.text).join("").match(/℟/g)||[]).length,
    (text.match(/℟/g)||[]).length,"Source ℟ must remain authentic");
  }
 }
 const only=PRAY_CANONICAL_DATA_V435930.prayers.marian_consecration_immaculate_heart;
 assert.ok(only.en&&!only.fr&&!only.la);
});

test("R2: 32 source-owned prayers open Latin first, with real vernacular on demand",()=>{
 assert.equal(ESSENTIAL_FLOW_READER_SCHEMA,"ao-essential-flow-reader-v1");
 const esc=x=>String(x??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
 let latin=0,sourceOnly=0;
 for(const id of ESSENTIAL_HOLY_CARD_IDS_V1){
  const p=PRAY_CANONICAL_DATA_V435930.prayers[id];
  const h=renderEssentialFlowReader({id,p,face:p.la?"la":"en",vernacular:p.fr?"fr":"en",esc});
  assert.match(h,/data-ao-essential-flow="true"/,id);
  assert.match(h,/aoEssentialFlowBeat/,id);
  assert.doesNotMatch(h,/aoClaudeHolyLace|data-p435930-essential-card-turn/,id);
  assert.ok(h.includes(esc((p.la||p.fr||p.en).trim().slice(0,10))),"Canonical prayer text lost: "+id);
  if(p.la){
   latin++;
   assert.match(h,/data-ao-essential-current="la"/,id);
   assert.match(h,/data-ao-essential-flow-face="la"/,id);
   assert.match(h,/data-ao-essential-flow-face="vern"[^>]*hidden/,id);
   assert.match(h,/data-p435930-essential-flow-toggle/,id);
  }else{
   sourceOnly++;
   assert.match(h,/data-ao-essential-current="vern"/,id);
   assert.doesNotMatch(h,/data-ao-essential-flow-face="la"/,id);
   assert.doesNotMatch(h,/data-p435930-essential-flow-toggle/,id);
  }
 }
 assert.equal(latin,31);
 assert.equal(sourceOnly,1);
});
test("R2: language settings remain authentic and source-only text is not translated",()=>{
 const p=PRAY_CANONICAL_DATA_V435930.prayers.foundations_hail_mary;
 const esc=x=>String(x??"").replace(/&/g,"&amp;").replace(/</g,"&lt;");
 const fr=renderEssentialFlowReader({id:p.id,p,face:"fr",vernacular:"fr",esc});
 assert.match(fr,/data-ao-essential-current="vern"/);
 assert.match(fr,/lang="fr"/);
 const both=renderEssentialFlowReader({id:p.id,p,face:"both",vernacular:"fr",esc});
 assert.match(both,/data-ao-essential-current="both"/);
 assert.match(both,/aoEssentialFlowParallel/);
 const withoutImage=renderEssentialFlowReader({id:p.id,p,face:"la",vernacular:"fr",esc});
 assert.doesNotMatch(withoutImage,/<img /,"No unassigned painting is substituted");
 const blocked=renderEssentialFlowReader({id:p.id,p,face:"la",vernacular:"fr",esc,artUrl:"javascript:alert(1)"});
 assert.doesNotMatch(blocked,/<img /);
});
