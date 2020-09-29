/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { UUIDv4 } = require('../utils');

class Session {
    constructor() {
        this._sessionId = UUIDv4();
    }

    id() {
        return this._sessionId
    }
}

module.exports = Session
