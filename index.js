const fs = require('fs');
const express = require("express")

const PORT = process.env.PORT || 8080;
const INDEX = 'main.html';

const server = express()
    .use(express.static("public"))
    .listen(PORT, () => console.log(`Listening on ${PORT}`))

const { Server } = require('ws');
const wss = new Server({ server });
var webSockets = {}

var clientID = 0
var data = readDatabase()
var clientsReady = 0
data.waitingForGame = []
updateDatabase(data)
const authorizedCommands = ["drawCard", "resetGame", "bet", "getMyCards", "connectToGame", "isReady", "sendToSpecificUser", "nextStep"]

resetDatabase()

wss.on('connection', (ws, req) => {
    var data = readDatabase()

    function sendM(message) {
        ws.send(message);
    }

    function getAdressIp(customReq) {
        return customReq.headers['x-forwarded-for'] || customReq.connection.remoteAddress
    }

    function getMyCards(ID) {
        var data = readDatabase()
        for (var i = 0; i < data.usr.length; i++) {
            if (data.usr[i].id == ID) {
                sendM(JSON.stringify(data.usr[i].hand))
            }
        }
    }

    var waitingNames = []

    function connectToGame(name, ID) {
        var data = readDatabase()
        if (data.waitingForGame.indexOf(ID) == -1) {
            data.waitingForGame.push(ID)
        }
        for (var i = 0; i < data.usr.length; i++) {
            if (data.usr[i].id == ID) {
                data.usr[i].name = name
                var modifiedData = data.usr[i]
                modifiedData.id = 0
                sendM("info__yourData::" + JSON.stringify(modifiedData))
            }
            var waitingNames = []
            for (id in data.waitingForGame) {
                for (var i = 0; i < data.usr.length; i++) {
                    if (data.usr[i].id == data.waitingForGame[id]) {
                        waitingNames.push(data.usr[i].name)
                    }
                }
            }
            updatePlayersInLobby(waitingNames)
            updateDatabase(data)
        }
    }

    function isReady(ID, state, entryBet) {
        var data = readDatabase()
        if (state) {
            data.isReady.push(Number(ID))
        }
        if (!state) {
            var indexBis = data.isReady.indexOf(Number(ID))
            if (indexBis > -1) {
                data.isReady.splice(indexBis, 1)
            }
        }
        for (var i = 0; i < data.usr.length; i++) {
            if (data.usr[i].id == ID) {
                if (entryBet > data.usr[i].bank) {
                    data.usr[i].entryBet = data.usr[i].bank
                } else {
                    data.usr[i].entryBet = entryBet
                }
                console.log("entrybet :", data.usr[i].bank, entryBet, entryBet > data.usr[i].bank)
            }
        }
        var clientsReady = data.isReady.length
        updateDatabase(data)
        sendGlobal("info__ClientsReady::" + clientsReady)
        if (clientsReady == data.waitingForGame.length && clientsReady >= 1) {
            startGame()
        }
    }

    function updatePlayersInLobby(names) {
        sendGlobal("info__playersInQueue::" + JSON.stringify(names) + "::" + clientsReady)
    }

    sendM("You're connected")

    if (data.connectedIP.indexOf(getAdressIp(req)) > -1) {
        sendM("skip__ID ::" + data.correspondingID[data.connectedIP.indexOf(getAdressIp(req))].toString())
        for (var i = 0; i < data.usr.length; i++) {
            if (data.usr[i].id == data.correspondingID[data.connectedIP.indexOf(getAdressIp(req))]) {
                var name = data.usr[i].name
            }
        }
        webSockets[data.correspondingID[data.connectedIP.indexOf(getAdressIp(req))]] = ws
        sendM("info__yourName::" + name)

    } else {
        clientID = Math.round(Math.random() * 1000)
        data.connectedIP.push(getAdressIp(req))
        data.correspondingID.push(clientID)
        sendM("skip__ID :: " + clientID)
        var clientData = {
            "id": clientID,
            "name": "",
            "bank": 1000,
            "hand": [],
            "bet": 0,
            "entryBet": 0,
            "ws": ""
        }
        data.usr.push(clientData)
    }

    updateDatabase(data)

    ws.onclose = function(evt) {
        console.log("client disconnected")
        var data = readDatabase()
        var disconnectedID = data.correspondingID[data.connectedIP.indexOf(getAdressIp(req))].toString()
        var index = data.waitingForGame.indexOf(Number(disconnectedID))
        var waitingNames = []
        for (id in data.waitingForGame) {
            for (var i = 0; i < data.usr.length; i++) {
                if (data.usr[i].id == data.waitingForGame[id]) {
                    waitingNames.push(data.usr[i].name)
                }
            }
        }
        console.log("Were waiting:", waitingNames, "Disconnected index:", index)

        if (index > -1) {
            data.waitingForGame.splice(index, 1)
            waitingNames.splice(index, 1)
        }
        console.log("waiting :", waitingNames)

        var indexBis = data.isReady.indexOf(Number(disconnectedID))

        if (indexBis > -1) {
            data.isReady.splice(indexBis, 1)
        }

        console.log("disconnected ID:", disconnectedID)
        delete webSockets[disconnectedID]
        updateDatabase(data)
        updatePlayersInLobby(waitingNames)
    }

    ws.onmessage = function(evt) {
        if (evt.data.toString().includes("__")) {
            var messageCommand = evt.data.split("__")
            var sendID = messageCommand[messageCommand.length - 1]
            if (messageCommand[0] == "f") {
                var pureCommand = messageCommand[1].split("(")[0]
                if (authorizedCommands.includes(pureCommand) && sendID == data.correspondingID[data.connectedIP.indexOf(getAdressIp(req))]) {
                    eval(messageCommand[1])
                }
            }
        }
    }
});

