module.exports = function ({types: t}) {
  return {
    visitor: {
      ExportDefaultDeclaration(path) {
          if (path && path.node && path.node.declaration && path.node.declaration.properties) {
              const componentsProperty = path.node.declaration.properties.filter( prop => {
                  return t.isObjectProperty( prop ) && t.isIdentifier( prop.key ) &&
                      prop.key.name === 'mpComponents'
              } )[ 0 ]
              if ( componentsProperty && t.isArrayExpression( componentsProperty.value ) ) {
                  const mpComponents = componentsProperty.value.elements.map((element) => {
                      return element.value
                  })

                  path.hub.file.metadata.mpComponents = mpComponents
              }
          }
      }
    }
  }
}