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
var data = readDatabase()

wss.on('connection', (ws, req) => {

    function sendM(message) {
        ws.send(message);
    }

    sendM("You're connected")

    console.log(data.connectedIP, data.connectedIP.toString().indexOf( req.headers['x-forwarded-for'] || req.connection.remoteAddress.toString()))
    if (data.connectedIP.indexOf(req.headers['x-forwarded-for'] || req.connection.remoteAddress) > -1) {
        sendM("ID :" + data.correspondingID[data.connectedIP.indexOf( req.headers['x-forwarded-for'] || req.connection.remoteAddress)].toString())
    } else {
        clientID = Math.round(Math.random() * 1000)
        data.connectedIP.push(req.headers['x-forwarded-for'] || req.connection.remoteAddress.toString())
        data.correspondingID.push(clientID)
        sendM("ID : " + clientID)
    }
    updateDatabase(data)
    
    ws.on('close', () => console.log('Client disconnected'));

    ws.onmessage = function(evt) { 
        console.log('received: %s', evt.data, " from ", req.headers['x-forwarded-for'] || req.socket.remoteAddress);

        
        if (evt.data.toString().includes("__")) {
            var messageCommand = message.split("__")
            if (messageCommand[0] == "f") {
                eval(messageCommand[1])
            }
        }
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