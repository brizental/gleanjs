
class SampleBackgroundScript {
  /**
   * Start the background script.
   **/
  async run() {
    console.log("SampleBackgroundScript - start");
    let g = new Glean._MetricTypes.EventMetricType("extension", "startup");
    g.record();
  }
}

const sample = new SampleBackgroundScript();
sample.run();
