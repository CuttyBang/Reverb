import { context } from './Context.js'


function setReverbBank(bank, impulseObject) {
  for (const pulse in impulseObject) {
    let type = makeReverb(impulseObject[pulse]);
    bank.push(type);
  }
}

function connectReverbBank(bank, provider, receiver) {
  bank.forEach((item, i) => {
    let verbOut = item.output;
    provider.connect(item.input);
    verbOut.connect(receiver);
  });
}

function setInitialReverbType(bank, index) {
  let initVerb = bank[index];
  let initVerbIn = bank[index].input;
  initVerb.isActive = true;
  initVerbIn.gain.value = 1;
}

function getCurrentReverb(bank) {
  let currentReverb;
  bank.forEach((item, i) => {
    if (item.isActive == true) {
      currentReverb = item;
    }
  });

  return currentReverb;
}

function switchReverb(bank, index) {
  let oldVerb = getCurrentReverb(bank);
  let newVerb = bank[index];
  oldVerb.isActive = false;
  oldVerb.input.gain.value = 0;
  newVerb.isActive = true;
  newVerb.input.gain.value = 1;
}

function switchImpulse(bank, index, current) {
  // let oldVerb = current;
  let newVerb = bank[index];
  // oldVerb.isActive = false;
  // oldVerb.input.gain.value = 0;
  newVerb.isActive = true;
  newVerb.input.gain.value = 1;
}


function base64ToArrayBuffer(base64) {
  let binaryString, len, bytes;
  binaryString = window.atob(base64);
  len = binaryString.length;
  bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

const makeReverb = (type) => {
  const impulseBuffer = base64ToArrayBuffer(type);
  const bufferSource = context.createBufferSource();
  const verb = context.createConvolver();
  const input = context.createGain();
  const output = context.createGain();
  const isActive = false;

  input.gain.value = 0;
  output.gain.value = 1;

  input.connect(verb);
  verb.connect(output);

  context.decodeAudioData(impulseBuffer, function(buffer) {
    verb.buffer = buffer;
    let bufferLength = buffer.duration;
    verb.loop = true;
    // front.setAttribute('max', Math.floor(bufferLength));
    // back.setAttribute('max', Math.floor(bufferLength));
  }, function(e) {
    alert("Error when decoding source audio data" + e.err);
  });

  return {verb, input, output, isActive}
}

export {makeReverb, switchReverb, switchImpulse, getCurrentReverb, setInitialReverbType, connectReverbBank, setReverbBank}
