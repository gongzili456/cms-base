"use strict";

import Router from 'koa-router';
import requireDir from 'require-dir';

let controllers = requireDir('./controllers');

export default ()=> {

  var router = new Router({
    prefix: ''
  });

  /**
   * Sign routes
   */
  router.post('/sms/code', controllers.sign_controller.send_sms);
  router.post('/sms/verify_code', controllers.sign_controller.verify_sms);

  router.post('/register', controllers.sign_controller.doRegister);

  router.get('/login', controllers.sign_controller.toSign);
  router.post('/login', controllers.sign_controller.doSignin);

  /**
   * Tags routes
   */
  router.get('/tags', controllers.tags_controller.toManage);

  router.post('/tags', controllers.tags_controller.create);

  router.put('/tags/:id', controllers.tags_controller.update);

  /**
   * questions routes
   */
  router.get('/questions', controllers.question_controller.toManage);
  router.put('/questions/:id', controllers.question_controller.update);

  /**
   * answers routes
   */
  router.get('/answers', controllers.answer_controller.toManage);
  router.put('/answers/:id', controllers.answer_controller.update);

    // index
  router.get('/', function *() {
    this.body = yield this.render('home/index');
  });

  return router;
};
