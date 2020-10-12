/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = () => {
    // Possible OS values: https://nodejs.org/api/process.html#process_process_platform
    function _guessOS() {
        const platform = process.platform;
        if (platform === "win32") {
            return "Windows";
        } else if (platform === "darwin") {
            return "MacOS";
        } else if (platform === "linux" ) {
            return "Linux";
        } else if (platform === "android") {
            return "Android";
        }

        return "Unknown";
    }

    // Copied from: https://github.com/sindresorhus/os-locale/blob/master/index.js#L18
    function _guessLocale() {
        const env = process.env;
        return env.LC_ALL || env.LC_MESSAGES || env.LANG || env.LANGUAGE || "und";
    }

    function _guessArchitecture() {
        const env = process.env
        return env.MACHTYPE || env.HOSTTYPE || "Unknown";
    }

    return {
        os: _guessOS(),
        browser: "Node.js",
        deviceType: _guessOS() === "Android" ? "Mobile" : "Desktop",
        architecture: _guessArchitecture(),
        locale:  _guessLocale(),
    }
}
