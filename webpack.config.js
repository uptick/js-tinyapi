var webpack = require( 'webpack' )
var path = require( 'path' )
var PeerDepsExternalsPlugin = require( 'peer-deps-externals-webpack-plugin' )

module.exports = {
  target: 'web',
  entry: [
    './src/index'
  ],
  output: {
    path: path.resolve( './' ),
    filename: 'index.js',
    library: 'js-tinyapi',
    libraryTarget: 'umd'
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
  plugins: [
    new PeerDepsExternalsPlugin()
  ]
}
