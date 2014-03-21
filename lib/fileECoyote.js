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
	var accessTokens = {}

	app.use(jsonResp());
	app.use(router(app));

	app.post('/upload', upload);
	app.get('/ping', ping);
	app.get('/download/:fileID', download);
	app.get('/requestToken/:fileID', requestToken);
	app.get('/public/*', serve('.'));

	function *ping() {
	  this.jsonResp(200,{message: "Ping"});
	}

	function *upload() {
		var fileID = yield options.adaptor.upload(this, options)
	  this.jsonResp(200,{message: "Uploaded", fileID: fileID});
	}

	function *download() {
		if(authenticateApp(this) || authenticateRequestToken(this)){
			yield options.adaptor.download(this, options);
		}else{
			this.jsonResp(400,{message: "Invalid Application Key or requestToken"});
		}
	}

	function *requestToken() {
		if(authenticateApp(this) && this.query.requestID){
			var token = Math.random().toString(36).slice(2)
			requestID = this.query.requestID
			accessTokens[requestID] = {token: token, fileID: this.params.fileID}
			setTimeout(function(){
				delete accessTokens[requestID]
			}, parseInt(this.query.expireIn) || 30000)
			this.jsonResp(200,{requestToken: requestID+"-"+token})
		}else{
			this.jsonResp(400,{message: "Invalid Application Key or requestID missing"});
		}
	}

	app.listen(options.port);
	//console.log('Started ----------------------------------------------');

	function authenticateApp(context){
		return options.authKeys.indexOf(context.query.appKey) >= 0
	}

	function authenticateRequestToken(context){
		if (!context.query.requestToken) return false
		var parts = context.query.requestToken.split("-")
		if(parts.length < 2 || !accessTokens[parts[0]]) return false
		return accessTokens[parts[0]].token == parts[1] && accessTokens[parts[0]].fileID == context.params.fileID
	}

	return app;
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