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
    this.iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    this.gainNode = null;

    //Everything sync
    this.tripDuration = 0;

    //Second page
    this.snowMachine = null; 

    window.addEventListener('touchstart', this.proxy(function() {
        

        if(this.iOS){
            // create empty buffer
            var buffer = this.audioCtx.createBuffer(1, 1, 22050);
            var source = this.audioCtx.createBufferSource();
            source.buffer = buffer;

            // connect to output (your speakers)
            source.connect(this.audioCtx.destination);

            // play the file
            source.noteOn(0);
        } else {
            this.gainNode.gain.value = 1;
        }

        $(".pulse-button").removeClass("opacityZero").addClass("opacityZero");
    }, false));
}

KerstAppHome.prototype.init = function(){
    if(!this.iOS){
        this.gainNode = this.audioCtx.createGain();
        this.gainNode.gain.value = 0;
        this.gainNode.connect(this.audioCtx.destination);
    }
    this.socketworker = new Worker("js/worker/socketworker.js");
    this.socketworker.onmessage = this.proxy(function(e){
        switch(e.data.command){
            case "socketDisconnected":
                this.bufferingNeeded = true;
                break;
            case "socketConnected":
                this.tripDuration = e.data.tripDuration;
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
        if(!this.iOS){
            source.connect(this.gainNode); 
        } else {
            source.connect(this.audioCtx.destination);
        }
        var processDelayInMS = musicBlob.msFromEndToServer - this.tripDuration;   
        var playTime = this.audioCtx.currentTime + (musicBlob.delayInMS / 1000) - (processDelayInMS / 1000) - audioBuffer.duration;
        var blob = { source: source, duration: audioBuffer.duration, playTime: playTime , msFromEndToServer: musicBlob.msFromEndToServer};

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