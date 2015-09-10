"use strict";
import co from 'co';

export default (sequelize, DataTypes) => {
  var Answers = sequelize.define('Answer', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    question_id: DataTypes.INTEGER,
    question_user_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    reply_answer_user_id: DataTypes.INTEGER,
    reply_answer_user_name: DataTypes.STRING,
    reply_answer_id: DataTypes.INTEGER,
    content: DataTypes.STRING,
    score: DataTypes.INTEGER,
    is_accept: DataTypes.BOOLEAN,
    status: DataTypes.INTEGER
  }, {
    tableName: 'bz_answers',
    timestamps: true,
    underscored: true,
    classMethods: {
      associate(models) {
        Answers.belongsTo(models.Question);

        Answers.belongsTo(models.User);
      }
    },
    scopes: {
      'active': {
        where: {
          status: 0
        }
      }
    }
  });


  Answers.afterCreate(function (answer) {

    co(function*() {
      let question = yield answer.getQuestion();

      yield question.updateAttributes({
        last_reply_time: new Date()
      })
    });

  });

  return Answers;
}
