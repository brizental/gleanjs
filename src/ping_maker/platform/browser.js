/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = () => {
    function _guessOS(ua) {
        if (ua.indexOf("win") != -1) {
            return "Windows";
        } else if (ua.indexOf("mac") != -1) {
            return "MacOS";
        } else if (ua.indexOf("linux") != -1 ) {
            return "Linux";
        } else if (ua.indexOf("ios") != -1) {
            return "iOS";
        } else if (ua.indexOf("android") != -1) {
            return "Android";
        }

        return "Unknown";
    }

    function _guessBrowser(ua) {
        if (ua.indexOf("firefox") != -1) {
            return "Firefox";
        } else if (ua.indexOf("opera") != -1) {
            return "Opera";
        } else if (ua.indexOf("chrome") != -1 ) {
            return "Chrome";
        } else if (ua.indexOf("safari") != -1) {
            return "Safari";
        } else if (ua.indexOf("edge") != -1) {
            return "Edge";
        } else if (ua.indexOf("ie") != -1) {
            return "IE";
        }

        return "Unknown";
    }

    function _guessDeviceType(ua) {
        if (ua.indexOf("tablet") != -1) {
            return "Tablet";
        }

        if (ua.indexOf("android") != -1) {
            if (ua.indexOf("mobi") != -1) {
                return "Mobile";
            } else {
                // If it's Android and is not a phone, it's probably a tablet.
                return "Tablet";
            }
        }

        return "Desktop";
    }

    function _guessLocale() {
        try {
            return navigator.language;
        } catch(_) {
            return "und";
        }
    }

    // TODO: we should really have some "PlatformInfo" class that uses
    // UA when in a webpage and the WebExtentions APIs when in an addon.
    if (typeof navigator !== "undefined") {
        const ua = navigator.userAgent.toLowerCase();
        return {
            os: _guessOS(ua),
            browser: _guessBrowser(ua),
            deviceType: _guessDeviceType(ua),
            architecture: "Unknown",
            locale: _guessLocale(),
        }
    } else {
        return {
            os: "Unknown",
            browser: "Unknown",
            deviceType: "Unknown",
            architecture: "Unknown",
            locale:  _guessLocale(),
        }
    }
}
