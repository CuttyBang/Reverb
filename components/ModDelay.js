import { context } from './Context.js'

const makeModDelay = () => {
  const delay = context.createDelay();
  const chrs = context.createDelay();
  const osc = context.createOscillator();
  const incoming = context.createGain();
  const out = context.createGain();
  const fb = context.createGain();
  const chrsGain = context.createGain();

  // let { delay, in, out, fb, chrs, osc, chrsGain } = this;

  delay.delayTime.value = 0.15;
  fb.gain.value = 0.5;
  chrs.delayTime.value = 0.03;
  chrsGain.gain.value = 0.002;
  osc.frequency.value = 3.5;
  osc.type = 'sine';

  osc.connect(chrsGain);
  chrsGain.connect(chrs.delayTime);

  incoming.connect(delay);
  delay.connect(chrs);
  delay.connect(fb);
  chrs.connect(fb);
  fb.connect(delay);
  fb.connect(out);

  osc.start(0);

  let time = delay.delayTime.value;
  let feedback = fb.gain.value;
  let chorus = chrs.delayTime.value;
  let rate = osc.frequency.value;
  let depth = chrsGain.gain.value;
  let input = incoming;
  let output = out;

  return { time, feedback, rate, depth, input, output };
};

export { makeModDelay };
