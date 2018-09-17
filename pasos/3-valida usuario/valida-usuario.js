
function createWebSocketValidaUsuario(user, pass, mensaje){
var ws=new WebSocket("ws://127.0.0.1:8000");
var currentTicket=null
ws.onopen=function(){
		var mensajeValidaUsuario = {};
		mensajeValidaUsuario['operacion'] = 'valida_usuario';
		mensajeValidaUsuario['user'] = user;
		mensajeValidaUsuario['password'] = pass;
		this.send(JSON.stringify(mensajeValidaUsuario));
	}
ws.onmessage = function (evt) 
	{ 
		if (this.receivedJson===undefined){
			ws.receivedJson = evt.data;
			console.log("recibo mensaje: ");
			console.log(ws.receivedJson)
			var preParsedJson=JSON.parse(ws.receivedJson);
			document.getElementById(mensaje).innerHTML = ws.receivedJson
		}
	};
ws.onclose = function()
	{ 
		// websocket is closed.
		console.log("Connection is closed..."); 
	};
}



/*FIN del websocket*/