const path = require('path');
//var UglifyJsPlugin = require('uglifyjs-webpack-plugin');
//const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env, options) => {
		//console.log(`This is the Webpack 4 'mode': ${options.mode}`);
		if(options.mode == 'development'){

			return {
				mode: 'development',
				entry: {
					index: './app/js/index.js',
					//inner: './app/js/inner.js'
				},
				devtool: "source-map",
				output: {
				filename: '[name].js',
				path: path.resolve(__dirname, 'app/js/bundle')
				//path: './'+prjConfig.dist+'/bundle'
				//path: path.resolve(__dirname, 'dist')
				//path: path.resolve(__dirname, 'dist')
				},
				externals: {
						// require("jquery") is external and available
						//	on the global var jQuery
						"jquery": "jQuery"
				}
			};
		} else {
			return {
				mode: 'production',
				entry: {
					index: './app/js/index.js',
					//inner: './app/js/inner.js'
				},
				//devtool: "source-map",
				output: {
				filename: '[name].js',
				path: path.resolve(__dirname, 'dist/js')
				//path: './'+prjConfig.dist+'/bundle'
				//path: path.resolve(__dirname, 'dist')
				//path: path.resolve(__dirname, 'dist')
				},
				optimization: {
						//minimize: true,
			/*			minimizer: [new TerserPlugin({
						parallel: true,
						terserOptions: {
							warnings: false,
							ecma: 6,
						},
					})],*/
					},
				externals: {
						// require("jquery") is external and available
						//	on the global var jQuery
						"jquery": "jQuery"
				}
			};
		}
}