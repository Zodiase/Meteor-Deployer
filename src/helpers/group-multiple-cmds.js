'use strict';

const cmdDelimiter = `\n`;

/**
 * Group multiple lines of commands as one.
 * @param {string|Array.<string>} cmd - One command string or multiple command strings in an array.
 * @return {string} - Grouped command string.
 */
module.exports = (cmd) => `(${(Array.isArray(cmd) ? Array.prototype.slice.call(cmd) : [cmd]).join(cmdDelimiter)})`;
