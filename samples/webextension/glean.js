var Glean =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/constants.js":
/*!**************************!*\
  !*** ./src/constants.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = {
    /**
     * The key to store the last sequence number in storage.
     */
    SEQUENCE_NUMBER_STORAGE_KEY: "gleanSequenceNumber",

    /**
     * The key to store the time the last ping was sent in storage.
     */
    LAST_SENT_DATE_KEY: "gleanLastSentDate",
    
    /**
     * The key to store the client id.
     */
    CLIENT_ID_KEY: "gleanClientId",
    
    /**
     * The key to store the first run date.
     */
    FIRST_RUN_DATE_KEY: "gleanFirstRunDate",

    /**
     * The key to store the pending ping payloads.
     */
    PENDING_PINGS_STORAGE_KEY: "gleanPendingPings",
    
    /**
     * The key to store glean events on localStorage.
     */
    EVENT_STORAGE_KEY: "gleanEvents",
    
    /**
     * The maximum number of events to hold until it's time to flush.
     */
    MAX_EVENTS: 10,
    
    /**
     * The interval in which to batch and send events.
     */
    EVENTS_PING_INTERVAL: 60 * 1000, // 5s

    /**
     * The current version of this SDK,
     * this must by in sync with the version in the package.json.
     *
     * TODO: Find a better way to get this.
     */
    TELEMETRY_SDK_BUILD: "0.0.1",

    /**
     * The telemetry endpoint to send data to.
     */
    TELEMETRY_ENDPOINT: "https://cors-anywhere.herokuapp.com/https://incoming.telemetry.mozilla.org/",

    /**
     * The amount of time to wait before retrying on a recoverable error.
     */
    RECOVERABLE_UPLOAD_ERROR_TIMEOUT: 60 * 1000, // 1min
}


/***/ }),

/***/ "./src/glean.js":
/*!**********************!*\
  !*** ./src/glean.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */



const Storage = __webpack_require__(/*! ./storage */ "./src/storage.js");

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


/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const glean = __webpack_require__(/*! ./glean */ "./src/glean.js");
const EventMetricType = __webpack_require__(/*! ./private/EventMetricType */ "./src/private/EventMetricType.js");

module.exports = {
    INSTANCE: glean,
    _MetricTypes: {
        EventMetricType
    }
};


/***/ }),

/***/ "./src/ping_maker.js":
/*!***************************!*\
  !*** ./src/ping_maker.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const {
    PENDING_PINGS_STORAGE_KEY,
    CLIENT_ID_KEY,
    FIRST_RUN_DATE_KEY,
    SEQUENCE_NUMBER_STORAGE_KEY,
    LAST_SENT_DATE_KEY,
    TELEMETRY_SDK_BUILD,
} = __webpack_require__(/*! ./constants */ "./src/constants.js");
const upload = __webpack_require__(/*! ./upload */ "./src/upload.js");

/**
 * A helper class to collect and send pings for uploading.
 */
class PingMaker {
    constructor(appId) {
        // Have a mirror of the pings persisted in storage
        // so we don't need to make that trip everytime.
        this._pings = this._getPersistedPings();
        this._appId = appId;
        // Preload all the info that doesn't change.
        this._clientId = this._getClientId();
        this._firstRunDate = this._getFirstRunDate();

        const { os, browser, deviceType } = this._getPlatformInfo();
        this._os = os;
        // TODO: Where should we add these in the client_info for now?
        this._browser = browser;
        this._deviceType = deviceType;

        // Locale could actually change between pings,
        // but I think we can ignore that for now.
        try {
            this.locale = navigator.language;
        } catch {
            this.locale = "und";
        }
    }

    /**
     * Builds the ping payload and submission url,
     * saves it to storage and triggers upload.
     *
     * @param {String} events A JSON encoded string with the events payload
     *
     * @returns {String} The ping payload (adding this here just until we got the uploader)
     */
    collect(events) {
        const pingId = this._getUUIDv4();
        const pingBody = {
            client_info: this._buildClientInfo(),
            ping_info: this._buildPingInfo(),
            events,
        };

        this._pushPing(pingId, pingBody);

        // Trigger upload for the newly collected ping
        upload(pingId, pingBody);
    }

