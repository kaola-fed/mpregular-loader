const parse5 = require( 'parse5' )
const deindent = require( './utils/deindent' )
const hash = require( 'hash-sum' )
const cache = require( 'lru-cache' )( 100 )
const SourceMapGenerator = require( 'source-map' ).SourceMapGenerator

const splitRE = /\r?\n/g
const emptyRE = /^\s*$/

function getCommentSymbol() {
  return '//'
}

function getAttribute( node, name ) {
  if ( node.attrs ) {
    let i = node.attrs.length
    let attr
    while ( i-- ) {
      attr = node.attrs[ i ]
      if ( attr.name === name ) {
        return attr.value
      }
    }
  }
}

function commentScript( content ) {
  const symbol = getCommentSymbol()
  const lines = content.split( splitRE )
  return lines
    .map( function ( line, index ) {
      // preserve EOL
      if ( index === lines.length - 1 && emptyRE.test( line ) ) {
        return ''
      }

      return symbol + ( emptyRE.test( line ) ? '' : ' ' + line )
    } )
    .join( '\n' )
}

function parse( content, filename, needMap ) {
  const cacheKey = hash( filename + content )
  // source-map cache busting for hot-reloadded modules
  const filenameWithHash = filename + '?' + cacheKey

  let output = cache.get( cacheKey )

  if ( output ) {
    return output
  }

  output = {
    template: [],
    style: [],
    script: []
  }

  const fragment = parse5.parseFragment( content, {
    locationInfo: true
  } )

  fragment.childNodes.forEach( function ( node ) {
    const tagName = node.tagName
    const lang = getAttribute( node, 'lang' )
    const scoped = getAttribute(node, 'scoped') != null // eslint-disable-line
    let map = null

    if ( !output[ tagName ] ) {
      return
    }

    if ( tagName === 'template' ) {
      node = node.content
    }

    const start = node.childNodes[ 0 ].__location.startOffset
    const end = node.childNodes[ node.childNodes.length - 1 ].__location.endOffset

    let result
    if ( tagName === 'script' ) {
      result =
        commentScript( content.slice( 0, start ) ) +
        deindent( content.slice( start, end ) ) +
        commentScript( content.slice( end ) )
    } else {
      const lineOffset = content.slice( 0, start ).split( splitRE ).length - 1
      result = deindent( content.slice( start, end ) )
      result = Array( lineOffset + 1 ).join( '\n' ) + result
    }

    if ( needMap ) {
      // generate source map
      map = new SourceMapGenerator()
      map.setSourceContent( filenameWithHash, content )

      // do not add mappings for comment lines - babel's source map
      // somehow gets messed up because of it
      const isCommentLine = function ( line ) {
        return tagName === 'script' && line.indexOf( getCommentSymbol() ) === 0
      }

      result.split( splitRE ).forEach( function ( line, index ) {
        if ( !emptyRE.test( line ) && !isCommentLine( line ) ) {
          map.addMapping( {
            source: filenameWithHash,
            original: {
              line: index + 1,
              column: 0
            },
            generated: {
              line: index + 1,
              column: 0
            }
          } )
        }
      } )
      // workaround for Webpack eval-source-map bug
      // https://github.com/webpack/webpack/pull/1816
      // in case the script was piped through another loader
      // that doesn't pass down the source map properly.
      if ( tagName === 'script' && !lang ) {
        result += '\n/* generated by regular-loader */\n'
      }
    }

    output[ tagName ].push( {
      content: result,
      lang: lang,
      scoped: scoped,
      map: map && map.toJSON()
    } )
  } )

  cache.set( cacheKey, output )

  return output
}

module.exports = parse
