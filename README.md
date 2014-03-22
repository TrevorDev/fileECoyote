fileECoyote
======================================

[fileECoyote] NodeJS service/package for easy public/private file storage and retrieval.

## Install

`npm install file-e-coyote`

## Requirements

- [node](http://nodejs.org/) v0.11.9+

## Create fileECoyote server

```
var path = require('path');
var coyote = require('file-e-coyote');
var app = exports.app = coyote.startServer({
	adaptor: new coyote.fileAdaptor(),
	authKeys: ["app1SecretKey","app2SecretKey"],
	downloadFolder: path.join(process.cwd(), "uploads"),
	port: 3008
});
```

## Upload file from browser

```
 <form action="/upload" enctype="multipart/form-data" method="post">
   What files are you sending? <input type="file" name="files" multiple>
   <input type="submit" value="Send">
 </form>

 <a href="/download/0">download</a>
```

## Contributors

- [Trevor Baron](https://github.com/TrevorDev) (author)
