/**
 *
 * @author  晴云
 * @create 2018-11-07 16:53
 * @note 干什么的呢？
 **/
const dataSource = process.env.VUE_APP_DATA_SOURCE
const devServerPath = (dataSource === 'product_data') ? 'prod.server' : 'dev.server'
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const chalk = require('chalk')
var ProgressBarPlugin = require('progress-bar-webpack-plugin')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
const devServer = require(`./webpack-config/${devServerPath}`)
const path = require('path')
const debug = process.env.NODE_ENV !== 'production'
const webpack = require('webpack')
module.exports = {
  outputDir: 'dist', // 构建输出目录
  assetsDir: 'assets', // 静态资源目录 (js, css, img, fonts)
  pages: {
    index: {
      title: '耍大牌',
      entry: 'src/main.js',
      template: 'public/index.html',
      filename: 'index.html'
    }
  },
  // title:'开元大数据',
  // pages: vueConf.pages,
  lintOnSave: true, // 是否开启eslint保存检测，有效值：ture | false | 'error'
  runtimeCompiler: true, // 运行时版本是否需要编译
  transpileDependencies: [], // 默认babel-loader忽略mode_modules，这里可增加例外的依赖包名
  productionSourceMap: false, // 是否在构建生产包时生成 sourceMap 文件，false将提高构建速度
  configureWebpack: config => { // webpack配置，值为对象时会合并配置，为方法时会改写配置
    config.plugins.push(new LodashModuleReplacementPlugin())
    config.plugins.push(new webpack.ContextReplacementPlugin(/.*$/, /.*/)) // 可行的
    // config.plugins.push(new webpack.ContextReplacementPlugin(/.*$/, '../pages/')) //test
    if (debug) { // 开发环境配置
      // config.devtool = 'cheap-module-eval-source-map'
      config.devtool = 'source-map'
    } else { // 生产环境配置
      // config.devtool = ''
      config.plugins.push(
        new UglifyJsPlugin({
          uglifyOptions: {
            output: {
              beautify: false,
              comments: false
            },
            compress: {
              warnings: false, // 在UglifyJs删除没有用到的代码时显示警告
              drop_debugger: true,
              drop_console: true
            }
          },
          sourceMap: false,
          parallel: true
        })
      )
      config.plugins.push(
        new ProgressBarPlugin({
          format: '  build [:bar] ' + chalk.green.bold(':percent') + ' (:elapsed seconds)',
          clear: false
        })
      )
    }
    Object.assign(config, { // 开发生产共同配置
      resolve: {
        extensions: ['.js', '.vue', '.json', '.css', '.svg'],
        alias: {
          '@': path.resolve(__dirname, './src'),
          'vue$': 'vue/dist/vue.esm.js'
        }
      }
    })
  },
  chainWebpack: config => {
    if (debug) {
      const jsRule = config.module.rule('js')
      jsRule.use('babel-loader').loader('babel-loader')
      const svgRule = config.module.rule('svg')
      svgRule.uses.clear()
      /*      svgRule
        .use('vue-svg-loader')
        .loader('vue-svg-loader')
      */
      svgRule
        .use('url-loader')
        .loader('url-loader')
        .options({
          symbolId: 'icon-[name]',
          limit: 10000
        })
    } else {
      // 生产开发配置
    }
  },

  parallel: require('os').cpus().length > 1, // 构建时开启多进程处理babel编译
  pluginOptions: { // 第三方插件配置
  },
  pwa: { // 单页插件相关配置 https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-pwa
  },
  devServer
}
