#!/usr/bin/env python3
"""B54 optional *editorial triage*, not automated approval or art criticism.

Sourced only from frozen artwork TITLE and ARTIST. Categorizes biblical scenes
and broad historical stylistic affinity with Rubens, Caravaggio, Champaigne,
Van Dyck. The image itself still requires the USER's visual aesthetic verdict.
No automated rejection, no unauthorized metadata or canonical identity edits.
"""
import re,unicodedata
from collections import Counter
def norm(s):
    raw=unicodedata.normalize("NFKD",str(s or ""))
    return re.sub(r"\s+"," ","".join(x for x in raw if not unicodedata.combining(x)).lower()).strip()
# Artist-affinity is a research-focusing HEURISTIC, never a quality certificate.
DIRECT=[
 r"\brubens\b",r"\bcaravaggio\b",r"van dyck",r"\bchampaigne\b",
 r"\bribera\b",r"\bzurbaran\b",r"\bguido reni\b",r"\brembrandt\b",
 r"\bmattia preti\b",r"\bvelazquez\b",r"\bgerard seghers\b",
 r"\bguercino\b",r"\bjan lievens\b",r"\bartemisia gentileschi\b",
 r"\bbartolomeo manfredi\b",r"\bfetti\b",r"\bclaudio coello\b",
 r"\bmurillo\b",r"\bvalentin de boulogne\b",r"\bjean jouvenet\b",
 r"\bcavalier d arpino\b",r"\bcarlo dolci\b",r"\bcaravaggist\b",
]
RELATED=[
 r"\bveronese\b",r"\bjacopo tintoretto\b",r"\btitian\b",r"\bjacopo bassano\b",
 r"\bgiambattista tiepolo\b",r"\bgiandomenico tiepolo\b",r"\bpoussin\b",
 r"\bsebastiano ricci\b",r"\bpiazzetta\b",r"\bluca giordano\b",
 r"\bgiorgione\b",r"\bfragonard\b",r"\bvan balen\b",r"\bwolffort\b",
 r"\bsejourne\b",r"\bcarlo maratti\b",r"\bmaratta\b",r"\brestout\b",
 r"\bgiovanni lanfranco\b",r"\bfrancesco furini\b",r"\bdomenico fetti\b",
 r"\bbarocci\b",r"\bbourdon\b",r"\bcavallino\b",r"\bpittoni\b",
 r"\bclaude vignon\b",r"\blodovico carracci\b",r"\bannibale carracci\b",
 r"\balexandre gabriel decamps\b",r"\bdomenico zampieri\b",
 r"\bpietro da cortona\b",r"\bjoos van cleve\b",r"\bmoretto da brescia\b",
 r"\bgeorges de la tour\b",r"\bgiuseppe maria crespi\b",
]
OTHER_PERIOD=[
 r"\bbyzantine\b",r"\bduccio\b",r"\bgiovanni di paolo\b",
 r"\bugolino\b",r"\bberlinghiero\b",r"\blippo memmi\b",
 r"\bmasolino\b",r"\bfilippino lippi\b",r"\bfra filippo lippi\b",
 r"\bniccolo di buonaccorso\b",r"\bgiotto\b",r"\bbenozzo gozzoli\b",
 r"\bmemling\b",r"\bvan eyck\b",r"\bsandro botticelli\b",r"\bpetrus christus\b",
 r"\brogier van der weyden\b",r"\bgiovanni battista ma[iy]no\b",  # deliberate? remove latter from this group
 r"\bjan van eyck\b",r"\bgerard david\b",r"\bcosme tura\b",
 r"\bjan van scorel\b",r"\bjan van eyck\b",r"\bcimabue\b",
 r"\bbernard van orley\b",r"\bantoniazzo romano\b",r"\bmaestro bartolome\b",
 r"\bmasaccio\b",r"\bjean leon gerome\b",r"\bingres\b",
 r"\beugene delacroix\b",r"\bphilippe de ch[aâ]mpaigne follower\b",
]
# Biblical subject codes: CLASSIFIES DEPICTION, not authorized canonical passage links.
OT=[
 r"\badam and eve\b",r"\bexpulsion from paradise\b",r"\bgarden of eden\b",
 r"\bcreation of the world\b",r"\bcain and abel\b",r"\btower of babel\b",
 r"\babraham\b",r"\bmelchizedek\b",r"\bisaac\b",r"\bjacob\b",
 r"\bmoses\b",r"\bburning bush\b",r"\bbrazen serpent\b",
 r"\bdavid with the head of goliath\b",r"\bgoliath\b",r"\bdaniel\b",
 r"\bjudith\b",r"\bholofernes\b",r"\besther\b",r"\bahasuerus\b",
 r"\bsusannah\b",r"\bheliodorus\b",r"\bmanna in the wilderness\b",
 r"\bsamson\b",r"\bnoah\b",r"\bsolomon\b",r"\btobias\b",
]
PASSION=[
 r"\bagony in the garden\b",r"\bgethsemane\b",r"\bscourging\b",r"\bflagellation\b",
 r"\bcrowning with thorns\b",r"\bcarrying the cross\b",
 r"\bjesus takes up the cross\b",r"\bvia crucis\b",r"\bstation 0[1-9]\b",
 r"\bstation 1[0-4]\b",r"\bthe passion of christ\b",
 r"\bcrucifixion\b",r"\bcalvary\b",r"\bdenial of (?:saint )?peter\b",
 r"\bdescent from the cross\b",r"\bdeposition\b",
 r"\bburial of christ\b",r"\bentombment\b",r"\bchrist condemned\b",
 r"\becce homo\b",r"\blance thrust\b",r"\blamentation of christ\b",
 r"\blast supper\b",r"\bchrist washing the disciples\b",
 r"\bentry into jerusalem\b",r"\bmartyrdom of christ\b",
]
POST_EASTER=[
 r"\bresurrection of christ\b",r"\bthe resurrection\b",r"\bascension\b",
 r"\bpentecost\b",r"\bsupper at emmaus\b",r"\bpilgrims of emmaus\b",
 r"\bincredulity of saint thomas\b",r"\bsaint paul preaching\b",
 r"\bconversion of saint paul\b",r"\bacts of the apostles\b",
]
GOSPEL=[
 r"\bflight into egypt\b",r"\brest on the flight\b",r"\bbaptism of christ\b",
 r"\btemptation of christ\b",r"\bmiraculous draught\b",
 r"\bwedding feast at cana\b",r"\bmarriage feast at cana\b",
 r"\bwoman of samaria\b",r"\bsamaritan woman\b",
 r"\bhealing of the paralytic\b",r"\bhealing the paralytic\b",
 r"\btransfiguration\b",r"\bgood samaritan\b",r"\bprodigal son\b",
 r"\bmartha and mary\b",r"\bman born blind\b",r"\bloaves and fishes\b",
 r"\braising of lazarus\b",r"\braising lazarus\b",
 r"\bmassacre of the innocents\b",r"\badoration of the magi\b",
 r"\badoration of the shepherds\b",r"\bthe nativity\b",
 r"\bbirth of christ\b",r"\bpresentation in the temple\b",
 r"\bpresentation of jesus\b",r"\bchrist among the doctors\b",
 r"\bchrist disputing\b",r"\bchrist blessing the children\b",
 r"\bchrist healing\b",r"\bcalling of saint matthew\b",
 r"\bsaint john the baptist preaching\b",r"\bbeheading of saint john\b",
 r"\bfeast of herod\b",r"\bannunciation\b",r"\bvisitation\b",
]
MARIAN=[
 r"\bmadonna\b",r"\bvirgin\b",r"\bour lady\b",r"\bimmaculate\b",
 r"\bheart of mary\b",r"\bcoronation of (?:the )?virgin\b",
 r"\bassumption of (?:the )?virgin\b",r"\bholy family\b",r"\bmarian\b",
 r"\bchrist child\b",r"\brosary\b",
]
DEVOTIONAL=[
 r"\bheart of jesus\b",r"\bsacred heart\b",r"\badoring the host\b",
 r"\bholy trinity\b",r"\bthe trinity\b",r"\bpurgatory\b",
 r"\blunette\b",r"\bguardian angel\b",r"\bblessed sacrament\b",
]
SAINTS=[
 r"\bsaint\b",r"\bsaints\b",r"\bsainte\b",r"\bst\.\b",r"\bsan \b",
 r"\bsanta\b",r"\bmartyrdom\b",r"\bcure d ars\b",r"\bsaintly\b",
]
def hit(s,patterns):
    return any(re.search(p,s) for p in patterns)
