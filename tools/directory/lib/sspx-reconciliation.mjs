// Review-backed SSPX entity-to-physical-venue projection.
// Source-directory flags never establish public Mass by themselves.
export const SSPX_PUBLICATION_STATES = Object.freeze([
  "CURRENT_PUBLIC_MASS", "CONDITIONAL_MASS", "HOUSE_WITH_PUBLIC_CHAPEL",
  "PROVIDER_HOUSE_ONLY", "INSTITUTION_ONLY", "DISPLACED_HISTORICAL",
  "DUPLICATE_SOURCE_ROW", "PENDING_CURRENT_EVIDENCE",
]);
const stateSet = new Set(SSPX_PUBLICATION_STATES);
const tiers = Object.freeze({
  LOCAL_APOSTOLATE: 0,
  REGIONAL_OFFICIAL: 1,
  INTERNATIONAL_OFFICIAL: 2,
  HISTORICAL: 3,
  SECONDARY: 4,
});
const massStates = new Set(["CURRENT_PUBLIC_MASS", "CONDITIONAL_MASS"]);
const cadences = new Set([
  "DAILY", "WEEKLY", "TWICE_MONTHLY", "MONTHLY", "BIMONTHLY",
  "QUARTERLY", "SEASONAL", "IRREGULAR", "DATE_SPECIFIC",
]);
const safeArray = value => Array.isArray(value) ? value : [];
const slug = value => String(value ?? "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
  .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
function invariant(check, message) { if (!check) throw new Error("SSPX adjudication: " + message); }
function validDate(date) {
  return typeof date === "string" && /^20\d{2}-\d{2}-\d{2}$/.test(date)
    && !Number.isNaN(Date.parse(date + "T00:00:00Z"))
    && new Date(date + "T00:00:00Z").toISOString().slice(0, 10) === date;
}
function validUrl(url) {
  try { const parsed = new URL(url); return parsed.protocol === "https:"; } catch { return false; }
}
function witnessId(upstreamId, witness, suffix = "parent") {
  return "src-sspx-reviewed-" + slug(upstreamId) + "-" + slug(witness.tier) + "-" + slug(suffix);
}
function validateWitness(witness, label) {
  invariant(witness && Object.hasOwn(tiers, witness.tier), label + ": official source tier required");
  invariant(validUrl(witness.url), label + ": HTTPS source URL required");
  invariant(validDate(witness.checked_on), label + ": checked_on must be a valid YYYY-MM-DD date");
  invariant(validDate(witness.effective_from), label + ": effective_from required");
  invariant(!witness.effective_until || validDate(witness.effective_until), label + ": invalid effective_until");
  invariant(!witness.effective_until || witness.effective_until >= witness.effective_from,
    label + ": effective_until earlier than effective_from");
}
function validateMass(mass, state, witness, label, asOf) {
  if (!massStates.has(state)) {
    invariant(!mass, label + ": non-public state cannot have an active Mass schedule");
    return;
  }
  invariant(tiers[witness.tier] <= tiers.INTERNATIONAL_OFFICIAL, label + ": secondary/historical source cannot promote a public Mass");
  invariant(mass && typeof mass.raw === "string" && mass.raw.trim(), label + ": specific Mass evidence required");
  invariant(cadences.has(mass.cadence), label + ": documented cadence required");
  if (state === "CONDITIONAL_MASS") {
    invariant(!["DAILY", "WEEKLY"].includes(mass.cadence), label + ": conditional Mass needs restricted cadence");
  }
  if (mass.effective_from) invariant(validDate(mass.effective_from), label + ": invalid Mass effective_from");
  if (mass.effective_until) invariant(validDate(mass.effective_until), label + ": invalid Mass effective_until");
  if (mass.effective_from && mass.effective_until) {
    invariant(mass.effective_from <= mass.effective_until, label + ": invalid Mass date interval");
  }
  invariant(!mass.effective_from || mass.effective_from <= asOf,
    label + ": future-effective Mass cannot be published as current");
  invariant(!mass.effective_until || mass.effective_until >= asOf,
    label + ": expired Mass cannot be published as current");
}
function createWitnessSource(id, witness, upstreamId, label, retrievedAt) {
  return {
    source_id: id, registry_source_id: null,
    source_type: witness.tier === "LOCAL_APOSTOLATE" ? "PARISH_OFFICIAL" : "COMMUNITY_OFFICIAL",
    publisher: "Society of Saint Pius X",
    title: witness.title || label,
    url: witness.url,
    authority: "PRIMARY",
    precedence_tier: witness.tier,
    evidence_checked_on: witness.checked_on,
    effective_from: witness.effective_from,
    effective_until: witness.effective_until ?? null,
    parent_upstream_id: upstreamId,
    retrieved_at: retrievedAt,
    fields_supported: ["venue", "schedule", "venue.contact"],
  };
}
function createMassSchedule(venueId, ministryId, mass, witness, sourceId) {
  return {
    schedule_id: "ao-schedule-reviewed-" + slug(venueId),
    ministry_id: ministryId, service_type: "MASS", mass_type: "UNKNOWN",
    payload: {
      raw: mass.raw.trim(),
      cadence: mass.cadence,
      effective_from: mass.effective_from ?? witness.effective_from,
      effective_until: mass.effective_until ?? witness.effective_until ?? null,
      exceptions: safeArray(mass.exceptions),
    },
    source_ids: [sourceId],
    verification: {
      state: "OFFICIAL_VERIFIED",
      checked_at: witness.checked_on + "T00:00:00Z",
      review_due_at: null,
    },
  };
}
function cleanAddress(address, label) {
  invariant(address && typeof address === "object" &&
    typeof address.country_code === "string" && address.country_code.trim() &&
    typeof address.formatted === "string" && address.formatted.trim(),
    label + ": independently specified country_code and physical address required");
  return {
    line1: address.line1 ?? null, line2: address.line2 ?? null,
    postal_code: address.postal_code ?? null, city: address.city ?? null,
    region: address.region ?? null, country_code: address.country_code,
    country: address.country ?? null, formatted: address.formatted,
  };
}
function noGeo() {
  return {lat:null,lng:null,precision:"unknown",geocoding_source:null,source_url:null,source_ref:null};
}
function placeGeo(candidate, label) {
  if (!candidate) return noGeo();
  invariant(Number.isFinite(Number(candidate.lat)) && Number.isFinite(Number(candidate.lng)) &&
    candidate.lat !== null && candidate.lng !== null &&
    Number(candidate.lat) >= -90 && Number(candidate.lat) <= 90 &&
    Number(candidate.lng) >= -180 && Number(candidate.lng) <= 180 &&
    ["building", "address", "street", "locality"].includes(candidate.precision) &&
    candidate.geocoding_source === "OFFICIAL_SOURCE" &&
    validUrl(candidate.source_url) && typeof candidate.source_ref === "string" && candidate.source_ref,
    label + ": unsupported unverified coordinate override");
  return {...candidate};
}
function chooseDecisions(decisions, asOf) {
  const groups = new Map(), chosen = [], exceptions = [];
  for (const decision of decisions) {
    invariant(decision && typeof decision.upstream_id === "string" && decision.upstream_id.trim(),
      "decision upstream_id required");
    validateWitness(decision.witness, decision.upstream_id);
    const list = groups.get(decision.upstream_id) ?? [];
    list.push(decision); groups.set(decision.upstream_id, list);
  }
  for (const [upstreamId, list] of groups) {
    const active = list.filter(d => d.witness.effective_from <= asOf &&
      d.witness.checked_on <= asOf &&
      (!d.witness.effective_until || d.witness.effective_until >= asOf) &&
      (!massStates.has(d.state) || (
        (Date.parse(asOf + "T00:00:00Z") - Date.parse(d.witness.checked_on + "T00:00:00Z")) / 86400000 <= 120
      )));

    if (!active.length) { exceptions.push({upstream_id:upstreamId,code:"NO_CURRENT_WITNESS"}); continue; }
    active.sort((a,b) =>
      tiers[a.witness.tier]-tiers[b.witness.tier] ||
      b.witness.effective_from.localeCompare(a.witness.effective_from) ||
      b.witness.checked_on.localeCompare(a.witness.checked_on));
    const best=active[0], second=active[1];
    if (second && tiers[second.witness.tier] === tiers[best.witness.tier] &&
      second.witness.effective_from === best.witness.effective_from &&
      second.witness.checked_on === best.witness.checked_on &&
      JSON.stringify(second) !== JSON.stringify(best)) {
      exceptions.push({upstream_id:upstreamId,code:"CONFLICTING_EQUAL_PRIORITY_WITNESSES"});
      continue;
    }
    chosen.push(best);
  }
  return {chosen,exceptions};
}
export function applySspxAdjudications(input, decisions = [], {asOf, retrievedAt} = {}) {
  invariant(validDate(asOf), "asOf date required");
  const venues = safeArray(input.venues).map(v=>({...v})),
    ministries = safeArray(input.ministries).map(m=>({...m})),
    schedules = [...safeArray(input.schedules)],
    sources = [...safeArray(input.sources)];
  // A reviewed slug can resolve to the canonical CRM identity once full API
  // details arrive; neither slug nor CRM is a physical-site identity.
  const byUpstream = new Map();
  for (const venue of venues) {
    if (venue.upstream?.crm_id) byUpstream.set(venue.upstream.crm_id,venue);
    if (venue.upstream?.slug) {
      const collision=byUpstream.get(venue.upstream.slug);
      invariant(!collision || collision.venue_id===venue.venue_id,
        "upstream slug collision: " + venue.upstream.slug);
      byUpstream.set(venue.upstream.slug,venue);
    }
  }
  const {chosen,exceptions} = chooseDecisions(decisions,asOf);
  let physicalSiteCount=0;
  for (const d of chosen) {
    const original = byUpstream.get(d.upstream_id);
    if (!original) {
      exceptions.push({upstream_id:d.upstream_id,code:"UNKNOWN_UPSTREAM_ID"});
      continue;
    }
    invariant(stateSet.has(d.state), d.upstream_id + ": invalid state");
    const label=d.upstream_id, witness=d.witness;
    validateMass(d.mass, d.state, witness, label, asOf);
    if (d.state === "HOUSE_WITH_PUBLIC_CHAPEL") {
      invariant(safeArray(d.physical_sites).length > 0, label + ": physical chapels required");
    }
    if (d.state === "DUPLICATE_SOURCE_ROW") {
      invariant(typeof d.canonical_source_id === "string" && d.canonical_source_id.trim(),
        label + ": duplicate must identify canonical source");
    }
    const mainMinistry = ministries.find(m=>m.venue_id===original.venue_id);
    invariant(mainMinistry, label + ": source ministry missing");
    const mainSourceId=witnessId(label,witness);
    original.publication_state=d.state;
    original.adjudication_source_id=mainSourceId;
    original.source_ids=[...new Set([...safeArray(original.source_ids),mainSourceId])];
    sources.push(createWitnessSource(mainSourceId,witness,label,original.name?.official,retrievedAt));
    if (d.physical_address) {
      const previous=original.address;
      original.address=cleanAddress(d.physical_address,label);
      original.upstream={...original.upstream,previous_physical_address:previous};
      original.geo=placeGeo(d.physical_geo ?? null,label);
    }
    if (d.name) original.name={...original.name,official:String(d.name)};
    if (d.state==="DUPLICATE_SOURCE_ROW") original.upstream={...original.upstream,canonical_source_id:d.canonical_source_id};
    if (d.mass) {
      schedules.push(createMassSchedule(original.venue_id,mainMinistry.ministry_id,d.mass,witness,mainSourceId));
    }
    const keys=new Set();
    for (const site of safeArray(d.physical_sites)) {
      invariant(site && typeof site.key === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(site.key),
        label + ": site key must be a stable lowercase slug");
      invariant(!keys.has(site.key), label + ": repeated physical site key");
      keys.add(site.key);
      invariant(stateSet.has(site.state), label + ": invalid physical site state");
      validateMass(site.mass,site.state,witness,label + "/" + site.key,asOf);
      const venueId = original.venue_id + "-pv-" + site.key;
      invariant(!venues.some(v=>v.venue_id===venueId),label + ": physical site ID collision");
      const siteSourceId=witnessId(label,witness,site.key);
      const source= createWitnessSource(siteSourceId,witness,label,site.name,retrievedAt);
      sources.push(source);
      const venue={
        ...original,venue_id:venueId,
        name:{official:String(site.name ?? "").trim(),alternate:[]},
        venue_type:site.venue_type ?? "chapel",
        address:cleanAddress(site.address,label + "/" + site.key),
        geo:placeGeo(site.geo ?? null,label + "/" + site.key),
        upstream:{...original.upstream,parent_source_id:label,physical_site_key:site.key},
        contact:{...original.contact,schedule_url:[witness.url]},
        capabilities:{
          sunday_mass:Boolean(site.sunday_mass),
          weekday_mass:Boolean(site.weekday_mass),
          mass_frequency:site.mass?.cadence ?? null,
        },
        publication_state:site.state,
        source_ids:[siteSourceId, ...(original.source_ids ?? [])],
        adjudication_source_id:siteSourceId,
      };
      invariant(venue.name.official,label + ": physical site name required");
      venues.push(venue);
      const ministryId="ao-ministry-" + venueId;
      ministries.push({
        ...mainMinistry,ministry_id:ministryId,venue_id:venueId,
        source_ids:[siteSourceId],
      });
      if (site.mass) schedules.push(createMassSchedule(venueId,ministryId,site.mass,witness,siteSourceId));
      physicalSiteCount+=1;
    }
  }
  return {venues,ministries,schedules,sources,exceptions,physicalSiteCount,decisionCount:chosen.length};
}
