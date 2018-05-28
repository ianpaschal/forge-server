const Path = require( "path" );
const merge = require( "webpack-merge" );
const baseConfig = require( "./base.config.js" );

module.exports = merge( baseConfig, {
	output: {
		path: Path.resolve( __dirname, "../dist/" ),
		filename: "server.bundle.js"
	},
	devtool: "source-map"
});
