//****************Esqueleto para servidor
// Autor: Javier Gómez Santos
// requisitos:
// node.js
// npm install websocket
// npm install mongodb
//
// Ejecutar con:
//(unix)
// PORT=8001 node 4-server-mongo-multifuncional.js
//(windows)
//set PORT=8001&&node 4-server-mongo-multifuncional.js
var WebSocketServer = require('websocket').server;
var http = require('http');
var mongo = require('mongodb');
var ObjectId = require('mongodb').ObjectId;
require('dotenv').config()

var coleccion_usuarios='usuarios';
var entity_collection='entities';
var websocket_port =  process.env.PORT || 8000;
var timeoutPlayers = 10000;
let width = 800;
let height = 600;
//Inicializo mongo (abro conexión)
var url = "mongodb://localhost:27017/";

var jugadoresconectados = {}// no hay nadie conectado

let mongoConf = {
	uri: "mongodb://localhost:27017",
	options: {
		keepAlive: 1,
        connectTimeoutMS: 30000,
        useNewUrlParser: true,
		socketTimeoutMS: 0,
		autoReconnect: true
	}
};
//console.log(new ObjectId());
let mongodbConnect = (data, callback) => {
	mongo.connect(data.uri, data.options, (err, db) => {
		if (err) {
			console.error(err);
			callback(err);
		}
		else {
			console.log('connected to mongodb:' + JSON.stringify(data));
			db.db('mmorpg').collection('server_logs').insertOne({'action':'launch','ts':new Date()})
			callback(null, db.db('mmorpg'));
		}
	});
};

//operaciones tratamiento
let altaUsuario = (database, jsonRecibido, connection) => {
    //miro si existe el usuario
    var returnMessage = '{"return":"No se ha podido completar ninguna acción", "error_code":-1}'
    database.collection(coleccion_usuarios).findOne({'user':jsonRecibido.user}, function(err, result) {
    if (err) throw err;
    if (result == null){//no hay user, damos de alta
        database.collection(coleccion_usuarios).insertOne({'user':jsonRecibido.user,'password':jsonRecibido.password,'fecha_alta':new Date()})
        returnMessage = '{"return":"Dado de alta con éxito", "error_code":0}'
    }
    else{
        returnMessage = '{"return":"Ya existia el usuario", "error_code":1}'
        console.log(result);
    }
    returnMessage['operacion'] = jsonRecibido.operacion;
    connection.sendUTF(returnMessage)
    
    });
    //database.collection('server_logs').insertOne({'action':'msg_rcv','ts':new Date()})
}

//operaciones tratamiento
//json input:
// user
// password
//json outupt
// return - texto 
// error_code - código error (0 si ok)
// ticket_id - ticket de sesión
let validaUsuario = (database, jsonRecibido, connection) => {
    //miro si existe el usuario
    var returnMessage = {"return":"No se ha podido completar ninguna acción", "error_code":-1}
    //ojo, no permitmos que se loguen si ya está logueado!!!!!
    var query = {'user':jsonRecibido.user,'password':jsonRecibido.password,active:{$not:{$eq:true}}};
    var currentX = Math.floor(Math.random()*width);
    var currentY = Math.floor(Math.random()*height);
    var actualizar = {$set:{'active':true,'last_action':new Date(), 'x':currentX, 'y':currentY}};
    database.collection(coleccion_usuarios).updateOne(query, actualizar, (err, result) => {
    if (err) throw err;
    if (result.result.n == 0){//no hay user, o hay usuario y ya está conectado
        returnMessage = {"return":"Usuario no válido", "error_code":403}
    }
    else{
        var currentID = new ObjectId();
        jugadoresconectados[currentID] = {'user':jsonRecibido.user,'last_action':new Date()};
        //aquí guarda los tokens, hay que limpiarlo luego
        
        returnMessage = {"return":"OK", "error_code":0, "ticket_id":currentID, "x":currentX, "y":currentY};
        console.log('Usuario '+jsonRecibido.user+' conectado');
        //actualizamos usuario
    }
    returnMessage['operacion'] = jsonRecibido.operacion;

    connection.sendUTF(JSON.stringify(returnMessage))
    
    });
    //database.collection('server_logs').insertOne({'action':'msg_rcv','ts':new Date()})
}


