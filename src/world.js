const { remote } = require('webdriverio')
const dot = require('dot-component')

const defaults = {
  remote: {
    logLevel: 'trace',
    capabilities: {
      browserName: 'chrome',
      'goog:chromeOptions': {
        args: ['--headless', '--no-sandbox']
      }
    }
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
    console.warn('.... closing %d instances', instances.length)
    while (instances.length) {
      await instances.pop().close()
    }
  }

  constructor (options) {
    console.warn(`~~~~ new World(${JSON.stringify(options)}) ~~~~`)
    Object.assign(this, defaults, options)
    this.vars = Object.assign({}, this.vars)
    instances.push(this)
  }

  async open () {
    console.warn('>>>> open -----')
    if (!this.browser) {
      console.warn('>>>> open (new remote)')
      this.browser = await remote(this.remote)
    }
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
