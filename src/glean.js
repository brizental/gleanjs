/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const Storage = require('./storage');


class Glean {
  constructor() {
    console.log('instantiating!?')
    let gleanScript = document.querySelector('[src*=glean\\.js]');
    let appId = gleanScript && gleanScript.getAttribute('app-id');

    this._eventStorage = new Storage(appId);
  }
}

let glean = new Glean();

module.exports = glean;

(function () {
    window.addEventListener('load', () => {
        // Record an event on load,
        // this should go through all the hoops to store, collect and upload.

        const Event = require('./private/EventMetricType');
        let e = new Event();
        e.record();
    });
})();
