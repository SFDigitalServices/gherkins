const dot = require('dot-component')
const { remote } = require('webdriverio')
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
      heading: 'h1, h2, h3, h4, h5, h6',
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

  async element (selectorOrShorthand) {
    this.assertBrowser(`select "${selectorOrShorthand}" element`)
    const selector = this.shorthand(selectorOrShorthand)
    const el = this.browser.$(selector)
    return this.assertElement(el, `with selector "${selector}"`)
  }

  async elements (selectorOrShorthand) {
    this.assertBrowser(`select "${selectorOrShorthand}" elements`)
    const selector = this.shorthand(selectorOrShorthand)
    const elements = await this.browser.$$(selector)
    return this.assertElements(elements, `with selector "${selector}"`)
  }

  async elementWith (qualifier, value) {
    this.assertBrowser(`select element with ${qualifier} "${value}"`)
    const selector = this.selectorFor(qualifier, value)
    const el = await this.browser.$(selector)
    return this.assertElement(el, `with ${qualifier} "${value}" (${selector})`)
  }

  async elementsWith (qualifier, value) {
    this.assertBrowser(`select elements with ${qualifier} "${value}"`)
    const selector = this.selectorFor(qualifier, value)
    const elements = await this.browser.$$(selector)
    return this.assertElements(elements, `with ${qualifier} "${value}" (${selector})`)
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

  assertElement (element, reason) {
    if (!element) {
      throw new Error(`No element found ${reason}`)
    }
    return element
  }

  assertElements (elements, reason) {
    if (!elements) {
      throw new Error(`Expected an array of elements ${reason} but got ${elements}`)
    } else if (!elements.length) {
      throw new Error(`No elements found ${reason}`)
    }
    return elements
  }

  async assertDisplayed (elementOrElements, displayed = true) {
    if (Array.isArray(elementOrElements)) {
      const { length } = elementOrElements
      if (length === 0) {
        throw new Error('Expected a non-empty element array')
      }

      let count = 0
      for (const el of elementOrElements) {
        if (await el.isDisplayed()) {
          count++
        }
      }
      if (typeof displayed === 'number') {
        if (count <= displayed) {
          throw new Error(`Expected at least ${displayed} visible ${pluralize('element', displayed)} out of ${length}, but got ${count}`)
        }
      } else if (displayed) {
        if (count === 0) {
          throw new Error(`None of the ${length} ${pluralize('element', length)} are visible`)
        }
      } else {
        if (count > 0) {
          throw new Error(`Expected 0 visible elements out of ${length}, but got ${count}`)
        }
      }
    } else if (elementOrElements && typeof elementOrElements === 'object') {
      const visible = await elementOrElements.isDisplayed()
      if (visible !== displayed) {
        throw new Error(`Element is not ${displayed ? 'visible' : 'hidden'}`)
      }
    } else {
      throw new Error(`Expected one or more ${displayed ? 'visible' : 'hidden'} elements, but got ${typeof elementOrElements}`)
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

function pluralize (str, num, plural = `${str}s`) {
  return num === 1 ? str : plural
}
