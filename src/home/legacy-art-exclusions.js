/* Fail-closed Home protection for superseded historic Proper-art selections.
 * This only filters the legacy Home donor; it does not approve replacements.
 * Keep the original research/ratings unchanged.
 */
const EXCLUDED_HISTORIC_IDS=new Set(["AO001","AO015","AO105","AO084"]);
const artistName=value=>String(value??"").normalize("NFKD")
  .replace(/[\u0300-\u036f]/g,"").toLowerCase();

export function legacyHomeArtworkExcluded({artworkId,artist,alt,caption}={}){
  if(EXCLUDED_HISTORIC_IDS.has(String(artworkId??"").toUpperCase()))return true;
  return [artist,alt,caption].some(value=>
    /(?:^|[^a-z])(?:fra\s+angelico|el\s+greco)(?:$|[^a-z])/.test(artistName(value)));
}

export function removeExcludedLegacyHomeArtwork(slot){
  if(!slot?.querySelectorAll)return 0;
  let removed=0;
  for(const figure of [...slot.querySelectorAll("figure.aoProperArt, [data-ao-proper-art]")]){
    const img=figure.querySelector?.("img");
    const caption=figure.querySelector?.("figcaption");
    if(!legacyHomeArtworkExcluded({
      artworkId:figure.getAttribute?.("data-ao-proper-art"),
      artist:caption?.querySelector?.("strong")?.textContent,
      alt:img?.getAttribute?.("alt"),
      caption:caption?.textContent
    }))continue;
    figure.remove?.();
    removed++;
  }
  // Older donor versions lack data-ao-proper-art. Their <img> alt often
  // still names the painter; remove only the offending figure/image.
  for(const img of [...slot.querySelectorAll("img[alt]")]){
    if(img.isConnected===false)continue;
    if(!legacyHomeArtworkExcluded({alt:img.getAttribute?.("alt")}))continue;
    const target=img.closest?.("figure")??img;
    target.remove?.();
    removed++;
  }
  return removed;
}
