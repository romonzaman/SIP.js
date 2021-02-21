const path = require('path');

module.exports = {
  entry: {
    'demo': './simple/demo.ts',
    //'demo': './demo/demo.ts',
    // 'demo-3': './demo/demo-3.ts'
  },
  devtool: 'inline-source-map',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname)
  }
};
