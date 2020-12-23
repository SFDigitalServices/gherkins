const expect = require('expect')
const { Given } = require('@cucumber/cucumber')

Given('variables:', function (data) {
  expect(data && data.hashes).toBeInstanceOf(Object)
  for (const { key, value } of data.hashes) {
    this.set(key, value)
  }
})

Given('variable defaults:', function (data) {
  expect(data && data.hashes).toBeInstanceOf(Object)
  for (const { key, value } of data.hashes) {
    if (!this.has(key)) {
      this.set(key, value)
    }
  }
})

Given('variable {word} (=|is) {string}', function (key, value) {
  this.set(key, value)
})
