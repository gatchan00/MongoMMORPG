
function createWebSocketValidaUsuario(user, pass, server, port){
var ws=new WebSocket("ws://"+server+":"+port);
var currentTicket=null			
var x=0;
var y=0;
const velocity=90;
var entidades=[]; //esto lo rellenará el websocket2
var otrosJugadores=[];
var player=null;
var pedidasEntidades=false;
var pedidasEnemigos=false;
var comida=null;
var otherplayers=null;
var game;
var texto;
var selfphaser;
var score=0;
var comidaPendiente=[];
var lastEntitiesMsg={};
var lastEnemiesMsg={};


let pideEntidades = function(wsocket){
	if (currentTicket && player && pedidasEntidades==false){
		pedidasEntidades=true;
		var mensajePideEntidades = {};
		mensajePideEntidades['operacion'] = 'dame_entidades';
		mensajePideEntidades['ticket'] = currentTicket;
		mensajePideEntidades['x'] = player.x;
		mensajePideEntidades['y'] = player.y;
		wsocket.send(JSON.stringify(mensajePideEntidades));
	}	
}

let pideEnemigos = function(wsocket){
	if (currentTicket && player && pedidasEnemigos==false){
		pedidasEnemigos=true;
		var mensajePideEnemigos = {};
		mensajePideEnemigos['operacion'] = 'dame_enemigos';
		mensajePideEnemigos['ticket'] = currentTicket;
		wsocket.send(JSON.stringify(mensajePideEnemigos));
	}	
}

let cometerUnaFruta = function(wsocket, fruta){
	console.log("Trato de comer una fruta")
	if (currentTicket && player && comidaPendiente.indexOf(fruta._id) > -1){
		//comidaPendiente.push(fruta._id);
		var mensajeComeFruta = {};
		mensajeComeFruta['operacion'] = 'come_fruta';
		mensajeComeFruta['ticket'] = currentTicket;
		mensajeComeFruta['id_fruta'] = fruta._id;
		wsocket.send(JSON.stringify(mensajeComeFruta));
	}	
}

let exitoAlComer = function(parsedJson){
	//cutre al máximo, 
	console.log("Comido");
	score++;
	texto.setText('SCORE: '+score);
}

let procesaEnemigos = function (parsedJson) 
	{ 
		pedidasEnemigos=false;
		if (parsedJson==lastEntitiesMsg){return;}
		else{ lastEnemiesMsg=parsedJson;}
		//aquí tenemos que llenar los puntos de comida
		//console.log(parsedJson);
		if (otherplayers){

			otherplayers.clear(true);
			if (parsedJson.enemies){

				for (var i=0; i<parsedJson.enemies.length; i++){
					var x=parsedJson.enemies[i].x;
					var y=parsedJson.enemies[i].y;
					var enemigo = otherplayers.create(x,y,'enemy');	
					enemigo.name='enemy'+x+'_'+y;
					enemigo._id=parsedJson.enemies[i]._id;
					enemigo.setScale(0.2,0.2);
				}
				//selfphaser.physics.add.overlap(player, comida, collectComida, null, game);
				//console.log("creada comida");
			}
		}
		else{
		//	console.log("Recibidas entidades");
		}
		//console.log(parsedJson);
	};

let procesaEntidades = function (parsedJson) 
	{ 
		//console.log(game.scene);
		pedidasEntidades=false;
		if (JSON.stringify(parsedJson)==JSON.stringify(lastEntitiesMsg)){return;}
		else{ lastEntitiesMsg=parsedJson;}
		console.log("Cambios entidades");
		//console.log(JSON.stringify(lastEntitiesMsg));
		//console.log(JSON.stringify(parsedJson));
		//aquí tenemos que llenar los puntos de comida
		if (comida){
			/*comida.children.iterate(function (child) {
				comida.remove(child);
			});*/
			comida.clear(true);
			if (parsedJson.entities){

				for (var i=0; i<parsedJson.entities.length; i++){
					var x=parsedJson.entities[i].x;
					var y=parsedJson.entities[i].y;
					if (comidaPendiente.indexOf(parsedJson.entities[i]._id)<0){
						var fruta = comida.create(x,y,'fruit');	
						fruta.name='fruta_'+x+'_'+y;
						fruta._id=parsedJson.entities[i]._id;
						fruta.setScale(1.0,1.0);
					}
					
				}
				selfphaser.physics.world.colliders.destroy();
				selfphaser.physics.add.overlap(player, comida, collectComida, null, game);
				//console.log("creada comida");
			}
		}
		else{
		//	console.log("Recibidas entidades");
		}
		//console.log(parsedJson);
	};

let collectComida =function (player, fruta)
{
	console.log("trato de comer "+fruta._id);
	if (comidaPendiente.indexOf(fruta._id)<0)
	{
		comidaPendiente.push(fruta._id);
		cometerUnaFruta(ws, fruta);
	}
	fruta.disableBody(true, true);
	fruta.destroy();
}
let juegoPhaser=function(){
	var config = {
        type: Phaser.CANVAS, //Phaser.AUTO,
        width: 800,
        height: 600,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 }
            }
        },
        scene: {
            preload: preload,
			create: create,
			update: update
        }
    };

    game = new Phaser.Game(config);

    function preload ()
    {
        //this.load.setBaseURL('http://labs.phaser.io');
		this.load.image('fruit', '../assets/strawberry_transparent.png');
		this.load.image('player', '../assets/iPO7X.png');
		this.load.image('enemy', '../assets/v8s2S.png');

		this.load.image('sky', '../assets/space3.png'); 
    }

    function create ()
    {
		selfphaser = this;
		this.add.image(400, 300, 'sky');
		player = this.physics.add.sprite(x, y, 'player');
		player.setScale(0.2,0.2);
		cursors = this.input.keyboard.createCursorKeys();
		comida = this.physics.add.group();//this.physics.add.staticGroup();
		otherplayers = this.physics.add.group();
		texto = this.add.text(16, 16, 'SCORE: 0', { fill: '#ffffff' });
	}
	function update ()
    {
		//lanzamos websockets
		//pideEntidades(ws);
		//pideEnemigos(ws);
		if (cursors.left.isDown)
		{
			player.setVelocityX(-velocity);
		}
		else if (cursors.right.isDown)
		{
			player.setVelocityX(velocity);
		}
		else{
			player.setVelocityX(0);
		}

		if (cursors.down.isDown)
		{
			player.setVelocityY(+velocity);
		}
		else if (cursors.up.isDown)
		{
			player.setVelocityY(-velocity);
		}
		else
		{
			player.setVelocityY(0);
		}

		//hago el check del overlapping
		/*if (comida){
			texto.setText("NO Tengo que comer");
			comida.children.iterate(function (child) {
				if (overlap(player,child)){
					texto.setText("Tengo que comer "+child.name);
				}
			});
		}*/
    }
}

