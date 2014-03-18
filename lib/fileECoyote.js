var koa = require('koa');
var parse = require('co-body');
var router = require('koa-router');
var serve = require('koa-static');
var send = require('koa-send');
var uploader = require('./upload');
var jsonResp = require('./jsonResp');
var os = require('os');
var Promise = require("bluebird");
var path = require('path');

exports.startServer = function (options){
	var app = koa();

	app.use(jsonResp());
	app.use(router(app));

	app.post('/upload', upload);
	app.get('/download/:fileID', download);
	app.get('/public/*', serve('.'));

	function *upload() {
		var fileID = yield options.adaptor.upload(this, options)
	  this.jsonResp(200,{message: "Uploaded", fileID: fileID});
	}

	function *download() {
		if(options.authKeys.indexOf(this.query.appKey) >= 0){
			yield options.adaptor.download(this, options);
		}else{
			this.jsonResp(400,{message: "Invalid Key"});
		}
	}

	app.listen(options.port);
	console.log('Started ----------------------------------------------');
}

exports.fileAdaptor = function(){
	currentFileName = 0

	this.upload = function *(context, options){
		yield uploader.fileUpload(context, options.downloadFolder, (currentFileName++).toString());
		return currentFileName-1;
	}

	this.download = function *(context, options){
		filePath = path.join(options.downloadFolder, context.params.fileID);
		yield send(context, filePath)
	}
}