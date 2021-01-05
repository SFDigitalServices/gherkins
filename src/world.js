const { remote } = require('webdriverio')
const dot = require('dot-component')
const browsers = require('./browsers')

const { BROWSER = 'puppeteer' } = process.env

const defaults = {
  browser: BROWSER,
  vars: process.env,
  webdriverOptions: {
    logLevel: 'trace'
  }
}

const instances = []

module.exports = class World {
  static get instances () {
    return instances
  }

  static async closeAll () {
    while (instances.length) {
      await instances.pop().close()
    }
  }

  constructor (options) {
    const { parameters } = options || {}
    this.options = Object.assign({}, defaults, parameters)

    this.shorthands = Object.assign({
      button: 'button, summary, [role=button], input[type=submit]',
      input: 'input, textarea, select',
      dropdown: 'select',
      link: 'a[href]'
    }, this.options.shorthands)

    // delegate (proxy) calls for variable operations to the Variables class
    this.vars = new Variables(this.options.vars)
    for (const method of ['get', 'has', 'set', 'unset', 'interpolate']) {
      this[method] = (...args) => this.vars[method](...args)
    }

    instances.push(this)
  }

  async open () {
    if (!this.browser) {
      this.browser = await this.getBrowser()
    }
  }

  async close () {
    if (this.browser) {
      await this.browser.deleteSession()
      this.browser = undefined
    }
  }

  getBrowser () {
    const { browser, webdriverOptions } = this.options
    if (!browser) {
      throw new Error('The "browser" parameter is required.')
    } else if (!(browser instanceof Object) && !browsers[browser]) {
      throw new Error(`No such browser shorthand: "${browser}" (possible values: "${Object.keys(browsers).join('", "')}")`)
    }
    const capabilities = browsers[browser] || browser
    const options = Object.assign({ capabilities }, webdriverOptions)

    const {
      SELENIUM_USER,
      SELENIUM_KEY,
      SELENIUM_SERVER
    } = process.env
    if (SELENIUM_SERVER && !capabilities.local) {
      Object.assign(options, {
        server: SELENIUM_SERVER,
        user: SELENIUM_USER,
        key: SELENIUM_KEY
      })
    }
    return remote(options)
  }

  async clear () {
    this.assertBrowser('clear')
    await this.browser.url('about:blank')
  }

  getUrl () {
    this.assertBrowser('get URL')
    return this.browser.getUrl()
  }

  async visit (url) {
    await this.open()
    return this.browser.url(url)
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
    this.assertBrowser(`select "${selector}" element`)
    return this.browser.$(this.shorthand(selector))
  }

  elements (selector) {
    this.assertBrowser(`select "${selector}" elements`)
    return this.browser.$$(this.shorthand(selector))
  }

  elementWith (qualifier, value) {
    this.assertBrowser(`select element with ${qualifier} "${value}"`)
    return this.browser.$(this.selectorFor(qualifier, value))
  }

  elementsWith (qualifier, value) {
    this.assertBrowser(`select elements with ${qualifier} "${value}"`)
    return this.browser.$$(this.selectorFor(qualifier, value))
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

  async screenshot (filename) {
    this.assertBrowser('take screenshot')
    return this.browser.saveScreenshot(filename)
  }

  assertBrowser (action) {
    if (!this.browser) {
      throw new Error(`Unable to ${action} (no browser)`)
    }
  }
}

class Variables {
  constructor (vars) {
    this.vars = Object.assign({}, vars)
  }

  interpolate (value) {
    return String(value)
      .replace(/\$(\w+)/g, (substr, key) => this.get(key, substr))
      .replace(/\$\{(\w+)\}/g, (substr, key) => this.get(key, substr))
  }

  has (key) {
    return dot.get(this.vars, key) !== undefined
  }

  get (key, fallback) {
    const value = dot.get(this.vars, key)
    return value === undefined ? fallback : value
  }

  set (key, value) {
    const old = this.get(key)
    dot.set(this.vars, key, value, true)
    return old
  }
}
