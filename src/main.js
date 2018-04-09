// Forge Server is distributed under the MIT license.

import Aurora from "aurora";
import Express from "express";
import HTTP from "http";
import Path from "path";
import SocketIO from "socket.io";

// Set up:
const engine = new Aurora.Engine();
const app = Express();
const server = HTTP.Server( app );
const io = SocketIO( server );

// Config
const config = {
	"pause-on-player-drop": true,
	"port": 5000
};
const playerSockets = [];

engine.registerPluginLocation( Path.join( "./", "plugins" ) );
engine.init(
	false,
	false,
	() => {
		console.log( "Loaded a bit." );
	},
	() => {
		engine.start();
	}
);

/* Aurora will call the onUpdate handler after every update. This the point
	where we send the last two computed states to clients. */
engine.onUpdateEnd = function() {
	if ( engine.getNumStates() >= 2 ) {
		io.sockets.emit( "state", engine.getLastStates( 2 ) );
	}
};

/*
const engine = {
	running: false,
	start() {
		// Start listening for connections:
		server.listen( config.port, () => {
			console.log( "Starting server on port " + config.port + "..." );
		});

		// Start the world:
		console.log( "Ready to play! Starting world." );
		engine.running = true;
		setInterval( () => {

		}, 1000 );
	},
	stop() {
		engine.running = false;
	},
	states: []
};
*/

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

// Here we go!
engine.start();
