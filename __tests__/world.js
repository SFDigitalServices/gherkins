/* global jest, expect, describe, it, afterEach */
const mockEnv = require('mocked-env')
const World = require('../src/world')
const { remote } = require('webdriverio')

jest.mock('webdriverio')

const mockRemote = {
  $: jest.fn().mockImplementation(selector => mockRemote),
  $$: jest.fn().mockImplementation(selector => mockRemote),
  url: jest.fn().mockImplementation(url => mockRemote),
  saveScreenshot: jest.fn().mockImplementation(path => mockRemote),
  deleteSession: jest.fn().mockImplementation(() => mockRemote)
}

remote.mockImplementation(options => {
  mockRemote.options = options
  return mockRemote
})

let restoreEnv = () => null
afterEach(() => restoreEnv())

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

  describe('vars', () => {
    it('sets up vars', () => {
      restoreEnv = mockEnv({ DERP: 'herp' })
      const world = new World()
      expect(world.vars.DERP).toBe('herp')
      expect(world.get('DERP')).toBe('herp')
    })

    it('can interpolate vars', () => {
      restoreEnv = mockEnv({ WUT: 'lol' })
      const world = new World()
      expect(world.interpolate('what? $WUT!')).toEqual('what? lol!')
      expect(world.interpolate('$WUT $WUT')).toEqual('lol lol')
      // eslint-disable-next-line no-template-curly-in-string
      expect(world.interpolate('${WUT}wut')).toEqual('lolwut')
    })
  })

  describe('selectorFor()', () => {
    const world = new World({
      parameters: {
        shorthands: {
          button: '__button__'
        }
      }
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

    it('turns unrecognized qualifiers into attribute selectors', () => {
      expect(world.selectorFor('id', 'cool')).toEqual('[id="cool"]')
    })
  })
})
