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


let sign_controller = {

  toSign: function*() {
    this.body = yield this.render('login/login', {
      register: {}
    });
  },

  send_sms: function*() {
    let attr = yield parse.json(this);
    let number = attr.number;

    var regex = /(^(13\d|14[57]|15[^4,\D]|17[678]|18\d)\d{8}|170[059]\d{7})$/g;

    if (!number.match(regex)) {
      return this.body = {
        status: 400,
        message: 'Phone number error.'
      }
    }

    //yield redis.del(prefix + number);

    var has = yield redis.get(prefix + number);

    if (has === verify_state) {
      yield redis.del(prefix + number);
    }

    var ttl = yield redis.ttl(prefix + number);

    debug('ttl: ', ttl - 540, ' has: ', has);

    if (has && (ttl - 540) > 0) {
      return this.body = {
        status: 400,
        message: '请求频次太高，一分钟一次。'
      }
    }

    var magic = magicNum(6);

    yield redis.set(prefix + number, magic);
    yield redis.expire(prefix + number, 600);

    var result = yield ucpaas.sms({
      param: magic,
      templateId: '12024',
      to: number
    });

    if (result.resp.respCode !== '000000') {
      yield redis.del(prefix + number);
    }

    this.body = result.resp.respCode === '000000' ? {
      status: 200,
      data: result
    } : {
      status: 500,
      errorCode: result.resp.respCode
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
    let attr = yield parse.json(this);

    if (!attr.phone || !attr.password || !attr.name) {
      return this.body = {
        status: 400,
        message: '请填写完整的表单'
      }
    }

    var has_user = yield Admin.find({
      where: {
        phone: attr.phone
      }
    });

    if (has_user) {
      yield redis.del(prefix + attr.phone);
      return this.body = {
        status: 201,
        message: `This phone number {${attr.phone}} is exist`
      }
    }

    let v_state = yield redis.get(prefix + attr.phone);

    if (v_state !== verify_state) {
      return this.body = {
        status: 403,
        message: '请先验证短信验证码'
      }
    }

    yield redis.del(prefix + attr.phone);

    let user = Admin.build({
      phone: attr.phone,
      password: hashStr(attr.password),
      name: attr.name
    });

    yield user.save();

    yield sign_controller._bindSession(this, user)();

    this.body = {
      status: 200,
      data: user
    }
  },


  _bindSession: function*(admin) {
    this.session.user = admin;
  }


};

export default sign_controller;
