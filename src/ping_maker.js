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
} = require("./constants");
const upload = require("./upload");
const { UUIDv4 } = require("./utils");

/**
 * A helper class to collect and send pings for uploading.
 */
class PingMaker {
    constructor(appId) {
        // Upload outstanding pings from the last run
        this._uploadPersistedPings();

        this._appId = appId;
        // Preload all the info that doesn't change.
        this._clientId = this._getClientId();
        this._firstRunDate = this._getFirstRunDate();

        const { os, browser, deviceType } = this._getPlatformInfo();
        this._os = os;
        this._browser = browser;
        this._deviceType = deviceType;

        const setMetricsThatRequireWindow = () => {
            this._referrer = document && document.referrer;
            this._pageTitle = document && document.title;
            this._pagePath = window && window.location.pathname;
        }
        window && window.addEventListener('load', setMetricsThatRequireWindow);

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
     * @param {Object[]} events An array of event objects
     * @param {String} sessionId The id of the current session
     *
     * @returns {String} The ping payload (adding this here just until we got the uploader)
     */
    collect(events, sessionId) {
        if (events && events.length > 0) {
            const pingId = UUIDv4();
            console.info(`Collecting a new ping! ${pingId}`);
            const pingBody = {
                client_info: this._buildClientInfo(),
                ping_info: this._buildPingInfo(),
                events,
                metrics: this._buildMetricsSection(sessionId),
            };
    
            this._pushPing(pingId, pingBody);

            // Trigger upload for the newly collected ping
            upload(pingId, pingBody);
        } else {
            console.info("Attempted to collect a new ping but there are no events to collect at this moment. Bailing out.")
        }
    }

    /**
     * Adds a metrics section to the pings with the additional web app specific metrics.
     */
    _buildMetricsSection(sessionId) {
        let baseMetrics =  {
                uuid: {
                    "session.session_id": sessionId
                },
                string: {
                    "platform.browser": this._browser,
                    "platform.device_type": this._deviceType,
                }
        }

        if (document) {
            baseMetrics["string"] = {
                ...baseMetrics["string"],
                // These strings are all arbitrarily long
                // and the Glean schema only accepts strings up to 100 characters.
                "page.referrer": this._referrer.slice(0, 100),
                "page.title": this._pageTitle.slice(0, 100),
                "page.path": this._pagePath.slice(0, 100),
            }
        }

        return baseMetrics
    }

    /**
     * Uploads the persisted pings from storage.
     */
    _uploadPersistedPings() {
        let persisted = localStorage.getItem(PENDING_PINGS_STORAGE_KEY);
        if (!persisted) {
            // If no storage is initiated means this is the first time we are running glean.
            localStorage.setItem(PENDING_PINGS_STORAGE_KEY, JSON.stringify({}));
            return;
        }

        try {
            let pings = JSON.parse(persisted);
            for (const pingId in pings) {
                upload(pingId, pings[pingId]);
            }
        } catch(e) {
            console.error(`Unable to parse Glean pings from storage: ${e}`);
            localStorage.setItem(PENDING_PINGS_STORAGE_KEY, JSON.stringify({}));
        }
    }

    /**
     * Adds a new ping to storage.
     *
     * @param {String} pingId The id of the ping to persist
     * @param {Object} pingBody Te body of the ping to persist
     */
    _pushPing(pingId, pingBody) {
        try {
            let pings = JSON.parse(localStorage.getItem(PENDING_PINGS_STORAGE_KEY));
            pings[pingId] = pingBody;
            localStorage.setItem(PENDING_PINGS_STORAGE_KEY, JSON.stringify(pings));
        } catch {
            console.error("Unable to parse pending ping storage, clearing pending pings.");
            localStorage.setItem(PENDING_PINGS_STORAGE_KEY, JSON.stringify({}));
        }
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
        let info = {
            app_build: "Unknown",
            app_display_version: "Unknown",
            architecture: "Unknown",
            client_id: this._clientId,
            first_run_date: this._firstRunDate,
            os: this._os,
            os_version: "Unknown",
            telemetry_sdk_build: TELEMETRY_SDK_BUILD,
            locale: this.locale
        };

        // Attempt to fetch the addon version, if we're a
        // webextension.
        var browser =
            (typeof browser !== "undefined") ? browser : (typeof chrome !== "undefined" ? chrome : null);
        if (browser) {
            info.app_display_version = browser.runtime.getManifest().version;
        }

        return info;
    }

    /**
     * Get the client id from storage or create a new one and store it.
     *
     * @returns {String} The stored client_id.
    */
    _getClientId() {
        let stored = localStorage.getItem(CLIENT_ID_KEY);
        if (!stored) {
            let newClientId = UUIDv4();
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
}

module.exports = PingMaker

