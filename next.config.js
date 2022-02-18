const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');



const config = {
  reactStrictMode: true,
  trailingSlash: true,
  //ignoreDuringBuilds: true,
  //useFileSystemPublicRoutes : false,
  images: {
    domains: ['catpart.ru'],
  },
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')]
  },
  //pages: {
  //  '*': ['test'],
  //  '/': ['index'],
  //  '/about': ['about'],
  //  '/delivery': ['about'],
  //  '/search': ['search'],
  //},
  react: {
    useSuspense: false,
    wait: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }
    return config;
  },

 // webpack: (config, options) => {
 //   const {buildId, dev, isServer, defaultLoaders, webpack} = options;
 //   // Important: return the modified config
 //
 //   // config = Object.assign(dev ? devConfig : prodConfig, config);
 //
 //   if (isServer) {
 //   } else {
 //   }
 //
 ///*   config.module.rules = config.module.rules.concat([
 //     {
 //       test: /\.jsx?$/, // Transform all .js and .jsx files required somewhere with Babel
 //       exclude: /node_modules/,
 //       use: {
 //         loader: 'babel-loader',
 //         options: options.babelQuery
 //       }
 //     },
 //     {
 //       test: /\.(sa|sc)ss$/,
 //       exclude: /node_modules/,
 //       use: [
 //         // for development mode
 //         {
 //           loader: "style-loader"
 //         },
 //         {
 //           loader: MiniCssExtractPlugin.loader
 //         },
 //         {loader: 'css-loader'},
 //         {loader: 'sass-loader'}
 //       ]
 //     },
 //     {
 //       // Preprocess 3rd party .css files located in node_modules
 //       test: /\.css$/,
 //       include: /node_modules/,
 //       use: ['style-loader', 'css-loader']
 //     },
 //     {
 //       test: /\.(eot|otf|ttf|woff|woff2)$/,
 //       use: 'file-loader'
 //     },
 //     {
 //       test: /\.svg$/,
 //       use: [
 //         {
 //           loader: 'svg-url-loader',
 //           options: {
 //             // Inline files smaller than 10 kB
 //             limit: 10 * 1024,
 //             noquotes: true
 //           }
 //         }
 //       ]
 //     },
 //     {
 //       test: /\.(jpg|png|gif)$/,
 //       use: [
 //         {
 //           loader: 'url-loader',
 //           options: {
 //             // Inline files smaller than 10 kB
 //             limit: 10 * 1024
 //           }
 //         },
 //         {
 //           loader: 'image-webpack-loader',
 //           options: {
 //             mozjpeg: {
 //               enabled: false
 //               // NOTE: mozjpeg is disabled as it causes errors in some Linux environments
 //               // Try enabling it in your environment by switching the config to:
 //               // enabled: true,
 //               // progressive: true,
 //             },
 //             gifsicle: {
 //               interlaced: false
 //             },
 //             optipng: {
 //               optimizationLevel: 7
 //             },
 //             pngquant: {
 //               quality: '65-90',
 //               speed: 4
 //             }
 //           }
 //         }
 //       ]
 //     },
 //     {
 //       test: /\.html$/,
 //       use: 'html-loader'
 //     },
 //     {
 //       test: /\.(mp4|webm)$/,
 //       use: {
 //         loader: 'url-loader',
 //         options: {
 //           limit: 10000
 //         }
 //       }
 //     }
 //   ]);
 //
 //   config.plugins = config.plugins.concat([
 //     // Always expose NODE_ENV to webpack, in order to use `process.env.NODE_ENV`
 //     // inside your code for any environment checks; Terser will automatically
 //     // drop any unreachable code.
 //
 //     new MiniCssExtractPlugin({
 //       // Options similar to the same options in webpackOptions.output
 //       // all options are optional
 //       filename: '[name].css',
 //       chunkFilename: '[id].css',
 //       ignoreOrder: false // Enable to remove warnings about conflicting order
 //     })
 //   ]);*/
 //
 //   return config
 // }
}

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer(config);
