const debug = require('debug')('bz:lib:authentication:');

import _ from 'lodash';

let pass_router = ['/login', '/register', '/sms/code', '/sms/verify_code'];

export default function*(next) {


  let pass = _.takeWhile(pass_router, (name) => {
    return _.startsWith(this.path, name);
  });

  if (pass.length) {
    return yield next;
  }

  if (!this.session.user) {
    return this.redirect('/login');
  }


  yield next;
}