    /**
     * Get the persisted pings from storage.
     *
     * @returns {String[]} The parsed array of pings found in storage or an empty array.
     */
    _getPersistedPings() {
        let persisted = localStorage.getItem(PENDING_PINGS_STORAGE_KEY);
        if (!persisted) {
            return {};
        }

        try {
            let parsed = JSON.parse(persisted);
            return parsed;
        } catch(e) {
            console.error(`Unable to parse Glean pings from storage: ${e}`);
            localStorage.setItem(PENDING_PINGS_STORAGE_KEY, JSON.stringify({}));
            return {};
        }
    }

    /**
     * Adds a new ping to storage.
     *
     * @param {String} pingId The id of the ping to persist
     * @param {Object} pingBody Te body of the ping to persist
     */
    _pushPing(pingId, pingBody) {
        this._pings[pingId] = pingBody;
        localStorage.setItem(PENDING_PINGS_STORAGE_KEY, JSON.stringify(this._pings));
    }

    /**
     * Build the ping info section of the ping.
     */
    _buildPingInfo() {
        let { startTime, endTime } = this._getStartEndTimes();
        return {
            seq: this._getNextSequenceNumber(),
            experiments: {},
            start_time: startTime,
            end_time: endTime,
        }
    }

    /**
     * Builds the client info section of the ping.
     */
    _buildClientInfo() {
        return {
            app_build: "Unknown",
            app_display_version: "Unknown",
            architecture: "Unknown",
            client_id: this._clientId,
            first_run_date: this._firstRunDate,
            os: this._os,
            os_version: "Unknown",
            telemetry_sdk_build: TELEMETRY_SDK_BUILD,
            locale: this.locale
        }
    }

    /**
     * Get the client id from storage or create a new one and store it.
     *
     * @returns {String} The stored client_id.
    */
    _getClientId() {
        let stored = localStorage.getItem(CLIENT_ID_KEY);
        if (!stored) {
            let newClientId = this._getUUIDv4();
            localStorage.setItem(CLIENT_ID_KEY, newClientId);
            return newClientId;
        } else {
            // TODO: Validate that the stored value is a UUIDv4.
            return stored;
        }
    }

    /**
     * Get the first run date from storage or create a new one and store it.
     *
     * @returns {String} The stored first run date.
    */
    _getFirstRunDate() {
        let stored = localStorage.getItem(FIRST_RUN_DATE_KEY);
        if (!stored) {
            let firstRunDate = (new Date()).toISOString();
            localStorage.setItem(FIRST_RUN_DATE_KEY, firstRunDate);
            return firstRunDate;
        } else {
            return stored;
        }
    }

    /**
     * Calculates the next sequence number and updates localStorage with it.
     *
     * @returns {Number} The next sequence number.
    */
    _getNextSequenceNumber() {
        let stored = parseInt(localStorage.getItem(SEQUENCE_NUMBER_STORAGE_KEY));
        let nextSequenceNumber;
        if (isNaN(stored)) {
            nextSequenceNumber = 1;
        } else {
            nextSequenceNumber = stored + 1;
        }
        localStorage.setItem(SEQUENCE_NUMBER_STORAGE_KEY, nextSequenceNumber);
        return nextSequenceNumber;
    }

    /**
     * Get the last sent date from storage and gets the current date,
     * the former is the start time and the latter is the end time.
     *
     * @returns {Object} An object holding start and end times.
     */
    _getStartEndTimes() {
        let startTime = localStorage.getItem(LAST_SENT_DATE_KEY);
        if (!startTime) {
            startTime = (new Date()).toISOString();
        }

        let endTime = (new Date()).toISOString();
        localStorage.setItem(LAST_SENT_DATE_KEY, endTime);
        return {
            startTime,
            endTime,
        }
    }

