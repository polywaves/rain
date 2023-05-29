const path = require('path')

// const isDev = process.env.NODE_ENV === 'development'

module.exports = {
  devtool: 'source-map',
  context: __dirname,
  entry: {
    scene: './src/scene.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  performance: {
    hints: false
  },
  optimization: {
    minimize: true
  }
}
