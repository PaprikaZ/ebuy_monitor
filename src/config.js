// Generated by CoffeeScript 1.8.0
var fs, path;

path = require('path');

fs = require('fs');

module.exports = JSON.parse(fs.readFileSync(path.join(__dirname, '../config.json'), 'utf8'));
