module.exports = {
    entry: {
        'redux-app-controller': "./src/index.js"
    },
    output: {
        path: "./dist",
        filename: '[name].js'
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loader: "babel-loader",
                query: {
                    presets: [ 'es2015', 'react' ]
                }
            }
        ]
    }
}
