const path = require( 'path' )
const fs = require( 'fs' )

const root = path.resolve( __dirname, '../../node_modules/mpregular/lib/wxparse' )
const wxml = fs.readFileSync( path.resolve( root, 'index.wxml' ) )
const wxss = fs.readFileSync( path.resolve( root, 'index.wxss' ) )

module.exports = function copyWxParse( { emitFile } ) {
  emitFile( 'wxparse/index.wxml', wxml )
  emitFile( 'wxparse/index.wxss', wxss )
}
