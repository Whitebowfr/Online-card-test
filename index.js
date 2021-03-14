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

    function getAdressIp(customReq) {
        return customReq.headers['x-forwarded-for'] || customReq.connection.remoteAddress
    }

    sendM("You're connected")

    console.log(data.connectedIP, data.connectedIP.toString().indexOf(getAdressIp(req)))
    if (data.connectedIP.indexOf(getAdressIp(req)) > -1) {
        sendM("ID :" + data.correspondingID[data.connectedIP.indexOf(getAdressIp(req))].toString())
    } else {
        clientID = Math.round(Math.random() * 1000)
        data.connectedIP.push(getAdressIp(req))
        data.correspondingID.push(clientID)
        sendM("ID : " + clientID)
        var clientData = {
            "id": clientID,
            "bank": 1000
        }
        data.usr.push(clientData)
    }

    updateDatabase(data)
    
    ws.onclose = function (evt) {
        console.log("client disconnected")
        var disconnectedID = data.correspondingID[data.connectedIP.indexOf(getAdressIp(req))]
    }

    ws.onmessage = function(evt) { 
        console.log('received: %s', evt.data, " from ", getAdressIp(req));

        
        if (evt.data.toString().includes("__")) {
            var messageCommand = message.split("__")
            if (messageCommand[0] == "f") {
                eval(messageCommand[1])
            }
        }
    }
});

setInterval(() => {
    wss.clients.forEach((client) => {
      client.send("skip__" + new Date().toTimeString());
    });
}, 5000);

function yeet() {
    console.log("YEEET")
}

function readDatabase() {
    return JSON.parse(fs.readFileSync("database.json"))
}

function updateDatabase(dataToWrite) {
    fs.writeFileSync("database.json", JSON.stringify(dataToWrite, null, 4))
}