def classify(title,artist,artwork_id=""):
    t=norm(title)
    a=norm(artist)
    # Explicit painting-style heuristic from artist attribution, not pixel data.
    if hit(a,DIRECT):
        affinity="baroque_reference_circle"
        evidence="Artist attribution belongs to the requested Baroque/chiaroscuro reference circle; inspect this specific painting."
    elif hit(a,RELATED):
        affinity="related_classical_tradition"
        evidence="Related Renaissance, Baroque or academic tradition; quality/style must be judged painting by painting."
    elif hit(a,OTHER_PERIOD) or re.search(r"\bmedieval\b|\biconographer\b|\bbyzantine\b|\bpre raphaelite\b",a+" "+t):
        affinity="historically_different_style"
        evidence="Identified school/period differs from the desired Rubens–Caravaggio–Champaigne–Van Dyck look; retain for potential historical or iconographic exceptions."
    else:
        affinity="requires_visual_assessment"
        evidence="Attribution alone is insufficient to judge stylistic affinity. Inspect image directly."
    categories=[]
    def add(c):
        if c not in categories:categories.append(c)
    if hit(t,OT):add("old_testament")
    if hit(t,PASSION):
        # 'crucifixion of saint Andrew/Peter' is a martyrdom of an apostle,
        # not a Gospel Passion scene of the crucified Jesus.
        if not re.search(r"\bcrucifixion of (?:saint|st)\s+(?:peter|andrew|philip)\b",t):
            add("passion")
    if hit(t,POST_EASTER):add("resurrection_acts")
    if hit(t,GOSPEL):add("gospel_life")
    if hit(t,MARIAN):add("marian")
    if hit(t,DEVOTIONAL):add("devotional")
    if hit(t,SAINTS):add("saints")
    if not categories:add("needs_subject_identification")
    primary=next((g for g in ["old_testament","passion","resurrection_acts","gospel_life","marian","devotional","saints"] if g in categories),"needs_subject_identification")
    is_scripture=any(c in categories for c in ["old_testament","passion","resurrection_acts","gospel_life"])
    # Multi-panel episode may be a real narrative, still requires per-panel source identification.
    if re.search(r"annunciation and expulsion|annunciation and the nativity|virgin with.*annunciation",t):
        if "gospel_life" not in categories:categories.insert(0,"gospel_life")
        is_scripture=True
    return {
       "aestheticAffinity":affinity,
       "aestheticEvidence":evidence,
       "aestheticMachineApproved":False,
       "artQualityVisuallyCertified":False,
       "subjects":categories,
       "primarySubject":primary,
       "biblicalEpisodeCandidate":bool(is_scripture),
       "historicallyDifferentStyleIsNotAnAutomatedRejection":True,
       "subjectClassificationIsTitleOnly":True
    }
