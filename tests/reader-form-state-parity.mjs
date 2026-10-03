import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createReaderFormCueStateController } from "../src/mass/reader-form-state.js";
import { createNativeScholaController } from "../src/mass/reader-schola.js";
import { properToReaderSlots } from "../src/mass/proper-reader-slots.js";
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const formState=load("../data/presentation/reader-form-state.v1.json"),lowCorpus=load("../data/presentation/reader-text-low.v1.json"),sungCorpus=load("../data/presentation/reader-text-sung.v1.json");
assert.equal(formState.sources.low.canonicalReaderTextSha256,lowCorpus.source.rawSha256);
assert.equal(formState.sources.solemn.sharedSungCueSourceSha256,"2f091b2f099387cbd709cadd78aff5c25ca1d4152ad0af18083edf301609891f");
const registries=Object.freeze({gestures:load("../data/presentation/reader-gestures.v1.json"),responses:load("../data/presentation/reader-responses.v1.json"),postures:load("../data/presentation/reader-postures.v1.json"),positions:load("../data/presentation/reader-priest-positions.v1.json"),voices:load("../data/presentation/reader-priest-voices.v1.json")});
const prepared=(form,extra={})=>({session:{resolvedMass:{form,conditions:extra.conditions??[]}},readerPreferences:{mode:"SIMPLE",postureProfile:extra.postureProfile??"FOLLOW_CONGREGATION",gestureProfile:extra.gestureProfile??"GUIDED_1962"}});
const low=createReaderFormCueStateController({formStateData:formState,registries,lowCorpus,sungCorpus,prepared:prepared("LOW",{postureProfile:"OCONNELL_1962_COMMUNITY",gestureProfile:"TRADITIONAL"})});assert.equal(low.supported,true);assert.equal(low.canonicalCueCount,275);
let s=low.project("AO.SM.C0001");assert.equal(s.priestPosition.station,"FOOT_CENTER");assert.equal(s.priestVoice.value,"LOW / QUIET");assert.match(s.gesture.action,/Sign of the cross/i);assert.equal(s.response,null);
s=low.project("AO.SM.C0075");assert.equal(s.priestPosition.station,"ALTAR_EPISTLE_MISSAL");assert.equal(s.priestVoice.value,"CLEAR SPOKEN");assert.equal(s.posture.value,"SIT");
s=low.project("AO.SM.C0082");assert.equal(s.priestPosition.station,"ALTAR_GOSPEL_MISSAL");assert.equal(s.priestVoice.value,"CLEAR SPOKEN");
s=low.project("AO.SM.C0259");assert.equal(s.priestVoice.value,"CLEAR SPOKEN");assert.equal(s.priestPosition.facing,"PEOPLE");
s=low.project("AO.SM.C0268");assert.equal(s.response,null);assert.equal(s.ownership.response,"R18_LOW_SERVER_RESPONSE_SUPPRESSED");
const lowIds=new Set(lowCorpus.blocks.flatMap(b=>(b.units??[]).map(u=>u.cue_id)).filter(id=>/^AO\.SM\.C\d{4}$/.test(String(id))&&Number(String(id).slice(-4))<=275));assert.equal(lowIds.size,275);
for(const cueId of lowIds){const x=low.project(cueId);for(const ch of ["gesture","response","priestVoice","priestPosition","priestAction","sacredMinister"])assert.ok(!String(x.ownership?.[ch]??"").includes("LEGACY"),cueId+" Low "+ch);}
const solemn=createReaderFormCueStateController({formStateData:formState,registries,lowCorpus,sungCorpus,prepared:prepared("SOLEMN",{gestureProfile:"TRADITIONAL"})});assert.equal(solemn.supported,true);
s=solemn.project("AO.SM.C0075");assert.equal(s.priestPosition.station,"SEDILIA");assert.equal(s.priestVoice.value,"LISTENS");assert.match(s.sacredMinister.actor,/SUBDEACON/);
s=solemn.project("AO.SM.C0082");assert.equal(s.priestPosition.station,"SOLEMN_CELEBRANT_TRACK");assert.equal(s.priestVoice.value,"LISTENS");assert.match(s.sacredMinister.actor,/DEACON/);
s=solemn.project("AO.SM.C0174");assert.match(s.sacredMinister.actor,/DEACON/);assert.match(s.sacredMinister.actor,/SUBDEACON/);assert.match(s.sacredMinister.actor,/TORCHBEARERS/);
s=solemn.project("AO.SM.C0259");assert.equal(s.priestVoice.value,"LISTENS");assert.match(s.sacredMinister.actor,/DEACON/);
s=solemn.project("AO.SM.C0268");assert.equal(s.response,null);assert.equal(s.ownership.response,"R18_SOLEMN_MINISTER_RESPONSE");assert.match(s.sacredMinister.actor,/SUBDEACON/);
s=solemn.project("AO.SM.C0225");assert.equal(s.sacredMinister,null);assert.equal(s.ownership.sacredMinister,"R18_FAIL_CLOSED_PENDING_SOLEMN_PAX_AUTHORITY");assert.match(s.sacredMinisterAdvisory.actor,/DEACON/);
const sungIds=new Set(sungCorpus.blocks.flatMap(b=>(b.units??[]).map(u=>u.cue_id)).filter(id=>/^AO\.SM\.C\d{4}$/.test(String(id))));assert.equal(sungIds.size,279);
for(const cueId of sungIds){const x=solemn.project(cueId);for(const ch of ["gesture","response","priestVoice","priestPosition","priestAction","sacredMinister"])assert.ok(!String(x.ownership?.[ch]??"").includes("LEGACY"),cueId+" Solemn "+ch);}
for(const form of ["MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE"]){const c=createReaderFormCueStateController({formStateData:formState,registries,lowCorpus,sungCorpus,prepared:prepared(form)});assert.equal(c.supported,true);for(const cueId of ["AO.SM.C0001","AO.SM.C0075","AO.SM.C0082","AO.SM.C0174","AO.SM.C0259","AO.SM.C0268"]){const x=c.project(cueId);for(const ch of ["gesture","response","priestVoice","priestPosition","priestAction","sacredMinister"])assert.ok(!String(x.ownership?.[ch]??"").includes("LEGACY"),form+" "+cueId+" "+ch);}}
const t=(lat,en)=>({lat,en}),properSlots=properToReaderSlots({introit:t("Introitus","Introit"),collect:t("Collecta","Collect"),epistle:t("Epistola","Epistle"),gradual:t("Graduale","Gradual"),sequence:t("Sequentia","Sequence"),gospel:t("Evangelium","Gospel"),offertory:t("Offertorium","Offertory"),secret:t("Secreta","Secret"),preface:t("Praefatio","Preface"),communion:t("Communio","Communion"),postcommunion:t("Postcommunio","Postcommunion")});
const lowSchola=createNativeScholaController({sungCorpus,properSlots,prepared:prepared("LOW")});assert.equal(lowSchola.supported,true);assert.equal(lowSchola.project().schola,null);assert.equal(lowSchola.project().ownership,"R18_FORM_ABSENT_SCHOLA");
const solemnSchola=createNativeScholaController({sungCorpus,properSlots,prepared:prepared("SOLEMN")});assert.equal(solemnSchola.supported,true);assert.ok(solemnSchola.trackIds.includes("KYRIE"));
console.log("reader form-state parity: PASS — Low and Solemn are native-owned; form switches cannot silently fall back to legacy state.");
