/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const EventStorage = require('./event_storage');

class Glean {
  constructor(id, env) {
    console.info("Initializing Glean.js...");

    let appId = id;
    // Chrome does not define the `browser` object. Instead, it defines
    // the `chrome` object.
    var browser =
      (typeof browser !== "undefined") ? browser : (typeof chrome !== "undefined" ? chrome : null);

    if (appId) {
      env && console.log(`Running from ${env}`);
    } else if (browser) {
      console.log("Running from a webextension");
      appId = browser.runtime && browser.runtime.id;
    } else {
      console.log("Running from a web page");
      let gleanScript = document.getElementById("glean-js");
      appId = gleanScript && gleanScript.getAttribute('app-id');
    }

    if (!appId) {
      console.error("Unable to initialize Glean.JS: no app id provided.");
      return;
    }

    this._eventStorage = new EventStorage(appId);
  }
}

module.exports = Glean;
