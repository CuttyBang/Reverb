import { context } from './Context.js'

const makeFilter = (type) => {
  const filter = context.createBiquadFilter();
  const input = context.createGain();
  const output = context.createGain();
  let Q = filter.Q.value;
  let cutoff = filter.frequency;
  let gain = filter.gain;

  input.gain.value = 1;
  output.gain.value = 1;

  input.connect(filter);
  filter.connect(output);


  if (type == 'hp') {
    filter.type = 'highpass';
    cutoff.value = 300;
  }
  if (type == 'lp') {
    filter.type = 'lowpass';
    cutoff.value = 5000;
  }
  if (type == 'bp') {
    filter.type = 'bandpass';
    cutoff.value = 1000;
  }
  if (type == 'hs') {
    filter.type = 'highshelf';
    cutoff.value = 5000;
    gain.value = 0;
  }
  if (type == 'ls') {
    filter.type = 'lowshelf';
    cutoff.value = 500;
    gain.value = 0;
  }
  if (type == 'pk') {
    filter.type = 'peaking';
    cutoff.value = 500;
    gain.value = 0;
  }
  if (type == 'nc') {
    filter.type = 'notch';
    cutoff.value = 500;
  }
  if (type == 'ap') {
    filter.type.value = 'allpass';
  }

  return { filter, Q, cutoff, gain, input, output }
}

export {makeFilter};
