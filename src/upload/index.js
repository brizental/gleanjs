/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 const {
    TELEMETRY_ENDPOINT,
    PENDING_PINGS_STORAGE_KEY,
    RECOVERABLE_UPLOAD_ERROR_TIMEOUT
} = require("../constants");
const { transformItemWithDefault } = require("../utils");

// The issue with this approach is that webpack wil bundle all of these even if they are not used.
let _fetch;
//  `fetch` will be available is most modern browsers.
if (typeof fetch === "function") {
    _fetch = fetch;
// `XMLHttpRequest` will be available is older browsers and Qt/QML apps.
} else if (typeof XMLHttpRequest === "function") {
    _fetch = require("./adapters/xhr");
// `process` is available on the Node.js environment.
// TODO: make sure this check is reliable, it's copied from axios: https://github.com/axios/axios/blob/master/lib/defaults.js#L21
} else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    _fetch = require("./adapters/http")
} else {
    throw Error("Unable to start Glean.js in the current environment. No known uploaders.")
}

function upload(appId, pingId, payload) {
    const submissionUrl = `${TELEMETRY_ENDPOINT}submit/${appId}/events/1/${pingId}`;
    const body = JSON.stringify(payload);
    const request = {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Content-Length": body.length,
            "Date": (new Date()).toISOString(),
            "X-Client-Type": "Glean.js",
            "X-Client-Version": "0.0.1",
            // "X-Debug-ID": "gleanjs-server-sample"
        },
        body,
        keepalive: true
    };

    console.info(`Sending a new ping! ${pingId}\n`, JSON.stringify(request, null , 2));

    return _fetch(submissionUrl, request)
        .then(response => {
            switch (true) {
                // Success case
                case response.status >= 200 && response.status < 300:
                    console.info(`Ping submitted successfully ${pingId}`);
                    _deletePersistedPing(pingId);
                    break;
                // Unrecoverable error case
                case response.status >= 400 && response.status < 500:
                    console.error(`Unrecoverable error while submitting ping ${pingId}. Status code: ${response.status}`);
                    _deletePersistedPing(pingId);
                    break;
                // Recorevable error case
                default:
                    console.warn(`Recoverable error while submitting ping ${pingId}. Status: ${response.status}\n`, response);
                    typeof setTimeout !== "undefined" && setTimeout(() => upload(appId, pingId, payload), RECOVERABLE_UPLOAD_ERROR_TIMEOUT);
            }
        })
        .catch(error => {
            // These are always recoverable since they are errors while trying to make the request.
            console.warn(`Recoverable error while submitting ping ${pingId}. Unable to perform request: ${JSON.stringify(error)}`);
            typeof setTimeout !== "undefined" && setTimeout(() => upload(appId, pingId, payload), RECOVERABLE_UPLOAD_ERROR_TIMEOUT);
        });
}

function _deletePersistedPing(pingId) {
    console.info(`Deleting ping ${pingId} from storage`);
    transformItemWithDefault(PENDING_PINGS_STORAGE_KEY, JSON.stringify({}), value => {
        let pings = JSON.parse(value);
        delete pings[pingId];
        return JSON.stringify(pings);
    });
}

module.exports = upload;
