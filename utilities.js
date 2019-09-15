const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('./config');
const db = require('./db');
const router = require('./router')
const fs = require('fs');
let util = {};


util.hash_password = function (secret, salt = undefined) {
    if (salt == undefined) {
        salt = crypto.randomBytes(16).toString('base64');
        const hashed_password = crypto.createHmac('sha256', secret).update(salt).digest('base64');
        return { hashed_password, salt };
    }
    else {
        const hashed_password = crypto.createHmac('sha256', secret).update(salt).digest('base64');
        return hashed_password;
    }
}

util.check_token = (req, res, callback) => {
    let token = req.headers['x-access-token'] || req.headers['authorization']; 
    if (token.startsWith('Bearer ')) {token = token.slice(7, token.length);}
  
    if (token) {
      jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
          return res.json({
            success: false,
            message: 'Token is not valid'
          });
        } else {
          req.decoded = decoded;
          if(callback =! undefined) callback();
        }
      });
    } else {
      return res.json({
        success: false,
        message: 'Auth token is not supplied'
      });
    }
  };
  
util.variables_script = function (variables){
  var html="";
  db.foreach(variables, function(i, v){
      if (typeof v == "object"){v= JSON.stringify(v);}
      html+=` var ${i} = ${v}; `;
  });
  return `<script>${html}</script>`;
}

module.exports = util;


util.render = function(file,data,res){
  let file_content = fs.readFileSync(`views/${file}.html`);  
  res.send(`${util.variables_script(data)} ${file_content}`);
}