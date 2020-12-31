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
  browser: BROWSER || 'puppeteer',
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
      while (instances.length) {
        await instances.pop().close()
      }
    }
  }

  constructor (options) {
    const { parameters } = options || {}
    this.options = Object.assign({}, defaults, parameters)
    this.vars = Object.assign({}, this.options.vars)
    this.shorthands = Object.assign({
      button: 'button, summary, [role=button], input[type=submit]',
      input: 'input, textarea, select',
      dropdown: 'select',
      link: 'a[href]'
    }, this.options.shorthands)
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
    const capabilities = browsers[browser] || browser
    const options = Object.assign({
      server: SELENIUM_SERVER,
      user: SELENIUM_USER,
      key: SELENIUM_KEY,
      capabilities
    }, webdriverOptions)
    return remote(options)
  }

  async screenshot (filename) {
    return this.browser.saveScreenshot(filename)
  }

  async clear () {
    await this.browser.url('about:blank')
  }

  async close () {
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
    return str
      .replace(/\$(\w+)/g, (substr, key) => this.get(key, substr))
      .replace(/\$\{(\w+)\}/g, (substr, key) => this.get(key, substr))
  }

  selectorFor (qualifier, value) {
    switch (qualifier) {
      case 'selector':
        return this.shorthand(value)
      case 'text':
        return `=${value}`
      case 'text containing':
        return `*=${value}`
      default:
        return `[${qualifier}="${value}"]`
    }
  }

  shorthand (nameOrSelector) {
    return this.shorthands[nameOrSelector] || nameOrSelector
  }

  element (selector) {
    return this.browser.$(this.shorthand(selector))
  }

  elements (selector) {
    return this.browser.$$(this.shorthand(selector))
  }

  elementWith (qualifier, value) {
    return this.browser.$(this.selectorFor(qualifier, value))
  }

  elementsWith (qualifier, value) {
    return this.browser.$$(this.selectorFor(qualifier, value))
  }

  elementWithText (selector, text) {
    // select all of the matching elements first,
    // *then* filter by ones with the given text
    return this.elements(selector).$(`=${text}`)
  }

  async elementWithLabel (label, selector = 'input') {
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
