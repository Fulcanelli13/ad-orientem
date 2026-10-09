// Display-only Calendar colour precedence. Do not modify the resolved Mass,
// liturgical action graph, or ceremonial phase sequence.
export function calendarMassColour(resolved){
  const plan=resolved?.colourPlan;
  const proper=resolved?.proper?.data??{};
  const day=resolved?.day?.main??{};
  // The first colour of a composite rite is not necessarily its Mass colour:
  // Palm Sunday red->violet; Easter Vigil violet->white;
  // Pentecost Vigil violet->red.
  return String(plan?.massColor||proper.color||proper.colour||day.color||day.colour||plan?.primary||"");
}
