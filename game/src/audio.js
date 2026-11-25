// Tiny synthesized sound effects (WebAudio, no audio files). The context is
// created on the first user gesture; every call is a no-op before that, so
// staged screenshots stay silent and deterministic.
let audioCtx = null;
let muted = false;

export function initAudio() {
  if (!audioCtx) {
    try {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (Ctor) audioCtx = new Ctor();
    } catch {
      audioCtx = null;
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

function tone(freq, dur, type, gain, when) {
  if (!audioCtx || muted) return;
  const t0 = audioCtx.currentTime + (when || 0);
  const osc = audioCtx.createOscillator();
  const amp = audioCtx.createGain();
  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(freq, t0);
  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.exponentialRampToValueAtTime(gain || 0.12, t0 + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(amp);
  amp.connect(audioCtx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function noise(dur, gain, freq) {
  if (!audioCtx || muted) return;
  const t0 = audioCtx.currentTime;
  const len = Math.max(1, Math.floor(audioCtx.sampleRate * dur));
  const buffer = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = audioCtx.createBufferSource();
  src.buffer = buffer;
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(freq || 1200, t0);
  const amp = audioCtx.createGain();
  amp.gain.setValueAtTime(gain || 0.15, t0);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter);
  filter.connect(amp);
  amp.connect(audioCtx.destination);
  src.start(t0);
}

export function playSound(name) {
  if (!audioCtx || muted) return;
  switch (name) {
    case 'take': tone(520, 0.07, 'triangle', 0.1); break;
    case 'place': tone(660, 0.07, 'triangle', 0.1); break;
    case 'chop': noise(0.09, 0.2, 900); break;
    case 'cook': noise(0.25, 0.07, 2400); break;
    case 'ding': tone(880, 0.35, 'sine', 0.14); tone(1320, 0.3, 'sine', 0.08, 0.08); break;
    case 'serve': tone(784, 0.12, 'triangle', 0.12); tone(1047, 0.18, 'triangle', 0.12, 0.1); break;
    case 'error': tone(160, 0.18, 'square', 0.08); break;
    case 'trash': noise(0.15, 0.15, 500); break;
    case 'fail': tone(220, 0.3, 'sawtooth', 0.07); tone(174, 0.35, 'sawtooth', 0.07, 0.12); break;
    case 'burn': tone(110, 0.4, 'sawtooth', 0.09); break;
    case 'levelup': tone(523, 0.12, 'triangle', 0.12); tone(659, 0.12, 'triangle', 0.12, 0.1); tone(784, 0.22, 'triangle', 0.12, 0.2); break;
    default: break;
  }
}
