import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=(p)=>JSON.parse(readFileSync(p,'utf8'));
const c=read('data/customs/master/comprehensive-customs-working-catalogue.v1.json');
const census=read('data/customs/master/comprehensive-customs-source-census.v1.json');
const details=read('data/customs/master/weiser-1958-second-pass-page-coverage.v1.json');
const gap=read('data/customs/master/53-no-owner-customs-action-review.v1.json');
const screen=read('data/customs/master/weiser-408-group-evidence-readiness-screen.v1.json');
const queue=read('data/customs/master/weiser-1958-222-uncovered-printed-page-audit-queue.v1.json');

assert.equal(screen.records.length,408);
assert.equal(screen.summary.provisional_groups_mapped,408);
assert.equal(screen.summary.book_index_pointers_resolved,347);
assert.equal(screen.summary.unindexed_details_mapped,24);
assert.equal(screen.summary.previously_unassigned_details_mapped,37);
assert.equal(screen.summary.group_rows_with_at_least_one_book_printed_page,408);
assert.equal(screen.summary.groups_referring_to_pages_missing_second_pass_detail,149);
assert.equal(screen.summary.source_page_spot_checks_explicitly_marked_in_gap_reviews,15);
assert.equal(screen.summary.groups_with_explicit_prior_owner_candidate,47);
assert.deepEqual(screen.summary.risk_classes,{
 RITE_OR_LITURGY_BOUNDARY_CHECK:87,
 HOUSEHOLD_OR_DEVOTIONAL_ACTION_CHECK:173,
 HISTORICAL_PERIOD_AND_GEOGRAPHY_CHECK:79,
 COMMUNAL_PRACTICE_LOCALITY_CHECK:49,
 FOLKLORE_OR_NONCATHOLICITY_CHECK:20
});
assert.equal(screen.summary.certified_distinct_custom_identities,0);
assert.equal(screen.summary.automated_mergers,0);
assert.equal(screen.summary.app_publications,0);
const expectedGroups=[
 ...c.provisional_handbook_groups,
 ...c.provisional_historical_groups,
 ...c.provisional_unindexed_practice_leads,
 ...c.provisional_unassigned_action_leads
];
const idSet=new Set(expectedGroups.map(x=>x.id));
assert.equal(idSet.size,408);
const screenIds=new Set(screen.records.map(x=>x.group_id));
assert.deepEqual(screenIds,idSet);

const cobs=new Map(census.source_observations.map(x=>[x.id,x]));
const gobs=new Map(gap.records.map(x=>[x.source_detail_id,x]));
const chapterMap=new Map();
const covered=new Set();
for(const chapter of details.chapters){
 const [start,end]=chapter.printed_page_range;
 for(let p=start;p<=end;p++){
  assert.ok(!chapterMap.has(p),'chapter page duplication '+p);
  chapterMap.set(p,chapter.chapter);
 }
 for(const p of chapter.unique_printed_pages_with_located_details){
  assert.ok(p>=start&&p<=end);
  covered.add(p);
 }
}
assert.equal(chapterMap.size,342);
assert.equal(covered.size,120);
assert.equal(details.summary.fully_line_by_line_reaudited_pages_certified,0);

for(const row of screen.records){
 const base=expectedGroups.find(x=>x.id===row.group_id);
 assert.ok(base);
 const ids=base.source_observations||base.source_observation_ids||[base.source_observation_id];
 assert.equal(row.label,base.label);
 assert.deepEqual(row.source_locations.map(x=>x.source_observation_id),ids);
 assert.ok(row.source_locations.length>=1);
 assert.equal(row.working_identity_status,'PROVISIONAL_NOT_VERIFIED_DISTINCT');
 assert.equal(row.existing_full_page_read_certified,false);
 assert.equal(row.owner_merger,'NOT_PERFORMED');
 assert.equal(row.app_publication,'NONE');
 for(const entry of row.source_locations){
  const real=cobs.get(entry.source_observation_id)||gobs.get(entry.source_observation_id)||base;
  const page=real.printed_page??real.source_page;
  assert.equal(entry.printed_page,page);
  assert.equal(entry.chapter,chapterMap.get(page));
 }
 assert.deepEqual(row.unrepresented_page_refs,row.printed_pages.filter(p=>!covered.has(p)));
}
assert.equal(queue.pages.length,222);
assert.equal(queue.summary.handbook_main_text_pages,342);
assert.equal(queue.summary.printed_pages_with_any_second_pass_detail,120);
assert.equal(queue.summary.printed_pages_without_second_pass_detail,222);
assert.equal(queue.summary.unrepresented_pages_without_any_first_pass_observation,63);
assert.equal(queue.summary.unrepresented_pages_with_some_first_pass_observation,159);
assert.equal(queue.summary.primary_priority_wave_pages,150);
assert.equal(queue.summary.primary_priority_blind_spot_pages,50);
assert.equal(queue.summary.primary_priority_prior_indexed_pages,100);
assert.equal(queue.summary.second_wave_pages,72);
assert.equal(queue.summary.original_pages_newly_reaudited_in_this_pass,0);
assert.equal(queue.summary.new_source_details_extracted_in_this_pass,0);
assert.equal(queue.summary.new_verified_distinct_customs,0);
assert.equal(queue.summary.app_publications,0);

const queued=new Set(queue.pages.map(x=>x.printed_page));
assert.equal(queued.size,222);
assert.deepEqual(queued,new Set([...chapterMap.keys()].filter(p=>!covered.has(p))));
const observedByPage=new Map();
for(const o of census.source_observations){
 const p=o.printed_page;
 if(!Number.isInteger(p))continue;
 if(!observedByPage.has(p))observedByPage.set(p,[]);
 observedByPage.get(p).push(o.id);
}
let wave1=0,wave2=0,blind1=0,blind=0,sourceTouches=0;
for(const p of queue.pages){
 assert.equal(p.chapter,chapterMap.get(p.printed_page));
 assert.equal(p.coverage_status,'NO_SECOND_PASS_DETAIL_ROW_INDEXED_SOURCE_PAGE_NOT_FULLY_READ');
 assert.equal(p.original_page_review_status,'NOT_AUDITED');
 assert.equal(p.action_identity_promotion,'NONE');
 assert.equal(p.app_publication,false);
 assert.deepEqual(p.first_pass_observation_ids,observedByPage.get(p.printed_page)||[]);
 assert.deepEqual(p.provisional_group_ids,screen.records.filter(x=>x.printed_pages.includes(p.printed_page)).map(x=>x.group_id));
 if(p.wave==='WAVE_01_150_PAGES'){wave1++;if(p.source_blind_spot)blind1++}
 else {assert.equal(p.wave,'WAVE_02_72_PAGES');wave2++}
 if(p.source_blind_spot)blind++;
 sourceTouches+=p.provisional_group_count;
}
assert.equal(wave1,150);
assert.equal(wave2,72);
assert.equal(blind1,50);
assert.equal(blind,63);
assert.equal(queue.summary.total_missing_page_first_pass_observations,286);
assert.equal(queue.summary.primary_wave_first_pass_observations,221);
assert.equal(queue.summary.primary_wave_provisional_group_page_links,149);
assert.equal(c.summary.identity_working_rows.provisional_after_53_no_owner_action_review,408);
assert.equal(c.summary.identity_working_rows.final_uniquely_verified_customs_added,0);
assert.equal(c.summary.no_new_app_publications,true);
console.log('Customs Weiser readiness screen: 408 groups with page pointers; 222 unrepresented pages (150+72 queued), no page reaudits falsely credited, no publications — PASS');
