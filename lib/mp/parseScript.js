const hash = require( 'hash-sum' )
const path = require( 'path' )
const babel = require( 'babel-core' )
const resolveSource = require( '../utils/resolve-source' )
const getAppConfig = require( '../utils/get-app-config' )
const extractConfigPlugin = require( './plugins/extract-config' )
const rootComponentPlugin = require( './plugins/root-component' )
const templates = require( './templates' )

module.exports = function ( { content, entryKey, resourcePath, emitFile, cssChunks } ) {
  const isAppEntry = entryKey === 'app'

  const ast = babel.transform( content, {
    extends: path.resolve( process.cwd(), '.babelrc' ),
    plugins: [ extractConfigPlugin, rootComponentPlugin ]
  } )

  // extract config
  const mpConfig = ast.metadata.mpConfig && ast.metadata.mpConfig.value

  if ( mpConfig ) {
    emitFile( `${ entryKey }.json`, JSON.stringify( mpConfig, 0, 2 ) )
  }

  getAppConfig( this._compiler, this._compilation )
    .then( config => {
      const subPackages = config.subPackages || {}
      const subPages = []

      subPackages.forEach( pkg => {
        pkg.pages.map( page => {
          const pagePath = pkg.root + '/' + trimCaret( page )
          subPages.push( pagePath )
        } )
      } )

      // trim '^'
      function trimCaret( str ) {
        return str.replace( /(^\^|\^$)/g, '' )
      }

      function isInSubPackage( entryKey, subPages ) {
        return subPages.some( page => {
          return entryKey.indexOf( page ) === 0
        } )
      }

      // extract js
      if ( isInSubPackage( entryKey, subPages ) ) {
        emitFile(
          `${ entryKey }.js`,
          templates.js( {
            entryKey: entryKey,
            isSubPackage: true,
          } )
        )
      } else {
        emitFile(
          `${ entryKey }.js`,
          templates.js( {
            entryKey: entryKey,
            isSubPackage: false,
          } )
        )
      }
    } )

  // extract css will handled in plugin as all entries .wxss should be emitted
  // when extraction happens

  // ensure there is an empty wxss file there( avoid wxss missing error )
  emitFile(
    `static/css/${ entryKey }.wxss`,
    ''
  )

  // extract wxml
  const rootComponent = ast.metadata.rootComponent
  resolveSource.call( this, rootComponent ).then( resolved => {
    const relativePath = path.relative(
      process.cwd(),
      resolved
    ).replace( /\.\w+$/g, '' )
    const filename = path.basename( rootComponent )
      .replace( /\.\w+$/g, '' ) // remove ext

    emitFile(
      `${ entryKey }.wxml`,
      templates.wxml( {
        dependency: `${ filename }$${ hash( relativePath ) }`,
        entryKey: entryKey
      } )
    )
  } ).catch( e => console.log( e ) )
}
