var path = require('path');
var send = require('koa-send');
var uploader = require('./upload');

module.exports = function(){
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