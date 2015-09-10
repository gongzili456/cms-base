"use strict";

import koa from 'koa';
import json from 'koa-json';
import logger from 'koa-logger';
import koa_static from 'koa-static';
import path from 'path';
import config from 'config';

import session from 'koa-generic-session';
import RedisStore from 'koa-redis';

import render from '../lib/render';
import routes from './routes';
import authentication from '../lib/authentication';

let app = koa();
let router = new routes();


app.keys = ['bang', 'zhu'];
app.use(session({
  key: 'bangzhu-admin',
  store: new RedisStore(config.redis),
  cookie: {
    path: '/',
    httpOnly: true,
    maxage: null,
    rewrite: true,
    signed: true
  }
}));


app.context.render = render;

app.use(koa_static(path.join(__dirname, '../public')));

// use middleware
app.use(logger());
app.use(json({pretty: app.env === 'development'}));


// error handler
app.use(function*(next) {
  try {
    yield next;
  } catch (err) {
    this.status = err.status || 500;
    this.body = {
      status: this.status,
      message: err.message
    };
    this.app.emit('error', err, this);
  }
});

app.on('err', function (err) {
  console.error(err);
});

app.use(authentication);

//init
app.use(router.routes());

let PORT = process.env.PORT || 9000;

app.listen(PORT, err=> {
  if (err) {
    throw  err;
  }
  console.log(`listening on PORT: ${PORT}`);
});
