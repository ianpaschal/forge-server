// Forge Server is distributed under the MIT license.
require( "console-stamp" )( console, "HH:MM:ss.l" );

import Aurora from "aurora";
import HTTP from "http";
import Path from "path";
import SocketIO from "socket.io";

// Set up:
const engine = new Aurora.Engine();
const server = HTTP.createServer();

// Use some set up options so we can still bundle with Webpack:
const io = SocketIO( server, {
	serveClient: false,
	wsEngine: "ws"
});

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

server.listen( config.port, () => {
	console.log( "Listening for connections on port " + config.port + "…" );
});

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
