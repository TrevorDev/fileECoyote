var path = require('path');
var coyote = require('./lib/fileECoyote');

coyote.startServer({
										adaptor: new coyote.fileAdaptor(),
										authKeys: ["app1SecretKey","app2SecretKey"],
										downloadFolder: path.join(process.cwd(), "uploads"),
										port: 3008
									});