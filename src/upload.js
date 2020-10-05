/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const {
    TELEMETRY_ENDPOINT,
    PENDING_PINGS_STORAGE_KEY,
    RECOVERABLE_UPLOAD_ERROR_TIMEOUT
} = require("./constants");
const { transformItemWithDefault } = require("./utils");

function upload(appId, pingId, payload) {
    const submissionUrl = `${TELEMETRY_ENDPOINT}submit/${appId}/events/1/${pingId}`;
    const request = {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Date": (new Date()).toISOString(),
            "X-Client-Type": "Glean.JS",
            "X-Client-Version": "0.0.1",
            "X-Debug-ID": "glinja-svelte-sample"
        },
        body: JSON.stringify(payload),
        keepalive: true
    };

    console.info(`Sending a new ping! ${pingId}\n`, JSON.stringify(request, null , 2));

    const f = typeof fetch !== "undefined" ? fetch : fetchPolyfill;
    return f(submissionUrl, request)
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
                    console.warn(`Recoverable error while submitting ping ${pingId}. Status: ${response.status}\n`, response.response);
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

function fetchPolyfill(url, request) {
    return new Promise((resolve, reject) => {
        const req = new XMLHttpRequest();

        req.open('POST', url);
        // Pipeline will reject if this header is not present.
        req.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        for (const header in request.headers) {
            req.setRequestHeader(header, request.headers[header]);
        }

        req.onerror = () => reject(req);
        req.onload = () => resolve(req);
        req.send(request.body);
    });
}

module.exports = upload;
