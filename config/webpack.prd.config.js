const path = require('path')
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const CleanWebpackPlugin = require('clean-webpack-plugin')
const root = path.resolve(__dirname, '..')

module.exports = {
    mode: 'development',
    context: root,
    entry: {
        index: './src/index.js'
    },
    output: {
        path: path.join(root, 'dist/build'),
        filename: '[name].[chunkhash:8].js',
        publicPath: '/build/'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['env', 'react'],
                            plugins: [
                                'transform-runtime',
                                ["transform-react-jsx", {
                                    "pragma": "React.createElement" // 默认 pragma 为 React.createElement
                                }],
                            ]
                        }
                    }
                ]
            },
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader'
                    },
                    {
                        loader: 'sass-loader'
                    }
                ]
            },
            {
                test: /\.(jpg|png|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8192,
                            outputPath: 'static'
                        }
                    }
                ]
            }
        ]
    },
    devtool: 'none',
    resolve: {
        extensions: ['.js'],
        alias: {
            '@': path.join(root, 'src')
        }
    },
    plugins: [
        new CleanWebpackPlugin(['dist'], {
            root: root
        }),
        new CopyWebpackPlugin([
            {
                from: './src/public',
                to: '../public',
            },
        ]),
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash:8].css',
            chunkFilename: '[id].[contenthash:8].css',
        }),
        new HtmlWebpackPlugin({
            template: path.join(root, 'src/index.html'),
            filename: path.join(root, 'dist/index.html'),
            inject: 'body'
        })
    ]
}