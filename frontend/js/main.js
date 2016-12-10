//Socket.io
var socket = io.connect('http://localhost:2017');
var socketIsConnected = false;

socket.on('connect', function(){
    console.log("Connected to server!");
    socketIsConnected = true;
});
socket.on('disconnect', function(){
    console.log("Disconnected from server!")
    socketIsConnected = false;
});

var colors = { streaming: '#FF0000', off: "blue"}
var color = colors.streaming;

//Audio
window.AudioContext = window.AudioContext || window.webkitAudioContext;

var audioContext = new AudioContext();
var audioInput = null,
    realAudioInput = null,
    inputPoint = null,
    audioRecorder = null;
var rafID = null;
var analyserContext = null;
var delayed_analyserContext = null;
var canvasWidth, canvasHeight;
var recIndex = 0;
var streamInterval = null;
var delayInMS = 15000;
var delayedFrame = { canvas: "delayed_analyser", context: delayed_analyserContext, freqByteData: null }

function gotBuffers( options ) {
    audioRecorder.exportWAV( doneEncoding );
}

function doneEncoding( options ) {
    if(socketIsConnected){
        /*
        audioCtx.decodeAudioData(options.blob).then(function(audioBuffer) {
            var musicBlob = { blob: options.blob, endTime: options.endTime, delayInMS: 15 * 1000 };
            socket.emit('musicBlob', musicBlob);
        });*/
        var musicBlob = { blob: options.blob, endTime: options.endTime, delayInMS: delayInMS };
        socket.emit('musicBlob', musicBlob);
    } else {
        console.log("Could not send blob! no connection!");
    }
}

function stream(){
    audioRecorder.getBuffers( gotBuffers );
}

function toggleRecording() {
    var micIcon = document.getElementById("record");
    if (micIcon.classList.contains("recording")) {
        // stop recording
        color = colors.off;
        audioRecorder.stop();
        micIcon.classList.remove("recording");
        audioRecorder.getBuffers( gotBuffers );
        window.clearInterval(streamInterval);
    } else {
        // start recording
        if (!audioRecorder)
            return;
        color = colors.streaming;
        micIcon.classList.add("recording");
        audioRecorder.clear();
        audioRecorder.record();
        streamInterval = window.setInterval(stream, 3000);
    }
}

function cancelAnalyserUpdates() {
    window.cancelAnimationFrame( rafID );
    rafID = null;
}

function updateAnalysers(time) {
    var freqByteData = new Uint8Array(analyserNode.frequencyBinCount);
    analyserNode.getByteFrequencyData(freqByteData); 

    drawCanvas("analyser", analyserContext, freqByteData);
    setTimeout(function(){
        delayedFrame.freqByteData = freqByteData;
    }, delayInMS);
    if(delayedFrame.freqByteData != null){
        drawCanvas(delayedFrame.canvas, delayedFrame.context, delayedFrame.freqByteData);
    }
    rafID = window.requestAnimationFrame( updateAnalysers );
}

function drawCanvas(canvas, context, freqByteData){
    if (!context) {
        var canvas = document.getElementById(canvas);
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;
        context = canvas.getContext('2d');
    }

    // analyzer draw code here
    {
        var SPACING = 3;
        var BAR_WIDTH = 1;
        var numBars = Math.round(canvasWidth / SPACING);

        context.clearRect(0, 0, canvasWidth, canvasHeight);
        context.lineCap = 'round';
        var multiplier = analyserNode.frequencyBinCount / numBars;

        // Draw rectangle for each frequency bin.
        for (var i = 0; i < numBars; ++i) {
            var magnitude = 0;
            var offset = Math.floor( i * multiplier );
            // gotta sum/average the block, or we miss narrow-bandwidth spikes
            for (var j = 0; j< multiplier; j++)
                magnitude += freqByteData[offset + j];
            magnitude = magnitude / multiplier;
            var magnitude2 = freqByteData[i * multiplier];
            context.fillStyle = color//"hsl( " + Math.round((i*360)/numBars) + ", 100%, 50%)";
            context.fillRect(i * SPACING, canvasHeight, BAR_WIDTH, -magnitude);
        }
    }
}

function gotStream(stream) {
    inputPoint = audioContext.createGain();

    // Create an AudioNode from the stream.
    realAudioInput = audioContext.createMediaStreamSource(stream);
    audioInput = realAudioInput;
    audioInput.connect(inputPoint);

    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 2048;
    inputPoint.connect( analyserNode );

    audioRecorder = new Recorder( inputPoint );

    zeroGain = audioContext.createGain();
    zeroGain.gain.value = 0.0;
    inputPoint.connect( zeroGain );
    zeroGain.connect( audioContext.destination );
    updateAnalysers();
    toggleRecording();
}

function initAudio() {
        if (!navigator.getUserMedia)
            navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        if (!navigator.cancelAnimationFrame)
            navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
        if (!navigator.requestAnimationFrame)
            navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;

    navigator.getUserMedia(
        {
            "audio": {
                "mandatory": {
                    "googEchoCancellation": "false",
                    "googAutoGainControl": "false",
                    "googNoiseSuppression": "false",
                    "googHighpassFilter": "false"
                },
                "optional": []
            },
        }, gotStream, function(e) {
            alert('Error getting audio');
            console.log(e);
        });
}

window.addEventListener('load', initAudio );
