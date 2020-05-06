const crypto = require('crypto');

/**
 * linux timestamp
 */
exports.ts = () => Math.floor(new Date().getTime() / 1000);

/**
 * md5 string with salt
 */
exports.authcode = (str, salt) => crypto.createHash('md5').update(`${salt}/${str}`).digest('hex');

/**
 * Convert an array of objects to a single object
 */
exports.arr2Obj = (arr, identifier) => arr.reduce((a, b) => ({ ...a, [b[identifier]]: b }), {});

/**
 * Check if a value is a number
 */
exports.isNumber = value => !isNaN(parseFloat(value)) && isFinite(value);

/**
 * Wait for an amount of milliseconds
 */
exports.sleep = async (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
