const path = require( 'path' )
const fs = require( 'fs' )
const resolve = require( 'resolve' )

const resolveOptions = {
	basedir: process.cwd(),
	extensions: [ '.wxml', '.wxss' ]
}
const isUnitTest = process.env.UNIT_TEST === true
if (!isUnitTest) {

  const wxmlPath = resolve.sync( 'mpregular/lib/wxparse/index.wxml', resolveOptions )
  const wxssPath = resolve.sync( 'mpregular/lib/wxparse/index.wxss', resolveOptions )
  const wxml = fs.readFileSync( wxmlPath )
  const wxss = fs.readFileSync( wxssPath )
}

module.exports = function copyWxParse( { emitFile } ) {
  if (!isUnitTest) {
    emitFile( 'wxparse/index.wxml', wxml )
    emitFile( 'wxparse/index.wxss', wxss )
  }
}
