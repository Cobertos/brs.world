const path = require("path");

module.exports = {
    outputDir: path.resolve(__dirname, "./docs"),
    chainWebpack: config => {
        config.module
            .rule('three-examples')
            .test(/(three[\\\/]examples[\\\/]js)/)
            .use('imports-loader')
                .loader('imports-loader')
                .options({
                    "THREE": "three" //THREE is require("three")
                });
    }
}