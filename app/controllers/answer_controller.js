"use strict";

import {User, Tag, Question, Answer} from '../models';
import config from 'config';
var parse = require('co-body');
import _ from 'lodash';

var debug = require('debug')('bz:app:controllers:answer:');

export default {

  toManage: function*() {


    let page = this.query.page - 0 || 1;
    let size = this.query.size - 0 || 20;

    let question_id = this.query.question_id;

    debug('question_id: ', question_id);

    let query = {
      limit: size,
      offset: (page - 1) * size,
      order: 'created_at desc',
      where: {},
      include: [Question, {
        model: User,
        attributes: ['id', 'name', 'avatar', 'gender', 'birthday', 'created_at']
      }]
    };

    if (question_id) {
      query.where.question_id = question_id;
    }

    let answers = yield Answer.findAndCountAll(query);

    let totalPage = Math.ceil(answers.count / size);


    this.body = yield this.render('answer/index', {
      total: answers.count,
      items: answers.rows,
      page: page - 1,
      totalPage: totalPage
    });

  },

  update: function*() {


    let id = this.params.id;

    let attr = yield parse.json(this);

    let status = attr.status;

    debug('status: ', status);

    let answer = yield Answer.find({
      where: {
        id: id
      }
    });

    var up_attr = {};

    if (status !== undefined) {
      up_attr.status = status;
    }

    debug('up_attr: ', up_attr);

    answer.updateAttributes(up_attr);

    this.body = {
      status: 200,
      data: answer
    }


  }

}
