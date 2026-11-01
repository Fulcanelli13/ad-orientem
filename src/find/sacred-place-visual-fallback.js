// A visual fallback for the SAME physical Place, not an image, official arms,
// TLM institute symbol, or evidence of an ecclesiastically recognized shrine.
// Reuses the CHURCH/SHRINE/PILGRIMAGE medallion geometry from the Explore map.
const strokes=Object.freeze({
  CHURCH:"M19 61 H65 M24 61 V34 L42 20 L60 34 V61 M35 61 V45 Q42 35 49 45 V61 M42 19 V10 M36 14 H48",
  SHRINE:"M20 63 H64 M26 63 V31 Q42 11 58 31 V63 M32 59 V39 Q42 28 52 39 V59 M42 30 V20 M37 25 H47",
  PILGRIMAGE:"M42 63 Q8 43 24 27 Q33 15 42 27 Q51 15 60 27 Q76 43 42 63 M42 63 L24 27 M42 63 L31 23 M42 63 L42 26 M42 63 L53 23 M42 63 L60 27",
});
export function sacredPlaceFallbackKind(profile={}){
  const type=String(profile?.place_type??"").toLowerCase();
  if(type==="pilgrimage_destination")return "PILGRIMAGE";
  if(type==="shrine")return "SHRINE";
  return "CHURCH";
}
export function renderSacredPlaceFallback(profile={},language="en",variant="preview"){
  const kind=sacredPlaceFallbackKind(profile);
  const en=language!=="fr";
  const cls=variant==="detail"?"aoExplorePlaceMedia":"aoHeritagePlaceThumb";
  const label=en?"Illustrative place-category symbol; no photograph approved for this place":
    "Symbole illustratif de la catégorie du lieu ; aucune photographie approuvée pour ce lieu";
  const caption=en?"Illustrative place symbol · no approved photograph":
    "Symbole illustratif du lieu · aucune photographie approuvée";
  return '<figure class="'+cls+' aoSacredPlaceSymbolFallback" data-visual-kind="category-symbol" data-symbol-kind="'+kind+'">'+
    '<span class="aoSacredPlaceSymbolPlate" role="img" aria-label="'+label+'">'+
    '<svg viewBox="0 0 84 84" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">'+
    '<circle cx="42" cy="42" r="37" fill="#ebe2d1" stroke="#b99c6b" stroke-width="3.2"/>'+
    '<path d="'+strokes[kind]+'" fill="none" stroke="#655137" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>'+
    '</svg></span><figcaption>'+caption+'</figcaption></figure>';
}
