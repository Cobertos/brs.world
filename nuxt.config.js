const Config = require('webpack-chain');
const webpackMerge = require('webpack-merge');

export default {
  mode: 'spa',
  /*
  ** Headers of the page
  */
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [
      { rel: 'icon', type: 'image/ico', href: 'brsworld.png' },
      { rel: 'icon', type: 'image/svg+xml', href: 'brsworld.svg' }
    ]
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },
  /*
  ** Global CSS
  */
  css: [
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module'
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
  ],
  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend (config, ctx) {
      //Do our own hacky webpack-chain
      const chainedConfig = new Config();
      chainedConfig.module
        .rule('three-examples')
        .test(/(three[\\/]examples[\\/]js)/)
        .use('imports-loader')
        .loader('imports-loader')
        .options({
          'THREE': 'three' //THREE is require("three")
        });
      webpackMerge(config, chainedConfig.toConfig());
    }
  }
}
