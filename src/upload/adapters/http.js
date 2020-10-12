/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const https = require("https");

module.exports = (url, request) => {
    return new Promise((resolve, reject) => {
        const _url = new URL(url);

        delete request.keepalive;
        request.hostname = _url.host;
        request.path = _url.pathname;

        const req = https.request(request, res => {
            res.on("data", () => {
                resolve(res);
                req.end();
            })
            res.on("error", err => {
                reject(err);
                req.end();
            })
        });

        req.on('error', err => {
            reject(err);
            req.end();
        });
    });
}
