const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
  const isDev = argv.mode === 'development';

  return {
    mode: isDev ? 'development' : 'production',
    entry: path.resolve(__dirname, 'src', 'main.ts'),
    output: {
      filename: 'weather-widget.js',
      path: path.resolve(__dirname, 'dist'),
      library: 'WeatherWidget',
      libraryTarget: 'umd',
      globalObject: 'this',
      clean: true,
    },
    resolve: {
      extensions: ['.ts', '.js', '.vue', '.json'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        vue: 'vue/dist/vue.esm-bundler.js'
      }
    },
    module: {
      rules: [
        {
            test: /\.vue$/,
            loader: 'vue-loader',
            options: {
                customElement: true
         }
        },
        {
          test: /\.ts$/,
          use: [
            {
              loader: 'ts-loader',
              options: { appendTsSuffixTo: [/\.vue$/], transpileOnly: false }
            }
          ],
          exclude: /node_modules/
        },
        // SCSS inside .vue and imported scss
        {
          test: /\.scss$/i,
          use: [
            'vue-style-loader', // injects into DOM, supports HMR for .vue
            { loader: 'css-loader', options: { sourceMap: isDev } },
            { loader: 'sass-loader', options: { sourceMap: isDev } }
          ]
        },
        // plain CSS (e.g. node_modules css)
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader']
        },
        // SVG as React-like component (optional), but treat by default as asset/resource
        {
          test: /\.svg$/i,
          type: 'asset/resource',
          generator: {
            filename: 'assets/[name].[hash:8][ext]'
          }
        },
        // images/fonts
        {
          test: /\.(png|jpe?g|gif|webp|ico|woff2?|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'assets/[name].[hash:8][ext]'
          }
        },
        // JS through Babel to target modern ES (ES2016)
        {
          test: /\.m?js$/i,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [['@babel/preset-env', { targets: { esmodules: true }, modules: false }]]
            }
          }
        }
      ]
    },
    plugins: [
      new VueLoaderPlugin(),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'public', 'index.html'),
        inject: 'body'
      })
    ],
    devtool: isDev ? 'eval-cheap-module-source-map' : 'source-map',
    devServer: {
      static: { directory: path.join(__dirname, 'dist') },
      port: 3000,
      hot: true,
      open: true,
      client: { overlay: true }
    },
    performance: { hints: false }
  };
};
