/*
 Copyright 2020 Google Inc. All Rights Reserved.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

// const express = require('express');


// const app = express();

// app.use(express.static('./'));

// app.get('/', function(request, response) {
//   // Parse the UA string to determine modulepreload support.
//   const ua = uaParser(request.headers['user-agent']);

//   const manifest = fs.readJsonSync(
//       path.join(pkg.config.publicDir, 'manifest.json'));

//   const modulepreload = fs.readJsonSync(
//       path.join(pkg.config.publicDir, 'modulepreload.json'));

//   const templateData = {
//     manifest,
//     modulepreload,
//     browserSupportsModulePreload: ua.engine.name === 'Blink',
//     ENV: process.env.NODE_ENV || 'development',
//   };

//   response.send(nunjucks.render('views/index.html', templateData));
// });

/*
 Copyright 2019 Google Inc. All Rights Reserved.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

const bodyParser = require('body-parser');
const express = require('express');
const fs = require('fs-extra');
const nunjucks = require('nunjucks');


const BEACON_FILE = 'test/beacons.log';
const app = express();

nunjucks.configure('./test/views/', {noCache: true});

// Turn off all caching for tests.
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-cache');
  next();
});

// Allow the use of a `delay` query param to delay any response.
app.use((req, res, next) => {
  if (req.query && req.query.delay) {
    setTimeout(next, req.query.delay);
  } else {
    next();
  }
});

// Add a "collect" endpoint to simulate analytics beacons.
app.post('/collect', bodyParser.text(), (req, res) => {
  fs.appendFileSync(BEACON_FILE, req.body + '\n');
  res.end();
});

app.get('/test/:view', function(req, res) {
  res.send(nunjucks.render(`${req.params.view}.njk`));
});

app.use(express.static('./'));

const listener = app.listen(process.env.PORT || 9090, () => {
  fs.ensureFileSync(BEACON_FILE);
  console.log(`Server running:\nhttp://localhost:${listener.address().port}`);
});