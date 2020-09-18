/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Interface for the localStorage,
 * a key-value store that is available on browser environments.
 */

module.exports = {
    getItem(key) {
        return localStorage.getItem(key);
    },

    setItem(key, value) {
        return localStorage.setItem(key, value);
    }
}
