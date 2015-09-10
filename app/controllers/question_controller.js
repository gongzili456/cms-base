"use strict";

import {User, Tag, Question} from '../models';
import config from 'config';
var parse = require('co-body');
import _ from 'lodash';

var debug = require('debug')('bz:app:controllers:question:');


export default {

  toManage: function*() {


    let page = this.query.page - 0 || 1;
    let size = this.query.size - 0 || 20;

    let ids = yield Question.findAndCountAll({
      limit: size,
      offset: (page - 1) * size,
      order: 'created_at DESC'
    });



    let questions = yield Question.scope('list').findAll({
      where: {
        id: {
          $in: _.map(ids.rows, 'id')
        }
      },
      include: [{
        model: Tag
      }, {
        model: User,
        attributes: ['id', 'name', 'avatar', 'gender', 'birthday', 'created_at']
      }]
    });

    //let count = yield Question.count();

    questions.forEach(function(q) {
      q.dataValues._images = q.images ? q.images.split(';') : [];
    });

    let totalPage = Math.ceil(ids.count / size);

    this.body = yield this.render('question/index', {
      total: ids.count,
      items: questions,
      page: page - 1,
      totalPage: totalPage
    });
  },

  update: function*() {
    let id = this.params.id;

    let attr = yield parse.json(this);

    let status = attr.status;

    debug('status: ', status);

    let question = yield Question.find({
      where: {
        id: id
      }
    });

    debug('question: ', question);

    var up_attr = {};

    if (status !== undefined) {
      up_attr.status = status;
    }

    debug('up_attr: ', up_attr);

    question.updateAttributes(up_attr);

    this.body = {
      status: 200,
      data: question
    }
  }
}
