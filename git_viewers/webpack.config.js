const path = require('path');

module.exports = {
  entry: './frontend/main.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public'),
  },
  watch: true,
  mode: 'development'
};
