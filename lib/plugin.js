const templates = require( './mp/templates' )
const getAppConfig = require( './utils/get-app-config' )

class MPRegularPlugin {
  constructor( options = {} ) {
    this.options = options
  }

  apply( compiler ) {
    const cssChunks = this.options.cssChunks || []

    compiler.plugin( 'compilation', function( compilation ) {

      compilation.plugin( "optimize-extracted-chunks", chunks => {
        function hasExtractedCSSInChunk( chunkName ) {
          return chunks
            .some( chunk => {
              return chunk.name === chunkName && chunk.getNumberOfModules() > 0
            } )
        }

        const filterChunkNames = cssChunks
          .filter( chunkName => hasExtractedCSSInChunk( chunkName ) )

        Object.keys( compiler.options.entry )
          .forEach( key => {
            const content = templates.css( {
              entryKey: key,
              cssChunks: filterChunkNames
            } )
            const bytes = Buffer.byteLength( content, 'utf8' )
            compilation.assets[ `${ key }.wxss` ] = {
              size() {
                return bytes
              },
              source() {
                return content
              }
            }
          } )

      } )

    } )

    // subpackages
    compiler.plugin( 'emit', ( compilation, callback ) => {

      getAppConfig( compiler, compilation )
        .then( config => {
          const subPackages = config.subPackages || []
          const subPages = []

          subPackages.forEach( pkg => {
            pkg.pages.map( page => {
              subPages.push( {
                path: pkg.root + '/' + trimCaret( page ),
                root: pkg.root
              } )
            } )
          } )

          // trim '^'
          function trimCaret( str ) {
            return str.replace( /(^\^|\^$)/g, '' )
          }

          function isInSubPackage( entryKey, subPages ) {
            return subPages.some( page => {
              return entryKey.indexOf( page.path ) === 0
            } )
          }

          function getRootByEntryKey( entryKey, subPages ) {
            let root = ''

            subPages.some( page => {
              if ( entryKey.indexOf( page.path ) === 0 ) {
                root = page.root
                return true
              }

              return false
            } )

            return root
          }

          const relocates = []

          const entrypoints = compilation.entrypoints
          Object.keys( entrypoints )
            // 1. filter entry key which is defined in subPackages
            .filter( entryKey => {
              return isInSubPackage( entryKey, subPages )
            } )
            // 2. find origin entry for emitted .js file
            .forEach( entryKey => {
              const entrypoint = entrypoints[ entryKey ]
              const chunks = entrypoint.chunks || []
              const filtered = chunks.filter( chunk => chunk.name === entrypoint.name )[ 0 ]
              const files = filtered.files || []
              const jsFile = files.filter( v => v.endsWith( '.js' ) )[ 0 ]
              const jsSourceMapFile = files.filter( v => v.endsWith( '.js.map' ) )[ 0 ]

              if ( jsFile ) {
                relocates.push( {
                  entry: entryKey,
                  jsPath: jsFile,
                  jsSourceMapPath: jsSourceMapFile,
                } )
              }
            } )

            // relocate subPackages files
            relocates.forEach( r => {
              const root = getRootByEntryKey( r.entry, subPages )
              relocate( r.jsPath, root, compilation )
              relocate( r.jsSourceMapPath, root, compilation )
            } )

            function relocate( filepath, root, compilation ) {
              const asset = compilation.assets[ filepath ]
              if ( asset ) {
                delete compilation.assets[ filepath ]
                compilation.assets[ root + '/' + filepath ] = asset
              }
            }

            callback()
        } )

    } )
  }
}

module.exports = MPRegularPlugin;
