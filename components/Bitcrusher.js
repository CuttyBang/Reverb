function setBitCrusherDepth( bits ) {
    var length = Math.pow(2, bits);
  
    var curve = new Float32Array( length );

    var lengthMinusOne = length - 1;

    for (var i=0; i<length; i++)
        curve[i] = (2 * i / lengthMinusOne) - 1;

    if (bitCrusher)
        bitCrusher.curve = curve;
}

var btcrBufferSize = 4096;

function createBitCrusher() {
    var bitCrusher = audioContext.createScriptProcessor(btcrBufferSize, 1, 1);
    var phaser = 0;
    var last = 0;

    bitCrusher.onaudioprocess = function(e) {
        var step = Math.pow(1/2, btcrBits);
        for (var channel=0; channel<e.inputBuffer.numberOfChannels; channel++) {
            var input = e.inputBuffer.getChannelData(channel);
            var output = e.outputBuffer.getChannelData(channel);
            for (var i = 0; i < btcrBufferSize; i++) {
                phaser += btcrNormFreq;
                if (phaser >= 1.0) {
                    phaser -= 1.0;
                    last = step * Math.floor(input[i] / step + 0.5);
                }
                output[i] = last;
            }
        }
    };
    bitCrusher.connect( wetGain );
    return bitCrusher;
}

btcrBits = 16,
    btcrNormFreq
