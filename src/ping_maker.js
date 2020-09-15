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
        const pings = JSON.parse(localStorage.getItem(PENDING_PINGS_STORAGE_KEY));
        pings[pingId] = pingBody;
        localStorage.setItem(PENDING_PINGS_STORAGE_KEY, JSON.stringify(pings));
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

