// const safeJsonStringify = require('safe-json-stringify');
const express = require('express');
const config = require('./config');
const db = require('./db');
const moment = require('moment');
const fs = require('fs');
const util = require('./utilities');
const router = express();

function log(req,res,next){
    const  {method, headers, url, params, query, body } = req;
    let f = [params, query, body].map(v => {if(v === undefined || Object.keys(v)<2){return ''}else{return JSON.stringify(v)}})
    let line = `\n[${moment().format('YYYY/MM/DD HH:mm:ss')}] ${method} ${headers.host}${url} [${headers["user-agent"]}] | ${f[1]} - ${f[2]}`    
    fs.appendFile('stili.log',line, 'utf8',(e) => {if(e) next(e)}); 
    console.log(line2);
    next()
}


router.use(log)
router.get('/', (req, res) => {res.send('Hello World!')})
router.get('/test', (req, res) => {res.send('Hello World!')})
router.get('/map', (req, res) => res.render('index.html'))
router.get('/login',(req, res) => res.render('login.html'))
router.get('/signup', (req, res) => res.render('signup.html'))

router.get('/home',async (req, res) => {
    if (req.session.user_id){
        console.log('user is defined!');
        let db_user = await db.select('*','users',{id:req.session.user_id},'row');
        return util.render('home',{user:db_user},res);
    }else{
        console.log('user not defined!');
        return res.redirect('/login');
    }
});



router.post('/signup',(req,res)=>{
    return signup(req,res);
});

router.get('/logout',(req,res)=>{
    req.session.destroy(err=>{
        if(!err){
            res.clearCookie('sid');
            res.redirect('/login');
        }else{
            return res.redirect('/');
        }
    });
});


router.post('/login', async (req,res)=>{
    let result = {};
    let entered_user = req.body;
    let db_user = await db.select('*','users',{username:entered_user.username},'row');
    result['session'] = req.session;
    // return res.send('login post')
    let salt = db_user.salt;
    
    const hashed_password = util.hash_password(entered_user.password,salt);
    const actual_password = db_user.password;

    if(entered_user.username && entered_user.password){
        if (hashed_password == actual_password){
            result['response'] = 'User logged in successfully!';
            // result['token'] = check_token(req,res);
            req.session.user_id = db_user.id;            
            res.redirect('/home');
        }else{
            result['response'] = 'username & password do not match';
            return res.render('/signup');
        }

    }else{
        result['response'] = 'Missing required fields';   
    }

    return res.render('login')
});



async function signup(req,res){
    let result = {};
    let {param, query, url, body} = req;
    let user = query;
    console.log("entered data: ",user);
    
    var { salt, hashed_password } = util.hash_password(user.password);
    user['salt'] = salt;
    user['password'] = hashed_password;
    delete user["confirm_password"] 
    delete user["tos_agreement"];
    await db.insert('users',user)
    let user_id = await db.last_insert_id();

    result['user_id'] = user_id;
}

function redirect_login(req,res,next) {
    // if(!req.session.user_id){
    //     res.redirect('/login');
    // }else{
    //     next();
    // }
}



router.post(`/ajax/:id`, async function(req,res){
    var result={};
    var func_name= req.params.id;
    
    if(func_name == 'test'){
        result['users'] = await db.select('*', 'users');
    }

    if(func_name == 'load_drivers'){
        result['drivers'] = await db.select('*', 'drivers');
    }




    res.append('Access-Control-Allow-Origin', ['*']);
    res.send(result);
});


module.exports = router;