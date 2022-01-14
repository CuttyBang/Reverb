import {context} from './Context.js'

const makeDelay = () => {
  const delay = context.createDelay();
  const highPass = context.createBiquadFilter();
  const highShelf = context.createBiquadFilter();
  const fb = context.createGain();
  const input = context.createGain();
  const output = context.createGain();
  const time = delay.delayTime;
  const offset = context.currentTime + 5;

  //let { delay, time, feedback, input, output, highPass, highShelf, offset } = this;
  //gain.setValueAtTime(0, context.currentTime);
  input.gain.value = 0.75;
  //input.gain.linearRampToValueAtTime(0.75, offset);
  output.gain.value = 1;

  fb.gain.value = 0.5;
  time.value = 0.8;

  highShelf.type = 'highshelf';
  highShelf.frequency.value = 5000;
  highShelf.gain.value = -15;
  highPass.type = 'highpass';
  highPass.frequency.value = 300;

  input.connect(highPass);
  highPass.connect(delay);
  delay.connect(fb);
  fb.connect(highShelf);
  //highPass.connect(highShelf);

  highShelf.connect(delay)

  delay.connect(output);

  let feedback = fb.gain;

  return {time, input, output, feedback, offset}
};

export { makeDelay };
