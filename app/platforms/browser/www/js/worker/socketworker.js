importScripts('socket.io-1.4.5.js');

var address = 'http://192.168.2.120:2017';
console.log("Connecting to: " + address);
var socket = io(address);

var RTTStart = new Date(); 
var tripDuration = null;
var connections = 0;
var s = this;
socket.on("connect", function(e){
    tripDuration = (new Date() - RTTStart) / 2;
    console.log("Connected to socket!");
    s.postMessage({command: "socketConnected", tripDuration: tripDuration});

    socket.on('disconnect', function(){
        console.log("Disconnected from socket!")
        s.postMessage({command: "socketDisconnected"});
    }); 
    socket.on('musicBlob',function(musicBlob){
        console.log("MUSICBLOB RECEIVED");
        s.postMessage({blob: musicBlob, command: "musicBlob"});
    });
});
