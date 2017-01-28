module.exports = {
  entry: './src/main.ts',
  output: {
    filename: './dist/main.js',
    libraryTarget: "commonjs"
  },
  target: "node",
  resolve: {
    extensions: ['', '.ts', '.tsx', '.js', '.jsx']
  },
  module: {
    loaders: [
      {test: /\.tsx?$/, loader: 'ts-loader'}
    ]
  },
  devtool: "source-map"
};
