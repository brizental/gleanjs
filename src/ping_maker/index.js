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
} = require("../constants");
const upload = require("../upload");
const { UUIDv4, transformItemWithDefault, getItemWithDefault } = require("../utils");
const { setItem } = require("storage");
const getPlatformInfo = require("platform");

/**
 * A helper class to collect and send pings for uploading.
 */
class PingMaker {
    constructor(appId) {
        this._appId = appId;

        // Upload outstanding pings from the last run
        this._uploadPersistedPings();

        // Preload all the info that doesn't change.
        this._clientId = this._getClientId();
        this._firstRunDate = this._getFirstRunDate();

        const { os, browser, deviceType, architecture, locale } = getPlatformInfo();
        this._os = os;
        this._browser = browser;
        this._deviceType = deviceType;
        this._architecture = architecture;
        this._locale = locale;


        const setMetricsThatRequireWindow = () => {
            this._referrer = document.referrer;
            this._pageTitle = document.title;
            this._pagePath = window.location.pathname;
        }
        typeof document !== "undefined" &&
            window.addEventListener('load', setMetricsThatRequireWindow);
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
        upload(this._appId, pingId, pingBody);
    }

    /**
     * Adds a metrics section to the pings with the additional web app specific metrics.
     */
    _buildMetricsSection(sessionId) {
        let baseMetrics =  {
                string: {
                    "glean.platform.browser": this._browser,
                    "glean.platform.device_type": this._deviceType,
                }
        }

        if (sessionId) {
            baseMetrics["uuid"] = {
                "glean.session.session_id": sessionId
            }
        }

        if (typeof document !== "undefined") {
            baseMetrics["string"] = {
                "glean.platform.browser": this._browser,
                "glean.platform.device_type": this._deviceType,
                // These strings are all arbitrarily long
                // and the Glean schema only accepts strings up to 100 characters.
                "glean.page.referrer": this._referrer && this._referrer.slice(0, 100),
                "glean.page.title": this._pageTitle && this._pageTitle.slice(0, 100),
                "glean.page.path": this._pagePath && this._pagePath.slice(0, 100),
            }
        }

        return baseMetrics
    }

    /**
     * Uploads the persisted pings from storage and clears storage.
     */
    _uploadPersistedPings() {
        transformItemWithDefault(PENDING_PINGS_STORAGE_KEY, JSON.stringify({}), value => {
            let pings = JSON.parse(value);
            for (const pingId in pings) {
                upload(this._appId, pingId, pings[pingId]);
            }
            return JSON.stringify({});
        })
    }

    /**
     * Adds a new ping to storage.
     *
     * @param {String} pingId The id of the ping to persist
     * @param {Object} pingBody Te body of the ping to persist
     */
    _pushPing(pingId, pingBody) {
        transformItemWithDefault(PENDING_PINGS_STORAGE_KEY, JSON.stringify({}), value => {
            let pings = JSON.parse(value);
            pings[pingId] = pingBody;
            return JSON.stringify(pings);
        });
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
            locale: this._locale
        };

        // Attempt to fetch the addon version, if we're a
        // webextension.
        var browser =
            (typeof browser !== "undefined") ? browser : (typeof chrome !== "undefined" ? chrome : {});
        if (typeof browser.runtime !== "undefined" && typeof browser.runtime.getManifest !== undefined) {
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
        return getItemWithDefault(CLIENT_ID_KEY, UUIDv4());
    }

    /**
     * Get the first run date from storage or create a new one and store it.
     *
     * @returns {String} The stored first run date.
    */
    _getFirstRunDate() {
        return getItemWithDefault(FIRST_RUN_DATE_KEY, (new Date()).toISOString());
    }

    /**
     * Calculates the next sequence number and updates storage with it.
     *
     * @returns {Number} The next sequence number.
    */
    _getNextSequenceNumber() {
        return transformItemWithDefault(SEQUENCE_NUMBER_STORAGE_KEY, 0, value => {
            const lastSeqNumber = parseInt(value);
            if (isNaN(lastSeqNumber)) throw "Stored sequence number is not a number!"
            return lastSeqNumber + 1
        });
    }

    /**
     * Get the last sent date from storage and gets the current date,
     * the former is the start time and the latter is the end time.
     *
     * @returns {Object} An object holding start and end times.
     */
    _getStartEndTimes() {
        let startTime = getItemWithDefault(LAST_SENT_DATE_KEY, (new Date()).toISOString());
        let endTime = (new Date()).toISOString();
        setItem(LAST_SENT_DATE_KEY, endTime);
        return {
            startTime,
            endTime,
        }
    }
}

module.exports = PingMaker
