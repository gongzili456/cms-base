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

  /**
   * home routes
   */
  router.get('/', controllers.sign_controller.toSign);

  /**
   * other routes
   */

  return router;
};
