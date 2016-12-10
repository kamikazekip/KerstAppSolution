function KerstAppHome(){
    // Everything concerning the stream
    this.socketIsConnected = false;
    this.socket = null;
    this.blobBuffer = [];
    this.bufferingNeeded = true;
    this.totalClock = null;
    this.delayInMS = null;
    this.dateOfServer = new ServerDate();
    this.differenceInClock = this.dateOfServer - new Date();
    this.precision = this.dateOfServer.getPrecision();

    // Everything audio
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new AudioContext();
    this.source = this.audioCtx.createBufferSource();

    //Everything sync
    this.RTTStart = null;
    this.connectionLatency = null;
}

KerstAppHome.prototype.init = function(){
    var address = 'http://192.168.2.120:2017';
    console.log("Connecting to: " + address);
    this.socket = io.connect(address);
    this.RTTStart = new Date();
    this.socket.on('connect', this.proxy(function(){
        this.connectionLatency = new Date() - this.RTTStart;
        this.tripDuration = this.connectionLatency / 2;
        console.log("Connected to socket!");
        this.socketIsConnected = true;

        this.socket.on('disconnect', this.proxy(function(){
            console.log("Disconnected from socket!")
            this.bufferingNeeded = true;
            this.socketIsConnected = false;
        })); 
        this.socket.on('musicBlob', this.proxy(this.onMusicBlobReceived))
    }));
};

KerstAppHome.prototype.onMusicBlobReceived = function(musicBlob){
    musicBlob.audioTimeOnArrival = this.audioCtx.currentTime;
    this.audioCtx.decodeAudioData(musicBlob.blob).then(this.proxy(function(audioBuffer) {
        var source = this.audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.audioCtx.destination);
        var processDelayInMS = musicBlob.msFromEndToServer - this.tripDuration;   
        console.log(this.audioCtx.currentTime + " + " + (musicBlob.delayInMS / 1000) + " - " +  (processDelayInMS / 1000) + " precision: " + this.connectionLatency);
        var playTime = this.audioCtx.currentTime + (musicBlob.delayInMS / 1000) - (processDelayInMS / 1000) - audioBuffer.duration;
        var blob = { source: source, duration: audioBuffer.duration, playTime: playTime };

        if(this.bufferingNeeded){
            this.blobBuffer.push(blob);
        } else {
            this.queueBlob(blob);
        }

        if(this.blobBuffer.length == 3 && this.bufferingNeeded == true){
            this.bufferingNeeded = false;
            this.startPlaying();
        }
    }));
}

KerstAppHome.prototype.startPlaying = function(){
    this.bufferingNeeded = false;
    var firstBlob = this.blobBuffer[0];
    this.totalClock = firstBlob.playTime;
    console.log(this.audioCtx.currentTime, this.totalClock);

    for(var x = 0; x < this.blobBuffer.length; x++){
        this.queueBlob(this.blobBuffer[x]);
    }
}

KerstAppHome.prototype.queueBlob = function(blob){
    console.log("totalClock: ", this.totalClock);
    blob.source.start(this.totalClock);
    this.totalClock += blob.duration;
}

KerstAppHome.prototype.proxy = function(fn){
    return $.proxy(fn, this);
}