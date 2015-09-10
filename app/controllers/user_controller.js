"use strict";

import {User, Tag, Question, Answer} from '../models';
import config from 'config';
var parse = require('co-body');
import _ from 'lodash';

var debug = require('debug')('bz:app:controllers:user:');

export function *toManage() {

  let page = this.query.page - 0 || 1;
  let size = this.query.size - 0 || 20;


  let id = this.query.id;

  var query = {
    limit: size,
    offset: (page - 1) * size,
    order: 'created_at desc',
    where: {}
  };

  if (id) {
    query.where.id = id;
  }

  let users = yield User.findAndCountAll(query);

  let totalPage = Math.ceil(users.count / size);

  debug('users: ', users.rows.length);

  this.body = yield this.render('user/index', {
    total: users.count,
    items: users.rows,
    page: page - 1,
    totalPage: totalPage
  });


}


export function *update() {


  let id = this.params.id;

  let attr = yield parse.json(this);

  let status = attr.status;

  let user = yield User.find({
    where: {
      id: id
    }
  });

  var up_attr = {};

  if (status !== undefined) {
    up_attr.status = status;
  }

  debug('up_attr: ', up_attr);

  user.updateAttributes(up_attr);

  this.body = {
    status: 200,
    data: user
  }
}
