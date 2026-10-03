/* R20 browser-parity compatibility shim.
   This file is intentionally outside the frozen v1.76 extraction manifest.
   It repairs diagnostics object mutability only; no Mass data or ritual state is changed. */
(() => {
  'use strict';
  const AO = window.AO = window.AO || {};
  const audit = AO.LowMassAudit;
  if (audit && typeof audit.run === 'function' && Object.isFrozen(audit) && !Object.prototype.hasOwnProperty.call(audit, 'last')) {
    let lastAudit = null;
    AO.LowMassAudit = Object.freeze({
      run: audit.run,
      get last() { return lastAudit; },
      set last(value) { lastAudit = value; }
    });
  }
})();
