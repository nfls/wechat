module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = { exports: {} }; __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); if(typeof m.exports === "object") { Object.keys(m.exports).forEach(function(k) { __MODS__[modId].m.exports[k] = m.exports[k]; }); if(m.exports.__esModule) Object.defineProperty(__MODS__[modId].m.exports, "__esModule", { value: true }); } else { __MODS__[modId].m.exports = m.exports; } } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1536811616844, function(require, module, exports) {
/**
 * otplib
 *
 * @author Gerald Yeo <contact@fusedthought.com>
 * @version: 10.0.1
 * @license: MIT
 **/
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var hotp = _interopDefault(require('./hotp'));
var totp = _interopDefault(require('./totp'));
var authenticator = _interopDefault(require('./authenticator'));
var crypto = _interopDefault(require('crypto'));

authenticator.options = { crypto };
hotp.options = { crypto };
totp.options = { crypto };

exports.hotp = hotp;
exports.totp = totp;
exports.authenticator = authenticator;

}, function(modId) {var map = {"./hotp":1536811616845,"./totp":1536811616848,"./authenticator":1536811616849}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1536811616845, function(require, module, exports) {
/**
 * otplib-hotp
 *
 * @author Gerald Yeo <contact@fusedthought.com>
 * @version: 10.0.1
 * @license: MIT
 **/
'use strict';

var otplibCore = require('./core');

class HOTP {
  constructor() {
    this._options = this.defaultOptions;
  }
  getClass() {
    return HOTP;
  }
  get defaultOptions() {
    return {};
  }
  set options(opt = {}) {
    if (opt) {
      this._options = Object.assign({}, this._options, opt);
    }
  }
  get options() {
    return Object.assign({}, this._options);
  }
  get optionsAll() {
    return otplibCore.hotpOptions(this._options);
  }
  resetOptions() {
    this._options = this.defaultOptions;
    return this;
  }
  generate(secret, counter) {
    const opt = this.optionsAll;
    return otplibCore.hotpToken(secret || opt.secret, counter, opt);
  }
  check(token, secret, counter) {
    const opt = this.optionsAll;
    return otplibCore.hotpCheck(token, secret || opt.secret, counter, opt);
  }
  verify(opts) {
    if (typeof opts !== 'object' || opts == null) {
      return false;
    }
    return this.check(opts.token, opts.secret, opts.counter);
  }
}
HOTP.prototype.HOTP = HOTP;

var index = new HOTP();

module.exports = index;

}, function(modId) { var map = {"./core":1536811616846}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1536811616846, function(require, module, exports) {
/**
 * otplib-core
 *
 * @author Gerald Yeo <contact@fusedthought.com>
 * @version: 10.0.1
 * @license: MIT
 **/
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var otplibUtils = require('./utils');

function hotpCounter(counter) {
  const hexCounter = otplibUtils.intToHex(counter);
  return otplibUtils.leftPad(hexCounter, 16);
}

function hotpDigest(secret, counter, options) {
  if (!options.crypto || typeof options.crypto.createHmac !== 'function') {
    throw new Error('Expecting options.crypto to have a createHmac function');
  }
  if (typeof options.createHmacSecret !== 'function') {
    throw new Error('Expecting options.createHmacSecret to be a function');
  }
  if (typeof options.algorithm !== 'string') {
    throw new Error('Expecting options.algorithm to be a string');
  }
  const hmacSecret = options.createHmacSecret(secret, {
    algorithm: options.algorithm,
    encoding: options.encoding
  });
  const hexCounter = hotpCounter(counter);
  const cryptoHmac = options.crypto.createHmac(options.algorithm, hmacSecret);
  return cryptoHmac.update(new Buffer(hexCounter, 'hex')).digest();
}

function hotpToken(secret, counter, options) {
  if (counter == null) {
    return '';
  }
  if (typeof options.digits !== 'number') {
    throw new Error('Expecting options.digits to be a number');
  }
  const digest = hotpDigest(secret, counter, options);
  const offset = digest[digest.length - 1] & 0xf;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);
  let token = binary % Math.pow(10, options.digits);
  token = otplibUtils.leftPad(token, options.digits);
  return token;
}

function hotpCheck(token, secret, counter, options) {
  const systemToken = hotpToken(secret, counter, options);
  if (systemToken.length < 1) {
    return false;
  }
  return otplibUtils.isSameToken(token, systemToken);
}

function hotpSecret(secret, options) {
  if (typeof options.encoding !== 'string') {
    throw new Error('Expecting options.encoding to be a string');
  }
  return new Buffer(secret, options.encoding);
}

function hotpOptions(options = {}) {
  return Object.assign(
    {
      algorithm: 'sha1',
      createHmacSecret: hotpSecret,
      crypto: null,
      digits: 6,
      encoding: 'ascii'
    },
    options
  );
}

function totpCounter(epoch, step) {
  return Math.floor(epoch / step / 1000);
}

function totpToken(secret, options) {
  if (typeof options.epoch !== 'number') {
    throw new Error('Expecting options.epoch to be a number');
  }
  if (typeof options.step !== 'number') {
    throw new Error('Expecting options.step to be a number');
  }
  const counter = totpCounter(options.epoch, options.step);
  return hotpToken(secret, counter, options);
}

function totpCheck(token, secret, options) {
  const systemToken = totpToken(secret, options || {});
  if (systemToken.length < 1) {
    return false;
  }
  return otplibUtils.isSameToken(token, systemToken);
}

function createChecker(token, secret, opt) {
  const delta = opt.step * 1000;
  const epoch = opt.epoch;
  return (direction, start, bounds) => {
    for (let i = start; i <= bounds; i++) {
      opt.epoch = epoch + direction * i * delta;
      if (totpCheck(token, secret, opt)) {
        return i === 0 ? 0 : direction * i;
      }
    }
    return null;
  };
}
function getWindowBounds(opt) {
  const bounds = Array.isArray(opt.window)
    ? opt.window
    : [parseInt(opt.window, 10), parseInt(opt.window, 10)];
  if (!Number.isInteger(bounds[0]) || !Number.isInteger(bounds[1])) {
    throw new Error(
      'Expecting options.window to be an integer or an array of integers'
    );
  }
  return bounds;
}
function totpCheckWithWindow(token, secret, options) {
  let opt = Object.assign({}, options);
  const bounds = getWindowBounds(opt);
  const checker = createChecker(token, secret, opt);
  const backward = checker(-1, 0, bounds[0]);
  return backward !== null ? backward : checker(1, 1, bounds[1]);
}

function totpSecret(secret, options) {
  if (typeof options.algorithm !== 'string') {
    throw new Error('Expecting options.algorithm to be a string');
  }
  if (typeof options.encoding !== 'string') {
    throw new Error('Expecting options.encoding to be a string');
  }
  const encoded = new Buffer(secret, options.encoding);
  const algorithm = options.algorithm.toLowerCase();
  switch (algorithm) {
    case 'sha1':
      return otplibUtils.padSecret(encoded, 20, options.encoding);
    case 'sha256':
      return otplibUtils.padSecret(encoded, 32, options.encoding);
    case 'sha512':
      return otplibUtils.padSecret(encoded, 64, options.encoding);
    default:
      throw new Error(
        `Unsupported algorithm ${algorithm}. Accepts: sha1, sha256, sha512`
      );
  }
}

const defaultOptions = {
  createHmacSecret: totpSecret,
  epoch: null,
  step: 30,
  window: 0
};
function totpOptions(options = {}) {
  let opt = Object.assign(hotpOptions(), defaultOptions, options);
  opt.epoch = typeof opt.epoch === 'number' ? opt.epoch * 1000 : Date.now();
  return opt;
}

function totpTimeUsed(epoch, step) {
  return Math.floor(epoch / 1000) % step;
}

function timeRemaining(epoch, step) {
  return step - totpTimeUsed(epoch, step);
}

exports.hotpCheck = hotpCheck;
exports.hotpCounter = hotpCounter;
exports.hotpDigest = hotpDigest;
exports.hotpOptions = hotpOptions;
exports.hotpSecret = hotpSecret;
exports.hotpToken = hotpToken;
exports.totpCheck = totpCheck;
exports.totpCheckWithWindow = totpCheckWithWindow;
exports.totpCounter = totpCounter;
exports.totpOptions = totpOptions;
exports.totpSecret = totpSecret;
exports.totpTimeRemaining = timeRemaining;
exports.totpTimeUsed = totpTimeUsed;
exports.totpToken = totpToken;

}, function(modId) { var map = {"./utils":1536811616847}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1536811616847, function(require, module, exports) {
/**
 * otplib-utils
 *
 * @author Gerald Yeo <contact@fusedthought.com>
 * @version: 10.0.1
 * @license: MIT
 **/
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function hexToInt(hex) {
  return parseInt(hex, 16);
}

function intToHex(value) {
  return parseInt(value, 10).toString(16);
}

function isValidToken(value) {
  return /^(\d+)(\.\d+)?$/.test(value);
}
function isSameToken(token1, token2) {
  if (isValidToken(token1) && isValidToken(token2)) {
    return String(token1) === String(token2);
  }
  return false;
}

function leftPad(value, length) {
  const total = !length ? 0 : length;
  let padded = value + '';
  while (padded.length < total) {
    padded = '0' + padded;
  }
  return padded;
}

function padSecret(secretBuffer, size, encoding) {
  const secret = secretBuffer.toString(encoding);
  const len = secret.length;
  if (size && len < size) {
    const newSecret = new Array(size - len + 1).join(
      secretBuffer.toString('hex')
    );
    return new Buffer(newSecret, 'hex').slice(0, size);
  }
  return secretBuffer;
}

function removeSpaces(value = '') {
  if (value == null) {
    return '';
  }
  return value.replace(/\s+/g, '');
}

function secretKey(length, options = {}) {
  if (!length || length < 1) {
    return '';
  }
  if (!options.crypto || typeof options.crypto.randomBytes !== 'function') {
    throw new Error('Expecting options.crypto to have a randomBytes function');
  }
  return options.crypto
    .randomBytes(length)
    .toString('base64')
    .slice(0, length);
}

function setsOf(value, amount = 4, divider = ' ') {
  const num = parseInt(amount, 10);
  if (Number.isNaN(num) || typeof value !== 'string') {
    return '';
  }
  const regex = new RegExp('.{1,' + amount + '}', 'g');
  return value.match(regex).join(divider);
}

function stringToHex(value) {
  const val = value == null ? '' : value;
  let hex = '';
  let tmp = '';
  for (let i = 0; i < val.length; i++) {
    tmp = ('0000' + val.charCodeAt(i).toString(16)).slice(-2);
    hex += '' + tmp;
  }
  return hex;
}

exports.hexToInt = hexToInt;
exports.intToHex = intToHex;
exports.isSameToken = isSameToken;
exports.leftPad = leftPad;
exports.padSecret = padSecret;
exports.removeSpaces = removeSpaces;
exports.secretKey = secretKey;
exports.setsOf = setsOf;
exports.stringToHex = stringToHex;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1536811616848, function(require, module, exports) {
/**
 * otplib-totp
 *
 * @author Gerald Yeo <contact@fusedthought.com>
 * @version: 10.0.1
 * @license: MIT
 **/
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var otplibCore = require('./core');
var hotp = _interopDefault(require('./hotp'));

const HOTP = hotp.HOTP;
class TOTP extends HOTP {
  constructor() {
    super();
  }
  getClass() {
    return TOTP;
  }
  get defaultOptions() {
    return {
      epoch: null,
      step: 30,
      window: 0
    };
  }
  get optionsAll() {
    return otplibCore.totpOptions(this._options);
  }
  generate(secret) {
    const opt = this.optionsAll;
    return otplibCore.totpToken(secret || opt.secret, opt);
  }
  check(token, secret) {
    const delta = this.checkDelta(token, secret);
    return Number.isInteger(delta);
  }
  checkDelta(token, secret) {
    const opt = this.optionsAll;
    return otplibCore.totpCheckWithWindow(token, secret || opt.secret, opt);
  }
  verify(opts) {
    if (typeof opts !== 'object' || opts == null) {
      return false;
    }
    return this.check(opts.token, opts.secret);
  }
  timeRemaining() {
    const opt = this.optionsAll;
    return otplibCore.totpTimeRemaining(opt.epoch, opt.step);
  }
  timeUsed() {
    const opt = this.optionsAll;
    return otplibCore.totpTimeUsed(opt.epoch, opt.step);
  }
}
TOTP.prototype.TOTP = TOTP;

var index = new TOTP();

module.exports = index;

}, function(modId) { var map = {"./core":1536811616846,"./hotp":1536811616845}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1536811616849, function(require, module, exports) {
/**
 * otplib-authenticator
 *
 * @author Gerald Yeo <contact@fusedthought.com>
 * @version: 10.0.1
 * @license: MIT
 **/
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var base32 = _interopDefault(require('thirty-two'));
var otplibCore = require('./core');
var totp = _interopDefault(require('./totp'));
var otplibUtils = require('./utils');

function decodeKey(encodedKey) {
  return base32.decode(encodedKey).toString('hex');
}

function checkDelta(token, secret, options) {
  return otplibCore.totpCheckWithWindow(token, decodeKey(secret), options);
}

function check(token, secret, options) {
  const delta = checkDelta(token, secret, options);
  return Number.isInteger(delta);
}

function encodeKey(secret) {
  return base32
    .encode(secret)
    .toString()
    .replace(/=/g, '');
}

const data = '{service}:{user}?secret={secret}&issuer={service}';
function keyuri(user = 'user', service = 'service', secret = '') {
  const protocol = 'otpauth://totp/';
  const value = data
    .replace('{user}', user)
    .replace('{secret}', secret)
    .replace(/{service}/g, service);
  return protocol + value;
}

function token(secret, options) {
  return otplibCore.totpToken(decodeKey(secret), options);
}

const TOTP = totp.TOTP;
class Authenticator extends TOTP {
  constructor() {
    super();
  }
  getClass() {
    return Authenticator;
  }
  get defaultOptions() {
    return {
      encoding: 'hex',
      epoch: null,
      step: 30,
      window: 0
    };
  }
  encode(...args) {
    return encodeKey(...args);
  }
  decode(...args) {
    return decodeKey(...args);
  }
  keyuri(...args) {
    return keyuri(...args);
  }
  generateSecret(len = 20) {
    if (!len) {
      return '';
    }
    const secret = otplibUtils.secretKey(len, this.optionsAll);
    return encodeKey(secret);
  }
  generate(secret) {
    const opt = this.optionsAll;
    return token(secret || opt.secret, opt);
  }
  check(token$$1, secret) {
    const opt = this.optionsAll;
    return check(token$$1, secret || opt.secret, opt);
  }
  checkDelta(token$$1, secret) {
    const opt = this.optionsAll;
    return checkDelta(token$$1, secret || opt.secret, opt);
  }
}
Authenticator.prototype.Authenticator = Authenticator;
Authenticator.prototype.utils = {
  check,
  checkDelta,
  decodeKey,
  encodeKey,
  keyuri,
  token
};

var index = new Authenticator();

module.exports = index;

}, function(modId) { var map = {"./core":1536811616846,"./totp":1536811616848,"./utils":1536811616847}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1536811616844);
})()
//# sourceMappingURL=index.js.map