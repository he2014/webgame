
const path = require('path')
const devServer = {
  open: true,
  noInfo: true,
  contentBase: path.join(__dirname, 'dist'),
  compress: true,
  host: '0.0.0.0',
  port: 8084,
  historyApiFallback: {
    // rewrites: [
    //   { from: /\/plateform/, to: '/index.html' }
    //   // { from: /\/achievement/, to: '/index.html' }
    // ]
  },
  https: false,
  hotOnly: true,
  proxy: {
    '/kydc-zuul': {
      // target: 'http://bigdata.ky.com',
      target: 'http://test-hdp-01:8484',
      changeOrigin: true // 是否跨域
    }
  },
  before: app => {
  }
}
module.exports = devServer
