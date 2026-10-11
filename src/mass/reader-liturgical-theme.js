// Mass-specific palette: the actual selected Proper/celebration owns the colour.
// Dark neutral surfaces are the foundation in EVERY season; colour is an accent,
// never a saturated green (or purple/red) background. Liturgical white is white,
// not gold. Black uses a charcoal accent and contrasting silver text so it remains
// identifiable without black-on-black illegibility.
// The calendar can only supply Mass colour as a last resort for unresolved Proper.
const PALETTES=Object.freeze({
  WHITE:Object.freeze({bg:"#080b10",top:"#11151a",bottom:"#070a0e",panel:"#171c22",accent:"#eff0ed",accentText:"#f7f7f4"}),
  RED:Object.freeze({bg:"#0c0b10",top:"#16141b",bottom:"#090910",panel:"#1c1b23",accent:"#b7736b",accentText:"#e5a5a4"}),
  GREEN:Object.freeze({bg:"#090e10",top:"#11181a",bottom:"#080b0e",panel:"#182124",accent:"#6d9575",accentText:"#b2d0b5"}),
  VIOLET:Object.freeze({bg:"#0c0b11",top:"#17151e",bottom:"#080910",panel:"#201d27",accent:"#927aa2",accentText:"#c7b5d9"}),
  ROSE:Object.freeze({bg:"#0e0b11",top:"#19141d",bottom:"#090911",panel:"#241d28",accent:"#c58e9f",accentText:"#ecc0d5"}),
  BLACK:Object.freeze({bg:"#050609",top:"#0b0d12",bottom:"#040507",panel:"#11141a",accent:"#50545c",accentText:"#aeb5be"}),
  GOLD:Object.freeze({bg:"#0e0c0a",top:"#1a1714",bottom:"#090909",panel:"#231e18",accent:"#c7aa6d",accentText:"#f0d5a5"}),
  // Never silently render an unresolved celebration as a green Mass.
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
