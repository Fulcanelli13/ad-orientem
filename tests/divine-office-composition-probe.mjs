import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_PILOT_DATES, DIVINUM_OFFICIUM_OFFICE_PIN, GENERATOR_HOUR_COMMANDS,
  makeGeneratorRequest, inspectGeneratedXhtml,
} from "../src/office/generator-probe-contract.js";
import {DIVINUM_OFFICIUM_PIN} from "../src/app/source-transport-compat.js";

test("generator revision derives from Ad Orientem existing pinned transport owner",()=>{
  assert.equal(DIVINUM_OFFICIUM_OFFICE_PIN,DIVINUM_OFFICIUM_PIN);
  assert.match(DIVINUM_OFFICIUM_OFFICE_PIN,/^[0-9a-f]{40}$/);
});

test("eight-hours × three-language CGI probe uses 1960 rubrics and upstream command identifiers",()=>{
  const hourNames=["MATINS","LAUDS","PRIME","TERCE","SEXT","NONE","VESPERS","COMPLINE"];
  assert.deepEqual(Object.keys(GENERATOR_HOUR_COMMANDS),hourNames);
  for (const hour of hourNames) for (const language of ["la","en","fr"]) {
    const req=makeGeneratorRequest({date:"2026-10-28",hour,language});
    const params=new URLSearchParams(req.query);
    assert.equal(params.get("date1"),"10-28-2026");
    assert.equal(params.get("command"),"pray"+GENERATOR_HOUR_COMMANDS[hour]);
    assert.equal(params.get("version"),"Rubrics 1960 - 1960");
    assert.equal(params.get("lang1"),{la:"Latin",en:"English",fr:"Francais"}[language]);
    assert.equal(params.get("lang2"),params.get("lang1"));
    assert.equal(req.publishable,false);
  }
});

test("pilot covers ordinary festa and Vespers concurrence transitions",()=>{
  assert.deepEqual([...DEFAULT_PILOT_DATES],["2026-10-28","2026-10-31","2026-11-01","2026-11-03"]);
  for (const date of DEFAULT_PILOT_DATES)assert.equal(makeGeneratorRequest({date,hour:"LAUDS",language:"la"}).date,date);
});

test("invalid, non-leap, unknown hour or unknown language cannot reach the engine",()=>{
  for (const date of ["2026-02-29","2026-04-31","2026-13-01","2026-10-28;rm","28-10-2026"]) {
    assert.throws(()=>makeGeneratorRequest({date,hour:"LAUDS",language:"la"}),/OFFICE_PROBE_DATE_INVALID/);
  }
  assert.doesNotThrow(()=>makeGeneratorRequest({date:"2028-02-29",hour:"MATINS",language:"la"}));
  assert.throws(()=>makeGeneratorRequest({date:"2026-10-28",hour:"VESPERS_II",language:"la"}),/OFFICE_PROBE_HOUR_INVALID/);
  assert.throws(()=>makeGeneratorRequest({date:"2026-10-28",hour:"LAUDS",language:"es"}),/OFFICE_PROBE_LANGUAGE_INVALID/);
});

const req={date:"2026-10-28",hour:"VESPERS",language:"fr"};
const xhtml='<?xml version="1.0"?><html><head><title>Office</title></head><body><div>'+
  "<p>Ad Vesperas — "+ "Laudate Dominum omnes gentes. ".repeat(40)+"</p>"+
  "</div></body></html>";

test("captured XHTML is only an unverified research envelope, never a published Office",()=>{
  const v=inspectGeneratedXhtml({xhtml,...req});
  assert.equal(v.envelopePass,true);
  assert.equal(v.status,"CAPTURED_UNVERIFIED");
  assert.equal(v.publishable,false);
  assert.equal(v.compositionVerified,false);
  assert.equal(v.languageCompletenessVerified,false);
  assert.equal(v.printedBreviaryCertified,false);
});

test("response diagnostics reject empty, malformed or server-error envelopes",()=>{
  for (const raw of ["", "Fatal error", "<html><body></body></html>",
    xhtml.replace("</html>",""), xhtml.replace("<body>",""), xhtml+"<p>Software error</p>"]) {
    const v=inspectGeneratedXhtml({xhtml:raw,...req});
    assert.equal(v.envelopePass,false);
    assert.equal(v.status,"PROBE_FAILED");
    assert.ok(v.errors.length>=1);
  }
});
