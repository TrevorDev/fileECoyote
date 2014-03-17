var koa = require('koa');
var parse = require('co-body');
var router = require('koa-router');
var serve = require('koa-static');
var uploader = require('./upload');
var jsonResp = require('./jsonResp');
var os = require('os');
var path = require('path');

exports.startServer = function (options){
	var app = koa();

	app.use(jsonResp());
	app.use(router(app));

	app.post('/upload', upload);
	app.get('/public/*', serve('.'));

	function *upload() {
	  var files = yield uploader.fileUpload(this, path.join(process.cwd(), "uploads"));
	  this.jsonResp(200,{message: "Uploaded",files: files});
	}

	app.listen(options.port);
	console.log('Started ----------------------------------------------');
}

fileAdaptor = {
	upload: function(){
		
	}
}