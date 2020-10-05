/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Glean = new GleanInstance.Glean.Glean("qml-sample-app", "QML")
const Metrics = {
    test: new GleanInstance.Glean._MetricTypes.EventMetricType(Glean, "testcat", "click"),
};
