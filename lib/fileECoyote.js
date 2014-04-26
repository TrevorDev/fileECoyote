var koa = require('koa')
var parse = require('co-body')
var router = require('koa-router')
var cors = require('koa-cors');
var multiParse = require('co-busboy')
//var serve = require('koa-static')

var jsonResp = require('./jsonResp')
var fsAdaptor = require('./fsAdaptor')
exports.fileAdaptor = fsAdaptor

exports.startServer = function (options){

	//INIT DATABASE
	var Database = require('./database')
	Database.init(options.database)
	var File = require('./model/file')
	var Download = require('./model/download')
	var Account = require('./model/account')
	Database.getSequelizeInstance().sync()//maybe callback this // {force: true}

	var app = koa()
	var accessTokens = {}

	app.use(jsonResp())
	app.use(cors())
	app.use(router(app))


	app.get('/ping', ping)

	app.post('/file/upload', upload)
	app.get('/file/:fileID', download)
	app.post('/file/:fileID/requestToken', requestToken)
	app.del('/file/:fileID', del)

	app.post('/account/create', createAccount)
	app.post('/destroyAll', destroyAll)
	function *destroyAll(){
		if(authenticateMaster(this)) {
			try {
				yield Database.getSequelizeInstance().sync({force: true})
				yield options.adaptor.destroyAll()
			}catch(e){}
			this.jsonResp(200,{message: "Destroyed"})
		} else {
			this.jsonResp(400,{message: "invalid master secret"})
		}
	}

	function *createAccount(){
		if(authenticateMaster(this)) {
			try {
				yield Account.create({name: this.query.name, token: this.query.token, status: Account.STATUS.ACTIVE})
			}catch(e){}
			this.jsonResp(200,{message: "created"})
		} else {
			this.jsonResp(400,{message: "invalid master secret"})
		}
	}

	function *ping() {
	  this.jsonResp(200,{message: "Ping"})
	}

	function *del(){
		if(!(yield authenticateApp(this))){
			this.jsonResp(400,{message: "invalid app token"})
			return
		}
		var acc = yield Account.find({where: {name: this.query.account, status: Account.STATUS.ACTIVE}})
		var file = (yield acc.getFiles({where: {status: File.STATUS.ACTIVE, id: this.params.fileID}}))[0]
		if(!file){
			this.jsonResp(404,{message: "File not found"})
			return
		}
		file.status = File.STATUS.DELETED
		yield file.save()
		yield options.adaptor.del(file.id)
		this.jsonResp(200,{message: "Deleted"})
	}

	function *upload() {
		if(!this.query.account){
			this.jsonResp(400,{message: "param account is missing"})
			return
		}
		var acc = yield Account.find({where: {name: this.query.account, status: Account.STATUS.ACTIVE}})
		if(!acc){
			this.jsonResp(400,{message: "account not found"})
			return
		}

		var parts = multiParse(this, { autoFields: true })
		var files = []
		//TODO can each part be proccessed at the same time?
		var part = null
	  while (part = yield parts) {
	  	var file = yield File.create({name: part.filename, status: File.STATUS.CREATING, privacy: this.query.public == 'true' ? File.PRIVACY.PUBLIC : File.PRIVACY.PRIVATE})
	    file.bytes = yield options.adaptor.upload(part, file.id)
	    file.status = File.STATUS.ACTIVE
	    yield acc.addFile(file)
	    yield file.save()
	    files.push({name: part.filename, id: file.id})
	  }
	  this.jsonResp(200,{message: "Uploaded", files: files})
	}

	function *download() {
		var file = yield File.find({where:{id: this.params.fileID, status: File.STATUS.ACTIVE}})
		if(!file){
			this.jsonResp(404,{message: "File not found"})
			return
		}
		if(file.privacy != File.PRIVACY.PUBLIC && !(yield authenticateApp(this)) && !authenticateRequestToken(this)){
			this.jsonResp(400,{message: "Invalid Application Key or requestToken"})
			return
		}
		if(file.privacy != File.PRIVACY.PUBLIC){
			var tokenParts = this.query.requestToken.split("-")
			var download = yield Download.create({userName: tokenParts[0]})
			file.addDownload(download)
		}
		var filename = this.query.filename ? this.query.filename : file.name
		yield options.adaptor.download(this, file.id)

		if (this.query.cache != "false") {
			this.set('Cache-Control', 'max-age=2592000'); //30 days cached
		}

		if (this.query.download == "true") {
			this.set('Content-Disposition', "attachment;filename="+filename)
			this.set('content-type', "application/octet-stream")
		}	  	
	}

	function *requestToken() {
		if((yield authenticateApp(this)) && this.query.requestID){
			var token = Math.random().toString(36).slice(2)
			requestID = this.query.requestID
			accessTokens[requestID] = {token: token, fileID: this.params.fileID}
			setTimeout(function(){
				delete accessTokens[requestID]
			}, parseInt(this.query.expireIn) || 30000)
			this.jsonResp(200,{requestToken: requestID+"-"+token})
		}else{
			this.jsonResp(400,{message: "Invalid Application Key or requestID missing"})
		}
	}

	app.listen(options.port)

	function *authenticateApp(context){
		var acc = yield Account.find({where: {name: context.query.account}})
		if(!acc)
			return false
		return acc.token == context.query.token
	}

	function authenticateRequestToken(context){
		if (!context.query.requestToken) return false
		var parts = context.query.requestToken.split("-")
		if(parts.length < 2 || !accessTokens[parts[0]]) return false
		return accessTokens[parts[0]].token == parts[1] && accessTokens[parts[0]].fileID == context.params.fileID
	}

	function authenticateMaster(context){
		if(!options.masterSecret) {
			return false
		}else{
			return context.query.masterSecret == options.masterSecret
		}
	}

	return app
}