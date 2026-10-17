import fs from 'node:fs';
import assert from 'node:assert/strict';
const page = fs.readFileSync(new URL('../previews/visible-mass-3d/index.html',import.meta.url),'utf8');
const code = fs.readFileSync(new URL('../previews/visible-mass-3d/viewer.js',import.meta.url),'utf8');
assert.match(page, /renderCanvas/);
assert.match(page, /viewer\.js/);
assert.match(page, /modelFile/);
assert.match(code, /SceneLoader\.ImportMeshAsync/);
assert.match(code, /AO_VISIBLE_MASS_MARKERS_V1/);
assert.match(code, /data\/glossary/);
assert.match(code, /G190/); // canonical chalice ID
assert.match(code, /G080/); // canonical tabernacle ID
assert.ok(!/MeshBuilder\.CreateBox\('altar/i.test(code),'must not generate a crude pretend altar');
console.log('Visible Mass 3D static contract passed (browser/runtime GLB load not covered).');
