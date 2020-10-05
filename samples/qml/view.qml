/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import QtQuick 2.0
import QtQuick.Controls 2.0

// These are all used inside glean.js
import QtQuick.LocalStorage 2.0
import QtQml 2.15

// Even though GleanInstance will only be used inside metrics.js,
// we need to import it here because otherwise glean.js doesn't
// have access to LocalStorage and QtQml.
import "../../dist/glean.js" as GleanInstance;
import "./metrics.js" as Glean;

Rectangle {
    id: screen
    width: 490; height: 490

    Button {
        text: "Record something!"
        anchors.centerIn: parent
        onClicked: Glean.Metrics.test.record()
    }
}
