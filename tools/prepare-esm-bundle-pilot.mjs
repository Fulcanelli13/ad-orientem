// EXPERIMENT ONLY. Replaces one copied Pages HTML entrypoint, not the source.
// The resulting dist is never deployed by this pilot workflow.
import {readFile,writeFile,stat} from "node:fs/promises";
import {resolve,dirname,join} from "node:path";
import {fileURLToPath} from "node:url";
const project=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const out=join(project,"dist/web-preview");
const indexPath=join(out,"index.html");
const bundle="ao-r17-entry.bundle.experimental.js";
const original='src="./src/mass/browser-entry.js"';
const replacement='src="./'+bundle+'"';
const html=await readFile(indexPath,"utf8");
if(html.split(original).length!==2)
 throw Error("PAGES_ESM_PILOT: expected exactly one source Mass entrypoint");
if(!html.includes('type="module" '+original))
 throw Error("PAGES_ESM_PILOT: entrypoint is no longer a module script");
const bytes=(await stat(join(out,bundle))).size;
if(bytes<1000||bytes>15_000_000)
 throw Error("PAGES_ESM_PILOT: unexpected bundle size "+bytes);
await writeFile(join(out,"index-baseline-pilot.html"),html);
await writeFile(indexPath,html.replace(original,replacement));
const actual=await readFile(indexPath,"utf8");
if(actual.includes(original)||!actual.includes(replacement))
 throw Error("PAGES_ESM_PILOT: replacement was not applied");
console.log(JSON.stringify({mode:"EXPERIMENTAL_NOT_FOR_DEPLOYMENT",
 sourceEntrypoint:"src/mass/browser-entry.js",
 bundle,bytes,baseline:"index-baseline-pilot.html",
 publishedSourceUnmodified:true}));
