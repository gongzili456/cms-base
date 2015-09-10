"use strict";

export default (sequelize, DataTypes) => {
  var User = sequelize.define("User", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: DataTypes.STRING,
    avatar: DataTypes.STRING,
    phone: DataTypes.STRING,
    password: DataTypes.STRING,
    gender: DataTypes.INTEGER,
    birthday: DataTypes.DATE,
    status: DataTypes.INTEGER
  }, {
    tableName: 'bz_users',
    timestamps: true,
    underscored: true,
    classMethods: {
      associate(models) {
        User.belongsToMany(models.Tag, {
          through: "bz_users_tags"
        })
      }
    },
    scopes: {
      thumb: {
        attributes: ['id', 'name', 'gender', 'birthday']
      },
      'active': {
        where: {
          status: 0
        }
      }
    }
  });

  return User;
};
