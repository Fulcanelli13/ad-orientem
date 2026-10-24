#!/usr/bin/env python3
"""B52 placement proposals for a 100-work sequential Ad Orientem art review.

Suggestions are grounded in the depicted title/saint/theme and established
Ad Orientem modules, not an assertion that a destination already has an asset
slot or the visual depicts an event exactly. Date-specific uses require a
separate 1962-calendar verified anchor before publication. Produces proposed
uses only, never placement changes.
"""
import re,unicodedata

def norm(v):
    v=unicodedata.normalize("NFKD",v or "")
    return re.sub(r"[^a-z0-9]+"," ", "".join(z for z in v if not unicodedata.combining(z)).lower()).strip()

# Crucially disambiguate saints who have the same common name.
SAINTS=[
 ("mary-magdalene","St Mary Magdalene",r"mary magdalene|maria maddalena"),
 ("john-baptist","St John the Baptist",r"john the baptist|j[oã]ao baptista|juan bautista|san juan bautista|saint jean baptiste"),
 ("john-cross","St John of the Cross",r"john of the cross|juan de la cruz"),
 ("john-evangelist","St John the Evangelist",r"john the evangelist|evangelist john|apostle john|saint john\b|saint jean l evangeliste"),
 ("peter-canisius","St Peter Canisius",r"canisius|canisius"),
 ("peter-damian","St Peter Damian",r"pier damiano|peter damian|pier damiani"),
 ("peter-apostle","St Peter",r"\bsaint peter\b|\bsan pedro\b|simon peter|\bpetrus\b"),
 ("paul-apostle","St Paul",r"\bsaint paul\b|apostle paul|saint paul|conversion of saint paul"),
 ("james-greater","St James the Greater",r"james the greater|santiago el mayor"),
 ("james-less","St James the Less",r"james the less|santiago el menor"),
 ("judas-thaddeus","St Jude Thaddeus",r"judas thaddeus|jude thaddeus|saint thaddeus"),
 ("matthias","St Matthias",r"matthias"),
 ("andrew","St Andrew",r"saint andrew"),
 ("philip","St Philip",r"saint philip|apostle philip"),
 ("bartholemew","St Bartholomew",r"bartholomew"),
 ("thomas-apostle","St Thomas the Apostle",r"saint thomas\b|incredulity of saint thomas"),
 ("matthew","St Matthew",r"saint matthew|inspiration of saint matthew"),
 ("simon-apostle","St Simon the Apostle",r"saint simon\b"),
 ("mark","St Mark the Evangelist",r"saint mark|san marco|miracle of the slave"),
 ("luke","St Luke the Evangelist",r"saint luke|luke the evangelist"),
 ("gregory-great","St Gregory the Great",r"saint gregory\b|mass of saint gregory"),
 ("ambrose","St Ambrose",r"saint ambrose|san ambrosio|st ambrose"),
 ("augustine","St Augustine",r"saint augustine|san agustin"),
 ("jerome","St Jerome",r"saint jerome"),
 ("thomas-aquinas","St Thomas Aquinas",r"thomas aquinas|tomas de aquino"),
 ("bonaventure","St Bonaventure",r"bonaventure|bonaventura"),
 ("bernard-clairvaux","St Bernard of Clairvaux",r"saint bernard\b|san bernardo"),
 ("teresa-avila","St Teresa of Ávila",r"teresa of avila|santa teresa|saint teresa\b"),
 ("catherine-siena","St Catherine of Siena",r"catherine of siena|caterina da siena|caterina of siena"),
 ("alphonsus","St Alphonsus Liguori",r"alfonso maria de liguori|alphonsus|alfonso liguori"),
 ("francis-sales","St Francis de Sales",r"francois de sales|francesco di sales|francis de sales"),
 ("basil-great","St Basil the Great",r"saint basil\b|san basilio\b"),
 ("athanasius","St Athanasius",r"athanasius|atanasio"),
 ("gregory-nazianzen","St Gregory Nazianzen",r"gregorio nazianzeno"),
 ("john-chrysostom","St John Chrysostom",r"john chrysostom"),
 ("isidore-seville","St Isidore of Seville",r"isidore of seville"),
 ("bede","St Bede",r"\bbede\b"),
 ("anselm","St Anselm",r"\banselm\b|\banselme\b"),
 ("albert-great","St Albert the Great",r"albertus magnus"),
 ("bellarmine","St Robert Bellarmine",r"bellarmin"),
 ("laurence-brindisi","St Lawrence of Brindisi",r"lorenzo da brindisi|laurent de brindisi"),
 ("cyril-alexandria","St Cyril of Alexandria",r"cyril of alexandria"),
 ("ephrem","St Ephrem the Syrian",r"effremo|ephrem"),
 ("hilary-poitiers","St Hilary of Poitiers",r"hilaire de poitiers|hilary of poitiers"),
 ("hilary-abbot","St Hilary the Abbot",r"hilary two sided|lawrence saint hilary|saint lawrence saint hilary"),
 ("joseph","St Joseph",r"saint joseph|san jose|songe de saint joseph"),
 ("michael","St Michael the Archangel",r"saint michael|archangel michael|san miguel|grand saint michel"),
 ("raphael-archangel","St Raphael the Archangel",r"san rafael|archangel raphael"),
 ("therese-lisieux","St Thérèse of Lisieux",r"therese aux roses|saint therese"),
 ("anthony-padua","St Anthony of Padua",r"anthony of padua|antonio de padua|antonio di padova"),
 ("joan-arc","St Joan of Arc",r"joan of arc|jeanne d arc"),
 ("louis-king","St Louis IX",r"saint louis\b|san luis rey"),
 ("patrick","St Patrick",r"saint patrick"),
 ("stephen","St Stephen",r"saint stephen|san esteban"),
 ("lawrence-roman","St Lawrence",r"saint lawrence"),
]
FATHERS={"ambrose","augustine","jerome","gregory-great","basil-great","athanasius","gregory-nazianzen","john-chrysostom",
"isidore-seville","bede","anselm","bernard-clairvaux","thomas-aquinas","bonaventure","cyril-alexandria","ephrem","peter-damian"}
NOVENAS={"michael","joseph","therese-lisieux"}
DEVOTIONS={"michael","joseph","therese-lisieux","mary-magdalene","john-cross","alphonsus","francis-sales","anthony-padua","joan-arc"}
def propose(title, artist, artwork_id=""):
    t=norm(title);a=norm(artist);idn=norm(artwork_id)
    slots=[];added=set()
    def add(code,heading,why,confidence="strong"):
        if code in added:return
        added.add(code);slots.append({"slot_id":code,"label":heading,"why":why,
                "confidence":confidence,"decision_default":"unreviewed"})
    saints=[(key,name) for key,name,pat in SAINTS if re.search(pat,t)]
    # Specific saints must not contaminate shared name associations.
    if any(k=="john-baptist" for k,_ in saints):
        saints=[x for x in saints if x[0] not in ("john-evangelist",)]
    if any(k=="john-cross" for k,_ in saints):
        saints=[x for x in saints if x[0]!="john-evangelist"]
    if any(k=="peter-damian" for k,_ in saints) or any(k=="peter-canisius" for k,_ in saints):
        saints=[x for x in saints if x[0]!="peter-apostle"]
    if any(k=="hilary-abbot" for k,_ in saints):
        saints=[x for x in saints if x[0]!="hilary-poitiers"]
    if any(k=="laurence-brindisi" for k,_ in saints):
        saints=[x for x in saints if x[0]!="lawrence-roman"]
    if any(k=="matthew" for k,_ in saints) or any(k=="thomas-aquinas" for k,_ in saints):
        saints=[x for x in saints if x[0]!="thomas-apostle"] if any(k=="thomas-aquinas" for k,_ in saints) else saints
    # Some file titles in C32/C34 are filenames without any white-space around names.
    if not saints and re.search(r"saintpeter|saintandrew|saintmark|saintjohn",idn.replace(" ","")):
        for key,name,word in (("peter-apostle","St Peter","saintpeter"),("andrew","St Andrew","saintandrew"),
                              ("mark","St Mark","saintmark"),("john-evangelist","St John the Evangelist","saintjohn")):
            if word in idn.replace(" ",""): saints.append((key,name))
    for key,name in saints:
        add("saints/profile/"+key,"Saints Catalogue — "+name,"A relevant depiction for the saint's identity or illustrated biography.")
        add("calendar/feast/"+key,"Liturgical Calendar — feast of "+name,"Contextual art for the proper feast; verify the 1962 feast and any local calendar variant.")
        if key in FATHERS:
            add("catena/father/"+key,"Living Catena — "+name,"Author portrait within authentic attributed patristic writings; not an AI-generated commentary.")
        if key in DEVOTIONS:
            add("prayers/devotion/"+key,"Prayer Library — "+name,"A relevant illustration alongside existing prayers or devotions, where available.","exploratory")
        if key in NOVENAS:
            add("novenas/"+key,"Novena — "+name,"Potential art for the existing traditional novena experience.","exploratory")
    # Use a historical episode as an image in biography where it is narrative.
    if saints and re.search(r"miracle|vision|barring|martyrdom|conversion|deathbed|last chapter|writing|preaching|predication|council|apotheos|assumption|ecstasy|ecstasi|prison|couronnement|coronation|rule|regle",t):
        for key,name in saints[:2]:
            add("saints/episode/"+key,"Saint's life — historical episode of "+name,"Specific narrated scene rather than a generic portrait.","strong")
    def biblical(code,label):
        add("scripture/historia/"+code,"Historia Salutis — "+label,"Illustrates a specific scriptural episode; verify fidelity to the quoted passage.")
        add("scripture/parallels/"+code,"Scripture Connections — "+label,"Optional companion art in the separate typology/parallels experience.","exploratory")
    if "tears of saint peter" in t or "denial of peter" in t:
        biblical("peter-repentance","Peter's denial and repentance")
    if "incredulity of saint thomas" in t: biblical("thomas-incredulity","The appearance to Thomas (John 20)")
    if "inspiration of saint matthew" in t: add("scripture/gospel-of-matthew","Gospel of Matthew — author art","Evangelist illustration, not a literal depiction of the Gospel narrative.")
    if "mass of saint gregory" in t:
        add("mass-explorer/eucharistic-reverence","Mass Explorer — Eucharistic faith and reverence","Historical devotional imagery explaining Catholic understanding of the Sacrifice of the Mass.")
        add("adoration/eucharist","Adoration and Benediction — Eucharistic art","Optional supporting artwork for the Real Presence, subject to iconographic verification.","exploratory")
    if "mass of saint basil" in t:
        add("mass-explorer/eastern-liturgies","Mass Explorer — historical liturgies","The Mass of St Basil as historical context; not a depiction of the 1962 Roman rubrics.")
    if "martyrdom of saint stephen" in t: biblical("acts-stephen","Martyrdom of Stephen (Acts 7)")
    if "conversion of saint paul" in t: biblical("acts-paul-conversion","Conversion of Paul (Acts 9)")
    if "miracle of the slave" in t: add("saints/episode/mark","Saint Mark — miracle of the slave","An episode from later hagiography, not canonical Scripture.")
    if "saint luke as a painter" in t:
        add("saints/episode/luke","St Luke — Christian sacred-art tradition","Saint painting the Crucifixion: artistic tradition, not canonical Scripture.")
    if "sainte jeanne de chantal" in t or "jeanne de chantal" in t:
        add("saints/profile/jeanne-chantal","Saints Catalogue — St Jane Frances de Chantal","Historical Visitation founding context, verify attribution.")
        add("calendar/feast/jeanne-chantal","Calendar — St Jane Frances de Chantal","Depicts two saints; verify date placement in 1962 calendar.")
    if "immaculee conception" in t or "immaculate conception" in t:
        add("calendar/feast/immaculate-conception","Calendar — Immaculate Conception","Principal Marian feast image, only if Virgin Mary visibly depicted.")
        add("prayers/immaculate-heart","Devotions — Immaculate Heart of Mary","Related Marian devotional context; distinct from the Immaculate Conception doctrine.","exploratory")
    if "saint michael" in t or "archangel michael" in t:
        add("calendar/michaelmas","Calendar — St Michael (Michaelmas)","Strong angelic feast context; confirm image identity.")
    if "raphael" in t and ("arcangel" in t or "archangel" in t):
        add("saints/archangel-raphael","Archangel Raphael — Tobias and healing","Tobit-related devotional context if Raphael depicted.","exploratory")
    if "saint john the baptist in the wilderness" in t:
        add("calendar/advent/john-baptist","Advent / John the Baptist","Seasonal image of the Forerunner; no exact Mass Proper assigned by title alone.")
    if "songe de saint joseph" in t:
        biblical("joseph-dream-matthew","St Joseph's dream (Matthew 1)")
        add("prayers/st-joseph","Prayers to St Joseph","Companion devotional art for household/prayer modules.")
    if "saint joseph" in t or "san jose" in t:
        add("prayers/st-joseph","Prayers to St Joseph","Devotional image for St Joseph's prayers.")
    if "saint patrick" in t:
        add("calendar/customs/patrick","Calendar customs — St Patrick","Irish historical/custom context, not a modern architectural atlas.","exploratory")
    if "saint anthony" in t or "miracolo della mula" in t or "miracle of the mule" in t:
        add("adoration/eucharistic-miracles","Adoration — Eucharistic miracles","St Anthony's mule miracle illustrates veneration of the Blessed Sacrament only for correct scene.","exploratory")
    if "saint louis" in t: add("saints/french-history/louis","Catholic History — St Louis IX","French royal saint and Christian kingship historical context.","exploratory")
    if "jeanne d arc" in t or "joan of arc" in t:
        add("saints/french-history/joan","Catholic History — Joan of Arc","Historical narrative or saint profile art, not Scripture.","exploratory")
    if "saint thomas aquinas" in t:
        add("mass-explorer/eucharistic-theology","Mass Explorer — Eucharistic theology of St Thomas","Author of historic Eucharistic hymns and doctrine; do not misrepresent as direct Mass action.","exploratory")
    if "saint john the baptist" in t:
        add("scripture/historia/john-baptist","Historia Salutis — the Forerunner","Prophetic bridge between Old Testament and Gospels.","exploratory")
    if "saint lawrence saint hilary" in t:
        add("saints/profile/lawrence-roman","Saints Catalogue — St Lawrence","Front face depicts Lawrence. Do not mistake the reverse for Hilary of Poitiers.")
        add("saints/profile/hilary-abbot","Saints Catalogue — St Hilary the Abbot","Reverse face missing from original photographic archive; not Hilary of Poitiers.","exploratory")
    if not slots:
        add("art/library/unassigned","Sacred Art Library — unassigned collection","No responsible exact module match from this title alone; identify visually first.","exploratory")
    # Compact maximum; all relevant slots generated by these rules are available;
    # no random 'homepage hero' suggestion, no duplicate devotion from unrelated saint.
    return slots
