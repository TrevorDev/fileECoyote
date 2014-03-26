var path = require('path')
var send = require('koa-send')
var saveTo = require('save-to')
var fs = require('co-fs')

module.exports = function(options){
	this.upload = function *(part, fileID){
		var filePath = path.join(options.downloadFolder, fileID.toString())
		yield saveTo(part, filePath)
		stats = yield fs.stat(filePath)
		return stats.size
	}

	this.download = function *(context){
		filePath = path.join(options.downloadFolder, context.params.fileID);
		yield send(context, filePath)
	}
}