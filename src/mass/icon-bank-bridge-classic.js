/* Classic-script bridge for the legacy host icon asset bank.
 * Loaded on demand by the modular R17 browser entry because the host bank may
 * live in the classic global lexical environment rather than as a window property.
 */
(function bridgeR17HostIcons(win){
  try {
    if(!win.AO_R17_ICON_ASSETS && typeof AO_ASSETS!=="undefined" && AO_ASSETS){
      win.AO_R17_ICON_ASSETS=AO_ASSETS;
    }
  } catch {}
})(globalThis);
