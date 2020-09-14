/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

class Glean {
  os = "Unknown";
  browser = "Unknown";
  deviceType = "Unknown";
  loadDate;
  locale;
  clientId;
  appId;

  constructor(appId) {
    this.loadDate = new Date();
    try {
      this.locale = navigator.language;
    } catch {
      this.locale = "und";
    }
    this.appId = appId;
    // Note: the client id will be loaded from the local
    // storage.
    this._clientId = this._getUUIDv4();
    this._parseUserAgent();
  }

  _guessOS(ua) {
    if (ua.indexOf("win") != -1) {
      return "Windows";
    } else if (ua.indexOf("mac") != -1) {
      return "MacOS";
    } else if (ua.indexOf("linux") != -1 ) {
      return "Linux";
    } else if (ua.indexOf("ios") != -1) {
      return "iOS";
    } else if (ua.indexOf("android") != -1) {
      return "Android";
    }

    return "Unknown";
  }

  _guessBrowser(ua) {
    if (ua.indexOf("firefox") != -1) {
      return "Firefox";
    } else if (ua.indexOf("opera") != -1) {
      return "Opera";
    } else if (ua.indexOf("chrome") != -1 ) {
      return "Chrome";
    } else if (ua.indexOf("safari") != -1) {
      return "Safari";
    } else if (ua.indexOf("edge") != -1) {
      return "Edge";
    } else if (ua.indexOf("ie") != -1) {
      return "IE";
    }

    return "Unknown";
  }

  _guessDeviceType(ua) {
    if (ua.indexOf("tablet") != -1) {
      return "Tablet";
    }

    if (ua.indexOf("android") != -1) {
      if (ua.indexOf("mobi") != -1) {
        return "Mobile";
      } else {
        // If it's Android and is not a phone, it's probably a tablet.
        return "Tablet";
      }
    }

    return "Desktop";
  }

  /**
   * This is shamelessly copied from https://stackoverflow.com/a/2117523/261698
   */
  _getUUIDv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }

  /**
   * Best effort way to extract some values off the UA.
   */
  _parseUserAgent() {
    // TODO: we should really have some "PlatformInfo" class that uses
    // UA when in a webpage and the WebExtentions APIs when in an addon.
    const ua = navigator.userAgent.toLowerCase();
    this.os = this._guessOS(ua);
    this.browser = this._guessBrowser(ua);
    this.deviceType = this._guessDeviceType(ua);
  }

  _getSubmissionPath() {
    const pingId = this._getUUIDv4();
    return `https://incoming.telemetry.mozilla.org/submit/${this.appId}/events/1/${pingId}`;
  }

  async ping() {
    console.log(`Glean.ping - ${this.deviceType}, ${this.os}, ${this.browser}, ${this.loadDate}, ${this.locale}`);

    const ping_info = {
      seq: 0,
      experiments: {},
      start_time: this.loadDate,
      end_time: (new Date()).toISOString()
    };
    const client_info = {
      app_build: "Unknown",
      app_display_version: "Unknown",
      architecture: "Unknown",
      //client_id: "",
      first_run_date: (new Date()).toISOString(),
      os: this.os,
      os_version: "Unknown",
      telemetry_sdk_build: "0.0.1",
      locale: this.locale
    };

    const payload = {
      ping_info,
      client_info
    };

    const requestParams = {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Date": (new Date()).toISOString(),
        "X-Client-Type": "Glean.JS",
        "X-Client-Version": "0.0.1",
        "X-Debug-ID": "ninja-dx-test"
      },
      body: JSON.stringify(payload),
      mode: "cors",
      cache: "default"
    };

    fetch(this._getSubmissionPath(), requestParams)
      .then(response => console.log(`Response received: ${response.text()}`))
      .then(data => {
        console.log('Success:', data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
}

(function () {
  let gleanScript = document.querySelector('[src*="../../src/glean.js"]');
  let appId = gleanScript && gleanScript.getAttribute('app-id');

  let glean = new Glean(appId);
  glean.ping();
})();
