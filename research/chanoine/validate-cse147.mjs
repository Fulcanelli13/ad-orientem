#!/usr/bin/env node
// Chanoine CSE research-only validation. No production import or publication.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const root = path.dirname(fileURLToPath(import.meta.url));
const readText = (name) => fs.readFileSync(path.join(root, name));
const read = (name) => JSON.parse(readText(name).toString("utf8"));
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const safe = new Set(["CSE055", "CSE056", "CSE058"]);
const sourceName = "chanoine-cse-source-conversation-seeds.v1.json";
const raw = readText(sourceName);
const gitSha = createHash("sha1")
  .update(Buffer.from("blob " + raw.length + "\0")).update(raw).digest("hex");
assert(gitSha === "7dbce397efa92b7aa8aef81b21f50fa543bbba35",
  "Canonical source JSON differs from pinned Git blob; stop for reconciliation");
const source = JSON.parse(raw.toString("utf8"));
const batched = [
  "chanoine-cse-pastoral-dialogue-batch01-001-030.v1.json",
  "chanoine-cse-pastoral-bulk-batch02-031-090.v1.json",
  "chanoine-cse-pastoral-bulk-batch03-091-150.v1.json"
].flatMap(name => read(name).records);
const merged = read("chanoine-cse-147-conversation-editorial-review.v1.json").records;
const older = read("chanoine-cse-semantic-repair-proposals-12.v1.json").records;
const newer = read("chanoine-cse-specialist-precision-repairs-3.v1.json").records;
const queue = read("chanoine-cse-147-substantive-review-queue.v1.json").records;
const briefs = read("chanoine-cse-specialist-39-review-briefs.v1.json").records;
const approvedFields = [
  "claim_level_certified", "publication_approved", "persona_voice_approved",
  "safeguarding_approved", "english_french_reviewed", "source_semantic_alignment_approved"
];
const bySource = new Map(source.records.map(r => [r.main_question_id, r]));
const byBatch = new Map(batched.map(r => [r.source_question_id, r]));
const publicIDs = source.records.filter(r => r.source_access.effective_access === "PUBLIC_READER")
  .map(r => r.main_question_id);
assert(source.records.length === 150 && publicIDs.length === 147, "Source/public ID count changed");
assert(batched.length === 147 && byBatch.size === 147, "Upstream drafts missing or duplicated");
assert(merged.length === 147, "Merged draft count changed");
assert(queue.length === 147 && briefs.length === 39, "Review registry coverage changed");

let sourceDebates = 0, authoredFollowups = 0;
const observed = new Set();
for (const item of merged) {
  const id = item.source_question_id;
  assert(!safe.has(id) && publicIDs.includes(id), id + ": archival or unknown ID");
  assert(!observed.has(id), id + ": duplicate merged ID");
  observed.add(id);
  const src = bySource.get(id), draft = byBatch.get(id);
  assert(src && draft, id + ": missing source/upstream");
  assert(eq(item.source_main_answer_verbatim, src.exchanges[0].chanoine),
    id + ": source answer changed in merged output");
  assert(eq(item.pastoral_main_answer_draft, draft.editorial_main_answer),
    id + ": merged main answer differs from upstream batch");
  for (const k of approvedFields) assert(item[k] === false, id + ": certification prematurely enabled: " + k);
  for (const field of ["pastoral_main_answer_draft", "visitor_followup_question", "pastoral_followup_reply_draft"]) {
    assert(item[field]?.en?.trim() && item[field]?.fr?.trim(), id + ": missing bilingual " + field);
  }
  assert(src.source_access.effective_access === "PUBLIC_READER", id + ": access failure");
  if (src.exchanges.length > 1) {
    sourceDebates++;
    assert(item.second_turn_origin === "EXISTING_SOURCE_OBJECTION", id + ": source objection type mismatched");
    assert(eq(item.visitor_followup_question, src.exchanges[1].visitor), id + ": source objection altered");
    assert(eq(item.original_source_followup_reply, src.exchanges[1].chanoine), id + ": source debate reply altered");
  } else {
    authoredFollowups++;
    assert(item.second_turn_origin === "NEW_EDITORIAL_OBJECTION", id + ": original followup provenance mismatched");
    assert(item.original_source_followup_reply === null, id + ": invented source followup");
  }
}
assert(sourceDebates === 52 && authoredFollowups === 95, "Debate origin counts changed");
const fixes = [...older, ...newer], repaired = new Set();
assert(fixes.length === 15, "Repair overlay count changed");
for (const repair of fixes) {
  const id = repair.source_question_id;
  assert(!repaired.has(id), id + ": repeated repair");
  repaired.add(id);
  assert(eq(merged.find(x => x.source_question_id === id)?.pastoral_main_answer_draft,
    repair.proposed_main_answer), id + ": approved repair is not in draft composite");
}
for (const q of queue) assert(observed.has(q.id), "Unknown ID in review queue: " + q.id);
for (const b of briefs) assert(observed.has(b.source_question_id), "Unknown ID in specialist briefs");
console.log(JSON.stringify({
  status: "PASS_STRUCTURAL_ONLY",
  source_git_blob_sha: gitSha,
  public_conversations: merged.length,
  existing_source_debates: sourceDebates,
  authored_followups: authoredFollowups,
  applied_unreviewed_repairs: repaired.size,
  specialist_review_briefs: briefs.length,
  approved_or_published: 0
}, null, 2));
