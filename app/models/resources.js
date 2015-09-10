'use strict';

var debug = require('debug')('bz:models:resources');

module.exports = function (sequelize, DataTypes) {

  var Resources = sequelize.define('Resource', {

    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      comment: '资源名称'
    },
    source_id: {
      type: DataTypes.INTEGER,
      comment: '资源归属的Id,比如歌手id，专辑Id'
    },
    source_type: {
      type: DataTypes.INTEGER,
      comment: '资源的类型 0:未知 1:艺人 2:专辑 3:歌曲'
    },
    status: {
      type: DataTypes.INTEGER,
      comment: '资源的状态值 0：未处理 1：正常使用   2. 删除'
    },
    order: {
      type: DataTypes.INTEGER,
      comment: '多个相同资源的排序值，用于显示的时候资源的排序'
    },
    desc: {
      type: DataTypes.STRING,
      comment: '描述'
    },
    type: {
      type: DataTypes.INTEGER,
      comment: '资源的子类型类型，比如歌曲的所有音乐文件 可以设置 source_type 和type进行联合查询，也可以使用sourceType获取下面所有的资源'
    }
  }, {
    timestamps: false,
    tableName: 'bz_resources',
    underscored: true,
    scopes: {
      active: {
        status: 0
      }
    }
  });

  return Resources;
};
