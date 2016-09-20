#!/usr/bin/env node

'use strict';

try {
  require('../src/meteord.js');
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
