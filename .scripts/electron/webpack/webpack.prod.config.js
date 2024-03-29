const webpack = require('webpack');
const WebpackBar = require('webpackbar');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ESLintWebpackPlugin = require('eslint-webpack-plugin');
// const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const {
  bundleAnalyzer,
  name,
  version,
  buildTime,
} = require('../../config');
const paths = require('../../config/paths');
// const { dependencies, devDependencies } = require(paths.appRootPkgJson);
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

const webpackProdConfig = {
  mode: 'production',
  target: 'electron-main',
  entry: {
    index: [paths.appElectronEntryFile],
  },
  output: {
    globalObject: 'this',
    publicPath: '/',
    path: paths.appElectronDistPath,
    pathinfo: !isProduction,
    filename: '[name].js',
  },
  // externals: isDevelopment ? [] : [...Object.keys(dependencies || {}), ...Object.keys(devDependencies || {})],
  module: {
    strictExportPresence: true,
    rules: [
      {
        test: /\.(js|ts)$/,
        include: paths.appElectronEntryDir,
        use: [
          require.resolve('thread-loader'),
          {
            loader: require.resolve('babel-loader'),
            options: {
              cacheDirectory: false,
            },
          },
        ],
      },
      {
        test: /\.node$/,
        use: 'node-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.ts', '.json', '.node'],
    alias: {
      '~': paths.appElectronEntryDir,
    },
  },
  plugins: [
    new WebpackBar({
      name: 'Electron Main',
      profile: true,
    }),
    new webpack.DefinePlugin({
      'process.env.APP_NAME': JSON.stringify(name),
      'process.env.APP_VERSION': JSON.stringify(version),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
    bundleAnalyzer &&
      new BundleAnalyzerPlugin({
        openAnalyzer: false,
        analyzerPort: 'auto',
        reportTitle: `主线程代码 - ${name} - [${buildTime}]`,
      }),
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        enabled: true,
        async: isDevelopment,
        mode: 'write-references',
        configFile: paths.appElectronTsConfig,
        diagnosticOptions: {
          syntactic: true,
          semantic: true,
          declaration: true,
          global: true,
        },
      },
    }),
    new ESLintWebpackPlugin({
      extensions: ['js', 'jsx', 'ts', 'tsx'],
      formatter: require.resolve('react-dev-utils/eslintFormatter'),
      eslintPath: require.resolve('eslint'),
      context: paths.appElectronEntryDir,
      cache: false,
      cwd: paths.appRootPath,
      resolvePluginsRelativeTo: __dirname,
    }),
    // new CleanWebpackPlugin({
    // 	// verbose: true,
    // }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: paths.appElectronPublicAssetsPath,
          to: paths.appElectronDistPublicPath,
          globOptions: {
            ignore: ['**/favicon.ico', '**/index.html'],
          },
          noErrorOnMissing: false,
        },
      ],
    }),
  ].filter(Boolean),
  node: {
    __dirname: process.env.NODE_ENV !== 'production',
    __filename: process.env.NODE_ENV !== 'production',
  },
};

module.exports = webpackProdConfig;
