/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { EVENT_STORAGE_KEY, MAX_EVENTS, EVENTS_PING_INTERVAL } = require("./constants");
const PingMaker = require("./ping_maker");

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
