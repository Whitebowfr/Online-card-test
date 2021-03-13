const WebSocket = require('ws');
const fs = require('fs');

const wss = new WebSocket.Server({ port: 8080 });
var clientID = 0
var data = readDatabase()

wss.on('connection', function connection(ws, req) {
    var isMessage = false
 
    ws.on('message', function incoming(message) {
        isMessage = true
        console.log('received: %s', message, " from ", req.connection.remoteAddress,);
        if (message == "newConnection") {
            console.log(data.connectedIP, data.connectedIP.toString().indexOf(req.connection.remoteAddress.toString()))
            if (data.connectedIP.indexOf(req.connection.remoteAddress) > -1) {
                sendM("ID :" + data.correspondingID[data.connectedIP.indexOf(req.connection.remoteAddress)].toString())
            } else {
                clientID = Math.round(Math.random() * 1000)
                data.connectedIP.push(req.connection.remoteAddress.toString())
                data.correspondingID.push(clientID)
                sendM("ID : " + clientID)
            }
            updateDatabase(data)
        }
        if (message.toString().includes("__")) {
            var messageCommand = message.split("__")
            if (messageCommand[0] == "f") {
                eval(messageCommand[1])
            }
        }
    });

    function sendM(message) {
        ws.send(message);
    }
});

function yeet() {
    console.log("YEEET")
}

function readDatabase() {
    return JSON.parse(fs.readFileSync("database.json"))
}

function updateDatabase(dataToWrite) {
    fs.writeFileSync("database.json", JSON.stringify(dataToWrite))
}