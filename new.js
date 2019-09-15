const express = require('express');
const app = express();
const fs = require('fs');
const port = 3000;

let content = ''

let index = fs.readFileSync('./index.html','utf8');
console.log((index));
