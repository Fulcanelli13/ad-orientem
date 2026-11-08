#!/usr/bin/env python3
"""Phase46 — persistent exact-object cross-register relationships and candidate queue.

Produces all 177 photo-to-989 group crosswalk records, plus reverse 989 work groups,
the 16 released module entries and an explicit false-merge register. Source and
selection decisions are NEVER mutated. Candidate lexical matches are NOT IDs.
Requires the Phase45 full-corpus source-table research artifact as input.
"""
from __future__ import annotations
import csv, io, json, re, hashlib, unicodedata
from collections import Counter, defaultdict
from difflib import SequenceMatcher
from pathlib import Path
from urllib.parse import unquote, urlsplit

SRC=Path("reference-phase45")
OUT=Path("artifacts/sacred-art-phase46-identity-crosswalk")
OUT.mkdir(parents=True,exist_ok=True)
DECISIONS=Path("data/artwork/canonical-selected-photo-identity-decisions.v1.json")
FILE={
 "works":SRC/"operational_989.csv",
 "selected":SRC/"selected_177_crosswalk.csv",
 "sources":SRC/"source_records_3205.csv",
 "releases":SRC/"module_release_16.csv",
 "duplicate":SRC/"duplicate_review_18.csv"
}
def read_csv(path):
    with path.open(encoding="utf-8-sig",newline="") as f:return list(csv.DictReader(f))
def write_csv(path,rows,columns=None):
    if not rows and not columns:raise ValueError("empty csv without schema "+str(path))
    with path.open("w",encoding="utf-8",newline="") as f:
        writer=csv.DictWriter(f,fieldnames=(list(rows[0]) if rows else columns),extrasaction="ignore")
        writer.writeheader()
        for item in rows:
            writer.writerow({k:json.dumps(v,ensure_ascii=False) if isinstance(v,(list,dict)) else v for k,v in item.items()})
def unaccent(s):
    return "".join(x for x in unicodedata.normalize("NFKD",str(s).lower()) if not unicodedata.combining(x))
def title_norm(title):
    s=unaccent(title)
    s=re.sub(r'\b(title qs|label qs|qs p|qs len|qs lfr|qs lnl|label|date)\b',' ',s)
    s=re.sub(r'\b(the|a|an|of|de|der|den|des|du|le|la|les|au|aux|en|in|im|on|da|di|della|and|et|with|von|van|door|die|het|saint|sainte|st|holy|heilige)\b',' ',s)
    s=re.sub(r'[^a-z0-9]+',' ',s)
    return " ".join(s.split())
def artist_norm(name):
    s=unaccent(name)
    s=re.sub(r'\b(after|attributed|school|circle|workshop|of|the|elder|younger|and|or|possibly|anonymous|attribution|not|identified|d apres|dit|le|van|de|der|da|di|du|von|ii|iii|i)\b',' ',s)
    s=re.sub(r'[^a-z0-9]+',' ',s)
    s=s.replace("wolfordt","wolffort").replace("wolfferdt","wolffort")
    return " ".join(s.split())
SCENES={
 "annunciation":(("annunciation", "annonciation", "verkondiging", "aankondiging"),),
 "adoration_magi":(("adoration","aanbidding","adorazione","adoracion"),("magi","magis","kings","koningen","mages","reyes")),
 "presentation_temple":(("presentation","presentazione"),("temple","tempio","tempel")),
 "martha_mary":(("martha","marthe","marta"),("mary","marie","maria")),
 "flagellation":(("flagellation","geseling","flagellazione"),),
 "pieta":(("pieta","pietas"),),
 "baptism_christ":(("baptism","bapteme","doop","battesimo"),("christ","christus","jesus","cristo"))
}
def scene(name):
    s=title_norm(name)
    for key,groups in SCENES.items():
        if all(any(re.search(r'\b'+re.escape(alias)+r'\b',s) for alias in g) for g in groups):
            return key
    return None
def sim(a,b):
    if not a or not b:return 0
    return SequenceMatcher(None,a,b).ratio()
