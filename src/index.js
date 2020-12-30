require('./types')
require('./steps')

const World = require('./world')
const cucumber = require('@cucumber/cucumber')

cucumber.setWorldConstructor(World)

cucumber.BeforeAll(function () {
})

cucumber.Before(function () {
})

cucumber.After(function () {
  // return this.visit('about:blank')
})

cucumber.AfterAll(function () {
  return World.closeAll()
})
