const assert = require('assert');
const DB = require('./utils/mysql');
const Redis = require('./utils/redis');

class Service {
  constructor(ctx) {
    this.ctx = ctx;
  }

  get DB() {
    return DB;
  }

  get Redis() {
    return Redis;
  }

  get cursor() {
    assert(this.table, 'invalid table');
    return this.DB.table(this.table);
  }

  service(name) {
    assert(this.ctx.app.services[name], 'invalid service');
    return new this.ctx.app.services[name](this.ctx);
  }

}

module.exports = Service;