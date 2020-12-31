require('./types')
require('./steps')

require('dotenv').config()

const World = require('./world')
const {
  setDefaultTimeout,
  setWorldConstructor,
  Before,
  BeforeAll,
  After,
  AfterAll
} = require('@cucumber/cucumber')

const {
  CUCUMBER_DEFAULT_TIMEOUT = 10000
} = process.env

if (CUCUMBER_DEFAULT_TIMEOUT) {
  setDefaultTimeout(CUCUMBER_DEFAULT_TIMEOUT)
}

setWorldConstructor(World)

BeforeAll(function () {
})

Before(function () {
})

After(function () {
  // return this.visit('about:blank')
})

AfterAll(function () {
  return World.closeAll()
})
