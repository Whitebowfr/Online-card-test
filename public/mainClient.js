var HOST = location.origin.replace(/^http/, 'ws')
var ws = new WebSocket(HOST);
var el;
var myID;
var myName = ""
var cardCounter = 1

ws.onmessage = function(event) {
    messageHandler(event.data)
};

function messageHandler(mes) {
    if (mes.toString().includes("ID")) {
        myID = Number(mes.toString().split("::")[1])
    }
    if (mes.includes("skip__")) {
        return false
    } else {
        console.log(mes)
    }
    if (mes.includes("info__")) {
        var infoValues = []
        for (info in mes.split("__")[1].split("::")) {
            infoValues[info] = mes.split("__")[1].split("::")[info]
        }
        switch (true) {
            case infoValues[0] == "yourName":
                document.getElementById("customName").value = infoValues[1]
                myName = infoValues[1]
                break;
            case infoValues[0] == "playersInQueue" && (status == "connecting" || status == "pre-game lobby basic"):
                if (status != "pre-game lobby basic") {
                    showPreGameLobby(JSON.parse(infoValues[1]), infoValues[2])
                    console.log(infoValues)
                } else if (status == "pre-game lobby basic") {
                    updatePreGameReady(JSON.parse(infoValues[1]), infoValues[2])
                }
                break
            case infoValues[0] == "ClientsReady" && status == "pre-game lobby basic":
                updatePreGameReady(null, infoValues[1])
                break
            case infoValues[0] == "gameStartedWith" && status == "pre-game lobby basic":
                loadGame(infoValues[1])
                break
            case infoValues[0] == "yourTurn" && status == "waiting for server":
                serverWaiting = true
                previousBet = parseInt(infoValues[1])
                if (infoValues[2] != undefined) {
                    waitForPlay(infoValues[1], infoValues[2])
                } else {
                    waitForPlay(infoValues[1])
                }
                break
            case infoValues[0] == "yourCards" && status == "waiting for server":
                console.log(infoValues[1])
                showCards()
                displayYourCards(infoValues[1])
                break
            case infoValues[0] == "yourData":
                me = JSON.parse(infoValues[1])
                break
            case infoValues[0] == "publicCards":
                console.log(infoValues[1])
                for (var i = 0; i < infoValues[1].length - 1; i++) {
                    if (JSON.parse(infoValues[1])[i] != undefined) {
                        displayPublicCards(JSON.parse(infoValues[1])[i], cardCounter)
                        cardCounter++
                    }
                }
                break
            case infoValues[0] == "winningPlayer":
                showVictoryScreen(infoValues[1], infoValues[2])
                backToLobby()
                break
        }
    }
    if (mes.includes("cmd__")) {
        eval(mes.split("__")[1])
    }
}

function displayYourCards(cards) {
    cards = JSON.parse(cards)
    document.getElementById("playerCard1").style.backgroundPosition = -446 * getCard("position", cards[0]) + "px"
    document.getElementById("playerCard2").style.backgroundPosition = -446 * getCard("position", cards[1]) + "px"
}

function displayPublicCards(card, number) {
    console.log(card, number)
    document.getElementById(`publicCard${number}`).style.backgroundPosition = -446 * getCard("position", card) + "px"
}

function replaceAt(string, index, replace) {
    return string.substring(0, index) + replace + string.substring(index + 1);
}

