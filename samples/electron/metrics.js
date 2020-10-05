/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { Glean, _MetricTypes: { EventMetricType } } = require("glean");

const _INSTANCE = new Glean("electron-sample-app", "electron");
const GleanMetrics = {
    test: new EventMetricType(_INSTANCE, "testcat", "click"),
};

module.exports = GleanMetrics
