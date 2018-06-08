const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const root = path.resolve(__dirname, '..')

module.exports = {
    mode: 'development',
    context: root,
    entry: {
        index: './src/index.js'
    },
    output: {
        path: path.join(root, 'dist'),
        filename: 'build/[name].js',
        publicPath: '/'
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
                            presets: ['env', 'stage-0', 'react'],
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
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true,

                        }
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: true
                        }
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
                            fallback: 'file-loader',
                            outputPath: 'build/static'
                        }
                    }
                ]
            }
        ]
    },
    resolve: {
        extensions: ['.js'],
        alias: {
            '@': path.join(root, 'src'),
            'react': path.join(root, 'src/xreact'),
            'react-dom': path.join(root, 'src/xreact')
        }
    },
    devtool: 'source-map',
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(root, 'src/index.html'),
            filename: path.join(root, 'dist/index.html')
        }),
        new webpack.HotModuleReplacementPlugin()
    ],
    devServer: {
        port: 8888,
        hot: true,
        contentBase: path.join(root, 'src'),
        noInfo: false
    }
}