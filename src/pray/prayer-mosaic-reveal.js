/** Prayer mosaic interaction only. Does not own routes, texts or artwork.
 * First activation reveals a category, second activates its existing owner.
 *
 * A Prayer route can update the gallery between pointer activations. Keep
 * the *selected tile identity* across DOM remounts rather than relying on
 * aria-expanded on the particular button that happened to receive tap one.
 * Reset on explicit new Hub entry, dismissal or successful second selection.
 */
let selectedTileId=null;
export function revealPrayerMosaicTile(tile){
 if(!tile?.matches?.('[data-ao-pray-pilot-tile]'))return false;
 const mosaic=tile.closest?.('[data-ao-pray-pilot-mosaic]');
 if(!mosaic)return false;
 const id=String(tile.dataset?.aoPrayPilotTile||"");
 if(!id)return false;
 const alreadyOpen=selectedTileId===id||tile.getAttribute('aria-expanded')==='true';
 selectedTileId=alreadyOpen?null:id;
 for(const candidate of mosaic.querySelectorAll('[data-ao-pray-pilot-tile]')){
  candidate.setAttribute('aria-expanded',String(!alreadyOpen&&candidate===tile));
 }
 return !alreadyOpen;
}
export function restorePrayerMosaicReveal(scope){
 const candidates=scope?.querySelectorAll?.('[data-ao-pray-pilot-tile]')||[];
 for(const tile of candidates)tile.setAttribute('aria-expanded',
  String(!!selectedTileId&&tile.dataset.aoPrayPilotTile===selectedTileId));
 return !!selectedTileId;
}
export function clearPrayerMosaicReveal(scope){
 selectedTileId=null;
 const expanded=scope?.querySelectorAll?.('[data-ao-pray-pilot-tile][aria-expanded="true"]')||[];
 for(const tile of expanded)tile.setAttribute('aria-expanded','false');
 return expanded.length>0;
}
