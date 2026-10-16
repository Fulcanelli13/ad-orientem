// Research-to-presentation bridge for supplementary saints. No Mass/Proper authority.
// The production 1962 resolver remains sole owner of principal day/rank/colour.
export const LIVING_SANCTORAL_VERSION = "ao-living-sanctoral-projection-v1";

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const isDate = value => DATE.test(String(value || "")) && !Number.isNaN(Date.parse(String(value) + "T12:00:00Z"));
const monthDay = date => String(date).slice(5);
const normalizeResolverId = value => String(value || "").replace(/:[1-4]:[a-z]{1,3}$/i, "");
const samePrincipal = (a, b) => Boolean(a && b && normalizeResolverId(a) === normalizeResolverId(b));
const personLabel = (person, language) => person?.name?.[language === "fr" ? "fr" : "en"] || person?.name?.en || "";

export function saintRecognitionAt(person, date) {
  if (!isDate(date)) throw new TypeError("Expected valid ISO date");
  const r = person?.recognition || {};
  const canonized = r.rank === "SAINT" && (!r.canonizedOn || r.canonizedOn <= date);
  const doctor = canonized && Boolean(r.doctorDeclaredOn && r.doctorDeclaredOn <= date);
  return Object.freeze({
    canonicalPersonId: person?.id ?? null,
    recognizedAsSaint: canonized,
    doctorOfChurch: doctor,
    doctorTitle: doctor ? (r.doctorTitle || "Doctor of the Church") : null,
  });
}

// Only explicit, sourced General-Calendar entries qualify. Optional traditional
// Mass eligibility is NOT calculated or inferred from these records.
export function supplementarySaintsForDate(date, persons, {
  language = "en",
  observedPrincipalId = null,
  includeOlderCalendarAssociations = false,
} = {}) {
  if (!isDate(date)) throw new TypeError("Expected valid ISO date");
  if (!Array.isArray(persons)) throw new TypeError("Expected saints registry array");
  const result = [];
  const seen = new Set();
  for (const person of persons) {
    if (!person?.id || seen.has(person.id)) continue;
    if (person.publicationHold) continue; // Independent identity adjudication required.
    const recognition = saintRecognitionAt(person, date);
    if (!recognition.recognizedAsSaint) continue;
    for (const observance of person.observances || []) {
      if (observance?.monthDay !== monthDay(date)) continue;
      const current = observance.calendar === "CURRENT_ROMAN_GENERAL";
      const older = observance.calendar === "1962_GENERAL" && includeOlderCalendarAssociations;
      if (!current && !older) continue;
      if (!Array.isArray(observance.sourceIds) || !observance.sourceIds.length) continue;
      if (observance.publishedOn && observance.publishedOn > date) continue;
      if (person.calendar1962?.principalId && samePrincipal(person.calendar1962.principalId, observedPrincipalId)) continue;
      result.push(Object.freeze({
        personId: person.id,
        title: personLabel(person, language),
        whyHonoured:person.presentation?.whyHonoured?.[language==="fr"?"fr":"en"]||null,
        historicalContribution:person.presentation?.historicalContribution?.[language==="fr"?"fr":"en"]||null,
        artworkId:person.presentation?.approvedArtworkId||null,
        canonicalPlaceId:person.presentation?.canonicalPlaceId||null,
        furtherReadingUrls:Object.freeze([...(person.presentation?.verifiedFurtherReadingUrls||[])]),
        modernCalendarKind: current ? observance.kind : null,
        sourceIds: Object.freeze([...observance.sourceIds]),
        doctorOfChurch: recognition.doctorOfChurch,
        doctorTitle: recognition.doctorTitle,
        status: "CONTEXTUAL_SAINT_NOT_MASS_SELECTION",
        changesPrincipalDay: false,
        optional1962MassStatus: "NOT_EVALUATED",
      }));
      seen.add(person.id);
      break;
    }
  }
  return Object.freeze(result);
}

// Single group -> single contextual card. Person-member enumeration is out of scope.
// All observance dates here are contemporary external witnesses, not decisions
// about the 1962 sanctorale or its actual celebrant's chosen Mass.
export function collectiveMartyrCards(groups, events, {language="en", date=null}={}) {
  if (!Array.isArray(groups) || !Array.isArray(events)) throw new TypeError("Expected group and event arrays");
  if (date !== null && !isDate(date)) throw new TypeError("Expected ISO date");
  const eventIndex = new Map(events.map(e => [e.id,e]));
  const result=[];
  const seen=new Set();
  const lang=language==="fr"?"fr":"en";
  for(const g of groups) {
    if(!g?.id || seen.has(g.id) || g.presentation?.entryType!=="COLLECTIVE_MARTYR_PROFILE")continue;
    const event=eventIndex.get(g.eventId);
    if(!event || !isDate(event.date))continue;
    if(date && event.date>date)continue; // A group not yet canonised is not a canonised group.
    const sources=Array.isArray(g.presentation.dates)?g.presentation.dates:[];
    const matches=date
      ? sources.filter(o=>o?.monthDay===monthDay(date) &&
        o.calendar==="CURRENT_USCCB_WITNESS" &&
        o.sourceUrl?.startsWith("https://") &&
        o.universalRomanStatus==="NOT_SEPARATELY_CERTIFIED" &&
        o.appliesTo1962Mass===false &&
        date >= "2026-01-01") // Prior-year liturgical inscription chronology unverified.
      : [];
    if(date && matches.length===0)continue;
    const pres=g.presentation;
    const artworkId=pres.artwork?.canonicalArtworkId||null;
    const placeId=pres.geography?.canonicalPlaceId||null;
    result.push(Object.freeze({
      id:"canon-group."+g.id,
      type:"COLLECTIVE_MARTYR_PROFILE",
      title:pres.title?.[lang]||pres.title?.en||"",
      context:pres.context?.[lang]||pres.context?.en||"",
      whyHonoured:pres.whyHonoured?.[lang]||pres.whyHonoured?.en||"",
      featuredPersonIds:Object.freeze([...(pres.featuredCanonicalPersonIds||[])]),
      furtherReadingUrl:pres.deeperReading?.entrySourceUrl||event.sourceUrl,
      artworkId, placeId,
      visualStatus:artworkId?"ARTWORK_ID_PROPOSED_FOR_REVIEW":"ARTWORK_NOT_YET_MATCHED",
      geographicStatus:placeId?"PLACE_ID_PROPOSED_FOR_REVIEW":"PLACE_NOT_YET_MATCHED",
      modernCalendarWitness:date?Object.freeze({calendar:matches[0].calendar,monthDay:matches[0].monthDay,kind:matches[0].kind,url:matches[0].sourceUrl}):null,
      massSelectionAuthority:"NONE",
      changes1962Principal:false,
      individualMemberEnumerationRequired:false,
    }));
    seen.add(g.id);
  }
  return Object.freeze(result);
}
