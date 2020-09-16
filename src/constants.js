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
    TELEMETRY_ENDPOINT: "https://incoming.telemetry.mozilla.org/",

    /**
     * The amount of time to wait before retrying on a recoverable error.
     */
    RECOVERABLE_UPLOAD_ERROR_TIMEOUT: 60 * 1000, // 1min
}
