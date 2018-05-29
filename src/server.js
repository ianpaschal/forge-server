// Forge Server source code is distributed under the MIT license.

import { Entity, JSONLoader, Player, State } from "aurora";
import HTTP from "http";
import Path from "path";
import SocketIO from "socket.io";
import ConsoleStamp from "console-stamp";
import engine from "./engine";
import terrainSystem from "./systems/terrain";
import productionSystem from "./systems/production";
import movementSystem from "./systems/movement";
import * as commands from "./commands";

ConsoleStamp( console, "yyyy-mm-dd HH:MM:ss" );

// Set up:
const server = HTTP.createServer();
const stdin = process.openStdin();

// Use some set up options so we can still bundle with Webpack:
const io = SocketIO( server, {
	serveClient: false,
	wsEngine: "ws"
});

// Config
// TODO: Move to an external .json file
let config;

const configLoader = new JSONLoader;
configLoader.load(
	"./defaults.json",
	( json ) => {
		config = json;
	},
	() => {},
	() => {}
);

/* Player sockets are not the same as player IDs. Each time a given player joins
	they will have a different socket. */
const playerSockets = [];

// engine.pluginManager.addLocation( Path.resolve( "./plugins" ) );
// engine.pluginManager.pluginStack = config[ "plugin-stack" ];
//
// engine.loadAssets(
// 	engine.pluginManager.stack,
// 	( name ) => {
// 		console.log( "Loaded " + name + "." );
// 	},
// 	() => {
// 		// TODO: Check if world exists;
// 		// engine.loadWorld();
// 		// engine.generateWorld( () => {}, () => {
// 		// 	engine.launch();
// 		//
// 		engine.registerSystem( terrainSystem );
// 		engine.registerSystem( productionSystem );
// 		engine.registerSystem( movementSystem );
// 		engine.start();
// 		server.listen( config.port, () => {
// 			console.log( "Listening for connections on port " + config.port + "…" );
// 		});
// 	}
// );
//
// /* Apply all saved user input for the tick before performing the update. */
// engine.onUpdateStart = function() {
// 	// console.log( "derp" );
// };
//
// /* Send the last two computed states to clients. */
// engine.onUpdateFinished = function() {
// 	engine.stateManager.addState( new State( engine ) );
// 	if ( engine.stateManager.numStates > 0 ) {
// 		io.sockets.emit( "state", engine.stateManager.newestState );
// 	}
// };

// io.sockets.on( "connection", ( socket ) => {
io.on( "connection", ( socket ) => {

	// Register the socket:
	playerSockets.push( socket );
	console.log( "Socket " + socket.id + " created." );
	socket.emit( "loadStack", engine.pluginManager.stack );
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
	const player = new Player( data );
	engine.registerPlayer( player );

	// Generate test entities:
	const entity = new Entity();
	player.own( entity );
	entity.copy( engine.getAsset( "assembly", "settlement-age-0" ) );
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
			const player = config.players.find( ( item ) => {
				return item.hash === uuid;
			});
			if ( player ) {
				console.log( "Welcome back " + player.name + "!" );
			}
			else {
				config.players.push({
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

stdin.on( "data", ( chunk ) => {
	const input = chunk.toString( "utf8" ).trim();
	if ( !commands[ input ] ) {
		console.error( "Could not find command '" + input + "'!" );
		return;
	}
	commands[ input ]();
});

engine.pluginManager.pluginStack = config[ "plugin-stack" ];

engine.loadAssets(
	engine.pluginManager.stack,
	( name ) => {
		console.log( "Loaded " + name + "." );
	},
	() => {
		// TODO: Check if world exists;
		// engine.loadWorld();
		// engine.generateWorld( () => {}, () => {
		// 	engine.launch();
		//
		engine.registerSystem( terrainSystem );
		engine.registerSystem( productionSystem );
		engine.registerSystem( movementSystem );
		engine.start();
		server.listen( config.port, () => {
			console.log( "Listening for connections on port " + config.port + "…" );
		});
	}
);

/* Apply all saved user input for the tick before performing the update. */
engine.onUpdateStart = function() {
	// console.log( "derp" );
};

/* Send the last two computed states to clients. */
engine.onUpdateFinished = function() {
	engine.stateManager.addState( new State( engine ) );
	if ( engine.stateManager.numStates > 0 ) {
		io.sockets.emit( "state", engine.stateManager.newestState );
	}
};
