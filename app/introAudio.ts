// Procedural intro audio — synthesized entirely with the Web Audio API so the
// experience needs no binary assets and works fully offline.
//
//  • startIntroAudio()  — kicks off the loud pen-scratch + a slow majestic pad
//  • stopScratch()      — fades the handwriting scratch once the signature lands
//  • chime()            — a soft bell flourish when the name finishes
//  • fadeOutMusic()     — gently retires the pad as we transition to the site

type Voice = { stop: (when?: number) => void }

let ctx: AudioContext | null = null
let scratch: Voice | null = null
let music: Voice | null = null

function getCtx(): AudioContext {
  if (!ctx) {
    const Ctor: typeof AudioContext =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    ctx = new Ctor()
  }
  return ctx
}

/** Resume the context (needs a user gesture) and start both layers. */
export async function startIntroAudio(durationMs: number): Promise<void> {
  const ac = getCtx()
  try {
    await ac.resume()
  } catch {
    /* ignore — some browsers resume lazily on first node start */
  }
  scratch = playScratch(ac, durationMs)
  music = playPad(ac)
}

/** Loud, textured fountain-pen scratch that lasts for the writing duration. */
function playScratch(ac: AudioContext, durationMs: number): Voice {
  const now = ac.currentTime
  const dur = durationMs / 1000

  // A short buffer of white noise, looped, is the raw grain of the pen.
  const frames = Math.floor(ac.sampleRate * 1.2)
  const buffer = ac.createBuffer(1, frames, ac.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1

  const src = ac.createBufferSource()
  src.buffer = buffer
  src.loop = true

  // Shape the noise into a nib dragging across paper.
  const highpass = ac.createBiquadFilter()
  highpass.type = 'highpass'
  highpass.frequency.value = 900

  const band = ac.createBiquadFilter()
  band.type = 'bandpass'
  band.frequency.value = 2700
  band.Q.value = 0.7

  const gain = ac.createGain()
  gain.gain.value = 0

  // Overall envelope — loud, present, then release at the end of the word.
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(0.85, now + 0.18)
  gain.gain.setValueAtTime(0.85, now + Math.max(0.2, dur - 0.35))
  gain.gain.linearRampToValueAtTime(0, now + dur)

  // Two square-wave tremolos add the irregular "scratch-scratch" texture.
  const flicker = ac.createOscillator()
  flicker.type = 'square'
  flicker.frequency.value = 19
  const flickerGain = ac.createGain()
  flickerGain.gain.value = 0.32
  flicker.connect(flickerGain)
  flickerGain.connect(gain.gain)

  const rasp = ac.createOscillator()
  rasp.type = 'sawtooth'
  rasp.frequency.value = 7.3
  const raspGain = ac.createGain()
  raspGain.gain.value = 0.18
  rasp.connect(raspGain)
  raspGain.connect(gain.gain)

  src.connect(highpass)
  highpass.connect(band)
  band.connect(gain)
  gain.connect(ac.destination)

  src.start(now)
  flicker.start(now)
  rasp.start(now)

  return {
    stop: (when = ac.currentTime) => {
      try {
        gain.gain.cancelScheduledValues(when)
        gain.gain.setTargetAtTime(0, when, 0.06)
        src.stop(when + 0.4)
        flicker.stop(when + 0.4)
        rasp.stop(when + 0.4)
      } catch {
        /* already stopped */
      }
    },
  }
}

/** A slow, warm, cathedral-like pad chord that swells under the signature. */
function playPad(ac: AudioContext): Voice {
  const now = ac.currentTime

  const master = ac.createGain()
  master.gain.value = 0
  master.gain.linearRampToValueAtTime(0.3, now + 2.6)

  const lowpass = ac.createBiquadFilter()
  lowpass.type = 'lowpass'
  lowpass.frequency.value = 1900
  lowpass.connect(master)

  // Feedback delay for a spacious, reverberant tail.
  const delay = ac.createDelay(1.0)
  delay.delayTime.value = 0.34
  const feedback = ac.createGain()
  feedback.gain.value = 0.34
  delay.connect(feedback)
  feedback.connect(delay)
  delay.connect(master)

  master.connect(ac.destination)

  // C major spread (C2–G4) — open, hopeful, majestic.
  const chord = [65.41, 130.81, 196.0, 261.63, 329.63, 392.0]
  const parts = chord.map((freq, i) => {
    const osc = ac.createOscillator()
    osc.type = i % 2 === 0 ? 'sine' : 'triangle'
    osc.frequency.value = freq

    const voiceGain = ac.createGain()
    voiceGain.gain.value = 0.16 / (1 + i * 0.12)

    // Slow detune shimmer keeps the pad alive rather than static.
    const drift = ac.createOscillator()
    drift.type = 'sine'
    drift.frequency.value = 0.06 + i * 0.013
    const driftGain = ac.createGain()
    driftGain.gain.value = 3.5
    drift.connect(driftGain)
    driftGain.connect(osc.detune)

    osc.connect(voiceGain)
    voiceGain.connect(lowpass)
    voiceGain.connect(delay)

    osc.start(now)
    drift.start(now)
    return { osc, drift }
  })

  return {
    stop: (when = ac.currentTime) => {
      master.gain.cancelScheduledValues(when)
      master.gain.setTargetAtTime(0, when, 0.7)
      parts.forEach(({ osc, drift }) => {
        try {
          osc.stop(when + 3)
          drift.stop(when + 3)
        } catch {
          /* already stopped */
        }
      })
    },
  }
}

/** A soft two-note bell flourish for the moment the signature completes. */
export function chime(): void {
  if (!ctx) return
  const ac = ctx
  const now = ac.currentTime
  ;[783.99, 1174.66].forEach((freq, i) => {
    const osc = ac.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = freq
    const g = ac.createGain()
    const t0 = now + i * 0.09
    g.gain.setValueAtTime(0, t0)
    g.gain.linearRampToValueAtTime(0.12, t0 + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.6)
    osc.connect(g)
    g.connect(ac.destination)
    osc.start(t0)
    osc.stop(t0 + 1.7)
  })
}

export function stopScratch(): void {
  scratch?.stop()
  scratch = null
}

export function fadeOutMusic(): void {
  music?.stop()
  music = null
}
