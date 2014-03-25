var path = require('path');
var send = require('koa-send');
var saveTo = require('save-to');

module.exports = function(options){
	currentFileName = 0

	this.upload = function *(part){
		yield saveTo(part, path.join(options.downloadFolder, (currentFileName++).toString()))
		return currentFileName-1;
	}

	this.download = function *(context){
		filePath = path.join(options.downloadFolder, context.params.fileID);
		yield send(context, filePath)
	}
}