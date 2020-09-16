/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const Storage = require('./storage');


class Glean {
  constructor() {
    console.log("Initialize");
    let gleanScript = document.querySelector('[src*=glean\\.js]');
    let appId = gleanScript && gleanScript.getAttribute('app-id');
    if (appId == null || appId.length == 0) {
      console.error("Unable to initialize Glean.JS: no app id provided.");
      return;
    }

    this._eventStorage = new Storage(appId);
  }
}

let glean = new Glean();

module.exports = glean;
