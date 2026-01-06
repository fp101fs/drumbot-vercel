document.addEventListener('DOMContentLoaded', () => {
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

  class InputRecorder {
    constructor() {
      this.isRecordingInput = false;
      this.isPlaying = false;
      this.player = new core.SoundFontPlayer('https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus');
      this.player.callbackObject = {
        run: (note) => {
          this.viz.redraw(note, true);
        },
        stop: () => {}
      };
      this.reset();
    }

    reset() {
      this.stop();
      this.input = {notes:[], tempos: [{time: 0, qpm: 120}], totalTime: 0};
      this.full = {notes:[], tempos: [{time: 0, qpm: 120}], totalTime: 0};
      this.isRecordingInput = false;
      this.offset = 0;
      this.updateVisualizer();
    }

    setBpm(bpm) {
      this.input.tempos[0].qpm = bpm;
      this.full.tempos[0].qpm = bpm;
    }

    updateVisualizer() {
      this.viz = new core.PianoRollSVGVisualizer(this.full, document.getElementById('svgInput'), {
        noteHeight: 5,
        pixelsPerTimeStep: 30,
        minPitch: 21,
        maxPitch: 108
      });
    }

    startRecordingInput(offset) {
      this.isRecordingInput = true;
      this.offset = offset;
      this.input.notes = [];
    }

    stopRecordingInput() {
      this.isRecordingInput = false;
    }

    saveInputNote(note) {
      const cloned = core.sequences.clone(note);
      cloned.startTime -= this.offset;
      cloned.endTime -= this.offset;
      this.input.notes.push(cloned);
    }

    saveMelodyNote(note) {
      this.full.notes.push(note);
    }

    getInput(totalTime) {
      this.input.totalTime = totalTime;
      return this.input;
    }

    start(callback) {
      this.isPlaying = true;
      this.player.start(this.full).then(callback);
    }

    stop() {
      this.isPlaying = false;
      this.player.stop();
    }

    addLoops(audioLoop, inputOffset) {
      audioLoop.addLoops(this.full, inputOffset, -1);
    }
  }
  window.InputRecorder = InputRecorder;
});