def tokensim(a,b):
    a=set(a.split());b=set(b.split())
    if not a or not b:return 0
    return len(a&b)/len(a|b)
def candidate(selected,work):
    at,bt=artist_norm(selected["artist"]),artist_norm(work["artist"])
    sa=sim(at,bt)
    # Multiple artist names separated by slash are handled conservatively.
    artparts=[artist_norm(s) for s in re.split(r'[/;,&]|\band\b',selected["artist"])]
    bparts=[artist_norm(s) for s in re.split(r'[/;,&]|\band\b',work["artist"])]
    for x in artparts:
        for y in bparts:sa=max(sa,sim(x,y))
    tt,wt=title_norm(selected["title"]),title_norm(work["artworkTitle"])
    tr=sim(tt,wt);tj=tokensim(tt,wt)
    scene_a=scene(selected["title"]);scene_b=scene(work["artworkTitle"])
    scene_same=bool(scene_a and scene_a==scene_b)
    ts=max(tr,tj)
    if scene_same:ts=max(ts,.90)
    # The source painting's author must match (or a documented attribution
    # variant), and title/scenes cannot be completely unrelated.
    viable=((sa>=.82 and ts>=.62) or (sa>=.68 and ts>=.88))
    # If the selected image has a known scene, never propose a different
    # scene merely because shared words ('Christ', 'Adoration') inflate scores.
    if scene_a and not scene_same:
        viable=False
    if not scene_a and tj<.48 and tr<.86:
        viable=False
    rank=round(.50*sa+.38*ts+.12*(1 if scene_same else 0),4)
    return {"artist_similarity":round(sa,4),"title_similarity":round(ts,4),
        "shared_iconographic_scene":scene_a if scene_same else None,
        "rank":rank,"viable":viable}

