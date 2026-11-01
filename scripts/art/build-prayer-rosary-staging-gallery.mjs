#!/usr/bin/env node
/**
 * Source-image contact gallery for Prayer Rosary QA only.
 * Reads the corrected master and archived-source ledger; does not publish to
 * the app or authorize replacement/rotation of user-approved originals.
 */
import {readFileSync,existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {dirname} from 'node:path';

const base='data/prayer/artwork-editorial-20261101/';
const master=JSON.parse(readFileSync(base+'curatorial-master-267-20261101.v1.json','utf8'));
const queue=JSON.parse(readFileSync(base+'photo-release-acquisition-queue-267-20261101.v1.json','utf8'));
const output='docs/research/prayer-rosary-source-contact-gallery-20261101.md';
const slots=new Map(master.assignments.map(x=>[x.slot,x]));
const bySlot=new Map(queue.queue.flatMap(x=>x.slots.map(s=>[s,x])));
const esc=x=>String(x??'').replace(/&/g,'&amp;').replace(/</g,'&lt;')
  .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const filePath=p=>p&&/^assets\/staged\/prayer-artwork-originals-20261101\/[a-z0-9-]+\.jpg$/.test(p)
  && existsSync(p)?'../../'+p:null;
const groupDefinitions=[
 ['Joyful mysteries',[2,3,4,5,6]],
 ['Sorrowful mysteries',[7,8,9,10,11]],
 ['Glorious mysteries',[12,13,14,15,16]]
];
const number=i=>String(i).padStart(2,'0');
const chosen=(slot)=>{
 const m=slots.get(slot),q=bySlot.get(slot);
 if(!m)throw new Error('Unknown Rosary slot '+slot);
 const p=m.currentAssignment.painting;
 const files=(q?.archivedSourceFiles||[]).filter(x=>filePath(x.archivePath));
 const first=files[0]||null;
 const selected=p?{artist:p.artist||'',title:p.title||'',sourcePage:p.sourcePage||null}:null;
 return {slot,label:m.label,selected,held:m.currentAssignment.mode==='HOLD_NO_ELIGIBLE_PRIMARY',
  currentStatus:m.editorialStatus,files,first,sourceState:q?.photographReleaseState||'NO_SELECTED_SOURCE'};
};
const imgCell=(x)=>{
 const title=x.selected?esc(x.selected.title):'No active primary';
 const artist=x.selected?esc(x.selected.artist):'Awaiting exact-scope resolution';
 const image=x.first?'<a href="'+esc('../../'+x.first.archivePath)+'"><img alt="'+title+
   ' — original photo not visually certified" src="'+esc('../../'+x.first.archivePath)+'" width="168"></a>'
   :'<div><strong>'+(x.held?'EDITORIAL HOLD':'NO ARCHIVED PHOTO')+'</strong></div>';
 const license=x.first?'<p><small>Photo licence reported: '+esc(x.first.licenseReported||'unverified')+
   ' · Visual QA pending</small></p>':'<p><small>Original-file source required</small></p>';
 const photoSrc=x.first?'<p><small><a href="'+esc(x.first.sourcePage||'#')+'">Source photograph</a></small></p>':'';
 return '<td valign="top" width="20%"><strong>'+esc(x.label)+'</strong><p>'+image+
   '</p><strong>'+title+'</strong><p><small>'+artist+'</small></p>'+license+photoSrc+'</td>';
};
const table=arr=>'<table><tbody><tr>'+arr.map(imgCell).join('')+'</tr></tbody></table>';
const cover=chosen('COV-pray.rosary');
const myst=Array.from({length:15},(_,i)=>chosen('STG-pray.rosary-'+number(i+2)));
const archived=myst.filter(x=>x.first);
if(archived.length!==11)throw new Error('Expected eleven Rosary mysteries with staged actual originals, got '+archived.length);
if(!cover.first)throw new Error('Fixed Lotto cover source is not archived');
if(!master.finalProtectedCovers.some(([s])=>s==='COV-pray.rosary'))throw new Error('Rosary cover lock missing');
const contents=[
 '# Rosary — actual original-source contact gallery (research only)',
 '',
 '**Original painting selection is unchanged.** These are source photographs, not cropped/released Prayer UI images. A visible image below only means an exact-original file is archived with a checksum; it does **not** mean that framing, credit, file rights or mobile crops were approved. Never create a rotation or an image change on individual Hail Mary beads.',
 '',
 'Staged mystery originals: **11 / 15**. Fixed Lotto cover: **archived**. Unstaged or held mysteries: **4 / 15**. Closing Salve Regina artwork is an additional held slot. App publication-certified images: **0**.',
 '',
 '## Fixed cover and opening',
 '',
 table([cover]),
 '',
 'The Lotto full-composition file is the cover source. A second archived source photograph is a detail reference, **not** automatic cover rotation.',
 '',
 ...groupDefinitions.flatMap(([title,ids])=>{
  const records=ids.map(i=>chosen('STG-pray.rosary-'+number(i)));
  return ['## '+title,'',table(records),''];
 }),
 '## Closing prayers — Salve Regina','',
 'The closing artwork remains on hold. An approved *Coronation* painting does not automatically become the closing *Salve Regina* image. Do not invent a replacement.',
 '',
 '## Remaining acquisition and editorial blockers','',
 '- **Nativity (mystery 3):** Rubens *Adoration of the Magi* is explicitly accepted for this devotional association. The existing Prado-origin photograph is barred; acquire a verified non-Prado photograph of **the same original**, not another painting.',
 '- **Ascension (mystery 12):** the selected David Teniers copy after Bassano is known, but the existing Commons source is 553 × 800 and cannot pass the current native-photo floor. Do not replace the work with another Ascension.',
 '- **Pentecost (mystery 13):** the existing Mateo Cerezo file is 567 × 479. Seek a higher-resolution photo of the same original.',
 '- **Coronation (mystery 15):** the primary remains held. Lochner and Carracci are both previously accepted **Coronation-specific alternatives**; no automatic primary selection.',
 '- **Salve Regina closing:** separate held placement, not the sixteenth mystery.',
 '',
 '## Release safeguards','',
 'The exact-original catalogue and staged photograph files must each retain original IDs, actual rights and provenance, dimensions, checksums, mobile/desktop crop QA, source photograph credit and modification disclosure. This contact sheet grants **no new user approval**, **no derivative artwork licence** and **no release manifest entry**.',
 '',
 'Source ledgers: [267-position master](../../data/prayer/artwork-editorial-20261101/curatorial-master-267-20261101.v1.json), [124-group acquisition inventory](../../data/prayer/artwork-editorial-20261101/photo-release-acquisition-queue-267-20261101.v1.json), [B02 photo report](../../data/prayer/artwork-editorial-20261101/prayer-rosary-b02-acquisition-results.v1.json).',
 ''
].join('\n');
mkdirSync(dirname(output),{recursive:true});
writeFileSync(output,contents);
console.log(JSON.stringify({output,mysteries:15,archivedMysteries:archived.length,coverArchived:true,publishedImages:0,bytes:contents.length},null,2));
