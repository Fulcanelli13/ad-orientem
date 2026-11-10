// Approved sanctuary geometry from owner-supplied 10 November 2026
// ad_orientem_live_handoff.zip / reference/live_prototype.html.
// REFERENCE COORDINATES ONLY. This module never owns Mass card sequence,
// omits cards, determines schola timing, moves the current reader, or
// overrides native rite/music/minister source-provenance controllers.
//
// IMPORTANT: src/plan_geometry.js in the handoff has PRE-OVERRIDE
// PULPIT=[80,250] and RAIL=[300,312]. The final prototype intentionally
// changes them to PULPIT=[131,229] and RAIL=[300,268]. Keep final values.
const freeze=Object.freeze;
const point=(x,y)=>freeze([x,y]);
export const LIVE_HANDOFF_GEOMETRY_SCHEMA="ao-live-handoff-2026-11-10-sanctuary-final-v1";
export const LIVE_HANDOFF_ORIENTATION=freeze({
 altarDirection:"RIGHT",gospelSide:"TOP",liturgicalEast:"RIGHT",
 sourceFrame:"X_GOSPEL_TO_EPISTLE_Y_ALTAR_TO_NAVE",
 noPlanLabels:true,signsOnly:true,
 massTextFirst:true,keepLeftAndRightGestureRails:true
});
export const LIVE_HANDOFF_SOURCE_POINTS=freeze({
 FOOT:point(300,190),CENTER:point(300,124),
 EPISTLE:point(408,124),GOSPEL:point(192,124),
 SEDILIA:point(500,175),
 PULPIT:point(131,229), // FINAL OVERRIDE, not the draft 80,250
 RAIL:point(300,268),   // FINAL OVERRIDE, inside rail, not 300,312
 AISLE:point(300,430),AISLE_T:point(300,330),
 AISLE_M:point(300,400),AISLE_E:point(300,470),
 E_END:point(440,124),G_END:point(160,124)
});
export const LIVE_HANDOFF_ALTAR_PLAN=freeze({
 sanctuaryRailY:296,priestRemainsInsideCommunionRail:true,
 lowCandles:2,sungCandles:6,solemnCandles:6,
 choir:"GOSPEL_SIDE_BACK_OF_NAVE",organ:"ADJACENT_TO_CHOIR",
 naveCentreAisle:"UNOBSTRUCTED",noForwardAltarTable:true,
 requiemFrontal:"BLACK",requiemTabernacleVeil:"VIOLET"
});
export const LIVE_HANDOFF_SOLEMN_COMMUNION_POSITIONS=freeze({
 DEACON:freeze([330,268,180]),SUBDEACON:freeze([270,268,180])
});
// Same transformation as the approved portrait prototype:
// translate(525 0) rotate(90) translate(300 0) scale(.86 .87)
// translate(-300 0). The coordinates below are already final overrides.
export function projectLiveHandoffPlanPosition(sourcePoint){
 if(!Array.isArray(sourcePoint)||sourcePoint.length!==2||
   sourcePoint.some(n=>typeof n!=="number"||!Number.isFinite(n)))
  return null;
 const [x,y]=sourcePoint;
 return freeze({x:525-.87*y,y:300+.86*(x-300)});
}
export function liveHandoffStationPoint(station){
 const key=String(station??"");
 return Object.hasOwn(LIVE_HANDOFF_SOURCE_POINTS,key)
  ?LIVE_HANDOFF_SOURCE_POINTS[key]:null;
}
const move=(station,rotation)=>freeze({station,rotation});
export const LIVE_HANDOFF_ASPERGES_ROUTE=freeze([
 move("FOOT",0),move("FOOT",90),move("AISLE_T",180),
 move("AISLE_T",90),move("AISLE_M",270),move("AISLE_M",90),
 move("AISLE_E",270),move("AISLE_E",360),move("AISLE_T",360),
 move("FOOT",360)
]);
export const LIVE_HANDOFF_INCENSATION_ROUTE=freeze([
 move("CENTER",0),move("E_END",0),move("CENTER",0),
 move("G_END",0),move("CENTER",0),move("EPISTLE",0),
 move("EPISTLE",90)
]);
// These are prototype card *reference numbers*, NOT native Mass-card IDs.
// Resolve to source-backed AO.LIVECURATED IDs before using any route in LIVE.
export const LIVE_HANDOFF_REFERENCE_TURNS=freeze({
 10:freeze([move("CENTER",0),move("CENTER",180),move("CENTER",0),move("EPISTLE",0)]),
 20:freeze([move("CENTER",0),move("CENTER",180),move("CENTER",0),move("CENTER",-30)]),
 26:freeze([move("CENTER",0),move("CENTER",180),move("CENTER",360)]),
 55:freeze([move("CENTER",0),move("CENTER",180),move("CENTER",0)]),
 56:freeze([move("CENTER",0),move("CENTER",180)]),
 60:freeze([move("CENTER",0),move("CENTER",180),move("CENTER",0),move("EPISTLE",0)]),
 61:freeze([move("CENTER",0),move("CENTER",180),move("CENTER",0)]),
 63:freeze([move("CENTER",0),move("CENTER",180),move("CENTER",270),move("GOSPEL",325)])
});
export const LIVE_HANDOFF_REFERENCE_CARD_COUNT=65;
export const LIVE_HANDOFF_EXTERNAL_RITE_IDS=freeze(["P1","P2","Q1"]);
export const LIVE_HANDOFF_GEOMETRY_PUBLICATION=freeze({
 stage:"RESEARCH_ADAPTER_NOT_MOUNTED",
 native65CardsRemainSoleAuthority:true,
 printed1962CeremonialPositionsVerified:false,
 solemnLayerIsDraft:true,
 latestReference:"reference/live_prototype.html",
 publicReaderChanged:false
});
