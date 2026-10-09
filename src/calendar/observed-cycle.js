/*
 * Source-identity classification of the observed 1962 Mass, NOT of a
 * civil date, vernacular feast title, Sunday, or candidate celebration.
 *
 * The donor's pinned IDs are normative *identifiers* here, not sufficient
 * proof of rank or the observed feast. The canonical DayResolver decides
 * precedence and can supply principalCycle itself in a future version.
 *
 * Pinned source of IDs:
 * mmolenda/missalemeum@f43359b7/backend/api/constants/common.py
 * https://github.com/mmolenda/missalemeum/blob/f43359b7a79a5a299158651eedf75cdaf0e43c94/backend/api/constants/common.py
 * Liturgical norms: Rubricae Breviarii et Missalis Romani (1960) nn. 48–58,
 * 91–99. No special-rite mode or votive choice is inferred here.
 */

const TEMPORAL_IN_SANCTI = Object.freeze(new Set([
  "10-du",  // Feast of Christ the King, last Sunday in October.
  "01-01",  // Octave day of the Nativity.
  "01-06",  // Epiphany.
  "01-13",  // Baptism of Our Lord.
  "12-24",  // Vigil of the Nativity.
  "12-25m1", "12-25m2", "12-25m3", // Three Nativity Mass forms.
]));

const validCycle = value => {
  const cycle=String(value??"").trim().toLowerCase();
  return cycle==="temporale"||cycle==="sanctorale"?cycle:null;
};

export function cycleFromCanonicalIdentity(id){
  const raw=String(id??"").trim().toLowerCase();
  if(/^tempora:[^:]+(?::|$)/.test(raw))return "temporale";
  const sancti=/^sancti:([^:]+)(?::|$)/.exec(raw);
  if(sancti)return TEMPORAL_IN_SANCTI.has(sancti[1])?"temporale":"sanctorale";
  // Explicit donor path fallback is permitted only for the observed
  // principal celebration (not arbitrary Proper data/votive candidates).
  const path=/^(tempora|sancti)\/([^/]+)$/.exec(raw);
  if(path)return path[1]==="tempora"?"temporale":TEMPORAL_IN_SANCTI.has(path[2])?"temporale":"sanctorale";
  return "unknown";
}

export function observedCycle(resolution){
  if(!resolution||resolution.status==="failed"||!resolution.day?.main)return "unknown";
  const main=resolution.day.main;
  // Canonical metadata, when present, owns the classification.
  const canonical=validCycle(main.principalCycle??main.calendarCycle??resolution.day.principalCycle??resolution.day.calendarCycle);
  if(canonical)return canonical;
  const byId=cycleFromCanonicalIdentity(main.id);
  if(byId!=="unknown")return byId;
  return cycleFromCanonicalIdentity(main.sourcePath??main.properPath??main.path);
}
