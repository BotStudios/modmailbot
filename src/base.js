const { EventEmitter } = require('node:events');
const config = require('./config.js');
const uniqBy = require('lodash/uniqBy');
const error = require('./errors.js');

class Base extends EventEmitter {
    constructor() {
    super();
    this._ = uniqBy;
    this.error = error;
    this.config = config;
    }
}

module.exports = Base;
