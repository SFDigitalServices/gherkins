# Gherkins!

This repository contains [world] and [step definitions] that fire up a
[webdriverio] environment for browser tests written in [Gherkin] and executed
by [cucumber-js].

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
[cucumber-js]: https://github.com/cucumber/cucumber-js
