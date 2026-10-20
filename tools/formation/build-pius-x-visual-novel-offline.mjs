#!/usr/bin/env node
/**
 * Build a genuinely offline, one-file St Pius X editorial reviewer.
 * Original research sources and approved P2 sprites remain canonical upstream.
 * This is a reproducible export, NEVER a publication build.
 */
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {createHash} from 'node:crypto';

const ROOT=resolve(new URL('../..',import.meta.url).pathname);
const ROOTREL=x=>resolve(ROOT,x);
const args=process.argv.slice(2);
const arg=key=>{const i=args.indexOf(key);return i<0?null:args[i+1]??null};
const OUTPUT=resolve(arg('--out')||ROOTREL('artifacts/pius-x-20path-visual-novel/St_Pius_X_Conversation_Review_Offline.html'));
const SPRITES=resolve(arg('--sprites')||ROOTREL('research-out/pius-x-approved-sprites'));
const readText=path=>readFile(ROOTREL(path),'utf8');
const researchBase='data/learn/research/';
const files=[
 'pius-x-20path-bilingual-choice-navigation-20261020.v1.json',
 'pius-x-source-bounded-bilingual-corrections-20261020.v1.json',
 'pius-x-chanoine-22-answer-aq04-aq05-eligibility-20261020.v1.json',
 'pius-x-historical-visual-novel-stage-20261020.v1.json',
 'pius-x-six-period-voice-candidates-20261020.v1.json',
 ...['a','b','c','d','e'].map(c=>'pius-x-batch9-sacraments-'+c+'-20261020.v1.json'),
 ...['a','b','c','d','e'].map(c=>'pius-x-batch10-eucharist-'+c+'-20261020.v1.json')
];
const embedded={};
for(const name of files){
 const path=researchBase+name;
 embedded[path]=JSON.parse(await readText(path));
}
if(Object.keys(embedded).length!==15)throw Error('Expected 15 source-owned JSON files');
const nav=embedded[researchBase+files[0]];
if(nav.counts?.chapters!==20||nav.counts?.mappedUniqueSourceQuestions!==100||
 nav.counts?.certifiedPublication!==0)throw Error('Unapproved source-owner navigation');
const expected=embedded[researchBase+files[3]];
if(expected.referencedOwners?.sprites?.commit!=='0a920793bcdf40cc053ad0aff31132ade8185a33'||
 expected.publication!=='REVIEW_ONLY')throw Error('Unpinned approved portrait references');
const manifest=JSON.parse(await readFile(resolve(SPRITES,'manifest.json'),'utf8'));
if(manifest.schema!=='AO_LIVING_CHURCH_SPRITES_LOCKED_V1'||manifest.publication!=='REVIEW_ONLY')
 throw Error('Missing P2 original approved sprite manifest');
const sprites={};
for(const pose of ['neutral','welcoming','explaining','thoughtful','grave']){
 const file='pius_'+pose+'.webp';
 const bytes=await readFile(resolve(SPRITES,file));
 const hash=createHash('sha256').update(bytes).digest('hex');
 if(manifest.variants?.[file]?.sha256!==hash)throw Error('Sprite hash mismatch: '+file);
 sprites[pose]='data:image/webp;base64,'+bytes.toString('base64');
}
let html=await readText('previews/visible-mass-3d/pius-x-conversation-paths-review.html');
let helper=await readText('previews/visible-mass-3d/pius-x-20path-editorial-review.mjs');
helper=helper.replace('export const PIUS_X_20PATH_REVIEW_VERSION','const PIUS_X_20PATH_REVIEW_VERSION')
 .replace('export async function createPiusX20PathReview','async function createPiusX20PathReview');
if(helper.split(String.fromCharCode(10)).some(line=>line.trimStart().startsWith('export ')))throw Error('Unexpected further helper exports');
const importLine='import {createPiusX20PathReview} from "./pius-x-20path-editorial-review.mjs";';
if(!html.includes(importLine))throw Error('Review HTML import contract changed');
const safeLiteral=x=>JSON.stringify(x).replace(/</g,'\\u003c');
html=html.replace(importLine,
 'const EMBEDDED_SOURCE='+safeLiteral(embedded)+';\n'+
 'const EMBEDDED_SPRITES='+safeLiteral(sprites)+';\n'+helper);
const externalRead=/const read=async path=>\{[\s\S]*?\n\};/;
if(!externalRead.test(html))throw Error('HTTP source reader contract changed');
html=html.replace(externalRead,
 'const read=async path=>{\n'+
 ' if(!Object.prototype.hasOwnProperty.call(EMBEDDED_SOURCE,path))throw Error("Unknown original source: "+path);\n'+
 ' return EMBEDDED_SOURCE[path];\n};');
const portraitExpression='img.decoding="async";img.src=entry.visual.portraitUrl;';
if(!html.includes(portraitExpression))throw Error('Portrait loading changed');
html=html.replace(portraitExpression,
 'img.decoding="async";img.src=EMBEDDED_SPRITES[entry.visual.pose]||entry.visual.portraitUrl;');
if(html.includes(importLine)||html.includes('const read=async path=>{\n if(!/^data'))throw Error('Unbundled dependency');
html=html.replace('</title>','</title>\n<meta name="robots" content="noindex,nofollow">');
html='<!-- SOURCE-OWNED PRIVATE EDITORIAL PREVIEW: no publication, no historical verbatim speech. -->\n'+html;
await mkdir(dirname(OUTPUT),{recursive:true});
await writeFile(OUTPUT,html,'utf8');
console.log(JSON.stringify({file:OUTPUT,bytes:Buffer.byteLength(html),sourceFiles:files.length,
 pinnedPortraitVariants:Object.keys(sprites).length,questions:100,published:0}));
