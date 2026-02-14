#!/usr/bin/env node

import { CLI } from './index';

const cli = new CLI();
cli.run(process.argv.slice(2));
