import engine from "./engine";

export function save() {
	console.log( "Saving world..." );
}

export function stop() {
	engine.stop();
	console.log( "Saving world..." );
	console.log( "Shutting down..." );
	process.exit();
}
