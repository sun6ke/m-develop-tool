'use strict'
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'development',
    devtool: false,
    /* 入口 */
    entry: {
        mDevelopTool: path.resolve(__dirname, './src/mDevelopTool.js')
    },

    output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].min.js',
        library: 'mDevelopTool',
        libraryTarget: 'umd',
        umdNamedDefine: true,
        libraryExport: 'default'    //umd模式下引入需要加.default
    },

    /* loader配置 */
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader'
            },
            {
                test: /\.jpg$/,
                loader: "file-loader"
            },
            {
                test: /\.art$/,
                loader: "art-template-loader",
                options: {
                    // art-template options (if necessary)
                    // @see https://github.com/aui/art-template
                }
            },
            {
                test: /\.less$/,
                loader: 'style-loader!css-loader!less-loader'
            }
        ]
    },

    devServer: {
        contentBase: './dist',
        hot: true
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html',
            inject: true
        }),

        new CopyWebpackPlugin([
            {
                from: path.resolve(__dirname, './src/mDevelopTool.d.ts'),
                to: path.resolve(__dirname, './dist/mDevelopTool.min.d.ts')
            }
        ])
    ]

}