/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Storage = require('../src/storage');
const constants = require ('../src/constants');

// JSDOM does not support crypto yet. Let's fake it.
const crypto = require('crypto');
Object.defineProperty(global.self, 'crypto', {
  value: {
    getRandomValues: arr => crypto.randomBytes(arr.length)
  }
});

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ }),
  })
);

afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
});

test('localStorage and _events are kept in sync', () => {
    const getLocalStorageEvents = () => {
        const contents = localStorage.getItem(constants.EVENT_STORAGE_KEY);
        if (contents) {
            try {
                return JSON.parse(contents);
            } catch {
                throw contents;
            }
        } else {
            return contents;
        }
    }
    const storage = new Storage();
    const submitSpy = jest.spyOn(storage, "_collectEvents");
    // Check that initial state is cleared for both storages
    expect(storage._events.length).toBe(0);
    expect(getLocalStorageEvents()).toBe(null);

    // Record the first event and be aware that this event will be submitted immediatelly.
    storage.record(Date.now(), "category", "name", { "extra": "key" });
    // Check that event was indeed submitted, just to be sure
    expect(submitSpy).toHaveBeenCalledTimes(1);
    // Check that stores are both clear after submitting the first event
    expect(storage._events.length).toBe(0);
    expect(getLocalStorageEvents().length).toBe(0);

    // Record some events, so taht something is stored
    storage.record(Date.now(), "category", "name", { "extra": "key" });
    storage.record(Date.now(), "category", "name", { "extra": "key" });
    storage.record(Date.now(), "category", "name", { "extra": "key" });
    // Check that stores are both hold the same amount of events
    expect(storage._events.length).toBe(3);
    expect(getLocalStorageEvents().length).toBe(3);
});

test('submits the first event immediatelly, and not the next ones', () => {
    const storage = new Storage();
    const submitSpy = jest.spyOn(storage, "_collectEvents");
    // Record three events, but only one of this should be immediatelly submitted
    storage.record(Date.now(), "category", "name", { "extra": "key" });
    storage.record(Date.now(), "category", "name", { "extra": "key" });
    storage.record(Date.now(), "category", "name", { "extra": "key" });

    // Check the ping was submitted
    expect(submitSpy).toHaveBeenCalledTimes(1);
    // Check that event submitted event is not in storage anymore
    expect(storage._events.length).toBe(2);
});

test('submits events when interval is reached, if there are events', () => {
    // Stub the interval constant, so that we don't have to wait too long on this test.
    const previousInterval = constants.EVENTS_PING_INTERVAL;
    constants.EVENTS_PING_INTERVAL = 3 * 1000; // 3s

    const storage = new Storage();
    // Record the first event before setting up the spy,
    // because it will trigger a _collectEvents that we don't care about
    storage.record(Date.now(), "category", "name", { "extra": "key" });

    const submitSpy = jest.spyOn(storage, "_collectEvents");
    // Record some events, so that we have something to submit when it is time
    storage.record(Date.now(), "category", "name", { "extra": "key" });
    storage.record(Date.now(), "category", "name", { "extra": "key" });
    storage.record(Date.now(), "category", "name", { "extra": "key" });

    // Check that nothing was submitted yet, we haven't reached the end of the interval
    expect(submitSpy).toHaveBeenCalledTimes(0);
    // All events should still be in storage
    expect(storage._events.length).toBe(3);
    setTimeout(() => {
        // Check that ping was submitted

        // Check that events storage was cleared
        expect(storage._events.length).toBe(0);
    }, constants.EVENTS_PING_INTERVAL)

    // Reset interval so as not to interfere with other tests
    constants.EVENTS_PING_INTERVAL = previousInterval;
});

test('submits events when limit is reached', () => {
    const storage = new Storage();
    // Record the first event before setting up the spy,
    // because it will trigger a _collectEvents that we don't care about
    storage.record(Date.now(), "category", "name", { "extra": "key" });

    const submitSpy = jest.spyOn(storage, "_collectEvents");
    // Submit the max number of events to trigger submission
    for (let i = 0; i < constants.MAX_EVENTS; i++) {
        storage.record(Date.now(), "category", "name", { "extra": "key" });
    }

    // Check that ping was submitted
    expect(submitSpy).toHaveBeenCalledTimes(1);
    // Check that events storage was cleared
    expect(storage._events.length).toBe(0);
});

test('gets persisted events on init', () => {
    const storage1 = new Storage();
    // Record the first event and be aware that this event will be submitted immediatelly.
    storage1.record(Date.now(), "category", "name", { "extra": "key" });

    // Record some events, so that we have something to persist when it is time
    storage1.record(Date.now(), "category", "name", { "extra": "key" });
    storage1.record(Date.now(), "category", "name", { "extra": "key" });
    storage1.record(Date.now(), "category", "name", { "extra": "key" });

    const storage2 = new Storage();
    const submitSpy = jest.spyOn(storage2, "_collectEvents");
    // Check that nothing was submitted, we are not at max
    expect(submitSpy).toHaveBeenCalledTimes(0);
    // Check that persisted events were loaded to _events
    expect(storage2._events.length).toBe(3);
});

test('correctly snapshots the storage', () => {
    const storage = new Storage();
    // Record the first event and be aware that this event will be submitted immediatelly.
    storage.record(Date.now(), "category", "name", { "extra": "key" });

    // Record some events, so that we have something to persist when it is time
    storage.record(Date.now(), "category", "name", { "extra": "key" });

    expect(storage._snapshot()[0].category).toBe("category");
    expect(storage._snapshot()[0].name).toBe("name");
    expect(storage._snapshot()[0].extra.extra).toBe("key");
});




