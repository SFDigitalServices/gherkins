const {
  BROWSER_NAME,
  BROWSER_VERSION,
  CHROME_ARGS,
  OS,
  OS_VERSION,
  BROWSER_LOCAL
} = process.env

module.exports = {
  chrome: remote('Chrome', 'latest', {
    os: 'Windows',
    osVersion: '10'
  }),
  edge: remote('Edge', 'latest', {
    os: 'Windows',
    osVersion: '10'
  }),
  firefox: remote('Firefox', 'latest', {
    os: 'Windows',
    osVersion: '10'
  }),
  ie9: remote('IE', '9.0', {
    os: 'Windows',
    osVersion: '7'
  }),
  ie10: remote('IE', '10.0', {
    os: 'Windows',
    osVersion: '7'
  }),
  ie11: remote('IE', '11', {
    os: 'Windows',
    osVersion: '10'
  }),
  safari: remote('Safari', '13.0', {
    os: 'OS X',
    osVersion: 'Catalina'
  }),
  puppeteer: {
    browserName: 'chrome',
    'goog:chromeOptions': {
      args: CHROME_ARGS
        ? CHROME_ARGS.split(' ')
        : ['--headless', '--no-sandbox']
    }
  }
}

function remote (browserName, version, { os, osVersion, ...options }) {
  return {
    browserName: BROWSER_NAME || browserName,
    browserVersion: BROWSER_VERSION || version,
    'bstack:options': Object.assign({
      debug: true,
      os: OS || os,
      osVersion: OS_VERSION || osVersion,
      local: BROWSER_LOCAL
    }, options)
  }
}
