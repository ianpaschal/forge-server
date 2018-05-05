const Webpack = require( "webpack" );

module.exports = {
	target: "node",
	node: {
		__dirname: true,
		__filename: true,
	},
	entry: {
		main: "./src/server.js",
	},
	module: {
		loaders: [
			{
				test: /\.(png|jpg|gif|svg)$/,
				loader: "file-loader",
				query: {
					name: "[name].[ext]?[hash]"
				}
			}
		]
	},
	plugins: [
		new Webpack.EnvironmentPlugin( [
			"NODE_ENV",
		] ),
		new Webpack.IgnorePlugin( /uws/ )
	],
};
