var mysql=require('mysql');
const remote_db = {host:'dawini-algerie.com',user:'dawinial_vtc_user',password:'',database:'dawinial_vtc'}
const local_db = {host:'localhost',user:'root',password:'',database:'vtc'}
var db= mysql.createConnection(local_db);
db.connect((err)=>{   if(err){console.log(err); return;}   });

var db_module={};
db_module.exec_query = async function (query, is_row){
    console.log(query);
    return new Promise(function(resolve, reject) {
        db.query(query, function (err, results) {
            if (err) {   return reject(err);}
            if(is_row == 'row'){   resolve(results[0]); }else{
                resolve(results);
            }
        });
    });
}

db_module.select = async function(columns, table_name, where, is_row){  
    var query=`SELECT ${columns} FROM ${table_name} ${db_module.get_where_clause(where)}`;
    return await db_module.exec_query(query, is_row);
}


db_module.insert = async function(table_name, obj, is_row){  
    var query=`INSERT INTO ${table_name} ${db_module.get_insert_clause(obj)}`; 
    return await db_module.exec_query(query, is_row);
}


db_module.update = async function(table_name, obj, where, is_row){  
    var query=`UPDATE ${table_name} SET ${db_module.get_set_clause(obj)} ${db_module.get_where_clause(where)}`; 
    return await db_module.exec_query(query, is_row);
}

db_module.last_insert_id = async function(){  
    var row= await db_module.exec_query('SELECT LAST_INSERT_ID();', 'row');
    return row['LAST_INSERT_ID()'];
}

db_module.get_insert_clause = function(obj){
    var columns="";
    db_module.foreach(obj, function(index,value){
        if(columns != ""){columns+=", ";}
        columns+=`${index}`;
    });

    var values="";
    db_module.foreach(obj, function(index, value){
        if(values != ""){values+=", ";}

        if(typeof value == 'number'){
            values+=`${value}`;
        }else if (Array.isArray(value) || typeof value == 'object'){
            values+=`"${JSON.stringify(value).replace(/"/g, '\\"')}" `;
     
        }else{
            values+=`"${value}"`;
        }
    });

    return `(${columns}) VALUES (${values})`;
}

db_module.foreach= function(obj, callback){
    if(obj == undefined){return;}
    if(Array.isArray(obj)){
        obj.forEach(function(v, i) {
            callback(i, v);
        });
    }
    Object.keys(obj).forEach(function(i) {
        callback(i, obj[i]);
    });
}



db_module.get_set_clause = function(obj){
    var txt="";
    db_module.foreach(obj,function(index,value){
        if(txt != ""){txt+=", ";}
     
        if(typeof value == 'number' ){
            txt+=`${index} = ${value} `;
        }else if  (Array.isArray(value) || typeof value == 'object'){
            txt+=`${index} = "${JSON.stringify(value).replace(/"/g, '\\"')}" `;
     
        }else{
            txt+=`${index} = "${value}" `;
        }
    });
    return txt;
}

db_module.get_where_clause= function (where){
    if(where == undefined){where = [];}
    var txt="";
    if(Object.keys(where).length !=0 ){

        db_module.foreach(where, function(index, value){
            console.log('where: ',where);
            console.log('value: ',value);
            
            if(txt!=""){txt+=` AND `; }
            var negation="";
            if(value[0] == "!"){negation="!"; value=value.replace('!','');}

            if(typeof value == 'number'){
                txt+=`${index} ${negation}= ${value} `;
            }else{
                txt+=`${index} ${negation}= "${value}" `;
            }
        });
        txt=`WHERE ${txt} `;
    }
    return txt;
}

module.exports = db_module;