#!/usr/bin/env node
// Derived research queue ONLY. The P91 canonical ledger remains the single source of truth.
// Usage: node docs/research/directory/p92-exact-site-bulk-20261029/generate-held-sites.mjs > /tmp/p92-held-sites.json
import {readFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const here=dirname(fileURLToPath(import.meta.url));
const data=JSON.parse(readFileSync(resolve(here,'../p91-source-pin-visual-reconciliation-20261029/p91-all-385-canonical-evidence.json'),'utf8'));
const groups=new Map();
for(const r of data.records){
  if(r.effective_image_site_disposition!=='HELD_UNVERIFIED')continue;
  const id=r.physical_anchor_id;
  if(!groups.has(id))groups.set(id,{
    physical_anchor_id:id,country:r.country,site_name:r.place_name,
    site_context_source_url:r.target_site_context?.original_source_url||null,
    photos:[]
  });
  groups.get(id).photos.push({contact_index:r.contact_index,commons_file_title:r.commons_file_title,
    source_url:r.source_url,p90_previous_status:r.p90_previous_status});
}
const sites=[...groups.values()].sort((a,b)=>b.photos.length-a.photos.length||a.country.localeCompare(b.country)||a.site_name.localeCompare(b.site_name));
const multiple=sites.filter(s=>s.photos.length>=3);
if(sites.length!==data.unresolved_distinct_physical_site_ids || sites.reduce((sum,s)=>sum+s.photos.length,0)!==data.effective_image_site_disposition_counts.HELD_UNVERIFIED)throw new Error('Unexpected held queue totals; regenerate after validating the canonical ledger');
process.stdout.write(JSON.stringify({source:"one canonical P91–current-pass evidence ledger",editorial_or_publication_approval:false,
  total_sites:sites.length,total_held_photos:sites.reduce((sum,s)=>sum+s.photos.length,0),priority_multiphoto_sites:multiple.length,
  priority_multiphoto_images:multiple.reduce((sum,s)=>sum+s.photos.length,0),sites},null,2)+'\n');
