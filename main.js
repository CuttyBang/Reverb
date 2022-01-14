import './style.scss'
import './flexible.scss'

import { context, OUTPUT } from './components/Context.js'
import { createSource } from './components/Source.js'
import { humanVoice } from './components/audio/Voice.js'
import { cold_sweat2 } from './components/audio/cold_sweat2.js'
import { makeDelay} from './components/Delay.js'
import { makeFilter } from './components/Filter.js'

const tuna = new Tuna(context);

let reverbIR;

const wetDry = document.getElementById('wetDry');
const masterVol = document.getElementById('masterVol');
const fadeIn = document.getElementById('fadeInTime');
const decay = document.getElementById('decayTime');
const lpStart = document.getElementById('lpFreqStart');
const lpEnd = document.getElementById('lpFreqEnd');


const compSettings = {
  threshold: -15,    //-100 to 0
  makeupGain: 0,     //0 and up (in decibels)
  attack: 300,         //0 to 1000
  release: 900,      //0 to 3000
  ratio: 3,          //1 to 20
  knee: 5,           //0 to 40
  automakeup: false, //true/false
  bypass: 0
};

const comp1 = new tuna.Compressor(compSettings);
const comp2 = new tuna.Compressor(compSettings);
const comp3 = new tuna.Compressor(compSettings);

const sourceGain = context.createGain();
sourceGain.gain.value = 0.8;
const dryGain = context.createGain();
dryGain.gain.value = 0.7;
const wetGain = context.createGain();
wetGain.gain.value = 0.7;
const wetGain2 = context.createGain();
wetGain2.gain.value = 1;
const groupBuss = context.createGain();
groupBuss.gain.value = 1;
const outputGain = context.createGain();
outputGain.gain.value = 0.2;
const convolver = context.createConvolver();

let reverbGen = {};

reverbGen.generateReverb = (params, callback) => {
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

const applyGradualLowpass = (input, lpFreqStart, lpFreqEnd, lpFreqEndAt, callback) => {
  if (lpFreqStart == 0) {
    callback(input);
    return;
  }
  let channelData = getAllChannelData(input);
  let context = new OfflineAudioContext(input.numberOfChannels, channelData[0].length, input.sampleRate);
  let player = context.createBufferSource();
  player.buffer = input;
  let filter = context.createBiquadFilter();

  lpFreqStart = Math.min(lpFreqStart, input.sampleRate / 2);
  lpFreqEnd = Math.min(lpFreqEnd, input.sampleRate / 2);

  filter.type = "lowpass";
  filter.Q.value = 0.0001;
  filter.frequency.setValueAtTime(lpFreqStart, 0);
  filter.frequency.linearRampToValueAtTime(lpFreqEnd, lpFreqEndAt);

  player.connect(filter);
  filter.connect(context.destination);
  player.start();
  context.oncomplete = function(event) {
    callback(event.renderedBuffer);
  };
  context.startRendering();

  window.filterNode = filter;
};

let getAllChannelData = buffer => {
  let channels = [];
  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels[i] = buffer.getChannelData(i);
  }
  return channels;
};

let randomSample = function() {
  return Math.random() * 2 - 1;
};

function doGenerateReverb() {
  const params = {
    fadeInTime: Number(document.getElementById('fadeInTime').value),
    decayTime: Number(document.getElementById('decayTime').value),
    // sampleRate: Number(document.getElementById('sampleRate').value),
    lpFreqStart: Number(document.getElementById('lpFreqStart').value),
    lpFreqEnd: Number(document.getElementById('lpFreqEnd').value),
    numChannels: 2            // TODO: let user specify
  };

  reverbGen.generateReverb(params, (result) => {
    reverbIR = result;
    try {
      convolver.buffer = reverbIR;
    } catch(e) {
      alert("There was an error creating the convolver, probably because you chose " +
            "a sample rate that doesn't match your browser's playback (" + context.sampleRate +
            "). Playing the demo sounds through your impulse response may not work, " +
            "but you should be able to play and/or save the impulse response. Error message: " + e);
      convolver.buffer = context.createBuffer(params.numChannels, 1, context.sampleRate);
    }
  });
};


function crossfade(a, b, value) {
  // equal-power crossfade
  var gain1 = Math.cos(value * 0.5*Math.PI);
  var gain2 = Math.cos((1.0-value) * 0.5*Math.PI);

  a.gain.value = gain1;
  b.gain.value = gain2;
}

function valueconv(x){
  x = 20 * Math.pow( 1000, x / 100 );
  if(x <= 1000) return x.toFixed(2) + " Hz";
  return (x/1000).toFixed(2) + " kHz";
}

// dry chain
sourceGain.connect(dryGain);
dryGain.connect(comp1);
comp1.connect(groupBuss);

// wet chain
sourceGain.connect(wetGain);
wetGain.connect(convolver);
convolver.connect(comp2);
comp2.connect(groupBuss);


groupBuss.connect(comp3);
comp3.connect(outputGain);

outputGain.connect(OUTPUT);

function init() {
  const source = createSource(humanVoice);
  source.connect(sourceGain);
  source.start();
  doGenerateReverb();
  crossfade(dryGain, wetGain, wetDry.value);

  stopButton.onclick = function() {
    source.stop();
  };
}

startButton.addEventListener('click', () => {
  init();
});


wetDry.addEventListener('input', () => {
  crossfade(dryGain, wetGain, wetDry.value)
});

masterVol.addEventListener('input', () => {
 outputGain.gain.value = masterVol.value;
});


decay.addEventListener('input', () => {
  doGenerateReverb();
});

fadeIn.addEventListener('input', () => {
  doGenerateReverb();
});

lpFreqStart.addEventListener('input', () => {
  doGenerateReverb();
});

lpFreqEnd.addEventListener('input', () => {
  doGenerateReverb();
});
