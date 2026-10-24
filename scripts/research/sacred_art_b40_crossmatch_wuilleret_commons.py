#!/usr/bin/env python3
"""B40: verify Wikimedia's precise SIK Wuilleret research photo by
perceptual comparison against separately published Musée gruérien PDF p6.
Research only; no automatic publication-rights or editorial promotion.
"""
import csv,hashlib,io,json
from pathlib import Path
from PIL import Image
import fitz
from sacred_art_b29_exact_selected import metadata_for,retrieve,fingerprint
from sacred_art_b40_extract_wuilleret_canisius import get_pdf,sha

FILE_PAGE="https://commons.wikimedia.org/wiki/File:Pierre_Wuilleret_-_sik_work-16300845.jpg"
EXPECTED_PDF_SHA="860d0883e57f37c9c2fd7ba0cb45b74883899f847fbf22d600c0065da36dba6e"
EXPECTED_PDF_IMAGE_SHA="5338862ba1a5b66a58cce77124b5f15ff7d2c5803f4bf9a7b42d1a7800ad808a"
OUT=Path("artifacts/b40-wuilleret-commons-original-museum-crossmatch")
FIELDS=["artwork_id","commons_file_page","commons_original_url","current_commons_license_claim","commons_original_bytes","commons_sha256","commons_width","commons_height","museum_dossier_pdf","museum_pdf_sha256","museum_photo_sha256","museum_photo_width","museum_photo_height","dhash_distance","same_full_object_composition_crossmatched","publication_rights_approved","editorial_selected","research_status","hold_reason"]
def main():
  OUT.mkdir(parents=True,exist_ok=True); (OUT/"originals").mkdir(exist_ok=True)
  info=metadata_for(FILE_PAGE)
  assert info["mime"]=="image/jpeg"
  assert info["license_short_name"] in {"Public domain","PD-Art","PD-old","CC0","PD-old-100"}
  assert (info["metadata_width"],info["metadata_height"])==(658,1000)
  dest=OUT/"originals"/"wuilleret_canisius_sik_work-16300845_commons.jpg"
  digest,n=retrieve(info["original_url"],dest,2_000_000)
  with Image.open(dest) as test: test.verify()
  with Image.open(dest) as photo:
    assert photo.size==(658,1000)
    a=fingerprint(photo)
  pdf=get_pdf()
  assert sha(pdf)==EXPECTED_PDF_SHA
  doc=fitz.open(stream=pdf,filetype="pdf")
  src=doc.extract_image(78)["image"]
  assert sha(src)==EXPECTED_PDF_IMAGE_SHA
  with Image.open(io.BytesIO(src)) as museum:
    assert museum.size==(620,941)
    b=fingerprint(museum)
  distance=(a^b).bit_count()
  # THIS IS A FILE IDENTITY GATE, NOT merely same painter / same subject.
  if distance>18: raise ValueError(f"Commons SIK original not confirmed same layout as independently captioned museum full painting; dHash distance={distance}")
  row={"artwork_id":"G30-012","commons_file_page":FILE_PAGE,
    "commons_original_url":info["original_url"],"current_commons_license_claim":info["license_short_name"],
    "commons_original_bytes":n,"commons_sha256":digest,"commons_width":658,"commons_height":1000,
    "museum_dossier_pdf":"https://musee-gruerien.ch/wp-content/uploads/2023/04/Dossier-pedagogique-REFORMES_v2-ID-2671943.pdf",
    "museum_pdf_sha256":EXPECTED_PDF_SHA,"museum_photo_sha256":EXPECTED_PDF_IMAGE_SHA,
    "museum_photo_width":620,"museum_photo_height":941,"dhash_distance":distance,
    "same_full_object_composition_crossmatched":"YES_RESEARCH_PHOTO",
    "publication_rights_approved":"NO","editorial_selected":"NO",
    "research_status":"ORIGINAL_COMMONS_IMAGE_MATCHES_MUSEUM_CAPTIONED_COMPLETE_WORK_SUBJECT_TO_PHOTO_REUSE_REVIEW",
    "hold_reason":"Commons file labels public domain, but independently review SIK/Swiss photo reproduction rights and app jurisdictions; no automatic commercial-photo approval"}
  with (OUT/"source-results.csv").open("w",newline="",encoding="utf-8") as f:
    wr=csv.DictWriter(f,fieldnames=FIELDS); wr.writeheader();wr.writerow(row)
  summary={"schema":"AO_B40_WUILLERET_COMMONS_ORIGINAL_CROSSMATCH_V1",
    "exact_composition_crossmatches":1,"source_originals_sha_verified":1,
    "original_bytes":n,"source_original_sha256":digest,"dhash_distance":distance,
    "museum_comparator_pdf_sha256":EXPECTED_PDF_SHA,"museum_comparator_full_image_sha256":EXPECTED_PDF_IMAGE_SHA,
    "separate_paintings_newly_covered":0,"new_renditions_of_same_G30_012":1,
    "publication_approvals":0,"editorial_approvals":0,"research_only":True,
    "draft_remote_archive_mandatory":True}
  (OUT/"source-summary.json").write_text(json.dumps(summary,indent=2)+"\n")
  print("B40_COMMONS_MUSEUM_SAME_WORK_MATCH",json.dumps(summary),flush=True)
if __name__=="__main__":main()
