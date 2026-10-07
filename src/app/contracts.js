export const APP_SURFACES = Object.freeze([
  "home",
  "mass",
  "pray",
  "learn",
  "calendar",
  "settings",
]);

export const APP_ROUTE_SURFACES = Object.freeze([...APP_SURFACES, "find"]);

const APP_SURFACE_SET = new Set(APP_ROUTE_SURFACES);

export const CORE_MASS_ROUTES = Object.freeze([
  "live",
  "prepare",
  "thanksgiving",
]);

const CORE_MASS_ROUTE_SET = new Set(CORE_MASS_ROUTES);

// Source-of-truth contract recovered from the locked non-Mass head.
// These names identify legacy presentation owners while they are extracted into
// modules; they are not permission to revive the pre-R17 Mass renderer.
export const NON_MASS_DONOR_CONTRACT = Object.freeze({
  release: "43.59.30",
  canonicalHead: "v43.59.30",
  topLevel: APP_SURFACES,
  sourcesTopLevelVisible: false,
  homeOwner: "AO_NAV_V362",
  domainShellOwner: "AO_V37_SHELL",
  settingsOwner: "AO_SETTINGS_APP_V1",
  settingsDonorOwner: "AO_SETTINGS_V4359",
  prayerOwner: "AO_PRAY_V435930",
  calendarModuleId: "today.calendar",
});

export function normalizeAppSurface(value) {
  const normalized = String(value ?? "").trim().toLowerCase();
  const canonical = normalized === "formation" ? "learn" : normalized;
  return APP_SURFACE_SET.has(canonical) ? canonical : null;
}

export function isMassCoreRoute(route) {
  return CORE_MASS_ROUTE_SET.has(String(route ?? "").trim().toLowerCase());
}

export function surfaceForCoreRoute(route, fallback = "home") {
  if (isMassCoreRoute(route)) return "mass";
  return normalizeAppSurface(fallback) ?? "home";
}
