"use strict";

export default (sequelize, DataTypes) => {
  var Tag = sequelize.define('Tag', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: DataTypes.STRING,
    type: DataTypes.INTEGER,
    status: DataTypes.INTEGER,
    is_default: DataTypes.BOOLEAN
  }, {
    tableName: 'bz_tags',
    timestamps: true,
    underscored: true,
    classMethods: {
      associate(models) {
        Tag.belongsToMany(models.User, {
          through: "bz_users_tags"
        });

        Tag.belongsToMany(models.Question, {
          through: "bz_question_tags"
        });
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

  return Tag;
}
