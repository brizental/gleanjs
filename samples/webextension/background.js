/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const _INSTANCE = new Glean.Glean();

class SampleBackgroundScript {
  /**
   * Start the background script.
   **/
  async run() {
    console.log("SampleBackgroundScript - start");
    let g = new Glean._MetricTypes.EventMetricType(_INSTANCE, "extension", "startup");
    g.record();
  }
}

const sample = new SampleBackgroundScript();
sample.run();
