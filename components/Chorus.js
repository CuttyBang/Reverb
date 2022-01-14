import { context } from './Context.js'

const makeChorus = () => {
  const splitter = context.createChannelSplitter(2);
  const merger = context.createChannelMerger(2);
  const input = context.createGain();
  const output = context.createGain();
  const depthL=  context.createGain();
  const depthR = context.createGain();
  const delayL = context.createDelay();
  const delayR = context.createDelay()
  const osc = context.createOscillator();

  //let { splitter, merger, input, output, depthL, depthR, delayL, delayR, osc } = this;

  //time.value = parseFloat( document.getElementById("scdelay").value );
  delayL.delayTime.value = 0.03;
  //time.value = parseFloat( document.getElementById("scdelay").value );
  delayR.delayTime.value = 0.03;
  //depthR.value = parseFloat( document.getElementById("scdepth").value );
  depthL.gain.value = 0.002;
  //depthL.value = - parseFloat( document.getElementById("scdepth").value ); // depth of change to the delay:
  depthR.gain.value = -0.002;

  osc.type = 'triangle';
  //speed.value = parseFloat( document.getElementById("scspeed").value );
  osc.frequency.value = 3.5;

  input.connect(splitter);
  input.connect(output);

  splitter.connect(delayL, 0);
  splitter.connect(delayR, 1);

  osc.connect(depthL);
  osc.connect(depthR);

  depthL.connect(delayL.delayTime);
  depthR.connect(delayR.delayTime);

  delayL.connect(merger, 0, 0);
  delayR.connect(merger, 0, 1);

  merger.connect(output);

  osc.start();

  let speed = osc.frequency;
  let timeLeft = delayL.delayTime;
  let timeRight = delayR.delayTime;
  let depthLeft = depthL.gain;
  let depthRight = depthR.gain;

  return {speed, timeLeft, timeRight, depthLeft, depthRight, input, output}
};

export { makeChorus };
