"use strict";

import koa from 'koa';
import json from 'koa-json';
import compress from 'koa-compress';
import bodyParser from 'koa-bodyparser'
import logger from 'koa-logger';
import onerror from 'koa-onerror';
import koa_static from 'koa-static';
import path from 'path';

import render from '../lib/render';
import routes from './routes';

let app = koa();
let router = new routes();

// error handler
onerror(app);

// use middleware
app.use(logger());
app.use(compress());
app.use(bodyParser());
app.use(json({pretty: app.env === 'development'}));

app.context.render = render;

app.use(koa_static(path.join(__dirname, '../public')));

//init
app.use(router.routes());

let PORT = process.env.PORT || 9000;

app.listen(PORT, err=> {
    if (err) {
        throw  err;
    }
    console.log(`listening on PORT: ${PORT}`);
});
