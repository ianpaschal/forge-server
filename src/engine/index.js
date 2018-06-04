// Forge Server source code is distributed under the MIT license.

import { Engine, State } from "aurora";
import Path from "path";
import terrainSystem from "./systems/terrain";
import productionSystem from "./systems/production";
import movementSystem from "./systems/movement";

const engine = new Engine();

engine.pluginManager.addLocation( Path.resolve( "plugins" ) );

export default engine;
