require('./types')
require('./steps')

const {
  CUCUMBER_DEFAULT_TIMEOUT = 10000
} = process.env

const World = require('./world')
const cucumber = require('@cucumber/cucumber')

cucumber.setWorldConstructor(World)

if (CUCUMBER_DEFAULT_TIMEOUT) {
  cucumber.setDefaultTimeout(CUCUMBER_DEFAULT_TIMEOUT)
}

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
