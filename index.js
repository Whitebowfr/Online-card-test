const fs = require('fs');
const express = require("express")

const PORT = process.env.PORT || 8080;
const INDEX = 'main.html';

const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`))

const { Server } = require('ws');
const wss = new Server({ server });

var clientID = 0
//var data = readDatabase()

wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.on('close', () => console.log('Client disconnected'));
    ws.onmessage = function(evt) {
        console.log(evt.data)
    }
  });



  setInterval(() => {
    wss.clients.forEach((client) => {
      client.send(new Date().toTimeString());
    });
  }, 1000);

/*wss.on('connection', function connection(ws, req) {
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
}*/