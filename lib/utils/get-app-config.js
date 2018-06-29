const path = require( 'path' )
const babel = require( 'babel-core' )
const extractConfigPlugin = require( '../mp/plugins/extract-config' )

module.exports = function ( compiler, compilation ) {
  return new Promise( ( resolve, reject ) => {
    const entry = compilation.options.entry || {}
    const buffer = compiler.inputFileSystem.readFileSync( entry.app )
    const content = buffer.toString()

    const ast = babel.transform( content, {
      extends: path.resolve( process.cwd(), '.babelrc' ),
      plugins: [ extractConfigPlugin ]
    } )

    // extract config
    const mpConfig = ast.metadata.mpConfig && ast.metadata.mpConfig.value

    if ( mpConfig ) {
      resolve( mpConfig )
    } else {
      resolve( {} )
    }
  } )
}
