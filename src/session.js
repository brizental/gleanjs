/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const {
    SESSION_START_KEY,
    SESSION_ID_KEY,
    UTM_CAMPAIGN_KEY,
    MAX_INACTIVITY_TIME,
} = require("./constants");
const throttle = require('lodash.throttle');
const { UUIDv4 } = require('./utils');

/**
 * A session class to manage the current users section and act when a session is over.
 *
 * A session will when:
 *  1. After MAX_INACTIVITY_TIME of inactivity;
 *  2. On midnight (local time);
 *  3. If a new `utm_campaign` parameter is detected on the URL (this means the user was redirected to the current website by a different campaign);
 */
class Session {
    /**
     * Creates a new Session object.
     *
     * @param {Function} cb Callback to run everytime a session is over.
     */
    constructor(cb) {
        this._sessionId = this._getSessionId();
        this._startTime = this._getSessionStartTime();
        this._cb = cb;

        this._setTimeoutToResetAtMidnight();

        // Verify if we are over inactivity period and should reset the current session.
        const timeDelta = Date.now() - this._startTime;
        if (timeDelta > MAX_INACTIVITY_TIME) {
            this._startNewSession("init inactivity");
            return;
        }

        // Verify if we are coming from a different campaign.
        const currentCampaign = this._getCurrentUtmCampaign()
        if (currentCampaign && currentCampaign !== this._getLastUtmCampaign()) {
            this._startNewSession("campaign");
            return;
        }

        this._setTimeoutToResetOnInactivity(MAX_INACTIVITY_TIME - timeDelta);

        // Everytime we get user activity the inactivity timeout is reset.
        // I am considering activity, any click or key press on the page.
        document && document.addEventListener("click", () => this._setTimeoutToResetOnInactivity());
        document && document.addEventListener("keypress", () => this._setTimeoutToResetOnInactivity());
        window && window.addEventListener("scroll", throttle(() => this._setTimeoutToResetOnInactivity(), 1000));
    }

    /**
     * Returns the current session id.
     */
    id() {
        return this._sessionId;
    }

    /**
     * Set a timeout for ressetting this session at midnight,
     * when the timeout happens, another timeout is scheduled for midnight on the new day.
     */
    _setTimeoutToResetAtMidnight() {
        const milliseconsUntilMidnight = () => {
            const now = new Date();
            const midnightToday = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate() + 1,
                0, 0, 0
            );
            return midnightToday - now;
        }

        const startNewSession = () => {
            this._startNewSession("midnight");
            setTimeout(startNewSession, milliseconsUntilMidnight())
        };

        // Set a timeout to restart the session when we reach midnight.
        // This should never be cleared, we always want to re-start at midnight.
        setTimeout(startNewSession, milliseconsUntilMidnight());
    }

    /**
     * Set a timeout for reseting this session in MAX_INACTIVITY_TIME,
     * when the timeout happens, another timeout is immediatelly created.
     *
     * @param {Number} custom Optional custom backoff time
     *
     * @returns {Object} Returns the timeout set, we might want to cancel it.
     */
    _setTimeoutToResetOnInactivity(custom) {
        console.info("Reseting inactivity timeout!");

        const startNewSession = () => {
            this._startNewSession("inactivity");
            clearTimeout(this._resetOnInactivityTimeout);
            this._resetOnInactivityTimeout = setTimeout(startNewSession, MAX_INACTIVITY_TIME);
        }

        this._resetOnInactivityTimeout && clearTimeout(this._resetOnInactivityTimeout);
        this._resetOnInactivityTimeout = setTimeout(startNewSession, custom || MAX_INACTIVITY_TIME);
    }

    /**
     * Starts a new session.
     */
    _startNewSession(reason) {
        console.info(`Starting a new session due to ${reason}!`);
        this._cb(this._sessionId);

        localStorage.setItem(UTM_CAMPAIGN_KEY, this._getCurrentUtmCampaign());
        this._sessionId = this._getSessionId();
        this._startTime = this._getSessionStartTime();
        this._setTimeoutToResetOnInactivity();
    }

    /**
     * Gets the last sessions start time from storage,
     * in case nothing is stored will save current timestamp and store before returning.
     */
    _getSessionStartTime() {
        const stored = parseInt(localStorage.getItem(SESSION_START_KEY));
        if (isNaN(stored)) {
            return this._resetSessionStartTime();
        } else {
            return stored
        }
    }

    /**
     * Resets the current session's start time to now and updates storage.
     *
     * @returns {Number} The new calculated start time.
     */
    _resetSessionStartTime() {
        const newStartTime = Date.now();
        localStorage.setItem(SESSION_START_KEY, newStartTime);
        return newStartTime;
    }

    /**
     * Gets the last seen `utm_campaign` from storage.
     */
    _getLastUtmCampaign() {
        return localStorage.getItem(UTM_CAMPAIGN_KEY);
    }

    /**
     * Gets the value of the `utm_campaign` query param from the URL.
     *
     * @returns The value of the `utm_campaign` param or `null` if not present.
     */
    _getCurrentUtmCampaign() {
        const currentUrl = new URL(window.location.href);
        return currentUrl.searchParams.get("utm_campaign")
    }

    /**
     * Gets the sessionId from storage.
     */
    _getSessionId() {
        const stored = localStorage.getItem(SESSION_ID_KEY);
        if (!stored) {
            return this._resetSessionId();
        } else {
            return stored
        }
    }

    /**
     * Resets the current session id in storage.
     */
    _resetSessionId() {
        const newSessionId = UUIDv4();
        localStorage.setItem(SESSION_ID_KEY, newSessionId);
        return newSessionId;
    }
}

module.exports = Session
