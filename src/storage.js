/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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
        return JSON.stringify({
            timestamp: this.timestamp - timestampOffset,
            category: this.category,
            name: this.name,
            extra: this.extra
        });
    }
}

/**
 * The key to store glean events on localStorage.
 */
const EVENT_STORAGE_KEY = "gleanEvents"

/**
 * The maximum number of events to hold until it's time to flush.
 */
const MAX_EVENTS = 10;

/**
 * The interval in which to batch and send events.
 */
const EVENTS_PING_INTERVAL = 60 * 1000; // 5s

class Storage {
    /**
     * Creates a new Storage.
     */
    constructor() {
        this._events = this._getPersistedEvents();
        // The first event we get will be sent immediatelly,
        // other will be sent when MAX_EVENTS is reached or when we reach the end of an interval.
        this._atFirstEvent = true;
        // Set up an interval to send evenst periodically
        // TODO: Make sure using setInterval is not a terrible idea
        this._interval = setInterval(this._submitEvents, EVENTS_PING_INTERVAL);

        // If persisted events have reached limit, submit them
        if (this._events.length >= MAX_EVENTS) {
            this._submitEvents();
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
            this._submitEvents();
            this._atFirstEvent = false;
        }

    }

    /**
     * Submits currently stored events for uploading and clears storage.
     */
    _submitEvents() {
        if (this._events.length > 0) {
            // TODO: collect / submit code
            this._events = []
            localStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify(this._events));
        }
    }

    /**
     * Gets a snapshot of the current events.
     *
     * @returns {String} A JSON encoded string representing all events stored.
     */
    _snapshot() {
        let snapshot = [];
        const firstTimestamp = this._events && this._events[0].timestamp;
        for (const event of this._events) {
            snapshot.push(event.serializeRelative(firstTimestamp));
        }
        return JSON.stringify(snapshot);
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
            this._submitEvents();
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

module.exports = {
    Storage,
    // Constants exported for testing
    EVENT_STORAGE_KEY,
    EVENTS_PING_INTERVAL,
    MAX_EVENTS
}
