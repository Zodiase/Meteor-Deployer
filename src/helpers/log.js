'use strict';

const fs = require('fs');

/**
 * Log the given arguments to the log file specified by the last argument.
 * If the last argument is a boolean value, it will be used to decide whether or not to
 *   output the same log to stdout, while the second to last will be the log file.
 * @return {void}
 */
module.exports = function log () {

  const args = Array.prototype.slice.call(arguments),
        toStdOut = typeof args[args.length - 1] === 'boolean'
          ? args.pop()
          : false,
        logFile = args.pop(),
        logString = args.join(', ');

  if (logFile) {

    fs.appendFileSync(logFile, `${logString}\n`, 'utf8');

  }

  if (!logFile || toStdOut) {

    /*eslint no-console: "off"*/
    console.log.apply(console, args);

  }

};
