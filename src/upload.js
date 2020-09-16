/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const {
    TELEMETRY_ENDPOINT,
    PENDING_PINGS_STORAGE_KEY,
    RECOVERABLE_UPLOAD_ERROR_TIMEOUT
} = require("./constants");

async function upload(pingId, payload) {
    const submissionUrl = `${TELEMETRY_ENDPOINT}submit/${this._appId}/events/1/${pingId}`;
    const request = {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Date": (new Date()).toISOString(),
            "X-Client-Type": "Glean.JS",
            "X-Client-Version": "0.0.1",
            // "X-Debug-ID": "ninja-dx-test-brizental"
        },
        body: JSON.stringify(payload),
        mode: "cors",
        cache: "default"
    };

    console.info(`Sending a new ping! ${pingId}\n`, JSON.stringify(request, null , 2));

    fetch(submissionUrl, request)
        .then(response => {
            switch (true) {
                // Success case
                case response.status >= 200 && response.status < 300:
                    console.info(`Ping submitted successfully ${pingId}`);
                    _deletePersistedPing(pingId);
                // Unrecoverable error case
                case response.status >= 400 && response.status < 500:
                    console.error(`Unrecoverable error while submitting ping ${pingId}. Status code: ${response.status}`);
                    _onUploadUnrecoverableError();
                // Recorevable error case
                default:
                    console.warn(`Recoverable error while submitting ping ${pingId}. Status code: ${response.status}`);
                    setTimeout(() => upload(pingId, payload), RECOVERABLE_UPLOAD_ERROR_TIMEOUT);
            }
        })
        .catch(error => {
            // These are always recoverable since they are errors while trying to make the request.
            console.warn(`Recoverable error while submitting ping ${pingId}. Unable to perform request: ${error}`);
            setTimeout(() => upload(pingId, payload), RECOVERABLE_UPLOAD_ERROR_TIMEOUT);
        });
}

function _deletePersistedPing(pingId) {
    console.info(`Deleting ping ${pingId} from storage`);
    const pings = JSON.parse(localStorage.getItem(PENDING_PINGS_STORAGE_KEY));
    delete pings[pingId];
    localStorage.setItem(PENDING_PINGS_STORAGE_KEY, pings);
}

module.exports = upload
