const expect = require('expect')
const regexpFromString = require('regexp-from-string')
const { When, Then } = require('@cucumber/cucumber')

When('I visit {string}', { timeout: 30000 }, function (url) {
  return this.visit(url)
})

When('I resize the window to {int}', async function (width) {
  const current = await this.browser.getWindowSize()
  return this.browser.setWindowSize(width, current.height)
})

When('I resize the window to {int}x{int}', async function (width, height) {
  const current = await this.browser.getWindowSize()
  return this.browser.setWindowSize(width, height || current.height)
})

When('I click the element with {word} {string}', async function (qualifier, value) {
  const el = await this.elementWith(qualifier, value)
  await el.waitForClickable()
  return el.click()
})

When('I press {word}', function (key) {
  return this.browser.keys([key])
})

When('I type {string}', function (string) {
  return this.browser.keys(string.split(''))
})

When('I set the {string} field to {string}', async function (label, value) {
  const element = await this.elementWithLabel(label)
  return element.setValue(value)
})

When('I set the form values:', async function (data) {
  expect(data && data.hashes).toBeInstanceOf(Object)
  for (const { label, value } of data.hashes) {
    const element = await this.elementWithLabel(label)
    element.setValue(value)
  }
})

When('I click on the {string} button', async function (text) {
  const button = await this.elementWithText('button', text)
  button.waitForClickable()
  return button.click()
})

When('I wait for {float} second(s)', async function (seconds) {
  return sleep(seconds / 1000)
})

Then('the URL should be {string}', async function (url) {
  expect(await this.getUrl()).toBe(this.interpolate(url))
})

Then('the URL should contain {string}', async function (substr) {
  expect(await this.getUrl()).toEqual(expect.stringContaining(substr))
})

Then('the URL should match {string}', async function (string) {
  const pattern = regexpFromString(string)
  expect(await this.getUrl()).toEqual(expect.stringMatching(pattern))
})

Then('the URL should be {string} after {float} second(s)', async function (url, seconds) {
  await sleep(seconds / 1000)
  expect(await this.getUrl()).toBe(url)
})

Then('a link to {string} should be visible', async function (href) {
  const link = await this.element(`a[href="${href}"]`)
  return this.assertDisplayed(link)
})

Then('an element with {word} {string} should be visible', async function (qualifier, value) {
  const element = await this.elementWith(qualifier, value)
  return this.assertDisplayed(element)
})

Then('a {word} with text {string} should be visible', async function (selector, text) {
  const elements = await this.elements(selector)
  for (const el of elements) {
    const actual = await el.getText() || ''
    if (actual.trim() === text) {
      return this.assertDisplayed(el)
    }
  }
  throw new Error(`No ${selector} elements found with text: "${text}" (out of ${elements.length})`)
})

Then('an element with {word} {string} should have text {string}', async function (qualifier, value, text) {
  const element = await this.elementWith(qualifier, value)
  const actual = await element.getText()
  expect(actual).toBeInstanceOf(String)
  expect(actual.trim()).toBe(text)
})

Then('an element with {word} {string} should contain text {string}', async function (qualifier, value, text) {
  const element = await this.elementWith(qualifier, value)
  const actual = await element.getText()
  expect(actual).toContain(text)
})

Then('I save a screenshot to {string}', function (path) {
  return this.screenshot(path)
})

Then('I close the browser', function () {
  return this.close()
})

function sleep (ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}
