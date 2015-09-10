"use strict";
import config from 'config';

export default (sequelize, DataTypes) => {
  var Questions = sequelize.define('Question', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    user_id: DataTypes.INTEGER,
    content: DataTypes.STRING,
    images: {
      type: DataTypes.STRING,
      get: function () {
        var resource = this.getDataValue('images');
        if (resource) {
          if (resource.indexOf(';') >= 0) {
            var imgs = resource.split(';');

            var fill = imgs.map(function (img) {
              return config.fileServer + img;
            });

            return fill.join(';');
          }

          return config.fileServer + resource;
        }
        return '';
      }
    },
    status: DataTypes.INTEGER,
    last_reply_time: DataTypes.DATE
  }, {
    tableName: 'bz_questions',
    setterMethods: {
      images: function (images) {

        if (images && images.indexOf(';') >= 0) {
          var imgs = images.split(';');

          var fill = imgs.map(function (img) {
            return img.replace(config.fileServer, '');
          });

          this.setDataValue('images', fill.join(';'));
        }

      }
    },
    timestamps: true,
    underscored: true,
    classMethods: {
      associate(models) {
        Questions.belongsToMany(models.Tag, {
          through: "bz_question_tags"
        });

        Questions.hasMany(models.Answer);

        Questions.belongsTo(models.User);
      }
    },
    scopes: {
      list: {
        attributes: ['id', 'user_id', 'content', 'images', 'last_reply_time', 'created_at'].concat(
          [
            [sequelize.literal('(SELECT COUNT(`id`) FROM bz_answers WHERE question_id = Question.id)'),
              'answers_count']
          ]
        )
      },
      detail: {
        attributes: ['id', 'user_id', 'content', 'images', 'last_reply_time'].concat(
          [
            [sequelize.literal('(SELECT tag.id, tag.name, tag.is_default FROM bz_tags as tag inner join bz_question_tags as question_tag on tag.id = question_tag.tag_id inner join bz_questions as question on question_tag.question_id = question.id WHERE question.id = Question.id)'),
              'Tags'],

            [sequelize.literal('(SELECT user.id, user.name, user.avatar FROM bz_users as user WHERE user.id = Question.id)'),
              'User']
          ]
        )
      },
      'active': {
        where: {
          status: 0
        }
      }
    }
  });

  return Questions;
}
