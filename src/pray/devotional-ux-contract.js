export const DEVOTIONAL_UX_CONTRACT_VERSION="devotional-ux-v1";

export const DEVOTIONAL_UX_RULES=Object.freeze({
  guideInfo:"Every devotional module exposes an optional Guide / About layer for origin, structure, practice and sources without blocking prayer.",
  bodilyCues:"Modules with real bodily choreography may expose animated posture, gesture or action rails; uncertain local customs must not be invented.",
  groupMode:"Where the source supports communal recitation, Individual / Group presentation is first-class and V./R. ownership remains explicit.",
  mobileAxes:"Vertical movement scrolls the current text; deliberate horizontal swipes move between adjacent cards or stages.",
  back:"Back returns to the immediate parent screen while preserving in-session module state.",
  home:"Every module page exposes a separate Home action; Home is never an alias for Back.",
  state:"Opening Guide, a nested prayer or a handoff must not silently destroy the parent module state.",
  completion:"Guided progression and optional record keeping are separate concepts; spiritual acts are never inferred or automatically certified.",
});

export const DEVOTIONAL_GROUP_CAPABLE=Object.freeze([
  "pray.stations",
  "pray.benediction",
  "pray.litany_saints",
  "pray.rosary",
]);

export const DEVOTIONAL_RAIL_CAPABLE=Object.freeze([
  "pray.stations",
  "pray.benediction",
  "pray.adoration",
  "pray.confession",
  "pray.forty_hours",
]);

export const DEVOTIONAL_SWIPE_CAPABLE=Object.freeze([
  "pray.stations",
  "pray.confession",
  "pray.benediction",
  "pray.adoration",
  "pray.penitential_psalms",
  "pray.litany_saints",
  "pray.seven_words",
  "pray.forty_hours",
  "programme.first_friday",
  "programme.first_saturday",
]);

export function devotionalUxContract(){
  return Object.freeze({
    version:DEVOTIONAL_UX_CONTRACT_VERSION,
    rules:DEVOTIONAL_UX_RULES,
    groupCapable:DEVOTIONAL_GROUP_CAPABLE,
    railCapable:DEVOTIONAL_RAIL_CAPABLE,
    swipeCapable:DEVOTIONAL_SWIPE_CAPABLE,
  });
}
