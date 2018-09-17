
function createWebSocketValidaUsuario(user, pass, mensaje){
var ws=new WebSocket("ws://127.0.0.1:8000");
var currentTicket=null			

let juegoPhaser=function(){
	var config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 200 }
            }
        },
        scene: {
            preload: preload,
            create: create
        }
    };

    var game = new Phaser.Game(config);

    function preload ()
    {
        //this.load.setBaseURL('http://labs.phaser.io');

        this.load.image('sky', '../assets/space3.png');
        this.load.image('logo', '../assets/phaser3-logo.png');
        this.load.image('red', '../assets/red.png');
    }

    function create ()
    {
        this.add.image(400, 300, 'sky');

        var particles = this.add.particles('red');

        var emitter = particles.createEmitter({
            speed: 100,
            scale: { start: 1, end: 0 },
            blendMode: 'ADD'
        });

        var logo = this.physics.add.image(400, 100, 'logo');

        logo.setVelocity(100, 200);
        logo.setBounce(1, 1);
        logo.setCollideWorldBounds(true);

        emitter.startFollow(logo);
    }
}

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

			if (preParsedJson.error_code==0){
				currentTicket=preParsedJson.ticket_id;
				document.getElementById("idbody").innerHTML = null;
				juegoPhaser();
			}
			document.getElementById(mensaje).innerHTML = currentTicket
		}
	};
ws.onclose = function()
	{ 
		// websocket is closed.
		console.log("Connection is closed..."); 
	};
}



/*FIN del websocket*/