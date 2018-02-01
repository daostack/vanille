import 'aurelia-polyfills';
import { Options } from 'aurelia-loader-nodejs';
import { globalize } from 'aurelia-pal-nodejs';
import * as path from 'path';
Options.relativeToDir = path.join(__dirname, 'unit');
// NOTE: we're manually including jsdom@v11.1.0 to workaround: https://github.com/aurelia/pal-nodejs/issues/24
globalize();
process.env.network = "test";
