/* R19 deterministic parser-time reader loader.
   Transport representation only: reconstructs the frozen v1.76 reader source
   from exact source parts, then inserts it as a classic parser script. */
(() => {
  'use strict';
  const current = document.currentScript;
  if (!current || !current.src) throw new Error('R19 reader loader requires an external script URL.');
  const base = new URL('./reader-runtime-v1.76.parts/', current.src);
  const parts = ["part-000.js.part","part-001.js.part","part-002.js.part","part-003.js.part","part-004.js.part","part-005.js.part","part-006.js.part","part-007.js.part","part-008.js.part","part-009.js.part","part-010.js.part","part-011.js.part","part-012.js.part","part-013.js.part","part-014.js.part","part-015.js.part","part-016.js.part","part-017.js.part","part-018.js.part","part-019.js.part"];
  let source = '';
  for (const name of parts) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', new URL(name, base).href, false);
    xhr.send(null);
    if ((xhr.status !== 0 && (xhr.status < 200 || xhr.status >= 300)) || xhr.responseText == null) {
      throw new Error('R19 reader part failed: ' + name + ' (' + xhr.status + ')');
    }
    source += xhr.responseText;
  }
  if (source.length !== 6578563) {
    throw new Error('R19 reader reconstruction length mismatch: ' + source.length);
  }
  document.write('<script data-r19-reconstructed-reader="v1.76">' + source + '<\\/script>');
})();
