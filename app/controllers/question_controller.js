"use strict";

import {User, Tag, Question, sequelize} from '../models';
import config from 'config';
var parse = require('co-body');
import _ from 'lodash';

var debug = require('debug')('bz:app:controllers:question:');


export function *toManage() {

  let page = this.query.page - 0 || 1;
  let size = this.query.size - 0 || 20;

  let tag_id = this.query.tag_id - 0;
    debug('to questions list by tag.', tag_id);

  if (tag_id) {
    debug('to questions list by tag.');
    return yield listByTag.bind(this)();
  }

  var query = {
    limit: size,
    offset: (page - 1) * size,
    order: 'created_at DESC'
  };

  let ids = yield Question.findAndCountAll(query);

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

  questions.forEach(function (q) {
    q.dataValues._images = q.images ? q.images.split(';') : [];
  });

  let totalPage = Math.ceil(ids.count / size);

  this.body = yield this.render('question/index', {
    total: ids.count,
    items: questions,
    page: page - 1,
    totalPage: totalPage,
    tag_id: 0
  });
}

function *listByTag() {

  debug('list by tag...');

  let page = this.query.page - 0 || 1;
  let size = this.query.size - 0 || 50;

  let tag_id = this.query.tag_id;


  let tag = yield Tag.find({
    where: {
      id: tag_id
    }
  });

  let questions = yield tag.getQuestions({
    limit: size,
    offset: (page - 1) * size,
    order: 'created_at DESC',
    attributes: ['id', 'user_id', 'content', 'images', 'last_reply_time', 'created_at'].concat(
      [
        [sequelize.literal('(SELECT COUNT(`id`) FROM bz_answers WHERE question_id = Question.id)'),
          'answers_count']
      ]
    ),
    include: [{
      model: Tag
    }, {
      model: User,
      attributes: ['id', 'name', 'avatar', 'gender', 'birthday', 'created_at']
    }]
  });

  var count = yield sequelize.query('SELECT COUNT(`Question`.`id`) as count' +
  ' FROM `bz_tags` as tag' +
  ' INNER JOIN `bz_question_tags` AS `bz_question_tags` ON `tag`.`id` = `bz_question_tags`.`tag_id`' +
  ' INNER JOIN `bz_questions` AS `Question` ON `bz_question_tags`.`question_id` = `Question`.`id` where tag.id = ' +  tag_id);

  count = count[0][0].count;
  debug('count: \n', count);

  let totalPage = Math.ceil(count / size);

  this.body = yield this.render('question/index', {
    total: count,
    items: questions,
    page: page - 1,
    totalPage: totalPage,
    tag_id: tag_id
  });

}

export function *update() {
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
