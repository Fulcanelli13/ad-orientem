// Retire duplicate host configuration controls only while the native
// Mass preparation screen is present. Keep the underlying host owner intact.
const LEGACY_SELECTORS="[data-ao-form],[data-ao-follow],[data-ao-follow-mode],[data-ao-mode],[data-ao-reader-mode]";
export function retireLegacyMassChoiceGrids(host,preflight){
 if(!host?.querySelectorAll||!preflight?.isConnected)return Object.freeze({retired:0});
 let retired=0;
 for(const grid of host.querySelectorAll(".aoChoiceGrid")){
  if(preflight.contains(grid)||!grid.querySelector(LEGACY_SELECTORS))continue;
  grid.hidden=true;
  grid.style.display="none";
  grid.dataset.aoLegacyChoiceRetired="true";
  const header=grid.previousElementSibling;
  if(header?.classList?.contains("aoFlowSection")){
   header.hidden=true;header.style.display="none";
   header.dataset.aoLegacyChoiceRetired="true";
  }
  retired++;
 }
 return Object.freeze({retired});
}
