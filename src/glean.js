/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const Storage = require('./storage');

class Glean {
  constructor() {
    console.log("Initialize");

    let appId = null;
    // Chrome does not define the `browser` object. Instead, it defines
    // the `chrome` object.
    var browser = browser || chrome;
    if (browser) {
      console.log("Running from a webextension");
      appId = browser.runtime.id;
    } else if (gleanScript) {
      console.log("Running from a web page");
      let gleanScript = document.querySelector('[src*=glean\\.js]');
      appId = gleanScript && gleanScript.getAttribute('app-id');
    }

    if (appId == null || appId.length == 0) {
      console.error("Unable to initialize Glean.JS: no app id provided.");
      return;
    }

    this._eventStorage = new Storage(appId);
  }
}

module.exports = new Glean();
