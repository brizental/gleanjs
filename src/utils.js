/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = {
    /**
     * This is shamelessly copied from https://stackoverflow.com/a/2117523/261698
     *
     * @returns {String} A randomly generated UUIDv4.
     */
    UUIDv4() {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    },

    /**
     * This is samelessly copied from https://codeburst.io/throttling-and-debouncing-in-javascript-b01cad5c8edf
     *
     * Throttles a function call.
     */
    throttle (func, limit) {
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
}
