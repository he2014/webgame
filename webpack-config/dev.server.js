
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
    '/graphql': {
      // target: 'http://172.26.71.173:3001/graphql',
      target: 'http://m.le888.bet/graphql',
      // target: 'http://test.m.jggvip.com/graphql',
      // target: 'http://127.0.0.1:3001/graphql',
      changeOrigin: true,
      pathRewrite: {
        '^/graphql': '/'
      }
    },
    '/api': {
      target: 'http://m.le888.bet/api',
      // target: 'http://172.26.71.11:3200/graphql',
      // target: 'http://test.m.jggvip.com/api',
      // target: 'http://127.0.0.1:3000/graphql',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/'
      }
    },
    '/phpapi': {
      target: 'http://m.le888.live/phpapi',
      // target: 'http://172.26.71.11:3200/graphql',
      // target: 'http://test.m.jggvip.com/api',
      changeOrigin: true,
      pathRewrite: {
        '^/phpapi': '/'
      }
    }
  },
  before: app => {
  }
}
module.exports = devServer
