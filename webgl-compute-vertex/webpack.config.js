const webpackConfig = {
  entry: './src/Main.ts',
  output: {
    path: `${__dirname}/dist/js/`,
    publicPath: 'js/',
    filename: 'bundle.js'
  },
  resolve: {
    extensions: ['*', '.js', '.ts']
  },
  optimization: {
    minimize: false
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader'
      }
    ]
  },
  devServer: {
    contentBase: [`${__dirname}/dist`, `${__dirname}/dist/css`],
    open: true,
    // host: '0.0.0.0',
    port: 4000,
    disableHostCheck: true,
    watchContentBase: true
  }
};
module.exports = webpackConfig;
