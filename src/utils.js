/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { getItem, setItem } = require("storage")

 /**
 * This is shamelessly copied from https://stackoverflow.com/a/2117523/261698
 * and https://stackoverflow.com/questions/105034/how-to-create-guid-uuid
 *
 * @returns {String} A randomly generated UUIDv4.
 */
function UUIDv4() {
    if (typeof crypto !== "undefined") {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    } else {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

/**
 * This is samelessly copied from https://codeburst.io/throttling-and-debouncing-in-javascript-b01cad5c8edf
 *
 * Throttles a function call.
 */
function throttle (func, limit) {
    let inThrottle;
    return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

/**
 * Returns the persisted value and if nothing is persisted, saves and returns the default.
 *
 * @param {String} key The key where the element is saved in storage.
 * @param {String} def The default value
 *
 * @returns The persisted value
 */
function getItemWithDefault(key, def) {
    const persisted = getItem(key);
    if (persisted) {
        return persisted;
    } else {
        setItem(key, def);
        return def;
    }
}

/**
 * Updates a given value in storage and sets it to a default in case transformation fails.
 *
 * @param {String} key The key where the element is saved in storage.
 * @param {String} def The default value
 * @param {Function} update The transformation function to apply to the persisted value.
 *
 * @returns The updated value that was persisted
 */
function transformItemWithDefault(key, def, transform) {
    const persisted = getItemWithDefault(key, def);
    try {
        let updated = transform(persisted);
        setItem(key, updated)
        return updated
    } catch(e) {
        console.warn(`Unable to update item ${key} in storage. Setting to default.`);
        setItem(key, def);
        return def;
    }
}

module.exports = {
    UUIDv4,
    throttle,
    getItemWithDefault,
    transformItemWithDefault,
}
