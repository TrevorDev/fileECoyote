var multiParse = require('co-busboy')
var fs = require('co-fs');
var os = require('os');
var path = require('path');
var saveTo = require('save-to');

exports.fileUpload = function *(context, folder, filename) {
	// parse the multipart body
  var parts = multiParse(context, {
    autoFields: true // saves the fields to parts.field(s)
  });

  // list of all the files
  var files = [];
  var file;

  // yield each part as a stream
  var part;
  while (part = yield parts) {
    // filename for this part
    files.push(file = path.join(folder, filename ? filename : part.filename));
    // save the file
    yield saveTo(part, file);
  }

  // return all the filenames as an array
  // after all the files have finished downloading
  return files;
}