let comeFruta = (database, jsonRecibido, connection) => {
    var returnMessage = {"return":"No se ha podido completar ninguna acción", "error_code":-1};
    //1- valido ticket
    var currentTicket = jsonRecibido.ticket;
    var fruit_id = jsonRecibido.id_fruta;
    if (!jugadoresconectados[currentTicket]){
        returnMessage['operacion'] = jsonRecibido.operacion;
        connection.sendUTF(JSON.stringify(returnMessage));
    }
    else{
        currentPlayer = jugadoresconectados[currentTicket].user;
        //actualizo última acción jugador
        jugadoresconectados[currentTicket].last_action=new Date();
        var query = {'_id':ObjectId(fruit_id), 'alive':true};
        var actualizar = {$set:{'alive':false}};
        database.collection(entity_collection).updateOne(query, actualizar, (err, res) =>{
            if (err) throw err;
            else {
                if (res.result.n > 0) //hemos tenido éxito comiendo la fruta
                {
                    console.log('player '+currentPlayer+' eats fruit:'+fruit_id);
                    returnMessage={};
                    returnMessage['operacion'] = jsonRecibido.operacion;
                    returnMessage['fruit_id']=fruit_id;
                    connection.sendUTF(JSON.stringify(returnMessage));
                }
            }
        });
        
    }

}
let dameEntidades = (database, jsonRecibido, connection) => {
    var returnMessage = {"return":"No se ha podido completar ninguna acción", "error_code":-1};
    //1- valido ticket
    var currentTicket = jsonRecibido.ticket;
    var currentX = jsonRecibido.x;
    var currentY = jsonRecibido.y;
    if (!jugadoresconectados[currentTicket]){
        returnMessage['operacion'] = jsonRecibido.operacion;
        connection.sendUTF(JSON.stringify(returnMessage));
    }
    else{
        currentPlayer = jugadoresconectados[currentTicket].user;
        //actualizo última acción jugador
        jugadoresconectados[currentTicket].last_action=new Date();
        var query = {'user':currentPlayer};
        var actualizar = {$set:{'active':true,'last_action':new Date(), 'x':currentX, 'y':currentY}};
        database.collection(coleccion_usuarios).updateOne(query, actualizar, (err, res) =>{
            if (err) throw err;
            else {
                //console.log('update '+currentPlayer+', x:'+currentX+', y:'+currentY);
            }
        });
        //ahora pido entidades y luego usuarios
        returnMessage={};
        returnMessage['operacion'] = jsonRecibido.operacion;
        database.collection(entity_collection).find({'alive':true}).toArray( (err,result) =>{
            if (err) throw err;
            else {
                returnMessage.entities=result;
                connection.sendUTF(JSON.stringify(returnMessage));
            } 
        });
        //y los mando de vuelta con : connection.sendUTF(JSON.stringify(returnMessage));
    }

}

let dameEnemigos = (database, jsonRecibido, connection) => {
    var returnMessage = {"return":"No se ha podido completar ninguna acción", "error_code":-1};
    //1- valido ticket
    var currentTicket = jsonRecibido.ticket;
    if (!jugadoresconectados[currentTicket]){
        returnMessage['operacion'] = jsonRecibido.operacion;
        connection.sendUTF(JSON.stringify(returnMessage));
    }
    else{
        currentPlayer = jugadoresconectados[currentTicket].user;
        //actualizo última acción jugador
        jugadoresconectados[currentTicket].last_action=new Date();
        var query = {'active':true,'user':{$not:{$eq:currentPlayer}}};
        var proyeccion = { 'projection':{'_id':1, 'x':1, 'y':1}};
        //ahora pido entidades y luego usuarios
        returnMessage={};
        returnMessage['operacion'] = jsonRecibido.operacion;
        database.collection(coleccion_usuarios).find(query, proyeccion).toArray( (err,result) =>{
            if (err) throw err;
            else {
                returnMessage.enemies=result;
                connection.sendUTF(JSON.stringify(returnMessage));
            } 
        });
        //y los mando de vuelta con : connection.sendUTF(JSON.stringify(returnMessage));
    }

}


let startServer = (database) => {
	
	var server = http.createServer(function(request, response) {
		//No hay que implementar nada, porque vamos a tirar por websockets
	});
	server.listen(websocket_port, function() { });

	// creo el server websocket
	wsServer = new WebSocketServer({
		httpServer: server
	});

	//cuando recibo request, hago:
	wsServer.on('request', function(request) {
		var connection = request.accept(null, request.origin);

		//este callback es el core
		connection.on('message', function(message) {
			
			if (message.type === 'utf8') {
			 // console.log("Mensaje recibido");
			  //Distinguimos por mensaje
			//  console.log(message.utf8Data)
			  var jsonRecibido = JSON.parse(message.utf8Data)
			  
			  //INI cambio para crear usuarios
			  if (jsonRecibido.operacion === 'crea_usuario'){
                altaUsuario(database, jsonRecibido, connection)
			  }
			   //FIN cambio para crear usuarios
              //valida usuario
			  //INI cambio para crear usuarios
			  if (jsonRecibido.operacion === 'valida_usuario'){
                validaUsuario(database, jsonRecibido, connection)
              }
			  if (jsonRecibido.operacion === 'dame_entidades'){
                dameEntidades(database, jsonRecibido, connection)
              }
			  if (jsonRecibido.operacion === 'come_fruta'){
                comeFruta(database, jsonRecibido, connection)
              }
			  if (jsonRecibido.operacion === 'dame_enemigos'){
                dameEnemigos(database, jsonRecibido, connection)
			  }
			  //dame usuarios
			  //dame criaturas
			  //come algo
			  
			}
			
		});

		connection.on('close', function(connection) {
		console.log("CERRADO");
		});
	});
};

// quita del objeto de jugadores conectados al jugador, para eliminar su ticket
let kickPlayers = () =>{
    for (i in jugadoresconectados){
        if (jugadoresconectados[i].last_action.getTime() < ((new Date()).getTime()-timeoutPlayers) ){
            console.log("Kick Player");
            delete jugadoresconectados[i];
        }
    }
}
mongodbConnect(mongoConf, (err, db) => {
    setInterval(kickPlayers,5000);
	if (!err) startServer(database = db);
	else {
		console.error(err);
	}
});

