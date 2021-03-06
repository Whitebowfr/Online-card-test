const fs = require('fs');
const express = require("express")
var Hand = require('pokersolver').Hand

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
const currentServerID = Math.round(Math.random() * 10000000)
data.waitingForGame = []
updateDatabase(data)
const authorizedCommands = ["drawCard", "resetGame", "bet", "getMyCards", "connectToGame", "isReady", "sendToSpecificUser", "console.log", "finishedMyTurn", "wentBackToLobby", "couched"]

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
        console.log(name, ID)
        var data = readDatabase()
        if (data.waitingForGame.indexOf(ID) == -1) {
            data.waitingForGame.push(ID)
        }
        var waitingNames = []
        for (var i = 0; i < data.usr.length; i++) {
            if (data.usr[i].id == ID) {
                data.usr[i].name = name
                var modifiedData = data.usr[i]
                sendM("info__yourData::" + JSON.stringify(modifiedData))
            }

            if (data.waitingForGame.includes(Number(data.usr[i].id))) {
                waitingNames.push(data.usr[i].name)
            }
        }
        updatePlayersInLobby(waitingNames)
        updateDatabase(data)
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
        if (entryBet != undefined) {
            console.log("entry bet :", entryBet)
            for (var i = 0; i < data.usr.length; i++) {
                if (data.usr[i].id == ID) {
                    if (entryBet > data.usr[i].bank) {
                        data.usr[i].entryBet = data.usr[i].bank
                    } else {
                        data.usr[i].entryBet = entryBet
                    }
                    data.usr[i].bank -= data.usr[i].entryBet
                    console.log("on ready:", data.usr[i].bank)

                }
            }
        }
        if (entryBet == undefined) {
            for (var i = 0; i < data.usr.length; i++) {
                if (data.usr[i].id == ID) {
                    if (data.usr[i].entryBet != 0) {
                        data.usr[i].bank += data.usr[i].entryBet
                        data.usr[i].entryBet = 0
                    }
                    break
                }
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
            "bank": 10000,
            "hand": [],
            "bet": 0,
            "entryBet": 0,
            "ws": ""
        }
        webSockets[clientID] = ws
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

        for (var i = 0; i < data.usr.length; i++) {
            if (data.usr[i].id == disconnectedID) {
                if (data.usr[i].entryBet != 0) {
                    data.usr[i].bank += data.usr[i].entryBet
                }
                console.log("bank after close:", data.usr[i].bank)
                data.usr[i].entryBet = 0
                data.usr[i].bet = 0
                data.usr[i].hand = []
                data.usr[i].ws = ""
                break
            }
        }

        for (var i = 0; i < data.currentGame.isInGame.length; i++) {
            if (data.currentGame.isInGame[i].id == disconnectedID) {
                data.currentGame.isInGame.splice(i, 1)
            }
        }

        if (index > -1) {
            data.waitingForGame.splice(index, 1)
            waitingNames.splice(index, 1)
        }

        var indexBis = data.isReady.indexOf(Number(disconnectedID))

        if (indexBis > -1) {
            data.isReady.splice(indexBis, 1)
        }

        if (data.currentGame.isInGame.length == 0) {
            console.log("Game closed, no players left")
            resetGame()
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
                if (authorizedCommands.includes(pureCommand) && sendID == data.correspondingID[data.connectedIP.indexOf(getAdressIp(req))] || getAdressIp(req) == "::ffff:127.0.0.1" || getAdressIp(req) == "::1") {
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

function drawCard(ID, serverID) {
    var carte = new Card(deck.draw())
    return carte.card
}

function resetGame() {
    var data = readDatabase()
    for (var i = 0; i < data.usr.length; i++) {
        data.usr[i].hand = []
        data.usr[i].bet = 0
        data.usr[i].entryBet = 0
    }
    var turn = 0
    var currentlyPlayingPlayer = -1
    var previousBet = 0
    data.currentGame.publicCards = []
    data.currentGame.totalBetAmount = 0
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
            console.log("after win :", data.usr[i].bank)
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

var turn = 0
var currentlyPlayingPlayer = -1
var previousBet = 0

function startGame() {
    console.log("Game started")
    data = readDatabase()
    console.log("players waiting :", data.waitingForGame)
    for (var j = 0; j < data.waitingForGame.length; j++) {
        for (var i = 0; i < data.usr.length; i++) {
            if (data.usr[i].id == data.waitingForGame[j]) {
                data.currentGame.isInGame.push(data.usr[i])
            }
        }
    }
    data.currentGame.isInGame = shuffle(data.currentGame.isInGame)
    sendGlobal("info__gameStartedWith::" + JSON.stringify(data.currentGame.isInGame))
    updateDatabase(data)
    data.isReady = []
    data.waitingForGame = []
    finishedMyTurn(0, 0)
    updateDatabase(data)
}

function combineBets(playerPlayers) {
    var data = readDatabase()
    for (var i = 0; i < playerPlayers; i++) {
        data.currentGame.totalBetAmount += parseInt(playerPlayers[i].bet)
    }
    for (var i = 0; i < data.usr.length; i++) {
        data.usr[i].bet = 0
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

function finishedMyTurn(ID) {
    var data = readDatabase()
    var turn = data.currentGame.turn
    if (ID != 0) {
        for (var i = 0; i < data.usr.length; i++) {
            if (data.usr[i].id == ID) {
                var previousPlayer = data.usr[i]
                break
            }
        }
        previousBet = previousPlayer.bet
    } else if (ID == 0) {
        previousBet = 0
    }
    var updatedPlayingPlayers = []
    currentlyPlayingPlayer++
    if (data.currentGame.isInGame.length == 1) {
        checkVictory(data.currentGame.isInGame[0])
    }
    for (var i = 0; i < data.currentGame.isInGame.length; i++) {
        for (var j = 0; j < data.usr.length; j++) {
            if (data.usr[j].id == data.currentGame.isInGame[i].id) {
                updatedPlayingPlayers.push(data.usr[j])
                break
            }
        }
    }
    if ((currentlyPlayingPlayer > 1 && turn == 0) || (updatedPlayingPlayers.length == 2 && currentlyPlayingPlayer == 1 && turn == 0)) {
        for (var i = 0; i < updatedPlayingPlayers.length; i++) {
            for (var j = 0; j < data.usr.length; j++) {
                if (data.usr[j].id == updatedPlayingPlayers[i].id && data.usr[j].hand.length == 0) {
                    data.usr[j].hand.push(drawCard())
                    data.usr[j].hand.push(drawCard())
                    sendToSpecificUser(`info__yourCards::${JSON.stringify(data.usr[j].hand)}`, data.usr[j].id)
                    break
                }
            }
        }
    }
    updateDatabase(data)
    if (currentlyPlayingPlayer > updatedPlayingPlayers.length - 1 && updatedPlayingPlayers.every((val, i, arr) => (val.bet === arr[0].bet || val.bet == 0))) {
        previousBet = 0
        currentlyPlayingPlayer = 0
        data.currentGame.turn = data.currentGame.turn + 1
        updateDatabase(data)
        sendGlobal(`cmd__updateTurns(${data.currentGame.turn})`)
        toggleNextStep(turn)
    }
    if (currentlyPlayingPlayer > updatedPlayingPlayers.length - 1) {
        currentlyPlayingPlayer = 0
    }
    console.log("nowPlaying:", currentlyPlayingPlayer, "bet to set:", previousBet)
    console.log("ID of player", updatedPlayingPlayers[currentlyPlayingPlayer].id)
    if ((currentlyPlayingPlayer == 0 || currentlyPlayingPlayer == 1) && turn == 0) {
        sendToSpecificUser("info__yourTurn::" + previousBet + "::" + currentlyPlayingPlayer, updatedPlayingPlayers[currentlyPlayingPlayer].id)
    } else {
        console.log(updatedPlayingPlayers, currentlyPlayingPlayer)
        sendToSpecificUser("info__yourTurn::" + previousBet, updatedPlayingPlayers[currentlyPlayingPlayer].id)
    }
}

function toggleNextStep(turn) {
    var data = readDatabase()
    switch (turn) {
        case 1:
            for (var i = 0; i < data.usr.length; i++) {
                if (data.usr[i].bet != 0) {
                    data.currentGame.totalBetAmount += parseInt(data.usr[i].bet)
                    data.usr[i].bet = 0
                }
            }
            for (var i = 0; i < 3; i++) data.currentGame.publicCards.push(drawCard())
            updateDatabase(data)
            sendGlobal(`info__publicCards::${JSON.stringify(data.currentGame.publicCards)}::${turn}`)
            break
        case 2:
            for (var i = 0; i < data.usr.length; i++) {
                if (data.usr[i].bet != 0) {
                    data.currentGame.totalBetAmount += parseInt(data.usr[i].bet)
                    data.usr[i].bet = 0
                }
            }
            data.currentGame.publicCards.push(drawCard())
            updateDatabase(data)
            sendGlobal(`info__publicCards::[${JSON.stringify(data.currentGame.publicCards[3])}]::${turn}`)
            break
        case 3:
            for (var i = 0; i < data.usr.length; i++) {
                if (data.usr[i].bet != 0) {
                    data.currentGame.totalBetAmount += parseInt(data.usr[i].bet)
                    data.usr[i].bet = 0
                }
            }
            data.currentGame.publicCards.push(drawCard())
            updateDatabase(data)
            sendGlobal(`info__publicCards::[${JSON.stringify(data.currentGame.publicCards[4])}]::${turn}`)
            break
        case 4:
            for (var i = 0; i < data.usr.length; i++) {
                if (data.usr[i].bet != 0) {
                    data.currentGame.totalBetAmount += parseInt(data.usr[i].bet)
                    data.usr[i].bet = 0
                }
            }
            handleVictory(checkVictory(data.currentGame.isInGame))
            break
    }
}

function checkVictory(players) {
    if (players.length == 1) {
        sendGlobal(`info__playerHandValue::${players[0].id}::last`)
        console.log(players[0])
        handleVictory(players[0])
        return
    }
    var data = readDatabase()
    var playersToCheck = []
    var playersToCheckID = []
    for (var i = 0; i < players.length; i++) {
        for (var j = 0; j < data.usr.length; j++) {
            if (data.usr[j].id == players[i].id) {
                playersToCheck.push(convertHandToExploitable(data.usr[j].hand))
                playersToCheckID.push(data.usr[j])
                sendGlobal(`info__playerHandValue::${data.usr[j].id}::${JSON.stringify(Hand.solve(convertHandToExploitable(data.usr[j].hand)).descr)}`)
                break
            }
        }
    }
    return playersToCheckID[playersToCheck.indexOf(Hand.winners(playersToCheck))]
}

function handleVictory(winningPlayer) {
    var data = readDatabase()
    sendGlobal(`info__winningPlayer::${winningPlayer.name}::${data.currentGame.totalBetAmount}`)
    for (var i = 0; i < data.usr.length; i++) {
        if (data.usr[i].id == winningPlayer.id) {
            data.usr[i].bank += parseInt(data.currentGame.totalBetAmount)
            console.log("after win bis :", data.usr[i].bank)
            break
        }
    }
    resetGame()
    updateDatabase(data)
    sendToSpecificUser(`info__youWon::${data.usr[i].bank}`, winningPlayer.id)
}

function convertHandToExploitable(hand) {
    var returnHand = []
    const couleurs = ["coeur", "carreau", "pique", "trefle"]
    const translatedColors = ["h", "d", "s", "c"]
    const values = ["As", "1", "2", "3", "4", "5", "6", "7", " 8", "9", "10", "Valet", "Reine", "Roi"]
    const translatedValues = ["A", "1", "2", "3", "4", "5", "6", "7", " 8", "9", "T", "J", "Q", "K"]
    for (var i = 0; i < hand.length; i++) returnHand.push(translatedValues[values.indexOf(hand[i].split(" de ")[0])] + translatedColors[couleurs.indexOf(hand[i].split(" de ")[1])])
    return Hand.solve(returnHand)
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

function wentBackToLobby(ID) {
    var data = readDatabase()
    for (var i = 0; i < data.currentGame.isInGame.length; i++) {
        if (data.currentGame.isInGame[i].id == ID) {
            var index = data.currentGame.isInGame.indexOf(data.currentGame.isInGame[i])
            break
        }
    }
    if (index != undefined) {
        data.currentGame.isInGame.splice(index, 1)
    }
    if (data.currentGame.isInGame.length == 0) {
        console.log("Game stopped, no players left")
        resetGame()
    }
}

function couched(ID) {
    var data = readDatabase()
    for (var i = 0; i < data.currentGame.isInGame.length; i++) {
        if (data.currentGame.isInGame[i].id == ID) {
            const index = data.currentGame.isInGame.indexOf(data.currentGame.isInGame[i]);
            if (index > -1) {
                data.currentGame.isInGame.splice(index, 1);
            }
        }
    }
    updateDatabase(data)
}

resetGame()
resetDatabase()