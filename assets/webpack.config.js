var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin"); //分离打包CSS
var HtmlWebpackPlugin = require('html-webpack-plugin')
var node_modules = path.resolve(__dirname, 'node_modules');
var px2rem = require('postcss-px2rem');

var debug = (process.env.NODE_ENV.toString() == 'dev')
    ? true
    : false;
var publicPath = process.env.NODE_ENV.toString() == 'local'
    ? '/'
    : '';
console.log(process.env.NODE_ENV) //环境变量 dev ,production

var entry = {
    init: ["./js/init.js"],
    'mtouch.min': ["../lib/mt-touch.js"]
};

var debug = (process.env.NODE_ENV.toString() == 'dev')
    ? true
    : false;
if (debug) {
    entry.init.unshift('webpack-dev-server/client?http://localhost:8080')
}

module.exports = {
    entry: entry,
    output: {
        path: '../dist',
        publicPath: '', //用于配置文件发布路径，如http://xiuxiu.huodong.meitu.com/beauty/
        filename: "js/[name].js?[hash:8]", //根据入口文件输出的对应多个文件名
        library: 'up',
        libraryTarget: 'umd',
        // umdNamedDefine: true
    },
    module: {
        loaders: [
            {
                test: /\.(js|es6)$/,
                loader: 'babel',
                exclude: /node_modules/
            }, {
                test: /\.(scss|css)$/,
                loader: ExtractTextPlugin.extract("style", "css!postcss!sass?outputStyle=expanded")
            },
            // { test: /\.css$/, loader:  ExtractTextPlugin.extract("style!css!postcss") },
            {
                test: /\.(woff|ttf|gif|jpg|png)$/,
                loader: 'url-loader?limit=1000&name=[path][name].[ext]'
            }, {
                test: /\.html$/,
                loader: 'html-withimg-loader'
            }/*html img src*/

        ]
    },
    postcss: function() {
        return [
            require('autoprefixer'),
            require('precss'),
            px2rem({remUnit: 40})
        ]; //640px:40 , 750px:46.875
    },
    babel: {
        presets: ['es2015']
    },
    resolve: {
        alias: {},
        extensions: ['', '.js', '.css', '.scss'] //定义了解析模块路径时的配置，常用的就是extensions，可以用来指定模块的后缀，这样在引入模块时就不需要写后缀了，会自动补全
    },
    devtool: debug
        ? 'source-map'
        : null,
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html', //测试环境用的html
            filename: 'index.html', //最后生成线上用的
            chunkFilename: '[name]?[hash]',
            inject: 'body'
        }),
        // new webpack.optimize.UglifyJsPlugin({
        //     compress: {
        //         warnings: false
        //     },
        // }),
        new ExtractTextPlugin("style.min.css?[hash:8]", {allChunks: true}) //css/[name].min...通过name控制是否打包为一个
    ]
};
