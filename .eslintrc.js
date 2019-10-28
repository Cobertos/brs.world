module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: [
    '@nuxtjs',
    'plugin:nuxt/recommended'
  ],
  // add your custom rules here
  rules: {
    'semi': ['error', 'always'],
    'spaced-comment': 'off',
    'no-fallthrough': 'off',

    'vue/no-reserved-keys': 'off' //TODO: I thought _ keys were non-reactive by standard, not reserved...
  }
}
