import { context } from './Context.js'

const autoMakeup = (comp) => {
    var magicCoefficient = 3, // raise me if the output is too hot
        c = comp;
    return -(c.threshold.value - c.threshold.value / c.ratio.value) / magicCoefficient;
}

const makeCompressor = () => {
  const dynamics = context.createDynamicsCompressor();
  const input = context.createGain();
  const output = context.createGain();
  const makeup = context.createGain();
  // attack: 0-1 .003
  // knee: 0-40 30
  // ratio: 1-20 12
  // release: 0-1 0.250
  // thresh: -100 - 0 -24
  dynamics.attack.value = 0.09;
  dynamics.knee.value = 20;
  dynamics.ratio.value = 4;
  dynamics.release.value = 0.500
  dynamics.threshold.value = -20;
  let attack = dynamics.attack.value;
  let knee = dynamics.knee.value;
  let ratio = dynamics.ratio.value;
  let release = dynamics.release.value;
  let threshold = dynamics.threshold.value;

  input.gain.value = 0.6;
  makeup.gain.value = autoMakeup(dynamics);
  output.gain.value = 0.8;

  input.connect(dynamics);
  dynamics.connect(makeup);
  makeup.connect(output);

  return {input, output, makeup, attack, knee, ratio, release, threshold};
};

export {makeCompressor}
