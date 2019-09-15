const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const config = require('./config');
const router = require('./router');
const app = express();
const port = 3000;

app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(session({name: 'sid',secret: config.sessionSecret,resave: false,saveUninitialized: true,cookie: {maxAge: config.sessionMaxAge }}))
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

app.use('/',router);

app.listen(port, () => console.log(`VTC app is running on port ${port}!`))


