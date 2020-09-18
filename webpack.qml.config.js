/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 const path = require('path');

 module.exports = {
   entry: './src/index.js',
   output: {
     filename: 'glean.js',
     path: path.resolve(__dirname, 'dist'),
     library: 'Glean',
     // This config makes the Glean object a global `var`.
     // See: https://webpack.js.org/guides/author-libraries/
     libraryTarget: 'var'
   },
   // Do not use `eval` for source maps in dev, so that the
   // generated output could be used.
   devtool: "source-map",
   resolve: {
     alias: {
       storage$: path.resolve(__dirname, 'src/storage/qml.js'),
     }
   }
 };
