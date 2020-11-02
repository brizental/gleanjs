⚠️ **WARNING** ⚠️

This project is a proof-of-concept. It's only purpose was to help the Glean team understand all the constraints and caveats of building an implementation of Glean that works on Javascript environments. The code here is ugly, untested and experimental. **DO NOT USE IT IN PRODUCTION**.

⚠️ **WARNING** ⚠️

# Glean.js

Pronounced (gleanjas)

# Installation

```bash
npm install
```

# Developing

When targetting browsers, use:

```bash
npm run dev
```

When targetting QML, use:

```bash
npm run dev.qml
```

The main difference between these two is the code that talks to the underlying storage implementation. QML does not have access to localStorage.

# Testing

```bash
npm test
```

## Manually testing the Webextension

1. Copy the output of the build step (i.e. `glean.js`) to `samples/webextension/`. This is required as it's not possible, from the manifest file, to directly reference `../../dist/glean.js`.
2. Load the extension in the browser (either Firefox or Chrome will work):

    a. **Firefox**: in a Nightly build, go to `about:debugging`, then "This Nightly" and click on "Load Temporary Add-on". Select the `manifest.json` file. Then, by clicking "Inspect", the DevTools for the add-on will appear.
    b. **Chrome**: go to `chrome://extensions/`, then click on "Load unpacked" and select the `samples/webextension` directory. Clicking on "Inspect views background page" will show the DevTools for the add-on.

# Building

When targetting browsers, use:

```bash
npm run build
```

When targetting QML, use:

```bash
npm run build.qml
```

The main difference between these two is the code that talks to the underlying storage implementation. QML does not have access to localStorage.
