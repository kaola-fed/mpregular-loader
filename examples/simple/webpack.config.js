const path = require( 'path' )
const ExtractTextPlugin = require( 'extract-text-webpack-plugin' )
const webpack = require( 'webpack' )
const MPRegularPlugin = require( '../../lib/plugin' )

module.exports = {
  entry: {
    'app': path.resolve( __dirname, 'src/index.js' ),
    'a/pages/detail/index': path.resolve( __dirname, 'src/a/pages/detail/index.js' ),
    'a/pages/detail2/index': path.resolve( __dirname, 'src/a/pages/detail2/index.js' ),
    'b/pages/test/index': path.resolve( __dirname, 'src/b/pages/test/index.js' ),
  },
  devtool: 'source-map',
  output: {
    path: path.resolve( __dirname, 'dist/' ),
    filename: 'static/js/[name].js',
    chunkFilename: 'static/js/[id].js'
  },
  resolve: {
    alias: {
      '@': process.cwd()
    }
  },
  module: {
    rules: [
      {
        test: /\.rgl$/,
        use: {
          loader: require.resolve( '../../lib' ),
          options: {
            loaders: {
              css: ExtractTextPlugin.extract( {
                use: 'css-loader',
                fallback: 'style-loader',
              } ),
              less: ExtractTextPlugin.extract( {
                use: [
                  'css-loader',
                  'less-loader'
                ],
                fallback: 'style-loader',
              } ),
            },
          }
        },
      },
      {
        test: /\.js$/,
        include: [ path.resolve( __dirname, 'src' ) ],
        use: [
          'babel-loader',
          {
            loader: require.resolve( '../../lib' ),
            options: {
              checkEntry: true,
            }
          }
        ]
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              name: `static/img/[name].[ext]`
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin( {
      filename: 'static/css/' + '[name]' + '.wxss',
      allChunks: false,
    } ),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: function ( module, count ) {
        // any required modules inside node_modules are extracted to vendor
        return (
          module.resource &&
          /\.js$/.test(module.resource) &&
          module.resource.indexOf('node_modules') >= 0
        ) || count > 1
      }
    }),
    new MPRegularPlugin( {
      cssChunks: [ 'vendor' ]
    } )
  ]
}
