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

### Qualifiers
Most steps that target specific elements (content, buttons, form inputs, etc.)
are designed with some flexibility around how the elements are found in the DOM.
Specifically, this pattern:

```
... the element with {qualifier} {value}
```

Allows for clearly written steps that can target elements in a variety of ways:

* `with selector "selector here"` selects an element using any [webdriverio
  selector](https://webdriver.io/docs/selectors.html), which includes:

  - [CSS selectors]
  - Text matching:
    - `with selector "h1=Title"` matches an `h1` element with the exact text "Title"
    - `with selector "h2*=title"` matches an `h2` element containing the text "title"
  - And, if you're really hardcore, [XPath].

* `with text "text here"` matches the first element with the exact text content
* `with text containing "some text"` matches the first element containing the text
* Any other qualifier generates an attribute selector, for instance:

    - `with id "element-id"` selects `[id="element-id"]` (which is more robust
      than the `#` ID selector because it can contain spaces and other, less
      CSS-friendly characters).
    - `with role "button"` selects `[role="button"]`
    - `with aria-label "hello, world!"` selects `[aria-label="hello, world!"]`

### Shorthands
Most steps that target selectors also support _shorthands_ for CSS selectors
that match most of the relevant elements:

- **button** is shorthand for buttons and button-like elements: `button`,
  `summary`, `input[type=submit]`, and `[role=button]`.
- **link** is shorthand for legitimate links with an `href` attribute.
- **input** is shorthand for `input`, `textarea`, and `select` elements.
- **dropdown** is really just an alias for `select`, which can read oddly in
  English ("When I click on the select 'label'").

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

#### `When I click on the {text} {qualifier}`
See [qualifiers](#qualifiers) for more info.

```feature
When I click on the "Submit" button
When I click on the "Apply now" link
When I click on the "My name" input
```

#### `When I wait for {number} second(|s)`
Pauses for the number of seconds (an integer or floating point number, e.g. `1.5`),
which must not exceed the default timeout (10 seconds unless
`CUCUMBER_DEFAULT_TIMEOUT` is set to something else).

### Then (assertions)

#### `Then the URL should be {url}`

#### `Then the URL should be {url} after {seconds} seconds`
This variation on the above step explicitly waits for the given number of
seconds before asserting that the browser URL matches the one given.

#### `Then the element with {qualifier} should be (visible|hidden)`
See [qualifiers](#qualifiers) for more info.

#### `Then the element with {qualifier} should have text {text}`
This should match elements whose trimmed text content (with leading and
trailing whitespace removed) exactly equals the provided string. There is no
way to do fuzzy matching (yet).

See [qualifiers](#qualifiers) for more info.

#### `Then the element with {qualifier} should contain text {text}`
See [qualifiers](#qualifiers) for more info.

#### `Then I save a screenshot to {path}`
This is really only useful for local testing, since the screenshots aren't
saved anywhere (yet).

[world]: https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/world.md#readme
[step definitions]: https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/step_definitions.md#readme
[webdriverio]: https://webdriver.io/
[gherkin]: https://cucumber.io/docs/gherkin/reference/
[glob]: https://en.wikipedia.org/wiki/Glob_(programming)
[cucumber-js]: https://github.com/cucumber/cucumber-js
[cucumber-js CLI]: https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md#cli
[xpath]: https://developer.mozilla.org/en-US/docs/Web/XPath
[css selectors]: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors
