// Everything concerning the stream
var blobBuffer = [];
var bufferingNeeded = true;
var totalClock = null;
var delayInMS = null;
var windowObject
// Everything audio
window.AudioContext = window.AudioContext || window.webkitAudioContext;
var audioCtx = new AudioContext();
var audioSource = audioCtx.createBufferSource();

//Everything sync
var RTTStart = null;
var connectionLatency = null;

function onMusicBlobReceived(musicBlob){
  //This takes a few milliseconds
  audioCtx.decodeAudioData(musicBlob.blob).then(function(audioBuffer) {
      var source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      var processDelayInMS = musicBlob.msFromEndToServer - tripDuration;   
      console.log(audioCtx.currentTime + " + " + (musicBlob.delayInMS / 1000) + " - " +  (processDelayInMS / 1000) + " precision: " + connectionLatency);
      var playTime = audioCtx.currentTime + (musicBlob.delayInMS / 1000) - (processDelayInMS / 1000) - audioBuffer.duration;
      var blob = { source: source, duration: audioBuffer.duration, playTime: playTime };

      if(bufferingNeeded){
          blobBuffer.push(blob);
      } else {
          queueBlob(blob);
      }

      if(blobBuffer.length == 3 && bufferingNeeded == true){
          bufferingNeeded = false;
          startPlaying();
      }
  });
}

function startPlaying(){
    bufferingNeeded = false;
    var firstBlob = blobBuffer[0];
    totalClock = firstBlob.playTime;

    for(var x = 0; x < blobBuffer.length; x++){
        queueBlob(blobBuffer[x]);
    }
}

function queueBlob(blob){
    console.log("totalClock: ", totalClock);
    blob.source.start(totalClock);
    totalClock += blob.duration;
}

this.onmessage = function(e){
  console.log(e.data);
  switch(e.data.command){
    case 'injectAudioContext':
    var AudioContext = e.data.AudioContext;
    var audioCtx = new AudioContext();
    var audioSource = audioCtx.createBufferSource();
    break;
    case 'setRTT':
      RTTStart = e.data.RTTStart;
      connectionLatency = e.data.connectionLatency;
      tripDuration = connectionLatency / 2;
      break;
    case 'onMusicBlobReceived':
      onMusicBlobReceived(e.data.musicBlob);
      break;
  }
};