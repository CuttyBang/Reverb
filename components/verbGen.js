/** Generates a reverb impulse response.
@param {!Object} params TODO: Document the properties.
@param {!function(!AudioBuffer)} callback Function to call when
  the impulse response has been generated. The impulse response
  is passed to this function as its parameter. May be called
  immediately within the current execution context, or later.
*/
const generateReverb = (params, callback) => {
  let audioContext = params.audioContext || new AudioContext();
  let sampleRate = params.sampleRate || 44100;
  let numChannels = params.numChannels || 2;
  // params.decayTime is the -60dB fade time. We let it go 50% longer to get to -90dB.
  let totalTime = params.decayTime * 1.5;
  let decaySampleFrames = Math.round(params.decayTime * sampleRate);
  let numSampleFrames = Math.round(totalTime * sampleRate);
  let fadeInSampleFrames = Math.round((params.fadeInTime || 0) * sampleRate);
  // 60dB is a factor of 1 million in power, or 1000 in amplitude.
  let decayBase = Math.pow(1 / 1000, 1 / decaySampleFrames);
  let reverbIR = audioContext.createBuffer(numChannels, numSampleFrames, sampleRate);
  for (let i = 0; i < numChannels; i++) {
    let chan = reverbIR.getChannelData(i);
    for (let j = 0; j < numSampleFrames; j++) {
      chan[j] = randomSample() * Math.pow(decayBase, j);
    }
    for (let j = 0; j < fadeInSampleFrames; j++) {
      chan[j] *= (j / fadeInSampleFrames);
    }
  }
  applyGradualLowpass(reverbIR, params.lpFreqStart || 0, params.lpFreqEnd || 0, params.decayTime, callback);
};

/** Applies a constantly changing lowpass filter to the given sound.
@private
@param {!AudioBuffer} input
@param {number} lpFreqStart
@param {number} lpFreqEnd
@param {number} lpFreqEndAt
@param {!function(!AudioBuffer)} callback May be called
immediately within the current execution context, or later.
*/
const applyGradualLowpass = (input, lpFreqStart, lpFreqEnd, lpFreqEndAt, callback) => {
  if (lpFreqStart == 0) {
    callback(input);
    return;
  }
  let channelData = getAllChannelData(input);
  let offContext = new OfflineAudioContext(input.numberOfChannels, channelData[0].length, input.sampleRate);
  let player = offContext.createBufferSource();
  player.buffer = input;
  let filter = offContext.createBiquadFilter();

  lpFreqStart = Math.min(lpFreqStart, input.sampleRate / 2);
  lpFreqEnd = Math.min(lpFreqEnd, input.sampleRate / 2);

  filter.type = "lowpass";
  filter.Q.value = 0.0001;
  filter.frequency.setValueAtTime(lpFreqStart, 0);
  filter.frequency.linearRampToValueAtTime(lpFreqEnd, lpFreqEndAt);

  player.connect(filter);
  filter.connect(offContext.destination);
  player.start();
  offContext.oncomplete = function(event) {
    callback(event.renderedBuffer);
  };
  offContext.startRendering();

  window.filterNode = filter;
};

/**
@private
@param {!AudioBuffer} buffer
@return {!Array.<!Float32Array>} An array containing the Float32Array of each channel's samples.
*/
const getAllChannelData = buffer => {
  let channels = [];
  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels[i] = buffer.getChannelData(i);
  }
  return channels;
};

/**
@private
@return {number} A random number from -1 to 1.
*/
const randomSample = () => {
    return Math.random() * 2 - 1;
};

export {generateReverb};
