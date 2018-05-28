// Forge Server source code is distributed under the MIT license.

import { Engine, State } from "aurora";
import Path from "path";
import terrainSystem from "./systems/terrain";
import productionSystem from "./systems/production";
import movementSystem from "./systems/movement";

const engine = new Engine();

const config = {
	"pause-on-player-drop": false,
	"port": 5000,
	"plugin-stack": [ "heathlands" ]
};

engine.pluginManager.addLocation( Path.resolve( "../plugins" ) );
