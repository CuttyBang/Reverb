import { context } from './Context.js'


const base64ToArrayBuffer = (base64) => {
  let binaryString, len, bytes;
  binaryString = window.atob(base64);
  len = binaryString.length;
  bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

const createSource = (audio) => {
  let playerBuffer = base64ToArrayBuffer(audio);
  let audioSource = context.createBufferSource();
  context.decodeAudioData(playerBuffer, function(buffer) {
    audioSource.buffer = buffer;
    audioSource.loop = true;
  }, function(e) {
    alert("Error when decoding source audio data" + e.err);
  });

  return audioSource;
}

export { createSource };
