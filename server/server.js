const express = require('express');
const hostname = '127.0.0.1';
const fs = require('fs');
const port = 2017;
const app = express();

app.use(function(req, res, next) {
    if (req.headers.origin) {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Authorization')
        res.header('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE')
        res.header('Access-Control-Expose-Headers', 'Date,*'); 
        if (req.method === 'OPTIONS') return res.send(200)
    }
    next()
})

const server = require('http').Server(app);

server.listen(port);

var connectedClients = 0;
var io = require('socket.io')(server);
console.log("Listening for socket connections on port " + port);

io.on('connection', function (socket) {
    connectedClients++;
    var lines = process.stdout.getWindowSize()[1];
    for(var i = 0; i < lines; i++) {
        console.log('\r\n');
    }
    console.log("Connected clients: ", connectedClients);
    socket.on('musicBlob', function(musicBlob){
        musicBlob.serverTimeStamp = new Date().getTime();
        musicBlob.msFromEndToServer = musicBlob.serverTimeStamp - musicBlob.endTime;
        socket.broadcast.emit('musicBlob', musicBlob);
    });
    socket.on('disconnect', function(){
        connectedClients--;
        var lines = process.stdout.getWindowSize()[1];
        for(var i = 0; i < lines; i++) {
            console.log('\r\n');
        }
        console.log("Connected clients: ", connectedClients);
    });
});
