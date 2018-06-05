import 'aurelia-polyfills';
import { Options } from 'aurelia-loader-nodejs';
import { globalize } from 'aurelia-pal-nodejs';
import * as path from 'path';
Options.relativeToDir = path.join(__dirname, 'unit');
/**
 * NOTE: we're using a strict set of test package versions because they
 * appear to be easily broken by newer versions. 
 * Here is one example: https://github.com/aurelia/pal-nodejs/issues/24
 * So if we ever want to upgrade test-related packages, it is recommended
 * to do so carefully, one-at-a-time, rerunning the tests as you go.
 */
globalize();
