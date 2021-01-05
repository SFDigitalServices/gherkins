module.exports = {
  env: {
    commonjs: true
  },
  extends: [
    'standard'
  ],
  plugins: [
    'cucumber'
  ],
  parserOptions: {
    ecmaVersion: 12
  },
  rules: {
    'cucumber/async-then': 2,
    'cucumber/expression-type': 2,
    // 'cucumber/no-restricted-tags': [2, 'wip', 'broken'],
    'cucumber/no-arrow-functions': 2
  }
}