    /**
     * Best effort to try and get os, browser and device type from UserAgent string.
     *
     * @returns {Object} And object holding the guessed os, browser and device types.
     */
    _getPlatformInfo() {
        function _guessOS(ua) {
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

        function _guessBrowser(ua) {
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

        function _guessDeviceType(ua) {
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

        // TODO: we should really have some "PlatformInfo" class that uses
        // UA when in a webpage and the WebExtentions APIs when in an addon.
        const ua = navigator.userAgent.toLowerCase();
        return {
            os: _guessOS(ua),
            browser: _guessBrowser(ua),
            deviceType: _guessDeviceType(ua),
        }
    }

    /**
     * This is shamelessly copied from https://stackoverflow.com/a/2117523/261698
     *
     * @returns {String} A randomly generated UUIDv4.
     */
    _getUUIDv4() {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }
}

module.exports = PingMaker



/***/ }),

/***/ "./src/private/EventMetricType.js":
/*!****************************************!*\
  !*** ./src/private/EventMetricType.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const glean = __webpack_require__(/*! ../glean */ "./src/glean.js");

class EventMetricType {
  constructor(category, name) {
    this.category = category;
    this.name = name;
  }

  async record(extra) {
    glean._eventStorage.record(Date.now(), this.category, this.name, extra);
  }
}

module.exports = EventMetricType;


/***/ }),

/***/ "./src/storage.js":
/*!************************!*\
  !*** ./src/storage.js ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { EVENT_STORAGE_KEY, MAX_EVENTS, EVENTS_PING_INTERVAL } = __webpack_require__(/*! ./constants */ "./src/constants.js");
const PingMaker = __webpack_require__(/*! ./ping_maker */ "./src/ping_maker.js");

/**
 * Represents the recorded data for a single event.
 */
class RecordedEvent {
    /**
     * Creates a new RecordedEvent.
     *
     * @param {Number} timestamp The timestamp of when the event was recorded. This allows to order events from a single process run.
     * @param {String} category The event's category. This is defined by users in the metrics file.
     * @param {String} name The event's name. This is defined by users in the metrics file.
     * @param {Object} extra A map of all extra data values. The set of allowed extra keys is defined by users in the metrics file.
     */
    constructor(timestamp, category, name, extra) {
        this.timestamp = timestamp;
        this.category = category;
        this.name = name;
        this.extra = extra;
    }

    /**
     * Serialize an event to JSON, adjusting its timestamp relative to a base timestamp.
     *
     * @param {Number} timestampOffset
     *
     * @returns {String} A JSON encoded string representing the serialized event.
     */
    serializeRelative(timestampOffset) {
        return {
            timestamp: this.timestamp - timestampOffset,
            category: this.category,
            name: this.name,
            extra: this.extra
        };
    }
}

class Storage {
    /**
     * Creates a new storage.
     *
     * @param {String} appId The app id where this instance of Glean is running
     */
    constructor(appId) {
        // Create an instance of the pingMaker to collect event when necessary.
        this._pingMaker = new PingMaker(appId);
        // Have a mirror of the events persisted in storage
        // so we don't need to make that trip everytime.
        this._events = this._getPersistedEvents();
        // The first event we get will be sent immediatelly,
        // other will be sent when MAX_EVENTS is reached or when we reach the end of an interval.
        this._atFirstEvent = true;
        // Set up an interval to send evenst periodically
        // TODO: Make sure using setInterval is not a terrible idea
        this._interval = setInterval(this._collectEvents, EVENTS_PING_INTERVAL);

        // If persisted events have reached limit, submit them
        if (this._events.length >= MAX_EVENTS) {
            this._collectEvents();
        }
    }

    /**
     * Records a new event in storage.
     *
     * @param {Number} timestamp The timestamp of when the event was recorded. This allows to order events from a single process run.
     * @param {String} category The event's category. This is defined by users in the metrics file.
     * @param {String} name The event's name. This is defined by users in the metrics file.
     * @param {Object} extra A map of all extra data values. The set of allowed extra keys is defined by users in the metrics file.
     */
    record(timestamp, category, name, extra) {
        this._pushEvent(new RecordedEvent(timestamp, category, name, extra));

        if (this._atFirstEvent) {
            this._collectEvents();
            this._atFirstEvent = false;
        }

    }

