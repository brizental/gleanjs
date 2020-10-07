/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = (url, request) => {
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
