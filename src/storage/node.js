/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const level = require("level")

const STORE_NAME = "Glean";

class Store {
    constructor () {
        this._db = level(STORE_NAME);
    }

    getItem(key) {
        let value;
        this._db.get(key, (err, val) => {
            if (err) {
                console.error(`Error while trying to get ${key}=${val}`);
                value = null;
            } else {
                console.log(`Getting ${key}=${val}`);
                value = val;
            }
        });
        return value;
    }

    setItem(key, value) {
        this._db.put(key, value, err => {
            if (err) {
                console.error(`I/O error while trying to persist ${key}=${value}`);
            }
        })


    }
}

// Store Singleton!
const StoreInstance = new Store();

module.exports = {
    getItem(key) {
        return StoreInstance.getItem(key);
    },

    setItem(key, value) {
        console.log(key, value)
        StoreInstance.setItem(key, value);
    }
};
