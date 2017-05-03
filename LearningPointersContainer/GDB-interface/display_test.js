let parse = require('./display_parser');
let fs = require('fs');

let content = fs.readFileSync('./test.txt').toString();

console.log(parse(content));
