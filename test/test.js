var assert = require("assert")
var fs = require("fs")
var request = require('supertest')
var path = require('path');
var coyote = require('../lib/fileECoyote');

var uploadsDir = path.join(process.cwd(), "/test/uploads");

var server = coyote.startServer({
                    database: {
                      host: "localhost",
                      user: "root",
                      database: "coyote",
                      password: ""
                    },
                    adaptor: new coyote.fileAdaptor(),
                    authKeys: ["app1SecretKey","app2SecretKey"],
                    downloadFolder: uploadsDir,
                    port: 3008
                  });
var app = server.callback();

describe('GET /ping', function(){
  it('respond with json', function(done){
    request(app)
      .get('/ping')
      .expect('Content-Type', /json/)
      .expect(200, done);
  })
})

describe('POST /upload', function(){
	afterEach(function*(){
		fs.readdir(uploadsDir, function(err, files){
			for (i in files) {
				fs.unlink(uploadsDir+"/"+files[i])
			}
		});
	})

  it('respond with json', function(done){
    request(app)
      .post('/upload')
      .attach('image', process.cwd()+'/test/files/nifty.png')
      .expect('Content-Type', /json/)
      .expect(200, done);
  })
})

describe('End To End', function(){
	after(function*(){
		fs.readdir(uploadsDir, function(err, files){
			for (i in files) {
				fs.unlink(uploadsDir+"/"+files[i])
			}
		});
	})
	var fileID;
	var key;

  it('responds with json', function(done){
    request(app)
      .post('/upload')
      .attach('image', process.cwd()+'/test/files/nifty.png')
      .expect('Content-Type', /json/)
      .expect(200).end(function(err, res){
        fileID = JSON.parse(res.text).data.fileID
        done(err)
      });
  })

  it('cannot download unauth request', function(done){
  	request(app)
      .get('/download/'+fileID)
      .expect('Content-Type', /json/)
      .expect(400).end(function(err, res){
        done(err)
      });
  })

  it('creates access token', function(done){
    request(app)
      .get('/requestToken/'+fileID+'?appKey=app1SecretKey&requestID=testUser&expireIn=1000')
      .expect('Content-Type', /json/)
      .expect(200).end(function(err, res){
        key = JSON.parse(res.text).data.requestToken
        done(err)
      });
  })

  it('downloads file when authenticated', function(done){
  	request(app)
      .get('/download/'+fileID+"?requestToken="+key)
      .expect('Content-Type', /application.octet-stream/)
      .expect(200, done);
  })

  it('respond with error after token expires', function(done){
  	setTimeout(function(){
  		request(app)
      .get('/download/'+fileID+"?requestToken="+key)
      .expect(400, done);
  	}, 1000)
  })
})