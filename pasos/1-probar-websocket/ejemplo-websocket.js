function createWebSocket(){
var ws=new WebSocket("ws://127.0.0.1:8000");

ws.onmessage = function (evt) 
	{ 
		if (this.receivedJson===undefined){
			ws.receivedJson = evt.data;
			console.log("recibo mensaje: ");
			console.log(ws.receivedJson)
			var preParsedJson=JSON.parse(ws.receivedJson);
		}
	};
ws.onclose = function()
	{ 
		// websocket is closed.
		console.log("Connection is closed..."); 
	};
ws.onopen=function(){
		this.send("stock explosion");

	}
return ws;
}
var ws=createWebSocket();
/*FIN del websocket*/