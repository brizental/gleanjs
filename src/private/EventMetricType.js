/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class EventMetricType {
  constructor(glean, category, name) {
    this.category = category;
    this.name = name;
    // The glean instance this metric belongs to.
    this.glean = glean;
  }

  record(extra) {
    this.glean._eventStorage.record(Date.now(), this.category, this.name, extra);
  }
}

module.exports = EventMetricType;
