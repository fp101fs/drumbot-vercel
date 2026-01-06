/**
 * @license
 * Copyright 2019 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Tone = window.Tone;

class Metronome {
  constructor(numQuarters) {
    this.numQuarters = numQuarters;
    this.isTicking = false;
    this.muted = false;
    this.reset();
  }

  reset() {
    if (this.part) {
      this.part.stop();
      this.part.dispose();
    }
    this.synth = new Tone.MembraneSynth().toMaster();
    this.synth.volume.value = -10;
    this.startedAt = undefined;
  }

  start(bpm, callbacks) {
    this.reset();
    Tone.Transport.bpm.value = bpm;
    const part = new Tone.Part((time, value) => {
      this.synth.triggerAttackRelease(value.note, '16n', time);
      if (this.muted) return;
      if (value.tick % this.numQuarters === 0) {
        callbacks.barMark(time);
      }
      if (value.tick % 1 === 0) {
        callbacks.quarterMark(time, value.tick % this.numQuarters);
      }
      callbacks.clickMark(time, value.tick);

    }, [{tick:0, note: 'c2'}, {tick:1, note: 'c1'}, {tick:2, note: 'c1'}, {tick:3, note: 'c1'}]);
    part.loop = true;
    part.loopEnd = '1m';

    this.part = part;
    this.isTicking = true;
    this.startedAt = Tone.immediate();
    this.part.start(this.startedAt);
  }

  stop() {
    this.isTicking = false;
    this.part.stop(Tone.immediate());
  }

  timeish() {
    return Tone.immediate() - this.startedAt;
  }
}