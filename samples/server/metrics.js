/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { Glean, _MetricTypes: { EventMetricType } } = require("glean");

const _INSTANCE = new Glean("node-server-sample", "node.js");
const GleanMetrics = {
    reload: new EventMetricType(_INSTANCE, "test", "reload"),
};

module.exports = GleanMetrics
