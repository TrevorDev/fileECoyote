var path = require('path');
var coyote = require('fileECoyote');

var app = exports.app = coyote.startServer({
										adaptor: new coyote.fileAdaptor(),
										authKeys: ["app1SecretKey","app2SecretKey"],
										downloadFolder: path.join(process.cwd(), "uploads"),
										port: 3008
									});