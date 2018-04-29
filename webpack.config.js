module.exports = {
	watch: true,
	target: "node",
	node: {
		__dirname: true,
		__filename: true,
	},
	entry: "./src/server.js",
	output: {
		path: __dirname + "/dist/",
		filename: "server.bundle.js"
	},
	devtool: "eval-source-map",
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
	}
};
