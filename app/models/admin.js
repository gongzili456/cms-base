"use strict";

export default (sequelize, DataTypes) => {
  var Admin = sequelize.define('Admin', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: DataTypes.STRING,
    password: DataTypes.STRING,
    phone: DataTypes.STRING,
    type: DataTypes.INTEGER,
    status: DataTypes.INTEGER
  }, {
    tableName: 'bz_admin',
    timestamps: true,
    underscored: true,
    classMethods: {
    }
  });

  return Admin;
}
