const webpack = require('webpack')
const path = require('path')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const PeerDepsExternalsPlugin = require('peer-deps-externals-webpack-plugin')

function configure(env) {

  let config = {
    target: 'web',
    entry: [
      './src/index'
    ],
    output: {
      path: path.resolve('./'),
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
      modules: [
        path.resolve(__dirname, 'src'),
        'node_modules'
      ],
      extensions: [
        '.js', '.jsx'
      ]
    },
    plugins: [
      new PeerDepsExternalsPlugin()
    ]
  }

  if (env && env.production) {
    config.plugins = config.plugins.concat([
      new webpack.HashedModuleIdsPlugin(),
      new CleanWebpackPlugin([config.output.path], {root: path.resolve('..')})
    ])
    config.optimization = {
      minimizer: [
        new UglifyJsPlugin({
          uglifyOptions: {
            compress: {
              pure_funcs: [
                'console.debug'
              ]
            }
          }
        })
      ]
    }
  }

  return config
}

module.exports = configure
