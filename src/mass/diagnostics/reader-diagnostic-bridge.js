
(()=>{
 const AO=window.AO=window.AO||{};
 AO.ReaderDiagnostics=Object.freeze({
   build:'v1.75_R14_INTEGRATION_CANDIDATE',
   focus:()=>AO.FocusAudit?.run?.()||null,
   unified:()=>AO.UnifiedAudit?.run?.()||null,
   missal:()=>({pairs:document.querySelectorAll('body[data-mode=\"read\"] .flow-unit.missal-pair').length,sermonInterstitial:!!document.querySelector('body[data-mode=\"read\"] .pause-unit.missal-interstitial')}),missalAll:()=>AO.MissalAudit?.runAllCards?.()||null,focusAll:()=>AO.FocusAudit?.runAllCards?.()||null,missaCantata:()=>AO.MissaCantataAudit?.run?.()||null,solemnMass:()=>AO.SolemnMassAudit?.run?.()||null
 });
})();
