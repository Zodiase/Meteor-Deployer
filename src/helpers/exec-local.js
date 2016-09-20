'use strict';

const child_process = require('child_process');
const log = require('./log.js'),
      escq = require('./escape.js');

/**
 * Execute one or multiple commands locally.
 * @param {string|Array.<string>} cmd - One command string or multiple command strings in an array.
 * @param {object} options - See below.
 * @param {string} options.cwd - Work directory for `child_process.execSync`.
 * @param {string} options.log - Path for the local log file.
 * @param {boolean} options.stdout - Whether to print the commands to stdout.
 * @return {string} - Result from stdout.
 */
module.exports = (cmd, options) => {

  const cmdAry = Array.isArray(cmd) ? Array.prototype.slice.call(cmd) : [cmd],
        opts = typeof options === 'object' && options
          ? options
          : {},
        cmdDelimiter = ` && \\\n`;
  const nakedCmdString = cmdAry.join(cmdDelimiter);
  let cmdString = nakedCmdString;

  if (opts.log) {

    // Write commands to the log file.
    log(`\$ ${nakedCmdString}`, opts.log, Boolean(opts.stdout));
    // Dump the output of the whole command to the log file.
    cmdString = `${nakedCmdString} \\\n| tee -a ${escq(opts.log)}`;

  }

  return child_process.execSync(cmdString, {
    cwd: opts.cwd
  });

};
