import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 ANGELUS_A1_VERSION,ANGELUS_A1_TREATMENT,
 angelusA1Painting,angelusA1StagePlan
} from "../src/pray/angelus-a1-definitive.js";
import {ANGELUS_A1_CSS} from "../src/pray/angelus-a1-definitive-styles.js";

assert.equal(ANGELUS_A1_VERSION,"angelus-a1-three-bells-caption-v1");
assert.equal(ANGELUS_A1_TREATMENT,"caption");
assert.deepEqual(angelusA1StagePlan("angelus"),[
 "Angelus Domini","Ecce ancilla","Et Verbum caro","Oremus","Conclusio"]);
assert.equal(angelusA1StagePlan("regina").length,4);
assert.equal(angelusA1StagePlan("angelus",false).length,4);
assert.equal(angelusA1StagePlan("regina",false).length,3);
assert.equal(angelusA1Painting({form:"angelus",dateKey:"2026-11-11"}).id,"angelus");
assert.equal(angelusA1Painting({form:"regina",dateKey:"2026-04-05"}).id,"regina");
assert.equal(angelusA1Painting({form:"angelus",dateKey:"2026-12-28"}).id,"cavallino");
// The globally rejected Bouts Annunciation must never be loaded, even on 25 March.
assert.equal(angelusA1Painting({form:"angelus",dateKey:"2027-03-25"}).id,"angelus");
const source=readFileSync(new URL("../src/pray/angelus-a1-definitive.js",import.meta.url),"utf8");
const runtime=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
const deck=readFileSync(new URL("../src/pray/devotional-card-deck.js",import.meta.url),"utf8");
assert.ok(runtime.includes("decorateAngelusA1({"),"A1 production integration missing");
assert.ok(runtime.includes("syncAngelusA1(m,index)"),"stage camera hook missing");
assert.ok(deck.includes('entry.id==="collect"&&parts'),"historical conclusion must remain appended to Collect");
assert.ok(deck.includes('layout==="a1"&&entry.id==="conclusion"'),"A1 conclusion must have its own stage");
assert.ok(runtime.includes('layout:"a1"'),"A1 donor storyboard must be active");
assert.ok(deck.includes("for(let i=0;i<3;i++)"),"three full Gloria Patri repetitions must remain");
assert.ok(source.includes('LABELS={hail:"Ave Maria",collect:"Oratio"}'));
assert.ok(source.includes('root.__aoA1Artwork=art')||source.includes('view.__aoA1Artwork=art'));
assert.ok(source.includes('for(const count of [3,3,3,9])'),"three-bell sequence missing");
assert.ok(source.includes('anchorRitualIcon(card'),"posture icon must be anchored to the prayer paragraph");
assert.ok(source.includes('art.image'),"only released art image path may be used");
assert.ok(!/["']bouts["']/.test(source),"rejected artwork present in source");
assert.ok(ANGELUS_A1_CSS.includes(".aoA1Caption>span:before"),"Caption separators absent");
assert.ok(ANGELUS_A1_CSS.includes(".aoDevoCard[hidden]{display:none!important}"),"hidden stage regression");
assert.ok(ANGELUS_A1_CSS.includes("grid-template-columns:38px 15px minmax(0,1fr)"),"paragraph-aligned icon rail missing");
const manifest=JSON.parse(readFileSync(new URL("../Ad-Orientem-v43.19.webmanifest",import.meta.url),"utf8"));
const entry=manifest.shortcuts?.find(x=>x.short_name==="Angelus");
assert.ok(entry,"PWA home-screen action missing");
assert.equal(new URL(entry.url,"https://example.test/ad-orientem/Ad-Orientem-v43.19.webmanifest").searchParams.get("ao"),"angelus");
assert.ok(new URL(entry.url,"https://example.test/ad-orientem/Ad-Orientem-v43.19.webmanifest").pathname.startsWith("/ad-orientem/"),"shortcut must remain within GitHub Pages app scope");
assert.ok(runtime.includes('function openAngelusHomeShortcut()'),"PWA deep-link entry missing");
assert.ok(runtime.includes('new URLSearchParams(window.location.search).get("ao")!=="angelus"'),"shortcut parser must be exact");
assert.ok(runtime.includes('ANGELUS_COVER_DISMISSED=true'),"direct launch should skip redundant cover");
assert.ok(runtime.includes('open("pray.angelus_regina",{returnContext:null})'),"direct launch must use canonical module");
console.log("Angelus / Regina Cæli A1 Caption integration contract passed");
