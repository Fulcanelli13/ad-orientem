// Display-only Calendar colour precedence. Do not modify the resolved Mass,
// liturgical action graph, or ceremonial phase sequence.
export function calendarMassColour(resolved){
  const plan=resolved?.colourPlan;
  const proper=resolved?.proper?.data??{};
  const day=resolved?.day?.main??{};
  // Good Friday is a liturgical action, not a Mass. Its black opening
  // phase is the Calendar's identifying colour; Communion later uses violet.
  // Match the canonical 1962 Temporale source ID, never the civil date.
  const nonMassPassionAction=/^tempora:Quad6-5r:/.test(String(day.id??""));
  if(nonMassPassionAction)return String(plan?.primary||proper.color||day.color||"");
  // Other composite rites retain their Mass colour:
  // Palm Sunday red->violet; Easter Vigil violet->white;
  // Pentecost Vigil violet->red.
  return String(plan?.massColor||proper.color||proper.colour||day.color||day.colour||plan?.primary||"");
}
