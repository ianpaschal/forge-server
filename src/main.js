// Forge Server is distributed under the MIT license.

const express = require( "express" );
const http = require( "http" );
const socketIO = require( "socket.io" );

// Set up:
const app = express();
const server = http.Server( app );
const io = socketIO( server );

// Config
const config = {
	"pause-on-player-drop": true,
	"port": 5000
};
const playerSockets = [];

const engine = {
	"running": false,
	start() {
		// Start listening for connections:
		server.listen( config.port, () => {
			console.log( "Starting server on port 5000" );
		});

		// Start the world:
		console.log( "Ready to play! Starting world." );
		engine.running = true;
	},
	stop() {
		engine.running = false;
	}
};

setInterval( () => {
	io.sockets.emit( "message", "hi!" );
}, 1000 );

io.sockets.on( "connection", ( socket ) => {

	// Register the socket:
	playerSockets.push( socket );
	console.log( "Player " + socket.id + " connected." );

	// Add a listener to the newly created socket:
	socket.on( "disconnect", () => {
		console.log( "Player " + socket.id + " disconnected." );

		const i = playerSockets.indexOf( socket );
		playerSockets.splice( i, 1 );

		if ( config[ "pause-on-player-drop" ] ) {
			engine.stop();
		}
	});
});
