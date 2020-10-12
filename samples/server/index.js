
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This is copied over from https://expressjs.com/en/starter/hello-world.html

const express = require('express')
const app = express()
const port = 3000

const { test } = require('./metrics')

app.get('/', (_, res) => {
  res.send('Hey, everytime you reload this page it will record a Glean event! On the server!')
  test.record()
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
