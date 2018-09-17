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
let users_collection = 'usuarios';
let width = 640;
let height = 480;
let maxTimeOut = 10000;//para desconectar jugadores
let maxEntityGhost = 10000;

const msleep = require('sleep').msleep; 
const MongoClient = require('mongodb').MongoClient;


let resucita = (databaseMongo) =>{
    var col = databaseMongo.collection(entity_collection);
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

let kickPlayers = (databaseMongo) =>{
    var col = databaseMongo.collection(users_collection);
    var currentDate = new Date();
    var oldDate = new Date(currentDate.getTime()-maxTimeOut);
    var query = {'active':true,'last_action':{$lt:oldDate}};
    var updateDoc = {$set:{'active':false}};
    col.updateMany(query, updateDoc,(err, result) =>{
        if (err)  throw err;
        else{
            if (result.result.n>0){
                console.log('Kickeados '+result.result.n+' jugadores sin actividad');
            }
        }
    });
};
let removeGhosths = (databaseMongo) =>{
    var col = databaseMongo.collection(entity_collection);
    var currentDate = new Date();
    var oldDate = new Date(currentDate.getTime()-maxEntityGhost);
    var query = {'active':false,'dead_date':{$lt:oldDate}};

    col.deleteMany(query, (err, result) =>{
        if (err)  throw err;
        else{
            if (result.result.n>0){
                console.log('Borradas '+result.result.n+' entidades fantasma');
            }
        }
    });
};

MongoClient.connect(mongo_uri, { useNewUrlParser: true }, function(err, client) {
    // Use the admin database for the operation
    var databaseMongo = client.db(database);

    setInterval(resucita, defaultWait, databaseMongo);
    setInterval(kickPlayers, defaultWait, databaseMongo);
    setInterval(removeGhosths, defaultWait, databaseMongo);

    });

//msleep(defaultWait);
