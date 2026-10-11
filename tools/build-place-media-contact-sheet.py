#!/usr/bin/env python3
"""Contact sheets for sourced, STAGED (not published) Place photographs."""
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / "data/geography/research/place-media-stage-report-r58.v1.json"
TARGET = ROOT / "assets/staged"
COLS = 3
CELL_W = 580
CELL_H = 345
PHOTO_H = 234
GAP = 12
MARGIN = 28

def font(size, bold=False):
    names = ["DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold
        else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"]
    for name in names:
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            pass
    return ImageFont.load_default()

def render(rows, label, outfile):
    count = len(rows)
    nrows = (count + COLS - 1) // COLS
    width = MARGIN*2+COLS*CELL_W+(COLS-1)*GAP
    height = 88+MARGIN+nrows*CELL_H+max(0,nrows-1)*GAP+62
    board = Image.new("RGB",(width,height),(9,14,21))
    draw = ImageDraw.Draw(board)
    draw.text((MARGIN,19),"Ad Orientem  ·  Explore place photographs",font=font(27,True),fill=(231,225,212))
    draw.text((MARGIN,54),label+"  ·  acquisition preview only / NOT APPROVED for publication",
              font=font(15),fill=(210,175,115))
    for idx,row in enumerate(rows):
        y=88+MARGIN+(idx//COLS)*(CELL_H+GAP)
        x=MARGIN+(idx%COLS)*(CELL_W+GAP)
        draw.rounded_rectangle((x,y,x+CELL_W-1,y+CELL_H-1),radius=10,fill=(20,29,40),outline=(64,59,46))
        asset=ROOT / row["asset_path"]
        roots=(ROOT / "assets/staged/place-media",ROOT / "assets/staged/place-media-r59")
        if not any(asset.resolve().is_relative_to(root.resolve()) for root in roots):
            continue
        try:
            with Image.open(asset) as source:
                source=ImageOps.exif_transpose(source).convert("RGB")
                thumb=ImageOps.contain(source,(CELL_W-16,PHOTO_H-14),Image.Resampling.LANCZOS)
                board.paste(thumb,(x+(CELL_W-thumb.width)//2,y+(PHOTO_H-thumb.height)//2))
        except (OSError, ValueError):
            pass
        title=row["place_id"].replace("place:","").replace(":"," · ").replace("-"," ")
        author=str(row.get("original_author_observed") or row.get("original_author_live") or "").strip()
        if len(title)>57:
            title=title[:54]+"…"
        if len(author)>61:
            author=author[:58]+"…"
        draw.text((x+14,y+PHOTO_H+7),title,font=font(16,True),fill=(236,229,218))
        draw.text((x+14,y+PHOTO_H+38),"Photo: "+author,font=font(13),fill=(184,191,199))
        draw.text((x+14,y+PHOTO_H+66),str(row.get("license",""))+" · "+str(row.get("output_width",""))+" × "+str(row.get("output_height","")),
                  font=font(13),fill=(210,175,115))
    draw.text((MARGIN,height-46),"Review exact building, crop, visible attribution, and source URL before approval.",
              font=font(15),fill=(173,185,195))
    TARGET.mkdir(parents=True,exist_ok=True)
    board.save(TARGET/outfile,"WEBP",quality=85,method=6)
    print(outfile,"size", (TARGET/outfile).stat().st_size,flush=True)

def main():
    report=json.loads(REPORT.read_text(encoding="utf-8"))
    rows=[row for row in report["media"] if row.get("status")=="STAGED_NOT_APPROVED"
          and row.get("asset_path") and (ROOT/row["asset_path"]).is_file()]
    if not rows:
        raise SystemExit("No staged images to contact-sheet")
    render(rows,"All staged candidates","place-media-review-overview-r58.webp")
    render(rows[:9],"Candidates 1–9","place-media-review-a-r58.webp")
    render(rows[9:],"Candidates 10–18","place-media-review-b-r58.webp")

if __name__=="__main__":
    main()
