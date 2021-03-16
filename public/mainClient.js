var HOST = location.origin.replace(/^http/, 'ws')
var ws = new WebSocket(HOST);
var el;
var myID

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
                break;
            case infoValues[0] == "playersInQueue" && (status == "connecting" || status == "pre-game lobby basic"):
                if (status != "pre-game lobby basic") {
                    showPreGameLobby(JSON.parse(infoValues[1]), infoValues[2])
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
                break
            case infoValues[0] == "yourCards" && status == "waiting for server":
                console.log(infoValues[1])
                displayYourCards(infoValues[1])
                break
            case infoValues[0] == "yourData":
                me = JSON.parse(infoValues[1])
                break
        }
    }
    if (mes.includes("cmd__")) {
        console.log(mes.split("__")[1])
        eval(mes.split("__")[1])
    }
}

function displayYourCards(cards) {
    cards = JSON.parse(cards)
    console.log(cards[0])
    console.log(getCard("position", cards[0]))
    console.log(cards[1], getCard("position", cards[1]))
    document.getElementById("playerCard1").style.backgroundPosition = -446 * getCard("position", cards[0]) + "px"
    document.getElementById("playerCard2").style.backgroundPosition = -446 * getCard("position", cards[1]) + "px"
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
    var name1 = ["abandonné", "capable", "absolu", "adorable", "aventureux", "académique", "acceptable", "acclamé", "accompli", "précis", "douloureux", "acide", "acrobatique", "actif", "actuel", "adepte", "admirable", "admiré", "adolescent", "adorable", "adoré", "avancé", "effrayé", "affectueux", "âgé", "aggravant", "agressif", "agile", "agité", "agonisant", "agréable", "ajar", "alarmé", "alarmant", "alerte", "aliéné", "vivant", "tout", "altruiste", "étonnant", "ambitieux", "ample", "amusé", "amusant", "ancré", "ancien", "angélique", "en colère", "angoissé", "animé", "annuel", "autre", "antique", "anxieux", "tout", "appréhensif", "approprié", "apte", "arctique", "aride", "aromatique", "artistique", "honteux", "assuré", "étonnant", "sportif", "attaché", "attentif", "attrayant", "austère", "authentique", "autorisé", "automatique", "avare", "moyen", "conscient", "génial", "affreux", "maladroit", "enfantin", "mauvais", "arrière", "gonflé", "nu", "stérile", "basique", "beau", "tardif", "bien-aimé", "bénéfique", "meilleur", "meilleur", "ensorcelé", "grand", "grand cœur", "biodégradable", "petit", "amer", "noir", "noir et blanc", "fade", "blanc", "criard", "blême", "aveugle", "béat", "blond", "bleu", "rougissant", "faux", "bouillant", "audacieux", "osseux", "ennuyeux", "autoritaire", "à la fois", "bondissant", "généreux", "courbé", "courageux", "cassant", "bref", "vif", "brillant", "vif", "cassé", "bronze", "brun", "meurtri", "bouillonnant", "volumineux", "bosselé", "flottant", "lourd", "bourru", "affairé", "beurré", "bourdonnant", "calculateur", "calme", "candide", "canin", "capital", "insouciant", "prudent", "négligent", "attentionné", "prudent", "caverneux", "célébré", "charmant", "bon marché", "joyeux", "gai", "chef", "tranquille", "joufflu", "circulaire", "classique", "pur", "net", "clair", "malin", "ferme", "fermé", "maladroit", "encombré", "grossier", "froid", "coloré", "incolore", "colossal", "confortable", "commun", "compatissant", "compétent", "complet", "complexe", "compliqué", "composé", "concerné", "concret", "confus", "conscient", "attentionné", "constant", "contenu", "conventionnel", "cuit", "cool", "coopératif", "coordonné", "ringard", "corrompu", "coûteux", "courageux", "courtois", "rusé", "fou", "crémeux", "créatif", "effrayant", "criminel", "croustillant", "critique", "tordu", "encombré", "cruel", "écrasant", "câlin", "cultivé", "cultivé", "encombrant", "frisé", "incurvé", "mignon", "cylindrique", "endommagé", "humide", "dangereux", "pimpant", "audacieux", "chéri", "sombre", "éblouissant", "mort", "mortel", "assourdissant", "cher", "très cher", "décent", "décimal", "décisif", "profond", "sans défense", "défensif", "défiant", "déficient", "défini", "définitif", "retardé", "délectable", "délicieux", "charmant", "délirant", "exigeant", "dense", "fiable", "dépendant", "descriptif", "déserté", "détaillé", "déterminé", "dévoué", "différent", "difficile", "numérique", "diligent", "obscur", "direct", "désastreux", "discret", "défiguré", "dégueulasse", "déloyal", "distant", "morne", "sale", "disguised", "dishonest", "lugubre", "distant", "distinct", "déformé", "étourdi", "abruti", "douillet", "double", "carrément", "terne", "brouillon", "dramatique", "lugubre", "goutteux", "sec", "double", "terne", "dévoué", "chacun", "désireux", "sérieux", "précoce", "facile", "facile à vivre", "extatique", "comestible", "éduqué", "élaboré", "élastique", "exalté", "âgé", "électrique", "élégant", "élémentaire", "elliptique", "embarrassé", "embelli", "éminent", "émotionnel", "vide", "enchanté", "enchanteur", "énergique", "éclairé", "énorme", "enragé", "entier", "envieux", "égal", "équatorial", "essentiel", "estimé", "éthique", "euphorique", "même", "éternel", "bien garnie", "démoniaque", "exalté", "excellent", "exemplaire", "épuisé", "excitant", "exotique", "cher", "expérimenté", "expert", "étranger", "extraverti", "extra-large", "extra-petit", "fabuleux", "défaillant", "faible", "équitable", "fidèle", "faux", "familier", "célèbre", "fantaisie", "fantastique", "loin", "lointain", "lointain", "lointain", "rapide", "gros", "fatal", "paternel", "favorable", "favori", "intrépide", "fougueux", "femelle", "féminine", "crasseux", "fini", "solide", "floconneux", "flamboyant", "plat", "défectueux", "sans défaut", "vacillant", "fragile", "flippant", "fluide", "agité", "concentré", "fondu", "téméraire", "insensé", "puissant", "formel", "fortuné", "frêle", "effrayé", "libre", "frais", "fréquent", "amical", "effrayé", "effrayant", "frigide", "frisé", "frisé", "frivole", "avant", "givré", "gelé", "frugal", "fructueux", "plein", "tâtonnant", "fonctionnel", "drôle", "pointilleux", "flou", "gargantuesque", "gazeux", "général", "généreux", "doux", "authentique", "géant", "étourdi", "gigantesque", "doué", "généreux", "glamour", "éclatant", "verre", "rutilant", "gai", "étincelant", "scintillant", "sombre", "glorieux", "brillant", "sombre", "doré", "bon", "bon vivant", "superbe", "gracieux", "gracieux", "grand", "grandiose", "granuleux", "reconnaissant", "grave", "gris", "grand", "gourmand", "vert", "grégaire", "sinistre", "grimaçant", "saisissant", "grizzlé", "grossier", "grotesque", "grognon", "fondé", "croissant", "grognon", "grandi", "épouvantable", "grognon", "coupable", "crédule", "gommeux", "poilu", "moitié", "fait main", "beau", "à portée de main", "heureux", "joyeux luron", "dur", "difficile à trouver", "nuisible", "inoffensif", "harmonieux", "dur", "hâtif", "haineux", "obsédant", "sain", "sincère", "cordial", "céleste", "lourd", "lourd", "utile", "impuissant", "caché", "hideux", "haut", "haut niveau", "hilarant", "rauque", "creux", "familial", "honnête", "honorable", "honoré", "plein d'espoir", "horrible", "chaud", "énorme", "humble", "affamé", "idéal", "idéalistique", "identique", "idiot", "idolé", "ignorant", "malade", "illégal", "malheureux", "illettré", "illustre", "imaginaire", "imaginatif", "immaculé", "éjaculant", "immatériel", "immédiat", "immense", "passionné", "impeccable", "impartial", "imparfait", "imperturbable", "impoli", "impolitique", "important", "impossible", "impraticable", "impressionnable", "impressionnant", "improbable", "impur", "inné", "incomparable", "incompatible", "incomplet", "inconséquent", "incroyable", "indélébile", "inexpérimenté", "indolent", "infâme", "infantile", "infatué", "inférieur", "infini", "informel", "innocent", "peu sûr", "insidieux", "insignifiant", "insistant", "instructif", "insubstantiel", "intelligent", "intention", "intentionnel", "intéressant", "interne", "international", "intrépide", "blindé", "irresponsable", "irritant", "démangeant", "blasé", "dentelé", "bourré", "jovial", "jaloux", "nerveux", "conjoint", "jovial", "jovial", "joyeux", "jubilatoire", "judicieux", "juteux", "jumbo", "junior", "sautillant", "juvénile", "kaléidoscopique", "vif", "clé", "gentil", "gentil cœur", "gentil", "connu", "excentrique", "halal", "boîteux", "dégingandé", "imposant", "attardé", "hors-la-loi", "paresseux", "maigre", "légal", "légitime", "léger", "sympathique", "probable", "limité", "linéaire", "aligné", "liquide", "petit", "vivant", "vif", "livide", "détestable", "seul", "solitaire", "long", "long terme", "lâche", "de travers", "perdu", "fort", "adorable", "charmant", "aimant", "bas", "loyal", "chanceux", "lourdaud", "lumineux", "bosselé", "lustré", "luxueux", "fou", "maquillé", "magnifique", "majestueux", "majeur", "mâle", "mammouth", "marié", "merveilleux", "masculin", "massif", "mature", "maigre", "farineux", "méchant", "mesquin", "charnu", "médical", "médiocre", "moyen", "doux", "mélodique", "mémorable", "menaçant", "joyeux", "désordonné", "métallique", "doux", "laiteux", "insouciant", "miniature", "mineur", "minable", "avare", "égaré", "brumeux", "mixte", "moderne", "modeste", "humide", "monstrueux", "mensuel", "monumental", "moral", "mortifié", "maternel", "immobile", "montagneux", "boueux", "étouffé", "multicolore", "banal", "trouble", "pâteux", "moisi", "sourd", "mystérieux", "naïf", "étroit", "méchant", "naturel", "coquin", "nautique", "proche", "soigné", "nécessaire", "besogneux", "négatif", "négligé", "négligeable", "voisin", "nerveux", "nouveau", "prochain", "gentil", "agile", "mordant", "nocturne", "bruyant", "non-stop", "normal", "notable", "noté", "remarquable", "nouveau", "nocif", "engourdi", "nutritif", "noisette", "obéissant", "obèse", "oblong", "huileux", "oblong", "évident", "occasionnel", "bizarre", "décalé", "offensif", "officiel", "vieux", "démodé", "seulement", "ouvert", "optimal", "optimiste", "opulent", "orange", "ordonné", "organique", "orné", "ornerie", "ordinaire", "original", "autre", "notre", "excentrique", "sortant", "outlandish", "outrageux", "exceptionnel", "ovale", "trop cuit", "tardif", "trop heureux", "négligé", "appétissant", "pâle", "dérisoire", "parallèle", "desséché", "partiel", "passionné", "passé", "pastel", "paisible", "poivré", "parfait", "parfumé", "périodique", "guilleret", "personnel", "pertinent", "pesant", "pessimiste", "mesquin", "bidon", "physique", "perçant", "rose", "pitoyable", "simple", "plaintif", "plastique", "ludique", "plaisant", "heureux", "agréable", "dodu", "pelucheux", "poli", "politique", "pointu", "inutile", "prêt", "pauvre", "populaire", "corpulent", "chic", "positif", "possible", "potable", "surpuissant", "merde humaine", "pratique", "précieux", "présent", "prestigieux", "cher", "épineux", "primaire", "original", "privé", "probable", "productive", "profitable", "profuse", "proper", "fier", "prudent", "ponctuel", "piquant", "chétif", "pur", "violet", "poussif", "putride", "perplexe", "déroutant", "pittoresque", "qualifié", "querelleur", "trimestriel", "nauséeux", "querelleur", "douteux", "rapide", "vif d'esprit", "tranquille", "quintessentiel", "excentrique", "quichottesque", "quizzique", "radieux", "dépareillé", "rapide", "rare", "éruptif", "brut", "récent", "téméraire", "rectangulaire", "prêt", "réel", "réaliste", "raisonnable", "rouge", "réfléchissant", "royal", "régulier", "fiable", "soulagé", "remarquable", "remords", "distant", "repentant", "requis", "respectueux", "responsable", "repoussant", "tournant", "gratifiant", "riche", "rigide", "droit", "annelé", "mûr", "rôti", "robuste", "rosé", "tournant", "pourri", "rugueux", "rond", "tapageur", "royal", "caoutchouteux", "délabré", "rude", "grossier", "coulant", "rural", "rouillé", "triste", "sûr", "salé", "pareil", "sablonneux", "sain d'esprit", "sarcastique", "sardonique", "satisfait", "écailleux", "rare", "apeuré", "effrayant", "parfumé", "savant", "scientifique", "méprisant", "rayé", "maigre", "second", "secondaire", "d'occasion", "secret", "sûr de soi", "autonome", "égoïste", "sentimental", "séparé", "serein", "sérieux", "serpentin", "plusieurs", "sévère", "minable", "ombrageux", "peu profond", "honteux", "sans honte", "vif", "chatoyant", "brillant", "choqué", "choquant", "minable", "court", "court terme", "voyant", "criard", "timide", "malade", "silencieux", "soyeux", "idiot", "argenté", "similaire", "simple", "simpliste", "pécheur", "unique", "grésillant", "squelettique", "maigre", "endormi", "léger", "mince", "glissant", "lent", "slushy", "petit", "intelligent", "lisse", "suffisant", "acroupi", "pleunicheur", "sociable", "mou", "détrempé", "solide", "sombre", "certain", "sphérique", "sophistiqué", "douloureux", "chagrin", "sous acide", "acidulé", "espagnol", "pétillant", "clairsemé", "spécifique", "spectaculaire", "rapide", "épicé", "fougueux", "malveillant", "splendide", "impeccable", "tacheté", "carré", "grinçant", "ondoyant", "stable", "staid", "taché", "rassis", "standard", "amidonné", "austère", "étoilé", "abrupt", "collant", "raide", "stimulant", "avare", "orageux", "droit", "étrange", "acier", "strict", "strident", "frappant", "rayé", "fort", "studieux", "stupéfiant", "stupide", "robuste", "élégant", "subjugué", "soumis", "substantiel", "subtil", "suburbain", "soudain", "sucré", "ensoleillé", "super", "superbe", "superficiel", "supérieur", "solidaire", "sûr de soi", "surpris", "suspicieux", "svelte", "transpirant", "doux", "étouffant", "rapide", "sympathique", "grand", "bavard", "apprivoisé", "bronzé", "tangible", "savoureux", "en lambeaux", "tendu", "fastidieux", "foisonnant", "tentant", "tendre", "tendu", "tiède", "terrible", "formidable", "testy", "that", "épais", "mince", "assoifé", "approfondi", "réflechi", "râpé", "économe", "tonitruant", "rangé", "serré", "opportun", "teinté", "minuscule", "fatigué", "déchiré", "total", "dur", "traumatique", "précieux", "formidable", "tragique", "entraîné", "triangulaire", "rusé", "insignifiant", "trivial", "troublé", "naïf", "turbulent", "jumeau", "laid", "ultime", "inacceptable", "inconscient", "peu commun", "inconscient", "sous-estimé", "inégal", "inégal", "inachevé", "inapte", "déplié", "malheureux", "malheureux", "malsain", "uniforme", "insignifiant", "unique", "uni", "non soigné", "inconnu", "illégal", "non souligné", "malchanceux", "contre nature", "désagréable", "irréaliste", "non mûr", "indiscipliné", "désintéressé", "disgracieux", "instable", "inculte", "désordonné", "intempestif", "non essayé", "faux", "inutilisé", "inhabituel", "malvenu", "peu maniable", "utilisé", "utter", "vacant", "vague", "vain", "valid", "précieux", "insipide", "variable", "vaste", "velouté", "vénéré", "vengeur", "vérifiable", "vibrant", "vicieux", "victorieux", "vigilant", "vigoureux", "méchant", "violet", "violent", "virtuel", "vertueux", "visible", "vital", "vivace", "vif", "volumineux", "faible", "guerrier", "chaleureux", "chaleureux", "déformé", "méfiant", "gaspilleur", "attentif", "gorgé d'eau", "aqueux", "ondulé", "riche", "faible", "fatigué", "palmier", "petit", "hebdomadaire", "pleurnichard", "lourd", "bizarre", "bienvenu", "bien documenté", "bien soigné", "bien informé", "bien éclairé", "bien fait", "bien aisé", "bien usé", "mouillé", "qui", "capricieux", "tourbillon", "chuchoté", "blanc", "entier", "énorme", "méchant", "large", "yeux écarquillés", "ondulé", "sauvage", "volontaire", "flétri", "sinueux", "venteux", "ailé", "tordu", "sage", "spirituel", "bancal", " malheureux ", " merveilleux ", " boisé ", " loufoque ", " verbeux ", " mondain ", " usé ", " inquiet ", " inquiétant ", " pire ", " pire ", " sans valeur ", " valable ", " digne ", " courroucé ", " misérable ", "se tordre ", " avoir tort ", " être irrité ", " bâiller ", " annuel ", " jaune ", " jaunâtre ", " jeune ", " juvénile ", " délicieux ", " loufoque ", " zélé ", " piquant ", " zigzaguant ", " rocailleux "];

    var name2 = ["peuple", "histoire", "chemin", "monde", "carte", "famille", "gouvernement", "santé", "système", "ordinateur", "viande", "année", "musique", "personne", "méthode", "données", "nourriture", "oiseau", "problème", "logiciel", "connaissance", "pouvoir", "capacité", "économie", "amour", "internet", "télévision", "science", "bibliothèque", "nature", "fait", "produit", "idée", "température", "investissement", "région", "société", "activité", "histoire", "industrie", "média", "chose", "four", "communauté", "définition", "sécurité", "qualité", "développement", "langue", "gestion", "lecteur", "variété", "vidéo", "semaine", "sécurité", "pays", "examen", "film", "organisation", "équipement", "physique", "analyse", "politique", "série", "pensée", "base", "petit ami", "direction", "stratégie", "technologie", "armée", "caméra", "liberté", "papier", "environnement", "enfant", "instance", "mois", "vérité", "marketing", "université", "écriture", "article", "département", "différence", "objectif", "nouvelles", "audience", "pêche", "croissance", "revenu", "mariage", "utilisateur", "combinaison", "échec", "signification", "médecine", "philosophie", "professeur", "communication", "nuit", "chimie", "maladie", "disque", "énergie", "nation", "route", "rôle", "soupe", "publicité", "emplacement", "succès", "addition", "appartement", "éducation", "mathématiques", "moment", "peinture", "politique", "attention", "décision", "événement", "propriété", "shopping", "étudiant", "bois", "compétition", "distribution", "divertissement", "bureau", "population", "président", "unité", "catégorie", "cigarette", "contexte", "introduction", "opportunité", "performance", "conducteur", "vol", "longueur", "magazine", "journal", "relation", "enseignement", "cellule", "concessionnaire", "débat", "découverte", "lac", "membre", "message", "téléphone", "scène", "apparence", "association", "concept", "client", "mort", "discussion", "logement", "inflation", "assurance", "humeur", "femme", "conseil", "sang", "effort", "expression", "importance", "opinion", "paiement", "réalité", "responsabilité", "situation", "compétence", "déclaration", "richesse", "application", "ville", "comté", "profondeur", "domaine", "fondation", "grand-mère", "cœur", "perspective", "photo", "recette", "studio", "sujet", "collection", "dépression", "imagination", "passion", "pourcentage", "ressource", "cadre", "annonce", "agence", "collège", "connexion", "critique", "dette", "description", "mémoire", "patience", "secrétaire", "solution", "administration", "aspect", "attitude", "directeur", "personnalité", "psychologie", "recommandation", "réponse", "sélection", "stockage", "version", "alcool", "argument", "plainte", "contrat", "accent", "perte", "possession", "préparation", "pénétration", "steak", "syndicat", "accord", "cancer", "monnaie", "emploi", "ingénierie", "entrée", "interaction", "limite", "mélange", "préférence", "région", "république", "siège", "tradition", "virus", "acteur", "classe", "livraison", "dispositif", "difficulté", "drame", "élection", "moteur", "football", "orientation", "hôtel", "match", "propriétaire", "priorité", "protection", "suggestion", "tension", "variation", "anxiété", "atmosphère", "conscience", "pain", "climat", "comparaison", "confusion", "construction", "ascenseur", "émotion", "employé", "employeur", "invité", "hauteur", "leadership", "centre commercial", "manager", "opération", "enregistrement", "respect", "échantillon", "transport", "ennuyeux", "charité", "cousin", "désastre", "rédacteur", "efficacité", "excitation", "étendue", "feedback", "guitare", "devoir", "leader", "maman", "résultat", "permission", "présentation", "promotion", "réflexion", "réfrigérateur", "résolution", "revenu", "session", "chanteur", "tennis", "panier", "bonus", "cabinet", "enfance", "église", "vêtements", "café", "dîner", "dessin", "cheveux", "audition", "initiative", "jugement", "laboratoire", "mesure", "mode", "boue", "orange", "poésie", "police", "possibilité", "procédure", "reine", "ratio", "relation", "restaurant", "satisfaction", "secteur", "signature", "signification", "chanson", "dent", "ville", "véhicule", "volume", "femme", "accident", "aéroport", "rendez-vous", "arrivée", "hypothèse", "baseball", "chapitre", "comité", "conversation", "base de données", "enthousiasme", "erreur", "explication", "agriculteur", "portail", "fille", "salle", "historien", "hôpital", "blessure", "instruction", "entretien", "fabricant", "repas", "perception", "tarte", "poème", "présence", "proposition", "réception", "remplacement", "révolution", "rivière", "fils", "discours", "thé", "village", "avertissement", "vainqueur", "travailleur", "écrivain", "assistance", "souffle", "acheteur", "poitrine", "chocolat", "conclusion", "contribution", "cookie", "courage", "bureau", "tiroir", "établissement", "examen", "ordures", "épicerie", "miel", "impression", "amélioration", "indépendance", "insecte", "inspection", "inspecteur", "roi", "échelle", "menu", "sanction", "piano", "pomme de terre", "profession", "professeur", "quantité", "réaction", "exigence", "salade", "soeur", "supermarché", "langue", "faiblesse", "mariage", "affaire", "ambition", "analyste", "pomme", "mission", "assistant", "salle de bain", "chambre", "bière", "anniversaire", "fête", "championnat", "joue", "client", "conséquence", "départ", "diamant", "saleté", "oreille", "fortune", "amitié", "funérailles", "gène", "petite amie", "chapeau", "indication", "intention", "dame", "minuit", "négociation", "obligation", "passager", "pizza", "plate-forme", "poète", "pollution", "reconnaissance", "réputation", "chemise", "orateur", "étranger", "chirurgie", "sympathie", "conte", "gorge", "entraîneur", "oncle", "jeunesse", "temps", "travail", "film", "eau", "argent", "exemple", "pendant", "affaires", "étude", "jeu", "vie", "forme", "air", "jour", "lieu", "nombre", "partie", "champ", "poisson", "dos", "processus", "chaleur", "main", "expérience", "travail", "livre", "fin", "point", "type", "maison", "économie", "valeur", "corps", "marché", "guide", "intérêt", "état", "radio", "cours", "entreprise", "prix", "taille", "carte", "liste", "esprit", "commerce", "ligne", "soin", "groupe", "risque", "mot", "graisse", "force", "clé", "lumière", "formation", "nom", "école", "haut", "montant", "niveau", "ordre", "pratique", "recherche", "sens", "service", "pièce", "web", "patron", "sport", "plaisir", "maison", "page", "terme", "test", "réponse", "son", "focus", "matière", "genre", "sol", "tableau", "huile", "image", "accès", "jardin", "gamme", "taux", "raison", "avenir", "site", "demande", "exercice", "image", "cas", "cause", "côte", "action", "mauvais", "bateau", "record", "résultat", "section", "bâtiment", "souris", "argent", "classe", "période", "plan", "magasin", "taxe", "côté", "sujet", "espace", "règle", "stock", "météo", "hasard", "figure", "homme", "modèle", "source", "début", "terre", "programme", "poulet", "conception", "caractéristique", "tête", "matériau", "but", "question", "pierre", "sel", "acte", "naissance", "voiture", "chien", "objet", "échelle", "soleil", "note", "profit", "loyer", "vitesse", "style", "guerre", "banque", "artisanat", "moitié", "intérieur", "extérieur", "standard", "bus", "échange", "œil", "feu", "position", "pression", "stress", "avantage", "bénéfice", "boîte", "cadre", "enjeu", "étape", "cycle", "visage", "article", "métal", "peinture", "revue", "pièce", "écran", "structure", "vue", "compte", "balle", "discipline", "moyen", "partage", "équilibre", "bit", "noir", "fond", "choix", "cadeau", "impact", "machine", "forme", "outil", "vent", "adresse", "moyenne", "carrière", "culture", "matin", "pot", "signe", "table", "tâche", "condition", "contact", "crédit", "oeuf", "espoir", "glace", "réseau", "nord", "carré", "tentative", "date", "effet", "lien", "poste", "étoile", "voix", "capitale", "défi", "ami", "soi", "tir", "brosse", "couple", "sortie", "front", "fonction", "manque", "vivant", "plante", "plastique", "spot", "été", "goût", "thème", "piste", "aile", "cerveau", "bouton", "clic", "désir", "pied", "gaz", "influence", "avis", "pluie", "mur", "base", "dommage", "distance", "sentiment", "paire", "épargne", "personnel", "sucre", "cible", "texte", "animal", "auteur", "budget", "remise", "fichier", "sol", "leçon", "minute", "officier", "phase", "référence", "registre", "ciel", "scène", "bâton", "titre", "problème", "bol", "pont", "campagne", "personnage", "club", "bord", "preuve", "éventail", "lettre", "serrure", "maximum", "roman", "option", "pack", "parc", "quart", "peau", "tri", "poids", "bébé", "arrière-plan", "porter", "plat", "facteur", "fruit", "verre", "joint", "maître", "muscle", "rouge", "force", "trafic", "voyage", "appel", "diagramme", "équipement", "idéal", "cuisine", "terre", "rondin", "mère", "filet", "fête", "principe", "relatif", "vente", "saison", "signal", "esprit", "rue", "arbre", "vague", "ceinture", "banc", "commission", "copie", "chute", "minimum", "chemin", "progrès", "projet", "mer", "sud", "statut", "heure", "jus", "chance", "lait", "bouche", "paix", "pipe", "stable", "tempête", "substance", "équipe", "tour", "après-midi", "chauve-souris", "plage", "blanc", "attraper", "chaîne", "considération", "crème", "équipe", "détail", "or", "entretien", "enfant", "marque", "mission", "douleur", "plaisir", "score", "vis", "sexe", "boutique", "douche", "costume", "ton", "fenêtre", "agent", "bande", "bain", "bloc", "os", "calendrier", "candidat", "casquette", "manteau", "concours", "coin", "cour", "coupe", "district", "porte", "est", "doigt", "garage", "garantie", "trou", "crochet", "outil", "couche", "conférence", "mensonge", "manière", "réunion", "nez", "parking", "partenaire", "profil", "riz", "routine", "horaire", "natation", "téléphone", "pourboire", "hiver", "compagnie aérienne", "sac", "bataille", "lit", "facture", "ennuyeux", "gâteau", "code", "courbe", "designer", "dimension", "robe", "facilité", "urgence", "soirée", "extension", "ferme", "combat", "écart", "grade", "vacances", "horreur", "cheval", "hôte", "mari", "prêt", "erreur", "montagne", "clou", "bruit", "occasion", "paquet", "patient", "pause", "phrase", "preuve", "course", "soulagement", "sable", "phrase", "épaule", "fumée", "estomac", "ficelle", "touriste", "serviette", "vacances", "ouest", "roue", "vin", "bras", "côté", "associé", "pari", "coup", "frontière", "branche", "sein", "frère", "copain", "bouquet", "puce", "entraîneur", "croix", "document", "brouillon", "poussière", "expert", "sol", "dieu", "golf", "habitude", "fer", "juge", "couteau", "paysage", "ligue", "courrier", "désordre", "natif", "ouverture", "parent", "motif", "épingle", "piscine", "livre", "demande", "salaire", "honte", "abri", "chaussure", "argent", "tacle", "réservoir", "confiance", "assister", "cuire", "barre", "cloche", "vélo", "blâmer", "garçon", "brique", "chaise", "placard", "indice", "col", "commentaire", "conférence", "diable", "régime", "peur", "carburant", "gant", "veste", "déjeuner", "moniteur", "hypothèque", "infirmière", "rythme", "panique", "pic", "avion", "récompense", "rang", "sandwich", "choc", "dépit", "spray", "surprise", "jusqu'à", "transition", "week-end", "bienvenue", "cour", "alarme", "plier", "vélo", "mordre", "aveugle", "bouteille", "câble", "bougie", "employé", "nuage", "concert", "compteur", "fleur", "grand-père", "préjudice", "genou", "avocat", "cuir", "charge", "miroir", "cou", "pension", "assiette", "violet", "ruine", "navire", "jupe", "tranche", "neige", "spécialiste", "coup", "interrupteur", "poubelle", "air", "zone", "colère", "récompense", "offre", "amer", "botte", "insecte", "camp", "bonbon", "tapis", "chat", "champion", "canal", "horloge", "confort", "vache", "crack", "ingénieur", "entrée", "faute", "herbe", "gars", "enfer", "point culminant", "incident", "île", "blague", "jury", "jambe", "lèvre", "camarade", "moteur", "nerf", "passage", "stylo", "fierté", "prêtre", "prix", "promesse", "résident", "station", "anneau", "toit", "corde", "voile", "schéma", "script", "chaussette", "station", "orteil", "tour", "camion", "témoin", "peut", "va", "autre", "utiliser", "faire", "bon", "regarder", "aider", "aller", "grand", "être", "encore", "public", "lire", "garder", "commencer", "donner", "humain", "local", "général", "spécifique", "long", "jouer", "sentir", "haut", "mettre", "commun", "mettre", "changer", "simple", "passé", "grand", "possible", "particulier", "majeur", "personnel", "actuel", "national", "couper", "naturel", "physique", "potentiel", "professionnel", "international", "voyage", "cuisiner", "alternatif", "spécial", "travail", "entier", "danse", "excuse", "froid", "commercial", "bas", "achat", "dealer", "primaire", "valoir", "tomber", "nécessaire", "positif", "produire", "chercher", "présent", "dépenser", "parler", "créatif", "dire", "coût", "conduire", "vert", "soutien", "content", "enlever", "retourner", "courir", "complexe", "dû", "efficace", "moyen", "régulier", "réserve", "indépendant", "laisser", "original", "atteindre", "repos", "servir", "regarder", "beau", "charge", "actif", "pause", "négatif", "sûr", "séjour", "visite", "visuel", "affecter", "couvrir", "rapport", "lever", "marcher", "blanc", "junior", "choisir", "unique", "classique", "final", "lever", "mélanger", "privé", "arrêter", "enseigner", "western", "préoccupation", "familier", "voler", "officiel", "large", "confortable", "gain", "riche", "sauver", "stand", "jeune", "lourd", "diriger", "écouter", "précieux", "s'inquiéter", "gérer", "diriger", "rencontrer", "libérer", "vendre", "finir", "normal", "presse", "monter", "secret", "répandre", "printemps", "dur", "attendre", "brun", "profond", "afficher", "flux", "frapper", "objectif", "tirer", "toucher", "annuler", "chimique", "pleurer", "jeter", "extrême", "pousser", "conflit", "manger", "remplir", "formel", "sauter", "botter", "opposé", "passer", "lancer", "distant", "total", "traiter", "vaste", "abus", "battre", "brûler", "déposer", "imprimer", "élever", "dormir", "quelque part", "avancer", "consister", "sombre", "double", "tirer", "égal", "fixer", "embaucher", "interne", "rejoindre", "tuer", "sensible", "taper", "gagner", "attaquer", "réclamer", "constant", "traîner", "boire", "deviner", "mineur", "tirer", "brut", "mou", "solide", "porter", "bizarre", "merveilleux", "annuel", "compter", "mort", "doute", "nourrir", "éternel", "impressionner", "répéter", "rond", "chanter", "glisser", "dépouiller", "souhaiter", "combiner", "commander", "creuser", "diviser", "équivalent", "accrocher", "chasser", "initial", "marcher", "mentionner", "spirituel", "enquête", "cravate", "adulte", "bref", "fou", "évasion", "rassemblement", "haine", "antérieur", "réparation", "rude", "triste", "égratignure", "malade", "grève", "employer", "externe", "blessé", "illégal", "rire", "poser", "mobile", "méchant", "ordinaire", "répondre", "royal", "senior", "diviser", "effort", "lutte", "nager", "train", "supérieur", "laver", "jaune", "convertir", "accident", "dépendant", "plier", "drôle", "saisir", "cacher", "manquer", "permettre", "citer", "récupérer", "résoudre", "rouler", "couler", "glisser", "épargner", "suspect", "doux", "balancer", "tordre", "en haut", "habituel", "à l'étranger", "brave", "calme", "concentré", "estimer", "grand", "masculin", "mine", "prompt", "tranquille", "refuser", "regretter", "révéler", "se précipiter", "secouer", "changer", "briller", "voler", "sucer", "entourer", "ours", "brillant", "oser", "cher", "retarder", "ivre", "femme", "hâte", "inévitable", "inviter", "baiser", "soigné", "pop", "punch", "démissionner", "répondre", "représenter", "résister", "déchirer", "frotter", "idiot", "sourire", "épeler", "étirer", "stupide", "déchirer", "temporaire", "demain", "réveil", "envelopper", "hier", "Thomas", "Tom", "Lieuwe", "mathis", "mathieu", "gertrude", "ézéchiel", "fils de pute", "jean"];


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