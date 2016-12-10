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

let cache = [];// Array is OK!
cache[0] = fs.readFileSync( __dirname + '/ServerDate.min.js');

app.get('/ServerDate', (req, res) => {
    res.setHeader('Content-Type', 'text/javascript');
    res.send( cache[0] );
});

server.listen(port);

var io = require('socket.io')(server);
console.log("Listening for socket connections on port " + port);

io.on('connection', function (socket) {
    console.log("Connection made!");
    socket.on('musicBlob', function(musicBlob){
    	musicBlob.msFromEndToServer = new Date().getTime() - musicBlob.endTime;
        socket.broadcast.emit('musicBlob', musicBlob);
    });
});