if __name__=="__main__":
    import csv,json,sys
    src=sys.argv[1] if len(sys.argv)>1 else "data/research/sacred-art-catalogue451-after-b25.csv"
    with open(src,newline="",encoding="utf-8") as f:
        rows=sorted((r for r in csv.DictReader(f) if r["frozen_decision"]!="PERMANENTLY_REJECTED"),key=lambda r:int(r["catalogue_row"]))
    report=[dict(index=i+1,id=r["artwork_id"],title=r["title"],artist=r["artist"],**classify(r["title"],r["artist"],r["artwork_id"])) for i,r in enumerate(rows)]
    assert len(report)==383
    print(json.dumps({"styles":dict(Counter(z["aestheticAffinity"] for z in report)),
          "primarySubjects":dict(Counter(z["primarySubject"] for z in report)),
          "biblicalEpisodes":sum(z["biblicalEpisodeCandidate"] for z in report),
          "oldTestament":sum("old_testament" in z["subjects"] for z in report),
          "gospel":sum("gospel_life" in z["subjects"] for z in report),
          "passion":sum("passion" in z["subjects"] for z in report),
          "postEaster":sum("resurrection_acts" in z["subjects"] for z in report),
          "fullSeries":"383 included; no artwork rejected; title+artist-only triage"},indent=2))