ws.onopen=function(){
		var mensajeValidaUsuario = {};
		mensajeValidaUsuario['operacion'] = 'valida_usuario';
		mensajeValidaUsuario['user'] = user;
		mensajeValidaUsuario['password'] = pass;
		this.active=true;
		this.send(JSON.stringify(mensajeValidaUsuario));
		setInterval(pideEntidades,50,ws);
		setInterval(pideEnemigos,50,ws);
	}
ws.onmessage = function (evt) 
	{ 
		//cojo el mensaje
		receivedJSON = JSON.parse(evt.data);
		if (receivedJSON.operacion=='dame_entidades'){
			procesaEntidades(receivedJSON);
		} 
		if (receivedJSON.operacion=='dame_enemigos'){
			procesaEnemigos(receivedJSON);
		} 
		if (receivedJSON.operacion=='come_fruta'){
			exitoAlComer(receivedJSON);
		}
		if (receivedJSON.error_code!=0 && receivedJSON.operacion=='valida_usuario'){
			document.getElementById("mensajeWS").innerHTML = receivedJSON.return;
		}
		if (this.gameStarted===undefined && receivedJSON.error_code==0 && receivedJSON.operacion=='valida_usuario'){
			currentTicket=receivedJSON.ticket_id;
			this.gameStarted == true;
			x=receivedJSON.x;
			y=receivedJSON.y;
			document.getElementById("idbody").innerHTML = null;
			juegoPhaser();
		}
	};
ws.onclose = function()
	{ 
		this.active=false;
		console.log("Connection is closed..."); 
	};
}



/*FIN del websocket*/