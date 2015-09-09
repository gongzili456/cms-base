const debug = require('debug')('bz:lib:authentication:');

export default function*(next) {


  debug('token: ', this.session);

  if (!this.session.user) {
    return this.body = {
      status: 403,
      message: '你需要登录'
    }
  }


  yield next;
}
