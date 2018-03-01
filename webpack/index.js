var webpack = require( 'webpack' )
var path = require( 'path' )
var NodeExternals = require( 'webpack-node-externals' )

module.exports = {
  context: path.resolve( __dirname + '/..' ),
  entry: [
    './src/index'
  ],
  output: {
    path: path.resolve( './' ),
    libraryTarget: 'umd',
    filename: 'index.js'
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
    NodeExternals()
  ]
}
