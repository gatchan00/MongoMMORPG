//****************Esqueleto para servidor
// Autor: Javier Gómez Santos
// requisitos:
// node.js
// npm install websocket
//
// Ejecutar con:
// node server-esqueleto.js

var WebSocketServer = require('websocket').server;
var http = require('http');

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
        if (message.type === 'utf8') {
          console.log("Mensaje recibido");
        }
		connection.sendUTF('{"return":"Has recibido un mensaje '+Date()+'"}')
	});

    connection.on('close', function(connection) {
    console.log("CERRADO");
    });
});