const expect = require('expect')
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

Then('the URL should be {string}', async function (url) {
  expect(this.browser.url).toBe(this.interpolate(url))
})

Then('the URL should be {string} after {float} seconds', async function (url, seconds) {
  await sleep(seconds / 1000)
  expect(await this.browser.getUrl()).toBe(url)
})

Then('the element with {word} {string} should be (visible|hidden)', async function (qualifier, value, state) {
  const element = await this.elementWith(qualifier, value)
  expect(element.isDisplayed()).toBe(state === 'visible')
})

Then('the element with {word} {string} should have text {string}', async function (qualifier, value, text) {
  const element = await this.elementWith(qualifier, value)
  const actual = await element.getText().trim()
  expect(actual).toBe(text)
})

Then('the element with {word} {string} should contain text {string}', async function (qualifier, value, text) {
  const element = await this.elementWith(qualifier, value)
  const actual = await element.getText()
  expect(actual).toContain(text)
})

When('I set the value of {string} to {string}', async function (label, value) {
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

When('I click on the {string} {word}', async function (text, selector) {
  const button = await this.elementWithText(selector, text)
  button.waitForClickable()
  return button.click()
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