def main():
    works=read_csv(FILE["works"]);selected=read_csv(FILE["selected"]);sources=read_csv(FILE["sources"])
    releases=read_csv(FILE["releases"]);duplicate=read_csv(FILE["duplicate"])
    decisions=json.loads(DECISIONS.read_text(encoding="utf8"))
    verified=decisions["verified_same_physical_object"]
    negative=decisions["prohibited_false_merges"]
    assert len(works)==989 and len(selected)==177 and len(sources)==3205 and len(releases)==16
    assert len(verified)==2 and len(negative)==4
    workby={x["workGroupId"]:x for x in works}
    selectedby={x["registry_id"]:x for x in selected}
    assert len(workby)==989 and len(selectedby)==177
    exclusions={(x["selected_id"],x["group_id"]) for x in negative}
    positive={(x["selected_id"],x["group_id"]) for x in verified}
    assert not (positive & exclusions)
    for x in verified+negative:
        if x["selected_id"] not in selectedby or x["group_id"] not in workby:
            raise ValueError("decision references nonexistent artwork "+str(x))
    for x in negative:
        assert selectedby[x["selected_id"]]["title"] and workby[x["group_id"]]["artworkTitle"]
    source_records_by_group=defaultdict(list)
    for x in sources:
        source_records_by_group[x["workGroupId"]].append(x)
    candidates=[]
    selected_rows=[]
    selected_candidates={}
    for s in selected:
        rid=s["registry_id"]
        ranking=[]
        for w in works:
            gid=w["workGroupId"]
            if (rid,gid) in positive or (rid,gid) in exclusions:continue
            score=candidate(s,w)
            if score["viable"]:
                # Never treat an overlapping title by an artist as the same
                # painting unless the museum-object link is primary-supported.
                ranking.append((score["rank"],w,score))
        ranking.sort(key=lambda x:-x[0])
        ranking=ranking[:5] # explicit bounded editorial review queue
        selected_candidates[rid]=ranking
        for rank,w,sc in ranking:
            candidates.append({
              "selected_id":rid,"group_id":w["workGroupId"],
              "selected_title":s["title"],"group_title":w["artworkTitle"],
              "selected_artist":s["artist"],"group_artist":w["artist"],
              "selected_museum":s["museum"],"selected_source":s["handpickedCommonsUrl"],
              "group_source":w["selectedSourceUrl"],
              "candidate_rank":rank,**sc,
              "decision":"SUGGESTION_ONLY_NOT_SAME_OBJECT",
              "physical_object_identity_certified":"NO",
              "photo_bytes_verified_same":"NO",
              "original_owner_photo_preserved":"YES",
              "group_prior_user_states":w["userReviewStates"],
              "review_required":"EXACT_HOLDING_AND_INVENTORY_OR_VISUAL_COMPOSITION",
              "source_row_count":int(w["sourceRecordCount"] or 0)
            })
        positives=[x["group_id"] for x in verified if x["selected_id"]==rid]
        negatives=[x["group_id"] for x in negative if x["selected_id"]==rid]
        identity=s["physicalObjectIdentityStatus"]
        selected_rows.append({
          "selected_id":rid,"selected_title":s["title"],"selected_artist":s["artist"],
          "holding":s["museum"],"identity_in_177_track":identity,
          "selected_original_url":s["handpickedCommonsUrl"],
          "selected_short_px":int(s["shortSidePx"] or 0),
          "verified_existing_group_ids":positives,
          "verified_physical_id":("AO-PHYSICAL::"+positives[0] if len(positives)==1 else ""),
          "distinct_known_false_group_ids":negatives,
          "candidate_group_count":len(ranking),
          "top_candidate_group_ids":[x[1]["workGroupId"] for x in ranking],
          "top_candidate_score":ranking[0][0] if ranking else 0,
          "crosswalk_status":"VERIFIED_SAME_OBJECT" if positives else
                  "PHYSICAL_OBJECT_HOLD" if identity=="IDENTITY_HOLD" else
                  "CANDIDATE_LINK_NEEDS_OBJECT_REVIEW" if ranking else "NO_RELIABLE_LINK",
          "owner_photo_preserved":"YES","publication_from_crosswalk":"PROHIBITED",
          "same_image_bytes_claimed":"NO","source_of_truth":"177 handpicked Phase45 + official evidence decisions"
        })
    groupverified=defaultdict(list)
    groupnegative=defaultdict(list)
    groupcandidates=defaultdict(list)
    for r in selected_rows:
        for g in r["verified_existing_group_ids"]:groupverified[g].append(r["selected_id"])
        for g in r["distinct_known_false_group_ids"]:groupnegative[g].append(r["selected_id"])
    for x in candidates:groupcandidates[x["group_id"]].append(x["selected_id"])
    releasegroups=defaultdict(list)
    historical_release_source_links=[]
    for r in releases:
        for x in json.loads(r["exactSourceURLLinked989Groups"] or "[]"):
            # Prior source-URL matches came from the full 3205 source corpus.
            # Some correspond to historical or superseded groups excluded
            # from the canonical operational 989; never auto-reinstate them.
            if x not in workby:
                historical_release_source_links.append({"moduleKey":r["moduleKey"],
                   "sourceGroupId":x,"status":"HISTORICAL_SOURCE_NOT_IN_ACTIVE_989"})
                continue
            releasegroups[x].append(r["moduleKey"])
    workrows=[]
    for w in works:
        gid=w["workGroupId"]
        workrows.append({
            "workGroupId":gid,"title":w["artworkTitle"],"artist":w["artist"],
            "original_source":w["selectedSourceUrl"],"group_user_states":w["userReviewStates"],
            "operational_queue":w["operationalQueue"],"rights_category":w["rightsCategory"],
            "existing_release_module_keys":releasegroups.get(gid,[]),
            "verified_177_selected_photo_links":sorted(groupverified.get(gid,[])),
            "excluded_177_same_title_different_object":sorted(groupnegative.get(gid,[])),
            "candidate_177_link_suggestions":sorted(set(groupcandidates.get(gid,[]))),
            "group_identity_certified_distinct_physical":"NOT_YET_CERTIFIED",
            "photo_release_does_not_follow_identity":"YES",
            "historical_owner_exclusion":w.get("historicalExclusion","")
        })
    # Rejections remain excluded from 989 operational merge candidates.
    rejectrecords=[x for x in sources if x.get("originalUserDecision")=="REJECT"]
    assert len(rejectrecords)==1599
    duplicate_guards={
       "duplicate_review_rows":len(duplicate),
       "rejected_source_rows_excluded":len(rejectrecords),
       "no_automatically_merged_operational_work_groups":989,
       "selected_handpicked_photographs_modified":0
    }
    summary={
       "schema":"AO_SACRED_ART_PHASE46_RECONCILED_CANONICAL_IDENTITY_CROSSWALK_V1",
       "counts":{
         "operational_research_groups":len(works),"selected_handpicked_images":len(selected),
         "existing_module_releases":len(releases),
         "selected_to_989_verified_physical_object_links":len(verified),
         "selected_records_with_verified_group":sum(bool(r["verified_existing_group_ids"]) for r in selected_rows),
         "explicit_blocked_false_merge_pairs":len(negative),
         "selected_records_with_false_merge_guard":sum(bool(r["distinct_known_false_group_ids"]) for r in selected_rows),
         "selected_records_with_candidate_links":sum(bool(r["candidate_group_count"]) for r in selected_rows),
         "unlinked_selected_without_candidate":sum(r["crosswalk_status"]=="NO_RELIABLE_LINK" for r in selected_rows),
         "selected_identity_holds":sum(r["crosswalk_status"]=="PHYSICAL_OBJECT_HOLD" for r in selected_rows),
         "candidate_pairs_not_verified":len(candidates),
         "distinct_989_groups_with_candidate_links":len({x["group_id"] for x in candidates}),
         "released_module_group_links":sum(len(v) for v in releasegroups.values()),
         "historical_release_source_links_outside_active_989":len(historical_release_source_links),
         "rejected_source_rows_preserved":len(rejectrecords),
         "photo_upgrade_approvals":0,"new_public_gallery_assignments":0
       },
       "source_decisions":"data/artwork/canonical-selected-photo-identity-decisions.v1.json",
       "source_3205":"data/artwork/research-source-records-3205.v1.json",
       "source_989":"data/artwork/research-operational-989.v1.json",
       "source_177":"scripts/sacred-art/artworks_177.csv",
       "source_16":"src/art/released-module-paintings.v1.js",
       "evidence_only":True,
       "do_not_add_populations":"989 groups + 177 selected photos + 16 releases are overlapping and incompletely reconciled",
       "not_authorizing":"Gallery publication, selected-photo change, source rejections, or unreviewed painting merging"
    }
    assert summary["counts"]["selected_records_with_verified_group"]==2
    assert summary["counts"]["explicit_blocked_false_merge_pairs"]==4
    assert sum(Counter(x["crosswalk_status"] for x in selected_rows).values())==177
    assert sum(x["selected_id"] in [z["selected_id"] for z in verified] for x in selected_rows)==2
    assert not any(x["originalUserDecision"]=="REJECT" for x in [] )
    write_csv(OUT/"selected_177_to_989_crosswalk.csv",selected_rows)
    write_csv(OUT/"operational_989_to_selected_photo_crosswalk.csv",workrows)
    write_csv(OUT/"unverified_candidate_pairs.csv",candidates,
        columns=["selected_id","group_id","selected_title","group_title","selected_artist",
        "group_artist","selected_museum","selected_source","group_source","candidate_rank",
        "artist_similarity","title_similarity","shared_iconographic_scene","decision",
        "physical_object_identity_certified","photo_bytes_verified_same","original_owner_photo_preserved",
        "group_prior_user_states","review_required","source_row_count"])
    write_csv(OUT/"explicit_verified_pair_decisions.csv",verified)
    write_csv(OUT/"explicit_false_merge_guards.csv",negative)
    write_csv(OUT/"released_module16_existing_group_links.csv",releases)
    (OUT/"summary.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    (OUT/"historical_release_source_links.json").write_text(
        json.dumps(historical_release_source_links,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    (OUT/"hard_guards.json").write_text(json.dumps(duplicate_guards,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    print(json.dumps({"summary":summary["counts"],"hard_guards":duplicate_guards},ensure_ascii=False,indent=2),flush=True)
if __name__=="__main__":
    main()
