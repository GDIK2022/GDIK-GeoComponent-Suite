const path = require("path");
module.exports = {
     mode: 'production',
     entry: {
          'index': './index.js',
     },
     output: {
          filename: '[name].js',
          path: path.resolve(__dirname, 'dist'),
     },
     module: {
          rules: [
               {
                    test: /\.svg$/,
                    loader: 'svg-inline-loader'
               },
               {
                    test: /\.css$/i,
                    use: ["style-loader", "css-loader"],
               }
          ]
     },
     resolve: {
          fallback: {
               "timers": require.resolve("timers-browserify"),
               "stream": require.resolve("stream-browserify")
          }
     }
};
