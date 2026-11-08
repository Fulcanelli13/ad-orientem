import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {attachPublishedSiteContactEvidence} from "../src/find/tlm-site-contact-evidence.js";
import {renderTlmChurchProfile} from "../src/find/tlm-church-profile.js";

const data=JSON.parse(readFileSync(new URL(
 "../data/directory/cl27-site-contact-evidence-20261108.v1.json",import.meta.url),"utf8"));
const master=JSON.parse(readFileSync(new URL(
 "../data/directory/generated/cl2-physical-site-index.v1.json",import.meta.url),"utf8"));
assert.equal(master.schema,"AO_CL2_PHYSICAL_SITE_RUNTIME_INDEX_V1");
assert.equal(master.counts.effective_physical_sites,2579);
assert.equal(data.records.length,5);
const byAnchor=new Map(master.records.map(row=>[row[0],row]));
const fixtures=data.records.map(c=>{
 const x=byAnchor.get(c.cl2_anchor);
 assert.ok(x,"Production contact evidence cannot invent a CL2 venue");
 assert.equal(x[1].length,1);
 assert.equal(c.source_id,x[1][0]);
 assert.equal(c.canonical_name,x[2]);
 assert.equal(c.country,x[3]);
 assert.equal(c.physical_description,x[4]);
 assert.equal(c.existing_source_url,x[6][0]);
 assert.ok(x[5]==c.community_named_by_source||
  (x[5]==="SSPX"&&c.community_named_by_source==="FSSPX District de France"));
 return Object.freeze({
  kind:"TLM_VENUE",item_id:"tlm:cl2:"+c.cl2_anchor,
  source_id:c.source_id,physical_group_id:c.cl2_anchor,source_ids:[c.source_id],
  country_code:c.country,title:c.canonical_name,
  subtitle:c.physical_description,source_location_description:c.physical_description,
  community_id:"OTHER",status:"RESEARCH-LISTED · MASS UNVERIFIED",
  source_links:[{url:c.existing_source_url,title:"Original listing"}],
  geo:null,map_publishable:false,
 });
});
const unrelated=Object.freeze({kind:"TLM_VENUE",source_id:"UNRELATED",
 source_ids:["UNRELATED"],physical_group_id:"RG-000000000000",
 country_code:"FR",title:"Unrelated church",source_links:[]});
const enriched=attachPublishedSiteContactEvidence([...fixtures,unrelated],data);
assert.equal(enriched.length,6);
assert.equal(enriched.filter(x=>x.site_contact_evidence).length,5);
assert.equal(enriched[5],unrelated);
for(let i=0;i<5;i++){
 const c=data.records[i],item=enriched[i],original=fixtures[i];
 assert.equal(original.site_contact_evidence,undefined,"Input must not be mutated");
 assert.equal(item.site_contact_evidence.cl2_anchor,c.cl2_anchor);
 assert.equal(item.source_id,c.source_id);
 assert.equal(item.physical_group_id,c.cl2_anchor);
 assert.deepEqual(item.source_links,original.source_links);
 assert.equal(item.raw,undefined);
 for(const lang of ["en","fr"]){
  const html=renderTlmChurchProfile(item,lang);
  assert.ok(html.includes('data-cl27-site-contact="'+c.cl2_anchor+'"'));
  assert.ok(html.includes(c.review_source_url.replaceAll("&","&amp;")));
  assert.ok(html.includes(c.public_phone));
  assert.ok(html.includes(c.community_named_by_source));
  assert.ok(html.includes(lang==="fr"?c.note_fr:c.note_en));
  assert.ok(html.includes(lang==="fr"?"Les horaires":"Mass times"));
  assert.ok(!html.includes("09:00")&&!html.includes("18:30"),
   "Contact evidence must not masquerade as an approved Mass timetable");
 }
}
function mustReject(items,manifest){
 assert.throws(()=>attachPublishedSiteContactEvidence(items,manifest));
}
mustReject(fixtures,data); // No silently publishing a partial geographical group
const malformed=structuredClone(data);
malformed.records[0].una_cum="YES";
mustReject([...fixtures,unrelated],malformed);
const wrongSite=[...fixtures];
wrongSite[0]={...wrongSite[0],physical_group_id:"RG-000000000001"};
mustReject(wrongSite,data);
const wrongCountry=[...fixtures];
wrongCountry[1]={...wrongCountry[1],country_code:"CA"};
mustReject(wrongCountry,data);
const wrongLink=[...fixtures];
wrongLink[2]={...wrongLink[2],source_links:[{url:"https://invalid.example/source"}]};
mustReject(wrongLink,data);
const repeated=structuredClone(data);
repeated.records[1].source_id=repeated.records[0].source_id;
mustReject(fixtures,repeated);
assert.ok(!renderTlmChurchProfile(unrelated,"en").includes("data-cl27-site-contact"),
 "Other church profiles remain unchanged");
console.log("PASS CL27 exact-site contact publication: 5/2579 physical CL2 records, EN/FR cards and source links, 0 new Mass, ownership or ecclesial claims");
