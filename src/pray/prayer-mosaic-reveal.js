/** Prayer mosaic interaction only. Never owns canonical routes, texts, artwork or reader state.
 * First activation reveals a category as in the approved 27 October mosaic study.
 * Second activation returns false so the existing source-owned route handler can open it.
 */
export function revealPrayerMosaicTile(tile){
  if(!tile?.matches?.('[data-ao-pray-pilot-tile]'))return false;
  const mosaic=tile.closest?.('[data-ao-pray-pilot-mosaic]');
  if(!mosaic)return false;
  const alreadyOpen=tile.getAttribute('aria-expanded')==='true';
  for(const candidate of mosaic.querySelectorAll('[data-ao-pray-pilot-tile]')){
    candidate.setAttribute('aria-expanded',String(!alreadyOpen&&candidate===tile));
  }
  return !alreadyOpen;
}
export function clearPrayerMosaicReveal(scope){
  const expanded=scope?.querySelectorAll?.('[data-ao-pray-pilot-tile][aria-expanded="true"]')||[];
  for(const tile of expanded)tile.setAttribute('aria-expanded','false');
  return expanded.length>0;
}