    /**
     * Collects currently stored events for uploading and clears storage.
     */
    _collectEvents() {
        if (this._events && this._events.length > 0) {
            // Do the actual collection
            this._pingMaker.collect(this._snapshot())
            // Clear stores
            this._events = []
            localStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify(this._events));
        }
    }

    /**
     * Gets a snapshot of the current events.
     *
     * @returns {Object} An representing all events stored, with timestamps relative to the first event.
     */
    _snapshot() {
        let snapshot = [];
        const firstTimestamp = this._events && this._events[0].timestamp;
        for (const event of this._events) {
            snapshot.push(event.serializeRelative(firstTimestamp));
        }
        return snapshot;
    }

    /**
     * Adds a new event to `this._events` and triggers ping collection
     * in case MAX_EVENTS has been reached.
     *
     * @param {RecordedEvent} event The event to persist
     */
    _pushEvent(event) {
        this._events.push(event);
        localStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify(this._events));

        if (this._events.length >= MAX_EVENTS) {
            this._collectEvents();
        }
    }

    /**
     * Get the persisted events from storage.
     *
     * @returns {String[]} The parsed array of events found in localStorage or an empty array.
     */
    _getPersistedEvents() {
        let persisted = localStorage.getItem(EVENT_STORAGE_KEY);
        if (!persisted) {
            return [];
        }

        try {
            let parsed = JSON.parse(persisted);
            return parsed.map(e => new RecordedEvent(e));
        } catch(e) {
            console.error(`Unable to parse Glean events from storage: ${e}`);
            localStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify([]));
            return [];
        }
    }
}

module.exports = Storage


/***/ }),

/***/ "./src/upload.js":
/*!***********************!*\
  !*** ./src/upload.js ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const {
    TELEMETRY_ENDPOINT,
    PENDING_PINGS_STORAGE_KEY,
    RECOVERABLE_UPLOAD_ERROR_TIMEOUT
} = __webpack_require__(/*! ./constants */ "./src/constants.js");

async function upload(pingId, payload) {
    const submissionUrl = `${TELEMETRY_ENDPOINT}submit/${this._appId}/events/1/${pingId}`;
    const request = {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Date": (new Date()).toISOString(),
            "X-Client-Type": "Glean.JS",
            "X-Client-Version": "0.0.1",
            "X-Debug-ID": "ninja-dx-webext"
        },
        body: JSON.stringify(payload),
        mode: "cors",
        cache: "default"
    };

    console.info(`Sending a new ping! ${pingId}\n`, JSON.stringify(request, null , 2));

    fetch(submissionUrl, request)
        .then(response => {
            switch (true) {
                // Success case
                case response.status >= 200 && response.status < 300:
                    console.info(`Ping submitted successfully ${pingId}`);
                    _deletePersistedPing(pingId);
                    break;
                // Unrecoverable error case
                case response.status >= 400 && response.status < 500:
                    console.error(`Unrecoverable error while submitting ping ${pingId}. Status code: ${response.status}`);
                    break;
                // Recorevable error case
                default:
                    console.warn(`Recoverable error while submitting ping ${pingId}. Status code: ${response.status}`);
                    setTimeout(() => upload(pingId, payload), RECOVERABLE_UPLOAD_ERROR_TIMEOUT);
            }
        })
        .catch(error => {
            // These are always recoverable since they are errors while trying to make the request.
            console.warn(`Recoverable error while submitting ping ${pingId}. Unable to perform request: ${error}`);
            setTimeout(() => upload(pingId, payload), RECOVERABLE_UPLOAD_ERROR_TIMEOUT);
        });
}

// TODO: This should really go in a shared "Storage" module used by both ping_maker and
// upload.
function _deletePersistedPing(pingId) {
    console.info(`Deleting ping ${pingId} from storage`);
    let pings = JSON.parse(localStorage.getItem(PENDING_PINGS_STORAGE_KEY)) || {};
    delete pings[pingId];
    localStorage.setItem(PENDING_PINGS_STORAGE_KEY, JSON.stringify(pings));
}

module.exports = upload


/***/ })

/******/ });
//# sourceMappingURL=glean.js.map