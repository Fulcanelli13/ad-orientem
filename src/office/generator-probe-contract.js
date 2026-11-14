import {DIVINUM_OFFICIUM_PIN} from "../app/source-transport-compat.js";
// Source-generator PROBE contracts. Never make a source-text certification claim.
export const DIVINUM_OFFICIUM_OFFICE_PIN = DIVINUM_OFFICIUM_PIN;
export const OFFICE_GENERATOR_EDITION = "Rubrics 1960 - 1960";
export const GENERATOR_HOUR_COMMANDS = Object.freeze({
  MATINS: "Matutinum",
  LAUDS: "Laudes",
  PRIME: "Prima",
  TERCE: "Tertia",
  SEXT: "Sexta",
  NONE: "Nona",
  VESPERS: "Vespera",
  COMPLINE: "Completorium",
});
export const GENERATOR_LANGUAGE = Object.freeze({la: "Latin", en: "English", fr: "Francais"});
export const DEFAULT_PILOT_DATES = Object.freeze(["2026-10-28", "2026-10-31", "2026-11-01", "2026-11-03"]);

function isRealDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const actual = new Date(value + "T12:00:00Z");
  return !Number.isNaN(actual.getTime()) && actual.toISOString().slice(0,10) === value;
}

export function makeGeneratorRequest({date,hour,language} = {}) {
  if (!isRealDate(date)) throw new Error("OFFICE_PROBE_DATE_INVALID");
  const command = GENERATOR_HOUR_COMMANDS[String(hour ?? "").toUpperCase()];
  if (!command) throw new Error("OFFICE_PROBE_HOUR_INVALID");
  const languageName = GENERATOR_LANGUAGE[String(language ?? "").toLowerCase()];
  if (!languageName) throw new Error("OFFICE_PROBE_LANGUAGE_INVALID");
  const [year,month,day] = date.split("-");
  const params = new URLSearchParams({
    date1: month+"-"+day+"-"+year,
    command:"pray"+command,
    version:OFFICE_GENERATOR_EDITION,
    testmode:"regular",
    lang1:languageName,
    lang2:languageName,
    nofancychars:"0",
  });
  return Object.freeze({
    schema:"ao.office.engine-request.v1",
    date, hour:String(hour).toUpperCase(), language:String(language).toLowerCase(),
    provider:"DivinumOfficium/divinum-officium", upstreamCommit:DIVINUM_OFFICIUM_OFFICE_PIN,
    entrypoint:"standalone/tools/epubgen2/EofficiumXhtml.pl",
    query:params.toString(),
    // CGI's command-line query-string invocation is upstream's own EPUB generator interface.
    // Matching lang1/lang2 requests a single language; inheritance/fallback is NOT certified.
    publishable:false,
  });
}

export function inspectGeneratedXhtml({xhtml,date,hour,language} = {}) {
  const request=makeGeneratorRequest({date,hour,language});
  const source=typeof xhtml==="string"?xhtml:"";
  const errors=[];
  if (source.length<600) errors.push("OUTPUT_TOO_SHORT");
  if (!/<html\b/i.test(source) || !/<\/html\s*>/i.test(source)) errors.push("XHTML_DOCUMENT_MISSING");
  if (!/<body\b/i.test(source) || !/<\/body\s*>/i.test(source)) errors.push("XHTML_BODY_MISSING");
  if (!/<(?:table|div|p|tr|td)\b/i.test(source)) errors.push("XHTML_OFFICE_CONTENT_MISSING");
  if (/\b(?:software error|internal server error|fatal error|failed to open|compilation failed)\b/i.test(source))
    errors.push("UPSTREAM_GENERATOR_ERROR");
  // This is only an envelope check. It cannot prove missing psalms, wrong rubrics,
  // intra-hour text gaps, inherited English for French, or correct First Vespers.
  return Object.freeze({
    schema:"ao.office.engine-probe-diagnostic.v1",
    request, envelopePass:errors.length===0,
    errors:Object.freeze(errors), bytesUtf8:null,
    compositionVerified:false, languageCompletenessVerified:false,
    printedBreviaryCertified:false, publishable:false,
    status:errors.length?"PROBE_FAILED":"CAPTURED_UNVERIFIED",
  });
}
