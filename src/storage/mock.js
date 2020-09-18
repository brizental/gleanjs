/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Interface for a key-value testing storage.
 */

store = {}

module.exports = {
    getItem(key) {
        return store[key] || null;
    },

    setItem(key, value) {
        return store[key] = value;
    }
}
