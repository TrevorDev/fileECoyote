var path = require('path')
var send = require('koa-send')
var saveTo = require('save-to')
var fs = require('co-fs')

module.exports = function(options){
	this.upload = function *(part, fileID){
		var filePath = path.join(options.downloadFolder, fileID.toString())
		yield saveTo(part, filePath, {limit: options.maxBytes})
		stats = yield fs.stat(filePath)
		return stats.size
	}

	this.download = function *(context, fileID, filename){
		filePath = path.join(options.downloadFolder, fileID.toString());
		yield send(context, filePath)
		context.set('Content-Disposition', "attachment;filename="+filename)
	  context.set('content-type', "application/octet-stream")
	}

	this.del = function *(fileID){
		filePath = path.join(options.downloadFolder, fileID.toString());
		yield fs.unlink(filePath)
	}
}