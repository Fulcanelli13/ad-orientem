#!/usr/bin/env python3
"""B53: source-subject-linked expanded image placement possibilities.

This maps works to *candidate* destinations, not published slots, dates, or
doctrine. Every proposal remains Yes/No undecided. The user's custom text
is first-class, and one painting may receive multiple approved destinations.
"""
import re
from sacred_art_b52_placement_proposals import propose,norm

GOSPEL=[
 ("flight-egypt",r"flight into egypt|fuite en egypte", "Flight into Egypt (Matthew 2)", "calendar/christmas-season", "Calendar — Christmas season", None),
 ("baptism-christ",r"baptism of christ|bapt[eê]me du christ", "Baptism of Christ (Matthew 3)", "calendar/baptism-christ", "Calendar — Baptism of Our Lord", None),
 ("temptation-christ",r"temptation of christ", "The Temptation in the Wilderness", "calendar/lent/temptation", "Calendar — Lent, Christ's Temptation", None),
 ("draught-fishes",r"miraculous draught|miraculous catch|pesca milagrosa", "Miraculous Draught of Fishes (Luke 5)", None,None,None),
 ("cana",r"marriage feast at cana|wedding feast at cana|noces de cana", "Wedding Feast at Cana (John 2)", None,None,None),
 ("samaria",r"woman of samaria|samaritan woman", "Jesus and the Samaritan Woman (John 4)", None,None,None),
 ("paralytic",r"healing of the paralytic|healing the paralytic|pool of bethesda", "Healing of the Paralytic", None,None,None),
 ("transfiguration",r"transfiguration", "The Transfiguration", "calendar/transfiguration", "Calendar — Transfiguration of Our Lord", None),
 ("good-samaritan",r"good samaritan", "Parable of the Good Samaritan (Luke 10)", None,None,None),
 ("prodigal-son",r"prodigal son", "Parable of the Prodigal Son (Luke 15)", None,None,None),
 ("martha-mary",r"martha and mary", "Christ with Martha and Mary (Luke 10)", None,None,None),
 ("emmaus",r"supper at emmaus", "Road to Emmaus and the Breaking of Bread (Luke 24)", "mass-explorer/recognition-breaking-bread", "Mass Explorer — Emmaus and breaking of bread", None),
 ("entry-jerusalem",r"entry into jerusalem|triumphal entry|christ enters jerusalem", "Palm Sunday Entry (Matthew 21)", "calendar/palm-sunday", "Calendar — Palm Sunday", None),
 ("denial-peter",r"denial of saint peter|denial of peter|tears of saint peter", "Peter's Denial and Repentance", None,None,None),
 ("calling-matthew",r"calling of saint matthew", "The Calling of Matthew (Matthew 9)", None,None,None),
 ("christ-doctors",r"christ among the doctors|finding in the temple|jesus among the doctors", "The Finding of Jesus in the Temple (Luke 2)", None,None,"joyful-5"),
 ("bless-children",r"christ blessing the children|jesus blessing children", "Jesus Blessing the Children (Mark 10)", None,None,None),
 ("john-baptist-preaching",r"john the baptist preaching", "John the Baptist's Call to Repentance (Matthew 3)", "calendar/advent/forerunner", "Calendar — Advent and the Forerunner", None),
 ("beheading-john",r"beheading of saint john the baptist|feast of herod|beheading of john the baptist", "Death of John the Baptist (Mark 6)", "calendar/martyrdom-john-baptist", "Calendar — Beheading of St John the Baptist", None),
 ("raising-lazarus",r"raising of lazarus|resurrection of lazarus", "Raising of Lazarus (John 11)", "calendar/passiontide/lazarus", "Calendar — Passiontide / Lazarus", None),
 ("annunciation",r"annunciation|annonciation|anunciaci[oó]n", "The Annunciation (Luke 1)", "calendar/annunciation", "Calendar — Annunciation (25 March)", "joyful-1"),
 ("visitation",r"visitation\b|visitaci[oó]n", "The Visitation (Luke 1)", "calendar/visitation", "Calendar — Visitation of Our Lady", "joyful-2"),
 ("nativity",r"\bnativity\b|adoration of the shepherds|adoration of shepherds|birth of christ", "The Birth of Christ (Luke 2)", "calendar/christmas", "Calendar — Christmas", "joyful-3"),
 ("magi",r"adoration of the magi|epiphany|adoration of the kings", "The Adoration of the Magi (Matthew 2)", "calendar/epiphany", "Calendar — Epiphany", None),
 ("presentation",r"presentation in the temple|presentation of christ", "Presentation of Our Lord (Luke 2)", "calendar/candlemas", "Calendar — Candlemas / Presentation", "joyful-4"),
 ("last-supper",r"\blast supper\b|ultima cena|the institution of the eucharist", "The Last Supper", "calendar/holy-thursday", "Calendar — Maundy Thursday", None),
 ("agony-garden",r"agony in the garden|christ in the garden of gethsemane", "Christ's Agony in Gethsemane", "calendar/holy-week/gethsemane", "Calendar — Holy Week, Gethsemane", "sorrowful-1"),
 ("scourging",r"scourging|flagellation of christ", "The Scourging at the Pillar", "calendar/holy-week/passion", "Calendar — Passion of Our Lord", "sorrowful-2"),
 ("crowning-thorns",r"crowning with thorns|christ crowned with thorns", "The Crowning with Thorns", "calendar/holy-week/passion", "Calendar — Passion of Our Lord", "sorrowful-3"),
 ("carrying-cross",r"carrying the cross|christ bearing the cross|christ carrying the cross", "Jesus Carries the Cross", "calendar/good-friday", "Calendar — Good Friday", "sorrowful-4"),
 ("descent-cross",r"descent from the cross|deposition from the cross", "Descent from the Cross", "calendar/good-friday", "Calendar — Good Friday", None),
 ("burial",r"burial of christ|entombment|laying christ in the tomb", "Burial of Christ", "calendar/holy-saturday", "Calendar — Holy Saturday", None),
 ("resurrection",r"resurrection of christ|the resurrection\b|christ rises from the dead", "Resurrection of Christ", "calendar/easter", "Calendar — Easter", "glorious-1"),
 ("ascension",r"ascension of christ|the ascension\b", "Ascension of Our Lord", "calendar/ascension", "Calendar — Ascension Thursday", "glorious-2"),
 ("pentecost",r"\bpentecost\b|descent of the holy spirit", "The Descent of the Holy Ghost", "calendar/pentecost", "Calendar — Pentecost", "glorious-3"),
 ("assumption",r"assumption of the virgin|assumption of mary|assumption of our lady", "Assumption of the Blessed Virgin Mary", "calendar/assumption", "Calendar — Assumption", "glorious-4"),
 ("coronation-mary",r"coronation of the virgin|coronation of mary", "Coronation of the Blessed Virgin", "calendar/marian/coronation", "Marian Calendar — Coronation", "glorious-5")
]
ROSARY={
 "joyful-1":"Joyful I — Annunciation","joyful-2":"Joyful II — Visitation",
 "joyful-3":"Joyful III — Nativity","joyful-4":"Joyful IV — Presentation",
 "joyful-5":"Joyful V — Finding of Jesus in the Temple",
 "sorrowful-1":"Sorrowful I — Agony in the Garden",
 "sorrowful-2":"Sorrowful II — Scourging",
 "sorrowful-3":"Sorrowful III — Crowning with Thorns",
 "sorrowful-4":"Sorrowful IV — Carrying of the Cross",
 "sorrowful-5":"Sorrowful V — Crucifixion",
 "glorious-1":"Glorious I — Resurrection","glorious-2":"Glorious II — Ascension",
 "glorious-3":"Glorious III — Pentecost","glorious-4":"Glorious IV — Assumption",
 "glorious-5":"Glorious V — Coronation of Our Lady"
}
def propose_all(title,artist,artwork_id=""):
    t=norm(title)
    old=propose(title,artist,artwork_id)
    out=list(old)
    # Family names and medieval devotional scenes must not be presented as
    # literal historical Gospel episodes or confused with another saint.
    if re.search(r"joseph of cupertino|giuseppe da copertino",t):
        out=[x for x in out if not (
            x["slot_id"] in ("saints/profile/joseph","calendar/feast/joseph","prayers/st-joseph")
            or x["slot_id"].startswith("novenas/joseph")
        )]
    if re.search(r"anthony abbot|antonio abate",t):
        out=[x for x in out if x["slot_id"]!="adoration/eucharistic-miracles"]
    seen={x["slot_id"] for x in out}
    def add(key,label,why,confidence="strong"):
        if key in seen:return
        seen.add(key)
        out.append({"slot_id":key,"label":label,"why":why,"confidence":confidence,"decision_default":"unreviewed"})
    def scripture(key,label):
        add("scripture/historia/"+key,"Historia Salutis — "+label,
            "Art for the relevant Gospel/Scripture episode, after exact scene verification.")
        add("scripture/parallels/"+key,"Scripture Connections — "+label,
            "Optional illustration in the separate thematic parallels compendium.","exploratory")
    unrelated_crucifix=re.search(r"crucifixion of (?:saint|st)\s+(?:peter|andrew|philip)|crucifixion of (?:sainte|san)\b|kneeling before christ on the cross|saint luke as a painter before christ on the cross",t)
    for key,pattern,subject,calendar_key,calendar_label,rosary in GOSPEL:
        if re.search(pattern,t):
            scripture(key,subject)
            if calendar_key:
                add(calendar_key,calendar_label,"Subject-appropriate calendar painting; date/1962 feast use must still be checked.")
            if rosary:
                add("rosary/mystery/"+rosary,"Traditional Rosary — "+ROSARY[rosary],
                    "Mystery painting in the traditional fifteen-mystery Rosary.","strong")
    # Christ's Passion is not the martyrdom of Peter, Andrew or Philip.
    if re.search(r"crucifixion|christ on the cross|calvary",t) and not unrelated_crucifix:
        add("calendar/good-friday","Calendar — Good Friday","Crucifixion image of Our Lord for the Sacred Triduum.")
        add("rosary/mystery/sorrowful-5","Traditional Rosary — "+ROSARY["sorrowful-5"],
            "Traditional fifth Sorrowful Mystery; not a depiction of a saint's separate martyrdom.")
        add("stations/12","Stations of the Cross — XII, Jesus Dies on the Cross",
            "Use only when the scene principally depicts Christ crucified.")
        add("mass-explorer/calvary-sacrifice","Mass Explorer — Calvary and the Sacrifice of the Mass",
            "Theological connection between Calvary and Holy Mass; not a literal depiction of a Mass rubric.","exploratory")
    if re.search(r"descent from the cross|deposition from the cross",t):
        add("stations/13","Stations of the Cross — XIII, Jesus Taken Down",
            "Traditional Thirteenth Station: Jesus is taken down from the Cross.")
    if re.search(r"burial of christ|entombment",t):
        add("stations/14","Stations of the Cross — XIV, Burial of Jesus",
            "Traditional Fourteenth Station: Jesus is laid in the tomb.")
    if re.search(r"carrying the cross|christ carrying the cross",t):
        add("stations/2","Stations of the Cross — II, Jesus Takes Up His Cross",
            "Supports traditional Station II; verify which moment the painting shows.")
    if re.search(r"\bchrist\b.*\b(?:condemned|before pilate)\b",t):
        add("stations/1","Stations of the Cross — I, Jesus Is Condemned",
            "Candidate Station I image, subject to iconographic check.")
    if re.search(r"last supper",t):
        add("mass-explorer/eucharist-institution","Mass Explorer — Institution of the Holy Eucharist",
            "Source-image context for the Eucharistic institution and Mass; not the 1962 priest's rubrics.")
        add("adoration/real-presence","Adoration — Mystery of the Eucharist",
            "Eucharistic devotional context.","exploratory")
    if re.search(r"trinity|holy trinity|drievuldigheid",t) and not "new testament trinity" in t:
        add("calendar/trinity-sunday","Calendar — Trinity Sunday","Image associated with the Holy Trinity; assess appropriateness of visual representation.")
        add("prayers/holy-trinity","Prayer Library — Holy Trinity","Trinitarian devotion, with theological iconography review.","exploratory")
    if re.search(r"immaculate conception|immaculee conception",t):
        add("calendar/immaculate-conception","Calendar — Immaculate Conception (8 December)",
            "Immaculate Conception celebration, not the historical scene of Mary's conception.")
        add("prayers/immaculate-heart","Prayer Library — Immaculate Heart of Mary",
            "Distinct devotion with possible thematic association.","exploratory")
    if re.search(r"virgin and child|madonna and child|mother and child|our lady|vierge a l enfant|virgin of carmen",t):
        add("prayers/marian-devotion","Prayer Library — Our Lady",
            "Timeless Marian devotional artwork, not automatically a literal Gospel narrative.")
        add("rosary/marian-art","Rosary — general Marian contemplation",
            "Companion Marian art outside the strict 15 mystery illustrations.","exploratory")
    if re.search(r"holy family|sagrada familia",t):
        add("calendar/holy-family","Calendar — Holy Family","Feast of the Holy Family devotional painting.")
        add("prayers/holy-family","Prayer Library — Holy Family",
            "Devotion to Jesus, Mary and Joseph, not necessarily the Nativity.","strong")
    if re.search(r"sacred heart|heart of jesus|coeur de jesus",t):
        add("calendar/sacred-heart","Calendar — Sacred Heart of Jesus","Feast of the Sacred Heart.")
        add("prayers/sacred-heart","Sacred Heart devotion","Consecrations, litanies or related prayers.","strong")
        add("first-fridays","First Friday devotion","Sacred Heart prayers for the First Fridays.","strong")
    if re.search(r"heart of mary|immaculate heart|coeur de marie",t):
        add("calendar/immaculate-heart","Calendar — Immaculate Heart of Mary",
            "Traditional feast/use, with source calendar verification.")
        add("prayers/immaculate-heart","Immaculate Heart devotion","Devotional prayer module.","strong")
        add("first-saturdays","First Saturday devotion","Immaculate Heart / First Saturdays.","strong")
    if re.search(r"purgatory|souls in purgatory|souls of purgatory",t):
        add("calendar/all-souls","Calendar — All Souls' Day","Prayer for the faithful departed.")
        add("prayers/holy-souls","Prayer Library — Holy Souls","Prayer for the souls in Purgatory.")
    if re.search(r"expulsion of adam|creation of the world|adam and eve|expulsion from paradise",t):
        scripture("creation-fall","Creation, the Fall and expulsion from Eden")
        add("covenants/adam","Historia Salutis — Adam and the first covenant","Foundational covenant and genealogy context.","exploratory")
    if re.search(r"good samaritan",t):
        add("prayers/works-mercy","Catholic life — works of mercy",
            "Moral lesson of the parable; not a literal historical event.","exploratory")
    if re.search(r"prodigal son",t):
        add("confession/reconciliation","Confession — repentance and reconciliation",
            "Illustration of divine mercy and repentance, without inventing sacramental rubrics.")
    if re.search(r"saint francis|st francis|san francisco",t) and not re.search(r"francis de sales|francis xavier|francis of paola",t):
        add("saints/profile/francis-assisi","Saints Catalogue — St Francis of Assisi",
            "Franciscan saint or tradition, confirm subject is Francis of Assisi.","exploratory")
    if re.search(r"saint dominic|santo domingo|san domenico",t):
        add("saints/profile/dominic-guzman","Saints Catalogue — St Dominic",
            "Portrait or episode concerning the founder of the Order of Preachers.")
        add("calendar/feast/dominic-guzman","Calendar — St Dominic","Feast and biography artwork.","exploratory")
    if re.search(r"saint benedict|san benito|san benedetto",t):
        add("saints/profile/benedict-nursia","Saints Catalogue — St Benedict",
            "Scene or devotional portrait of Benedict of Nursia.")
        add("calendar/feast/benedict-nursia","Calendar — St Benedict",
            "Benedictine founder in liturgical context.","exploratory")
    if re.search(r"saint francis xavier|francisco javier",t):
        add("saints/profile/francis-xavier","Saints Catalogue — St Francis Xavier",
            "Jesuit missionary context; distinguish original finished canvas from modello.")
    if re.search(r"saint ignatius of loyola|ignacio de loyola",t):
        add("saints/profile/ignatius-loyola","Saints Catalogue — St Ignatius of Loyola",
            "Jesuit founder, finished Rubens oil vs modello needs distinction.")
    if re.search(r"saint lucy|santa lucia|sainte lucie",t):
        add("saints/profile/lucy","Saints Catalogue — St Lucy","Martyr life or portrait.")
        add("calendar/feast/lucy","Calendar — St Lucy","Traditional feast artwork.")
    if re.search(r"saint agnes|santa ines",t):
        add("saints/profile/agnes","Saints Catalogue — St Agnes","Virgin martyr portrait.")
        add("calendar/feast/agnes","Calendar — St Agnes","Traditional feast artwork.")
    if re.search(r"saint cecilia|santa cecilia|sainte cecile",t):
        add("saints/profile/cecilia","Saints Catalogue — St Cecilia","Virgin martyr and patroness of sacred music.")
        add("calendar/feast/cecilia","Calendar — St Cecilia","Traditional feast artwork.")
    if re.search(r"saint catherine of alexandria|sainte catherine of alexandria|catherine of alexandria",t):
        add("saints/profile/catherine-alexandria","Saints Catalogue — St Catherine of Alexandria",
            "Saint's biography and martyrdom.")
        add("calendar/feast/catherine-alexandria","Calendar — St Catherine of Alexandria",
            "Feast context.")
    if re.search(r"saint martin dividing his cloak",t):
        add("saints/profile/martin-tours","Saints Catalogue — St Martin of Tours",
            "Historical episode of charity.")
        add("calendar/feast/martin-tours","Calendar — St Martin of Tours",
            "Traditional feast context.")
    if re.search(r"saint sebastian|sao sebastiao|san sebastian",t):
        add("saints/profile/sebastian","Saints Catalogue — St Sebastian",
            "Roman martyr portrait; not a Gospel Passion scene.")
        add("calendar/feast/sebastian","Calendar — St Sebastian","Traditional feast context.")
    if re.search(r"saint nicholas of bari|saint nicholas",t):
        add("saints/profile/nicholas-bari","Saints Catalogue — St Nicholas of Myra",
            "Traditional saint and pastoral witness.")
        add("calendar/feast/nicholas-bari","Calendar — St Nicholas","Feast context.")
    if re.search(r"saint philip neri|filippo neri",t):
        add("saints/profile/philip-neri","Saints Catalogue — St Philip Neri",
            "Roman priest and Oratorian founder.")
        add("calendar/feast/philip-neri","Calendar — St Philip Neri",
            "Feast context.")
    if re.search(r"saint rose|santa rosa",t):
        add("saints/profile/rose","Saints Catalogue — St Rose",
            "Identify the depicted Saint Rose precisely before publishing.","exploratory")
    if re.search(r"saint joseph of cupertino|giuseppe da copertino",t):
        add("saints/profile/joseph-cupertino","Saints Catalogue — St Joseph of Cupertino",
            "Life episode of the saint, not St Joseph the spouse of Mary.")
    if re.search(r"san vicente de paul|saint vincent de paul",t):
        add("saints/profile/vincent-de-paul","Saints Catalogue — St Vincent de Paul",
            "Portrait of the priest and founder.")
    if re.search(r"saint genevieve|sainte genevieve",t):
        add("saints/profile/genevieve","Saints Catalogue — St Genevieve",
            "Patroness of Paris, not a generic Marian image.")
    if re.search(r"marguerite marie alacoque",t):
        add("saints/profile/margaret-mary","Saints Catalogue — St Margaret Mary Alacoque",
            "Apparition or life of the apostle of the Sacred Heart.")
        add("prayers/sacred-heart","Sacred Heart devotion",
            "Apparition to St Margaret Mary — image for existing devotion.","strong")
    if re.search(r"jean marie vianney|cure d ars",t):
        add("saints/profile/john-vianney","Saints Catalogue — St John Vianney",
            "Pastoral saint; verify which historical miracle is depicted.")
    if re.search(r"saint francis of paola",t):
        add("saints/profile/francis-paola","Saints Catalogue — St Francis of Paola",
            "Founder of the Minim Order.")
    if re.search(r"mary of egypt|mary magdalene|penitent magdalen|magdalene in christ",t):
        add("confession/penitence","Confession — Penitence and conversion",
            "Saintly repentance theme; not a depiction of the rite of confession.","exploratory")
    if len(out)>1 and "art/library/unassigned" in seen:
        out=[x for x in out if x["slot_id"]!="art/library/unassigned"]
    assert len(out)==len({x["slot_id"] for x in out})
    return out
