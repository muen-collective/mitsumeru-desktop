const packageJson = require('./package.json')

module.exports = {
  ...packageJson.build,
  appId: 'io.muen.mitsumeru-dev',
  productName: 'Mitsumeru Dev',
  directories: {
    ...packageJson.build.directories,
    output: 'dist-dev'
  },
  extraMetadata: {
    name: 'mitsumeru-dev',
    productName: 'Mitsumeru Dev',
    dshDesktopChannel: 'development'
  },
  artifactName: 'mitsumeru-dev-${os}-${arch}.${ext}',
  nsis: {
    ...packageJson.build.nsis,
    artifactName: 'mitsumeru-dev-windows-${arch}-setup.${ext}'
  },
  publish: null
}