function capFirst(string) {
    if (string.charAt(0) == " ") {
        string = replaceAt(string, 0, "")
    }
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function send(mes) {
    ws.send(mes)
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function checkVisible(elm) {
    var rect = elm.getBoundingClientRect();
    var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
    return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
}

function audio(state) {
    var music = document.querySelector("#music_player")
    if (state) {
        music.play()
    } else {
        music.pause()
    }
}

var musicIndicator = 0;
var nextSong = "";

function setupAudio() {
    if (localStorage.getItem("musicPlayingOnStart") == undefined) {
        localStorage.setItem("musicPlayingOnStart", "true")
    }
    if (localStorage.getItem("musicPlayingOnStart") == "true") {
        document.getElementById('music_player').addEventListener('ended', function() {
            musicIndicator++;
            var musicArray = ["Kahoot Medieval", "Dirt Rally"]
            nextSong = `resources/musics/${musicArray[musicIndicator]}.mp3`
            audioPlayer = document.getElementById('music_player');
            audioPlayer.src = nextSong;
            audioPlayer.load();
            audioPlayer.play();
            if (musicIndicator == musicArray.length) {
                musicIndicator = 0;
            }
        }, false);
    } else if (localStorage.getItem("musicPlayingOnStart") == "false") { //Fuck booleans
        audio(false)
    }
}

function generateName() {
    var name1 = ["abandonn??", "capable", "absolu", "adorable", "aventureux", "acad??mique", "acceptable", "acclam??", "accompli", "pr??cis", "douloureux", "acide", "acrobatique", "actif", "actuel", "adepte", "admirable", "admir??", "adolescent", "adorable", "ador??", "avanc??", "effray??", "affectueux", "??g??", "aggravant", "agressif", "agile", "agit??", "agonisant", "agr??able", "ajar", "alarm??", "alarmant", "alerte", "ali??n??", "vivant", "tout", "altruiste", "??tonnant", "ambitieux", "ample", "amus??", "amusant", "ancr??", "ancien", "ang??lique", "en col??re", "angoiss??", "anim??", "annuel", "autre", "antique", "anxieux", "tout", "appr??hensif", "appropri??", "apte", "arctique", "aride", "aromatique", "artistique", "honteux", "assur??", "??tonnant", "sportif", "attach??", "attentif", "attrayant", "aust??re", "authentique", "autoris??", "automatique", "avare", "moyen", "conscient", "g??nial", "affreux", "maladroit", "enfantin", "mauvais", "arri??re", "gonfl??", "nu", "st??rile", "basique", "beau", "tardif", "bien-aim??", "b??n??fique", "meilleur", "meilleur", "ensorcel??", "grand", "grand c??ur", "biod??gradable", "petit", "amer", "noir", "noir et blanc", "fade", "blanc", "criard", "bl??me", "aveugle", "b??at", "blond", "bleu", "rougissant", "faux", "bouillant", "audacieux", "osseux", "ennuyeux", "autoritaire", "?? la fois", "bondissant", "g??n??reux", "courb??", "courageux", "cassant", "bref", "vif", "brillant", "vif", "cass??", "bronze", "brun", "meurtri", "bouillonnant", "volumineux", "bossel??", "flottant", "lourd", "bourru", "affair??", "beurr??", "bourdonnant", "calculateur", "calme", "candide", "canin", "capital", "insouciant", "prudent", "n??gligent", "attentionn??", "prudent", "caverneux", "c??l??br??", "charmant", "bon march??", "joyeux", "gai", "chef", "tranquille", "joufflu", "circulaire", "classique", "pur", "net", "clair", "malin", "ferme", "ferm??", "maladroit", "encombr??", "grossier", "froid", "color??", "incolore", "colossal", "confortable", "commun", "compatissant", "comp??tent", "complet", "complexe", "compliqu??", "compos??", "concern??", "concret", "confus", "conscient", "attentionn??", "constant", "contenu", "conventionnel", "cuit", "cool", "coop??ratif", "coordonn??", "ringard", "corrompu", "co??teux", "courageux", "courtois", "rus??", "fou", "cr??meux", "cr??atif", "effrayant", "criminel", "croustillant", "critique", "tordu", "encombr??", "cruel", "??crasant", "c??lin", "cultiv??", "cultiv??", "encombrant", "fris??", "incurv??", "mignon", "cylindrique", "endommag??", "humide", "dangereux", "pimpant", "audacieux", "ch??ri", "sombre", "??blouissant", "mort", "mortel", "assourdissant", "cher", "tr??s cher", "d??cent", "d??cimal", "d??cisif", "profond", "sans d??fense", "d??fensif", "d??fiant", "d??ficient", "d??fini", "d??finitif", "retard??", "d??lectable", "d??licieux", "charmant", "d??lirant", "exigeant", "dense", "fiable", "d??pendant", "descriptif", "d??sert??", "d??taill??", "d??termin??", "d??vou??", "diff??rent", "difficile", "num??rique", "diligent", "obscur", "direct", "d??sastreux", "discret", "d??figur??", "d??gueulasse", "d??loyal", "distant", "morne", "sale", "disguised", "dishonest", "lugubre", "distant", "distinct", "d??form??", "??tourdi", "abruti", "douillet", "double", "carr??ment", "terne", "brouillon", "dramatique", "lugubre", "goutteux", "sec", "double", "terne", "d??vou??", "chacun", "d??sireux", "s??rieux", "pr??coce", "facile", "facile ?? vivre", "extatique", "comestible", "??duqu??", "??labor??", "??lastique", "exalt??", "??g??", "??lectrique", "??l??gant", "??l??mentaire", "elliptique", "embarrass??", "embelli", "??minent", "??motionnel", "vide", "enchant??", "enchanteur", "??nergique", "??clair??", "??norme", "enrag??", "entier", "envieux", "??gal", "??quatorial", "essentiel", "estim??", "??thique", "euphorique", "m??me", "??ternel", "bien garnie", "d??moniaque", "exalt??", "excellent", "exemplaire", "??puis??", "excitant", "exotique", "cher", "exp??riment??", "expert", "??tranger", "extraverti", "extra-large", "extra-petit", "fabuleux", "d??faillant", "faible", "??quitable", "fid??le", "faux", "familier", "c??l??bre", "fantaisie", "fantastique", "loin", "lointain", "lointain", "lointain", "rapide", "gros", "fatal", "paternel", "favorable", "favori", "intr??pide", "fougueux", "femelle", "f??minine", "crasseux", "fini", "solide", "floconneux", "flamboyant", "plat", "d??fectueux", "sans d??faut", "vacillant", "fragile", "flippant", "fluide", "agit??", "concentr??", "fondu", "t??m??raire", "insens??", "puissant", "formel", "fortun??", "fr??le", "effray??", "libre", "frais", "fr??quent", "amical", "effray??", "effrayant", "frigide", "fris??", "fris??", "frivole", "avant", "givr??", "gel??", "frugal", "fructueux", "plein", "t??tonnant", "fonctionnel", "dr??le", "pointilleux", "flou", "gargantuesque", "gazeux", "g??n??ral", "g??n??reux", "doux", "authentique", "g??ant", "??tourdi", "gigantesque", "dou??", "g??n??reux", "glamour", "??clatant", "verre", "rutilant", "gai", "??tincelant", "scintillant", "sombre", "glorieux", "brillant", "sombre", "dor??", "bon", "bon vivant", "superbe", "gracieux", "gracieux", "grand", "grandiose", "granuleux", "reconnaissant", "grave", "gris", "grand", "gourmand", "vert", "gr??gaire", "sinistre", "grima??ant", "saisissant", "grizzl??", "grossier", "grotesque", "grognon", "fond??", "croissant", "grognon", "grandi", "??pouvantable", "grognon", "coupable", "cr??dule", "gommeux", "poilu", "moiti??", "fait main", "beau", "?? port??e de main", "heureux", "joyeux luron", "dur", "difficile ?? trouver", "nuisible", "inoffensif", "harmonieux", "dur", "h??tif", "haineux", "obs??dant", "sain", "sinc??re", "cordial", "c??leste", "lourd", "lourd", "utile", "impuissant", "cach??", "hideux", "haut", "haut niveau", "hilarant", "rauque", "creux", "familial", "honn??te", "honorable", "honor??", "plein d'espoir", "horrible", "chaud", "??norme", "humble", "affam??", "id??al", "id??alistique", "identique", "idiot", "idol??", "ignorant", "malade", "ill??gal", "malheureux", "illettr??", "illustre", "imaginaire", "imaginatif", "immacul??", "??jaculant", "immat??riel", "imm??diat", "immense", "passionn??", "impeccable", "impartial", "imparfait", "imperturbable", "impoli", "impolitique", "important", "impossible", "impraticable", "impressionnable", "impressionnant", "improbable", "impur", "inn??", "incomparable", "incompatible", "incomplet", "incons??quent", "incroyable", "ind??l??bile", "inexp??riment??", "indolent", "inf??me", "infantile", "infatu??", "inf??rieur", "infini", "informel", "innocent", "peu s??r", "insidieux", "insignifiant", "insistant", "instructif", "insubstantiel", "intelligent", "intention", "intentionnel", "int??ressant", "interne", "international", "intr??pide", "blind??", "irresponsable", "irritant", "d??mangeant", "blas??", "dentel??", "bourr??", "jovial", "jaloux", "nerveux", "conjoint", "jovial", "jovial", "joyeux", "jubilatoire", "judicieux", "juteux", "jumbo", "junior", "sautillant", "juv??nile", "kal??idoscopique", "vif", "cl??", "gentil", "gentil c??ur", "gentil", "connu", "excentrique", "halal", "bo??teux", "d??gingand??", "imposant", "attard??", "hors-la-loi", "paresseux", "maigre", "l??gal", "l??gitime", "l??ger", "sympathique", "probable", "limit??", "lin??aire", "align??", "liquide", "petit", "vivant", "vif", "livide", "d??testable", "seul", "solitaire", "long", "long terme", "l??che", "de travers", "perdu", "fort", "adorable", "charmant", "aimant", "bas", "loyal", "chanceux", "lourdaud", "lumineux", "bossel??", "lustr??", "luxueux", "fou", "maquill??", "magnifique", "majestueux", "majeur", "m??le", "mammouth", "mari??", "merveilleux", "masculin", "massif", "mature", "maigre", "farineux", "m??chant", "mesquin", "charnu", "m??dical", "m??diocre", "moyen", "doux", "m??lodique", "m??morable", "mena??ant", "joyeux", "d??sordonn??", "m??tallique", "doux", "laiteux", "insouciant", "miniature", "mineur", "minable", "avare", "??gar??", "brumeux", "mixte", "moderne", "modeste", "humide", "monstrueux", "mensuel", "monumental", "moral", "mortifi??", "maternel", "immobile", "montagneux", "boueux", "??touff??", "multicolore", "banal", "trouble", "p??teux", "moisi", "sourd", "myst??rieux", "na??f", "??troit", "m??chant", "naturel", "coquin", "nautique", "proche", "soign??", "n??cessaire", "besogneux", "n??gatif", "n??glig??", "n??gligeable", "voisin", "nerveux", "nouveau", "prochain", "gentil", "agile", "mordant", "nocturne", "bruyant", "non-stop", "normal", "notable", "not??", "remarquable", "nouveau", "nocif", "engourdi", "nutritif", "noisette", "ob??issant", "ob??se", "oblong", "huileux", "oblong", "??vident", "occasionnel", "bizarre", "d??cal??", "offensif", "officiel", "vieux", "d??mod??", "seulement", "ouvert", "optimal", "optimiste", "opulent", "orange", "ordonn??", "organique", "orn??", "ornerie", "ordinaire", "original", "autre", "notre", "excentrique", "sortant", "outlandish", "outrageux", "exceptionnel", "ovale", "trop cuit", "tardif", "trop heureux", "n??glig??", "app??tissant", "p??le", "d??risoire", "parall??le", "dess??ch??", "partiel", "passionn??", "pass??", "pastel", "paisible", "poivr??", "parfait", "parfum??", "p??riodique", "guilleret", "personnel", "pertinent", "pesant", "pessimiste", "mesquin", "bidon", "physique", "per??ant", "rose", "pitoyable", "simple", "plaintif", "plastique", "ludique", "plaisant", "heureux", "agr??able", "dodu", "pelucheux", "poli", "politique", "pointu", "inutile", "pr??t", "pauvre", "populaire", "corpulent", "chic", "positif", "possible", "potable", "surpuissant", "merde humaine", "pratique", "pr??cieux", "pr??sent", "prestigieux", "cher", "??pineux", "primaire", "original", "priv??", "probable", "productive", "profitable", "profuse", "proper", "fier", "prudent", "ponctuel", "piquant", "ch??tif", "pur", "violet", "poussif", "putride", "perplexe", "d??routant", "pittoresque", "qualifi??", "querelleur", "trimestriel", "naus??eux", "querelleur", "douteux", "rapide", "vif d'esprit", "tranquille", "quintessentiel", "excentrique", "quichottesque", "quizzique", "radieux", "d??pareill??", "rapide", "rare", "??ruptif", "brut", "r??cent", "t??m??raire", "rectangulaire", "pr??t", "r??el", "r??aliste", "raisonnable", "rouge", "r??fl??chissant", "royal", "r??gulier", "fiable", "soulag??", "remarquable", "remords", "distant", "repentant", "requis", "respectueux", "responsable", "repoussant", "tournant", "gratifiant", "riche", "rigide", "droit", "annel??", "m??r", "r??ti", "robuste", "ros??", "tournant", "pourri", "rugueux", "rond", "tapageur", "royal", "caoutchouteux", "d??labr??", "rude", "grossier", "coulant", "rural", "rouill??", "triste", "s??r", "sal??", "pareil", "sablonneux", "sain d'esprit", "sarcastique", "sardonique", "satisfait", "??cailleux", "rare", "apeur??", "effrayant", "parfum??", "savant", "scientifique", "m??prisant", "ray??", "maigre", "second", "secondaire", "d'occasion", "secret", "s??r de soi", "autonome", "??go??ste", "sentimental", "s??par??", "serein", "s??rieux", "serpentin", "plusieurs", "s??v??re", "minable", "ombrageux", "peu profond", "honteux", "sans honte", "vif", "chatoyant", "brillant", "choqu??", "choquant", "minable", "court", "court terme", "voyant", "criard", "timide", "malade", "silencieux", "soyeux", "idiot", "argent??", "similaire", "simple", "simpliste", "p??cheur", "unique", "gr??sillant", "squelettique", "maigre", "endormi", "l??ger", "mince", "glissant", "lent", "slushy", "petit", "intelligent", "lisse", "suffisant", "acroupi", "pleunicheur", "sociable", "mou", "d??tremp??", "solide", "sombre", "certain", "sph??rique", "sophistiqu??", "douloureux", "chagrin", "sous acide", "acidul??", "espagnol", "p??tillant", "clairsem??", "sp??cifique", "spectaculaire", "rapide", "??pic??", "fougueux", "malveillant", "splendide", "impeccable", "tachet??", "carr??", "grin??ant", "ondoyant", "stable", "staid", "tach??", "rassis", "standard", "amidonn??", "aust??re", "??toil??", "abrupt", "collant", "raide", "stimulant", "avare", "orageux", "droit", "??trange", "acier", "strict", "strident", "frappant", "ray??", "fort", "studieux", "stup??fiant", "stupide", "robuste", "??l??gant", "subjugu??", "soumis", "substantiel", "subtil", "suburbain", "soudain", "sucr??", "ensoleill??", "super", "superbe", "superficiel", "sup??rieur", "solidaire", "s??r de soi", "surpris", "suspicieux", "svelte", "transpirant", "doux", "??touffant", "rapide", "sympathique", "grand", "bavard", "apprivois??", "bronz??", "tangible", "savoureux", "en lambeaux", "tendu", "fastidieux", "foisonnant", "tentant", "tendre", "tendu", "ti??de", "terrible", "formidable", "testy", "that", "??pais", "mince", "assoif??", "approfondi", "r??flechi", "r??p??", "??conome", "tonitruant", "rang??", "serr??", "opportun", "teint??", "minuscule", "fatigu??", "d??chir??", "total", "dur", "traumatique", "pr??cieux", "formidable", "tragique", "entra??n??", "triangulaire", "rus??", "insignifiant", "trivial", "troubl??", "na??f", "turbulent", "jumeau", "laid", "ultime", "inacceptable", "inconscient", "peu commun", "inconscient", "sous-estim??", "in??gal", "in??gal", "inachev??", "inapte", "d??pli??", "malheureux", "malheureux", "malsain", "uniforme", "insignifiant", "unique", "uni", "non soign??", "inconnu", "ill??gal", "non soulign??", "malchanceux", "contre nature", "d??sagr??able", "irr??aliste", "non m??r", "indisciplin??", "d??sint??ress??", "disgracieux", "instable", "inculte", "d??sordonn??", "intempestif", "non essay??", "faux", "inutilis??", "inhabituel", "malvenu", "peu maniable", "utilis??", "utter", "vacant", "vague", "vain", "valid", "pr??cieux", "insipide", "variable", "vaste", "velout??", "v??n??r??", "vengeur", "v??rifiable", "vibrant", "vicieux", "victorieux", "vigilant", "vigoureux", "m??chant", "violet", "violent", "virtuel", "vertueux", "visible", "vital", "vivace", "vif", "volumineux", "faible", "guerrier", "chaleureux", "chaleureux", "d??form??", "m??fiant", "gaspilleur", "attentif", "gorg?? d'eau", "aqueux", "ondul??", "riche", "faible", "fatigu??", "palmier", "petit", "hebdomadaire", "pleurnichard", "lourd", "bizarre", "bienvenu", "bien document??", "bien soign??", "bien inform??", "bien ??clair??", "bien fait", "bien ais??", "bien us??", "mouill??", "qui", "capricieux", "tourbillon", "chuchot??", "blanc", "entier", "??norme", "m??chant", "large", "yeux ??carquill??s", "ondul??", "sauvage", "volontaire", "fl??tri", "sinueux", "venteux", "ail??", "tordu", "sage", "spirituel", "bancal", " malheureux ", " merveilleux ", " bois?? ", " loufoque ", " verbeux ", " mondain ", " us?? ", " inquiet ", " inqui??tant ", " pire ", " pire ", " sans valeur ", " valable ", " digne ", " courrouc?? ", " mis??rable ", "se tordre ", " avoir tort ", " ??tre irrit?? ", " b??iller ", " annuel ", " jaune ", " jaun??tre ", " jeune ", " juv??nile ", " d??licieux ", " loufoque ", " z??l?? ", " piquant ", " zigzaguant ", " rocailleux "];

    var name2 = ["peuple", "histoire", "chemin", "monde", "carte", "famille", "gouvernement", "sant??", "syst??me", "ordinateur", "viande", "ann??e", "musique", "personne", "m??thode", "donn??es", "nourriture", "oiseau", "probl??me", "logiciel", "connaissance", "pouvoir", "capacit??", "??conomie", "amour", "internet", "t??l??vision", "science", "biblioth??que", "nature", "fait", "produit", "id??e", "temp??rature", "investissement", "r??gion", "soci??t??", "activit??", "histoire", "industrie", "m??dia", "chose", "four", "communaut??", "d??finition", "s??curit??", "qualit??", "d??veloppement", "langue", "gestion", "lecteur", "vari??t??", "vid??o", "semaine", "s??curit??", "pays", "examen", "film", "organisation", "??quipement", "physique", "analyse", "politique", "s??rie", "pens??e", "base", "petit ami", "direction", "strat??gie", "technologie", "arm??e", "cam??ra", "libert??", "papier", "environnement", "enfant", "instance", "mois", "v??rit??", "marketing", "universit??", "??criture", "article", "d??partement", "diff??rence", "objectif", "nouvelles", "audience", "p??che", "croissance", "revenu", "mariage", "utilisateur", "combinaison", "??chec", "signification", "m??decine", "philosophie", "professeur", "communication", "nuit", "chimie", "maladie", "disque", "??nergie", "nation", "route", "r??le", "soupe", "publicit??", "emplacement", "succ??s", "addition", "appartement", "??ducation", "math??matiques", "moment", "peinture", "politique", "attention", "d??cision", "??v??nement", "propri??t??", "shopping", "??tudiant", "bois", "comp??tition", "distribution", "divertissement", "bureau", "population", "pr??sident", "unit??", "cat??gorie", "cigarette", "contexte", "introduction", "opportunit??", "performance", "conducteur", "vol", "longueur", "magazine", "journal", "relation", "enseignement", "cellule", "concessionnaire", "d??bat", "d??couverte", "lac", "membre", "message", "t??l??phone", "sc??ne", "apparence", "association", "concept", "client", "mort", "discussion", "logement", "inflation", "assurance", "humeur", "femme", "conseil", "sang", "effort", "expression", "importance", "opinion", "paiement", "r??alit??", "responsabilit??", "situation", "comp??tence", "d??claration", "richesse", "application", "ville", "comt??", "profondeur", "domaine", "fondation", "grand-m??re", "c??ur", "perspective", "photo", "recette", "studio", "sujet", "collection", "d??pression", "imagination", "passion", "pourcentage", "ressource", "cadre", "annonce", "agence", "coll??ge", "connexion", "critique", "dette", "description", "m??moire", "patience", "secr??taire", "solution", "administration", "aspect", "attitude", "directeur", "personnalit??", "psychologie", "recommandation", "r??ponse", "s??lection", "stockage", "version", "alcool", "argument", "plainte", "contrat", "accent", "perte", "possession", "pr??paration", "p??n??tration", "steak", "syndicat", "accord", "cancer", "monnaie", "emploi", "ing??nierie", "entr??e", "interaction", "limite", "m??lange", "pr??f??rence", "r??gion", "r??publique", "si??ge", "tradition", "virus", "acteur", "classe", "livraison", "dispositif", "difficult??", "drame", "??lection", "moteur", "football", "orientation", "h??tel", "match", "propri??taire", "priorit??", "protection", "suggestion", "tension", "variation", "anxi??t??", "atmosph??re", "conscience", "pain", "climat", "comparaison", "confusion", "construction", "ascenseur", "??motion", "employ??", "employeur", "invit??", "hauteur", "leadership", "centre commercial", "manager", "op??ration", "enregistrement", "respect", "??chantillon", "transport", "ennuyeux", "charit??", "cousin", "d??sastre", "r??dacteur", "efficacit??", "excitation", "??tendue", "feedback", "guitare", "devoir", "leader", "maman", "r??sultat", "permission", "pr??sentation", "promotion", "r??flexion", "r??frig??rateur", "r??solution", "revenu", "session", "chanteur", "tennis", "panier", "bonus", "cabinet", "enfance", "??glise", "v??tements", "caf??", "d??ner", "dessin", "cheveux", "audition", "initiative", "jugement", "laboratoire", "mesure", "mode", "boue", "orange", "po??sie", "police", "possibilit??", "proc??dure", "reine", "ratio", "relation", "restaurant", "satisfaction", "secteur", "signature", "signification", "chanson", "dent", "ville", "v??hicule", "volume", "femme", "accident", "a??roport", "rendez-vous", "arriv??e", "hypoth??se", "baseball", "chapitre", "comit??", "conversation", "base de donn??es", "enthousiasme", "erreur", "explication", "agriculteur", "portail", "fille", "salle", "historien", "h??pital", "blessure", "instruction", "entretien", "fabricant", "repas", "perception", "tarte", "po??me", "pr??sence", "proposition", "r??ception", "remplacement", "r??volution", "rivi??re", "fils", "discours", "th??", "village", "avertissement", "vainqueur", "travailleur", "??crivain", "assistance", "souffle", "acheteur", "poitrine", "chocolat", "conclusion", "contribution", "cookie", "courage", "bureau", "tiroir", "??tablissement", "examen", "ordures", "??picerie", "miel", "impression", "am??lioration", "ind??pendance", "insecte", "inspection", "inspecteur", "roi", "??chelle", "menu", "sanction", "piano", "pomme de terre", "profession", "professeur", "quantit??", "r??action", "exigence", "salade", "soeur", "supermarch??", "langue", "faiblesse", "mariage", "affaire", "ambition", "analyste", "pomme", "mission", "assistant", "salle de bain", "chambre", "bi??re", "anniversaire", "f??te", "championnat", "joue", "client", "cons??quence", "d??part", "diamant", "salet??", "oreille", "fortune", "amiti??", "fun??railles", "g??ne", "petite amie", "chapeau", "indication", "intention", "dame", "minuit", "n??gociation", "obligation", "passager", "pizza", "plate-forme", "po??te", "pollution", "reconnaissance", "r??putation", "chemise", "orateur", "??tranger", "chirurgie", "sympathie", "conte", "gorge", "entra??neur", "oncle", "jeunesse", "temps", "travail", "film", "eau", "argent", "exemple", "pendant", "affaires", "??tude", "jeu", "vie", "forme", "air", "jour", "lieu", "nombre", "partie", "champ", "poisson", "dos", "processus", "chaleur", "main", "exp??rience", "travail", "livre", "fin", "point", "type", "maison", "??conomie", "valeur", "corps", "march??", "guide", "int??r??t", "??tat", "radio", "cours", "entreprise", "prix", "taille", "carte", "liste", "esprit", "commerce", "ligne", "soin", "groupe", "risque", "mot", "graisse", "force", "cl??", "lumi??re", "formation", "nom", "??cole", "haut", "montant", "niveau", "ordre", "pratique", "recherche", "sens", "service", "pi??ce", "web", "patron", "sport", "plaisir", "maison", "page", "terme", "test", "r??ponse", "son", "focus", "mati??re", "genre", "sol", "tableau", "huile", "image", "acc??s", "jardin", "gamme", "taux", "raison", "avenir", "site", "demande", "exercice", "image", "cas", "cause", "c??te", "action", "mauvais", "bateau", "record", "r??sultat", "section", "b??timent", "souris", "argent", "classe", "p??riode", "plan", "magasin", "taxe", "c??t??", "sujet", "espace", "r??gle", "stock", "m??t??o", "hasard", "figure", "homme", "mod??le", "source", "d??but", "terre", "programme", "poulet", "conception", "caract??ristique", "t??te", "mat??riau", "but", "question", "pierre", "sel", "acte", "naissance", "voiture", "chien", "objet", "??chelle", "soleil", "note", "profit", "loyer", "vitesse", "style", "guerre", "banque", "artisanat", "moiti??", "int??rieur", "ext??rieur", "standard", "bus", "??change", "??il", "feu", "position", "pression", "stress", "avantage", "b??n??fice", "bo??te", "cadre", "enjeu", "??tape", "cycle", "visage", "article", "m??tal", "peinture", "revue", "pi??ce", "??cran", "structure", "vue", "compte", "balle", "discipline", "moyen", "partage", "??quilibre", "bit", "noir", "fond", "choix", "cadeau", "impact", "machine", "forme", "outil", "vent", "adresse", "moyenne", "carri??re", "culture", "matin", "pot", "signe", "table", "t??che", "condition", "contact", "cr??dit", "oeuf", "espoir", "glace", "r??seau", "nord", "carr??", "tentative", "date", "effet", "lien", "poste", "??toile", "voix", "capitale", "d??fi", "ami", "soi", "tir", "brosse", "couple", "sortie", "front", "fonction", "manque", "vivant", "plante", "plastique", "spot", "??t??", "go??t", "th??me", "piste", "aile", "cerveau", "bouton", "clic", "d??sir", "pied", "gaz", "influence", "avis", "pluie", "mur", "base", "dommage", "distance", "sentiment", "paire", "??pargne", "personnel", "sucre", "cible", "texte", "animal", "auteur", "budget", "remise", "fichier", "sol", "le??on", "minute", "officier", "phase", "r??f??rence", "registre", "ciel", "sc??ne", "b??ton", "titre", "probl??me", "bol", "pont", "campagne", "personnage", "club", "bord", "preuve", "??ventail", "lettre", "serrure", "maximum", "roman", "option", "pack", "parc", "quart", "peau", "tri", "poids", "b??b??", "arri??re-plan", "porter", "plat", "facteur", "fruit", "verre", "joint", "ma??tre", "muscle", "rouge", "force", "trafic", "voyage", "appel", "diagramme", "??quipement", "id??al", "cuisine", "terre", "rondin", "m??re", "filet", "f??te", "principe", "relatif", "vente", "saison", "signal", "esprit", "rue", "arbre", "vague", "ceinture", "banc", "commission", "copie", "chute", "minimum", "chemin", "progr??s", "projet", "mer", "sud", "statut", "heure", "jus", "chance", "lait", "bouche", "paix", "pipe", "stable", "temp??te", "substance", "??quipe", "tour", "apr??s-midi", "chauve-souris", "plage", "blanc", "attraper", "cha??ne", "consid??ration", "cr??me", "??quipe", "d??tail", "or", "entretien", "enfant", "marque", "mission", "douleur", "plaisir", "score", "vis", "sexe", "boutique", "douche", "costume", "ton", "fen??tre", "agent", "bande", "bain", "bloc", "os", "calendrier", "candidat", "casquette", "manteau", "concours", "coin", "cour", "coupe", "district", "porte", "est", "doigt", "garage", "garantie", "trou", "crochet", "outil", "couche", "conf??rence", "mensonge", "mani??re", "r??union", "nez", "parking", "partenaire", "profil", "riz", "routine", "horaire", "natation", "t??l??phone", "pourboire", "hiver", "compagnie a??rienne", "sac", "bataille", "lit", "facture", "ennuyeux", "g??teau", "code", "courbe", "designer", "dimension", "robe", "facilit??", "urgence", "soir??e", "extension", "ferme", "combat", "??cart", "grade", "vacances", "horreur", "cheval", "h??te", "mari", "pr??t", "erreur", "montagne", "clou", "bruit", "occasion", "paquet", "patient", "pause", "phrase", "preuve", "course", "soulagement", "sable", "phrase", "??paule", "fum??e", "estomac", "ficelle", "touriste", "serviette", "vacances", "ouest", "roue", "vin", "bras", "c??t??", "associ??", "pari", "coup", "fronti??re", "branche", "sein", "fr??re", "copain", "bouquet", "puce", "entra??neur", "croix", "document", "brouillon", "poussi??re", "expert", "sol", "dieu", "golf", "habitude", "fer", "juge", "couteau", "paysage", "ligue", "courrier", "d??sordre", "natif", "ouverture", "parent", "motif", "??pingle", "piscine", "livre", "demande", "salaire", "honte", "abri", "chaussure", "argent", "tacle", "r??servoir", "confiance", "assister", "cuire", "barre", "cloche", "v??lo", "bl??mer", "gar??on", "brique", "chaise", "placard", "indice", "col", "commentaire", "conf??rence", "diable", "r??gime", "peur", "carburant", "gant", "veste", "d??jeuner", "moniteur", "hypoth??que", "infirmi??re", "rythme", "panique", "pic", "avion", "r??compense", "rang", "sandwich", "choc", "d??pit", "spray", "surprise", "jusqu'??", "transition", "week-end", "bienvenue", "cour", "alarme", "plier", "v??lo", "mordre", "aveugle", "bouteille", "c??ble", "bougie", "employ??", "nuage", "concert", "compteur", "fleur", "grand-p??re", "pr??judice", "genou", "avocat", "cuir", "charge", "miroir", "cou", "pension", "assiette", "violet", "ruine", "navire", "jupe", "tranche", "neige", "sp??cialiste", "coup", "interrupteur", "poubelle", "air", "zone", "col??re", "r??compense", "offre", "amer", "botte", "insecte", "camp", "bonbon", "tapis", "chat", "champion", "canal", "horloge", "confort", "vache", "crack", "ing??nieur", "entr??e", "faute", "herbe", "gars", "enfer", "point culminant", "incident", "??le", "blague", "jury", "jambe", "l??vre", "camarade", "moteur", "nerf", "passage", "stylo", "fiert??", "pr??tre", "prix", "promesse", "r??sident", "station", "anneau", "toit", "corde", "voile", "sch??ma", "script", "chaussette", "station", "orteil", "tour", "camion", "t??moin", "peut", "va", "autre", "utiliser", "faire", "bon", "regarder", "aider", "aller", "grand", "??tre", "encore", "public", "lire", "garder", "commencer", "donner", "humain", "local", "g??n??ral", "sp??cifique", "long", "jouer", "sentir", "haut", "mettre", "commun", "mettre", "changer", "simple", "pass??", "grand", "possible", "particulier", "majeur", "personnel", "actuel", "national", "couper", "naturel", "physique", "potentiel", "professionnel", "international", "voyage", "cuisiner", "alternatif", "sp??cial", "travail", "entier", "danse", "excuse", "froid", "commercial", "bas", "achat", "dealer", "primaire", "valoir", "tomber", "n??cessaire", "positif", "produire", "chercher", "pr??sent", "d??penser", "parler", "cr??atif", "dire", "co??t", "conduire", "vert", "soutien", "content", "enlever", "retourner", "courir", "complexe", "d??", "efficace", "moyen", "r??gulier", "r??serve", "ind??pendant", "laisser", "original", "atteindre", "repos", "servir", "regarder", "beau", "charge", "actif", "pause", "n??gatif", "s??r", "s??jour", "visite", "visuel", "affecter", "couvrir", "rapport", "lever", "marcher", "blanc", "junior", "choisir", "unique", "classique", "final", "lever", "m??langer", "priv??", "arr??ter", "enseigner", "western", "pr??occupation", "familier", "voler", "officiel", "large", "confortable", "gain", "riche", "sauver", "stand", "jeune", "lourd", "diriger", "??couter", "pr??cieux", "s'inqui??ter", "g??rer", "diriger", "rencontrer", "lib??rer", "vendre", "finir", "normal", "presse", "monter", "secret", "r??pandre", "printemps", "dur", "attendre", "brun", "profond", "afficher", "flux", "frapper", "objectif", "tirer", "toucher", "annuler", "chimique", "pleurer", "jeter", "extr??me", "pousser", "conflit", "manger", "remplir", "formel", "sauter", "botter", "oppos??", "passer", "lancer", "distant", "total", "traiter", "vaste", "abus", "battre", "br??ler", "d??poser", "imprimer", "??lever", "dormir", "quelque part", "avancer", "consister", "sombre", "double", "tirer", "??gal", "fixer", "embaucher", "interne", "rejoindre", "tuer", "sensible", "taper", "gagner", "attaquer", "r??clamer", "constant", "tra??ner", "boire", "deviner", "mineur", "tirer", "brut", "mou", "solide", "porter", "bizarre", "merveilleux", "annuel", "compter", "mort", "doute", "nourrir", "??ternel", "impressionner", "r??p??ter", "rond", "chanter", "glisser", "d??pouiller", "souhaiter", "combiner", "commander", "creuser", "diviser", "??quivalent", "accrocher", "chasser", "initial", "marcher", "mentionner", "spirituel", "enqu??te", "cravate", "adulte", "bref", "fou", "??vasion", "rassemblement", "haine", "ant??rieur", "r??paration", "rude", "triste", "??gratignure", "malade", "gr??ve", "employer", "externe", "bless??", "ill??gal", "rire", "poser", "mobile", "m??chant", "ordinaire", "r??pondre", "royal", "senior", "diviser", "effort", "lutte", "nager", "train", "sup??rieur", "laver", "jaune", "convertir", "accident", "d??pendant", "plier", "dr??le", "saisir", "cacher", "manquer", "permettre", "citer", "r??cup??rer", "r??soudre", "rouler", "couler", "glisser", "??pargner", "suspect", "doux", "balancer", "tordre", "en haut", "habituel", "?? l'??tranger", "brave", "calme", "concentr??", "estimer", "grand", "masculin", "mine", "prompt", "tranquille", "refuser", "regretter", "r??v??ler", "se pr??cipiter", "secouer", "changer", "briller", "voler", "sucer", "entourer", "ours", "brillant", "oser", "cher", "retarder", "ivre", "femme", "h??te", "in??vitable", "inviter", "baiser", "soign??", "pop", "punch", "d??missionner", "r??pondre", "repr??senter", "r??sister", "d??chirer", "frotter", "idiot", "sourire", "??peler", "??tirer", "stupide", "d??chirer", "temporaire", "demain", "r??veil", "envelopper", "hier", "Thomas", "Tom", "Lieuwe", "mathis", "mathieu", "gertrude", "??z??chiel", "fils de pute", "jean"];


    var name = (capFirst(name2[getRandomInt(0, name2.length + 1)]) + ' ' + capFirst(name1[getRandomInt(0, name1.length + 1)])).replace("  ", " ");
    return name;
}

function getCard(type, cardToGet) {
    const cardsValues = {
        'As de coeur': 1,
        '2 de coeur': 2,
        '3 de coeur': 3,
        '4 de coeur': 4,
        '5 de coeur': 5,
        '6 de coeur': 6,
        '7 de coeur': 7,
        '8 de coeur': 8,
        '9 de coeur': 9,
        '10 de coeur': 10,
        'Valet de coeur': 11,
        'Dame de coeur': 12,
        'Roi de coeur': 13,
        'As de carreau': 1,
        '2 de carreau': 2,
        '3 de carreau': 3,
        '4 de carreau': 4,
        '5 de carreau': 5,
        '6 de carreau': 6,
        '7 de carreau': 7,
        '8 de carreau': 8,
        '9 de carreau': 9,
        '10 de carreau': 10,
        'Valet de carreau': 11,
        'Dame de carreau': 12,
        'Roi de carreau': 13,
        'As de pique': 1,
        '2 de pique': 2,
        '3 de pique': 3,
        '4 de pique': 4,
        '5 de pique': 5,
        '6 de pique': 6,
        '7 de pique': 7,
        '8 de pique': 8,
        '9 de pique': 9,
        '10 de pique': 10,
        'Valet de pique': 11,
        'Dame de pique': 12,
        'Roi de pique': 13,
        'As de trefle': 1,
        '2 de trefle': 2,
        '3 de trefle': 3,
        '4 de trefle': 4,
        '5 de trefle': 5,
        '6 de trefle': 6,
        '7 de trefle': 7,
        '8 de trefle': 8,
        '9 de trefle': 9,
        '10 de trefle': 10,
        'Valet de trefle': 11,
        'Dame de trefle': 12,
        'Roi de trefle': 13
    }
    const otherCardsValues = {
        'As de coeur': 1,
        '2 de coeur': 2,
        '3 de coeur': 3,
        '4 de coeur': 4,
        '5 de coeur': 5,
        '6 de coeur': 6,
        '7 de coeur': 7,
        '8 de coeur': 8,
        '9 de coeur': 9,
        '10 de coeur': 10,
        'Valet de coeur': 11,
        'Dame de coeur': 12,
        'Roi de coeur': 13,
        'As de carreau': 14,
        '2 de carreau': 15,
        '3 de carreau': 16,
        '4 de carreau': 17,
        '5 de carreau': 18,
        '6 de carreau': 19,
        '7 de carreau': 20,
        '8 de carreau': 21,
        '9 de carreau': 22,
        '10 de carreau': 23,
        'Valet de carreau': 24,
        'Dame de carreau': 25,
        'Roi de carreau': 26,
        'As de pique': 27,
        '2 de pique': 28,
        '3 de pique': 29,
        '4 de pique': 30,
        '5 de pique': 31,
        '6 de pique': 32,
        '7 de pique': 33,
        '8 de pique': 34,
        '9 de pique': 35,
        '10 de pique': 36,
        'Valet de pique': 37,
        'Dame de pique': 38,
        'Roi de pique': 39,
        'As de trefle': 40,
        '2 de trefle': 41,
        '3 de trefle': 42,
        '4 de trefle': 43,
        '5 de trefle': 44,
        '6 de trefle': 45,
        '7 de trefle': 46,
        '8 de trefle': 47,
        '9 de trefle': 48,
        '10 de trefle': 49,
        'Valet de trefle': 50,
        'Dame de trefle': 51,
        'Roi de trefle': 52
    }
    var suits = { 'coeur': 0, 'carreau': 13, 'pique': 39, 'trefle': 26 }
    var cardColor = cardToGet.split(" ")[2]
    var cardValue = cardToGet.split(" ")[0]
    if (type == "position") {
        var returnedValue = Number(suits[cardColor]) + Number(cardsValues[cardToGet])
        return returnedValue
    }
    if (type == "value") {
        return cardsValues[cardValue]
    }
}