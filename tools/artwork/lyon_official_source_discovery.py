#!/usr/bin/env python3
"""Audit exact images on Lyon museum's official press page.

Research-only: no browser form submission, downloads, cropping or publication.
"""
import argparse
import hashlib
import json
import pathlib
import re
import unicodedata
from urllib.parse import urljoin, urlsplit
from urllib.request import Request, urlopen
from bs4 import BeautifulSoup

PAGE = "https://www.mba-lyon.fr/fr/article/peintures-visuels-pour-la-presse"
TARGETS = (
    {"approved_record_index": 372, "artist": "Pérugin", "subject": "L'Ascension du Christ",
     "artist_tokens": ("perugin",), "subject_tokens": ("ascension",)},
    {"approved_record_index": 373, "artist": "Nicolas Poussin", "subject": "La Fuite en Egypte",
     "artist_tokens": ("poussin",), "subject_tokens": ("fuite", "egypte")},
    {"approved_record_index": 376, "artist": "Peter Paul Rubens", "subject": "L'Adoration des Mages",
     "artist_tokens": ("rubens",), "subject_tokens": ("adoration", "mages")},
)
MAX_PAGE_BYTES = 5_000_000

def fold(value):
    v = unicodedata.normalize("NFKD", value or "")
    return re.sub(r"\s+", " ", "".join(c for c in v if not unicodedata.combining(c))).lower().strip()

def acceptable_page_url(url):
    parsed = urlsplit(url)
    return parsed.scheme == "https" and parsed.hostname == "www.mba-lyon.fr" and parsed.path == "/fr/article/peintures-visuels-pour-la-presse"

def eligible_media_url(url):
    p = urlsplit(url)
    return p.scheme == "https" and p.hostname in ("www.mba-lyon.fr", "mba-lyon.fr") and p.path.startswith("/sites/")

def download_html():
    req = Request(PAGE, headers={"User-Agent": "AdOrientemResearch/1.0 (+https://github.com/Fulcanelli13/ad-orientem)",
                                 "Accept": "text/html"})
    with urlopen(req, timeout=35) as resp:
        if not acceptable_page_url(resp.geturl()):
            raise ValueError("Unexpected official-page redirect")
        raw = resp.read(MAX_PAGE_BYTES + 1)
        if len(raw) > MAX_PAGE_BYTES:
            raise ValueError("Museum HTML exceeds conservative byte limit")
        charset = resp.headers.get_content_charset() or "utf-8"
        return raw, raw.decode(charset, errors="replace")

def raw_media_candidates(tag):
    possible = []
    for k in ("src", "data-src", "data-original", "data-lazy-src", "data-srcset", "srcset"):
        value = tag.get(k)
        if not value:
            continue
        if k.endswith("srcset"):
            for candidate in str(value).split(","):
                possible.append((k, candidate.strip().split(" ")[0]))
        else:
            possible.append((k, str(value)))
    link = tag.find_parent("a", href=True)
    if link:
        possible.append(("enclosing_a_href", str(link.get("href"))))
    result, seen = [], set()
    for k, value in possible:
        u = urljoin(PAGE, value)
        if eligible_media_url(u) and u not in seen:
            seen.add(u)
            result.append({"attribute": k, "url": u})
    return result

def collect(html_text):
    soup = BeautifulSoup(html_text, "html.parser")
    items = []
    for t in soup.find_all(("img", "source")):
        media_urls = raw_media_candidates(t)
        if not media_urls:
            continue
        label = " ".join(str(t.get(key) or "") for key in ("alt", "title", "aria-label"))
        ancestors = []
        node = t
        for _ in range(5):
            node = getattr(node, "parent", None)
            if node is None or node.name in ("html", "body"):
                break
            words = node.get_text(" ", strip=True)
            if len(words) <= 950:
                ancestors.append(words)
        context = " | ".join(ancestors[:3])
        for media in media_urls:
            items.append({"label": label[:450], "context": context[:1050], **media})
    out = []
    for target in TARGETS:
        evaluated = []
        for item in items:
            normalized_label = fold(item["label"] + " " + item["url"])
            normalized_context = fold(item["context"])
            label_artist = all(tok in normalized_label for tok in target["artist_tokens"])
            label_subject = all(tok in normalized_label for tok in target["subject_tokens"])
            context_artist = all(tok in normalized_context for tok in target["artist_tokens"])
            context_subject = all(tok in normalized_context for tok in target["subject_tokens"])
            score = 0
            if label_artist: score += 5
            if label_subject: score += 7
            if context_artist: score += 2
            if context_subject: score += 3
            if (label_subject or context_subject) and (label_artist or context_artist):
                evaluated.append({**item, "score": score,
                                  "exact_artist_and_subject_in_label": label_artist and label_subject,
                                  "must_verify_visual_identity": True,
                                  "rights_scope": "OFFICIAL_PRESS_IMAGE_REUSE_SCOPE_REVIEW_REQUIRED"})
        evaluated.sort(key=lambda x: (-x["score"], x["url"]))
        out.append({"approved_record_index": target["approved_record_index"], "artist": target["artist"],
                    "subject": target["subject"], "matches": evaluated[:15]})
    return {"schema": "AO_LYON_OFFICIAL_PHOTO_SOURCE_DISCOVERY_V1",
            "source_page": PAGE, "automatically_approved": False, "publication": False,
            "cropping": False, "rights_scope": "PRESS_PAGE_NOT_BLANKET_APP_PERMISSION",
            "media_candidates_seen": len(items),
            "source_files_seen": sorted({v["url"] for v in items}), "targets": out}

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=pathlib.Path, required=True)
    args = parser.parse_args()
    raw, html_text = download_html()
    report = collect(html_text)
    report["html_sha256"] = hashlib.sha256(raw).hexdigest()
    report["page_bytes"] = len(raw)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    for t in report["targets"]:
        print(f'{t["approved_record_index"]}: {len(t["matches"])} image source leads'
              f' (top score {t["matches"][0]["score"] if t["matches"] else 0})')
    print(f'Image sources indexed: {report["media_candidates_seen"]}; publication=False')

if __name__ == "__main__":
    main()
