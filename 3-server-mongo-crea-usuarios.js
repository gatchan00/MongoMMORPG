//****************Esqueleto para servidor
// Autor: Javier Gómez Santos
// requisitos:
// node.js
// npm install websocket
// npm install mongodb
//
// Ejecutar con:
// node server-esqueleto.js

var WebSocketServer = require('websocket').server;
var http = require('http');
var mongo = require('mongodb');
require('dotenv').config()

//Inicializo mongo (abro conexión)
var url = "mongodb://localhost:27017/";


let test = {
	uri: "mongodb://localhost:27017",
	options: {
		keepAlive: 1,
		connectTimeoutMS: 30000,
		useNewUrlParser: true,
		socketTimeoutMS: 0,
		autoReconnect: true
	}
};

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

let startServer = (database) => {
	
	var server = http.createServer(function(request, response) {
		//No hay que implementar nada, porque vamos a tirar por websockets
	});
	server.listen(8000, function() { });

	// creo el server websocket
	wsServer = new WebSocketServer({
		httpServer: server
	});

	//cuando recibo request, hago:
	wsServer.on('request', function(request) {
		var connection = request.accept(null, request.origin);

		//este callback es el core
		connection.on('message', function(message) {
			var returnMessage = '{"return":"No se ha podido completar ninguna acción", "error_code":"-1"}'
			if (message.type === 'utf8') {
			  console.log("Mensaje recibido");
			  //Distinguimos por mensaje
			  console.log(message.utf8Data)
			  var jsonRecibido = JSON.parse(message.utf8Data)
			  
			  //INI cambio para crear usuarios
			  if (jsonRecibido.operacion === 'crea_usuario'){
				 //miro si existe el usuario
				 database.collection('usuarios').findOne({'user':jsonRecibido.user}, function(err, result) {
					if (err) throw err;
					if (result == null){//no hay user, damos de alta
						database.collection('usuarios').insertOne({'user':jsonRecibido.user,'password':jsonRecibido.password,'fecha_alta':new Date()})
						returnMessage = '{"return":"Dado de alta con éxito", "error_code":"0"}'
					}
					else{
						returnMessage = '{"return":"Ya existia el usuario", "error_code":"1"}'
						console.log(result);
					}
					connection.sendUTF(returnMessage)
					
				  });
				 //database.collection('server_logs').insertOne({'action':'msg_rcv','ts':new Date()})
			  }
			   //FIN cambio para crear usuarios
			  
			}
			
		});

		connection.on('close', function(connection) {
		console.log("CERRADO");
		});
	});
};

mongodbConnect(test, (err, db) => {
	if (!err) startServer(database = db);
	else {
		console.error(err);
	}
});

