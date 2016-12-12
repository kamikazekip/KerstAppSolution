function KerstAppHome(){
    // Everything concerning the stream
    this.socketIsConnected = false;
    this.blobBuffer = [];
    this.bufferingNeeded = true;
    this.totalClock = null;
    this.delayInMS = null;
    this.socketworker = null;

    // Everything audio
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new AudioContext();
    this.source = this.audioCtx.createBufferSource();

    //Everything sync
    this.tripDuration = null;

    //Second page
    this.snowMachine = null; 
}

KerstAppHome.prototype.init = function(){
    this.socketworker = new Worker("js/worker/socketworker.js");
    this.socketworker.onmessage = this.proxy(function(e){
        switch(e.data.command){
            case "socketDisconnected":
                this.bufferingNeeded = true;
                break;
            case "socketConnected":
                this.tripDuration = e.data.tripDuration
                break;
            case "musicBlob":
                this.proxy(this.onMusicBlobReceived(e.data.blob));
                break; 
        }
    });
};

KerstAppHome.prototype.onMusicBlobReceived = function(musicBlob){
    musicBlob.audioTimeOnArrival = this.audioCtx.currentTime;
    this.audioCtx.decodeAudioData(musicBlob.blob, this.proxy(function(audioBuffer) {
        var source = this.audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.audioCtx.destination);
        var processDelayInMS = musicBlob.msFromEndToServer - this.tripDuration;   
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
    for(var x = 0; x < this.blobBuffer.length; x++){
        this.queueBlob(this.blobBuffer[x]);
    }
    this.showSecondPage();
}

KerstAppHome.prototype.showSecondPage = function(){
    $( "#wrapper" ).load( "html/playing.html", this.proxy(function(){
        
    }));
}

KerstAppHome.prototype.queueBlob = function(blob){
    blob.source.start(this.totalClock);
    this.totalClock += blob.duration;
}

KerstAppHome.prototype.proxy = function(fn){
    return $.proxy(fn, this);
}