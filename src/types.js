const JSON = require('json5')
const { defineParameterType } = require('@cucumber/cucumber')

defineParameterType({
  name: 'json',
  regexp: /.+/,
  transformer (str) {
    try {
      return JSON.parse(str)
    } catch (error) {
      return undefined
    }
  }
})
