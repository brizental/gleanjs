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
