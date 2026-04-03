const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');

module.exports = {
  output: {
    libraryTarget: 'commonjs2',
    ...(process.env.NODE_ENV !== 'production' && {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    }),
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/index.ts',
      outputFileName: 'index.js',
      tsConfig: './tsconfig.lib.json',
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
      sourceMaps: true,
    }),
  ],
};
