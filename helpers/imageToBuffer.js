const fs = require("fs");

function imageToBuffer(file) {
  // read binary data
  const bitmap = fs.readFileSync(file);
  // convert binary data to base64 encoded string
  
  const buffer = new Buffer(bitmap).toString('base64')
  return buffer;
}

module.exports = { imageToBuffer };