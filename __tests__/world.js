/* global jest, expect, describe, it, beforeAll, beforeEach, afterEach */
const mockedEnv = require('mocked-env')
const World = require('../src/world')
const { remote } = require('webdriverio')
const browsers = require('../src/browsers')

jest.mock('webdriverio')
remote.mockImplementation(() => mockRemote)

const mockRemote = mockObject({
  $: () => mockElement,
  $$: () => [mockElement],
  url: undefined,
  getUrl: () => undefined,
  saveScreenshot: undefined,
  deleteSession: undefined
})

const mockElement = mockObject({
  $: () => mockElement,
  $$: () => mockElement,
  isDisplayed: true,
  getText: undefined,
  getComputedLabel: undefined
})

const mockElements = mockObject({
  $: () => mockElement,
  $$: () => mockElement,
  isDisplayed: true,
  getText: undefined,
  getComputedLabel: undefined
})

let restoreEnv = () => null
const mockEnv = env => (restoreEnv = mockedEnv(env))

afterEach(async () => {
  restoreEnv()
  await World.closeAll()
  remote.mockClear()
  mockRemote.mockClear()
  mockElement.mockClear()
  mockElements.mockClear()
})

describe('World', () => {
  describe('constructor', () => {
    it('works without any arguments', () => {
      expect(() => new World()).not.toThrow()
    })

    it('assigns parameters to options', () => {
      const world = new World()
      expect(world.options).toBeInstanceOf(Object)
      expect(typeof world.options.browser).toBe('string')
    })
  })

  describe('browser sessions', () => {
    describe('open()', () => {
      it('creates a new browser instance', async () => {
        const world = new World()
        await world.open()
        expect(remote).toHaveBeenCalledTimes(1)
        expect(world.browser).toBe(mockRemote)
      })

      it('does not create a new session if one is already open', async () => {
        const world = new World()
        await world.open()
        await world.open()
        await world.open()
        expect(remote).toHaveBeenCalledTimes(1)
      })

      it('supports local browser configs', async () => {
        mockEnv({
          SELENIUM_SERVER: 'hub.example.com'
        })
        const world = new World({
          parameters: {
            browser: 'puppeteer'
          }
        })
        await world.open()
        expect(remote).toHaveBeenCalledWith(
          expect.objectContaining({
            capabilities: browsers.puppeteer
          })
        )
      })

      it('respects SELENIUM_SERVER for non-local browsers', async () => {
        mockEnv({
          SELENIUM_SERVER: 'hub.example.com',
          SELENIUM_USER: 'user',
          SELENIUM_KEY: 'key'
        })
        const world = new World({
          parameters: {
            browser: 'chrome'
          }
        })
        await world.open()
        expect(remote).toHaveBeenCalledWith(
          expect.objectContaining({
            capabilities: browsers.chrome,
            server: 'hub.example.com',
            user: 'user',
            key: 'key'
          })
        )
      })

      it('accepts an object for the "browser" parameter', async () => {
        mockEnv({
          SELENIUM_SERVER: undefined,
          SELENIUM_USER: undefined,
          SELENIUM_KEY: undefined
        })

        const world = new World({
          parameters: {
            browser: {
              browserName: 'lynx'
            }
          }
        })
        await world.open()

        expect(remote).toHaveBeenCalledWith({
          server: undefined,
          user: undefined,
          key: undefined,
          logLevel: 'trace',
          capabilities: {
            browserName: 'lynx'
          }
        })
      })

      describe('throws when misconfigured', () => {
        it('requires the "browser" parameter', async () => {
          await expect(() => {
            const world = new World({ parameters: { browser: '' } })
            return world.open()
          }).rejects.toThrow('The "browser" parameter is required.')
          expect(remote).toHaveBeenCalledTimes(0)
        })

        it('rejects invalid "browser" shorthands', async () => {
          await expect(() => {
            const world = new World({ parameters: { browser: 'invalid' } })
            return world.open()
          }).rejects.toThrow(/^No such browser shorthand: "invalid"/)
          expect(remote).toHaveBeenCalledTimes(0)
        })
      })
    })

    describe('close()', () => {
      it('deletes the session when closing', async () => {
        const world = new World()

        await world.open()
        expect(remote).toHaveBeenCalledTimes(1)
        expect(world.browser).not.toBe(undefined)

        await world.close()
        expect(world.browser).toBe(undefined)
        expect(mockRemote.deleteSession).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('variables', () => {
    it('inherits from process.env by default', () => {
      mockEnv({ DERP: 'herp' })
      const world = new World()
      expect(world.get('DERP')).toBe('herp')
    })

    it('gets variables from parameters.vars', () => {
      const world = new World({
        parameters: {
          vars: {
            herp: 'derp'
          }
        }
      })
      expect(world.get('herp')).toBe('derp')
    })

    it('can determine if a variable is set', () => {
      mockEnv({ DERP: 'herp' })
      const world = new World()
      expect(world.has('DERP')).toBe(true)
      expect(world.has('NERP')).toBe(false)
    })

    it('can set a variable', () => {
      mockEnv({ DERP: 'herp' })
      const world = new World()
      world.set('DERP', 'nope')
      expect(world.get('DERP')).toBe('nope')
    })

    it('can interpolate vars', () => {
      mockEnv({ WUT: 'lol' })
      const world = new World()
      expect(world.interpolate('what? $WUT!')).toEqual('what? lol!')
      expect(world.interpolate('$WUT $WUT')).toEqual('lol lol')
      // eslint-disable-next-line no-template-curly-in-string
      expect(world.interpolate('${WUT}wut')).toEqual('lolwut')
    })

    it('returns the fallback value if no key exists', () => {
      const world = new World()
      expect(world.get('herp', 'fallback')).toBe('fallback')
    })
  })

  describe('instances', () => {
    it('tracks instances', () => {
      for (let i = 0; i < 3; i++) {
        const world = new World()
        expect(world).toBeInstanceOf(World)
      }
      expect(World.instances).toHaveLength(3)
    })
  })

  describe('selectorFor()', () => {
    let world
    beforeAll(() => {
      world = new World({
        parameters: {
          shorthands: {
            button: '__button__'
          }
        }
      })
    })

    it('respects the "selector" qualifier', () => {
      expect(world.selectorFor('selector', 'h1')).toEqual('h1')
    })

    it('respects selector shorthands', () => {
      expect(world.selectorFor('selector', 'button')).toEqual('__button__')
    })

    it('respects the "text" qualifier', () => {
      expect(world.selectorFor('text', 'foo bar')).toEqual('=foo bar')
    })

    it('respects the "text containing" qualifier', () => {
      expect(world.selectorFor('text containing', 'foo')).toEqual('*=foo')
    })

    it('turns unrecognized qualifiers into attribute selectors', () => {
      expect(world.selectorFor('id', 'cool')).toEqual('[id="cool"]')
    })
  })

  describe('element functions', () => {
    let world
    beforeEach(() => {
      world = new World({
        parameters: {
          shorthands: {
            button: '__button__',
            input: '__input__'
          }
        }
      })
    })

    describe('shorthand()', () => {
      it('returns a valid shorthand', () => {
        expect(world.shorthand('button')).toBe('__button__')
      })

      it('returns the value with no matching shorthand', () => {
        expect(world.shorthand('derp')).toBe('derp')
      })
    })

    describe('element()', () => {
      it('throws without a browser', async () => {
        await expect(() => world.element('h1'))
          .toThrow('Unable to select "h1" element (no browser)')
      })

      it('calls browser.$()', async () => {
        await world.visit('https://example.com')
        const el = world.element('h1')
        expect(el).toBe(mockElement)
        expect(mockRemote.$).toHaveBeenCalledTimes(1)
        expect(mockRemote.$).toHaveBeenCalledWith('h1')
      })
    })

    describe('elements()', () => {
      it('throws without a browser', async () => {
        await expect(() => world.elements('div'))
          .toThrow('Unable to select "div" elements (no browser)')
      })

      it('calls browser.$$()', async () => {
        await world.visit('https://example.com')
        await world.elements('h1')
        expect(mockRemote.$$).toHaveBeenCalledTimes(1)
        expect(mockRemote.$$).toHaveBeenCalledWith('h1')
      })
    })

    describe('elementWith()', () => {
      it('throws without a browser', async () => {
        await expect(() => world.elementWith('id', 'foo'))
          .toThrow('Unable to select element with id "foo" (no browser)')
      })

      it('calls browser.$() with a selector', async () => {
        await world.visit('https://example.com')
        await world.elementWith('selector', 'h1')
        expect(mockRemote.$).toHaveBeenCalledWith('h1')
      })

      it('calls browser.$() with a shorthand selector', async () => {
        await world.visit('https://example.com')
        await world.elementWith('selector', 'button')
        expect(mockRemote.$).toHaveBeenCalledWith('__button__')
      })

      it('calls browser.$() with a text selector', async () => {
        await world.visit('https://example.com')
        await world.elementWith('text', 'hi')
        expect(mockRemote.$).toHaveBeenCalledWith('=hi')
      })

      it('calls browser.$() with a text containing selector', async () => {
        await world.visit('https://example.com')
        await world.elementWith('text containing', 'hi!')
        expect(mockRemote.$).toHaveBeenCalledWith('*=hi!')
      })
    })

    describe('elementsWith()', () => {
      it('throws without a browser', async () => {
        await expect(() => world.elementsWith('title', 'yo'))
          .toThrow('Unable to select elements with title "yo" (no browser)')
      })

      it('calls browser.$() with a selector', async () => {
        await world.visit('https://example.com')
        await world.elementsWith('selector', 'h1')
        expect(mockRemote.$$).toHaveBeenCalledWith('h1')
      })

      it('calls browser.$() with a shorthand selector', async () => {
        await world.visit('https://example.com')
        await world.elementsWith('selector', 'button')
        expect(mockRemote.$$).toHaveBeenCalledWith('__button__')
      })

      it('calls browser.$() with a text selector', async () => {
        await world.visit('https://example.com')
        await world.elementsWith('text', 'hi')
        expect(mockRemote.$$).toHaveBeenCalledWith('=hi')
      })

      it('calls browser.$() with a text containing selector', async () => {
        await world.visit('https://example.com')
        await world.elementsWith('text containing', 'hi!')
        expect(mockRemote.$$).toHaveBeenCalledWith('*=hi!')
      })
    })

    describe('elementWithLabel()', () => {
      it('throws if no element is found', async () => {
        await world.visit('https://example.com')
        await expect(() => world.elementWithLabel('label'))
          .rejects.toThrow('No element found with computed label: "label" and selector: "input"')
      })

      it('works', async () => {
        await world.visit('https://example.com')
        const first = {
          isDisplayed: jest.fn(() => false),
          getComputedLabel: jest.fn(() => 'label')
        }
        const second = {
          isDisplayed: jest.fn(() => true),
          getComputedLabel: jest.fn(() => 'label')
        }
        mockRemote.$$.mockImplementationOnce(() => [first, second])
        const el = await world.elementWithLabel('label')
        expect(mockRemote.$$).toHaveBeenCalledWith('__input__')
        expect(first.isDisplayed).toHaveBeenCalledTimes(1)
        expect(first.getComputedLabel).toHaveBeenCalledTimes(0)
        expect(second.isDisplayed).toHaveBeenCalledTimes(1)
        expect(second.getComputedLabel).toHaveBeenCalledTimes(1)
        expect(el).toBe(second)
      })
    })
  })

  describe('clear()', () => {
    it('throws without a browser', async () => {
      await expect(async () => {
        const world = new World()
        await world.clear()
      }).rejects.toThrow('Unable to clear (no browser)')
    })

    it('visits about:blank', async () => {
      const world = new World()
      await world.open()
      await world.clear()
      expect(remote).toHaveBeenCalledTimes(1)
      expect(mockRemote.url).toHaveBeenCalledWith('about:blank')
    })
  })

  describe('visit()', () => {
    it('opens a browser session automatically', async () => {
      const world = new World()
      await world.visit('https://sf.gov')
      expect(remote).toHaveBeenCalledTimes(1)
      expect(mockRemote.url).toHaveBeenCalledWith('https://sf.gov')
    })

    it('visits about:blank', async () => {
      const world = new World()
      await world.open()
      await world.clear()
      expect(remote).toHaveBeenCalledTimes(1)
      expect(mockRemote.url).toHaveBeenCalledWith('about:blank')
    })
  })

  describe('getUrl()', () => {
    it('throws without a browser', async () => {
      const world = new World()
      expect(() => world.getUrl()).toThrow(/get URL/)
      expect(remote).toHaveBeenCalledTimes(0)
    })

    it('gets the URL', async () => {
      mockRemote.getUrl.mockImplementationOnce(() => 'about:blink')
      const world = new World()
      await world.open()
      const url = await world.getUrl()
      expect(url).toBe('about:blink')
      expect(mockRemote.getUrl).toHaveBeenCalledTimes(1)
    })
  })

  describe('screenshot()', () => {
    it('throws without a browser', async () => {
      await expect(async () => {
        const world = new World()
        await world.screenshot('foo.png')
      }).rejects.toThrow('Unable to take screenshot (no browser)')
    })

    it('calls browser.saveScreenshot()', async () => {
      const world = new World()
      await world.open()
      await world.screenshot('foo.png')
      expect(remote).toHaveBeenCalledTimes(1)
      expect(mockRemote.saveScreenshot).toHaveBeenCalledWith('foo.png')
    })
  })
})

function mockFn (name, returns) {
  const fn = jest.fn()
    .mockName(name)
  if (typeof returns === 'function') {
    fn.mockImplementation(returns)
  } else if (returns !== undefined) {
    fn.mockReturnValue(returns)
  }
  return fn
}

function mockObject (methods) {
  const mock = {
    mockClear () {
      for (const method in methods) {
        mock[method].mockClear()
      }
    }
  }
  for (const method in methods) {
    mock[method] = mockFn(method, methods[method])
  }
  return mock
}
