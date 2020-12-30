# Gherkins
This repository contains [world] and [step definitions] that fire up a
[webdriverio] environment for browser tests written in [Gherkin] and executed
by [cucumber-js].

## Features
Feature files live in the [features](./features) directory and have the
`.feature` filename extension. Every file ending in `.feature` will be tested
unless you change the features option when [running tests manually](#manual-runs).

## Manual runs
By default, test runs happen only when you push commits to a branch with an
open pull request. You can run them manually from the
[Actions tab](https://github.com/SFDigitalServices/gherkins/actions?query=workflow%3AManual):

1. If no actions are listed, click "Manual" under "Workflows" in the left nav.

1. Click the "Run workflow" button in the blue area of the table on the right.

1. Customize the workflow inputs:
    * The "Feature files to test" input lists one or more feature files to test
      in this run. This can either be a single filename
      (`features/my-feature.feature`) or a [glob].

      The default, `features/**/*.feature` matches any file ending in
      `.feature` in the `features` directory, including any subdirectories. To
      run only features in a specific subdirectory, you would use
      `features/subdirectory/*.feature`.

    * The "Additional cucumber-js arguments" input allows you to pass
      additional arguments to [cucumber-js CLI].

1. After a brief delay, your active test run should be listed in the table on
   the right.


## Steps
[Cucumber][cucumber-js] handles matching of our step definitions using
placeholders in `{}` that match specific patterns. In this guide, the `{}`
placeholders are named rather than typed, so you'll see `When I visit {url}`
instead of `When I visit {string}`.

### Qualifiers and shorthands

### When (actions)

#### `When I visit {url}`

#### `When I resize the window to {width}`

#### `When I set the value of {label} to {value}`

#### `When I set the form values:`

```feature
When I set the form values:
  | label | value |
  | Name | First Last |
  | Age | 100 |
```

#### `When I click on the {text} (button|link|input)`

```feature
When I click on the "Submit" button
When I click on the "Apply now" link
When I click on the "My name" input
```

### Then (assertions)

#### `Then the URL should be {url}`

#### `Then the URL should be {url} after {seconds} seconds`
This variation on the above step explicitly waits for the given number of
seconds before asserting that the browser URL matches the one given.

#### `Then the element with {qualifier} should be (visible|hidden)`

#### `Then the element with {qualifier} should have text {text}`
This should match elements whose trimmed text content (with leading and
trailing whitespace removed) exactly equals the provided string. There is no
way to do fuzzy matching yet.

#### `Then the element with {qualifier} should contain text {text}`

#### `Then I save a screenshot to {path}`

#### `Then I close the browser`

[world]: https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/world.md#readme
[step definitions]: https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/step_definitions.md#readme
[webdriverio]: https://webdriver.io/
[gherkin]: https://cucumber.io/docs/gherkin/reference/
[glob]: https://en.wikipedia.org/wiki/Glob_(programming)
[cucumber-js]: https://github.com/cucumber/cucumber-js
[cucumber-js CLI]: https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md#cli
