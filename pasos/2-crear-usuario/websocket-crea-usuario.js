
function createWebSocketNuevoUsuario(user, pass, mensaje){
var ws=new WebSocket("ws://127.0.0.1:8000");

ws.onopen=function(){
		var mensajeCreaUsuario = {};
		mensajeCreaUsuario['operacion'] = 'crea_usuario';
		mensajeCreaUsuario['user'] = user;
		mensajeCreaUsuario['password'] = pass;
		this.send(JSON.stringify(mensajeCreaUsuario));
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