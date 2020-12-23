require('./types')
require('./steps')

const World = require('./world')
const cucumber = require('@cucumber/cucumber')

cucumber.setWorldConstructor(World)

cucumber.BeforeAll(function () {
  console.warn('---- BeforeAll ----')
})

cucumber.Before(function () {
  console.warn('---- Before ----')
})

cucumber.After(function () {
  console.warn('---- After ----')
  // return this.visit('about:blank')
})

cucumber.AfterAll(function () {
  console.warn('---- AfterAll ----')
  return World.closeAll()
})
