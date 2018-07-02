exports.js = function ( { entryKey, isSubPackage } = {} ) {
  return `
require('${ getPrefixPath( entryKey ) }static/js/vendor')
require('${ isSubPackage ? getPrefixPathForSubPackage( entryKey ) : getPrefixPath( entryKey ) }static/js/${ entryKey }')
  `.trim()
}

exports.css = function ( { entryKey, cssChunks, isSubPackage } = {} ) {
  let chunkImports = ''

  if ( cssChunks && cssChunks.length > 0 ) {
    chunkImports = '\n' + cssChunks.map(
      chunk => `@import "${ getPrefixPath( entryKey ) }static/css/${ chunk }.wxss";`
    ).join( '\n' )
  }

  return `
@import "${ getPrefixPath( entryKey ) }wxparse/index.wxss";${ chunkImports }
@import "${ isSubPackage ? getPrefixPathForSubPackage( entryKey ) : getPrefixPath( entryKey ) }static/css/${ entryKey }.wxss";
  `.trim()
}

exports.wxml = function ( { dependency, entryKey } ) {
  return `
<import src="${ getPrefixPath( entryKey ) }components/${ dependency }" /><template is="${ dependency }" data="{{ ...$root['0'], $root }}"/>
  `.trim()
}

function getPrefixPath( entryKey ) {
  const times = entryKey.split( '/' ).length - 1
  return times > 0 ?
    repeat( '../', times ) :
    './'
}

function getPrefixPathForSubPackage( entryKey ) {
  const times = entryKey.split( '/' ).length - 2
  return times > 0 ?
    repeat( '../', times ) :
    './'
}

function repeat( str, len ) {
  let result = ''

  while ( len-- ) {
    result += str
  }

  return result
}
