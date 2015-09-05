"use strict";

import {Admin} from '../models';
import config from 'config';
var parse = require('co-body');
import redis from '../../lib/redis';
import crypto from 'crypto';
import _ from 'lodash';

var debug = require('debug')('bz:app:controllers:sign:');

var UCPaas = require('ucpaas');

var ucpaas = UCPaas(config.ucpaas);

const prefix = 'admin_sms_';
const verify_state = 'admin_verified';

function magicNum(len) {
  var nums = [];
  for (var i = 0; i < len; i++) {
    nums.push(Math.floor(Math.random() * 10));
  }
  return nums.join('');
}

function hashStr(str) {
  var hasher = crypto.createHash("md5");
  hasher.update(str);
  var hash_pass = hasher.digest("hex");
  return hash_pass;
}


export default {

  toSign: function*() {
    this.body = yield this.render('login/login', {
      register: {}
    });
  },

  send_sms: function*() {

    debug('start send sms');

    var attr = yield parse.json(this);

    debug('attr: ', attr);


    this.body = {
      status: 200,
      message: 'success'
    }
  },


  verify_sms: function*() {
    var attr = yield parse.json(this);
    var code = attr.code;
    var number = attr.number;

    var magic = yield redis.get(prefix + number);

    debug('magic: ', magic);
    if (!magic) {
      return this.body = {
        status: 400,
        message: '验证码已失效，请重新申请。'
      }
    }

    if (magic !== code) {
      return this.body = {
        status: 400,
        message: '提交的验证码错误'
      }
    }

    yield redis.set(prefix + number, verify_state);
    yield redis.expire(prefix + number, 3600);

    this.body = {
      status: 200,
      message: 'success'
    }
  },


  doRegister: function*() {

    debug('do register.');
    var attr = yield parse.json(this);

    debug('attr: ', attr);

    this.body = 'doregister'
  }


}
