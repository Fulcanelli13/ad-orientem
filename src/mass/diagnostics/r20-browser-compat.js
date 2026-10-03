/* R20 browser-parity compatibility shim.
   Outside the frozen v1.76 extraction manifest.
   Diagnostics-only: no Mass data, ritual state, text, routing or reader sequence changes. */
(() => {
  'use strict';
  const AO = window.AO = window.AO || {};
  const audit = AO.LowMassAudit;
  if (audit && typeof audit.run === 'function') {
    let lastAudit = null;
    const replacement = {
      run: audit.run,
      get last() { return lastAudit; },
      set last(value) { lastAudit = value; }
    };
    AO.LowMassAudit = Object.freeze(replacement);
  }
  document.documentElement.dataset.r20Compat = 'loaded';
})();
