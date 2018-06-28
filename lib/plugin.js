const templates = require( './mp/templates' )

class MPRegularPlugin {
  constructor( options = {} ) {
    this.options = options
  }

  apply( compiler ) {
    const cssChunks = this.options.cssChunks || []

    compiler.plugin( "compilation", function( compilation ) {
      compilation.plugin( "optimize-extracted-chunks", chunks => {
        function hasExtractedCSSInChunk( chunkName ) {
          return chunks
            .some( chunk => {
              return chunk.name === chunkName && chunk.getNumberOfModules() > 0
            } )
        }

        const filterChunkNames = cssChunks
          .filter( chunkName => hasExtractedCSSInChunk( chunkName ) )

        console.log( 'optimize-extracted-chunks', filterChunkNames )

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
  }
}

module.exports = MPRegularPlugin;
