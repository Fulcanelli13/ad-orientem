import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
import assert from 'node:assert/strict';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const baseline=readFileSync(new URL('../legacy/Ad-Orientem-2.0-v43.33-ICON-OWNERSHIP-CONSOLIDATION.html',import.meta.url),'utf8');
let count=0;
for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
 if(/type=["'](?:application\/json|application\/ld\+json)/i.test(m[1])||!m[2].trim())continue;
 new Script(m[2]);count++;
}
// Changes may affect controls and persistence, never the embedded prayer corpus.
for(const marker of ['const D={','const AO_R_COMMENTARY_MAP =','const AO_PRAYER_FORMATION={']){
 const line=s=>s.split('\n').find(x=>x.startsWith(marker));assert.equal(line(html),line(baseline),marker);
}
assert(html.includes('swipe navigation disabled'));
assert(!html.includes("window.addEventListener('pointerdown',onPointerDown"));
assert(!html.includes("navigator.vibrate(pattern)"));
assert(html.includes('[data-pb-latin][hidden]'));
console.log(`PASS: ${count} inline scripts parse; prayer corpora unchanged; silent interaction and layout guards present.`);
