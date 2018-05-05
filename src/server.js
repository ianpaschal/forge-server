// Forge Server is distributed under the MIT license.

import Aurora from "aurora";
import HTTP from "http";
import Path from "path";
import SocketIO from "socket.io";
import UUID from "uuid/v4";
import ConsoleStamp from "console-stamp";

ConsoleStamp( console, "yyyy-mm-dd HH:MM:ss" );

// Set up:
const engine = new Aurora.Engine();
const server = HTTP.createServer();

// Use some set up options so we can still bundle with Webpack:
const io = SocketIO( server, {
	serveClient: false,
	wsEngine: "ws"
});

// Config
// TODO: Move to an external .json file
const config = {
	"pause-on-player-drop": false,
	"port": 5000,
	"plugin-stack": [ "heathlands" ]
};

const uuid = UUID();

/* Player sockets are not the same as player IDs. Each time a given player joins
	they will have a different socket. */
const playerSockets = [];
const playerHashes = [
	{
		hash: "B54A95127A4B573F41E335FDBD339DCC2208FBFB1AE0B6FAB7599D6E2D6EC754",
		name: "Ian"
	}
];

engine.registerPluginLocation( Path.resolve( "./plugins" ) );
engine.setPluginStack( config[ "plugin-stack" ] );

const loadStack = engine.findPlugins();
engine.loadAssets(
	loadStack,
	( name ) => {
		console.log( "Loaded " + name + "." );
	},
	() => {
		// TODO: Check if world exists;
		// engine.loadWorld();
		// engine.generateWorld( () => {}, () => {
		// 	engine.launch();
		//
		engine.launch();
		server.listen( config.port, () => {
			console.log( "Listening for connections on port " + config.port + "…" );
		});
	}
);

/* Apply all saved user input for the tick before performing the update. */
engine.setOnUpdateStart( () => {
	// console.log( "derp" );
});

/* Send the last two computed states to clients. */
engine.setOnUpdateEnd( () => {
	if ( engine.getNumStates() >= 2 ) {
		io.sockets.emit( "state", engine.getLastStates( 2 ) );
	}
});

// io.sockets.on( "connection", ( socket ) => {
io.on( "connection", ( socket ) => {

	// Register the socket:
	playerSockets.push( socket );
	console.log( "Socket " + socket.id + " created." );
	socket.emit( "loadStack", loadStack );
	const data = {
		"name": "Ian",
		"color": "#0000ff",
		"start": {
			"x": 50,
			"y": 50,
			"z": 0
		},
		"resources": {
			"food": 100,
			"wood": 100,
			"metal": 100
		}
	};
	const player = new Aurora.Player( data );
	engine.registerPlayer( player );

	// Generate test entities:
	const entity = new Aurora.Entity();
	player.own( entity );
	entity.copy( engine.getAssembly( "settlement-age-0" ) );
	entity.getComponent( "player" ).apply({
		index: engine._players.indexOf( player )
	});
	entity.getComponent( "position" ).apply({
		x: player.start.x,
		y: player.start.y
	});
	entity.getComponent( "production" ).apply({
		queue: [
			{ "type": "villager-male", "progress": 100 },
			{ "type": "villager-male", "progress": 100 },
			{ "type": "villager-male", "progress": 100 }
		]
	});
	engine.registerEntity( entity );

	const handlers = {
		disconnect() {
			console.log( "Socket " + socket.id + " closed." );
			const i = playerSockets.indexOf( socket );
			playerSockets.splice( i, 1 );
			if ( config[ "pause-on-player-drop" ] ) {
				engine.stop();
			}
		},
		message( data ) {
			console.log( "Message: ", data );
		},
		register( uuid ) {
			console.log( "Registered player" );
			const player = playerHashes.find( ( item ) => {
				return item.hash === uuid;
			});
			if ( player ) {
				console.log( "Welcome back " + player.name + "!" );
			}
			else {
				playerHashes.push({
					name: "Thomas",
					hash: uuid
				});
			}
			// sockets.emit( "state", engine.getLastStates( 2 ) );
			// TODO: Send stack:
			// loadStack
		}
	};

	// Add listeners to the newly created socket:
	socket.on( "disconnect", handlers.disconnect );
	socket.on( "message", handlers.message );
	socket.on( "register", handlers.register );
});
