// Mass-specific liturgical palette. The selected/resolved celebration owns colour;
// the calendar is context, never an override for a votive Mass or Requiem.
// The seven named accents reproduce v1.80's v1.70 palette exactly; dark
// ambience surfaces are contextual additions. No Mass graph/text changes.
const PALETTES=Object.freeze({
  WHITE:Object.freeze({bg:"#191815",top:"#211f19",bottom:"#151410",panel:"#27231d",accent:"#d6caa6",accentText:"#e9dabc"}),
  RED:Object.freeze({bg:"#1b1014",top:"#271418",bottom:"#140b10",panel:"#2b191d",accent:"#b7736b",accentText:"#e5a5a4"}),
  GREEN:Object.freeze({bg:"#101a14",top:"#15241b",bottom:"#0b130f",panel:"#1a2a20",accent:"#6d9575",accentText:"#b2d0b5"}),
  VIOLET:Object.freeze({bg:"#17121e",top:"#21182b",bottom:"#110d18",panel:"#271d31",accent:"#927aa2",accentText:"#c7b5d9"}),
  ROSE:Object.freeze({bg:"#21151d",top:"#2d1d29",bottom:"#170e15",panel:"#33212f",accent:"#c58e9f",accentText:"#ecc0d5"}),
  BLACK:Object.freeze({bg:"#0c0e12",top:"#111319",bottom:"#08090d",panel:"#1b1c23",accent:"#a8aaa6",accentText:"#c4c5d1"}),
  GOLD:Object.freeze({bg:"#1d1710",top:"#292015",bottom:"#141009",panel:"#302619",accent:"#c7aa6d",accentText:"#f0d5a5"}),
  // An unresolved celebration must not silently become a green Mass.
  NEUTRAL:Object.freeze({bg:"#080c12",top:"#10151c",bottom:"#080b10",panel:"#181e27",accent:"#929ba8",accentText:"#c6cdd5"}),
});
const COLOUR_ALIASES=Object.freeze({
  WHITE:"WHITE",BLANC:"WHITE",BIANCO:"WHITE",
  RED:"RED",ROUGE:"RED",ROSSO:"RED",
  GREEN:"GREEN",VERT:"GREEN",VERDE:"GREEN",
  VIOLET:"VIOLET",PURPLE:"VIOLET",VIOLETTE:"VIOLET",
  ROSE:"ROSE",PINK:"ROSE",ROSA:"ROSE",
  BLACK:"BLACK",NOIR:"BLACK",NERO:"BLACK",
  GOLD:"GOLD",OR:"GOLD",AUREUS:"GOLD",
});
const CSS_KEYS=Object.freeze(["bg","top","bottom","panel","accent","accentText"]);

export function normalizeMassLiturgicalColour(value){
  if(value==null)return null;
  if(typeof value==="object")return normalizeMassLiturgicalColour(value.colour??value.color??value.name??value.label);
  const raw=String(value).trim().toUpperCase().replace(/[\s-]+/g,"_");
  return COLOUR_ALIASES[raw]??null;
}

export function resolveMassLiturgicalTheme(prepared={}){
  const resolved=prepared?.session?.resolvedMass??{};
  const legacy=prepared?.legacyResolvedMass??{};
  const proper=resolved.proper?.data??resolved.proper??{};
  const legacyProper=legacy.proper?.data??legacy.proper??{};
  // The selected Proper is first. Calendar colour is only a last resort.
  const candidates=[
    ["SELECTED_PROPER",proper.liturgicalColour??proper.liturgicalColor??proper.colour??proper.color],
    ["SELECTED_PROPER",legacyProper.liturgicalColour??legacyProper.liturgicalColor??legacyProper.colour??legacyProper.color],
    ["RESOLVED_CELEBRATION",legacy.colourPlan?.name??legacy.colourPlan?.label??legacy.colourPlan?.colour??legacy.colourPlan?.color],
    ["RESOLVED_CELEBRATION",legacy.liturgicalColour??legacy.liturgicalColor??legacy.colour??legacy.color],
    ["RESOLVED_CELEBRATION",resolved.provenance?.liturgicalColour??resolved.provenance?.liturgicalColor??resolved.provenance?.colour??resolved.provenance?.color],
    ["ACTUAL_CELEBRATION",resolved.actualCelebration?.colour??resolved.actualCelebration?.color],
    ["CALENDAR_FALLBACK",legacy.calendarDay?.main?.colour??legacy.calendarDay?.main?.color??legacy.calendarDay?.colour??legacy.calendarDay?.color],
    ["CALENDAR_FALLBACK",resolved.calendarCelebration?.colour??resolved.calendarCelebration?.color],
  ];
  for(const [source,raw] of candidates){
    const key=normalizeMassLiturgicalColour(raw);
    if(key)return Object.freeze({key,source,tokens:PALETTES[key],resolved:true});
  }
  return Object.freeze({key:"NEUTRAL",source:"UNRESOLVED",tokens:PALETTES.NEUTRAL,resolved:false});
}

export function massThemeCssVariables(theme){
  const tokens=theme?.tokens??PALETTES.NEUTRAL;
  return CSS_KEYS.map(key=>"--ao-mass-"+key.replace(/[A-Z]/g,x=>"-"+x.toLowerCase())+":"+tokens[key]).join(";");
}

export const MASS_LITURGICAL_PALETTES=PALETTES;
