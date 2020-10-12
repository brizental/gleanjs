/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = () => {
    // The possible values for OS here are listed at https://doc.qt.io/qt-5/qml-qtqml-qt.html#platform-prop
    function _guessOS() {
        const os = Qt.platform.os;
        if (os === "windows") {
            return "Windows";
        } else if (os === "osx") {
            return "MacOS";
        } else if (os === "linux") {
            return "Linux";
        } else if (os === "ios") {
            return "iOS";
        } else if (os === "android") {
            return "Android";
        }

        return "Unknown";
    }

    return {
        os: _guessOS(),
        browser: "QML",
        // We could maybe guess the device type by the screen width,
        // but let's leave it hardcoded as Desktop for now.
        deviceType: "Desktop",
        architecture: "Unkown",
        locale: Qt.locale().name,
    }
}
