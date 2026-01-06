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
(function() {
  const Y_OFFSET = 25;

  class Visualizer {
    constructor(numQuarters) {
      this.numQuarters = numQuarters;

      this.svgInput = document.getElementById('svgInput');
      this.svgMelody = document.getElementById('svgMelody');
      this.svgDrums = document.getElementById('svgDrums');
      this.timeline = document.getElementById('timeline');
      this.lastTotalTime = 0;
      this.totalTime = 0;

      this.cfgInput = {
        noteHeight: 5,
        pixelsPerTimeStep: 0,
        minPitch: 21,
        maxPitch: 108
      };
      this.cfgMelody = {
        noteHeight: 5,
        pixelsPerTimeStep: 0,
        minPitch: 21,
        maxPitch: 108,
        noteRGB: '232, 172, 14'
      };
      this.cfgDrums = {
        noteHeight: 5,
        pixelsPerTimeStep: 0,
        noteRGB: '14, 131, 232',
        minPitch: 35,
        maxPitch: 51
      }
      this.reset();
    }

    setTotalTime(totalTime) {
      this.lastTotalTime = this.totalTime;
      this.totalTime = totalTime;
      const w = this.totalTime * this.cfgInput.pixelsPerTimeStep;
      this.svgInput.setAttribute('width', w);
      this.svgMelody.setAttribute('width', w);
      this.svgDrums.setAttribute('width', w);

      // Add the quarters.
      this.timeline.innerHTML = '';
      for (let i = 0; i < this.numQuarters * 2; i++) {
        const x = i / (this.numQuarters * 2) * 100;
        this.timeline.innerHTML += `<div class="quarter" style="left:${x}%"></div>`;
      }
    }

    reset() {
      this.setTotalTime(0);
      this.svgInput.innerHTML = '';
      this.svgMelody.innerHTML = '';
      this.svgDrums.innerHTML = '';

      this.input = {notes:[], totalTime: 4};
      this.melody = {notes:[], totalTime: 4};
      this.drums = {notes:[], totalTime: 4};

      this.vizInput = new core.PianoRollSVGVisualizer(this.input, this.svgInput, this.cfgInput);
      this.vizMelody = new core.PianoRollSVGVisualizer(this.melody, this.svgMelody, this.cfgMelody);
      this.vizDrums = new core.DrumRollSVGVisualizer(this.drums, this.svgDrums, this.cfgDrums);
    }

    showInput(note, offset) {
      const cloned = core.sequences.clone(note);
      cloned.startTime += offset;
      cloned.endTime += offset;

      this.vizInput.redraw(cloned, false);
    }

    showMelody(sequence, muted) {
      this.melody = sequence;
      this.vizMelody.noteSequence = sequence;
      this.svgMelody.style.opacity = muted ? 0.4 : 1;
    }

    showDrums(sequence, muted) {
      this.drums = sequence;
      this.vizDrums.noteSequence = sequence;
      this.svgDrums.style.opacity = muted ? 0.4 : 1;
    }

    restartBar() {
      this.svgInput.setAttribute('x', this.lastTotalTime * this.cfgInput.pixelsPerTimeStep);
      this.svgMelody.setAttribute('x', this.lastTotalTime * this.cfgInput.pixelsPerTimeStep);
      this.svgDrums.setAttribute('x', this.lastTotalTime * this.cfgInput.pixelsPerTimeStep);
    }

    clearInput() {
      this.svgInput.innerHTML = '';
    }

    advanceBar() {
      if (this.totalTime === 0) return;
      this.cfgInput.pixelsPerTimeStep = this.svgInput.getBoundingClientRect().width / this.totalTime;
      this.cfgMelody.pixelsPerTimeStep = this.svgMelody.getBoundingClientRect().width / this.totalTime;
      this.cfgDrums.pixelsPerTimeStep = this.svgDrums.getBoundingClientRect().width / this.totalTime;

      // Make the notes of the right size.
      this.vizMelody.redraw();
      this.vizDrums.redraw();

      const t = this.svgInput.getAttribute('x') || 0;
      const x = parseFloat(t) - this.cfgInput.pixelsPerTimeStep / this.numQuarters;
      this.svgInput.setAttribute('x', x);
      this.svgMelody.setAttribute('x', x);
      this.svgDrums.setAttribute('x', x);
    }
  }
  
  window.Visualizer = Visualizer;
})();
