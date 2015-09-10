"use strict";

import {User, Tag} from '../models';
import config from 'config';
var parse = require('co-body');
import _ from 'lodash';

var debug = require('debug')('bz:app:controllers:tags:');


export default {

  toManage: function*() {

    let page = this.query.page - 0 || 1;
    let size = this.query.size - 0 || 20;


    let tags = yield Tag.findAndCountAll({
      limit: size,
      offset: (page - 1) * size
    });

    let totalPage = Math.ceil(tags.count / size);

    this.body = yield this.render('tags/index', {
      total: tags.count,
      items: tags.rows,
      page: page - 1,
      totalPage: totalPage
    });
  },

  update: function*() {

    let id = this.params.id;

    let attr = yield parse.json(this);

    let name = attr.name;
    let status = attr.status;
    let is_default = attr.is_default;

    debug('name: ', name, ' status: ', status, ' is_default: ', is_default);

    let tag = yield Tag.find({
      where: {
        id: id
      }
    });

    var up_attr = {};

    if (name) {
      up_attr.name = name;
    }

    if (status !== undefined) {
      up_attr.status = status;
    }

    if (is_default !== undefined) {
      up_attr.is_default = is_default;
    }

    debug('up_attr: ', up_attr);

    tag.updateAttributes(up_attr);

    this.body = {
      status: 200,
      data: tag
    }
  },

  create: function*() {

    let attr = yield parse.json(this);

    let tag = Tag.build({
      name: attr.name
    });

    yield tag.save();

    this.body = {
      status: 200,
      data: tag
    }
  }
}
