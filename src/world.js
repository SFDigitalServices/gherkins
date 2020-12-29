const { remote } = require('webdriverio')
const dot = require('dot-component')
const browsers = require('./browsers')

require('dotenv').config()

const {
  BROWSER,
  SELENIUM_USER,
  SELENIUM_KEY,
  SELENIUM_SERVER
} = process.env

const defaults = {
  browser: BROWSER || 'headlessChrome',
  vars: process.env,
  webdriverOptions: {
    logLevel: 'trace'
  }
}

const instances = []

module.exports = class World {
  static get defaults () {
    return defaults
  }

  static get instances () {
    return instances
  }

  static async closeAll () {
    if (instances.length) {
      console.warn('.... closing %d instances', instances.length)
      while (instances.length) {
        await instances.pop().close()
      }
    }
  }

  constructor ({ parameters }) {
    this.options = Object.assign({}, defaults, parameters)
    this.vars = Object.assign({}, this.options.vars)
    instances.push(this)
  }

  async open () {
    if (!this.browser) {
      this.browser = await this.getBrowser()
    }
  }

  getBrowser () {
    const { browser, webdriverOptions } = this.options
    if (!browser) {
      throw new Error('The "browser" parameter is required.')
    } else if (typeof browser === 'string' && !browsers[browser]) {
      throw new Error(`No such browser shorthand: "${browser}" (possible values: "${Object.keys(browsers).join('", "')}")`)
    }
    const capabilities = browsers[browser]
    const options = Object.assign({
      server: SELENIUM_SERVER,
      user: SELENIUM_USER,
      key: SELENIUM_KEY,
      capabilities
    }, webdriverOptions)
    if (options.logLevel === 'trace' || options.logLevel === 'debug') {
      console.warn('getBrowser() capabilities:', capabilities)
      console.warn('getBrowser() options:', options)
    }
    return remote(options)
  }

  async screenshot (filename) {
    return this.browser.saveScreenshot(filename)
  }

  async clear () {
    console.warn('---- clear ----')
    await this.browser.url('about:blank')
  }

  async close () {
    console.warn('---- close >>>>')
    if (this.browser) {
      await this.browser.deleteSession()
      this.browser = undefined
    }
  }

  async visit (url) {
    await this.open()
    await this.browser.url(url)
  }

  has (key) {
    return this.get(key) !== undefined
  }

  get (key, fallback) {
    const value = dot.get(this.vars, key)
    return value === undefined ? fallback : value
  }

  set (key, value) {
    dot.set(this.vars, key, value)
    return value
  }

  unset (key) {
    const value = this.get(key)
    this.set(key, undefined)
    return value
  }

  interpolate (str) {
    return str.replace(/\$(\w+)/g, (substr, key) => {
      return this.get(key, substr)
    })
  }

  selectorFor (qualifier, value) {
    switch (qualifier) {
      case 'selector':
        return value
      case 'text':
        return `=${value}`
      default:
        return `[${qualifier}="${value}"]`
    }
  }

  element (selector) {
    return this.browser.$(selector)
  }

  elements (selector) {
    return this.browser.$$(selector)
  }

  elementWith (qualifier, value) {
    return this.browser.$(this.selectorFor(qualifier, value))
  }

  elementsWith (qualifier, value) {
    return this.browser.$$(this.selectorFor(qualifier, value))
  }

  elementWithText (selector, text) {
    return this.browser.$(selector).$(`=${text}`)
  }

  async elementWithLabel (label, selector = 'input, textarea, select') {
    for (const el of await this.elements(selector)) {
      // skip elements that aren't visible
      if (!el.isDisplayed()) continue

      const computed = await el.getComputedLabel()
      if (computed && computed.trim() === label) {
        return el
      }
    }
    throw new Error(`No element found with computed label: "${label}" and selector: "${selector}"`)
  }
}
