# Instalación y preparación:

1. instalar mongo (acordaros de crear la carpeta de destino, en nuestro caso mongo-data)
```bash
mkdir mongo-data
```
2. instalar node js 

3. con npm instalar:
··* websocket
··* mongodb
··* dotenv
··* sleep
	
	
	
	
# Ejecución

1. Levantamos mongo
```bash
mongod --dbpath mongo-data
```
2. Levantamos backend server
```bash
node server-backend-2.js
```
3. levantamos servidor websockets
```bash
node 4-server-mongo-multifuncional.js
```
..* NOTA: si queremos levantar más de un servidor, debemos especificar los puertos para cada instancia (por defecto el 8000)
···windows:
```bash
set PORT=8001&&node 4-server-mongo-multifuncional.js
```
···linux:
```bash
PORT=8001 node 4-server-mongo-multifuncional.js
```
4. Arrancamos el servidor web (por ejemplo, moongoose en windows) y vamos a la web del juego, que está en 
..* ```pasos/5-juego-final/juego.html```
..* Puedes descargar mongoose desde: https://cesanta.com/binary.html
..* NOTA: Si quieres crear un usuario, debes ir a ```pasos/2-crear-usuario/websocket-crea-usuario.html```
	