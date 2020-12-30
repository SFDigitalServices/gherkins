Feature: Hello, world!
  Scenario: sf.gov test
    When I visit 'https://sf.gov'
    Then the element with selector 'h2' should contain text 'Services'
