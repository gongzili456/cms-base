// render.js - houjiazong, 2015/08/11
var views = require('co-views');

export default views(__dirname + '/../app/views', {
  map: {
    html: 'swig'
  }
});
