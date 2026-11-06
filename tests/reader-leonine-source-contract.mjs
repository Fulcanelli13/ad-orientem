import assert from "node:assert/strict";
import {postLowMassLeonineEligible,postLowMassLeonineSections,ICKSP_LOW_MASS_BOOKLET} from "../src/mass/reader-post-low-mass.js";
const prepared={session:{plan:{kind:"MASS",followingGraphs:[],overlayGraphs:[]},
 resolvedMass:{form:"LOW",followingActions:[],overlays:[]}},readerPreferences:{language:"en"}};
const final={cardTitle:"Last Gospel · The Word Made Flesh"};
assert.equal(postLowMassLeonineEligible(prepared,final,"LIVE"),true);
assert.equal(postLowMassLeonineEligible(prepared,{sectionTitle:final.cardTitle},"LIVE"),true,
 "Cue-only LIVE refresh must preserve the already available Leonine prayers");
assert.equal(postLowMassLeonineEligible(prepared,{sectionTitle:"Last Gospel"},"MISSAL"),true,
 "Cue-only MISSAL refresh must preserve the already available Leonine prayers");
assert.equal(postLowMassLeonineEligible(prepared,{sectionTitle:"Last Gospel · Prologue of St John"},"LIVE"),false,
 "The first Last Gospel card must not prematurely expose the devotion");
assert.equal(postLowMassLeonineEligible(prepared,{cardTitle:"Last Gospel · Prologue of St John"},"LIVE"),false);
assert.equal(postLowMassLeonineEligible(prepared,{cardTitle:"Last Gospel"},"MISSAL"),true);
assert.equal(postLowMassLeonineEligible({...prepared,session:{...prepared.session,resolvedMass:{...prepared.session.resolvedMass,form:"SOLEMN"}}},final,"LIVE"),false);
assert.equal(postLowMassLeonineEligible({...prepared,session:{...prepared.session,resolvedMass:{...prepared.session.resolvedMass,form:"MISSA_CANTATA_SIMPLE"}}},final,"LIVE"),false);
assert.equal(postLowMassLeonineEligible({...prepared,session:{...prepared.session,plan:{...prepared.session.plan,followingGraphs:["REQUIEM_ABSOLUTION"]}}},final,"LIVE"),false);
const en=postLowMassLeonineSections("en"),fr=postLowMassLeonineSections("fr");
assert.equal(en.length,5);assert.equal(fr.length,5);
assert.match(en[0].latin[0].text,/Ave Maria/);
assert.match(fr[1].vernacular.map(x=>x.text).join(" "),/Salut, ô Reine/);
assert.match(en[3].latin[0].text,/Sancte Michael/);
assert.match(en[4].latin[0].text,/Cor Iesu/);
assert.ok(en.every(x=>x.latin.length&&x.vernacular.length));
assert.match(ICKSP_LOW_MASS_BOOKLET,/icksp\.org\.uk/);
console.log("PASS: all five source-owned Leonine prayers Latin/EN/FR and Low Mass eligibility");
