var webpack = require( 'webpack' )
var path = require( 'path' )
var NodeExternals = require( 'webpack-node-externals' )

module.exports = {
  context: path.resolve( __dirname + '/..' ),
  entry: [
    './src/middleware'
  ],
  output: {
    path: path.resolve( './' ),
    libraryTarget: 'umd',
    filename: 'middleware.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  resolve: {
    extensions: [
      '.js', '.jsx'
    ]
  },
  externals: [
    NodeExternals(),
    'js-tinyapi'
  ]
}