setInterval(() => {
    sendGlobal("skip__" + new Date().toTimeString())
}, 10000);

function readDatabase() {
    return JSON.parse(fs.readFileSync("database.json"))
}

function sendGlobal(mes) {
    wss.clients.forEach((client) => {
        client.send(mes)
    })
}

function updateDatabase(dataToWrite) {
    fs.writeFileSync("database.json", JSON.stringify(dataToWrite, null, 4))
}

function sendToSpecificUser(msg, ID) {
    webSockets[ID].send(msg)
}

class Deck {
    constructor() {
        this.deck = [];
        this.rebuild();
        this.shuffle();
    }

    rebuild() {
        this.deck = []
        const colors = ['coeur', 'carreau', 'pique', 'trefle']
        const values = ['As', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'Valet', 'Dame', 'Roi']

        for (var couleur in colors) {
            for (var valeur in values) {
                this.deck.push(values[valeur] + " de " + colors[couleur])
            }
        }
    }

    shuffle() {
        for (var i = 0; i < this.deck.length; i++) {
            var pos = Math.floor(Math.random() * this.deck.length)
            var temp = this.deck[i]
            this.deck[i] = this.deck[pos]
            this.deck[pos] = temp
        }
    }

    draw() {
        return this.deck.pop()
    }

    isEmpty() {
        return (this.deck.length == 0)
    }

    length() {
        return this.deck.length
    }
}

class Card {
    constructor(card) {
        this.card = card
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

        this.value = cardsValues[card];
        this.totalValue = otherCardsValues[card];
        this.couleur = card.split(" de ")[1]

        var couleurs = { 'coeur': 0, 'carreau': 1, 'pique': 2, 'trefle': 3 }
        this.position = couleurs[this.couleur] + this.value
    }
}

var deck = new Deck()

function drawCard(ID) {
    var carte = new Card(deck.draw())
    var data = readDatabase()
    for (var i = 0; i < data.usr.length; i++) {
        if (data.usr[i].id == ID) {
            if (data.usr[i].hand.length >= 2) {
                return false
            } else {
                data.usr[i].hand.push(carte.card)
                console.log(data.usr[i].hand)
            }
        }
    }
    updateDatabase(data)
}

function resetGame() {
    var data = readDatabase()
    for (var i = 0; i < data.usr.length; i++) {
        data.usr[i].hand = []
        data.usr[i].bet = 0
        data.usr[i].entryBet = 0
    }
    data.currentGame.publicCards = []
    data.currentGame.totalBetAmount = []
    data.currentGame.spectatorsID = []
    data.currentGame.turn = 0
    data.currentGame.isInGame = []
    deck = new Deck()
    updateDatabase(data)
}

function finishGame(winningID, gain) {
    var data = readDatabase()
    for (var i = 0; i < data.usr.length; i++) {
        if (data.usr[i].id == winningID && data.currentGame.isInGame.includes(winningID)) {
            data.usr[i].bank += gain
            resetGame()
            break
        }
    }
    updateDatabase(data)
}

function resetDatabase() {
    var data = readDatabase()
    data.isReady = []
    data.waitingForGame = []
}

var playingPlayers = []
var playingPlayerTurn = 0

function startGame() {
    console.log("Game started")
    data = readDatabase()
    console.log("players waiting :", data.waitingForGame)
    for (var j = 0; j < data.waitingForGame.length; j++) {
        for (var i = 0; i < data.usr.length; i++) {
            if (data.usr[i].id == data.waitingForGame[j]) {
                playingPlayers.push(data.usr[i])
            }
        }
    }
    playingPlayers = shuffle(playingPlayers)
    console.log("playing players : ", playingPlayers)
    sendGlobal("info__gameStartedWith::" + JSON.stringify(playingPlayers))
    for (var i = 0; i < playingPlayers.length; i++) {
        drawCard(playingPlayers[i].id)
        drawCard(playingPlayers[i].id)
        var data = readDatabase()
        for (var j = 0; j < data.usr.length; j++) {
            if (data.usr[j].id == playingPlayers[i].id) {
                var me = data.usr[j]
                break
            }
        }
        sendToSpecificUser("info__yourCards::" + JSON.stringify(me.hand), playingPlayers[i].id)
    }
    data.isReady = []
    data.waitingForGame = []
    updateDatabase(data)
}

function nextStep() {
    playingPlayerTurn++
    sendToSpecificUser("info__yourTurn::" + playingPlayers[playingPlayerTurn--].bet, playingPlayers[playingPlayerTurn].id)
    if (playerPlayerTurn >= playingPlayers.length) {
        playerPlayerTurn = 0
    }
    if (playingPlayers.every((val, i, arr) => val.bet === arr[0].bet || val.entryBet === 0)) {
        combineBets(playingPlayers)
    }
}

function combineBets(playerPlayers) {
    var data = readDatabase()
    for (var i = 0; i < playerPlayers; i++) {
        data.currentGame.totalBetAmount += playerPlayers[i].bet
    }
    updateDatabase(data)
}

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function bet(ID, amount) {
    var data = readDatabase()
    if (amount <= 0) {
        return false
    }
    var me
    for (var i = 0; i < data.usr.length; i++) {
        if (data.usr[i].id == ID) {
            if (data.usr[i].entryBet >= amount) {
                data.usr[i].entryBet -= amount
                data.usr[i].bet += amount
            } else {
                return false
            }
            me = data.usr[i]
        }
    }
    updateDatabase(data)
    sendGlobal(`cmd__updateBets(${me.bet}, ${me.entryBet}, ${ID})`)
}

resetGame()
resetDatabase()