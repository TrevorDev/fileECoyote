var assert = require("assert")
var fs = require("fs")
var request = require('supertest')
var path = require('path')
var coyote = require('../lib/fileECoyote')

var uploadsDir = path.join(process.cwd(), "/test/uploads")

var server = coyote.startServer({
                    database: {
                      host: "localhost",
                      user: "root",
                      database: "coyote",
                      password: ""
                    },
                    adaptor: new coyote.fileAdaptor({
                      downloadFolder: uploadsDir,
                      maxBytes: 1000
                    }),
                    masterSecret: 'secret',
                    port: 3008
                  })
var app = server.callback()

describe('GET /ping', function(){
  it('respond with json', function(done){
    request(app)
      .get('/ping')
      .expect('Content-Type', /json/)
      .expect(200, done)
  })
})

describe('POST /account/create', function(){
  it('respond with json', function(done){
    request(app)
      .post('/account/create?masterSecret=secret&name=test&token=app1secret')
      .expect('Content-Type', /json/)
      .expect(200, done)
  })
})

describe('POST /file/upload', function(){
	afterEach(function*(){
		fs.readdir(uploadsDir, function(err, files){
			for (i in files) {
				fs.unlink(uploadsDir+"/"+files[i])
			}
		})
	})

  it('respond with json', function(done){
    request(app)
      .post('/file/upload?account=test')
      .attach('image', process.cwd()+'/test/files/nifty.png')
      .expect('Content-Type', /json/)
      .expect(200, done)
  })

  it('respond with json', function(done){
    request(app)
      .post('/file/upload?account=test')
      .attach('image', process.cwd()+'/test/files/tooBig.jpg')
      .expect(413, done)
  })
})

describe('End To End', function(){
	after(function(){
		fs.readdir(uploadsDir, function(err, files){
			for (i in files) {
				fs.unlink(uploadsDir+"/"+files[i])
			}
		})
	})
	var fileID
  var PublicFileID
	var key

  it('responds with json', function(done){
    request(app)
      .post('/file/upload?account=test')
      .attach('image', process.cwd()+'/test/files/nifty.png')
      .expect('Content-Type', /json/)
      .expect(200).end(function(err, res){
        fileID = JSON.parse(res.text).data.files[0].id
        done(err)
      })
  })

  it('responds with json', function(done){
    request(app)
      .post('/file/upload?account=test&public=true')
      .attach('image', process.cwd()+'/test/files/nifty.png')
      .expect('Content-Type', /json/)
      .expect(200).end(function(err, res){
        PublicFileID = JSON.parse(res.text).data.files[0].id
        done(err)
      })
  })

  it('can download unauth request with public file', function(done){
    request(app)
      .get('/file/'+PublicFileID)
      .expect('Content-Type', /application.octet-stream/)
      .expect(200).end(function(err, res){
        done(err)
      })
  })

  it('cannot download unauth request', function(done){
  	request(app)
      .get('/file/'+fileID)
      .expect('Content-Type', /json/)
      .expect(400).end(function(err, res){
        done(err)
      })
  })

  it('creates access token', function(done){
    request(app)
      .post('/file/'+fileID+'/requestToken?account=test&token=app1secret&requestID=testUser&expireIn=1000')
      .expect('Content-Type', /json/)
      .expect(200).end(function(err, res){
        key = JSON.parse(res.text).data.requestToken
        done(err)
      })
  })

  it('downloads file when authenticated', function(done){
  	request(app)
      .get('/file/'+fileID+"?requestToken="+key+'&cache=false&download=true')
      .expect('Content-Type', /application.octet-stream/)
      .expect('Cache-Control', 'max-age=0')
      .expect(200, done)
  })

  it('respond with error after token expires', function(done){
    setTimeout(function(){
      request(app)
      .get('/file/'+fileID+"?requestToken="+key)
      .expect(400, done)
    }, 1000)
  })

  it('deletes', function(done){
    request(app)
      .del('/file/'+fileID+"?account=test&token=app1secret")
      .expect(200, done)
  })

  it('404 after file deleted', function(done){
    request(app)
      .get('/file/'+fileID+"?requestToken="+key)
      .expect(404, done)
  })
})