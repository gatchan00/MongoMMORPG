//****************Esqueleto para servidor
// Autor: Javier Gómez Santos
// requisitos:
// node.js
// npm install mongodb
// npm install sleep
//
// Ejecutar con:
// node server-backend.js
'use strict';

let defaultWait = 500;
let totalEntitys = 25;
let mongo_uri = 'mongodb://localhost:27017';
let database = 'mmorpg';
let entity_collection = 'entitys';
let width = 640;
let height = 480;

const msleep = require('sleep').msleep; 
const MongoClient = require('mongodb').MongoClient;


let resucita = (col) =>{
    col.find({'alive':true}).count((err, result) =>{
        if (err)  throw err;
        else{
            var aCrear = totalEntitys - result;
            if (aCrear > 0){
                //insertamos tantos como aCrear diga
                var listaDocs = []
                for (var i=0; i<aCrear; i++){
                    listaDocs.push({'alive':true, x:Math.floor(Math.random()*width), y:Math.floor(Math.random()*height)});
                }
                col.insertMany(listaDocs,(err, result)=>{
                    if (err) throw err;
                    else{
                        console.log("insertados "+aCrear+" nuevos seres");
                    }
                })
            }
        }
    });
};

MongoClient.connect(mongo_uri, { useNewUrlParser: true }, function(err, client) {
    // Use the admin database for the operation
    var col = client.db(database).collection(entity_collection);

    setInterval(resucita, defaultWait, col);

    });

//msleep(defaultWait);
