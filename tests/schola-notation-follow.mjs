import assert from "node:assert/strict";
import {
 scholaGabcSyllables,createScholaFollowClock,mapScholaSvgLyrics
} from "../src/mass/reader-schola-notation-follow.js";
import {APPROVED_MASS_INLINE_GABC} from "../src/mass/reader-inline-chant-approved.js";

// This is a parser test using the separately approved dismissal notation.
// It is NOT a Schola dock musical approval or runtime publication.
const gabc=APPROVED_MASS_INLINE_GABC[0].gabc;
const syllables=scholaGabcSyllables(gabc);
assert.deepEqual(syllables.map(x=>x.label),["I","te,","mis","sa","est."]);
assert.equal(Object.isFrozen(syllables),true);
assert.equal(scholaGabcSyllables("No GABC body").length,0);
assert.deepEqual(scholaGabcSyllables("name: Clef only;%%(c4) (::)").map(x=>x.label),[]);
const clockCalls=[];
let nextId=0;
const timers=new Map();
const schedule=(fn,ms)=>{assert.equal(ms,1600);const id=++nextId;timers.set(id,fn);return id;};
const cancel=id=>{timers.delete(id);};
const clock=createScholaFollowClock({schedule,cancel,onStep:x=>clockCalls.push(x)});
const fire=()=>{const [id,fn]=timers.entries().next().value??[];assert.ok(fn,"tick scheduled");timers.delete(id);fn();};
assert.equal(clock.start(5),true);
assert.deepEqual(clockCalls[0],{index:0,count:5,origin:"estimated"});
fire();assert.equal(clock.getState().index,1);
assert.equal(clock.seek(3),true);
assert.equal(clock.getState().index,3);
assert.equal(clockCalls.at(-1).origin,"manual");
fire();assert.equal(clock.getState().index,4);
assert.equal(clock.getState().running,false);
assert.equal(timers.size,0,"Last lyric must never auto mark chant complete");
assert.equal(clock.seek(1),true,"Tap can rejoin earlier source syllable");
assert.equal(clock.shift(2),true);
assert.equal(clock.getState().index,3);
assert.equal(clock.seek(Number.NaN),false);
clock.destroy();
assert.equal(timers.size,0,"Unbinding must release estimated-follow timer");
assert.equal(clock.start(4),false);
assert.equal(clock.seek(0),false);
const one=createScholaFollowClock({schedule,cancel});
assert.equal(one.start(1),true);
assert.equal(one.getState().running,false);
assert.equal(one.getState().pending,false);
one.destroy();
assert.equal(createScholaFollowClock({schedule,cancel}).start(0),false);
assert.equal(createScholaFollowClock({schedule,cancel}).start(601),false);

// Strict SVG mapping: NO partial/wrong lyric highlights.
const textNodes=["Mode","I","te,","mis","sa","est."].map(textContent=>({textContent,dataset:{}}));
const svg={querySelectorAll:()=>textNodes};
const mapped=mapScholaSvgLyrics(svg,syllables);
assert.equal(mapped.length,5);
assert.deepEqual(mapped.map(x=>x.dataset.scholaSyllableIndex),["0","1","2","3","4"]);
assert.deepEqual(mapScholaSvgLyrics({querySelectorAll:()=>textNodes.slice(0,4)},syllables),[]);
// The decorated initial K and following Y- belong to ONE GABC syllable.
const kyrieSyllables=[
 {index:0,label:"KY",identity:"ky"},
 {index:1,label:"ri",identity:"ri"},
 {index:2,label:"e",identity:"e"},
 {index:3,label:"e",identity:"e"},
 {index:4,label:"lé",identity:"le"},
 {index:5,label:"i",identity:"i"},
 {index:6,label:"son.",identity:"son"}
];
const glyphs=["K","Y-","ri-","e","* ","e-","lé-","i-","son."]
 .map(textContent=>({textContent,dataset:{}}));
const mappedSplit=mapScholaSvgLyrics({querySelectorAll:()=>glyphs},kyrieSyllables);
assert.equal(mappedSplit.length,7);
assert.equal(mappedSplit[0],glyphs[1],"The Y lyric owns source syllable KY");
assert.deepEqual(mappedSplit.map(n=>n.dataset.scholaSyllableIndex),
 ["0","1","2","3","4","5","6"]);
const badInitial=["K","Z-","ri-","e","* ","e-","lé-","i-","son."]
 .map(textContent=>({textContent,dataset:{}}));
assert.deepEqual(mapScholaSvgLyrics({querySelectorAll:()=>badInitial},kyrieSyllables),[]);
const changedMiddle=["K","Y-","ri-","x","* ","e-","lé-","i-","son."]
 .map(textContent=>({textContent,dataset:{}}));
assert.deepEqual(mapScholaSvgLyrics({querySelectorAll:()=>changedMiddle},kyrieSyllables),[]);
console.log("SCHOLA_NOTATION_FOLLOW_SOURCE_CLOCK_PASS parser, manual seek, bounded timer, strict lyric matching");
